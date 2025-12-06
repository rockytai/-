import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Ear, Volume2, Eye } from 'lucide-react';
import { AudioController } from '../../services/audioService';
import GameButton from '../ui/GameButton';
import TimerDisplay from '../ui/TimerDisplay';
import ComboDisplay from '../ui/ComboDisplay';
import { LevelProps } from '../../types';

const LevelFour: React.FC<LevelProps> = ({ unit, onComplete, onBack, addCoins }) => {
  const [round, setRound] = useState(0);
  const [charData, setCharData] = useState<any>(null);
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [sessionScore, setSessionScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false); 
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionRef = useRef<{ isDrawing: boolean, points: number[][] }>({ isDrawing: false, points: [] });
  const currentChar = unit.content[round];

  useEffect(() => {
    if (!charData) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, charData]);

  useEffect(() => {
    if (round >= unit.content.length) {
      AudioController.playWin();
      onComplete(sessionScore);
      return;
    }

    setCharData(null);
    setCurrentStrokeIdx(0);
    setTimeLeft(30); 
    setHasError(false);
    setShowHint(false);
    setHintUsed(false);

    fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${currentChar}.json`)
      .then(res => res.json())
      .then(data => {
        setCharData(data);
        AudioController.speak(`${currentChar}`);
      })
      .catch(err => {
        setCharData({ fallback: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charData, currentStrokeIdx, showHint]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const scale = size / 1024;

    ctx.clearRect(0, 0, size, size);

    // 1. 绘制田字格
    ctx.strokeStyle = '#e2e8f0'; 
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(size, size);
    ctx.moveTo(size, 0); ctx.lineTo(0, size);
    ctx.moveTo(size/2, 0); ctx.lineTo(size/2, size);
    ctx.moveTo(0, size/2); ctx.lineTo(size, size/2);
    ctx.stroke();
    ctx.strokeRect(0, 0, size, size);

    if (!charData) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 提示模式：显示浅色完整字
    if (showHint) {
        charData.strokes.forEach((strokePath: string) => {
            const path = new Path2D(strokePath);
            ctx.save();
            ctx.scale(scale, -scale); 
            ctx.translate(0, -1024);
            ctx.fillStyle = '#cbd5e1'; 
            ctx.fill(path);
            ctx.restore();
        });
    }

    // 绘制已完成的笔画
    for (let i = 0; i < currentStrokeIdx; i++) {
      drawStroke(ctx, charData.strokes[i], scale, '#0891b2'); // Cyan-600
    }
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, pathStr: string, scale: number, color: string) => {
    const path = new Path2D(pathStr);
    ctx.save();
    ctx.scale(scale, -scale);
    ctx.translate(0, -1024);
    ctx.fillStyle = color;
    ctx.fill(path);
    ctx.restore();
  };

  // 交互逻辑
  const handleInputStart = () => {
    if (!charData || charData.fallback) return;
    interactionRef.current.isDrawing = true;
    interactionRef.current.points = [];
  };

  const handleInputMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!interactionRef.current.isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const scale = 1024 / canvas.width;
    const dataX = x * scale;
    const dataY = (canvas.height - y) * scale; 

    interactionRef.current.points.push([dataX, dataY]);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0891b2'; 
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI*2);
      ctx.fill();
    }
  };

  const handleInputEnd = () => {
    if (!interactionRef.current.isDrawing) return;
    interactionRef.current.isDrawing = false;
    checkStrokeCompletion();
  };

  const handleHintStart = () => {
      setShowHint(true);
      setHintUsed(true); // 标记使用了提示
  };

  const checkStrokeCompletion = () => {
    const medians = charData.medians[currentStrokeIdx];
    const userPoints = interactionRef.current.points;

    if (userPoints.length < 5) {
      renderCanvas(); 
      return; 
    }

    let coveredPoints = 0;
    const threshold = 120;

    medians.forEach((targetP: number[]) => {
      const hit = userPoints.some(userP => {
        const dx = userP[0] - targetP[0];
        const dy = userP[1] - targetP[1];
        return Math.sqrt(dx*dx + dy*dy) < threshold;
      });
      if (hit) coveredPoints++;
    });

    const coverage = coveredPoints / medians.length;

    if (coverage > 0.80) { 
      AudioController.playStrokeSuccess();
      const nextIdx = currentStrokeIdx + 1;
      
      setCurrentStrokeIdx(nextIdx);

      if (nextIdx >= charData.strokes.length) {
        AudioController.playCorrect();
        
        let newCombo = combo;
        if (!hasError) {
          newCombo = combo + 1;
          setCombo(newCombo);
        } else {
          newCombo = 0;
          setCombo(0);
        }

        let earned = 0;
        if (hintUsed) {
            earned = 5; // 使用了提示，金币大幅减少，无视时间奖励
        } else {
            const bonus = timeLeft > 0 ? timeLeft : 1;
            const comboBonus = newCombo * 5; 
            earned = (bonus * 3) + comboBonus; // 第四关高分奖励 (x3 时间)
        }

        addCoins(earned, newCombo); 
        setSessionScore(s => s + earned);
        setTimeout(() => {
          setRound(r => r + 1);
        }, 1000);
      }
    } else {
      AudioController.playWrong();
      setHasError(true);
      setCombo(0);
      renderCanvas(); 
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-20 bg-cyan-100 pb-6 px-4 relative">
       <ComboDisplay combo={combo} />
       <div className="flex justify-between items-center mb-4">
        <GameButton color="cyan" size="sm" onClick={onBack}><ArrowLeft/></GameButton>
        <TimerDisplay timeLeft={timeLeft} />
        <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Ear size={16}/> 听音写字
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* 听音区 */}
        <div className="mb-8 flex flex-col items-center">
          <div className="text-sm text-cyan-700 font-bold mb-2">点击播放声音：</div>
          <button 
            onClick={() => {
                AudioController.playClick();
                AudioController.speak(currentChar);
            }}
            className="w-24 h-24 bg-cyan-500 hover:bg-cyan-400 rounded-2xl shadow-lg border-b-4 border-cyan-700 flex items-center justify-center text-white active:translate-y-1 active:border-b-0 animate-bounce-slow"
          >
             <Volume2 size={48} />
          </button>
        </div>
        
        {/* 书写区 */}
        <div className="relative w-full max-w-[320px] aspect-square bg-white rounded-2xl shadow-xl border-4 border-cyan-400">
           <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-full h-full cursor-crosshair touch-none rounded-lg"
            onMouseDown={handleInputStart}
            onMouseUp={handleInputEnd}
            onMouseLeave={handleInputEnd}
            onMouseMove={handleInputMove}
            onTouchStart={handleInputStart}
            onTouchEnd={handleInputEnd}
            onTouchMove={handleInputMove}
           />
           {!charData && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <RefreshCw className="animate-spin text-cyan-500"/>
             </div>
           )}
           
           {/* 提示按钮 */}
           <button 
             className={`absolute top-2 right-2 rounded-full p-2 transition-colors ${hintUsed ? 'bg-red-100 text-red-500' : 'bg-white/80 text-cyan-300 hover:text-cyan-500'}`}
             onMouseDown={handleHintStart}
             onMouseUp={() => setShowHint(false)}
             onTouchStart={handleHintStart}
             onTouchEnd={() => setShowHint(false)}
           >
             <Eye size={24}/>
           </button>
        </div>

        <div className="mt-8 text-center text-cyan-800/60 font-bold max-w-sm text-sm">
           听声音，在方格内写出汉字<br/>
           {hintUsed ? <span className="text-red-500 font-bold">已使用偷看，金币减少</span> : "偷看将大量减少金币"}
        </div>
      </div>
    </div>
  );
};

export default LevelFour;