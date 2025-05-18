// src/minigames/MobileT9Game.ts

import { IMinigame } from './IMinigame';

interface KeyDef {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  letters: string;
}

export class MobileT9Game implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  // Game phases
  private phase: 'demo' | 'playing' | 'history' = 'demo';
  private demoStep = 0;

  // Layout
  private cols = 3;
  private rows = 4;
  private keyW = 80;
  private keyH = 60;
  private padding = 10;
  private displayH = 100;
  private keys: KeyDef[] = [];

  // Text state
  private currentText = '';
  private target = '';
  private moves = 0;
  private level = -1;
  private levels = ['HELLO', 'WORLD', 'SCACCO', 'MOBILE'];

  // Multi-tap
  private lastKey: KeyDef | null = null;
  private tapCount = 0;
  private tapTimer = 0;
  private tapTimeout = 1000;
  private pendingChar = '';

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    canvas.width = this.cols * (this.keyW + this.padding) + this.padding;
    canvas.height = this.displayH + this.rows * (this.keyH + this.padding) + this.padding;

    this.setupKeys();
    this.nextLevel();
    this.phase = 'demo';
    this.demoStep = 0;

    canvas.addEventListener('click', this.onCanvasClick); // Changed from 'mousedown' and handler name
    window.addEventListener('keydown', this.handleKey); // Changed from onKeyDown
    window.addEventListener('keyup', this.onKeyUp); // Assuming onKeyUp is intended to remain or be implemented
  }

  public update(dt: number): void {
    if (this.phase !== 'playing') return;
    if (this.tapCount > 0) {
      this.tapTimer += dt;
      if (this.tapTimer >= this.tapTimeout) {
        this.commitLetter();
      }
    }
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Frame
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Display
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.displayH);
    ctx.strokeStyle = '#0F0'; ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, this.canvas.width - 10, this.displayH - 10);

    ctx.fillStyle = '#0F0'; ctx.font = '24px monospace'; ctx.textAlign = 'left';
    if (this.phase === 'demo') {
      const msgs = [
        'Welcome to T9 Demo!',
        'Click keys to type letters',
        '0 = space, * = backspace',
        'Press screen to start'
      ];
      ctx.fillText(msgs[this.demoStep], 10, 50);
    } else {
      ctx.fillText(this.currentText, 10, 50);
      ctx.font = '16px sans-serif';
      if (this.phase === 'playing') {
        ctx.fillText(`Target: ${this.target}`, 10, 80);
        ctx.fillText(`Moves: ${this.moves}`, this.canvas.width - 100, 80);
      }
    }

    // History overlay
    if (this.phase === 'history') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#FFF'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
      const txt = '1980s phones used multi-tap input to type messages.';
      this.wrapText(txt, this.canvas.width - 40).forEach((l, i) => {
        ctx.fillText(l, this.canvas.width / 2, 100 + i * 28);
      });

      // Return button
      const bw = 200, bh = 40;
      const bx = (this.canvas.width - bw) / 2;
      const by = this.canvas.height - 80;
      ctx.fillStyle = '#388E3C'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#FFF'; ctx.font = '18px sans-serif'; // textAlign is already center
      ctx.fillText('Return to Island', bx + bw / 2, by + 26);
      return;
    }

    // Draw keys
    this.keys.forEach(key => {
      ctx.fillStyle = (this.lastKey === key && this.phase === 'playing') ? '#666' : '#222';
      ctx.fillRect(key.x, key.y, key.w, key.h);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.strokeRect(key.x, key.y, key.w, key.h);
      ctx.fillStyle = '#FFF'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(key.label, key.x + key.w / 2, key.y + key.h / 2 - 10);
      ctx.font = '12px sans-serif';
      ctx.fillText(key.letters, key.x + key.w / 2, key.y + key.h / 2 + 15);
    });
  }

  public destroy(): void {
    this.canvas.removeEventListener('click', this.onCanvasClick); // Changed from 'mousedown'
    window.removeEventListener('keydown', this.handleKey); // Changed from onKeyDown
    window.removeEventListener('keyup', this.onKeyUp); // Assuming onKeyUp is intended to remain or be implemented
  }

  private setupKeys(): void {
    const map: [string, string][] = [
      ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
      ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
      ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
      ['*', ''], ['0', ' '], ['#', '']
    ];
    for (let i = 0; i < 12; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = this.padding + col * (this.keyW + this.padding);
      const y = this.displayH + this.padding + row * (this.keyH + this.padding);
      this.keys.push({ x, y, w: this.keyW, h: this.keyH, label: map[i][0], letters: map[i][1] });
    }
  }

  // Renamed from onPointerDown to onCanvasClick and using 'click' event
  private onCanvasClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.phase === 'demo') {
      this.demoStep++;
      if (this.demoStep >= 4) this.phase = 'playing';
      return;
    }
    if (this.phase === 'history') {
      const bw = 200, bh = 40;
      const bx = (this.canvas.width - bw) / 2;
      const by = this.canvas.height - 80;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        this.onComplete();
      }
      return;
    }

    // If playing, handle T9 key clicks
    if (this.phase === 'playing') {
      this.keys.forEach(key => {
        if (x >= key.x && x <= key.x + key.w && y >= key.y && y <= key.y + key.h) {
          this.processT9KeyInput(key);
        }
      });
    }
  };

  private processT9KeyInput(key: KeyDef): void {
    if (this.phase !== 'playing') return;
    if (this.lastKey && this.lastKey !== key) this.commitLetter();
    if (key.letters) {
      this.tapCount++; this.tapTimer = 0; this.lastKey = key;
      const idx = (this.tapCount - 1) % key.letters.length;
      if (this.pendingChar) this.currentText = this.currentText.slice(0, -1);
      this.pendingChar = key.letters[idx];
      this.currentText += this.pendingChar;
    } else if (key.label === '0') {
      this.commitLetter(); this.currentText += ' ';
    } else if (key.label === '*') {
      this.commitLetter(); this.currentText = this.currentText.slice(0, -1);
    } else if (key.label === '#') {
      this.commitLetter();
    }
    this.moves++;
    if (this.currentText === this.target) {
      setTimeout(() => {
        alert(`Correct! ${this.target} in ${this.moves} moves.`);
        this.nextLevel();
      }, 100);
    }
  }

  private commitLetter(): void {
    this.pendingChar = '';
    this.tapCount = 0;
    this.lastKey = null;
  }

  private nextLevel(): void {
    this.level++;
    if (this.level >= this.levels.length) {
      this.phase = 'history';
      return;
    }
    this.target = this.levels[this.level];
    this.currentText = '';
    this.moves = 0;
    this.tapCount = 0;
    this.lastKey = null;
  }

  // Renamed from onKeyDown to handleKey and made public to match IMinigame
  public handleKey = (e: KeyboardEvent): void => {
    if (this.phase !== 'playing') return;

    let keyDef: KeyDef | undefined;

    if (e.key >= '0' && e.key <= '9') {
      keyDef = this.keys.find(k => k.label === e.key);
    } else if (e.key === '*') { // Asterisk for backspace
      keyDef = this.keys.find(k => k.label === '*');
    } else if (e.key === '#') { // Pound/Hash to commit letter
      keyDef = this.keys.find(k => k.label === '#');
    }

    if (keyDef) {
      this.processT9KeyInput(keyDef); // Call the renamed internal method
      // Optionally, add visual feedback for keyboard presses on the on-screen keys
    }
  };

  // onKeyUp is not strictly needed for T9 logic but good to have if listener is present
  private onKeyUp = (e: KeyboardEvent): void => {
    // Can be used to remove visual highlight if one was added onKeyDown
  };

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    words.forEach(word => {
      const test = current ? `${current} ${word}` : word;
      if (this.ctx.measureText(test).width > maxWidth) {
        if (current !== '') { // Only push if current is not empty
          lines.push(current);
        }
        current = word;
        // If the word itself is too long, it will be on its own line.
        // A more complex wrapText could break long words, but this handles typical cases.
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }
}
