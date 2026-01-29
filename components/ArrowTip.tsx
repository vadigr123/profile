
import React from 'react';

interface ArrowTipProps {
  text: string;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const ArrowTip: React.FC<ArrowTipProps> = ({ text, className = "", direction = 'right' }) => {
  return (
    <div className={`flex items-center gap-2 animate-wobbly ${className}`}>
      <span className="pencil-text text-xs italic font-bold opacity-60 whitespace-nowrap">{text}</span>
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`
        ${direction === 'left' ? 'rotate-180' : 
        direction === 'up' ? '-rotate-90' : 
        direction === 'down' ? 'rotate-90' : ''}
        text-[#444] dark:text-[#888]
      `}>
        <path d="M2 10H35M35 10L28 3M35 10L28 17" />
      </svg>
    </div>
  );
};

export default ArrowTip;
