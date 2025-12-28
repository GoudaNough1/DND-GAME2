import React from 'react';
import { Choice, Player, Enemy } from '../types';

interface ActionPanelProps {
  choices: Choice[];
  inCombat: boolean;
  enemy: Enemy | null;
  player: Player;
  onMakeChoice: (choice: Choice) => void;
  onCombatAction: (type: 'ATTACK' | 'HEAL' | 'FLEE' | 'SKILL', skillId?: string) => void;
  isDead: boolean;
  onRestart: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ 
  choices, 
  inCombat,
  enemy, 
  player, 
  onMakeChoice, 
  onCombatAction,
  isDead,
  onRestart
}) => {

  const canAfford = (choice: Choice): boolean => {
    if (choice.reqStat && choice.reqValue) {
        return player.stats[choice.reqStat] >= choice.reqValue;
    }
    if (choice.reqItem) {
        return player.inventory.some(i => i.id === choice.reqItem);
    }
    return true;
  };

  const getButtonContent = () => {
    if (isDead) {
        return (
            <button 
                onClick={onRestart}
                className="bg-red-900 hover:bg-red-700 text-white p-4 rounded border border-red-500 w-full font-bold uppercase tracking-widest transition-colors"
            >
                You Have Died. Restart Adventure?
            </button>
        );
    }

    if (inCombat && enemy) {
        const hpPercent = (enemy.hp / enemy.maxHp) * 100;
        
        return (
            <div className="w-full flex flex-col gap-4">
                {/* Enemy Status Card */}
                <div className="flex items-center justify-between bg-red-950/30 border border-red-900/50 p-3 rounded-md">
                    <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-red-400 font-bold uppercase tracking-wider text-sm">{enemy.name}</span>
                            <span className="text-red-200 font-mono text-sm">{enemy.hp} / {enemy.maxHp} HP</span>
                        </div>
                        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-red-900/30">
                            <div 
                                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300" 
                                style={{ width: `${hpPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                    {/* Basic Attack */}
                    <button 
                        onClick={() => onCombatAction('ATTACK')}
                        className="bg-red-900/50 hover:bg-red-800 text-red-100 p-2 md:p-3 rounded border border-red-700 transition-colors flex flex-col items-center group relative overflow-hidden"
                    >
                        <span className="font-bold text-sm md:text-lg group-hover:scale-105 transition-transform z-10">⚔️ STRIKE</span>
                        <span className="text-[9px] md:text-[10px] text-red-300 mt-1 uppercase tracking-wide z-10">D20 + {Math.floor((player.stats.str - 10)/2)}</span>
                    </button>

                    {/* Class Skill */}
                    {player.skills.map(skill => {
                        const cooldown = player.cooldowns[skill.id] || 0;
                        const isReady = cooldown === 0;
                        return (
                            <button 
                                key={skill.id}
                                onClick={() => isReady && onCombatAction('SKILL', skill.id)}
                                disabled={!isReady}
                                className={`
                                    p-2 md:p-3 rounded border transition-colors flex flex-col items-center group relative overflow-hidden
                                    ${isReady ? 'bg-cyan-900/50 hover:bg-cyan-800 border-cyan-700 text-cyan-100' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}
                                `}
                            >
                                <span className="font-bold text-sm md:text-lg group-hover:scale-105 transition-transform z-10">✨ {skill.name.split(' ')[0]}</span>
                                <span className="text-[9px] md:text-[10px] mt-1 uppercase tracking-wide z-10">
                                    {isReady ? `Ready` : `${cooldown} Turns`}
                                </span>
                            </button>
                        );
                    })}

                    {/* Potion */}
                    <button 
                        onClick={() => onCombatAction('HEAL')}
                        disabled={!player.inventory.some(i => i.id === 'potion')}
                        className="bg-green-900/50 hover:bg-green-800 disabled:opacity-30 disabled:cursor-not-allowed text-green-100 p-2 md:p-3 rounded border border-green-700 transition-colors flex flex-col items-center group"
                    >
                        <span className="font-bold text-sm md:text-lg group-hover:scale-105 transition-transform">🧪 POTION</span>
                        <span className="text-[9px] md:text-[10px] text-green-300 mt-1 uppercase tracking-wide">Heal 15</span>
                    </button>

                    {/* Defend / Guard */}
                    <button 
                        onClick={() => onCombatAction('FLEE')} // FLEE acts as DEFEND now in logic
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 md:p-3 rounded border border-slate-600 transition-colors flex flex-col items-center"
                    >
                        <span className="font-bold text-sm md:text-lg">🛡️ DEFEND</span>
                        <span className="text-[9px] md:text-[10px] text-slate-400 mt-1 uppercase tracking-wide">+5 AC / Heal</span>
                    </button>
                </div>
            </div>
        );
    }

    // Story Mode Choices
    return (
        <div className="grid grid-cols-1 gap-2 w-full">
            {choices.map((choice, idx) => {
                const available = canAfford(choice);
                return (
                    <button
                        key={idx}
                        onClick={() => available && onMakeChoice(choice)}
                        disabled={!available}
                        className={`
                            p-3 rounded border text-left transition-all flex justify-between items-center group
                            ${available 
                                ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:border-amber-500' 
                                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'}
                        `}
                    >
                        <span className="font-mono text-sm md:text-base group-hover:text-amber-400 transition-colors flex items-center">
                            <span className="inline-block w-6 text-slate-500">{idx + 1}.</span> 
                            {choice.text}
                        </span>
                        {!available && (
                            <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/50 px-2 py-1 rounded border border-red-900 ml-2 whitespace-nowrap">
                                Need {choice.reqStat ? `${choice.reqStat} ${choice.reqValue}` : 'Item'}
                            </span>
                        )}
                        {available && choice.reqStat && (
                             <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900 ml-2 whitespace-nowrap">
                                [{choice.reqStat} Check]
                            </span>
                        )}
                    </button>
                );
            })}
             {choices.length === 0 && (
                <button 
                    onClick={onRestart}
                    className="bg-amber-900/50 hover:bg-amber-800 text-amber-100 p-4 rounded border border-amber-700 w-full font-bold uppercase tracking-widest transition-colors"
                >
                    Adventure Complete. Play Again?
                </button>
            )}
        </div>
    );
  };

  return (
    <div className="p-4 bg-slate-950 border-t border-slate-700 md:h-56 flex items-center justify-center">
      {getButtonContent()}
    </div>
  );
};