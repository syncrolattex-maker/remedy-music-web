import React, { useState, useEffect } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { Track } from '../App';

interface PlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const VinylSpool = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className={`w-12 h-12 rounded-full bg-black border-2 border-zinc-800 flex items-center justify-center relative flex-shrink-0 select-none ${isPlaying ? 'animate-spin-slow' : ''}`}>
    <div className="w-10 h-10 rounded-full border border-zinc-900 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border border-zinc-900 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-secondary"></div>
      </div>
    </div>
    <div className="absolute w-1.5 h-1.5 rounded-full bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
  </div>
);

const CassetteSpool = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="w-12 h-8 bg-zinc-900 border-2 border-zinc-700 rounded flex-shrink-0 flex items-center justify-around p-1 relative overflow-hidden select-none">
    <div className={`w-3 h-3 rounded-full border border-zinc-500 bg-black flex items-center justify-center relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
      <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
    </div>
    <div className={`w-3 h-3 rounded-full border border-zinc-500 bg-black flex items-center justify-center relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
      <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
    </div>
  </div>
);

export const Player = ({ currentTrack, isPlaying, onTogglePlay, onClose, audioRef }: PlayerProps) => {
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('0:00');
  const [durationTimeStr, setDurationTimeStr] = useState('0:00');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const formatTime = (time: number) => {
      if (isNaN(time) || !isFinite(time)) return '0:00';
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTimeStr(formatTime(audio.currentTime));
    };

    const handleDurationChange = () => {
      setDurationTimeStr(formatTime(audio.duration));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);

    // Initial sync
    handleTimeUpdate();
    handleDurationChange();

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [currentTrack, audioRef]);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audio.currentTime = percentage * audio.duration;
    setProgress(percentage * 100);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#FFDE00] text-black border-t-4 border-black z-40 p-4 md:px-8 flex flex-col gap-2 font-sans md:flex-row md:items-center md:justify-between shadow-[0_-8px_0_0_#000]">
      
      {/* LEFT SECTION: META & ANIMATION */}
      <div className="flex items-center gap-4 min-w-[240px]">
        {currentTrack.format === 'cassette' ? (
          <CassetteSpool isPlaying={isPlaying} />
        ) : (
          <VinylSpool isPlaying={isPlaying} />
        )}
        <div className="flex flex-col truncate">
          <span className="font-heading text-lg md:text-xl uppercase tracking-wider leading-none truncate">
            {currentTrack.title}
          </span>
          <div className="flex items-center gap-2 mt-1.5 truncate">
            <span className="font-mono text-[10px] text-zinc-800 uppercase tracking-widest leading-none truncate">
              {currentTrack.artist} // {currentTrack.format.toUpperCase()}
            </span>
            {currentTrack.bandcampUrl && (
              <a
                href={currentTrack.bandcampUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] font-bold bg-black text-[#00F0FF] hover:bg-zinc-800 hover:text-white px-1.5 py-0.5 border border-black rounded-xs transition-colors flex items-center shrink-0 select-none"
              >
                BANDCAMP ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* CENTER SECTION: CONTROLS & TIMELINE */}
      <div className="flex flex-grow items-center gap-4 justify-between mt-2 md:mt-0">
        
        {/* PLAY/PAUSE */}
        <button
          onClick={onTogglePlay}
          className="brutalist-border p-2 bg-black text-white hover:bg-zinc-800 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex-shrink-0"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>

        {/* TIMELINE PROGRESS */}
        <div className="flex items-center gap-2 flex-grow font-mono text-xs text-black">
          <span className="w-10 text-right">{currentTimeStr}</span>
          <div 
            onClick={handleProgressBarClick}
            className="flex-grow h-4 bg-black border-2 border-black relative cursor-pointer"
          >
            {/* Filled Progress */}
            <div 
              style={{ width: `${progress}%` }} 
              className="h-full bg-[#FF0055] transition-all duration-75"
            />
            {/* Visual grid lines for neo-brutalist tech look */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-full w-[1px] bg-white" />
              ))}
            </div>
          </div>
          <span className="w-10">{durationTimeStr}</span>
        </div>
      </div>

      {/* RIGHT SECTION: CLOSE CONTROL */}
      <div className="flex items-center justify-end gap-4 min-w-[80px] mt-2 md:mt-0 md:ml-4">
        <span className="font-mono text-xs bg-black text-white px-2 py-0.5 brutalist-border text-[9px] font-bold">
          ${currentTrack.price.toFixed(2)}
        </span>
        <button
          onClick={onClose}
          className="brutalist-border p-2 bg-black text-white hover:bg-secondary active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

    </div>
  );
};
