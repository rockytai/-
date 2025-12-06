import React from 'react';
import { Coins, Gem, LogOut } from 'lucide-react';
import { Player } from '../../types';
import { AudioController } from '../../services/audioService';

interface StatusBarProps {
  player: Player;
  onLogout: () => void;
  onShowLeaderboard: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ player, onLogout, onShowLeaderboard }) => {
  const level = Math.floor(player.coins / 200) + 1;
  const progress = (player.coins % 200) / 200 * 100;

  return (
    <div className="flex justify-between items-center w-full px-4 py-2 bg-slate-900/90 backdrop-blur-md fixed top-0 left-0 z-50 border-b-4 border-slate-700 shadow-lg">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => { AudioController.playClick(); onLogout(); }}
          className="group relative flex items-center gap-2 pr-2 rounded-xl hover:bg-slate-800 transition-colors"
          title="切换账号"
        >
           <div className="w-10 h-10 bg-indigo-500 rounded-lg border-b-4 border-indigo-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
             {player.avatar}
           </div>
           <div className="flex flex-col items-start">
             <span className="text-white font-black text-sm leading-tight max-w-[80px] truncate">{player.name}</span>
             <div className="flex items-center gap-1">
               <span className="text-indigo-300 font-bold text-[10px] bg-slate-800 px-1 rounded">LV.{level}</span>
             </div>
           </div>
           
           <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border-2 border-slate-900">
             <LogOut size={10} className="text-white" />
           </div>
        </button>

        <div className="hidden sm:block w-24 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex gap-2 sm:gap-4">
        <div className="flex items-center bg-slate-800 rounded-full px-2 sm:px-3 py-1 border-2 border-slate-600 shadow-inner">
          <Coins className="text-yellow-400 mr-1.5" size={16} />
          <span className="text-yellow-400 font-black text-sm sm:text-base">{player.coins}</span>
        </div>
        <div className="flex items-center bg-slate-800 rounded-full px-2 sm:px-3 py-1 border-2 border-slate-600 shadow-inner">
          <Gem className="text-pink-400 mr-1.5" size={16} />
          <span className="text-pink-400 font-black text-sm sm:text-base">{player.gems}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;