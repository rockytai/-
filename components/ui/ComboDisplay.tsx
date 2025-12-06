import React from 'react';
import { Zap } from 'lucide-react';

const ComboDisplay: React.FC<{ combo: number }> = ({ combo }) => {
  if (combo < 2) return null;
  return (
    <div className="absolute top-24 right-4 animate-bounce-slow z-40">
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-xl border-b-4 border-red-700 shadow-xl transform rotate-12 flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider">Combo</span>
        <div className="flex items-center gap-1">
           <Zap size={24} className="fill-yellow-300 text-yellow-300"/>
           <span className="text-3xl font-black italic">x{combo}</span>
        </div>
      </div>
    </div>
  );
};

export default ComboDisplay;