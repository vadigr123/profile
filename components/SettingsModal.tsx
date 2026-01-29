
import React, { useState } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

const MODELS = [
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Smartest)', desc: 'Best for general chatting and reasoning.' },
  { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Deep Thinking)', desc: 'Slower but more complex reasoning.' },
  { id: 'gemini-2.5-flash-latest', label: 'Gemini 2.5 Flash (Fast)', desc: 'Quick and reliable responses.' },
  { id: 'gemini-2.5-flash-lite-latest', label: 'Gemini 2.5 Flash Lite', desc: 'Lightweight and very snappy.' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [memory, setMemory] = useState(() => localStorage.getItem('miku_memory') || '');
  const [token, setToken] = useState(() => localStorage.getItem('gemini_custom_token') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('gemini_selected_model') || 'gemini-3-flash-preview');

  const saveMemory = (val: string) => {
    setMemory(val);
    localStorage.setItem('miku_memory', val);
  };

  const handleTokenChange = (val: string) => {
    setToken(val);
    localStorage.setItem('gemini_custom_token', val);
  };

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    localStorage.setItem('gemini_selected_model', val);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#f4f1ea] dark:bg-[#1c1c1c] border-2 border-[#444] dark:border-[#888] rounded-[15px_5px_20px_5px] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-4 pencil-text text-2xl hover:scale-110 text-black dark:text-white"
        >
          ×
        </button>
        
        <h2 className="pencil-text font-bold text-2xl mb-4 underline decoration-wavy text-black dark:text-white">Settings</h2>
        
        <div className="space-y-6">
          {/* Gemini Token Section */}
          <div className="p-4 border-2 border-[#444] dark:border-[#888] border-dashed rounded-lg bg-white/50 dark:bg-black/20">
            <h3 className="pencil-text font-bold text-lg mb-2 text-black dark:text-white">Write ur Token</h3>
            <p className="pencil-text text-xs mb-3 opacity-70 text-black dark:text-white">
              Scribble your Gemini API key here. It stays in your browser's pocket.
            </p>
            <div className="relative">
              <input 
                type="password"
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                placeholder="AIza..."
                className="w-full p-2 pencil-text text-sm bg-white dark:bg-[#111] text-black dark:text-white border-2 border-[#444] dark:border-[#888] rounded-[5px_15px_5px_10px] focus:outline-none focus:ring-1 focus:ring-black/20"
              />
            </div>
          </div>

          {/* Model Selection Section */}
          <div className="p-4 border-2 border-[#444] dark:border-[#888] border-dashed rounded-lg bg-white/50 dark:bg-black/20">
            <h3 className="pencil-text font-bold text-lg mb-2 text-black dark:text-white">Brain Model</h3>
            <p className="pencil-text text-xs mb-3 opacity-70 text-black dark:text-white">
              Which brain should the silly assistant use?
            </p>
            <select 
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full p-2 pencil-text text-sm bg-white dark:bg-[#111] text-black dark:text-white border-2 border-[#444] dark:border-[#888] rounded-[15px_5px_10px_5px] focus:outline-none"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <p className="pencil-text text-[10px] mt-2 opacity-50 italic text-black dark:text-white">
              {MODELS.find(m => m.id === selectedModel)?.desc}
            </p>
          </div>

          {/* User Memory Scrapbook Section */}
          <div className="p-4 border-2 border-[#444] dark:border-[#888] border-dashed rounded-lg bg-white/50 dark:bg-black/20">
            <h3 className="pencil-text font-bold text-lg mb-2 text-black dark:text-white">My Scrapbook (Memory)</h3>
            <p className="pencil-text text-xs mb-3 italic opacity-70 text-black dark:text-white">
              The AI uses this to remember who you are.
            </p>
            <textarea 
              value={memory}
              onChange={(e) => saveMemory(e.target.value)}
              placeholder="e.g., My name is Alex, I like blue pencils..."
              className="w-full h-32 p-3 pencil-text text-sm bg-white dark:bg-[#111] text-black dark:text-white border-2 border-[#444] dark:border-[#888] rounded-[10px_5px_20px_5px] focus:outline-none focus:ring-1 focus:ring-black/20 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
