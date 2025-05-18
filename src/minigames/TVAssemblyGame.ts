// src/minigames/TVAssemblyGame.ts

import { IMinigame } from './IMinigame';

interface Part {
  id: string;
  label: string;
  tooltip: string;
  // Demo positions
  demoX: number;
  demoY: number;
  // Current positions
  x: number;
  y: number;
  w: number;
  h: number;
  // Target slot positions
  targetX: number;
  targetY: number;
  placed: boolean;
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void;
}

type Phase = 'demo' | 'assembly' | 'history';

export class TVAssemblyGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  private parts: Part[] = [];
  private phase: Phase = 'demo';
  private demoIndex = 0;
  private demoTimer = 0;

  // Drag state
  private dragging: Part | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private hoverPart: Part | null = null;

  constructor() {}

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;

    this.initDemo();
    this.initAssembly();
    this.phase = 'demo';
    this.demoIndex = 0;
    this.demoTimer = 0;

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
  }

  public update(dt: number): void {
    if (this.phase === 'demo') {
      this.demoTimer += dt;
      if (this.demoTimer > 2000) {
        this.demoTimer = 0;
        this.demoIndex++;
        if (this.demoIndex >= this.parts.length) {
          this.phase = 'assembly';
        }
      }
    }
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.phase === 'demo') {
      this.renderDemo(ctx);
    } else if (this.phase === 'assembly') {
      this.renderAssembly(ctx);
    } else {
      this.renderHistory(ctx);
    }
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
  }

  // --- Demo Phase ---
  private initDemo(): void {
    const size = 120;
    const centerX = this.canvas.width / 2 - size / 2;
    const centerY = this.canvas.height / 2 - size / 2;
    // define parts with demo positions and target slots
    this.parts = [
      { id: 'crt', label: 'CRT Tube', tooltip: 'Displays image', demoX: centerX, demoY: 80,
        x: 0, y: 0, w: size, h: size, targetX: 100, targetY: 150, placed: false, draw: this.drawCRT },
      { id: 'gun', label: 'Electron Gun', tooltip: 'Shoots electrons', demoX: centerX + 150, demoY: 80,
        x: 0, y: 0, w: size, h: size, targetX: 300, targetY: 150, placed: false, draw: this.drawGun },
      { id: 'coil', label: 'Deflection Coils', tooltip: 'Steer beam', demoX: centerX, demoY: centerY,
        x: 0, y: 0, w: size, h: size, targetX: 100, targetY: 300, placed: false, draw: this.drawCoils },
      { id: 'board', label: 'Circuit Board', tooltip: 'Processes signals', demoX: centerX + 150, demoY: centerY,
        x: 0, y: 0, w: size, h: size, targetX: 300, targetY: 300, placed: false, draw: this.drawBoard },
      { id: 'tuner', label: 'UHF/VHF Tuner', tooltip: 'Select channels', demoX: centerX, demoY: centerY + 150,
        x: 0, y: 0, w: size, h: size, targetX: 500, targetY: 150, placed: false, draw: this.drawTuner },
      { id: 'antenna', label: 'Antenna Terminals', tooltip: 'Connect antenna', demoX: centerX + 150, demoY: centerY + 150,
        x: 0, y: 0, w: size, h: size, targetX: 500, targetY: 300, placed: false, draw: this.drawAntenna },
    ];
  }

  private renderDemo(ctx: CanvasRenderingContext2D): void {
    const p = this.parts[this.demoIndex];
    ctx.fillStyle = '#222'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`Demo: ${p.label}`, this.canvas.width/2, 40);
    p.draw(ctx, p.demoX, p.demoY, p.w, p.h);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(30, this.canvas.height - 100, this.canvas.width - 60, 80);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(p.tooltip, 40, this.canvas.height - 60);
    ctx.textAlign = 'center';
    ctx.fillText('Auto-advances or Drag Any Part to Start', this.canvas.width/2, this.canvas.height - 20);
  }

  // --- Assembly Phase ---
  private initAssembly(): void {
    // Randomize initial positions
    this.parts.forEach(p => {
      p.x = Math.random() * (this.canvas.width - p.w);
      p.y = this.canvas.height - p.h - 20;
      p.placed = false;
    });
  }

  private renderAssembly(ctx: CanvasRenderingContext2D): void {
    // Draw TV Frame
    const fx = 80, fy = 100, fw = this.canvas.width - 160, fh = this.canvas.height - 220;
    ctx.fillStyle = '#333'; ctx.fillRect(fx - 10, fy - 10, fw + 20, fh + 20);
    ctx.fillStyle = '#000'; ctx.fillRect(fx, fy, fw, fh);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.strokeRect(fx, fy, fw, fh);

    // Title
    ctx.fillStyle = '#fff'; ctx.font = '26px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Assemble the TV Parts', 20, 40);

    // Draw slots and highlight if dragging nearby
    this.parts.forEach(p => {
      const sx = p.targetX, sy = p.targetY;
      const isNear = this.dragging === p && Math.hypot(p.x - sx, p.y - sy) < 60;
      ctx.save(); ctx.globalAlpha = p.placed ? 0.5 : 1;
      ctx.fillStyle = '#444'; ctx.fillRect(sx, sy, p.w, p.h);
      ctx.strokeStyle = p.placed ? '#0f0' : isNear ? '#ff0' : '#888';
      ctx.lineWidth = isNear ? 4 : 2;
      ctx.strokeRect(sx, sy, p.w, p.h);
      ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.label, sx + p.w/2, sy - 8);
      ctx.restore();
    });

    // Draw parts
    this.parts.forEach(p => {
      ctx.globalAlpha = p.placed ? 0.5 : 1;
      p.draw(ctx, p.x, p.y, p.w, p.h);
      ctx.globalAlpha = 1;
    });

    // Tooltip on hover
    if (!this.dragging && this.hoverPart) {
      const hp = this.hoverPart;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(hp.x, hp.y - 30, hp.w, 24);
      ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(hp.tooltip, hp.x + 4, hp.y - 12);
    }

    // Completed?
    if (this.parts.every(p => p.placed)) {
      this.phase = 'history';
    }
  }

  // --- History Phase ---
  private renderHistory(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#111'; ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.fillStyle = '#fff'; ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('1980s Television Tech', this.canvas.width/2, 60);
    const txt = 'Vintage TVs used CRTs, electron guns, deflection coils, tuners, and circuit boards to deliver iconic broadcasts. These components powered the golden age of cable and brought shows into every home.';
    ctx.font = '18px sans-serif';
    this.wrapText(txt, this.canvas.width - 120).forEach((line, i) => {
      ctx.fillText(line, this.canvas.width/2, 100 + i*30);
    });
    // Return button
    const bw = 240, bh = 50;
    const bx = (this.canvas.width - bw)/2, by = this.canvas.height - 140;
    ctx.fillStyle = '#388E3C'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.fillText('Return to Island', this.canvas.width/2, by + 32);
  }

  // --- Event Handlers ---
  private onPointerDown = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this.phase === 'demo') {
      // Skip demo on any pointer down
      this.phase = 'assembly';
      return;
    }
    if (this.phase === 'assembly') {
      for (const p of this.parts) {
        if (!p.placed && x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) {
          this.dragging = p;
          this.offsetX = x - p.x;
          this.offsetY = y - p.y;
          break;
        }
      }
      return;
    }
    if (this.phase === 'history') {
      const bw = 240, bh = 50;
      const bx = (this.canvas.width - bw)/2, by = this.canvas.height - 140;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        this.onComplete();
      }
    }
  }

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this.phase === 'assembly') {
      this.hoverPart = this.parts.find(p => !p.placed && x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) || null;
      if (this.dragging) {
        this.dragging.x = x - this.offsetX;
        this.dragging.y = y - this.offsetY;
      }
    }
  }

  private onPointerUp = (): void => {
    if (this.phase === 'assembly' && this.dragging) {
      const p = this.dragging;
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      if (Math.hypot(dx, dy) < 50) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.placed = true;
      }
      this.dragging = null;
    }
  }

  // --- Utility ---
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

  // --- Part Drawers ---
  private drawCRT(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = '#666';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#999'; ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
  }
  private drawGun(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = '#a33';
    ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
  }
  private drawCoils(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.strokeStyle = '#0a0'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x + w/2, y + h/2, 10 + i * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  private drawBoard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = '#03a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(x + 10 + i * 15, y + 10, 8, 8);
    }
  }
  private drawTuner(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 10, w - 20, 10);
  }
  private drawAntenna(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w/2, y + h);
    ctx.lineTo(x + w/2, y);
    ctx.stroke();
  }
}
