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

  /** Fill entire background (ocean) */
  public renderBackground(): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.fillStyle = '#004080';
    this.ctx.fillRect(0, 0, width, height);
  }

  /** Draw generic filled rectangle */
  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /** Draw a ground tile */
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
    // grid or highlight
    if (type === 'path') {
      this.ctx.strokeStyle = 'rgba(255,255,0,0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x+1, y+1, size-2, size-2);
    } else {
      this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, size, size);
    }
  }

  // ————————————————— Decorations —————————————————

  /** Draw a colorful banner string between two points */
  public drawBanner(x1: number, y1: number, x2: number, y2: number): void {
    const ctx = this.ctx;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);
    const flags = Math.floor(len / 32);
    for (let i = 0; i < flags; i++) {
      const px = i * 32;
      // flag background
      ctx.fillStyle = i % 2 ? '#FF69B4' : '#FFD700';
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px + 24, 0);
      ctx.lineTo(px + 16, -16);
      ctx.lineTo(px, -16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Draw a floating paper lantern at (cx,cy) */
  public drawLantern(cx: number, cy: number, size: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(0, 0, size*0.6, size, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    // tassel
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, size + 12);
    ctx.stroke();
    ctx.restore();
  }

  /** Draw a cherry blossom tree cluster at (cx,cy) */
  public drawCherryBlossom(cx: number, cy: number, size: number): void {
    const ctx = this.ctx;
    // trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(cx - size*0.1, cy, size*0.2, size*0.6);
    // blossoms
    for (let i = 0; i < 8; i++) {
      const angle = Math.random()*Math.PI*2;
      const r = size*0.6 * Math.random();
      const bx = cx + Math.cos(angle)*r;
      const by = cy - size*0.3 + Math.sin(angle)*r;
      ctx.fillStyle = '#FFC0CB';
      ctx.beginPath();
      ctx.arc(bx, by, size*0.15, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#FF69B4';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /** Draw a kawaii mascot at (cx,cy) */
  public drawMascot(cx: number, cy: number, size: number): void {
    const ctx = this.ctx;
    // body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, size*0.8, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    // eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx - size*0.3, cy - size*0.2, size*0.15, 0, Math.PI*2);
    ctx.arc(cx + size*0.3, cy - size*0.2, size*0.15, 0, Math.PI*2);
    ctx.fill();
    // mouth
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + size*0.1, size*0.3, 0, Math.PI);
    ctx.stroke();
  }

  /** Draw a little floating island at (cx,cy) */
  public drawFloatingIsland(cx: number, cy: number, width: number, height: number): void {
    const ctx = this.ctx;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + height*0.6, width*0.6, height*0.2, 0, 0, Math.PI*2);
    ctx.fill();
    // land
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - width/2, cy);
    ctx.bezierCurveTo(cx - width/3, cy - height, cx + width/3, cy - height, cx + width/2, cy);
    ctx.lineTo(cx + width/2, cy + height*0.3);
    ctx.bezierCurveTo(cx + width/3, cy + height*0.6, cx - width/3, cy + height*0.6, cx - width/2, cy + height*0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // ————————————————— Character & NPC (unchanged) —————————————————

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
    const grad = this.ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
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

  private drawEyes(x:number,y:number,size:number,dir:'up'|'down'|'left'|'right'): void {
    const eyeSize = size/8, off = size/6;
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    if (dir !== 'right') {
      const dy = (dir==='up'? -size/2-off : dir==='down'? -size/2+off : -size/2);
      this.ctx.beginPath();
      this.ctx.arc(x-off, y+dy, eyeSize, 0, Math.PI*2);
      this.ctx.arc(x+off, y+dy, eyeSize, 0, Math.PI*2);
      this.ctx.fill(); this.ctx.stroke();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x+size/4, y-size/2, eyeSize, 0, Math.PI*2);
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

  public drawNPC(x:number,y:number,color:string): void {
    this.drawCharacter(x,y,'down',false,color);
  }

  public drawText(text:string,x:number,y:number,color:string='white',size:number=16,align:CanvasTextAlign='left'): void {
    this.ctx.font = `${size}px 'Press Start 2P', monospace`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  private adjustColor(col:string,amt:number): string {
    const hex = col.replace('#','');
    let num = parseInt(hex,16);
    let r = (num>>16)+amt, g = ((num>>8)&0xff)+amt, b = (num&0xff)+amt;
    r = Math.max(0,Math.min(255,r));
    g = Math.max(0,Math.min(255,g));
    b = Math.max(0,Math.min(255,b));
    return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
  }
}
