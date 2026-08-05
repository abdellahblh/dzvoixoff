import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomAudioPlayerProps {
  src: string;
  className?: string;
}

export default function CustomAudioPlayer({ src, className }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (Number(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4 bg-white/5 dark:bg-slate-800/50 p-3 sm:p-4 rounded-2xl backdrop-blur-md border border-white/10 dark:border-white/5 shadow-xl transition-colors", className)} dir="ltr">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <button
        onClick={togglePlayPause}
        className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-brand-teal text-brand-navy rounded-full flex items-center justify-center hover:bg-brand-teal-hover transition-all shadow-lg shadow-brand-teal/20 hover:scale-105 active:scale-95"
      >
        {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1" />}
      </button>

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex justify-between text-xs sm:text-sm text-slate-300 dark:text-slate-400 font-mono px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-2 sm:h-2.5 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden group cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-brand-teal pointer-events-none transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={toggleMute}
        className="shrink-0 text-slate-400 hover:text-white dark:hover:text-brand-teal transition-colors p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/5"
      >
        {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>
    </div>
  );
}
