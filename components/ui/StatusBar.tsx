import React from 'react';
import { User, Coins, Gem } from 'lucide-react';

interface StatusBarProps {
  coins: number;
  gems: number;
  level: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ coins, gems, level }) => (
  <div className="flex justify-between items-center w-full px-4 py-2 bg-slate-900/80 backdrop-blur-sm fixed top-0 left-0 z-50 border-b-4 border-slate-700">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-blue-500 rounded-lg border-b-4 border-blue-700 flex items-center justify-center">
        <User className="text-white" size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-white font-bold text-xs leading-tight">LV.{level}</span>
        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 w-2/3"></div>
        </div>
      </div>
    </div>
    
    <div className="flex gap-4">
      <div className="flex items-center bg-slate-800 rounded-full px-3 py-1 border-2 border-slate-600">
        <Coins className="text-yellow-400 mr-2" size={18} />
        <span className="text-yellow-400 font-black">{coins}</span>
      </div>
      <div className="flex items-center bg-slate-800 rounded-full px-3 py-1 border-2 border-slate-600">
        <Gem className="text-pink-400 mr-2" size={18} />
        <span className="text-pink-400 font-black">{gems}</span>
      </div>
    </div>
  </div>
);

export default StatusBar;