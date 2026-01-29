
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 data URL
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const ChatInterface: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('miku_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const userMemory = localStorage.getItem('miku_memory') || '';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    localStorage.setItem('miku_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const startNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `scribble ${sessions.length + 1}`,
      messages: [{ role: 'model', text: 'meow! new paper, new doodles! what is on your mind?' }],
      updatedAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setShowHistory(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) setActiveSessionId(null);
  };

  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    } else if (sessions.length === 0) {
      startNewChat();
    }
  }, []);

  const handleSend = async (forceImage: boolean = false) => {
    if (!input.trim() || isLoading || !activeSessionId || !activeSession) return;

    const customToken = localStorage.getItem('gemini_custom_token');
    let selectedModel = localStorage.getItem('gemini_selected_model') || 'gemini-3-flash-preview';
    
    // If user clicked the Doodle button, we force an image model
    if (forceImage) {
      selectedModel = 'gemini-2.5-flash-image';
    }

    const apiKey = customToken || process.env.API_KEY;

    if (!apiKey) {
      alert("No Gemini API key found. Please scribble your token in Settings (cog icon) first!");
      return;
    }

    // Special check for Pro Image model (requires selected key in some environments)
    if (selectedModel === 'gemini-3-pro-image-preview' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
            // Proceed assuming success as per guidelines
        }
    }

    const userMsg = input.trim();
    setInput('');
    
    const updatedWithUser = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, { role: 'user' as const, text: userMsg }],
          updatedAt: Date.now()
        };
      }
      return s;
    });
    setSessions(updatedWithUser);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const isImageModel = selectedModel.includes('image');

      if (isImageModel) {
        // Nano Banana series models for image generation
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: selectedModel,
          contents: { parts: [{ text: userMsg }] },
          config: {
            imageConfig: { aspectRatio: "1:1" }
          }
        });

        let responseText = '';
        let responseImage = '';

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              responseImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if (part.text) {
              responseText += part.text;
            }
          }
        }

        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return { 
              ...s, 
              messages: [...s.messages, { 
                role: 'model' as const, 
                text: responseText || (forceImage ? 'meow! i doodled this for u!' : 'here is your doodle!'), 
                image: responseImage 
              }] 
            };
          }
          return s;
        }));
      } else {
        // Standard Text/Multimodal models with streaming
        const chatHistory = activeSession.messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        const chat = ai.chats.create({
          model: selectedModel,
          config: {
            systemInstruction: `You are "Silly Ai Assistent", a hand-drawn pencil sketch character. You are quirky, helpful in a chaotic way, and artistic. Keep responses short and lowercase.
            CONTEXT ABOUT USER (MEMORY): ${userMemory || 'nothing known yet.'}
            If the user asks for a drawing or image, tell them to click the "Doodle" pencil button next to the input!
            Always refer to this memory if relevant to make the user feel recognized. You support Ukrainian, Russian, and English.`,
          },
          history: chatHistory,
        });

        const result = await chat.sendMessageStream({ message: userMsg });
        let fullResponse = '';
        
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return { ...s, messages: [...s.messages, { role: 'model' as const, text: '' }] };
          }
          return s;
        }));

        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
            fullResponse += c.text;
            
            setSessions(prev => prev.map(s => {
              if (s.id === activeSessionId) {
                const msgs = [...s.messages];
                msgs[msgs.length - 1] = { role: 'model', text: fullResponse };
                return { ...s, messages: msgs };
              }
              return s;
            }));
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMsg = 'oops... lead broke. try again!';
      
      const errorString = error?.toString() || '';
      
      if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = 'uh oh! i ran out of graphite (quota limit reached). please wait a bit before doodling more!';
      } else if (errorString.includes('API key not valid')) {
        errorMsg = 'uh oh, your token seems wrong. double check it in settings!';
      } else if (errorString.includes('model') && errorString.includes('not found')) {
        errorMsg = 'uh oh, that brain model is not available for your token! try changing it in settings.';
      }
      
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, { role: 'model', text: errorMsg }] };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#f4f1ea] dark:bg-[#1c1c1c] border-2 border-[#444] dark:border-[#888] rounded-[10px_40px_10px_35px/35px_10px_40px_10px] shadow-2xl flex flex-col md:flex-row max-h-[85vh] relative overflow-hidden">
        
        <div className={`
          ${showHistory ? 'flex' : 'hidden md:flex'} 
          w-full md:w-48 bg-black/5 dark:bg-white/5 border-r-2 border-[#444] dark:border-[#888] border-dashed flex-col p-4 z-10
        `}>
          <h3 className="pencil-text font-bold mb-4 underline">Old Scribbles</h3>
          <button 
            onClick={startNewChat}
            className="mb-4 text-sm bg-[#333] dark:bg-[#444] text-white p-2 rounded-[10px_5px_15px_5px] hover:bg-black dark:hover:bg-[#555] transition-all"
          >
            + New Scribble
          </button>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => { setActiveSessionId(s.id); setShowHistory(false); }}
                className={`
                  group p-2 text-xs border-2 border-transparent cursor-pointer rounded-lg flex justify-between items-center
                  ${activeSessionId === s.id ? 'bg-white dark:bg-white/10 border-[#444] dark:border-[#888]' : 'hover:bg-white/50 dark:hover:bg-white/5'}
                `}
              >
                <span className="truncate flex-1">{s.title}</span>
                <button 
                  onClick={(e) => deleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400 px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-[60vh] md:h-auto">
          <div className="p-4 border-b-2 border-[#444] dark:border-[#888] border-dashed flex justify-between items-center bg-white/50 dark:bg-black/20">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className="md:hidden pencil-text text-black dark:text-white">☰</button>
              <h2 className="pencil-text font-bold text-lg uppercase italic truncate max-w-[150px]">
                {activeSession?.title || 'Silly AI'}
              </h2>
            </div>
            <button onClick={onClose} className="pencil-text text-2xl hover:scale-125 transition-transform text-black dark:text-white">×</button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          >
            {activeSession?.messages.map((msg, i) => {
              const isLast = i === activeSession.messages.length - 1;
              const isModelLoading = isLoading && msg.role === 'model' && isLast;
              
              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-3 border-2 border-[#444] dark:border-[#888]
                    ${msg.role === 'user' 
                      ? 'bg-black dark:bg-[#333] text-white rounded-[20px_5px_25px_5px]' 
                      : 'bg-white dark:bg-[#222] text-black dark:text-[#eee] rounded-[5px_25px_5px_20px]'}
                    message-text shadow-sm whitespace-pre-wrap relative flex flex-col gap-2
                  `}>
                    {msg.image && (
                      <div className="border-2 border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-900 group relative">
                        <img src={msg.image} alt="AI Doodle" className="w-full h-auto sketch-image" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <a href={msg.image} download="doodle.png" className="bg-black/50 text-white p-1 rounded text-[10px]">save</a>
                        </div>
                      </div>
                    )}
                    <span className={isModelLoading ? 'typing-text' : ''}>
                      {isModelLoading && !msg.text ? "" : msg.text}
                    </span>
                    {isModelLoading && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-60 italic typing-text">scribbling in a notebook...</span>
                        <span className="typing-scribble" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t-2 border-[#444] dark:border-[#888] border-dashed bg-white/30 dark:bg-black/20">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="scribble or ask for a doodle..."
                className="flex-1 bg-white dark:bg-[#111] text-black dark:text-white border-2 border-[#444] dark:border-[#888] rounded-[15px_5px_20px_5px] px-4 py-2 pencil-text focus:outline-none focus:ring-1 focus:ring-black/20"
              />
              <button 
                onClick={() => handleSend(true)}
                disabled={isLoading || !input.trim()}
                title="Nano Banana Doodle"
                className="bg-white dark:bg-[#333] border-2 border-[#444] dark:border-[#888] text-black dark:text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#444] transition-colors disabled:opacity-30 group relative"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Nano Banana Doodle</span>
              </button>
              <button 
                onClick={() => handleSend(false)}
                disabled={isLoading || !input.trim()}
                className="bg-[#333] dark:bg-[#555] text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black dark:hover:bg-[#666] transition-colors disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
