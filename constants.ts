import { StoryNode, Enemy, Item, Stats, Skill } from './types';

// --- Items ---
export const ITEMS: Record<string, Item> = {
  SWORD: { id: 'sword', name: 'Iron Broadsword', type: 'WEAPON', effectValue: 7, description: 'Heavy, chipped, and smelling of dried oil.' },
  DAGGER: { id: 'dagger', name: 'Obsidian Shank', type: 'WEAPON', effectValue: 5, description: 'Volcanic glass wrapped in rough leather.' },
  STAFF: { id: 'staff', name: 'Gnarlwood Staff', type: 'WEAPON', effectValue: 6, description: 'It hums with a low, headache-inducing vibration.' },
  POTION: { id: 'potion', name: 'Crimson Vial', type: 'CONSUMABLE', effectValue: 15, description: 'Thick, metallic-tasting lifeblood.' },
  AMULET: { id: 'amulet', name: 'Bone Totem', type: 'KEY', description: 'A finger bone tied with gut string.' },
  MAP: { id: 'map', name: 'Skin Map', type: 'KEY', description: 'Tattooed leather showing the descent to the Sunken Crypts.' }
};

// --- Skills ---
export const SKILLS: Record<string, Skill> = {
  HEROIC_STRIKE: { 
    id: 'heroic_strike', name: 'Heroic Slash', description: 'A massive swing. High Dmg.', cooldownMax: 3, damageDice: '10-18', type: 'ATTACK' 
  },
  SHADOW_SHIV: { 
    id: 'shadow_shiv', name: 'Shadow Shiv', description: 'Finds the gap in armor. Never Misses.', cooldownMax: 3, damageDice: '8-12', type: 'ATTACK' 
  },
  FIREBALL: { 
    id: 'fireball', name: 'Fireball', description: 'Incinerate the target. Ignores AC.', cooldownMax: 3, damageDice: '12-20', type: 'MAGIC' 
  }
};

// --- Starting Stats Presets ---
export const CLASS_PRESETS: Record<string, { stats: Stats; items: Item[]; skills: Skill[] }> = {
  Warrior: {
    stats: { str: 16, dex: 12, int: 8, maxHp: 35, currentHp: 35, ac: 15 },
    items: [ITEMS.SWORD, ITEMS.POTION],
    skills: [SKILLS.HEROIC_STRIKE]
  },
  Rogue: {
    stats: { str: 10, dex: 16, int: 12, maxHp: 28, currentHp: 28, ac: 14 },
    items: [ITEMS.DAGGER, ITEMS.POTION],
    skills: [SKILLS.SHADOW_SHIV]
  },
  Mage: {
    stats: { str: 8, dex: 12, int: 16, maxHp: 24, currentHp: 24, ac: 12 },
    items: [ITEMS.STAFF, ITEMS.POTION, ITEMS.POTION],
    skills: [SKILLS.FIREBALL]
  }
};

// --- Enemies ---
export const ENEMIES: Record<string, Enemy> = {
  GOBLIN_SCOUT: {
    id: 'goblin_scout', name: 'Tunnel Skulker', hp: 12, maxHp: 12, ac: 9, damageMin: 2, damageMax: 4, xpValue: 25
  },
  HOBGOBLIN_BOSS: {
    id: 'hobgoblin_boss', name: 'Warlord Krug', hp: 45, maxHp: 45, ac: 13, damageMin: 5, damageMax: 9, xpValue: 100
  }
};

