/**
 * LocalStorage Progression Manager for Gully Rush
 */

import { Mission, RunResults, UserSaveData } from '../types/game';
import { INITIAL_MISSIONS } from '../game/constants';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'gully_rush_save_v1';

const DEFAULT_SAVE: UserSaveData = {
  highScore: 0,
  bestDistance: 0,
  totalCoins: 250, // Starter bonus coins!
  selectedCharacterId: 'kabir',
  unlockedCharacters: ['kabir', 'priya', 'raju'], // 3 initially available characters
  missions: INITIAL_MISSIONS,
  soundEnabled: true,
  musicEnabled: true,
  hapticEnabled: true,
  theme: 'sunset',
  runsCount: 0,
};

export class StorageManager {
  public static load(): UserSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SAVE,
        ...parsed,
        // Ensure missions array stays intact if updated
        missions: parsed.missions && parsed.missions.length ? parsed.missions : INITIAL_MISSIONS,
      };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  public static save(data: UserSaveData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public static processRunResults(results: RunResults): {
    updatedData: UserSaveData;
    isNewHighScore: boolean;
    isNewBestDistance: boolean;
    completedMissions: Mission[];
  } {
    const data = this.load();
    let isNewHighScore = false;
    let isNewBestDistance = false;

    if (results.score > data.highScore) {
      data.highScore = results.score;
      isNewHighScore = true;
      // Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#f97316', '#22c55e', '#3b82f6'],
      });
    }

    if (results.distance > data.bestDistance) {
      data.bestDistance = results.distance;
      isNewBestDistance = true;
    }

    data.totalCoins += results.coins;
    data.runsCount += 1;

    // Evaluate missions
    const newlyCompletedMissions: Mission[] = [];
    data.missions = data.missions.map((m) => {
      if (m.completed) return m;

      let progress = m.current;
      if (m.type === 'coins') progress += results.coins;
      if (m.type === 'distance') progress = Math.max(progress, results.distance);
      if (m.type === 'jump') progress += results.jumps;
      if (m.type === 'slide') progress += results.slides;
      if (m.type === 'powerup') progress += results.powerupsCollected;

      const completed = progress >= m.target;
      if (completed && !m.completed) {
        newlyCompletedMissions.push({ ...m, current: progress, completed: true });
      }

      return {
        ...m,
        current: progress,
        completed,
      };
    });

    this.save(data);
    return {
      updatedData: data,
      isNewHighScore,
      isNewBestDistance,
      completedMissions: newlyCompletedMissions,
    };
  }

  public static unlockCharacter(charId: string, cost: number): boolean {
    const data = this.load();
    if (data.totalCoins >= cost && !data.unlockedCharacters.includes(charId)) {
      data.totalCoins -= cost;
      data.unlockedCharacters.push(charId);
      data.selectedCharacterId = charId;
      this.save(data);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#eab308', '#ec4899', '#8b5cf6'],
      });

      return true;
    }
    return false;
  }

  public static claimMission(missionId: string): number {
    const data = this.load();
    const mission = data.missions.find((m) => m.id === missionId);
    if (mission && mission.completed && !mission.claimed) {
      mission.claimed = true;
      data.totalCoins += mission.reward;
      this.save(data);
      return mission.reward;
    }
    return 0;
  }
}
