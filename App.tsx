import React, { useState } from 'react';
import { Trophy, Headphones, Edit3, PenTool, Ear, Check } from 'lucide-react';
import { AudioController } from './services/audioService';
import StatusBar from './components/ui/StatusBar';
import GameButton from './components/ui/GameButton';
import LevelOne from './components/levels/LevelOne';
import LevelTwo from './components/levels/LevelTwo';
import LevelThree from './components/levels/LevelThree';
import LevelFour from './components/levels/LevelFour';
import { UNITS } from './constants';
import { Unit, GameState, UnitScores, CompletedStatus } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY'); 
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [coins, setCoins] = useState(100);
  const [gems, setGems] = useState(5);
  const [completed, setCompleted] = useState<CompletedStatus>({}); 
  const [unitScores, setUnitScores] = useState<UnitScores>({}); 

  const addCoins = (amount: number, combo: number = 0) => {
    AudioController.playCoin(combo);
    setCoins(c => c + amount);
  };

  const handleUnitSelect = (unit: Unit) => {
    setActiveUnit(unit);
    setGameState('LEVEL_SELECT');
  };

  const handleLevelComplete = (type: 'l1' | 'l2' | 'l3' | 'l4', score: number) => { 
    if (!activeUnit) return;

    const newCompleted = { ...completed };
    if (!newCompleted[activeUnit.id]) newCompleted[activeUnit.id] = {};
    
    newCompleted[activeUnit.id][type] = true;
    setCompleted(newCompleted);
    
    if (!completed[activeUnit.id]?.[type]) {
        setGems(g => g + 1);
    }

    setUnitScores(prev => {
        const currentScores = prev[activeUnit.id] || { l1: 0, l2: 0, l3: 0, l4: 0 };
        if (score > currentScores[type]) {
            return {
                ...prev,
                [activeUnit.id]: {
                    ...currentScores,
                    [type]: score
                }
            };
        }
        return prev;
    });

    setGameState('LEVEL_SELECT');
  };

  const renderLobby = () => (
    <div className="h-full overflow-y-auto pt-24 px-4 pb-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-indigo-600 custom-scrollbar">
       <style>{`
         .custom-scrollbar::-webkit-scrollbar {
           width: 12px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
           background: #312e81; 
           border-radius: 8px;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
           background: #6366f1; 
           border-radius: 6px;
           border: 3px solid #312e81;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
           background: #818cf8; 
         }
       `}</style>

       <div className="text-center mb-8">
         <h1 className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-wider">
           汉字小英雄
         </h1>
         <div className="text-indigo-200 mt-2 font-bold">挑战自我，成为汉字小英雄！</div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
         {UNITS.map(unit => {
           const status = completed[unit.id] || {};
           const l1 = status.l1 ? 1 : 0;
           const l2 = status.l2 ? 1 : 0;
           const l3 = status.l3 ? 1 : 0;
           const l4 = status.l4 ? 1 : 0;
           // 进度条改为除以 4
           const progress = Math.floor(((l1 + l2 + l3 + l4) / 4) * 100);
           
           const scores = unitScores[unit.id] || { l1: 0, l2: 0, l3: 0, l4: 0 };
           const totalScore = scores.l1 + scores.l2 + scores.l3 + scores.l4;

           return (
             <div key={unit.id} className="transform transition hover:-translate-y-2">
               <GameButton 
                 color={progress >= 100 ? "green" : "blue"} 
                 size="xl" 
                 className="w-full flex-col items-start p-4 h-auto min-h-[140px] relative"
                 onClick={() => handleUnitSelect(unit)}
               >
                 <div className="flex justify-between w-full mb-2">
                    <span className="bg-black/20 px-2 py-1 rounded text-sm text-white/80">第{unit.id}单元</span>
                    {totalScore > 0 && 
                       <div className="flex items-center text-yellow-300 bg-black/30 rounded-full px-2 py-0.5 text-xs font-bold gap-1 animate-pulse">
                          <Trophy size={12} className="fill-current"/>
                          {totalScore}
                       </div>
                    }
                 </div>
                 <div className="text-xl font-bold text-white text-left leading-tight mb-2">{unit.title}</div>
                 <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden mt-auto">
                   <div 
                     className="bg-yellow-400 h-full transition-all duration-500" 
                     style={{ width: `${progress}%` }}
                   />
                 </div>
                 <div className="text-xs text-white/60 mt-1 w-full flex justify-between">
                    <span>{progress}% 完成</span>
                 </div>
               </GameButton>
             </div>
           );
         })}
       </div>
    </div>
  );

  const renderLevelSelect = () => {
    if (!activeUnit) return null;
    const scores = unitScores[activeUnit.id] || { l1: 0, l2: 0, l3: 0, l4: 0 };
    
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md border-4 border-slate-200 shadow-2xl relative">
          <button 
            onClick={() => setGameState('LOBBY')}
            className="absolute -top-4 -right-4 bg-red-500 text-white w-10 h-10 rounded-full font-bold border-b-4 border-red-700 active:border-b-0 active:translate-y-1 flex items-center justify-center shadow-lg"
          >
            X
          </button>

          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">{activeUnit.title}</h2>
          <p className="text-slate-500 text-center mb-6 text-sm px-4 leading-relaxed">
            {activeUnit.content.map(c => <span key={c} className="inline-block mx-1 bg-slate-100 rounded px-1">{c}</span>)}
          </p>

          <div className="space-y-4">
            <GameButton color="yellow" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L1')}>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600/20 p-2 rounded-lg"><Headphones /></div>
                <div className="text-left">
                  <div className="text-lg">听音辨字</div>
                  <div className="text-xs font-normal opacity-80">最高分: {scores.l1}</div>
                </div>
              </div>
              {completed[activeUnit.id]?.l1 && <Check size={28} className="text-yellow-800"/>}
            </GameButton>

            <GameButton color="blue" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L2')}>
              <div className="flex items-center gap-3">
                <div className="bg-blue-800/20 p-2 rounded-lg"><Edit3 /></div>
                <div className="text-left">
                  <div className="text-lg">笔顺教学</div>
                  <div className="text-xs font-normal opacity-80">最高分: {scores.l2}</div>
                </div>
              </div>
               {completed[activeUnit.id]?.l2 && <Check size={28} className="text-blue-900"/>}
            </GameButton>

            <GameButton color="pink" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L3')}>
              <div className="flex items-center gap-3">
                <div className="bg-pink-800/20 p-2 rounded-lg"><PenTool /></div>
                <div className="text-left">
                  <div className="text-lg">盲写挑战</div>
                  <div className="text-xs font-normal opacity-80">最高分: {scores.l3}</div>
                </div>
              </div>
               {completed[activeUnit.id]?.l3 && <Check size={28} className="text-pink-900"/>}
            </GameButton>

            <GameButton color="cyan" size="lg" className="w-full justify-between" onClick={() => setGameState('PLAY_L4')}>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-800/20 p-2 rounded-lg"><Ear /></div>
                <div className="text-left">
                  <div className="text-lg">听音写字</div>
                  <div className="text-xs font-normal opacity-80">最高分: {scores.l4}</div>
                </div>
              </div>
               {completed[activeUnit.id]?.l4 && <Check size={28} className="text-cyan-900"/>}
            </GameButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans select-none overflow-hidden h-screen bg-slate-900">
      <StatusBar coins={coins} gems={gems} level={Math.floor(coins / 200) + 1} />
      
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