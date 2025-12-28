import React from 'react';
import { Player } from '../types';

interface SidebarProps {
  player: Player;
}

export const Sidebar: React.FC<SidebarProps> = ({ player }) => {
  // Calculate health percentage for bar
  const hpPercent = Math.max(0, Math.min(100, (player.stats.currentHp / player.stats.maxHp) * 100));

  return (
    <div className="w-full md:w-64 bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col gap-6 text-slate-300">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-amber-500 mb-1">MINES OF KORTH</h1>
        <div className="text-xs text-slate-500 uppercase tracking-widest">v1.0.0</div>
      </div>

      {/* Character Card */}
      <div className="bg-slate-900 p-3 rounded border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-2">{player.name || 'Unknown'}</h2>
        <div className="text-sm text-amber-300 mb-2">Lvl {player.level} {player.className}</div>
        
        {/* HP Bar */}
        <div className="mb-1 flex justify-between text-xs">
            <span>HP</span>
            <span>{player.stats.currentHp} / {player.stats.maxHp}</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
            <div 
                className={`h-full transition-all duration-500 ${hpPercent < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${hpPercent}%` }}
            />
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Attributes</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between bg-slate-900 p-2 rounded">
                <span>STR</span> <span className="text-white">{player.stats.str}</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded">
                <span>DEX</span> <span className="text-white">{player.stats.dex}</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded">
                <span>INT</span> <span className="text-white">{player.stats.int}</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded">
                <span>AC</span> <span className="text-white">{player.stats.ac}</span>
            </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Inventory</h3>
        <ul className="space-y-1 text-sm">
            {player.inventory.length === 0 && <li className="text-slate-600 italic">Empty</li>}
            {player.inventory.map((item, idx) => (
                <li key={`${item.id}-${idx}`} className="flex justify-between items-center bg-slate-900/50 p-1 px-2 rounded border border-slate-800/50">
                    <span className={item.type === 'WEAPON' ? 'text-blue-300' : 'text-slate-300'}>
                        {item.name}
                    </span>
                    {item.type === 'CONSUMABLE' && (
                         <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">Use in Combat</span>
                    )}
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};