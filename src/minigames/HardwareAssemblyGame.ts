// src/minigames/HardwareAssemblyGame.ts

import { IMinigame } from './IMinigame';

interface Part {
  name: string;
  x: number; y: number;
  w: number; h: number;
  placed: boolean;
  tx: number; ty: number;
  color: string;
}

export class HardwareAssemblyGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private onComplete!: () => void;
  private parts: Part[] = [];
  private dragging?: Part;
  private offsetX = 0;
  private offsetY = 0;
  private progress = 0;
  private hintTimer = 0;

  init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.onComplete = onComplete;
    this.parts = [];
    const names = ['Motherboard','CPU','RAM','PowerSupply','Storage','GPU'];
    const colors = ['#FF8C00','#FF1493','#1E90FF','#32CD32','#FFD700','#8A2BE2'];

    // lay out parts on left
    names.forEach((n,i) => {
      this.parts.push({
        name: n,
        x: 50, y: 100 + i*90,
        w: 100, h: 50,
        placed: false,
        tx: canvas.width*0.7,
        ty: 150 + i*80,
        color: colors[i]
      });
    });

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup',   this.onPointerUp);
  }

  update(dt: number): void {
    this.hintTimer += dt;
    if (!this.dragging && this.hintTimer > 30_000) {
      this.hintTimer = 0;
      const next = this.parts.find(p => !p.placed);
      if (next) next.color = '#FF0000';
      setTimeout(() => next && (next.color = '#888'), 1000);
    }

    const placedCount = this.parts.filter(p => p.placed).length;
    this.progress = placedCount / this.parts.length;
    if (placedCount === this.parts.length) {
      // boot animation
      setTimeout(() => {
        alert('💻 System booted! Congratulations!');
        this.onComplete();
      }, 500);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // background
    ctx.fillStyle = '#002B5B';
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);

    // Data‐flow demo
    ctx.save();
    ctx.globalAlpha = 0.2 + 0.2*Math.sin(Date.now()/500);
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(200,50);
    ctx.lineTo(ctx.canvas.width*0.7+40,50);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle='#FFF'; ctx.font='18px monospace';
    ctx.fillText('→ Data flow: CPU → RAM → GPU', 100, 30);

    // targets
    this.parts.forEach(p => {
      ctx.strokeStyle = p.placed ? '#0F0' : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.tx, p.ty, p.w, p.h);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(p.tx, p.ty, p.w, p.h);
      ctx.fillStyle = '#FFF';
      ctx.fillText(p.name, p.tx, p.ty - 8);
    });

    // parts
    this.parts.forEach(p => {
      if (!p.placed || p === this.dragging) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.strokeRect(p.x,p.y,p.w,p.h);
        ctx.fillStyle = '#000';
        ctx.fillText(p.name, p.x+5, p.y+30);
      }
    });

    // progress bar
    ctx.fillStyle='#333';
    ctx.fillRect(20, ctx.canvas.height-40, ctx.canvas.width-40, 20);
    ctx.fillStyle='#0F0';
    ctx.fillRect(20, ctx.canvas.height-40, (ctx.canvas.width-40)*this.progress, 20);
  }

  private onPointerDown = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    this.dragging = this.parts.find(p =>
      !p.placed &&
      mx>=p.x&&mx<=p.x+p.w &&
      my>=p.y&&my<=p.y+p.h
    );
    if (this.dragging) {
      this.offsetX = mx - this.dragging.x;
      this.offsetY = my - this.dragging.y;
      this.hintTimer = 0;
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const r = this.canvas.getBoundingClientRect();
    this.dragging.x = e.clientX - r.left - this.offsetX;
    this.dragging.y = e.clientY - r.top  - this.offsetY;
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.dragging) return;
    const p = this.dragging;
    if (Math.hypot(p.x-p.tx, p.y-p.ty) < 40) {
      p.x = p.tx; p.y = p.ty; p.placed = true;
      const s = new Audio('https://freesound.org/data/previews/66/66717_931655-lq.mp3');
      s.volume = 0.2; s.play();
    }
    this.dragging = undefined;
  };

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup',   this.onPointerUp);
  }
}
