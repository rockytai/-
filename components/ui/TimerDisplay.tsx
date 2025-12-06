import React from 'react';
import { Clock } from 'lucide-react';

const TimerDisplay: React.FC<{ timeLeft: number }> = ({ timeLeft }) => (
  <div className={`
    flex items-center gap-2 px-3 py-1 rounded-full border-2 font-black text-lg transition-all
    ${timeLeft < 5 ? 'bg-red-500 border-red-700 text-white animate-pulse' : 'bg-white border-slate-300 text-slate-700'}
  `}>
    <Clock size={20} />
    <span>{timeLeft}s</span>
  </div>
);

export default TimerDisplay;