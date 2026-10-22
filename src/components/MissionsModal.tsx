/**
 * Daily Missions & Score Milestones Modal
 */

import React, { useState } from 'react';
import { X, Check, Trophy, Award, Gift } from 'lucide-react';
import { Mission, UserSaveData } from '../types/game';
import { StorageManager } from '../utils/storage';
import { soundManager } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

interface MissionsModalProps {
  saveData: UserSaveData;
  onCoinsClaimed: (claimedAmount: number) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  saveData,
  onCoinsClaimed,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'milestones'>('daily');
  const [missions, setMissions] = useState<Mission[]>(saveData.missions);

  const handleClaim = (missionId: string) => {
    const reward = StorageManager.claimMission(missionId);
    if (reward > 0) {
      soundManager.playPowerup();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
      );
      onCoinsClaimed(reward);
    }
  };

  const milestones = [
    { title: 'Gully Novice', desc: 'Reach 200m in a single run', target: 200, reward: 100 },
    { title: 'Dadar Sprinter', desc: 'Reach 500m in a single run', target: 500, reward: 250 },
    { title: 'Marine Drive Champion', desc: 'Reach 1,500m in a single run', target: 1500, reward: 600 },
    { title: 'Kohinoor Gully Legend', desc: 'Reach 3,000m in a single run', target: 3000, reward: 1200 },
  ];

  return (
    <div className="absolute inset-0 z-40 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-heading text-white tracking-wide uppercase">
              REWARDS & MISSIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-3">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'daily'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Daily Tasks
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'milestones'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Milestones
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {activeTab === 'daily' ? (
            missions.map((m) => {
              const progressPct = Math.min(100, Math.floor((m.current / m.target) * 100));

              return (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{m.title}</h4>
                      <span className="text-xs font-extrabold text-amber-300">
                        ₹{m.reward}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{m.description}</p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400">
                        {m.current}/{m.target}
                      </span>
                    </div>
                  </div>

                  {/* Claim Button */}
                  {m.claimed ? (
                    <div className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-bold flex items-center gap-1 shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      Claimed
                    </div>
                  ) : m.completed ? (
                    <button
                      onClick={() => handleClaim(m.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs active:scale-95 transition-transform shrink-0 shadow-md shadow-emerald-950/30 flex items-center gap-1 animate-pulse"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      CLAIM
                    </button>
                  ) : (
                    <div className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs font-semibold shrink-0">
                      {progressPct}%
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            milestones.map((ms, idx) => {
              const achieved = saveData.bestDistance >= ms.target;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    achieved
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-neutral-950/70 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        achieved ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{ms.title}</h4>
                      <p className="text-[11px] text-neutral-400">{ms.desc}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-yellow-300">₹{ms.reward}</div>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        achieved ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      {achieved ? 'Unlocked' : `${saveData.bestDistance}/${ms.target}m`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
