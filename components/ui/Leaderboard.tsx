import React from 'react';
import { Trophy, X, Star, Medal } from 'lucide-react';
import { Player } from '../../types';

interface LeaderboardProps {
  players: Player[];
  onClose: () => void;
  activePlayerId: string | null;
}

export default function Leaderboard({ players, onClose, activePlayerId }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by Gems first, then Coins
    if (b.gems !== a.gems) return b.gems - a.gems;
    return b.coins - a.coins;
  });

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-yellow-400 relative flex flex-col max-h-[80vh]">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 flex justify-center items-center relative shrink-0 shadow-md">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
            <Trophy className="fill-yellow-100 text-yellow-600" />
            排行榜
          </h2>
          <button 
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-black/40 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
           <style>{`
             .custom-scrollbar::-webkit-scrollbar { width: 8px; }
             .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
             .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
           `}</style>
          
          {sortedPlayers.map((player, index) => {
             let rankStyle = 'bg-slate-50 border-slate-200';
             let rankBadge = <span className="font-black text-slate-400 w-8 text-center">{index + 1}</span>;
             
             if (index === 0) {
               rankStyle = 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200';
               rankBadge = <div className="w-8 flex justify-center"><Medal className="text-yellow-500 fill-yellow-200" size={28} /></div>;
             } else if (index === 1) {
               rankStyle = 'bg-slate-100 border-slate-300';
               rankBadge = <div className="w-8 flex justify-center"><Medal className="text-slate-400 fill-slate-200" size={24} /></div>;
             } else if (index === 2) {
               rankStyle = 'bg-orange-50 border-orange-200';
               rankBadge = <div className="w-8 flex justify-center"><Medal className="text-orange-500 fill-orange-200" size={24} /></div>;
             }

             const isActive = player.id === activePlayerId;

             return (
               <div key={player.id} className={`flex items-center gap-3 p-3 rounded-2xl mb-3 border-b-4 transition-transform ${rankStyle} ${isActive ? 'scale-[1.02] shadow-md border-l-8 border-l-blue-500' : ''}`}>
                 {rankBadge}
                 <div className="text-3xl filter drop-shadow-sm">{player.avatar}</div>
                 <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-700 truncate text-lg leading-tight">
                        {player.name}
                        {isActive && <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded align-middle">我</span>}
                    </div>
                    <div className="text-xs text-slate-400 font-bold">LV.{Math.floor(player.coins / 200) + 1}</div>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-pink-500 font-black bg-white px-2 py-0.5 rounded-full shadow-sm border border-pink-100">
                       <Star size={14} className="fill-current"/>
                       {player.gems}
                    </div>
                    <div className="text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-0.5 rounded-full">
                       {player.coins} 金币
                    </div>
                 </div>
               </div>
             );
          })}
          
          {sortedPlayers.length === 0 && (
            <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Trophy className="text-slate-300" size={32}/>
                </div>
                <span className="font-bold">还没有玩家记录哦</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}