import React, { useState, useEffect } from 'react';
import { Volume2, ArrowLeft } from 'lucide-react';
import { AudioController } from '../../services/audioService';
import GameButton from '../ui/GameButton';
import TimerDisplay from '../ui/TimerDisplay';
import ComboDisplay from '../ui/ComboDisplay';
import { UNITS } from '../../constants';
import { LevelProps } from '../../types';

const LevelOne: React.FC<LevelProps> = ({ unit, onComplete, onBack, addCoins }) => {
  const [targetChar, setTargetChar] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<'thinking' | 'correct' | 'wrong'>('thinking'); 
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [sessionScore, setSessionScore] = useState(0);
  const [combo, setCombo] = useState(0); 

  useEffect(() => {
    if (status !== 'thinking') return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const startRound = () => {
    if (round >= unit.content.length) {
      AudioController.playWin();
      onComplete(sessionScore);
      return;
    }
    const target = unit.content[round];
    setTargetChar(target);
    setStatus('thinking');
    setTimeLeft(20); 

    let distractors = unit.content.filter(c => c !== target);
    while (distractors.length < 3) {
      const randomUnit = UNITS[Math.floor(Math.random() * UNITS.length)];
      const randomChar = randomUnit.content[Math.floor(Math.random() * randomUnit.content.length)];
      if (randomChar !== target && !distractors.includes(randomChar)) {
        distractors.push(randomChar);
      }
    }
    distractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    const opts = [...distractors, target].sort(() => 0.5 - Math.random());
    setOptions(opts);

    setTimeout(() => {
      AudioController.speak(target);
    }, 500);
  };

  const handleSelect = (char: string) => {
    if (status !== 'thinking') return;

    if (char === targetChar) {
      setStatus('correct');
      AudioController.playCorrect();
      
      const newCombo = combo + 1;
      setCombo(newCombo);

      const timeBonus = timeLeft > 0 ? timeLeft : 1;
      const comboBonus = newCombo * 2;
      const earnedCoins = timeBonus + comboBonus;
      
      addCoins(earnedCoins, newCombo); 
      setSessionScore(s => s + earnedCoins);
      
      setTimeout(() => setRound(r => r + 1), 1000);
    } else {
      setStatus('wrong');
      AudioController.playWrong();
      setCombo(0); 
      AudioController.speak(targetChar);
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => setStatus('thinking'), 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-20 bg-sky-200 pb-6 px-4 relative">
      <ComboDisplay combo={combo} />
      <div className="flex justify-between items-center mb-4">
        <GameButton color="blue" size="sm" onClick={onBack}><ArrowLeft/></GameButton>
        <TimerDisplay timeLeft={timeLeft} />
        <div className="bg-white/80 px-4 py-2 rounded-xl font-bold text-slate-700">
          {round + 1} / {unit.content.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <button 
          onClick={() => { AudioController.playClick(); AudioController.speak(targetChar); }}
          className="w-32 h-32 bg-yellow-400 rounded-3xl border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 flex items-center justify-center mb-8 shadow-xl animate-bounce-slow"
        >
          <Volume2 size={64} className="text-yellow-900"/>
        </button>
        <p className="text-slate-600 font-bold mb-8">点击喇叭听读音，选择正确的字</p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {options.map((char, i) => (
            <button
              key={i}
              onClick={() => handleSelect(char)}
              className={`
                h-24 text-4xl font-black rounded-2xl border-b-4 shadow-md transition-all
                ${status === 'correct' && char === targetChar ? 'bg-green-500 border-green-700 text-white transform scale-105' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'}
                ${status === 'wrong' && char !== targetChar ? 'opacity-50' : ''}
              `}
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelOne;