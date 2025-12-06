import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, PenTool } from 'lucide-react';
import { AudioController } from '../../services/audioService';
import GameButton from '../ui/GameButton';
import TimerDisplay from '../ui/TimerDisplay';
import ComboDisplay from '../ui/ComboDisplay';
import { LevelProps } from '../../types';

const LevelThree: React.FC<LevelProps> = ({ unit, onComplete, onBack, addCoins }) => {
  const [round, setRound] = useState(0);
  const [charData, setCharData] = useState<any>(null);
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [sessionScore, setSessionScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hasError, setHasError] = useState(false);
  
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
    setTimeLeft(20);
    setHasError(false);

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
  }, [charData, currentStrokeIdx]);

  const renderCanvas = () => {
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

    if (!charData || charData.fallback) {
       if (charData?.fallback) {
         ctx.font = `20px sans-serif`;
         ctx.fillStyle = '#999';
         ctx.textAlign = 'center';
         ctx.fillText('数据缺失，跳过', size/2, size/2);
       }
       return;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < currentStrokeIdx; i++) {
      drawStroke(ctx, charData.strokes[i], scale, '#1e293b'); 
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
      ctx.fillStyle = '#1e293b'; 
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
        
        let earned = 0;
        let newCombo = combo;
        if (!hasError) {
          newCombo = combo + 1;
          setCombo(newCombo);
        } else {
          newCombo = 0;
          setCombo(0);
        }

        const bonus = timeLeft > 0 ? timeLeft : 1;
        const comboBonus = newCombo * 5; 
        earned = (bonus * 2) + comboBonus;

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
    <div className="flex flex-col h-screen pt-20 bg-purple-100 pb-6 px-4 relative">
       <ComboDisplay combo={combo} />
       <div className="flex justify-between items-center mb-4">
        <GameButton color="purple" size="sm" onClick={onBack}><ArrowLeft/></GameButton>
        <TimerDisplay timeLeft={timeLeft} />
        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <PenTool size={16}/> 盲写挑战
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="text-sm text-purple-700 font-bold mb-2">请写出：</div>
          <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-purple-200">
             <span className="text-5xl font-black text-purple-900">{currentChar}</span>
          </div>
        </div>
        
        <div className="relative w-full max-w-[320px] aspect-square bg-white rounded-2xl shadow-xl border-4 border-purple-400">
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
                <RefreshCw className="animate-spin text-purple-500"/>
             </div>
           )}
        </div>

        <div className="mt-8 text-center text-purple-800/60 font-bold max-w-sm text-sm">
           没有任何辅助，笔顺必须完全正确<br/>写错会自动消失
        </div>
      </div>
    </div>
  );
};

export default LevelThree;