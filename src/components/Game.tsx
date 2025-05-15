// src/components/Game.tsx

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef    = useRef<GameEngine>();
  const [introStep, setIntroStep] = useState(0);
  const introLines = [
    "Bill Gates: Welcome to Hackathon Island! Your journey begins here.",
    "Bill Gates: Six tech challenges await. Finish them to become a master developer.",
    "Bill Gates: Use the arrow keys or WASD to move around.",
    "Bill Gates: Click ▶ to start your adventure!"
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    const engine = new GameEngine(canvas);
    engine.onIntroDone = () => {
      // pause engine until intro completes
    };
    engineRef.current = engine;

    // we start engine AFTER intro:
    // so do not call engine.start() here

    const resize = () => {
      const w = containerRef.current!.clientWidth;
      const h = containerRef.current!.clientHeight;
      engine.resize(w,h);
    };
    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
      engine.stop();
      containerRef.current?.removeChild(canvas);
    };
  }, []);

  // advance intro
  const handleNext = () => {
    if (introStep < introLines.length - 1) {
      setIntroStep(introStep + 1);
    } else {
      // done: hide overlay & start engine
      const engine = engineRef.current!;
      engine.start();
      setIntroStep(introLines.length);
    }
  };

  return (
    <div ref={containerRef} style={{ width:'100%',height:'100%',position:'relative' }}>
      {introStep < introLines.length && (
        <div style={{
          position:'absolute', top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.7)', color:'#fff',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          fontFamily:'monospace', fontSize: '18px', padding: '20px',
          textAlign:'center'
        }}>
          <p style={{ maxWidth:'600px' }}>{introLines[introStep]}</p>
          <button
            onClick={handleNext}
            style={{
              marginTop:'20px', padding:'10px 20px',
              fontSize:'16px', cursor:'pointer'
            }}>
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
