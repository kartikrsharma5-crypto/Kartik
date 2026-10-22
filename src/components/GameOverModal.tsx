/**
 * Results / Game Over Modal for Gully Rush
 */

import React from 'react';
import { RotateCcw, Home, ShoppingBag, Trophy, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { Mission, RunResults } from '../types/game';

interface GameOverModalProps {
  results: RunResults;
  isNewHigh: boolean;
  totalCoins: number;
  completedMissions: Mission[];
  onRestart: () => void;
  onHome: () => void;
  onShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  results,
  isNewHigh,
  totalCoins,
  completedMissions,
  onRestart,
  onHome,
  onShop,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Header Badge */}
        {isNewHigh ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            ★ NEW HIGH SCORE! ★
          </div>
        ) : (
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">
            RUN FINISHED
          </div>
        )}

        <h2 className="text-3xl font-heading text-white tracking-wide uppercase">
          GULLY CRASH!
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Dodged Mumbai traffic like a champion.
        </p>

        {/* Primary Score Board */}
        <div className="w-full my-4 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col items-center">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            TOTAL SCORE
          </span>
          <span className="text-4xl sm:text-5xl font-heading text-amber-300 text-shadow-gold my-1 tracking-wider">
            {results.score.toLocaleString()}
          </span>

          <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-neutral-800/80 text-left">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-400 font-bold uppercase">Distance</div>
                <div className="text-sm font-extrabold text-neutral-100">{results.distance} m</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-neutral-950 font-bold text-[10px] shadow shrink-0">
                ₹
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 font-bold uppercase">Coins Won</div>
                <div className="text-sm font-extrabold text-yellow-300">+{results.coins}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Missions Toast */}
        {completedMissions.length > 0 && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-left flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-emerald-300 font-bold block">
                Mission Completed!
              </strong>
              <span className="text-neutral-300">
                {completedMissions[0].title} (+₹{completedMissions[0].reward})
              </span>
            </div>
          </div>
        )}

        {/* Run Detailed Stats Row */}
        <div className="w-full flex justify-between px-2 text-[11px] text-neutral-400 mb-4">
          <span>Jumps: <strong className="text-neutral-200">{results.jumps}</strong></span>
          <span>Slides: <strong className="text-neutral-200">{results.slides}</strong></span>
          <span>Dodges: <strong className="text-neutral-200">{results.obstaclesDodged}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-heading text-xl tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-orange-950/30"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>RUN AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onShop}
              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Characters</span>
            </button>

            <button
              onClick={onHome}
              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
