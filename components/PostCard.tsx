
import React from 'react';

interface PostCardProps {
  title: string;
  content: (string | React.ReactNode)[];
}

const PostCard: React.FC<PostCardProps> = ({ title, content }) => {
  return (
    <div className="mb-6 bg-white/60 dark:bg-black/40 border-2 border-[#444] dark:border-[#888] rounded-[5px_20px_5px_25px/25px_5px_20px_5px] p-1 transition-transform hover:-rotate-1">
      <div className="px-4 py-2 border-b-2 border-[#555] dark:border-[#888] border-dashed">
        <h2 className="pencil-text font-bold text-xl lowercase opacity-90">{title}</h2>
      </div>
      <div className="p-4 text-lg leading-relaxed lowercase text-[#333] dark:text-[#eee]">
        {content.map((item, i) => (
          <div key={i} className="mb-1">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCard;
