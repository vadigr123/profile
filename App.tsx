
import React, { useState, useEffect, useMemo } from 'react';
import { Page } from './types';
import Header from './components/Header';
import PostCard from './components/PostCard';
import LinkButton from './components/LinkButton';
import ArrowTip from './components/ArrowTip';
import Poster from './components/Poster';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import { LINK_CATEGORIES } from './constants';

const DISCORD_ID = '892429048771399680';
const DISCORD_INVITE = 'https://discord.gg/A9aaex4a';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<string>('loading...');
  const [imageKey, setImageKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const togglePage = () => {
    setCurrentPage(prev => prev === 'home' ? 'links' : 'home');
    if (currentPage === 'links') {
      setImageKey(prev => prev + 1);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Birthday logic
  const bdayStats = useMemo(() => {
    const today = new Date();
    const birthDate = new Date(2007, 5, 27); // June 27, 2007
    
    // Calculate Age
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Calculate Next Birthday
    let nextBdayYear = today.getFullYear();
    let nextBday = new Date(nextBdayYear, 5, 27);
    if (today > nextBday) {
      nextBdayYear++;
      nextBday = new Date(nextBdayYear, 5, 27);
    }

    // Rough calculation for months/days remaining
    let months = nextBday.getMonth() - today.getMonth();
    let days = nextBday.getDate() - today.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      months += 12;
    }

    return { age, months, days };
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await response.json();
        const status = data.data?.discord_status;

        switch (status) {
          case 'online':
            setDiscordStatus("that's weird, why am i online? huh?!");
            break;
          case 'idle':
            setDiscordStatus("i'm kinda online so just don't be shy, write me a dm");
            break;
          case 'dnd':
            setDiscordStatus("angry or just sad, idk, just don't write me");
            break;
          case 'offline':
          default:
            setDiscordStatus("i'm asleep Zzzz");
            break;
        }
      } catch (error) {
        console.error("Failed to fetch Discord status:", error);
        setDiscordStatus('status unavailable... maybe the pencil broke?');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const mikuPencilSketch = "https://images.unsplash.com/photo-1544273677-2415f5211883?q=80&w=1974&auto=format&fit=crop";

  return (
    <div className="paper-texture min-h-screen relative flex flex-col items-center p-4">
      
      {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

      {currentPage === 'home' && (
        <>
          <div className="hidden xl:block fixed left-10 top-1/4 w-40 z-20 animate-in fade-in zoom-in duration-500">
            <Poster 
              title="e621 tool" 
              href="https://vadigr123.github.io/e621/" 
              imageUrl="https://images.unsplash.com/photo-1580136608260-4eb11f4bc246?q=80&w=200"
              className="rotate-[-3deg]"
            />
            <div className="mt-4 flex justify-center">
               <ArrowTip text="my tool!" direction="up" className="opacity-40" />
            </div>
          </div>

          <div className="hidden xl:block fixed right-10 top-1/3 w-40 z-20 animate-in fade-in zoom-in duration-500">
            <Poster 
              title="GitHub" 
              href="https://github.com/vadigr123" 
              imageUrl="https://images.unsplash.com/photo-1618401471353-b98aadebc25a?q=80&w=200"
              className="rotate-[2deg]"
            />
            <div className="mt-4 flex justify-center">
               <ArrowTip text="follow me" direction="up" className="opacity-40" />
            </div>
          </div>
        </>
      )}

      <div className="w-full max-w-3xl flex flex-col items-center relative z-10">
        
        <Header onCloudClick={toggleTheme} />

        {currentPage === 'home' && (
          <div className="xl:hidden w-full flex flex-row justify-center gap-6 mb-8 px-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-32 md:w-40">
              <Poster 
                title="e621 tool" 
                href="https://vadigr123.github.io/e621/" 
                imageUrl="https://images.unsplash.com/photo-1580136608260-4eb11f4bc246?q=80&w=200"
                className="rotate-[-2deg] scale-90 md:scale-100"
              />
              <div className="mt-2 flex justify-center">
                 <ArrowTip text="my tool!" direction="up" className="opacity-40 scale-75" />
              </div>
            </div>
            <div className="w-32 md:w-40">
              <Poster 
                title="GitHub" 
                href="https://github.com/vadigr123" 
                imageUrl="https://images.unsplash.com/photo-1618401471353-b98aadebc25a?q=80&w=200"
                className="rotate-[3deg] scale-90 md:scale-100"
              />
              <div className="mt-2 flex justify-center">
                 <ArrowTip text="follow me" direction="up" className="opacity-40 scale-75" />
              </div>
            </div>
          </div>
        )}

        <main className="w-full min-h-[600px] flex flex-col relative">
          
          {currentPage === 'home' && (
            <ArrowTip 
              text="Press here for more stuff!" 
              direction="down" 
              className="absolute -top-12 right-0 md:right-20 hidden md:flex" 
            />
          )}

          {currentPage === 'home' ? (
            <div className="flex flex-col md:flex-row gap-8 items-start animate-in fade-in duration-700">
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="w-full aspect-square border-2 border-[#444] dark:border-[#888] rounded-[5px_30px_5px_40px/40px_5px_30px_5px] overflow-hidden bg-white dark:bg-black/40 relative mb-6 shadow-md transform -rotate-1">
                  <img 
                    key={imageKey}
                    src={mikuPencilSketch} 
                    alt="Pencil Sketch"
                    className="w-full h-full object-cover sketch-image contrast-125 pencil-draw-effect"
                  />
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#333] dark:border-[#888]"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#333] dark:border-[#888]"></div>
                </div>

                <div className="bg-white/30 dark:bg-black/20 border-2 border-[#555] dark:border-[#888] border-dashed rounded-[10px_5px_15px_5px] mb-8 relative">
                  <div className="px-4 py-2 border-b-2 border-[#555] dark:border-[#888] border-dashed bg-black/5 dark:bg-white/5">
                    <h2 className="pencil-text font-bold text-xl uppercase tracking-tighter">About me</h2>
                  </div>
                  <div className="p-4 text-xl lowercase text-[#222] dark:text-[#eee]">
                    <div className="text-xs opacity-50 mb-1 font-mono tracking-tighter">
                      [27.06.2007] - {bdayStats.age} | B-day: {bdayStats.months === 0 && bdayStats.days === 0 ? "Today! ✨" : `After ${bdayStats.months} months and ${bdayStats.days} days`}
                    </div>
                    <p className="mb-2">meow meow meow... ✨</p>
                    <p className="mb-4 leading-tight">
                      maybe im a bit silly, but i'm not stupid! &gt;///&lt; <br/>
                      if u have any questions or just wanna talk, feel free to use the chat or reach out on discord/telegram! i'm super obsessed with AI, so plz don't try to change my mind!!
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                   <div className="flex flex-wrap gap-2 items-center">
                      <LinkButton label="Check Links!" onClick={togglePage} className="w-fit" />
                      <LinkButton 
                        label="Open Chat" 
                        onClick={() => setIsChatOpen(true)} 
                        className="!bg-white dark:!bg-black/40 !text-black dark:!text-white border-2 border-[#333] dark:border-[#888] hover:!bg-gray-100 dark:hover:!bg-black/60" 
                      />
                      <button 
                        onClick={() => setIsSettingsOpen(true)}
                        title="Settings"
                        className="p-2 border-2 border-[#333] dark:border-[#888] rounded-full bg-white dark:bg-black/40 hover:bg-gray-100 dark:hover:bg-black/60 transition-all shadow-[1px_2px_0px_rgba(0,0,0,0.2)] active:scale-90"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                      </button>
                   </div>
                   
                   <div className="flex justify-start pl-6 md:pl-8">
                      <ArrowTip text="Click" direction="up" className="opacity-70 scale-75" />
                   </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col pt-4">
                <PostCard title="bark" content={["meow meow meow", "the pencil is sharp", "today feels like lead"]} />
                <PostCard title="advertisement" content={["this site is drawn with love", "check out my posters on the sides!"]} />
                <PostCard 
                  title="status" 
                  content={[
                    discordStatus,
                    <div className="mt-3 pt-2 border-t border-[#444] dark:border-[#888] border-dashed flex items-center gap-2">
                       <ArrowTip text="send request friend" direction="right" className="!gap-1 opacity-70 scale-75 origin-left" />
                       <a 
                         href={DISCORD_INVITE} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="w-8 h-8 flex items-center justify-center bg-[#222] dark:bg-[#444] text-[#eee] border-2 border-[#444] dark:border-[#888] rounded-[50%_40%_50%_40%/40%_50%_40%_50%] font-bold text-xl hover:scale-110 active:scale-95 transition-all shadow-[1px_2px_0px_rgba(0,0,0,0.3)]"
                         title="Add on Discord"
                       >
                         +
                       </a>
                    </div>
                  ]} 
                />
              </div>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-4">
                {LINK_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="flex flex-col gap-6 p-4 border-l-2 border-[#444] dark:border-[#888] border-dashed bg-white/10 dark:bg-black/10">
                    <h2 className="pencil-text font-bold text-2xl mb-2 underline decoration-wavy decoration-[#666]">{cat.title}</h2>
                    <div className="flex flex-col gap-4">
                      {cat.links.map((link, lIdx) => (
                        <LinkButton 
                          key={lIdx} 
                          label={link.label} 
                          href={link.url} 
                          className="w-full !text-base !px-4"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 flex justify-center">
                 <LinkButton label="Go Home" onClick={togglePage} className="!bg-[#eee] dark:!bg-[#333] !text-[#333] dark:!text-[#eee] border-2 border-[#333] dark:border-[#888]" />
              </div>
            </div>
          )}
        </main>

        <footer className="w-full text-center py-16 mt-16 border-t-2 border-[#444] dark:border-[#888] border-dashed">
          <p className="pencil-text text-xl font-bold text-[#444] dark:text-[#aaa] flex items-center justify-center gap-2">
            Sketch by: <span className="underline decoration-[#333] dark:decoration-[#888] underline-offset-4">@vadigr123</span>
          </p>
          <p className="pencil-text text-xs opacity-40 mt-2">pencil on grid paper, 2024</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
