// src/engine/RenderSystem.ts

import { TileType } from '../types/GameTypes';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  private loadedPromises: Promise<void>[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    // disable smoothing for crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  /** If you add any image loads, push their promises into loadedPromises. */
  public async waitForLoad(): Promise<void> {
    await Promise.all(this.loadedPromises);
  }

  /** Save canvas state */
  public begin(): void {
    this.ctx.save();
  }

  /** Restore canvas state */
  public end(): void {
    this.ctx.restore();
  }

  /** Fill entire canvas with solid background (deep ocean blue) */
  public renderBackground(): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.fillStyle = '#004080';
    this.ctx.fillRect(0, 0, width, height);
  }

  /** Draw any filled rectangle */
  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /**
   * Draw a single map tile of the given type.
   * 'water' | 'grass' | 'sand' | 'path' | 'building' | 'obstacle'
   */
  public drawTile(x: number, y: number, size: number, type: TileType): void {
    let color = '#0077BE'; // default water
    switch (type) {
      case 'grass':    color = '#38B000'; break;
      case 'sand':     color = '#FFD166'; break;
      case 'path':     color = '#A57939'; break;
      case 'building': color = '#EF476F'; break;
      case 'obstacle': color = '#073B4C'; break;
    }
    // fill tile
    this.drawRect(x, y, size, size, color);

    // optional highlight for paths
    if (type === 'path') {
      this.ctx.strokeStyle = 'rgba(255,255,0,0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    } else {
      // subtle grid lines
      this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, size, size);
    }
  }

  // —————— Decorations ——————

  /** Draw a simple pixel-art house at (cx,cy) with given size */
  public drawHouse(cx: number, cy: number, size: number): void {
    // base
    this.ctx.fillStyle = '#A0522D';
    this.ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    // roof
    this.ctx.fillStyle = '#8B0000';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size / 2, cy - size / 2);
    this.ctx.lineTo(cx,            cy - size);
    this.ctx.lineTo(cx + size / 2, cy - size / 2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /** Draw a simple pixel-art tree at (cx,cy) with given size */
  public drawTree(cx: number, cy: number, size: number): void {
    // trunk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size / 8, cy, size / 4, size / 2);
    // foliage
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /** Draw a simple 2-winged bird at (cx,cy) with size as wing length */
  public drawBird(cx: number, cy: number, size: number): void {
    // body
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    // wings
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size / 2, cy);
    this.ctx.lineTo(cx - size,     cy - size / 2);
    this.ctx.moveTo(cx + size / 2, cy);
    this.ctx.lineTo(cx + size,     cy - size / 2);
    this.ctx.stroke();
  }

  // —————— Characters & NPCs ——————

  /**
   * Draw a JRPG-style character:
   * - x,y center of sprite
   * - direction: 'up'|'down'|'left'|'right'
   * - isMoving for simple leg animation
   * - color for body
   */
  public drawCharacter(
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right',
    isMoving: boolean,
    color: string = '#FFD700'
  ): void {
    const size = 32;

    // shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + size / 2, size / 3, size / 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // head & body gradient
    const grad = this.ctx.createLinearGradient(
      x - size / 2, y - size / 2,
      x + size / 2, y + size / 2
    );
    grad.addColorStop(0, color);
    grad.addColorStop(1, this.adjustColor(color, -30));
    this.ctx.fillStyle = grad;

    // head
    this.ctx.beginPath();
    this.ctx.arc(x, y - size / 2, size / 3, 0, Math.PI * 2);
    this.ctx.fill();

    // torso
    this.ctx.fillRect(x - size / 4, y - size / 2 + size / 3, size / 2, size / 2);

    // legs
    this.ctx.fillStyle = this.adjustColor(color, -20);
    if (isMoving) {
      const t = Date.now() / 200;
      const off = Math.sin(t) * 5;
      this.ctx.fillRect(x - size / 4, y, size / 4, size / 3 + off);
      this.ctx.fillRect(x,           y, size / 4, size / 3 - off);
    } else {
      this.ctx.fillRect(x - size / 4, y, size / 4, size / 3);
      this.ctx.fillRect(x,           y, size / 4, size / 3);
    }

    // eyes
    this.drawEyes(x, y, size, direction);
  }

  /** Draw eyes on the character according to direction */
  private drawEyes(
    x: number,
    y: number,
    size: number,
    dir: 'up' | 'down' | 'left' | 'right'
  ): void {
    const eyeSize = size / 8;
    const off     = size / 6;

    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;

    // for up/down/left: two eyes; for right: single eye
    if (dir !== 'right') {
      const dy = dir === 'up'   ? -size / 2 - off
               : dir === 'down' ? -size / 2 + off
               : -size / 2;
      this.ctx.beginPath();
      this.ctx.arc(x - off, y + dy, eyeSize, 0, Math.PI * 2);
      this.ctx.arc(x + off, y + dy, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x + size / 4, y - size / 2, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }

    // pupil
    this.ctx.fillStyle = '#000';
    let px = x, py = y - size / 2;
    const pOff = eyeSize / 2;
    switch (dir) {
      case 'up':    py -= pOff; break;
      case 'down':  py += pOff; break;
      case 'left':  px -= pOff; break;
      case 'right': px += pOff; break;
    }
    this.ctx.beginPath();
    this.ctx.arc(px, py, eyeSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /** Draw an NPC as a non-moving character */
  public drawNPC(x: number, y: number, color: string): void {
    this.drawCharacter(x, y, 'down', false, color);
  }

  /** Draw text with pixel-font style */
  public drawText(
    text: string,
    x: number,
    y: number,
    color: string = 'white',
    size: number = 16,
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.font = `${size}px 'Press Start 2P', monospace`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  /** Simple hex-color brightness adjust */
  private adjustColor(color: string, amt: number): string {
    const hex = color.replace('#', '');
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0xff) + amt;
    let b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return (
      '#' +
      ((r << 16) | (g << 8) | b)
        .toString(16)
        .padStart(6, '0')
    );
  }
}
