/**
 * In-game Mobile-Optimized Heads Up Display (HUD)
 */

import React from 'react';
import { Pause, Zap, Shield, Magnet, Sparkles, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { PowerUpActive } from '../types/game';

interface GameHUDProps {
  score: number;
  distance: number;
  coins: number;
  powerups: PowerUpActive[];
  onPause: () => void;
  onJump: () => void;
  onSlide: () => void;
  onLeft: () => void;
  onRight: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  distance,
  coins,
  powerups,
  onPause,
  onJump,
  onSlide,
  onLeft,
  onRight,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-xl mx-auto pointer-events-auto">
        {/* Pause Button */}
        <button
          onClick={onPause}
          className="w-11 h-11 rounded-2xl bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg hover:bg-neutral-800"
          aria-label="Pause"
        >
          <Pause className="w-5 h-5 fill-current" />
        </button>

        {/* Center Score & Meters */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-heading tracking-wider text-amber-300 text-shadow-gold">
            {score.toLocaleString()}
          </div>
          <div className="px-3 py-0.5 rounded-full bg-neutral-900/70 border border-neutral-800 text-xs font-semibold text-neutral-300 tracking-wide font-body">
            {distance} <span className="text-amber-400">m</span>
          </div>
        </div>

        {/* Right Coins Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-neutral-900/80 border border-amber-500/40 backdrop-blur-md shadow-lg shadow-amber-950/20">
          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-neutral-950 font-bold text-xs shadow-inner">
            ₹
          </div>
          <span className="font-heading text-lg sm:text-xl text-yellow-300 font-bold tracking-wide">
            {coins}
          </span>
        </div>
      </div>

      {/* Active Power-up Timers Tray */}
      {powerups.length > 0 && (
        <div className="flex flex-col gap-2 items-center pointer-events-auto max-w-xs mx-auto">
          {powerups.map((p) => {
            const percent = Math.max(0, Math.min(100, (p.remaining / p.duration) * 100));
            const icon =
              p.type === 'magnet' ? (
                <Magnet className="w-4 h-4 text-rose-400" />
              ) : p.type === 'shield' ? (
                <Shield className="w-4 h-4 text-blue-400" />
              ) : p.type === 'boost' ? (
                <Zap className="w-4 h-4 text-orange-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              );

            const label =
              p.type === 'magnet'
                ? 'COIN MAGNET'
                : p.type === 'shield'
                ? 'SURAKSHA SHIELD'
                : p.type === 'boost'
                ? 'NITRO SPRINT'
                : '2X PAISA';

            return (
              <div
                key={p.type}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-950/85 border border-neutral-700/70 backdrop-blur-md shadow-md w-44"
              >
                {icon}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between text-[10px] font-bold tracking-wider text-neutral-200">
                    <span>{label}</span>
                    <span>{p.remaining.toFixed(1)}s</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-100 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Mobile On-Screen Action Controls (For touchscreen ease & accessibility) */}
      <div className="w-full max-w-md mx-auto flex items-end justify-between px-2 pb-2 pointer-events-auto">
        {/* Left / Right Lane Steer buttons */}
        <div className="flex gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onLeft();
            }}
            className="w-14 h-14 rounded-2xl bg-neutral-900/80 border border-neutral-700/60 active:scale-90 active:bg-amber-500/20 text-neutral-100 flex items-center justify-center backdrop-blur-md shadow-xl transition-transform"
            aria-label="Steer Left"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onRight();
            }}
            className="w-14 h-14 rounded-2xl bg-neutral-900/80 border border-neutral-700/60 active:scale-90 active:bg-amber-500/20 text-neutral-100 flex items-center justify-center backdrop-blur-md shadow-xl transition-transform"
            aria-label="Steer Right"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Jump / Slide Action buttons */}
        <div className="flex gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onSlide();
            }}
            className="w-14 h-14 rounded-2xl bg-neutral-900/80 border border-neutral-700/60 active:scale-90 active:bg-amber-500/20 text-neutral-100 flex flex-col items-center justify-center backdrop-blur-md shadow-xl transition-transform"
            aria-label="Slide Down"
          >
            <ArrowDown className="w-6 h-6 text-amber-400" />
            <span className="text-[9px] font-bold tracking-tight text-neutral-400">SLIDE</span>
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onJump();
            }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 border border-amber-400/80 active:scale-90 text-neutral-950 font-bold flex flex-col items-center justify-center shadow-lg shadow-orange-950/40 transition-transform"
            aria-label="Jump Up"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
            <span className="text-[9px] font-extrabold tracking-tight">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
