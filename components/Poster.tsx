
import React from 'react';

interface PosterProps {
  title: string;
  href: string;
  imageUrl: string;
  className?: string;
}

const Poster: React.FC<PosterProps> = ({ title, href, imageUrl, className = "" }) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`relative bg-white dark:bg-black/60 border-2 border-[#444] dark:border-[#888] p-2 flex flex-col items-center shadow-lg transition-transform hover:scale-105 active:scale-95 group ${className}`}
    >
      <div className="tape"></div>
      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-[#666] dark:border-[#444] mb-2">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover sketch-image grayscale group-hover:grayscale-0 transition-all duration-500" />
      </div>
      <span className="pencil-text text-sm font-bold uppercase tracking-tight">{title}</span>
    </a>
  );
};

export default Poster;
