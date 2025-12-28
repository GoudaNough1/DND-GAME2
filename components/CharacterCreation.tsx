import React, { useState } from 'react';
import { Player, Race, Background, Personality, VisualTraits, ClassName, Stats } from '../types';
import { RACES, BACKGROUNDS, PERSONALITIES, CLASS_PRESETS, ITEMS } from '../constants';
import { PixelAvatar } from './PixelAvatar';

interface CharacterCreationProps {
  onComplete: (player: Player) => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [race, setRace] = useState<Race>('Human');
  const [visuals, setVisuals] = useState<VisualTraits>({
    skinColor: '#fca5a5',
    hairColor: '#334155',
    hairStyle: 1,
    accessory: 0
  });
  const [background, setBackground] = useState<Background>('Urchin');
  const [personality, setPersonality] = useState<Personality>('Stoic');
  const [className, setClassName] = useState<ClassName>('Warrior');

  const skinColors = ['#fca5a5', '#fcd34d', '#ad7d52', '#573d28', '#94a3b8', '#86efac'];
  const hairColors = ['#f8fafc', '#334155', '#fbbf24', '#b91c1c', '#4ade80'];

  const handleNext = () => setStep(p => p + 1);
  const handlePrev = () => setStep(p => p - 1);

  const handleFinish = () => {
    // Merge Stats
    const baseClass = CLASS_PRESETS[className];
    const raceInfo = RACES[race];
    const bgMod = BACKGROUNDS[background];

    const finalPlayer: Player = {
        name: name || 'Adventurer',
        race,
        background,
        personality,
        className,
        visuals,
        passiveAbilities: [...raceInfo.abilities],
        stats: {
            str: baseClass.stats.str + (raceInfo.stats.str || 0) + (bgMod.stats.str || 0),
            dex: baseClass.stats.dex + (raceInfo.stats.dex || 0) + (bgMod.stats.dex || 0),
            int: baseClass.stats.int + (raceInfo.stats.int || 0) + (bgMod.stats.int || 0),
            maxHp: baseClass.stats.maxHp + (raceInfo.stats.maxHp || 0) + (bgMod.stats.maxHp || 0),
            currentHp: baseClass.stats.maxHp + (raceInfo.stats.maxHp || 0) + (bgMod.stats.maxHp || 0),
            ac: baseClass.stats.ac + (raceInfo.stats.ac || 0) + (bgMod.stats.ac || 0),
        },
        xp: 0,
        level: 1,
        inventory: [...baseClass.items, ...bgMod.items],
        skills: [...baseClass.skills],
        cooldowns: {},
        isDefending: false
    };

    onComplete(finalPlayer);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold text-amber-500 mb-6 text-center tracking-widest uppercase">Character Creation</h1>

        {/* --- STEP 1: VISUALS & IDENTITY --- */}
        {step === 1 && (
            <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-mono border-b border-slate-700 pb-2">Who are you?</h2>
                
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <PixelAvatar visuals={visuals} size={160} />
                        <div className="text-xs text-slate-500">PREVIEW</div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-slate-500 mb-1">Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 focus:border-amber-500 outline-none"
                                placeholder="Enter Name..."
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs uppercase text-slate-500 mb-1">Race</label>
                                <select 
                                    value={race} 
                                    onChange={e => setRace(e.target.value as Race)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2"
                                >
                                    {Object.keys(RACES).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <div className="mt-2 text-xs text-slate-400 bg-slate-800 p-2 rounded border border-slate-700">
                                    <div className="font-bold text-amber-500 mb-1">{RACES[race].description}</div>
                                    <div className="text-emerald-400">Ability: {RACES[race].abilities.join(', ')}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs uppercase text-slate-500 mb-1">Skin Tone</label>
                                    <div className="flex gap-1 flex-wrap">
                                        {skinColors.map(c => (
                                            <button 
                                                key={c} 
                                                onClick={() => setVisuals({...visuals, skinColor: c})}
                                                className={`w-6 h-6 rounded-full border-2 ${visuals.skinColor === c ? 'border-white' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-slate-500 mb-1">Hair</label>
                                    <input 
                                        type="range" min="0" max="3" 
                                        value={visuals.hairStyle} 
                                        onChange={e => setVisuals({...visuals, hairStyle: parseInt(e.target.value)})} 
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleNext} className="bg-amber-700 hover:bg-amber-600 px-6 py-2 rounded text-white font-bold">NEXT: ORIGIN</button>
                </div>
            </div>
        )}

        {/* --- STEP 2: ORIGIN --- */}
        {step === 2 && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-mono border-b border-slate-700 pb-2">Where do you come from?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(BACKGROUNDS).map((bg) => {
                        const b = BACKGROUNDS[bg as Background];
                        return (
                            <button 
                                key={bg}
                                onClick={() => setBackground(bg as Background)}
                                className={`p-4 border rounded text-left hover:bg-slate-800 transition-colors ${background === bg ? 'border-amber-500 bg-slate-800' : 'border-slate-700'}`}
                            >
                                <div className="font-bold text-lg mb-1">{bg}</div>
                                <div className="text-xs text-slate-400 mb-2 italic">{b.description}</div>
                                <div className="text-xs text-emerald-400">
                                    Bonus: {Object.keys(b.stats).map(k => `${k.toUpperCase()} ${b.stats[k as keyof Stats]! > 0 ? '+' : ''}${b.stats[k as keyof Stats]} `)}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="flex justify-between pt-4">
                     <button onClick={handlePrev} className="text-slate-500 hover:text-slate-300">BACK</button>
                    <button onClick={handleNext} className="bg-amber-700 hover:bg-amber-600 px-6 py-2 rounded text-white font-bold">NEXT: CLASS</button>
                </div>
             </div>
        )}

        {/* --- STEP 3: CLASS & PERSONALITY --- */}
        {step === 3 && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-mono border-b border-slate-700 pb-2">What is your path?</h2>
                
                <div className="space-y-4">
                    <label className="block text-xs uppercase text-slate-500">Combat Style</label>
                    <div className="grid grid-cols-3 gap-3">
                         {(['Warrior', 'Rogue', 'Mage'] as ClassName[]).map(c => (
                             <button
                                key={c}
                                onClick={() => setClassName(c)}
                                className={`p-4 border rounded flex flex-col items-center justify-center gap-2 ${className === c ? 'border-amber-500 bg-slate-800' : 'border-slate-700'}`}
                             >
                                <span className="text-2xl">{c === 'Warrior' ? '⚔️' : c === 'Rogue' ? '🗡️' : '🔮'}</span>
                                <span className="font-bold">{c}</span>
                             </button>
                         ))}
                    </div>

                    <label className="block text-xs uppercase text-slate-500">Personality</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(PERSONALITIES).map(p => (
                             <button
                                key={p}
                                onClick={() => setPersonality(p as Personality)}
                                className={`p-3 border rounded text-left text-sm ${personality === p ? 'border-amber-500 bg-slate-800' : 'border-slate-700'}`}
                             >
                                <span className="font-bold block">{p}</span>
                                <span className="text-xs text-slate-400">{PERSONALITIES[p as Personality]}</span>
                             </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                     <button onClick={handlePrev} className="text-slate-500 hover:text-slate-300">BACK</button>
                    <button onClick={handleFinish} className="bg-green-700 hover:bg-green-600 px-8 py-2 rounded text-white font-bold animate-pulse">START ADVENTURE</button>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};