/**
 * In-game Pause Modal for Gully Rush
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  soundEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  soundEnabled,
  onResume,
  onRestart,
  onHome,
  onToggleSound,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xs rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-heading text-white tracking-wide uppercase">
          GAME PAUSED
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5 mb-5">
          Catch your breath, runner!
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-heading text-xl tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-orange-950/30"
          >
            <Play className="w-5 h-5 fill-neutral-950" />
            <span>RESUME</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Run</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>Exit to Main Menu</span>
          </button>
        </div>

        {/* Audio Toggle */}
        <div className="w-full mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between px-2">
          <span className="text-xs text-neutral-400 font-semibold">Game Audio</span>
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-200 active:scale-95 transition-transform"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>
        </div>

        {/* Controls Quick Reminder */}
        <div className="w-full mt-3 p-2.5 rounded-xl bg-neutral-950/60 text-[11px] text-neutral-400 flex flex-col gap-1 text-left">
          <div className="font-bold text-neutral-300">Controls:</div>
          <div>• <strong>Swipe Left / Right:</strong> Change lane</div>
          <div>• <strong>Swipe Up:</strong> Jump over barricades</div>
          <div>• <strong>Swipe Down:</strong> Slide under scaffolding</div>
        </div>
      </div>
    </div>
  );
};
