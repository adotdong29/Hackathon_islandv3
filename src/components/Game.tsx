import React, { useRef, useEffect } from 'react';
import { useGameState } from '../hooks/useGamestate';
import DialogueBox from './DialogueBox';
import GameUI from './GameUI';
import { GameEngine } from '../engine/GameEngine';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngine = useRef<GameEngine | null>(null);
  const { 
    gameState, 
    showDialogue, 
    dialogueText, 
    dialogueSpeaker,
    advanceDialogue,
    playerPosition,
    updatePlayerPosition,
    triggerDialogue,
    changeRegion
  } = useGameState();

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Setup canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      if (gameEngine.current) {
        gameEngine.current.resize(canvas.width, canvas.height);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Initialize game engine with callbacks
    gameEngine.current = new GameEngine(
      canvas, 
      gameState, 
      updatePlayerPosition,
      triggerDialogue,
      changeRegion
    );
    gameEngine.current.start();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameEngine.current) {
        gameEngine.current.stop();
      }
    };
  }, [gameState, updatePlayerPosition, triggerDialogue, changeRegion]);

  // Handle canvas clicks for dialogue and interaction
  const handleCanvasClick = () => {
    if (showDialogue) {
      advanceDialogue();
    } else if (gameEngine.current) {
      gameEngine.current.handleClick();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#000080] overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pixel-art"
        onClick={handleCanvasClick}
      />
      
      {showDialogue && (
        <div className="absolute bottom-8 left-0 right-0 z-10">
          <DialogueBox 
            text={dialogueText} 
            speaker={dialogueSpeaker} 
            onAdvance={advanceDialogue} 
          />
        </div>
      )}
      
      <GameUI gameState={gameState} playerPosition={playerPosition} />
    </div>
  );
};

export default Game;