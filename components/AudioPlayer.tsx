"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Volume2, Download } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title?: string;
  showDownload?: boolean;
  onDownload?: () => void;
  className?: string;
}

export default function AudioPlayer({ 
  src, 
  title, 
  showDownload = true,
  onDownload,
  className = ""
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Event listeners
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", () => setIsLoading(false));

    // Set initial volume
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", () => setIsLoading(false));
    };
  }, [src, volume]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`w-full space-y-4 p-4 border rounded-lg bg-card ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {title && (
        <div className="text-sm font-medium truncate">{title}</div>
      )}

      {/* Progress Bar / Scrubber */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 100}
          step={0.1}
          className="w-full"
          disabled={!duration || isLoading}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={handlePlayPause}
          disabled={isLoading}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Stop Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={handleStop}
          disabled={isLoading}
        >
          <Square className="h-4 w-4" />
        </Button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="h-4 w-4" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-24"
          />
          <span className="text-xs w-8">{volume}%</span>
        </div>

        {/* Download Button */}
        {showDownload && onDownload && (
          <Button
            size="icon"
            variant="outline"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-xs text-muted-foreground">Loading audio...</div>
      )}
    </div>
  );
}