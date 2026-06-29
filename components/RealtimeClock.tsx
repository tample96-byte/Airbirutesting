'use client';
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export function RealtimeClock() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' - ' + now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] font-black bg-[#151B26] border border-[#202C3F] py-2 px-4 rounded-xl shadow-md shrink-0">
      <Clock className="w-4 h-4 text-sky-400 shrink-0" />
      <span>{currentTime || 'Memuat waktu...'}</span>
    </div>
  );
}
