import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Eye } from 'lucide-react';
import { AudioController } from '../../services/audioService';
import GameButton from '../ui/GameButton';
import TimerDisplay from '../ui/TimerDisplay';
import { LevelProps } from '../../types';

const LevelTwo: React.FC<LevelProps> = ({ unit, onComplete, onBack, addCoins }) => {
  const [round, setRound] = useState(0);
  const [charData, setCharData] = useState<any>(null);
  const [gameState, setGameState] = useState<'LOADING' | 'DEMO' | 'WRITING' | 'SUCCESS'>('LOADING'); 
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [sessionScore, setSessionScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionRef = useRef<{ isDrawing: boolean, points: number[][] }>({ isDrawing: false, points: [] });
  const currentChar = unit.content[round];

  useEffect(() => {
    if (gameState !== 'WRITING') return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (round >= unit.content.length) {
      AudioController.playWin();
      onComplete(sessionScore);
      return;
    }

    setGameState('LOADING');
    setCharData(null);
    setCurrentStrokeIdx(0);

    fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${currentChar}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setCharData(data);
        setGameState('DEMO');
        AudioController.speak(`仔细看，${currentChar} 字是这样写的`);
      })
      .catch(err => {
        setCharData({ fallback: true }); 
        setGameState('WRITING'); 
        setTimeLeft(20);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    if (gameState !== 'DEMO' || !charData || charData.fallback) return;

    let animFrame: number;
    let strokeIdx = 0;
    let progress = 0;

    const animate = () => {
      progress += 0.05; 
      if (progress >= 1) {
        progress = 0;
        strokeIdx++;
      }

      if (strokeIdx >= charData.strokes.length) {
        setTimeout(() => {
          setGameState('WRITING');
          setTimeLeft(20); 
          AudioController.speak("现在轮到你了");
          setCurrentStrokeIdx(0);
        }, 1000);
        return;
      }

      renderCanvas(strokeIdx, progress, 'DEMO');
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, charData]);

  useEffect(() => {
    if (gameState === 'WRITING') {
      renderCanvas(currentStrokeIdx, 0, 'WRITING');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentStrokeIdx, charData]);

  const renderCanvas = (activeStrokeIdx: number, activeProgress: number, mode: 'DEMO' | 'WRITING') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const scale = size / 1024;

    ctx.clearRect(0, 0, size, size);

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

    if (charData.fallback) {
      ctx.font = `bold ${size * 0.8}px "KaiTi", "楷体", serif`;
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentChar, size/2, size/2 + size * 0.05);
      return;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    charData.strokes.forEach((strokePath: string) => {
      const path = new Path2D(strokePath);
      ctx.save();
      ctx.scale(scale, -scale); 
      ctx.translate(0, -1024);
      ctx.fillStyle = '#f1f5f9'; 
      ctx.fill(path);
      ctx.restore();
    });

    const completedCount = mode === 'DEMO' ? activeStrokeIdx : currentStrokeIdx;
    
    for (let i = 0; i < completedCount; i++) {
      drawStroke(ctx, charData.strokes[i], scale, '#334155'); 
    }

    if (activeStrokeIdx < charData.strokes.length) {
      if (mode === 'DEMO') {
        drawStroke(ctx, charData.strokes[activeStrokeIdx], scale, '#ef4444'); 
      } else if (mode === 'WRITING') {
        drawStroke(ctx, charData.strokes[activeStrokeIdx], scale, 'rgba(239, 68, 68, 0.3)'); 
        if (charData.medians && charData.medians[activeStrokeIdx]) {
           const startPoint = charData.medians[activeStrokeIdx][0];
           ctx.save();
           ctx.scale(scale, -scale);
           ctx.translate(0, -1024);
           ctx.fillStyle = '#ef4444';
           ctx.beginPath();
           ctx.arc(startPoint[0], startPoint[1], 60, 0, Math.PI * 2); 
           ctx.fill();
           ctx.restore();
        }
      }
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

  const handleInputStart = () => {
    if (gameState !== 'WRITING' || !charData || charData.fallback) return;
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
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI*2);
      ctx.fill();
    }
  };

  const handleInputEnd = () => {
    if (!interactionRef.current.isDrawing) return;
    interactionRef.current.isDrawing = false;
    checkStrokeCompletion();
  };

  const checkStrokeCompletion = () => {
    const medians = charData.medians[currentStrokeIdx];
    const userPoints = interactionRef.current.points;

    if (userPoints.length < 5) return; 

    let coveredPoints = 0;
    const threshold = 100; 

    medians.forEach((targetP: number[]) => {
      const hit = userPoints.some(userP => {
        const dx = userP[0] - targetP[0];
        const dy = userP[1] - targetP[1];
        return Math.sqrt(dx*dx + dy*dy) < threshold;
      });
      if (hit) coveredPoints++;
    });

    const coverage = coveredPoints / medians.length;

    if (coverage > 0.85) { 
      AudioController.playStrokeSuccess();
      const nextIdx = currentStrokeIdx + 1;
      
      if (nextIdx >= charData.strokes.length) {
        setGameState('SUCCESS');
        AudioController.playCorrect();
        
        const earned = 10;

        addCoins(earned, 0); 
        setSessionScore(s => s + earned);
        setTimeout(() => {
          setRound(r => r + 1);
        }, 1000);
      } else {
        setCurrentStrokeIdx(nextIdx);
      }
    } else {
      AudioController.playWrong();
      renderCanvas(currentStrokeIdx, 0, 'WRITING');
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  return (
    <div className="flex flex-col h-screen pt-20 bg-orange-100 pb-6 px-4 relative">
       <div className="flex justify-between items-center mb-4">
        <GameButton color="yellow" size="sm" onClick={onBack}><ArrowLeft/></GameButton>
        <div className="flex items-center gap-2">
            {gameState === 'WRITING' && <TimerDisplay timeLeft={timeLeft} />}
            {gameState === 'DEMO' && (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
                <Eye size={16}/> 观察笔顺
              </span>
            )}
            <GameButton color="red" size="sm" onClick={() => {
              setGameState('DEMO'); 
              AudioController.playClick();
            }}><RefreshCw size={18}/></GameButton>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-3xl font-black text-orange-800 mb-4">{currentChar}</h2>
        
        <div className="relative w-full max-w-[320px] aspect-square bg-white rounded-2xl shadow-xl border-4 border-orange-300">
           {gameState === 'LOADING' && (
             <div className="absolute inset-0 flex items-center justify-center text-orange-400">
               <RefreshCw className="animate-spin" size={40}/>
             </div>
           )}
           
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
        </div>

        <div className="mt-8 text-center text-orange-800/70 font-bold bg-orange-200/50 p-4 rounded-xl max-w-sm">
           {gameState === 'DEMO' ? '请仔细观察红色的笔顺' : '请跟随红色提示，完成书写'}
        </div>
      </div>
    </div>
  );
};

export default LevelTwo;