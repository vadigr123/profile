
import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [memory, setMemory] = useState(() => localStorage.getItem('miku_memory') || '');

  const handleSelectKey = async () => {
    try {
      // @ts-ignore - window.aistudio is provided by the environment
      await window.aistudio.openSelectKey();
      onClose();
    } catch (err) {
      console.error("Failed to open key selection:", err);
    }
  };

  const saveMemory = (val: string) => {
    setMemory(val);
    localStorage.setItem('miku_memory', val);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-md bg-[#f4f1ea] dark:bg-[#1c1c1c] border-2 border-[#444] dark:border-[#888] rounded-[15px_5px_20px_5px] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
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
            <h3 className="pencil-text font-bold text-lg mb-2 text-black dark:text-white">Gemini Connection</h3>
            <p className="pencil-text text-sm mb-3 opacity-70 text-black dark:text-white">
              Configure your API key for the Silly AI Assistent.
            </p>
            <button 
              onClick={handleSelectKey}
              className="w-full pencil-text bg-[#333] dark:bg-[#444] text-white py-2 rounded-[5px_15px_5px_10px] hover:bg-black dark:hover:bg-[#555] transition-all active:scale-95"
            >
              Add/Update Gemini Token
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mt-2 text-center text-xs underline opacity-60 hover:opacity-100 text-black dark:text-white"
            >
              Billing Documentation
            </a>
          </div>

          {/* User Memory Scrapbook Section */}
          <div className="p-4 border-2 border-[#444] dark:border-[#888] border-dashed rounded-lg bg-white/50 dark:bg-black/20">
            <h3 className="pencil-text font-bold text-lg mb-2 text-black dark:text-white">My Scrapbook (Memory)</h3>
            <p className="pencil-text text-xs mb-3 italic opacity-70 text-black dark:text-white">
              The AI uses this to remember who you are across all chat sessions. Scribble your name or facts here!
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
