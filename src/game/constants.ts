/**
 * Gully Rush: Mumbai Run - Game Constants & Character Data
 */

import { CharacterDef } from '../types/game';

export const LANES = [-2.2, 0, 2.2] as const;
export const LANE_WIDTH = 2.2;

export const GAME_CONFIG = {
  BASE_SPEED: 18.0,
  MAX_SPEED: 38.0,
  SPEED_INCREMENT: 0.35, // per 100 meters
  ACCELERATION_LERP: 10,
  
  JUMP_FORCE: 11.2,
  GRAVITY: -28.0,
  SLIDE_DURATION: 0.75, // seconds
  
  SEGMENT_LENGTH: 42,
  ACTIVE_SEGMENTS: 5, // 210 units ahead
  
  OBSTACLE_SPAWN_DIST_MIN: 16,
  OBSTACLE_SPAWN_DIST_MAX: 28,
  
  POWERUP_DURATION: 8.0, // 8 seconds default
  MAGNET_RADIUS: 9.0,
  
  COLLISION_RADIUS_PLAYER: 0.45,
  PLAYER_STAND_HEIGHT: 1.8,
  PLAYER_SLIDE_HEIGHT: 0.65,
};

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'kabir',
    name: 'Kabir',
    nick: 'The Gully Cricketer',
    role: 'Cricket Prodigy',
    bio: 'Legends say his straight-drive can smash any window in Shivaji Park. Swift, focused, and always ready for a super-six!',
    cost: 0,
    unlocked: true,
    perk: '+15% Jump Height & Hangtime',
    perkType: 'score_boost',
    perkValue: 1.15,
    skinColor: '#8d5524',
    shirtColor: '#2563eb', // Team India Royal Blue jersey #7
    pantsColor: '#f8fafc', // White cricket trousers
    accessoryColor: '#b45309', // Kashmir willow cricket bat
    accessoryName: 'Willow Bat',
  },
  {
    id: 'priya',
    name: 'Priya',
    nick: 'Dabbawala Express',
    role: 'Urban Legend Runner',
    bio: 'Never delivered a dabba late in 5 years. Navigates the tightest gullies with laser precision and lightning reflexes.',
    cost: 0,
    unlocked: true,
    perk: '+25% Coin Magnet Range',
    perkType: 'magnet_boost',
    perkValue: 1.25,
    skinColor: '#c68642',
    shirtColor: '#f97316', // Bright saffron kurti
    pantsColor: '#1e293b', // Dark track pants
    accessoryColor: '#94a3b8', // Stainless steel tiffin dabba stack
    accessoryName: 'Tiffin Dabba',
  },
  {
    id: 'raju',
    name: 'Raju Stuntman',
    nick: 'Bollywood Hero',
    role: 'Action Master',
    bio: 'Drives autos on two wheels and jumps off local trains for film shoots. High energy and pure cinema swag!',
    cost: 0,
    unlocked: true,
    perk: '+20% Extra Coins Collected',
    perkType: 'coin_bonus',
    perkValue: 1.2,
    skinColor: '#a96a38',
    shirtColor: '#dc2626', // Red leather biker jacket
    pantsColor: '#0f172a', // Black denim
    accessoryColor: '#eab308', // Chunky gold chain & aviators
    accessoryName: 'Gold Chain',
  },
  {
    id: 'zoya',
    name: 'Zoya',
    nick: 'Gully Beat Dancer',
    role: 'Hip-Hop Street Icon',
    bio: 'Dharavi street dancer whose breakdance slides dodge any barrier without breaking a sweat.',
    cost: 400,
    unlocked: false,
    perk: '+35% Slide Duration & Agility',
    perkType: 'nitro_boost',
    perkValue: 1.35,
    skinColor: '#6f4228',
    shirtColor: '#9333ea', // Neon purple oversized hoodie
    pantsColor: '#10b981', // Emerald cargo pants
    accessoryColor: '#ec4899', // Portable boombox
    accessoryName: 'Boombox',
  },
  {
    id: 'inspector_shinde',
    name: 'Inspector Shinde',
    nick: 'Singham of Dadar',
    role: 'Traffic Super-Cop',
    bio: 'When Shinde blows his whistle, even Mumbai traffic stops. Armed with his heavy baton and iron shield.',
    cost: 1000,
    unlocked: false,
    perk: 'Free Shield Protection on Run Start',
    perkType: 'shield_chance',
    perkValue: 1.0,
    skinColor: '#8d5524',
    shirtColor: '#ca8a04', // Khaki police uniform
    pantsColor: '#a16207', // Khaki trousers
    accessoryColor: '#451a03', // Police lathi & brass badge
    accessoryName: 'Police Lathi',
  },
];

export const INITIAL_MISSIONS = [
  {
    id: 'm1',
    title: 'Paisa Hi Paisa',
    description: 'Collect 100 Mumbai coins in runs',
    type: 'coins' as const,
    target: 100,
    current: 0,
    reward: 150,
    completed: false,
    claimed: false,
  },
  {
    id: 'm2',
    title: 'Gully Sprint',
    description: 'Reach a distance of 500 meters in a single run',
    type: 'distance' as const,
    target: 500,
    current: 0,
    reward: 200,
    completed: false,
    claimed: false,
  },
  {
    id: 'm3',
    title: 'Super Six Jumps',
    description: 'Jump over 8 road barriers',
    type: 'jump' as const,
    target: 8,
    current: 0,
    reward: 180,
    completed: false,
    claimed: false,
  },
  {
    id: 'm4',
    title: 'Limbo Master',
    description: 'Slide under 6 overhead scaffoldings',
    type: 'slide' as const,
    target: 6,
    current: 0,
    reward: 220,
    completed: false,
    claimed: false,
  },
  {
    id: 'm5',
    title: 'Power Masala',
    description: 'Collect 3 power-ups in any run',
    type: 'powerup' as const,
    target: 3,
    current: 0,
    reward: 250,
    completed: false,
    claimed: false,
  },
];
