// src/components/Game.tsx

import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../engine/GameEngine';

const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the canvas and append it to our container
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    // Instantiate and start the game engine
    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.start();

    // Resize handler to keep canvas filling its container
    const handleResize = () => {
      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;
      engine.resize(width, height);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      containerRef.current?.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
};

export default Game;