// --- The Mines of Korth Campaign (Redux) ---
export const STORY_NODES: Record<string, StoryNode> = {
  // Character Creation / Intro
  START: {
    id: 'START',
    text: "Three days ago, Silas left you for dead in the gutters of the capital, stealing the location of the Sunken Crypts from your pocket.\n\nHe seeks the artifact hidden below. You seek him.\n\nYou stand before the Mines of Korth. The rain washes the blood from your bandages. It's time to choose how you will exact your revenge.",
    choices: [
      { text: "I am a Warrior. I will break him like a twig.", nextId: 'ENTRANCE', action: 'ADD_ITEM', actionValue: 'Warrior' },
      { text: "I am a Rogue. I will return the favor, knife first.", nextId: 'ENTRANCE', action: 'ADD_ITEM', actionValue: 'Rogue' },
      { text: "I am a Mage. He will burn for his treachery.", nextId: 'ENTRANCE', action: 'ADD_ITEM', actionValue: 'Mage' }
    ]
  },
  ENTRANCE: {
    id: 'ENTRANCE',
    text: "The mine entrance is barred by a heavy iron door. You see scratches around the keyhole—Silas was here. He picked the lock, entered, and then jammed the mechanism to slow you down. Typical.\n\nA narrow, muddy ventilation tunnel winds off to the left. It smells of wet fur.",
    choices: [
      { text: "Take the mud tunnel. Avoid the door entirely.", nextId: 'AMBUSH' },
      { text: "Kick the door down. Subtlety is dead. (Str 12+)", nextId: 'DOOR_SMASHED', reqStat: 'str', reqValue: 12 },
      { text: "Read the warning runes etched on the iron. (Int 12+)", nextId: 'DOOR_READ', reqStat: 'int', reqValue: 12 },
      { text: "Fix the jammed lock. You're better than him. (Dex 12+)", nextId: 'DOOR_PICKED', reqStat: 'dex', reqValue: 12 }
    ]
  },
  
  // --- Branching Door Outcomes ---
  DOOR_SMASHED: {
    id: 'DOOR_SMASHED',
    text: "CRASH! You channel your anger into a single kick. The rusted hinges scream and give way, the heavy door slamming into the stone floor. \n\nThe noise echoes deep into the mine. If anything was sleeping, it's awake now. But you feel powerful.",
    choices: [
      { text: "Step over the wreckage into the Armory.", nextId: 'OLD_ARMORY' }
    ]
  },
  DOOR_READ: {
    id: 'DOOR_READ',
    text: "You trace the faint glowing runes. They aren't just warnings; they are instructions for the 'Warden'.\n\n\"Krug wears the skin of the mountain. Strike the scar on his left shoulder.\"\n\nUseful information. Silas likely couldn't read this.",
    choices: [
      { text: "Store this knowledge and enter.", nextId: 'OLD_ARMORY' }
    ]
  },
  DOOR_PICKED: {
    id: 'DOOR_PICKED',
    text: "You inspect Silas's handiwork. Amateur. He jammed a copper pin into the tumbler. With surgical precision, you extract the pin and tease the lock open.\n\nClick. The door swings silent as a tomb. You've cleared his trap.",
    choices: [
      { text: "Slip inside unnoticed.", nextId: 'OLD_ARMORY' }
    ]
  },

  // Path A: The Mud Tunnel (Ambush)
  AMBUSH: {
    id: 'AMBUSH',
    text: "You squeeze through the tight tunnel. It's darker here. You realize too late why Silas avoided this route.\n\nA pair of yellow eyes blink in the darkness above you. A Tunnel Skulker hisses, \"Fresh meat!\"",
    enemyId: 'GOBLIN_SCOUT',
    choices: [
      { text: "Defend yourself!", nextId: 'POST_FIGHT_1' }
    ]
  },
  POST_FIGHT_1: {
    id: 'POST_FIGHT_1',
    text: "The goblin creates a gurgling sound as it expires. You kick the body aside. On its neck, you find a 'Bone Totem'.\n\nThis must be how the goblins bypass the traps further in.",
    choices: [
      { text: "Take the totem and crawl out of the tunnel.", nextId: 'REST_SITE', action: 'ADD_ITEM', actionValue: 'AMULET' }
    ]
  },

  // Path B: The Armory
  OLD_ARMORY: {
    id: 'OLD_ARMORY',
    text: "You enter a dusty room lined with empty weapon racks. The air is still.\n\nIn the corner, you find a satchel with the initials 'S.V.'—Silas Vane. He must have dropped it in his haste. Inside is a healing potion he left behind.",
    choices: [
      { text: "Steal his potion. He won't need it.", nextId: 'REST_SITE', action: 'HEAL', actionValue: 15 } // Buffed heal for taking the "smart" route
    ]
  },

  // Convergence: The Confrontation
  REST_SITE: {
    id: 'REST_SITE',
    text: "You emerge into a massive central cavern. A roaring bonfire lights the room.\n\nIn the center stands Warlord Krug, a towering Hobgoblin viewing a map made of stitched skin. \n\nAnd there, sneaking behind a crate, is Silas. He looks up and locks eyes with you. His face goes pale.\n\n\"You?!\" Silas squeaks. \"I—I can explain!\"\n\nKrug spins around at the sound.",
    choices: [
      { text: "Point at Silas. \"HE HAS THE GOLD!\"", nextId: 'BOSS_FIGHT_BETRAYAL' }, 
      { text: "Ignore Silas. Charge Krug while he's distracted.", nextId: 'BOSS_SNEAK_ATTACK' },
      { text: "Step into the light. \"I'm here for the traitor.\"", nextId: 'BOSS_FIGHT_HONOR' },
    ]
  },

  // Boss Variants
  BOSS_FIGHT_BETRAYAL: {
    id: 'BOSS_FIGHT_BETRAYAL',
    text: "Krug roars and backhands Silas into a wall. The thief slumps, unconscious.\n\n\"Small rat breaks. You break next?\" Krug turns to you, hefting his greataxe.",
    enemyId: 'HOBGOBLIN_BOSS',
    choices: [
      { text: "Draw your weapon. \"Try it.\"", nextId: 'ENDING_WIN' }
    ]
  },
  BOSS_SNEAK_ATTACK: {
    id: 'BOSS_SNEAK_ATTACK',
    text: "While Krug is confused by Silas's presence, you lunge. You catch the Warlord off guard!",
    choices: [
      { text: "Strike with advantage!", nextId: 'BOSS_FIGHT_HONOR', action: 'ADD_ITEM', actionValue: 'SNEAK_BONUS' }
    ]
  },
  BOSS_FIGHT_HONOR: {
    id: 'BOSS_FIGHT_HONOR',
    text: "Krug laughs, a deep grinding sound. \"Two rats? I will crush you both into paste.\"\n\nSilas scrambles away into the shadows. \"Good luck, partner!\" he yells sarcastically.",
    enemyId: 'HOBGOBLIN_BOSS',
    choices: [
      { text: "Face the Warlord alone.", nextId: 'ENDING_WIN' }
    ]
  },
  NEGOTIATION: {
    id: 'NEGOTIATION',
    text: "(This path is no longer available. You came for revenge, not to talk.)",
     choices: [
      { text: "Return to the fight.", nextId: 'BOSS_FIGHT_HONOR' }
    ]
  },

  // Endings
  ENDING_WIN: {
    id: 'ENDING_WIN',
    text: "Krug falls, the ground shaking with his death. \n\nYou look around for Silas, but the coward is gone. However, he left something behind in his panic: The Skin Map.\n\nYou pick it up. It doesn't show a way out. It shows a way *down*.",
    choices: [
      { text: "Follow the map deeper.", nextId: 'CRYPT_DISCOVERY', action: 'ADD_ITEM', actionValue: 'MAP' }
    ],
  },
  ENDING_PEACE: {
    id: 'ENDING_PEACE',
    text: "Legacy Node - Unreachable in this revenge arc.",
    choices: []
  },
  CRYPT_DISCOVERY: {
    id: 'CRYPT_DISCOVERY',
    text: "You activate a mechanism behind Krug's throne. Stone grinds on stone, revealing a spiral staircase descending into a bioluminescent blue fog.\n\nYou hear a nervous laugh from the darkness below. Silas.\n\nHe didn't flee. He went deeper.",
    choices: [
      { text: "Descend into the Sunken Crypts. The hunt continues.", nextId: 'CLIFFHANGER' }
    ]
  },
  CLIFFHANGER: {
    id: 'CLIFFHANGER',
    text: "The air grows cold. Ancient magic hums in your bones. You have cleared the Mines, but your vengeance is not yet complete.\n\nTO BE CONTINUED IN CHAPTER 2: THE SUNKEN CRYPTS...",
    choices: [],
    isEnd: true
  },
  ENDING_DEATH: {
    id: 'ENDING_DEATH',
    text: "You fall to your knees. Your vision blurs.\n\nThe last thing you see is Silas stepping over your body. He tuts softly. \"Always were too stubborn for your own good. Thanks for softening him up for me.\"",
    choices: [],
    isEnd: true
  }
};