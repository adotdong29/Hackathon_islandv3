// src/engine/RenderSystem.ts

import { TileType } from '../types/GameTypes';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  public begin(): void { this.ctx.save(); }
  public end(): void   { this.ctx.restore(); }

  /** Fill background */
  public renderBackground(): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.fillStyle = '#004080';
    this.ctx.fillRect(0, 0, width, height);
  }

  /** Generic rectangle */
  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /** Draw a tile of one of our types */
  public drawTile(x: number, y: number, size: number, type: TileType): void {
    let color = '#0077BE';
    switch (type) {
      case 'grass':    color = '#38B000'; break;
      case 'sand':     color = '#FFD166'; break;
      case 'path':     color = '#A57939'; break;
      case 'building': color = '#EF476F'; break;
      case 'obstacle': color = '#073B4C'; break;
    }
    this.drawRect(x, y, size, size, color);
    // subtle grid/highlight
    if (type === 'path') {
      this.ctx.strokeStyle = 'rgba(255,255,0,0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    } else {
      this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, size, size);
    }
  }

  // ——————————————————————————————————————————————
  // Terrain decorations
  // ——————————————————————————————————————————————

  /** Simple pixel-mountain: triangular peak */
  public drawMountain(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size, cy + size);
    this.ctx.lineTo(cx + size, cy + size);
    this.ctx.closePath();
    this.ctx.fill();
    // snowcap
    this.ctx.fillStyle = '#EEE';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size*0.4, cy - size*0.2);
    this.ctx.lineTo(cx + size*0.4, cy - size*0.2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /** Bamboo stalk: bundled segments */
  public drawBamboo(cx: number, cy: number, height: number): void {
    const w = 4;
    this.ctx.fillStyle = '#228B22';
    // trunk
    this.ctx.fillRect(cx - w/2, cy - height, w, height);
    // nodes
    this.ctx.strokeStyle = '#196619';
    this.ctx.lineWidth = 2;
    const segments = Math.floor(height / 10);
    for (let i = 1; i <= segments; i++) {
      const y = cy - (i * height/segments);
      this.ctx.beginPath();
      this.ctx.moveTo(cx - w/2, y);
      this.ctx.lineTo(cx + w/2, y);
      this.ctx.stroke();
    }
    // leaves
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - height);
    this.ctx.lineTo(cx - 10, cy - height - 10);
    this.ctx.lineTo(cx + 10, cy - height - 10);
    this.ctx.fill();
  }

  /** Palm tree: slender trunk + fronds */
  public drawPalm(cx: number, cy: number, size: number): void {
    // trunk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size/8, cy - size, size/4, size);
    // fronds
    this.ctx.strokeStyle = '#228B22';
    this.ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI/2 + (i - 2) * 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - size);
      this.ctx.quadraticCurveTo(
        cx + Math.cos(angle)*size,
        cy - size + Math.sin(angle)*size,
        cx + Math.cos(angle)*size*1.2,
        cy - size + Math.sin(angle)*size*1.2
      );
      this.ctx.stroke();
    }
  }

  /** Island house */
  public drawHouse(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#A0522D';
    this.ctx.fillRect(cx - size/2, cy - size/2, size, size);
    this.ctx.fillStyle = '#8B0000';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size/2, cy - size/2);
    this.ctx.lineTo(cx,            cy - size);
    this.ctx.lineTo(cx + size/2, cy - size/2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /** Regular tree */
  public drawTree(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size/8, cy, size/4, size/2);
    this.ctx.fillStyle = '#006400';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    this.ctx.fill();
  }

  /** Flapping bird */
  public drawBird(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size/2, cy);
    this.ctx.lineTo(cx - size,   cy - size/2);
    this.ctx.moveTo(cx + size/2, cy);
    this.ctx.lineTo(cx + size,   cy - size/2);
    this.ctx.stroke();
  }

  // ——————————————————————————————————————————————
  // Characters & NPCs
  // ——————————————————————————————————————————————

  public drawCharacter(
    x: number, y: number,
    direction: 'up'|'down'|'left'|'right',
    isMoving: boolean,
    color: string = '#FFD700'
  ): void {
    const size = 32;
    // shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + size/2, size/3, size/6, 0, 0, Math.PI*2);
    this.ctx.fill();

    // gradient head/body
    const grad = this.ctx.createLinearGradient(
      x - size/2, y - size/2,
      x + size/2, y + size/2
    );
    grad.addColorStop(0, color);
    grad.addColorStop(1, this.adjustColor(color, -30));
    this.ctx.fillStyle = grad;

    // head
    this.ctx.beginPath();
    this.ctx.arc(x, y - size/2, size/3, 0, Math.PI*2);
    this.ctx.fill();

    // body
    this.ctx.fillRect(x - size/4, y - size/2 + size/3, size/2, size/2);

    // legs
    this.ctx.fillStyle = this.adjustColor(color, -20);
    if (isMoving) {
      const t = Date.now()/200;
      const off = Math.sin(t)*5;
      this.ctx.fillRect(x - size/4, y, size/4, size/3 + off);
      this.ctx.fillRect(x,          y, size/4, size/3 - off);
    } else {
      this.ctx.fillRect(x - size/4, y, size/4, size/3);
      this.ctx.fillRect(x,          y, size/4, size/3);
    }

    // eyes
    this.drawEyes(x, y, size, direction);
  }

  private drawEyes(
    x: number, y: number, size: number,
    dir: 'up'|'down'|'left'|'right'
  ): void {
    const eyeSize = size/8, off = size/6;
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle= '#000';
    this.ctx.lineWidth = 2;
    if (dir!=='right') {
      const dy = dir==='up' ? -size/2 - off : dir==='down' ? -size/2 + off : -size/2;
      this.ctx.beginPath();
      this.ctx.arc(x - off, y + dy, eyeSize, 0, Math.PI*2);
      this.ctx.arc(x + off, y + dy, eyeSize, 0, Math.PI*2);
      this.ctx.fill(); this.ctx.stroke();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x + size/4, y - size/2, eyeSize, 0, Math.PI*2);
      this.ctx.fill(); this.ctx.stroke();
    }
    this.ctx.fillStyle = '#000';
    let px = x, py = y - size/2;
    const pOff = eyeSize/2;
    switch(dir) {
      case 'up':    py -= pOff; break;
      case 'down':  py += pOff; break;
      case 'left':  px -= pOff; break;
      case 'right': px += pOff; break;
    }
    this.ctx.beginPath();
    this.ctx.arc(px, py, eyeSize/2, 0, Math.PI*2);
    this.ctx.fill();
  }

  public drawNPC(x: number, y: number, color: string): void {
    this.drawCharacter(x, y, 'down', false, color);
  }

  public drawText(
    text: string, x: number, y: number,
    color: string = 'white', size: number = 16,
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.font = `${size}px 'Press Start 2P', monospace`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  private adjustColor(col: string, amt: number): string {
    const hex = col.replace('#','');
    let num = parseInt(hex,16);
    let r = (num>>16)+amt, g = ((num>>8)&0xff)+amt, b = (num&0xff)+amt;
    r = Math.max(0,Math.min(255,r));
    g = Math.max(0,Math.min(255,g));
    b = Math.max(0,Math.min(255,b));
    return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
  }
}
