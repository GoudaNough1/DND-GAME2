import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { GameLog } from './components/GameLog';
import { ActionPanel } from './components/ActionPanel';
import { Player, LogEntry, StoryNode, Enemy, Choice, ClassName } from './types';
import { STORY_NODES, CLASS_PRESETS, ENEMIES, ITEMS, SKILLS } from './constants';

const INITIAL_PLAYER: Player = {
  name: 'Adventurer',
  className: 'Novice',
  stats: { str: 10, dex: 10, int: 10, maxHp: 10, currentHp: 10, ac: 10 },
  xp: 0,
  inventory: [],
  level: 1,
  skills: [],
  cooldowns: {},
  isDefending: false
};

export default function App() {
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('START');
  const [combatState, setCombatState] = useState<{ active: boolean; enemy: Enemy | null }>({ active: false, enemy: null });

  // --- Helper: Add to Log ---
  const addLog = useCallback((text: string, type: LogEntry['type'] = 'NARRATIVE') => {
    const id = Date.now().toString() + Math.random();
    setLogs(prev => [...prev, { id, text, type }]);
  }, []);

  // --- Engine: Dice Roll ---
  const rollD20 = () => Math.floor(Math.random() * 20) + 1;

  // --- Effect: Initialize Story ---
  useEffect(() => {
    if (logs.length === 0) {
      addLog(STORY_NODES['START'].text);
    }
  }, [addLog, logs.length]);

  // --- Logic: Handle Choices ---
  const handleChoice = (choice: Choice) => {
    // Handle Special Actions defined in choices
    if (choice.action === 'ADD_ITEM' && choice.actionValue) {
      if (['Warrior', 'Rogue', 'Mage'].includes(choice.actionValue as string)) {
        const cls = choice.actionValue as string;
        const preset = CLASS_PRESETS[cls];
        setPlayer(prev => ({
          ...prev,
          className: cls as ClassName,
          stats: { ...preset.stats },
          inventory: [...preset.items],
          skills: [...preset.skills]
        }));
        addLog(`You grip your weapon. You are ready. (Class: ${cls})`, 'SUCCESS');
      } else if (choice.actionValue === 'AMULET') {
        const item = ITEMS['AMULET'];
        setPlayer(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
        addLog(`You picked up: ${item.name}`, 'LOOT');
      } else if (choice.actionValue === 'MAP') {
        const item = ITEMS['MAP'];
        setPlayer(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
        addLog(`Key Item Acquired: ${item.name}`, 'LOOT');
      } else if (choice.actionValue === 'SNEAK_BONUS') {
        const enemy = { ...ENEMIES['HOBGOBLIN_BOSS'] };
        enemy.hp -= 10;
        setCombatState({ active: true, enemy });
        addLog("SNEAK ATTACK! You drive your blade into Krug's back before he can turn!", 'COMBAT_HIT');
        addLog(`Krug roars in fury, bleeding heavily.`, 'DANGER');
      }
    }

    if (choice.action === 'HEAL') {
      const amount = Number(choice.actionValue) || 10;
      healPlayer(amount);
    }

    const nextNode = STORY_NODES[choice.nextId];
    setCurrentNodeId(choice.nextId);
    
    // Check for Stat Roll Visuals in Choices (Flavor only)
    if (choice.reqStat) {
       addLog(`🎲 [Skill Check: ${choice.reqStat.toUpperCase()}] Passed.`, 'SUCCESS');
    }

    if (nextNode.enemyId && choice.action !== 'INIT_COMBAT' && choice.nextId !== 'BOSS_FIGHT') {
       startCombat(nextNode.enemyId);
    } else if (choice.nextId === 'BOSS_FIGHT' && !combatState.active) {
       startCombat('HOBGOBLIN_BOSS');
    }

    addLog(nextNode.text);

    if (nextNode.isEnd) {
        addLog("--- TO BE CONTINUED ---", 'LOOT');
    }
  };

  // --- Logic: Combat System ---
  const startCombat = (enemyId: string) => {
    const enemyTemplate = ENEMIES[enemyId];
    setCombatState({ active: true, enemy: { ...enemyTemplate } });
    addLog(`COMBAT! ${enemyTemplate.name} lunges at you!`, 'DANGER');
  };

  const healPlayer = (amount: number, isPotion = false) => {
    setPlayer(prev => {
      const newHp = Math.min(prev.stats.maxHp, prev.stats.currentHp + amount);
      const newInventory = isPotion 
        ? prev.inventory.filter((_, i) => i !== prev.inventory.findIndex(item => item.id === 'potion')) 
        : prev.inventory;
      
      const flavor = isPotion ? "You down the bitter crimson liquid." : "You bind your wounds.";
      addLog(`${flavor} (+${amount} HP). Current: ${newHp}/${prev.stats.maxHp}`, 'HEAL');
      return { ...prev, stats: { ...prev.stats, currentHp: newHp }, inventory: newInventory };
    });
  };

  // --- Main Combat Handler ---
  const handleCombatAction = (type: 'ATTACK' | 'HEAL' | 'FLEE' | 'SKILL', skillId?: string) => {
    if (!combatState.enemy) return;

    // Tick Down Cooldowns at start of Player Action
    const nextCooldowns = { ...player.cooldowns };
    Object.keys(nextCooldowns).forEach(key => {
        if (nextCooldowns[key] > 0) nextCooldowns[key] -= 1;
    });

    // Reset Defense Flag from previous turn
    setPlayer(p => ({ ...p, isDefending: false, cooldowns: nextCooldowns }));

    if (type === 'HEAL') {
      healPlayer(15, true);
      enemyTurn(combatState.enemy, false); // Not defending
      return;
    }

    if (type === 'FLEE') {
       // This is now DEFEND
       const healAmt = Math.floor(Math.random() * 3) + 1;
       addLog("🛡️ TACTICAL DEFENSE: You raise your guard (+5 AC) and catch your breath.", 'COMBAT_INFO');
       healPlayer(healAmt);
       // Flag player as defending for enemy turn
       setPlayer(p => ({ ...p, isDefending: true }));
       enemyTurn(combatState.enemy, true);
       return;
    }

    let dmg = 0;
    let hitDescription = "";
    let isHit = false;
    let enemy = { ...combatState.enemy };

    // -- Resolve Player Action --
    if (type === 'ATTACK') {
        const attackRoll = rollD20();
        const hitMod = Math.floor((player.stats.str - 10) / 2);
        const totalAttack = attackRoll + hitMod;
        
        const isCrit = attackRoll === 20;
        const rollLog = `🎲 You rolled [${attackRoll}] + ${hitMod} = ${totalAttack} (vs AC ${enemy.ac})`;

        if (totalAttack >= enemy.ac || isCrit) {
            isHit = true;
            const weapon = player.inventory.find(i => i.type === 'WEAPON');
            const baseVal = weapon ? weapon.effectValue || 4 : 2; 
            dmg = Math.floor(Math.random() * baseVal) + 1 + hitMod;
            
            if (isCrit) {
                dmg *= 2;
                addLog(rollLog + " ...CRITICAL HIT!", 'SUCCESS');
                hitDescription = `CRITICAL! Your strike finds a weak point for DOUBLE DAMAGE (${dmg})!`;
            } else {
                addLog(rollLog + " ...HIT!", 'SUCCESS');
                hitDescription = `You strike the ${enemy.name} for ${dmg} damage.`;
            }
        } else {
            addLog(rollLog + " ...MISS", 'COMBAT_INFO');
            addLog(`Your attack glances off the ${enemy.name}.`, 'COMBAT_MISS');
        }
    } 
    else if (type === 'SKILL' && skillId) {
        const skill = SKILLS[skillId.toUpperCase()];
        if (!skill) return;

        // Apply Cooldown
        setPlayer(p => ({ ...p, cooldowns: { ...p.cooldowns, [skill.id]: skill.cooldownMax }}));
        addLog(`✨ USING SKILL: ${skill.name}`, 'SKILL');

        if (skillId === 'heroic_strike') {
             // Warrior: Low accuracy, High Damage
             const attackRoll = rollD20();
             const hitMod = Math.floor((player.stats.str - 10) / 2) - 2; // Penalty
             const totalAttack = attackRoll + hitMod;
             if (totalAttack >= enemy.ac) {
                 dmg = Math.floor(Math.random() * 8) + 10; // 10-18
                 isHit = true;
                 hitDescription = `HEROIC STRIKE! You crush the enemy for ${dmg} massive damage!`;
             } else {
                 addLog(`You swing with all your might but miss! (Rolled ${totalAttack})`, 'COMBAT_MISS');
             }
        } 
        else if (skillId === 'shadow_shiv') {
            // Rogue: Auto Hit
            isHit = true;
            dmg = Math.floor(Math.random() * 4) + 8; // 8-12
            hitDescription = `SHADOW SHIV! You slip past defenses for ${dmg} piercing damage.`;
        }
        else if (skillId === 'fireball') {
            // Mage: Auto Hit, High Dmg
            isHit = true;
            dmg = Math.floor(Math.random() * 8) + 12; // 12-20
            hitDescription = `FIREBALL! The room explodes in flame! ${dmg} damage!`;
        }
    }

    // Apply Damage to Enemy
    if (isHit) {
        enemy.hp -= dmg;
        addLog(hitDescription, 'COMBAT_HIT');
    }

    if (enemy.hp <= 0) {
        endCombat(true, enemy);
    } else {
        setCombatState(prev => ({ ...prev, enemy }));
        setTimeout(() => enemyTurn(enemy, false), 800);
    }
  };

  const enemyTurn = (enemy: Enemy, playerDefending: boolean) => {
    if (player.stats.currentHp <= 0) return;

    // Calculate Defense Bonus
    const effectiveAc = player.stats.ac + (playerDefending ? 5 : 0);
    if (playerDefending) addLog(`(Defense Active: AC ${player.stats.ac} -> ${effectiveAc})`, 'COMBAT_INFO');

    const attackRoll = rollD20();
    const hitMod = enemy.id === 'hobgoblin_boss' ? 5 : 2; 
    const totalAttack = attackRoll + hitMod;

    // Boss Banter
    if (enemy.id === 'hobgoblin_boss' && Math.random() > 0.7) {
        const banter = ["\"You bleed just like the others!\"", "\"Krug will make a cup from your skull!\"", "\"Stop moving and die!\""];
        addLog(`Krug shouts: ${banter[Math.floor(Math.random() * banter.length)]}`, 'DANGER');
    }

    if (totalAttack >= effectiveAc) {
        const dmg = Math.floor(Math.random() * (enemy.damageMax - enemy.damageMin + 1)) + enemy.damageMin;
        
        setPlayer(prev => {
            const newHp = prev.stats.currentHp - dmg;
            if (newHp <= 0) {
                addLog(`🎲 ${enemy.name} rolled [${attackRoll}] + ${hitMod} = ${totalAttack} ...HIT!`, 'DANGER');
                addLog(`FATAL BLOW! The ${enemy.name} ends your journey.`, 'COMBAT_HIT');
                handlePlayerDeath();
                return { ...prev, stats: { ...prev.stats, currentHp: 0 }};
            }
            addLog(`🎲 ${enemy.name} rolled [${attackRoll}] + ${hitMod} = ${totalAttack} ...HIT!`, 'DANGER');
            addLog(`The ${enemy.name} strikes you for ${dmg} damage.`, 'COMBAT_HIT');
            return { ...prev, stats: { ...prev.stats, currentHp: newHp }};
        });
    } else {
        addLog(`🎲 ${enemy.name} rolled [${attackRoll}] + ${hitMod} = ${totalAttack} ...MISS`, 'COMBAT_INFO');
        if (playerDefending) {
            addLog(`CLANG! Your defensive stance blocks the attack!`, 'SUCCESS');
        } else {
            addLog(`The ${enemy.name} swings wide!`, 'SUCCESS');
        }
    }
  };

  const endCombat = (victory: boolean, enemy: Enemy) => {
    setCombatState({ active: false, enemy: null });
    // Clear cooldowns on combat end? Optional. Let's keep them for realism or reset.
    // Resetting for vertical slice fun.
    setPlayer(p => ({ ...p, cooldowns: {} }));

    if (victory) {
        addLog(`SILENCE. ${enemy.name} falls dead.`, 'SUCCESS');
        addLog(`Experience Gained: ${enemy.xpValue} XP.`, 'LOOT');
        
        if (enemy.id === 'goblin_scout') {
            setCurrentNodeId('POST_FIGHT_1');
            addLog(STORY_NODES['POST_FIGHT_1'].text);
        }
        if (enemy.id === 'hobgoblin_boss') {
            setCurrentNodeId('ENDING_WIN');
            addLog(STORY_NODES['ENDING_WIN'].text);
        }
    }
  };

  const handlePlayerDeath = () => {
    setCombatState({ active: false, enemy: null });
    setCurrentNodeId('ENDING_DEATH');
    addLog(STORY_NODES['ENDING_DEATH'].text);
  };

  const restartGame = () => {
    setPlayer(INITIAL_PLAYER);
    setLogs([]);
    setCurrentNodeId('START');
    setCombatState({ active: false, enemy: null });
  };

  const currentNode = STORY_NODES[currentNodeId];

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen w-full bg-slate-950 overflow-hidden">
      <Sidebar player={player} />
      <div className="flex-1 flex flex-col h-full min-w-0">
        <GameLog logs={logs} />
        <ActionPanel 
            choices={currentNode.choices} 
            inCombat={combatState.active}
            enemy={combatState.enemy}
            player={player}
            onMakeChoice={handleChoice}
            onCombatAction={handleCombatAction}
            isDead={player.stats.currentHp <= 0}
            onRestart={restartGame}
        />
      </div>
    </div>
  );
}