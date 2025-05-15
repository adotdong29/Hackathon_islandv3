// src/components/Game.tsx

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';

const introLines = [
  "Bill Gates: Welcome to Hackathon Island! Your journey begins here.",
  "Bill Gates: Six tech challenges await you.",
  "Bill Gates: Use arrow keys or WASD to move around.",
  "Bill Gates: Click ▶ to start your adventure!"
];

const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef    = useRef<GameEngine>();
  const [introIdx, setIntroIdx] = useState(0);

  // Initialize engine & canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.start();

    const handleResize = () => {
      const w = containerRef.current!.clientWidth;
      const h = containerRef.current!.clientHeight;
      engine.resize(w, h);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      containerRef.current?.removeChild(canvas);
    };
  }, []);

  // Advance dialogue
  const handleNext = () => {
    setIntroIdx(i => Math.min(i + 1, introLines.length));
  };

  return (
    <div ref={containerRef} style={{ width:'100%', height:'100%', position:'relative' }}>
      {introIdx < introLines.length && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '25vh',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: 18,
          padding: 20,
        }}>
          <p style={{ margin: 0, maxWidth: '80%', textAlign: 'center' }}>
            {introLines[introIdx]}
          </p>
          <button
            onClick={handleNext}
            style={{
              marginTop: 20,
              padding: '8px 16px',
              fontSize: 16,
              background: '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
