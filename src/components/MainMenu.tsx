/**
 * Main Menu Screen for Gully Rush: Mumbai Run
 */

import React from 'react';
import { Play, Users, Trophy, Settings, Volume2, VolumeX, CloudRain, Sun, Award } from 'lucide-react';
import { CharacterDef, ThemeMode, UserSaveData } from '../types/game';

interface MainMenuProps {
  saveData: UserSaveData;
  activeCharacter: CharacterDef;
  onPlay: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  activeCharacter,
  onPlay,
  onOpenShop,
  onOpenMissions,
  onOpenSettings,
  onToggleSound,
  onToggleTheme,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-neutral-950/70 via-transparent to-neutral-950/90 select-none z-30 pointer-events-auto">
      {/* Top Bar with Coins & Sound */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2">
        {/* Coins Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-amber-500/50 backdrop-blur-md shadow-lg">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold text-xs shadow">
            ₹
          </div>
          <span className="font-heading text-xl text-yellow-300 font-bold tracking-wide">
            {saveData.totalCoins.toLocaleString()}
          </span>
        </div>

        {/* Quick Toggles: Theme & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-md flex items-center justify-center text-neutral-200 active:scale-95 transition-transform"
            title={saveData.theme === 'sunset' ? 'Switch to Monsoon Drizzle' : 'Switch to Sunset'}
          >
            {saveData.theme === 'sunset' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <CloudRain className="w-5 h-5 text-sky-400" />
            )}
          </button>

          <button
            onClick={onToggleSound}
            className="w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-md flex items-center justify-center text-neutral-200 active:scale-95 transition-transform"
            title={saveData.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {saveData.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-amber-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-neutral-500" />
            )}
          </button>
        </div>
      </div>

      {/* Hero Center Branding */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-2">
        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-2">
          ★ Aamchi Mumbai Endless Runner ★
        </div>

        <h1 className="text-5xl sm:text-7xl font-heading tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-400 to-red-500 text-shadow-hero leading-tight">
          GULLY RUSH
        </h1>
        <div className="text-2xl sm:text-3xl font-display text-white tracking-widest uppercase -mt-1 font-bold">
          MUMBAI RUN
        </div>

        {/* Current High Score Pill */}
        <div className="flex items-center gap-4 mt-4 px-4 py-2 rounded-2xl bg-neutral-900/75 border border-neutral-800 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Best: <strong className="text-white text-sm">{saveData.highScore.toLocaleString()}</strong></span>
          </div>
          <div className="w-px h-4 bg-neutral-700" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
            <Award className="w-4 h-4 text-orange-400" />
            <span>Dist: <strong className="text-white text-sm">{saveData.bestDistance}m</strong></span>
          </div>
        </div>

        {/* Active Character Quick Card */}
        <div
          onClick={onOpenShop}
          className="mt-5 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-700/80 hover:border-amber-400/60 backdrop-blur-md cursor-pointer active:scale-98 transition-all shadow-lg group max-w-xs w-full"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow"
            style={{ backgroundColor: activeCharacter.shirtColor }}
          >
            {activeCharacter.name[0]}
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {activeCharacter.role}
            </div>
            <div className="text-sm font-extrabold text-white flex items-center justify-between">
              <span>{activeCharacter.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 group-hover:text-amber-300">
                Change ▾
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 truncate">
              {activeCharacter.perk}
            </div>
          </div>
        </div>

        {/* Big Action Play Button */}
        <button
          onClick={onPlay}
          className="mt-6 w-full max-w-xs py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-neutral-950 font-heading text-2xl tracking-wider shadow-2xl shadow-orange-600/40 border border-amber-300 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-7 h-7 fill-neutral-950" />
          <span>START RUN</span>
        </button>
      </div>

      {/* Bottom Menu Navigation Bar */}
      <div className="w-full max-w-md mx-auto grid grid-cols-3 gap-2.5 pb-2">
        <button
          onClick={onOpenShop}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-neutral-900/85 border border-neutral-800 hover:border-neutral-700 active:scale-95 transition-all text-neutral-200"
        >
          <Users className="w-5 h-5 text-amber-400 mb-0.5" />
          <span className="text-xs font-bold tracking-wide">Runners</span>
          <span className="text-[9px] text-neutral-400">Shop & Outfits</span>
        </button>

        <button
          onClick={onOpenMissions}
          className="relative flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-neutral-900/85 border border-neutral-800 hover:border-neutral-700 active:scale-95 transition-all text-neutral-200"
        >
          {saveData.missions.some((m) => m.completed && !m.claimed) && (
            <span className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          )}
          <Trophy className="w-5 h-5 text-yellow-400 mb-0.5" />
          <span className="text-xs font-bold tracking-wide">Missions</span>
          <span className="text-[9px] text-neutral-400">Daily Rewards</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-neutral-900/85 border border-neutral-800 hover:border-neutral-700 active:scale-95 transition-all text-neutral-200"
        >
          <Settings className="w-5 h-5 text-sky-400 mb-0.5" />
          <span className="text-xs font-bold tracking-wide">Settings</span>
          <span className="text-[9px] text-neutral-400">Audio & Guide</span>
        </button>
      </div>
    </div>
  );
};
