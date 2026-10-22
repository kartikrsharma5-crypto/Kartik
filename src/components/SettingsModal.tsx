/**
 * Settings & How to Play Modal for Gully Rush
 */

import React from 'react';
import { X, Volume2, VolumeX, Music, Sun, CloudRain, HelpCircle } from 'lucide-react';
import { ThemeMode, UserSaveData } from '../types/game';

interface SettingsModalProps {
  saveData: UserSaveData;
  onUpdateSave: (newSave: Partial<UserSaveData>) => void;
  onThemeChanged: (theme: ThemeMode) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSave,
  onThemeChanged,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h2 className="text-2xl font-heading text-white tracking-wide uppercase">
            SETTINGS & GUIDE
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-left text-xs">
          {/* Audio Section */}
          <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
            <h4 className="font-bold text-neutral-300 uppercase tracking-wider mb-2.5 text-[11px]">
              Audio & Beats
            </h4>

            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Sound FX (Coins, Jumps, Crashes)</span>
              </div>
              <button
                onClick={() => onUpdateSave({ soundEnabled: !saveData.soundEnabled })}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                  saveData.soundEnabled ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    saveData.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-1.5 border-t border-neutral-800/80 mt-1.5">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <Music className="w-4 h-4 text-orange-400" />
                <span>Mumbai Dhol Beat Synth</span>
              </div>
              <button
                onClick={() => onUpdateSave({ musicEnabled: !saveData.musicEnabled })}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                  saveData.musicEnabled ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    saveData.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Theme Section */}
          <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
            <h4 className="font-bold text-neutral-300 uppercase tracking-wider mb-2.5 text-[11px]">
              Mumbai Environment Theme
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onThemeChanged('sunset')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  saveData.theme === 'sunset'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="text-xs">Marine Sunset</span>
                <span className="text-[10px] text-neutral-500">Golden hour glow</span>
              </button>

              <button
                onClick={() => onThemeChanged('monsoon')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  saveData.theme === 'monsoon'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <CloudRain className="w-5 h-5 text-sky-400" />
                <span className="text-xs">Monsoon Rain</span>
                <span className="text-[10px] text-neutral-500">Drizzle & puddles</span>
              </button>
            </div>
          </div>

          {/* How to Play Guide */}
          <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
            <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              How to Play & Obstacles
            </h4>

            <div className="space-y-1.5 text-neutral-300 text-[11px] leading-relaxed">
              <div>
                🛺 <strong className="text-amber-300">Auto-Rickshaws & BEST Buses:</strong> Steer left or right to avoid full-on traffic collisions.
              </div>
              <div>
                🚧 <strong className="text-yellow-300">Police Barricades:</strong> Low road barricades—SWIPE UP or press SPACE/UP to jump over!
              </div>
              <div>
                🏗️ <strong className="text-orange-300">Bamboo Scaffolding:</strong> High overhead beams—SWIPE DOWN or press DOWN to slide under!
              </div>
              <div>
                🪙 <strong className="text-yellow-400">Rupee Coins:</strong> Collect golden coins to unlock new characters and outfits in the shop.
              </div>
              <div>
                ⚡ <strong className="text-emerald-400">Power-Ups:</strong> Grab Magnets to pull coins, Shields to absorb crashes, and Nitro Boosts to smash obstacles!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
