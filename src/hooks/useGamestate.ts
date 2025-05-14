import { useState, useEffect } from 'react';
import { GameState, Dialogue } from '../types/GameTypes';
import { introDialogues, completionDialogues } from '../data/dialogues';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    gamePhase: 'INTRO',
    currentRegion: 'Island Shore',
    completedMinigames: [],
    inventory: [],
    questProgress: {
      mainQuest: 0,
      sideQuests: {}
    }
  });

  const [showDialogue, setShowDialogue] = useState(false);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [dialogueQueue, setDialogueQueue] = useState<Dialogue[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 800, y: 900 });

  // Start intro sequence on first load
  useEffect(() => {
    setTimeout(() => {
      startIntroSequence();
    }, 500);
  }, []);

  // Check for game completion
  useEffect(() => {
    const allMinigames = ['hardwarePuzzle', 'softwareQuiz', 'rhythmGame', 'consoleGuess', 'phoneWeight', 'networkQuiz'];
    const isAllCompleted = allMinigames.every(game => gameState.completedMinigames.includes(game));
    
    if (isAllCompleted && gameState.gamePhase !== 'ENDING') {
      triggerCompletionSequence();
    }
  }, [gameState.completedMinigames, gameState.gamePhase]);

  const startIntroSequence = () => {
    setDialogueQueue(introDialogues);
    setCurrentDialogueIndex(0);
    setShowDialogue(true);
    setGameState(prev => ({ ...prev, gamePhase: 'INTRO' }));
  };

  const triggerCompletionSequence = () => {
    setDialogueQueue(completionDialogues);
    setCurrentDialogueIndex(0);
    setShowDialogue(true);
    setGameState(prev => ({ ...prev, gamePhase: 'ENDING' }));
  };

  const advanceDialogue = () => {
    if (currentDialogueIndex < dialogueQueue.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      setShowDialogue(false);
      
      // If we just finished the intro dialogue
      if (gameState.gamePhase === 'INTRO') {
        setGameState(prev => ({ ...prev, gamePhase: 'EXPLORATION' }));
      }
    }
  };

  const triggerDialogue = (dialogues: Dialogue[]) => {
    setDialogueQueue(dialogues);
    setCurrentDialogueIndex(0);
    setShowDialogue(true);
  };

  const updatePlayerPosition = (x: number, y: number) => {
    setPlayerPosition({ x, y });
  };

  const completeMinigame = (minigameName: string) => {
    if (!gameState.completedMinigames.includes(minigameName)) {
      setGameState(prev => ({
        ...prev,
        completedMinigames: [...prev.completedMinigames, minigameName]
      }));
    }
  };

  const changeRegion = (regionName: string) => {
    setGameState(prev => ({
      ...prev,
      currentRegion: regionName
    }));
  };

  const startMinigame = (minigameId: string) => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'MINIGAME',
      currentMinigame: minigameId
    }));
  };

  const exitMinigame = () => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'EXPLORATION',
      currentMinigame: undefined
    }));
  };

  // Current dialogue data
  const currentDialogue = dialogueQueue[currentDialogueIndex] || { text: '', speaker: '' };
  const dialogueText = currentDialogue.text;
  const dialogueSpeaker = currentDialogue.speaker;

  return {
    gameState,
    showDialogue,
    dialogueText,
    dialogueSpeaker,
    advanceDialogue,
    triggerDialogue,
    playerPosition,
    updatePlayerPosition,
    completeMinigame,
    changeRegion,
    startMinigame,
    exitMinigame
  };
};
