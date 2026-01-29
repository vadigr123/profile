
import React from 'react';
import { CLOUD_ICON } from '../constants';

interface HeaderProps {
  onCloudClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCloudClick }) => {
  return (
    <div className="w-full flex justify-center pt-8 pb-12">
      <div className="w-full max-w-lg flex items-center justify-between border-2 border-[#333] dark:border-[#888] rounded-[100px_10px_120px_15px/15px_120px_15px_100px] px-8 py-2 bg-white dark:bg-black/40 shadow-[3px_4px_0px_rgba(0,0,0,0.2)]">
        <button 
          onClick={onCloudClick}
          className="flex items-center gap-2 opacity-70 hover:opacity-100 hover:scale-110 active:scale-95 transition-all focus:outline-none"
          title="Toggle Dark Mode"
        >
          {CLOUD_ICON}
        </button>
        <h1 className="pencil-text font-bold text-base tracking-widest uppercase text-black dark:text-white">
          Online Silly mikus
        </h1>
      </div>
    </div>
  );
};

export default Header;
