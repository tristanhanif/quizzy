'use client';

import { useEffect, useState } from 'react';
import { formatTime } from '@/utils/formatters';

interface TimerProps {
  duration: number;
  onTimeUp?: () => void;
  isActive?: boolean;
}

export default function Timer({ duration, onTimeUp, isActive = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const getOpacity = () => {
    if (percentage > 50) return 'opacity-100';
    if (percentage > 25) return 'opacity-60';
    return 'opacity-30';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - timeLeft / duration)}`}
            className={`text-indigo-600 ${getOpacity()}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold text-gray-900 ${getOpacity()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}
