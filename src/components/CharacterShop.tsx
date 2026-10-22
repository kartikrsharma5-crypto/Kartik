/**
 * Character Shop & Wardrobe Modal for Gully Rush
 */

import React, { useState } from 'react';
import { X, Check, Lock, Zap, Shield, Sparkles, Magnet } from 'lucide-react';
import { CharacterDef } from '../types/game';
import { CHARACTERS } from '../game/constants';
import { StorageManager } from '../utils/storage';
import { soundManager } from '../audio/SoundManager';

interface CharacterShopProps {
  totalCoins: number;
  unlockedCharacters: string[];
  selectedCharacterId: string;
  onSelectCharacter: (charId: string) => void;
  onCoinsUpdated: (newCoins: number) => void;
  onClose: () => void;
}

export const CharacterShop: React.FC<CharacterShopProps> = ({
  totalCoins,
  unlockedCharacters,
  selectedCharacterId,
  onSelectCharacter,
  onCoinsUpdated,
  onClose,
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(() => {
    const idx = CHARACTERS.findIndex((c) => c.id === selectedCharacterId);
    return idx >= 0 ? idx : 0;
  });

  const currentChar = CHARACTERS[activeIdx];
  const isUnlocked = unlockedCharacters.includes(currentChar.id);
  const isSelected = selectedCharacterId === currentChar.id;
  const canAfford = totalCoins >= currentChar.cost;

  const handleUnlock = () => {
    if (!isUnlocked && canAfford) {
      const success = StorageManager.unlockCharacter(currentChar.id, currentChar.cost);
      if (success) {
        soundManager.playPowerup();
        onCoinsUpdated(totalCoins - currentChar.cost);
        onSelectCharacter(currentChar.id);
      }
    }
  };

  const handleSelect = () => {
    if (isUnlocked) {
      soundManager.playCoin();
      onSelectCharacter(currentChar.id);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-neutral-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading text-white tracking-wide uppercase">
            DESI RUNNERS
          </h2>
          <p className="text-xs text-neutral-400">Choose your gully legend & special perks</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Coin Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-neutral-900 border border-amber-500/50">
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-neutral-950 font-bold text-[10px]">
              ₹
            </div>
            <span className="font-heading text-lg text-yellow-300 font-bold">
              {totalCoins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Character Showcase Card */}
      <div className="my-auto w-full max-w-lg mx-auto flex flex-col items-center py-2">
        {/* Character Visual Avatar & Stage */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-950 border border-neutral-700/80 flex flex-col items-center justify-center shadow-2xl p-4 overflow-hidden group">
          {/* Subtle Radial Glow */}
          <div
            className="absolute inset-0 opacity-25 rounded-3xl filter blur-xl"
            style={{ backgroundColor: currentChar.shirtColor }}
          />

          {/* Stylized Humanoid Icon Representation */}
          <div className="relative flex flex-col items-center z-10 scale-110">
            {/* Head */}
            <div
              className="w-14 h-14 rounded-full border-2 border-neutral-800 shadow-md relative"
              style={{ backgroundColor: currentChar.skinColor }}
            >
              {/* Hair/Cap top accent */}
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-6 rounded-t-full"
                style={{ backgroundColor: currentChar.id === 'kabir' ? '#1d4ed8' : currentChar.id === 'inspector_shinde' ? '#78350f' : '#1c1917' }}
              />
            </div>

            {/* Torso */}
            <div
              className="w-20 h-16 rounded-xl mt-1.5 shadow-md flex items-center justify-center text-white font-extrabold text-sm border border-black/20"
              style={{ backgroundColor: currentChar.shirtColor }}
            >
              {currentChar.id === 'kabir' ? '🏏 #7' : currentChar.id === 'priya' ? '🍱' : currentChar.id === 'inspector_shinde' ? '👮' : currentChar.id === 'raju' ? '🕶️' : '🎧'}
            </div>

            {/* Legs */}
            <div className="flex gap-2.5 mt-1">
              <div
                className="w-4 h-12 rounded-b-md"
                style={{ backgroundColor: currentChar.pantsColor }}
              />
              <div
                className="w-4 h-12 rounded-b-md"
                style={{ backgroundColor: currentChar.pantsColor }}
              />
            </div>
          </div>

          {/* Locked Overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-neutral-300 z-20">
              <Lock className="w-8 h-8 text-amber-400 mb-1" />
              <span className="text-xs font-bold tracking-wider uppercase">LOCKED</span>
              <span className="text-sm font-heading text-yellow-300 mt-1">₹{currentChar.cost} Coins</span>
            </div>
          )}

          {/* Active Badge */}
          {isSelected && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-neutral-950 text-[10px] font-extrabold tracking-wider uppercase z-20 flex items-center gap-1 shadow">
              <Check className="w-3 h-3 stroke-[3]" />
              ACTIVE
            </div>
          )}
        </div>

        {/* Character Title & Bio */}
        <div className="text-center mt-3 max-w-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {currentChar.role}
          </div>
          <h3 className="text-2xl font-heading text-white tracking-wide uppercase">
            {currentChar.name}
          </h3>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed px-2">
            "{currentChar.bio}"
          </p>
        </div>

        {/* Perk Badge */}
        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          {currentChar.perkType === 'magnet_boost' ? (
            <Magnet className="w-4 h-4 text-rose-400" />
          ) : currentChar.perkType === 'shield_chance' ? (
            <Shield className="w-4 h-4 text-blue-400" />
          ) : currentChar.perkType === 'nitro_boost' ? (
            <Zap className="w-4 h-4 text-orange-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400" />
          )}
          <span>Perk: {currentChar.perk}</span>
        </div>

        {/* Primary Action Button (Select or Unlock) */}
        <div className="mt-4 w-full max-w-xs">
          {isUnlocked ? (
            <button
              onClick={handleSelect}
              disabled={isSelected}
              className={`w-full py-3 px-4 rounded-xl font-heading text-lg tracking-wide flex items-center justify-center gap-2 transition-all ${
                isSelected
                  ? 'bg-neutral-800 text-neutral-400 cursor-default'
                  : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-950/30'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>SELECTED</span>
                </>
              ) : (
                <span>EQUIP RUNNER</span>
              )}
            </button>
          ) : (
            <button
              onClick={handleUnlock}
              disabled={!canAfford}
              className={`w-full py-3 px-4 rounded-xl font-heading text-lg tracking-wide flex items-center justify-center gap-2 transition-all ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 hover:brightness-105 active:scale-95 shadow-lg shadow-yellow-950/40'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>UNLOCK FOR ₹{currentChar.cost}</span>
            </button>
          )}
        </div>
      </div>

      {/* Character Selector Thumbnails (Horizontal Row) */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 pt-2">
        {CHARACTERS.map((char, idx) => {
          const unlocked = unlockedCharacters.includes(char.id);
          const active = activeIdx === idx;
          const selected = selectedCharacterId === char.id;

          return (
            <button
              key={char.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all ${
                active
                  ? 'bg-neutral-800 border-amber-400 scale-105 shadow-md'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Mini avatar circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow"
                style={{ backgroundColor: char.shirtColor }}
              >
                {char.name[0]}
              </div>

              <span className="text-[10px] font-bold text-neutral-200 mt-1 truncate max-w-[50px]">
                {char.name}
              </span>

              {/* Status indicators */}
              {!unlocked && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                  <Lock className="w-2 h-2 text-amber-400" />
                </div>
              )}
              {selected && (
                <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-2 h-2 text-neutral-950 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
