/**
 * Gully Rush: Mumbai Run - Type Definitions
 */

export type PowerUpType = 'magnet' | 'shield' | 'boost' | 'multiplier';

export interface PowerUpActive {
  type: PowerUpType;
  duration: number;
  remaining: number;
}

export type ObstacleType = 
  | 'rickshaw'      // iconic auto-rickshaw blocking 1 lane
  | 'bus'           // huge BEST double-length bus blocking 1 lane
  | 'barrier_low'   // road police barricade (must jump over)
  | 'barrier_high'  // overhead construction scaffolding (must slide under)
  | 'stall'         // roadside chai / vada pav tapri stall
  | 'puddle';       // monsoon muddy water puddle (splashes & slows down)

export type LaneIndex = -1 | 0 | 1; // Left (-2.2), Center (0), Right (2.2)

export interface CharacterDef {
  id: string;
  name: string;
  nick: string;
  role: string;
  bio: string;
  cost: number;
  unlocked: boolean;
  perk: string;
  perkType: 'magnet_boost' | 'coin_bonus' | 'shield_chance' | 'score_boost' | 'nitro_boost';
  perkValue: number;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  accessoryColor: string;
  accessoryName: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'coins' | 'distance' | 'jump' | 'slide' | 'powerup' | 'dodge_rickshaw';
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export type ThemeMode = 'sunset' | 'monsoon';

export interface RunResults {
  score: number;
  distance: number;
  coins: number;
  isNewHigh: boolean;
  jumps: number;
  slides: number;
  powerupsCollected: number;
  obstaclesDodged: number;
}

export interface UserSaveData {
  highScore: number;
  bestDistance: number;
  totalCoins: number;
  selectedCharacterId: string;
  unlockedCharacters: string[];
  missions: Mission[];
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  theme: ThemeMode;
  runsCount: number;
}
