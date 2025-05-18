// src/minigames/ArcadeHistoryGame.ts

import { IMinigame } from './IMinigame';

interface Item {
  id: string;
  label: string;
  description: string;
  detail: string;
  x: number;
  y: number;
  w: number;
  h: number;
  drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void;
}

export class ArcadeHistoryGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  private items: Item[] = [];
  private selected: Item | null = null;

  private padding = 30;
  private slotSize = 150;

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    // Let MinigameLoader control size

    this.setupItems();
    this.positionItems();

    canvas.addEventListener('pointerdown', this.onDown);
  }

  public update(dt: number): void {}

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.selected) {
      // Detail overlay
      const dx = this.padding;
      const dy = this.padding;
      const dw = this.canvas.width - 2 * this.padding;
      const dh = this.canvas.height - 2 * this.padding;
      ctx.fillStyle = '#222';
      ctx.fillRect(dx, dy, dw, dh);
      // Title
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '30px sans-serif';
      ctx.fillText(this.selected.label, dx + dw/2, dy + 50);
      // Detail text
      ctx.font = '18px sans-serif';
      const lines = this.wrapText(this.selected.detail, dw - 60);
      lines.forEach((line, i) => {
        ctx.fillText(line, dx + dw/2, dy + 100 + i * 26);
      });
      // Buttons
      const btnW = 180;
      const btnH = 50;
      const by = dy + dh - btnH - 20;
      // Back
      ctx.fillStyle = '#388E3C';
      ctx.fillRect(dx + 40, by, btnW, btnH);
      ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
      ctx.fillText('Back to Museum', dx + 40 + btnW/2, by + 32);
      // Exit
      ctx.fillStyle = '#B71C1C';
      ctx.fillRect(dx + dw - btnW - 40, by, btnW, btnH);
      ctx.fillStyle = '#fff';
      ctx.fillText('Exit Museum', dx + dw - btnW/2 - 40, by + 32);
    } else {
      // Museum title
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '36px sans-serif';
      ctx.fillText('Arcade & Console Museum', this.canvas.width/2, 60);
      // Items
      this.items.forEach(it => {
        it.drawLogo(ctx, it.x, it.y, it.w, it.h);
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText(it.label, it.x + it.w/2, it.y + it.h + 24);
      });
      // Exit button
      const btnW = 180;
      const btnH = 50;
      ctx.fillStyle = '#B71C1C';
      ctx.fillRect(this.canvas.width - btnW - this.padding, this.padding, btnW, btnH);
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText('Exit Museum', this.canvas.width - btnW/2 - this.padding, this.padding + 34);
    }
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onDown);
  }

  private onDown = (e: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.selected) {
      // Buttons
      const dx = this.padding;
      const dy = this.padding;
      const dw = this.canvas.width - 2 * this.padding;
      const dh = this.canvas.height - 2 * this.padding;
      const btnW = 180;
      const btnH = 50;
      const by = dy + dh - btnH - 20;
      // Back
      if (x >= dx + 40 && x <= dx + 40 + btnW && y >= by && y <= by + btnH) {
        this.selected = null;
        return;
      }
      // Exit
      if (x >= dx + dw - btnW - 40 && x <= dx + dw - 40 && y >= by && y <= by + btnH) {
        this.onComplete();
        return;
      }
    } else {
      // Exit on main
      const btnW = 180;
      const btnH = 50;
      if (x >= this.canvas.width - btnW - this.padding && x <= this.canvas.width - this.padding && y >= this.padding && y <= this.padding + btnH) {
        this.onComplete();
        return;
      }
      // Select items
      for (const it of this.items) {
        if (x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h) {
          this.selected = it;
          break;
        }
      }
    }
  }

  private setupItems(): void {
    // Arcade games
    const gameDefs = [
      { id: 'space', label: 'Space Invaders (1978)', detail: 'Released in 1978, Space Invaders was one of the earliest shooting games and helped expand the video game industry worldwide.' },
      { id: 'pac', label: 'Pac-Man (1980)', detail: '1980 hit Pac-Man introduced non-violent gameplay and became a cultural icon, spawning merchandise and an animated series.' },
      { id: 'dk', label: 'Donkey Kong (1981)', detail: 'Donkey Kong pioneered platform games, introduced Mario, and was a major success for Nintendo.' },
      { id: 'qbert', label: 'Q*bert (1982)', detail: 'Q*bert featured innovative isometric graphics and challenging gameplay, becoming an arcade favorite.' },
      { id: 'frog', label: 'Frogger (1981)', detail: 'Frogger combined timing and strategy, making it an immediate arcade hit.' },
      { id: 'galaga', label: 'Galaga (1981)', detail: 'Galaga improved on Space Invaders with enemies that could capture your ship, offering back-to-back gameplay.' }
    ];
    // Consoles
    const consoleDefs = [
      { id: '2600', label: 'Atari 2600 (1977)', detail: 'Popularized home gaming with interchangeable cartridges, introducing classics like Pitfall! and Space Invaders.' },
      { id: 'intv', label: 'Intellivision (1979)', detail: 'Mattel Intellivision featured superior graphics and introduced game downloads via cartridges.' },
      { id: 'cole', label: 'ColecoVision (1982)', detail: 'Offered near-arcade quality ports and was Atari 2600 compatible.' },
      { id: 'sms', label: 'Master System (1985)', detail: 'Boasted superior graphics over NES and introduced franchises like Alex Kidd.' },
      { id: 'nes', label: 'NES (1985)', detail: 'Revived the video game market post-1983 crash with classics like Super Mario Bros.' }
    ];

    this.items = [];
    gameDefs.forEach(def => this.items.push({
      ...def,
      description: def.label,
      x: 0, y: 0, w: this.slotSize, h: this.slotSize,
      drawLogo: this.logoFactory(def.id)
    } as Item));
    consoleDefs.forEach(def => this.items.push({
      ...def,
      description: def.label,
      x: 0, y: 0, w: this.slotSize, h: this.slotSize,
      drawLogo: this.logoFactory(def.id)
    } as Item));
  }

  private positionItems(): void {
    const availableW = this.canvas.width - 2 * this.padding;
    const cols = Math.floor(availableW / (this.slotSize + this.padding));
    this.items.forEach((it, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      it.x = this.padding + col * (this.slotSize + this.padding);
      it.y = 100 + row * (this.slotSize + 60);
      it.w = this.slotSize;
      it.h = this.slotSize;
    });
  }

  private logoFactory(id: string) {
    return (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = '#333';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#555'; ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(id.toUpperCase(), x + w/2, y + h/2);
      ctx.textBaseline = 'alphabetic';
    };
  }

  private wrapText(text: string, maxW: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (this.ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }
}
