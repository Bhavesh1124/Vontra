'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Flower2, Sprout, Trees, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PomodoroTimer() {
  const { 
    pomodoroSessionsCompleted, 
    setPomodoroSessionsCompleted,
    focusDuration,
    setFocusDuration,
    breakDuration,
    setBreakDuration
  } = useAppContext();

  const FOCUS_DURATION_SECONDS = useMemo(() => focusDuration * 60, [focusDuration]);
  const BREAK_DURATION_SECONDS = useMemo(() => breakDuration * 60, [breakDuration]);

  const [time, setTime] = useState(FOCUS_DURATION_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isFocus, setIsFocus] = useState(true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempFocusDuration, setTempFocusDuration] = useState(focusDuration);
  const [tempBreakDuration, setTempBreakDuration] = useState(breakDuration);

  useEffect(() => {
    if (!isActive) {
      setTime(isFocus ? FOCUS_DURATION_SECONDS : BREAK_DURATION_SECONDS);
    }
  }, [focusDuration, breakDuration, isFocus, isActive, FOCUS_DURATION_SECONDS, BREAK_DURATION_SECONDS]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      if (isFocus) {
        setPomodoroSessionsCompleted((s) => s + 1);
        setIsFocus(false);
        setTime(BREAK_DURATION_SECONDS);
      } else {
        setIsFocus(true);
        setTime(FOCUS_DURATION_SECONDS);
      }
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, isFocus, setPomodoroSessionsCompleted, FOCUS_DURATION_SECONDS, BREAK_DURATION_SECONDS]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsFocus(true);
    setTime(FOCUS_DURATION_SECONDS);
  }, [FOCUS_DURATION_SECONDS]);

  const progress = useMemo(() => {
    const duration = isFocus ? FOCUS_DURATION_SECONDS : BREAK_DURATION_SECONDS;
    if (duration === 0) return 0;
    return ((duration - time) / duration) * 100;
  }, [time, isFocus, FOCUS_DURATION_SECONDS, BREAK_DURATION_SECONDS]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSaveSettings = () => {
    setFocusDuration(tempFocusDuration > 0 ? tempFocusDuration : 1);
    setBreakDuration(tempBreakDuration > 0 ? tempBreakDuration : 1);
    setIsSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    setTempFocusDuration(focusDuration);
    setTempBreakDuration(breakDuration);
    setIsSettingsOpen(true);
  };

  const ForestIcon = useMemo(() => {
    if (!isFocus) return <Flower2 className="h-20 w-20 text-secondary" />;
    if (progress < 33) return <Sprout className="h-20 w-20 text-accent" />;
    if (progress < 66) return <Flower2 className="h-20 w-20 text-primary" />;
    return <Trees className="h-20 w-20 text-green-500" />;
  }, [progress, isFocus]);

  return (
    <>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative h-64 w-64">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            <circle
              className="text-muted/20"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className="text-primary transition-all duration-1000 ease-linear"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-2">{ForestIcon}</div>
            <p className="text-4xl font-bold font-mono tabular-nums">{formatTime(time)}</p>
            <p className="text-sm text-muted-foreground">{isFocus ? 'Focus' : 'Break'}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold">Sessions completed: {pomodoroSessionsCompleted}</p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={toggleTimer} size="lg" className="w-32 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100">
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg" className="transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100">
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
          <Button onClick={handleOpenSettings} variant="ghost" size="lg" className="px-4 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100">
             <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogDescription>
              Adjust your focus and break durations in minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="focus-duration" className="text-right">
                Focus
              </Label>
              <Input
                id="focus-duration"
                type="number"
                min="1"
                value={tempFocusDuration}
                onChange={(e) => setTempFocusDuration(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="break-duration" className="text-right">
                Break
              </Label>
              <Input
                id="break-duration"
                type="number"
                min="1"
                value={tempBreakDuration}
                onChange={(e) => setTempBreakDuration(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveSettings}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
