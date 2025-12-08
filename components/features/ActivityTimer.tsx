'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Bell,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ActivityTimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
}

export function ActivityTimer({
  defaultMinutes = 20,
  onComplete,
}: ActivityTimerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [seconds, setSeconds] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(defaultMinutes);
  const [playSound, setPlaySound] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const totalSeconds = minutes * 60 + seconds;
  const initialTotalSeconds = initialMinutes * 60;
  const progress = initialTotalSeconds > 0
    ? ((initialTotalSeconds - totalSeconds) / initialTotalSeconds) * 100
    : 0;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            handleComplete();
          } else {
            setMinutes((m) => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((s) => s - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, seconds]);

  const handleComplete = useCallback(() => {
    if (playSound) {
      // Play notification sound
      const audio = new Audio('/sounds/timer-complete.mp3');
      audio.play().catch(console.error);
    }

    if (showNotification && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('활동 시간 완료!', {
            body: '미술 활동 시간이 끝났습니다.',
            icon: '/icons/timer.png',
          });
        }
      });
    }

    onComplete?.();
  }, [playSound, showNotification, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(initialMinutes);
    setSeconds(0);
  };

  const adjustTime = (amount: number) => {
    const newMinutes = Math.max(1, Math.min(60, initialMinutes + amount));
    setInitialMinutes(newMinutes);
    if (!isRunning) {
      setMinutes(newMinutes);
      setSeconds(0);
    }
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-20 h-12 w-12 rounded-full shadow-lg z-50"
        onClick={() => setIsExpanded(true)}
      >
        <Timer className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-20 w-64 bg-card border rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">활동 타이머</span>
        </div>
        <div className="flex items-center gap-1">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>타이머 설정</DialogTitle>
                <DialogDescription>
                  타이머 알림 설정을 변경하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound">완료 시 알림음</Label>
                  <Switch
                    id="sound"
                    checked={playSound}
                    onCheckedChange={setPlaySound}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification">브라우저 알림</Label>
                  <Switch
                    id="notification"
                    checked={showNotification}
                    onCheckedChange={setShowNotification}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsSettingsOpen(false)}>확인</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="p-6">
        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
              className={cn(
                'transition-all duration-1000',
                progress > 80
                  ? 'text-red-500'
                  : progress > 50
                  ? 'text-yellow-500'
                  : 'text-primary'
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">
              {formatTime(minutes, seconds)}
            </span>
          </div>
        </div>

        {/* Time Adjustment */}
        {!isRunning && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTime(-5)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {initialMinutes}분
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustTime(5)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={toggleTimer}
          >
            {isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {[10, 20, 30, 45].map((preset) => (
            <Button
              key={preset}
              variant="ghost"
              size="sm"
              className={cn(
                'text-xs',
                initialMinutes === preset && 'bg-muted'
              )}
              onClick={() => {
                setInitialMinutes(preset);
                if (!isRunning) {
                  setMinutes(preset);
                  setSeconds(0);
                }
              }}
            >
              {preset}분
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
