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

  private applyKawaiiOutline(lineWidth: number = 2, color: string = 'rgba(0,0,0,0.7)'): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }
  // ——————————————————————————————————————————————————————————————————————
  // TILE DRAWING
  // ——————————————————————————————————————————————————————————————————————

  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  public drawTile(x: number, y: number, size: number, type: TileType): void {
    let color = '#0077BE';  // water
    switch (type) {
      case 'grass':    color = '#38B000'; break;
      case 'sand':     color = '#FFD166'; break;
      case 'path':     color = '#A57939'; break;
      case 'building': color = '#EF476F'; break;
      case 'obstacle': color = '#073B4C'; break;
    }
    this.drawRect(x, y, size, size, color);
    
    // Softer outline for tiles
    this.ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, size, size);
  }

  // ——————————————————————————————————————————————————————————————————————
  // LARGE LANDMARKS
  // ——————————————————————————————————————————————————————————————————————

  public drawBridge(cx: number, cy: number, size: number = 32): void {
    this.ctx.fillStyle   = '#8B4513';
    this.ctx.fillRect(cx - size/2, cy - 4, size, 8);
    this.applyKawaiiOutline(3, '#5C2F0B'); // Darker brown outline
  }

  public drawGate(cx: number, cy: number, size: number = 48): void {
    const h = size, w = size * 0.2;
    this.ctx.fillStyle   = '#E74C3C'; // Vibrant red
    this.ctx.fillRect(cx - size/2, cy - h,      w, h);
    this.ctx.fillRect(cx + size/2 - w, cy - h, w, h);
    this.ctx.fillRect(cx - size/2, cy - h,   size, w);
    this.applyKawaiiOutline(3, '#A93226'); // Darker red outline
  }

  public drawPlatform(cx: number, cy: number, size: number = 64): void {
    this.ctx.fillStyle   = '#BDC3C7'; // Light stone
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI * 2);
    this.ctx.fill();
    this.applyKawaiiOutline(3, '#7F8C8D'); // Darker stone outline
  }

  // ——————————————————————————————————————————————————————————————————————
  // POND
  // ——————————————————————————————————————————————————————————————————————

  public drawPond(cx: number, cy: number, radius: number): void {
    this.ctx.fillStyle = '#5DADE2'; // Playful blue
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, radius*1.2, radius, 0, 0, Math.PI*2);
    this.ctx.fill();
    this.applyKawaiiOutline(2, '#3498DB'); // Slightly darker blue outline
  }

  // ——————————————————————————————————————————————————————————————————————
  // BIOME DECORATIONS
  // ——————————————————————————————————————————————————————————————————————

  public drawTree(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#A0522D'; // Trunk
    this.ctx.fillRect(cx - size/8, cy, size/4, size/2);
    this.applyKawaiiOutline(1, '#6E3D12');

    this.ctx.fillStyle = '#2ECC71'; // Vibrant green
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    this.ctx.fill();
    this.applyKawaiiOutline(2, '#27AE60');
  }

  public drawHouse(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#F39C12'; // Warm orange body
    this.ctx.fillRect(cx - size/2, cy - size/2, size, size);
    this.applyKawaiiOutline(2, '#D35400');
    this.ctx.fillStyle = '#E74C3C'; // Red roof
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size/2, cy - size/2);
    this.ctx.lineTo(cx, cy - size);
    this.ctx.lineTo(cx + size/2, cy - size/2);
    this.ctx.closePath();
    this.ctx.fill();
    this.applyKawaiiOutline(2, '#C0392B');
  }

  public drawMountain(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size, cy + size);
    this.ctx.lineTo(cx + size, cy + size);
    this.ctx.closePath();
    this.ctx.fill();
    this.applyKawaiiOutline(3, '#444');
    // snowcap
    this.ctx.fillStyle = '#ECF0F1'; // Bright snow
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size*0.4, cy - size*0.2);
    this.ctx.lineTo(cx + size*0.4, cy - size*0.2);
    this.ctx.closePath();
    this.ctx.fill();
    this.applyKawaiiOutline(2, '#BDC3C7');
  }

  public drawBamboo(cx: number, cy: number, height: number): void {
    const w = 4;
    this.ctx.fillStyle = '#27AE60'; // Vibrant green
    this.ctx.fillRect(cx - w/2, cy - height, w, height);
    this.applyKawaiiOutline(1, '#1E8449');

    this.ctx.strokeStyle = '#1E8449'; // Darker green for segments
    this.ctx.lineWidth   = 1;
    const segs = Math.floor(height / 10);
    for (let i = 1; i <= segs; i++) {
      const y = cy - (i * height / segs);
      this.ctx.beginPath();
      this.ctx.moveTo(cx - w/2, y);
      this.ctx.lineTo(cx + w/2, y);
      this.ctx.stroke();
    }
  }

  public drawPalm(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#D35400'; // Brown trunk
    this.ctx.fillRect(cx - size/8, cy - size, size/4, size);
    this.applyKawaiiOutline(1, '#A04000');

    this.ctx.strokeStyle = '#2ECC71'; // Vibrant green leaves
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

  public drawLantern(cx: number, cy: number, size: number): void {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.fillStyle = '#F1C40F'; // Bright yellow
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size*0.5, size, 0, 0, Math.PI*2);
    this.ctx.fill();
    this.applyKawaiiOutline(2, '#B7950B');

    this.ctx.strokeStyle = '#E67E22'; this.ctx.lineWidth = 3; // Orange hanger
    this.ctx.beginPath(); this.ctx.moveTo(0, size); this.ctx.lineTo(0, size+12); this.ctx.stroke();
    this.ctx.restore();
  }

  public drawCherryBlossom(cx: number, cy: number, size: number): void {
    // trunk
    this.ctx.fillStyle = '#795548'; // Darker, richer brown
    this.ctx.fillRect(cx - size*0.05, cy, size*0.1, size*0.4);
    this.applyKawaiiOutline(1, '#5D4037');

    // blossoms
    const blossomColors = ['#FFC0CB', '#FFB6C1', '#FFB3BA', '#FFACCB']; // Pinks
    const outlineColor = '#E91E63'; // Hot pink outline

    for (let i = 0; i < 8; i++) { // More blossoms
      const a = Math.random()*2*Math.PI;
      const r = size*0.25*Math.random() + size*0.1; // Ensure they are somewhat out
      const bx = cx + Math.cos(a)*r;
      const by = cy - size*0.2 + Math.sin(a)*r;
      this.ctx.fillStyle = blossomColors[Math.floor(Math.random() * blossomColors.length)];
      this.ctx.beginPath();
      this.ctx.arc(bx, by, size*0.1 + Math.random() * size*0.05, 0, Math.PI*2); // Vary size
      this.ctx.fill();
      this.applyKawaiiOutline(1, outlineColor);
    }
  }

  // ——————————————————————————————————————————————————————————————————————
  // NEW DECORATIONS (Anime/Google Doodle Style)
  // ——————————————————————————————————————————————————————————————————————

  public drawColorfulBanner(
    cx: number, cy: number,
    width: number, height: number,
    color1: string, color2: string,
    phase: number // For animation
  ): void {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    const waveOffset = Math.sin(phase + Date.now() / 500) * 5;

    // Banner poles (simple dark lines)
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, 0);
    this.ctx.lineTo(-width / 2, height);
    this.ctx.moveTo(width / 2, 0);
    this.ctx.lineTo(width / 2, height);
    this.ctx.stroke();

    // Banner cloth
    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, waveOffset);
    this.ctx.bezierCurveTo(
      -width / 4, waveOffset - 10,
       width / 4, waveOffset + 10,
       width / 2, waveOffset
    );
    this.ctx.lineTo(width / 2, height + waveOffset - 5);
    this.ctx.bezierCurveTo(
       width / 4, height + waveOffset - 15,
      -width / 4, height + waveOffset + 5,
      -width / 2, height + waveOffset
    );
    this.ctx.closePath();

    const gradient = this.ctx.createLinearGradient(-width / 2, 0, width / 2, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.applyKawaiiOutline(2.5, 'rgba(0,0,0,0.6)');

    this.ctx.restore();
  }

  public drawFloatingSkyLantern(cx: number, cy: number, size: number, color: string, phase: number): void {
    const bobOffset = Math.sin(phase + Date.now() / 1000) * (size * 0.2);
    const flicker = Math.random() * 0.2 + 0.8; // Slight size flicker for flame

    // Lantern body
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy + bobOffset, size * 0.7, size, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.applyKawaiiOutline(2, this.adjustColor(color, -40));

    // Flame
    this.ctx.fillStyle = `rgba(255, ${165 + Math.random()*30}, 0, ${0.7 + Math.random()*0.3})`; // Orange-yellow flame
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy + bobOffset + size * 0.6, size * 0.15 * flicker, size * 0.3 * flicker, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // ——————————————————————————————————————————————————————————————————————
  // CHARACTER & TEXT
  // ——————————————————————————————————————————————————————————————————————

  public drawCharacter(
    x: number, y: number,
    dir: 'up'|'down'|'left'|'right',
    moving: boolean,
    color: string = '#FFD700'
  ): void {
    const s = 32; // Character size
    // shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + s/2, s/3, s/6, 0, 0, Math.PI*2);
    this.ctx.fill();

    // Body gradient - can be simplified if using sprites primarily
    const grad = this.ctx.createLinearGradient(x - s/2,y - s/2,x + s/2,y + s/2);
    grad.addColorStop(0, color);
    grad.addColorStop(1, this.adjustColor(color,-30));
    this.ctx.fillStyle = grad;

    // head
    this.ctx.beginPath();
    this.ctx.arc(x, y - s/2, s/3, 0, Math.PI*2);
    this.ctx.fill();
    this.applyKawaiiOutline(1.5);

    // torso
    this.ctx.fillRect(x - s/4, y - s/2 + s/3, s/2, s/2);
    this.applyKawaiiOutline(1.5);

    // legs
    this.ctx.fillStyle = this.adjustColor(color,-20);
    if (moving) {
      const t = Date.now()/200, off = Math.sin(t)*5;
      this.ctx.fillRect(x - s/4, y, s/4, s/3 + off);
      this.ctx.fillRect(x,          y, s/4, s/3 - off);
      this.applyKawaiiOutline(1.5);

    } else {
      this.ctx.fillRect(x - s/4, y, s/4, s/3);
      this.ctx.fillRect(x,          y, s/4, s/3);
      this.applyKawaiiOutline(1.5);
    }


    this.drawEyes(x, y, s, dir);
  }

  private drawEyes(x:number, y:number, s:number, dir:'up'|'down'|'left'|'right'): void {
    const eye = s/8, off = s/6;
    this.ctx.fillStyle = '#fff';
    // No separate stroke for eyes fill, rely on pupil for definition

    let dy = dir==='up'   ? -s/2-off
           : dir==='down' ? -s/2+off
           :                -s/2;

    if (dir!=='right') {
      this.ctx.beginPath();
      this.ctx.arc(x-off,  y+dy, eye, 0, Math.PI*2);
      this.ctx.arc(x+off,  y+dy, eye, 0, Math.PI*2);
      this.ctx.fill();
      // this.applyKawaiiOutline(1); // Optional: thin outline for eye shape
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x + s/4, y - s/2, eye, 0, Math.PI*2);
      this.ctx.fill();
      // this.applyKawaiiOutline(1); // Optional: thin outline for eye shape
    }

    this.ctx.fillStyle = '#000';
    let px = x, py = y - s/2;
    const p = eye/2;
    if      (dir==='up')    py -= p;
    else if (dir==='down')  py += p;
    else if (dir==='left')  px -= p;
    else if (dir==='right') px += p;

    this.ctx.beginPath();
    this.ctx.arc(px, py, eye/2, 0, Math.PI*2);
    this.ctx.fill();
  }

  public drawNPC(x:number, y:number, color:string): void {
    this.drawCharacter(x, y, 'down', false, color);
  }

  public drawSprite(
    spriteKey: string, // Key to an Image element/asset
    dx: number, dy: number, // Destination x, y on canvas
    dWidth: number, dHeight: number, // Destination width, height
    sx: number, sy: number, // Source x, y in sprite sheet
    sWidth: number, sHeight: number, // Source width, height
    flipped: boolean = false
  ): void {
    const img = document.getElementById(spriteKey) as HTMLImageElement; // Assuming images are in the DOM or loaded
    if (!img) {
      // Fallback if image not found (e.g., draw a colored rect)
      this.drawRect(dx, dy, dWidth, dHeight, '#FF00FF'); // Bright pink placeholder
      return;
    }
    this.ctx.save();
    if (flipped) {
      this.ctx.translate(dx + dWidth, dy);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
    } else {
      this.ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
    this.ctx.restore();
  }

  public drawText(txt:string, x:number, y:number, col:string='white', sz:number=16, align:CanvasTextAlign='left'): void {
    this.ctx.font = `${sz}px 'Press Start 2P', monospace`;
    this.ctx.fillStyle = col;
    this.ctx.textAlign = align;
    this.ctx.fillText(txt, x, y);
  }

  private adjustColor(col:string, amt:number): string {
    const hex = col.replace('#',''), num = parseInt(hex,16);
    let r=(num>>16)+amt, g=((num>>8)&0xff)+amt, b=(num&0xff)+amt;
    r=Math.max(0,Math.min(255,r));
    g=Math.max(0,Math.min(255,g));
    b=Math.max(0,Math.min(255,b));
    return '#' + ((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
  }
}
