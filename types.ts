// Character Stats
export interface Stats {
  str: number;
  dex: number;
  int: number;
  maxHp: number;
  currentHp: number;
  ac: number; // Armor Class
}

export type ClassName = 'Warrior' | 'Rogue' | 'Mage' | 'Novice';

export interface Item {
  id: string;
  name: string;
  type: 'WEAPON' | 'CONSUMABLE' | 'KEY';
  effectValue?: number; // Damage or Heal amount
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldownMax: number;
  damageDice: string; // e.g. "2d6"
  type: 'ATTACK' | 'MAGIC' | 'UTILITY';
}

export interface Player {
  name: string;
  className: ClassName;
  stats: Stats;
  xp: number;
  inventory: Item[];
  level: number;
  skills: Skill[];
  cooldowns: Record<string, number>; // skillId -> turns remaining
  isDefending: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  damageMin: number;
  damageMax: number;
  xpValue: number;
}

// Log System
export type LogType = 'NARRATIVE' | 'COMBAT_INFO' | 'COMBAT_HIT' | 'COMBAT_MISS' | 'HEAL' | 'LOOT' | 'DANGER' | 'SUCCESS' | 'SKILL';

export interface LogEntry {
  id: string;
  text: string;
  type: LogType;
}

// Story Engine
export interface Choice {
  text: string;
  nextId: string;
  reqStat?: 'str' | 'dex' | 'int';
  reqValue?: number;
  reqItem?: string; // Item ID required
  action?: 'INIT_COMBAT' | 'HEAL' | 'ADD_ITEM';
  actionValue?: string | number; // Enemy ID or Amount
}

export interface StoryNode {
  id: string;
  text: string;
  choices: Choice[];
  enemyId?: string; // If present, entering this node starts combat
  isEnd?: boolean;
}