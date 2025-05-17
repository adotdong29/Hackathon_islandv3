// src/minigames/MobileT9Game.ts

import { IMinigame } from './IMinigame';

export class MobileT9Game implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  // Target word/phrase and current input buffer
  private target = 'HELLO';
  private input = '';

  // Multi-tap state
  private keyMap: Record<string, string> = {
    '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
    '6': 'MNO', '7': 'PQRS','8': 'TUV', '9': 'WXYZ'
  };
  private currentKey: string | null = null;
  private tapCount = 0;
  private tapTimer = 0;
  private readonly TAP_TIMEOUT = 800; // ms

  init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;

    // Resize to fill window
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Listen for key presses
    window.addEventListener('keydown', this.onKeyDown);
  }

  update(dt: number): void {
    if (this.currentKey) {
      this.tapTimer += dt;
      if (this.tapTimer > this.TAP_TIMEOUT) {
        this.commitLetter();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const w = ctx.canvas.width, h = ctx.canvas.height;

    // Background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, w, h);

    // Draw phone body
    const phoneW = w * 0.3, phoneH = h * 0.6;
    const px = (w - phoneW) / 2, py = (h - phoneH) / 2;
    ctx.fillStyle = '#444';
    ctx.fillRect(px, py, phoneW, phoneH);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
    ctx.strokeRect(px, py, phoneW, phoneH);

    // Draw screen
    const screenH = phoneH * 0.2;
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 20, py + 20, phoneW - 40, screenH);
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
    ctx.strokeRect(px + 20, py + 20, phoneW - 40, screenH);

    // Show target above input
    ctx.fillStyle = '#0F0';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TYPE: ${this.target}`, px + phoneW/2, py + 20 + screenH/2 - 10);

    // Show current input
    ctx.fillStyle = '#FFF';
    ctx.fillText(this.input, px + phoneW/2, py + 20 + screenH - 10);

    // Draw keypad
    const rows = 4, cols = 3;
    const keyW = (phoneW - 60) / cols;
    const keyH = (phoneH - screenH - 60) / rows;
    const keys = [
      { label: '1', letters: '' },
      { label: '2', letters: 'ABC' },
      { label: '3', letters: 'DEF' },
      { label: '4', letters: 'GHI' },
      { label: '5', letters: 'JKL' },
      { label: '6', letters: 'MNO' },
      { label: '7', letters: 'PQRS' },
      { label: '8', letters: 'TUV' },
      { label: '9', letters: 'WXYZ' },
      { label: '*', letters: '' },
      { label: '0', letters: ' ' },
      { label: '#', letters: '←' },
    ];

    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    keys.forEach((k, idx) => {
      const r = Math.floor(idx / cols), c = idx % cols;
      const kx = px + 20 + c * (keyW + 10);
      const ky = py + 40 + screenH + r * (keyH + 10);
      // key background
      ctx.fillStyle = '#666';
      ctx.fillRect(kx, ky, keyW, keyH);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ctx.strokeRect(kx, ky, keyW, keyH);
      // number
      ctx.fillStyle = '#FFF';
      ctx.fillText(k.label, kx + keyW/2, ky + keyH/2 - 5);
      // letters
      ctx.font = '12px monospace';
      ctx.fillText(k.letters, kx + keyW/2, ky + keyH/2 + 12);
      ctx.font = '18px monospace';
    });
  }

  handlePointer(_e: PointerEvent): void {
    // Not used
  }

  handleKey(e: KeyboardEvent): void {
    const k = e.key;
    if (k >= '2' && k <= '9') {
      // multi-tap letter
      if (this.currentKey && this.currentKey !== k) {
        this.commitLetter();
      }
      this.currentKey = k;
      this.tapCount = (this.tapCount % this.keyMap[k].length) + 1;
      this.tapTimer = 0;
    }
    else if (k === '0') {
      this.commitLetter();
      this.input += ' ';
    }
    else if (k === '#') {
      this.commitLetter();
      // backspace
      this.input = this.input.slice(0, -1);
    }
    else if (k === '*') {
      // commit current key without adding space
      this.commitLetter();
    }

    // check success
    if (this.input === this.target) {
      setTimeout(() => {
        alert('✅ Correct! You’ve mastered T9.');
        this.onComplete();
      }, 200);
    }
  }

  /** Convert any pending multi-tap into a letter */
  private commitLetter(): void {
    if (!this.currentKey) return;
    const letters = this.keyMap[this.currentKey];
    const idx = (this.tapCount - 1) % letters.length;
    this.input += letters[idx];
    this.currentKey = null;
    this.tapCount = 0;
    this.tapTimer = 0;
  }

  /** Clean up listeners */
  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  // bound so we can add/remove
  private onKeyDown = (e: KeyboardEvent) => this.handleKey(e);
}
