import React from 'react';
import { AudioController } from '../../services/audioService';

interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'pink' | 'cyan';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
}

const GameButton: React.FC<GameButtonProps> = ({ 
  children, 
  onClick, 
  color = 'blue', 
  size = 'md', 
  className = '', 
  disabled = false 
}) => {
  const colors = {
    blue: 'bg-blue-500 border-blue-700 hover:bg-blue-400',
    green: 'bg-green-500 border-green-700 hover:bg-green-400',
    yellow: 'bg-yellow-400 border-yellow-600 hover:bg-yellow-300 text-yellow-900',
    red: 'bg-red-500 border-red-700 hover:bg-red-400',
    gray: 'bg-gray-400 border-gray-600 text-gray-200 cursor-not-allowed',
    purple: 'bg-purple-500 border-purple-700 hover:bg-purple-400 text-white',
    pink: 'bg-pink-500 border-pink-700 hover:bg-pink-400 text-white',
    cyan: 'bg-cyan-500 border-cyan-700 hover:bg-cyan-400 text-white',
  };

  const sizes = {
    sm: 'h-10 text-sm px-4',
    md: 'h-14 text-lg px-6',
    lg: 'h-20 text-2xl px-8',
    xl: 'h-32 text-3xl px-8',
  };

  const styleClass = disabled ? colors.gray : colors[color];
  const activeClass = disabled ? '' : 'active:translate-y-1 active:border-b-0 active:mt-1';

  return (
    <button
      onClick={() => { if (!disabled) { AudioController.playClick(); onClick && onClick(); } }}
      className={`
        relative rounded-xl font-black border-b-4 transition-all duration-75 select-none
        flex items-center justify-center gap-2 shadow-lg
        ${styleClass} ${sizes[size]} ${activeClass} ${className}
      `}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default GameButton;