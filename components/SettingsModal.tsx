
import React, { useState } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [memory, setMemory] = useState(() => localStorage.getItem('miku_memory') || '');
  const [token, setToken] = useState(() => localStorage.getItem('gemini_custom_token') || '');

  const saveMemory = (val: string) => {
    setMemory(val);
    localStorage.setItem('miku_memory', val);
  };

  const handleTokenChange = (val: string) => {
    setToken(val);
    localStorage.setItem('gemini_custom_token', val);
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
              Scribble your Gemini API key here. It stays in your browser's pocket (localStorage).
            </p>
            <div className="relative">
              <input 
                type="password"
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                placeholder="AIza..."
                className="w-full p-2 pencil-text text-sm bg-white dark:bg-[#111] text-black dark:text-white border-2 border-[#444] dark:border-[#888] rounded-[5px_15px_5px_10px] focus:outline-none focus:ring-1 focus:ring-black/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3y-3.5L15.5 7.5z"/></svg>
              </div>
            </div>
            <p className="pencil-text text-[10px] mt-2 opacity-50 text-black dark:text-white">
              * your token is masked and will be saved after page refresh!
            </p>
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
