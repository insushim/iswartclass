'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
}

const defaultTracks: Track[] = [
  {
    id: '1',
    title: '평화로운 아침',
    artist: 'ArtSheet BGM',
    url: '/audio/peaceful-morning.mp3',
    duration: 180,
  },
  {
    id: '2',
    title: '창의의 시간',
    artist: 'ArtSheet BGM',
    url: '/audio/creative-time.mp3',
    duration: 240,
  },
  {
    id: '3',
    title: '집중의 순간',
    artist: 'ArtSheet BGM',
    url: '/audio/focus-moment.mp3',
    duration: 200,
  },
  {
    id: '4',
    title: '즐거운 미술시간',
    artist: 'ArtSheet BGM',
    url: '/audio/happy-art.mp3',
    duration: 220,
  },
];

export function BGMPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = defaultTracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) =>
      prev === defaultTracks.length - 1 ? 0 : prev + 1
    );
    setProgress(0);
  };

  const playPrevious = () => {
    setCurrentTrackIndex((prev) =>
      prev === 0 ? defaultTracks.length - 1 : prev - 1
    );
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress || 0);
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
        onClick={() => setIsExpanded(true)}
      >
        <Music className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card border rounded-lg shadow-lg z-50">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">BGM 플레이어</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsExpanded(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Now Playing */}
      <div className="p-4">
        <div className="text-center mb-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
            <Music className="h-8 w-8 text-white" />
          </div>
          <h4 className="font-medium">{currentTrack.title}</h4>
          <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {formatTime((progress / 100) * currentTrack.duration)}
            </span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={playPrevious}>
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted || volume[0] === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={isMuted ? [0] : volume}
            onValueChange={setVolume}
            max={100}
            className="flex-1"
          />
        </div>
      </div>

      {/* Playlist */}
      <div className="border-t max-h-48 overflow-y-auto">
        {defaultTracks.map((track, index) => (
          <button
            key={track.id}
            onClick={() => {
              setCurrentTrackIndex(index);
              setProgress(0);
            }}
            className={cn(
              'w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left',
              index === currentTrackIndex && 'bg-primary/10'
            )}
          >
            <div
              className={cn(
                'h-8 w-8 rounded flex items-center justify-center shrink-0',
                index === currentTrackIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {index === currentTrackIndex && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{track.title}</p>
              <p className="text-xs text-muted-foreground">{track.artist}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTime(track.duration)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
