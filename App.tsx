import React, { useState, useEffect } from 'react';
import { Trophy, Headphones, Edit3, PenTool, Ear, Check, Crown } from 'lucide-react';
import { AudioController } from './services/audioService';
import StatusBar from './components/ui/StatusBar';
import GameButton from './components/ui/GameButton';
import PlayerSelect from './components/ui/PlayerSelect';
import Leaderboard from './components/ui/Leaderboard';
import LevelOne from './components/levels/LevelOne';
import LevelTwo from './components/levels/LevelTwo';
import LevelThree from './components/levels/LevelThree';
import LevelFour from './components/levels/LevelFour';
import { UNITS } from './constants';
import { Unit, GameState, Player } from './types';

export default function App() {
  // Load players from localStorage
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('hanzi_players');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [gameState, setGameState] = useState<GameState>('PROFILE_SELECT'); 
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('hanzi_players', JSON.stringify(players));
  }, [players]);

  const activePlayer = players.find(p => p.id === activePlayerId);

  // --- Player Management ---

  const createPlayer = (name: string, avatar: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      avatar,
      coins: 0,
      gems: 0,
      completed: {},
      unitScores: {},
      createdAt: Date.now()
    };
    setPlayers(prev => [...prev, newPlayer]);
    setActivePlayerId(newPlayer.id);
    setGameState('LOBBY');
    AudioController.playCorrect();
  };

  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    if (activePlayerId === id) {
      setActivePlayerId(null);
      setGameState('PROFILE_SELECT');
    }
    AudioController.playWrong();
  };

  const selectPlayer = (id: string) => {
    setActivePlayerId(id);
    setGameState('LOBBY');
    AudioController.playClick();
  };

  const updateActivePlayer = (updater: (p: Player) => Player) => {
    if (!activePlayerId) return;
    setPlayers(prev => prev.map(p => p.id === activePlayerId ? updater(p) : p));
  };

  // --- Game Logic ---

  const addCoins = (amount: number, combo: number = 0) => {
    AudioController.playCoin(combo);
    updateActivePlayer(p => ({ ...p, coins: p.coins + amount }));
  };

  const handleUnitSelect = (unit: Unit) => {
    setActiveUnit(unit);
    setGameState('LEVEL_SELECT');
  };

  const handleLevelComplete = (type: 'l1' | 'l2' | 'l3' | 'l4', score: number) => { 
    if (!activeUnit || !activePlayerId) return;

    updateActivePlayer(p => {
      const newCompleted = { ...p.completed };
      if (!newCompleted[activeUnit.id]) newCompleted[activeUnit.id] = {};
      
      // First time bonus check
      const isFirstTime = !newCompleted[activeUnit.id][type];
      newCompleted[activeUnit.id][type] = true;
      
      let newGems = p.gems;
      if (isFirstTime) newGems += 1;

      // High score check
      const currentScores = p.unitScores[activeUnit.id] || { l1: 0, l2: 0, l3: 0, l4: 0 };
      const newScores = { ...p.unitScores };
      
      if (score > currentScores[type]) {
          newScores[activeUnit.id] = { ...currentScores, [type]: score };
      }

      return {
          ...p,
          completed: newCompleted,
          gems: newGems,
          unitScores: newScores
      };
    });

    setGameState('LEVEL_SELECT');
  };

  // --- Renderers ---

  const renderLobby = () => {
    if (!activePlayer) return null;

    return (
      <div className="h-full overflow-y-auto pt-24 px-4 pb-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-indigo-600 custom-scrollbar relative">
         <style>{`
           .custom-scrollbar::-webkit-scrollbar { width: 12px; }
           .custom-scrollbar::-webkit-scrollbar-track { background: #312e81; border-radius: 8px; }
           .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 6px; border: 3px solid #312e81; }
           .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #818cf8; }
         `}</style>
  
         <div className="text-center mb-8 relative">
           <h1 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-wider">
             汉字小英雄
           </h1>
           <div className="text-indigo-200 mt-2 font-bold">欢迎回来，{activePlayer.name}！</div>

           <button 
             onClick={() => { AudioController.playClick(); setShowLeaderboard(true); }}
             className="absolute right-0 top-0 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-4 py-2 rounded-xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 font-black flex items-center gap-2 shadow-lg transition-all"
           >
             <Trophy size={20} />
             <span className="hidden sm:inline">排行榜</span>
           </button>
         </div>
  
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
           {UNITS.map(unit => {
             const status = activePlayer.completed[unit.id] || {};
             const l1 = status.l1 ? 1 : 0;
             const l2 = status.l2 ? 1 : 0;
             const l3 = status.l3 ? 1 : 0;
             const l4 = status.l4 ? 1 : 0;
             const progress = Math.floor(((l1 + l2 + l3 + l4) / 4) * 100);
             
             const scores = activePlayer.unitScores[unit.id] || { l1: 0, l2: 0, l3: 0, l4: 0 };
             const totalScore = scores.l1 + scores.l2 + scores.l3 + scores.l4;
             const isMastered = progress === 100;
  
             return (
               <div key={unit.id} className="transform transition hover:-translate-y-2">
                 <GameButton 
                   color={isMastered ? "green" : "blue"} 
                   size="xl" 
                   className="w-full flex-col items-start p-4 h-auto min-h-[140px] relative overflow-hidden"
                   onClick={() => handleUnitSelect(unit)}
                 >
                   {isMastered && <Crown className="absolute -right-4 -top-4 text-yellow-300 w-24 h-24 opacity-20 rotate-12" />}
                   
                   <div className="flex justify-between w-full mb-2 relative z-10">
                      <span className="bg-black/20 px-2 py-1 rounded text-sm text-white/90 font-bold backdrop-blur-sm">第{unit.id}单元</span>
                      {totalScore > 0 && 
                         <div className="flex items-center text-yellow-300 bg-black/40 rounded-full px-2 py-0.5 text-xs font-bold gap-1 animate-pulse backdrop-blur-sm">
                            <Trophy size={12} className="fill-current"/>
                            {totalScore}
                         </div>
                      }
                   </div>
                   <div className="text-xl font-bold text-white text-left leading-tight mb-2 relative z-10 drop-shadow-md">{unit.title}</div>
                   <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden mt-auto border border-white/10">
                     <div 
                       className={`h-full transition-all duration-500 ${isMastered ? 'bg-yellow-400' : 'bg-cyan-400'}`}
                       style={{ width: `${progress}%` }}
                     />
                   </div>
                   <div className="text-xs text-white/80 mt-1 w-full flex justify-between font-bold">
                      <span>{progress}% 完成</span>
                   </div>
                 </GameButton>
               </div>
             );
           })}
         </div>
      </div>
    );
  };

  const renderLevelSelect = () => {
    if (!activeUnit || !activePlayer) return null;
    const scores = activePlayer.unitScores[activeUnit.id] || { l1: 0, l2: 0, l3: 0, l4: 0 };
    const status = activePlayer.completed[activeUnit.id] || {};
    
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md border-4 border-slate-200 shadow-2xl relative">
          <button 
            onClick={() => { AudioController.playClick(); setGameState('LOBBY'); }}
            className="absolute -top-4 -right-4 bg-red-500 text-white w-10 h-10 rounded-full font-bold border-b-4 border-red-700 active:border-b-0 active:translate-y-1 flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors"
          >
            X
          </button>

          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">{activeUnit.title}</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6 px-2">
            {activeUnit.content.map(c => (
                <span key={c} className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-lg font-bold text-slate-600 border border-slate-200">{c}</span>
            ))}
          </div>

          <div className="space-y-4">
            <GameButton color="yellow" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L1')}>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600/20 p-2 rounded-lg"><Headphones className="text-yellow-700" /></div>
                <div className="text-left">
                  <div className="text-lg text-yellow-900">听音辨字</div>
                  <div className="text-xs font-bold text-yellow-700/60">最高分: {scores.l1}</div>
                </div>
              </div>
              {status.l1 && <Check size={28} className="text-yellow-600 bg-yellow-200/50 rounded-full p-0.5"/>}
            </GameButton>

            <GameButton color="blue" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L2')}>
              <div className="flex items-center gap-3">
                <div className="bg-blue-800/20 p-2 rounded-lg"><Edit3 className="text-blue-700"/></div>
                <div className="text-left">
                  <div className="text-lg text-blue-900">笔顺教学</div>
                  <div className="text-xs font-bold text-blue-700/60">最高分: {scores.l2}</div>
                </div>
              </div>
               {status.l2 && <Check size={28} className="text-blue-600 bg-blue-200/50 rounded-full p-0.5"/>}
            </GameButton>

            <GameButton color="pink" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L3')}>
              <div className="flex items-center gap-3">
                <div className="bg-pink-800/20 p-2 rounded-lg"><PenTool className="text-pink-700"/></div>
                <div className="text-left">
                  <div className="text-lg text-pink-900">盲写挑战</div>
                  <div className="text-xs font-bold text-pink-700/60">最高分: {scores.l3}</div>
                </div>
              </div>
               {status.l3 && <Check size={28} className="text-pink-600 bg-pink-200/50 rounded-full p-0.5"/>}
            </GameButton>

            <GameButton color="cyan" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L4')}>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-800/20 p-2 rounded-lg"><Ear className="text-cyan-700"/></div>
                <div className="text-left">
                  <div className="text-lg text-cyan-900">听音写字</div>
                  <div className="text-xs font-bold text-cyan-700/60">最高分: {scores.l4}</div>
                </div>
              </div>
               {status.l4 && <Check size={28} className="text-cyan-600 bg-cyan-200/50 rounded-full p-0.5"/>}
            </GameButton>
          </div>
        </div>
      </div>
    );
  };

  // Main Render

  if (gameState === 'PROFILE_SELECT') {
    return (
      <PlayerSelect 
        players={players} 
        onSelect={selectPlayer} 
        onCreate={createPlayer}
        onDelete={deletePlayer}
      />
    );
  }

  // If we are in game loop but no active player (should theoretically not happen if state machine is correct), fallback
  if (!activePlayer) return null;

  return (
    <div className="font-sans select-none overflow-hidden h-screen bg-slate-900 text-slate-900">
      <StatusBar 
        player={activePlayer} 
        onLogout={() => { setActivePlayerId(null); setGameState('PROFILE_SELECT'); }}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      />
      
      {showLeaderboard && (
        <Leaderboard 
          players={players} 
          onClose={() => setShowLeaderboard(false)} 
          activePlayerId={activePlayerId}
        />
      )}
      
      {gameState === 'LOBBY' && renderLobby()}
      {gameState === 'LEVEL_SELECT' && renderLevelSelect()}
      
      {gameState === 'PLAY_L1' && activeUnit && (
        <LevelOne 
          unit={activeUnit} 
          onBack={() => setGameState('LEVEL_SELECT')} 
          onComplete={(score) => handleLevelComplete('l1', score)}
          addCoins={addCoins}
        />
      )}
      
      {gameState === 'PLAY_L2' && activeUnit && (
        <LevelTwo 
          unit={activeUnit} 
          onBack={() => setGameState('LEVEL_SELECT')} 
          onComplete={(score) => handleLevelComplete('l2', score)}
          addCoins={addCoins}
        />
      )}

      {gameState === 'PLAY_L3' && activeUnit && (
        <LevelThree 
          unit={activeUnit} 
          onBack={() => setGameState('LEVEL_SELECT')} 
          onComplete={(score) => handleLevelComplete('l3', score)}
          addCoins={addCoins}
        />
      )}

      {gameState === 'PLAY_L4' && activeUnit && (
        <LevelFour 
          unit={activeUnit} 
          onBack={() => setGameState('LEVEL_SELECT')} 
          onComplete={(score) => handleLevelComplete('l4', score)}
          addCoins={addCoins}
        />
      )}
    </div>
  );
}