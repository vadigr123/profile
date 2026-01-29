
import React from 'react';

interface LinkButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({ label, onClick, href, className = "" }) => {
  const baseStyles = "pencil-text bg-[#222] dark:bg-[#444] text-[#eee] rounded-[50px_10px_60px_15px/15px_60px_10px_50px] px-8 py-2 font-bold text-lg inline-block text-center hover:bg-[#444] dark:hover:bg-[#555] active:scale-95 transition-all shadow-[2px_4px_0px_rgba(0,0,0,0.3)]";
  
  if (href) {
    return (
      <a href={href} className={`${baseStyles} ${className}`}>
        {label}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${className}`}>
      {label}
    </button>
  );
};

export default LinkButton;
