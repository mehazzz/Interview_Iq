// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const percentLeft = (timeLeft / initialSeconds) * 100;
  const isWarning = timeLeft <= 180 && timeLeft > 60;
  const isDanger  = timeLeft <= 60;

  return { timeLeft, minutes, seconds, formatted, percentLeft, isWarning, isDanger, isRunning, start, stop, reset };
}