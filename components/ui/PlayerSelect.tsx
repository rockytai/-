import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Player } from '../../types';
import GameButton from './GameButton';

interface PlayerSelectProps {
  players: Player[];
  onSelect: (id: string) => void;
  onCreate: (name: string, avatar: string) => void;
  onDelete: (id: string) => void;
}

const AVATARS = ['🐼', '🐯', '🦁', '🐰', '🦊', '🐨', '🐸', '🦄', '🐲', '🐵', '🐶', '🐱'];

export default function PlayerSelect({ players, onSelect, onCreate, onDelete }: PlayerSelectProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-900 p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-indigo-300 animate-bounce-slow">
          <h2 className="text-2xl font-black text-center mb-6 text-indigo-900">创建新角色</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-500 mb-2">选择头像</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => { setSelectedAvatar(avatar); }}
                  className={`text-3xl p-3 rounded-xl transition-all ${selectedAvatar === avatar ? 'bg-indigo-100 scale-110 border-2 border-indigo-500 shadow-md' : 'hover:bg-slate-100'}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-500 mb-2">你的名字</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full text-xl font-bold p-4 bg-slate-100 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-slate-700 placeholder-slate-400"
              placeholder="请输入名字..."
              maxLength={8}
            />
          </div>

          <div className="flex gap-4">
            <GameButton color="gray" className="flex-1" onClick={() => setIsCreating(false)}>取消</GameButton>
            <GameButton 
              color="green" 
              className="flex-1" 
              disabled={!newName.trim()}
              onClick={() => {
                if (newName.trim()) {
                  onCreate(newName.trim(), selectedAvatar);
                  setIsCreating(false);
                  setNewName('');
                }
              }}
            >
              开始!
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-900 p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-y-auto">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-wider">
          汉字小英雄
        </h1>
        <p className="text-indigo-200 font-bold mb-8 text-lg">谁在玩游戏?</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
          {players.map(player => (
            <div key={player.id} className="relative group animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => onSelect(player.id)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 border-b-8 border-indigo-200 active:border-b-0 active:translate-y-2 transition-all hover:bg-indigo-50 hover:border-indigo-300 shadow-lg group-hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-4xl border-2 border-indigo-200 shadow-inner">
                  {player.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-black text-xl text-slate-700 truncate">{player.name}</div>
                  <div className="text-slate-400 font-bold text-xs bg-slate-100 inline-block px-2 py-1 rounded-full mt-1">
                    LV.{Math.floor(player.coins / 200) + 1}
                  </div>
                </div>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm('确定要删除这个存档吗？')) onDelete(player.id); }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 hover:scale-110"
                title="删除存档"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-800/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border-4 border-dashed border-indigo-400/50 text-indigo-300 hover:bg-indigo-700/50 hover:text-white hover:border-indigo-300 transition-all min-h-[100px] hover:scale-[1.02] active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Plus size={24} />
            </div>
            <span className="font-bold">添加新玩家</span>
          </button>
        </div>
      </div>
    </div>
  );
}