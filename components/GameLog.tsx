import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface GameLogProps {
  logs: LogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'COMBAT_HIT': return 'text-red-400';
      case 'COMBAT_MISS': return 'text-slate-500 italic';
      case 'COMBAT_INFO': return 'text-slate-400';
      case 'HEAL': return 'text-green-400';
      case 'LOOT': return 'text-amber-400 font-bold';
      case 'DANGER': return 'text-orange-500 font-bold';
      case 'SUCCESS': return 'text-emerald-300 font-bold';
      case 'SKILL': return 'text-cyan-400 font-bold';
      case 'NARRATIVE': default: return 'text-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-900 border-r border-l border-slate-700 font-mono text-sm md:text-base leading-relaxed">
      {logs.map((log) => (
        <div key={log.id} className={`mb-3 ${getColor(log.type)} animate-fade-in`}>
          <span className="opacity-50 text-xs mr-2">[{log.type.substring(0,3)}]</span>
          {log.text}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};