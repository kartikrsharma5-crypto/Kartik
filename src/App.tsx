/**
 * Gully Rush: Mumbai Run
 * Main Application Root
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { CharacterShop } from './components/CharacterShop';
import { MissionsModal } from './components/MissionsModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { CHARACTERS } from './game/constants';
import {
  CharacterDef,
  Mission,
  PowerUpActive,
  RunResults,
  ThemeMode,
  UserSaveData,
} from './types/game';
import { StorageManager } from './utils/storage';
import { soundManager } from './audio/SoundManager';

type GameState = 'menu' | 'playing' | 'gameover';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App & Game State
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [saveData, setSaveData] = useState<UserSaveData>(() => StorageManager.load());

  // In-Game Real-Time HUD Metrics
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [currentCoins, setCurrentCoins] = useState<number>(0);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpActive[]>([]);

  // Modals
  const [shopOpen, setShopOpen] = useState<boolean>(false);
  const [missionsOpen, setMissionsOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Run Results for GameOverModal
  const [lastResults, setLastResults] = useState<RunResults | null>(null);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [recentlyCompletedMissions, setRecentlyCompletedMissions] = useState<Mission[]>([]);

  // Active Character definition
  const activeChar: CharacterDef =
    CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || CHARACTERS[0];

  // Sync sound settings with sound manager
  useEffect(() => {
    soundManager.setSoundEnabled(saveData.soundEnabled);
    soundManager.setMusicEnabled(saveData.musicEnabled);
  }, [saveData.soundEnabled, saveData.musicEnabled]);

  // Handle Game Over callback from Engine
  const handleGameOverCallback = useCallback((results: RunResults) => {
    const { updatedData, isNewHighScore, completedMissions } =
      StorageManager.processRunResults(results);

    setSaveData(updatedData);
    setLastResults(results);
    setIsNewHigh(isNewHighScore);
    setRecentlyCompletedMissions(completedMissions);
    setGameState('gameover');
  }, []);

  // Initialize Three.js Game Engine once in dedicated container
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      saveData.selectedCharacterId,
      saveData.theme,
      {
        onScoreUpdate: (s, d, c) => {
          setCurrentScore(s);
          setCurrentDistance(d);
          setCurrentCoins(c);
        },
        onPowerUpUpdate: (powerups) => {
          setActivePowerUps(powerups);
        },
        onGameOver: (results) => {
          handleGameOverCallback(results);
        },
      }
    );

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleGameOverCallback]);

  // Start a fresh Run
  const handleStartRun = () => {
    if (!engineRef.current) return;
    setGameState('playing');
    setIsPaused(false);
    setCurrentScore(0);
    setCurrentDistance(0);
    setCurrentCoins(0);
    setActivePowerUps([]);

    // Configure engine with current character and theme
    engineRef.current.setCharacter(saveData.selectedCharacterId);
    engineRef.current.setTheme(saveData.theme);
    engineRef.current.start();
  };

  // Pause / Resume
  const handleTogglePause = () => {
    if (!engineRef.current || gameState !== 'playing') return;
    const paused = engineRef.current.togglePause();
    setIsPaused(paused);
  };

  const handleResume = () => {
    if (!engineRef.current || gameState !== 'playing') return;
    engineRef.current.togglePause();
    setIsPaused(false);
  };

  // Restart directly from pause or game over
  const handleRestart = () => {
    if (!engineRef.current) return;
    setIsPaused(false);
    setGameState('playing');
    setCurrentScore(0);
    setCurrentDistance(0);
    setCurrentCoins(0);
    setActivePowerUps([]);
    engineRef.current.start();
  };

  // Return to main menu
  const handleReturnHome = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsPaused(false);
    setGameState('menu');
  };

  // Sound toggle helper
  const handleToggleSound = () => {
    const nextVal = !saveData.soundEnabled;
    const updated = {
      ...saveData,
      soundEnabled: nextVal,
      musicEnabled: nextVal,
    };
    setSaveData(updated);
    StorageManager.save(updated);
  };

  // Theme toggle helper (Sunset <-> Monsoon)
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = saveData.theme === 'sunset' ? 'monsoon' : 'sunset';
    const updated = { ...saveData, theme: nextTheme };
    setSaveData(updated);
    StorageManager.save(updated);
    if (engineRef.current) {
      engineRef.current.setTheme(nextTheme);
    }
  };

  // Select character
  const handleSelectCharacter = (charId: string) => {
    const updated = { ...saveData, selectedCharacterId: charId };
    setSaveData(updated);
    StorageManager.save(updated);
    if (engineRef.current) {
      engineRef.current.setCharacter(charId);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 flex items-center justify-center font-body">
      {/* 3D WebGL Canvas Viewport Container */}
      <div
        ref={canvasMountRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Main Menu Screen */}
      {gameState === 'menu' && (
        <MainMenu
          saveData={saveData}
          activeCharacter={activeChar}
          onPlay={handleStartRun}
          onOpenShop={() => setShopOpen(true)}
          onOpenMissions={() => setMissionsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* In-Game Active HUD */}
      {gameState === 'playing' && (
        <GameHUD
          score={currentScore}
          distance={currentDistance}
          coins={currentCoins}
          powerups={activePowerUps}
          onPause={handleTogglePause}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
          onLeft={() => engineRef.current?.swipeLeft()}
          onRight={() => engineRef.current?.swipeRight()}
        />
      )}

      {/* In-Game Pause Modal */}
      {isPaused && gameState === 'playing' && (
        <PauseModal
          soundEnabled={saveData.soundEnabled}
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleReturnHome}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Game Over Results Modal */}
      {gameState === 'gameover' && lastResults && (
        <GameOverModal
          results={lastResults}
          isNewHigh={isNewHigh}
          totalCoins={saveData.totalCoins}
          completedMissions={recentlyCompletedMissions}
          onRestart={handleRestart}
          onHome={handleReturnHome}
          onShop={() => {
            setGameState('menu');
            setShopOpen(true);
          }}
        />
      )}

      {/* Character Wardrobe & Shop Modal */}
      {shopOpen && (
        <CharacterShop
          totalCoins={saveData.totalCoins}
          unlockedCharacters={saveData.unlockedCharacters}
          selectedCharacterId={saveData.selectedCharacterId}
          onSelectCharacter={handleSelectCharacter}
          onCoinsUpdated={(newCoins) => {
            const updated = { ...saveData, totalCoins: newCoins };
            setSaveData(updated);
            StorageManager.save(updated);
          }}
          onClose={() => setShopOpen(false)}
        />
      )}

      {/* Daily Missions Modal */}
      {missionsOpen && (
        <MissionsModal
          saveData={saveData}
          onCoinsClaimed={(reward) => {
            const updated = { ...saveData, totalCoins: saveData.totalCoins + reward };
            setSaveData(updated);
          }}
          onClose={() => setMissionsOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          saveData={saveData}
          onUpdateSave={(partial) => {
            const updated = { ...saveData, ...partial };
            setSaveData(updated);
            StorageManager.save(updated);
          }}
          onThemeChanged={(newTheme) => {
            const updated = { ...saveData, theme: newTheme };
            setSaveData(updated);
            StorageManager.save(updated);
            if (engineRef.current) {
              engineRef.current.setTheme(newTheme);
            }
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
