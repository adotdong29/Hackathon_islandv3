import { TileType } from '../types/GameTypes';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  public begin(): void { this.ctx.save(); }
  public end(): void   { this.ctx.restore(); }

  // — Tiles —
  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  public drawTile(x: number, y: number, size: number, type: TileType): void {
    let color = '#0077BE'; // water
    switch (type) {
      case 'grass':    color = '#38B000'; break;
      case 'sand':     color = '#FFD166'; break;
      case 'path':     color = '#A57939'; break;
      case 'building': color = '#EF476F'; break;
      case 'obstacle': color = '#073B4C'; break;
    }
    this.drawRect(x, y, size, size, color);
    this.ctx.strokeStyle = type === 'path'
      ? 'rgba(255,255,0,0.2)'
      : 'rgba(0,0,0,0.1)';
    this.ctx.lineWidth = type === 'path' ? 2 : 1;
    this.ctx.strokeRect(
      x + (type==='path'?1:0),
      y + (type==='path'?1:0),
      size - (type==='path'?2:0),
      size - (type==='path'?2:0)
    );
  }

  // — Large landmarks —
  public drawBridge(cx: number, cy: number, size = 32): void {
    this.ctx.fillStyle   = '#8B4513';
    this.ctx.fillRect(cx - size/2, cy - 4, size, 8);
    this.ctx.strokeStyle = '#000'; this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cx - size/2, cy - 4, size, 8);
  }
  public drawGate(cx: number, cy: number, size = 48): void {
    const h = size, w = size * 0.2;
    this.ctx.fillStyle   = '#FF4500';
    this.ctx.fillRect(cx - size/2, cy - h,      w, h);
    this.ctx.fillRect(cx + size/2 - w, cy - h,  w, h);
    this.ctx.fillRect(cx - size/2, cy - h,   size, w);
    this.ctx.strokeStyle = '#000'; this.ctx.lineWidth = 3;
    this.ctx.strokeRect(cx - size/2, cy - h, size, w);
  }
  public drawPlatform(cx: number, cy: number, size = 64): void {
    this.ctx.fillStyle   = '#888';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#000'; this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }
  public drawPond(cx: number, cy: number, radius: number): void {
    this.ctx.fillStyle   = '#40C4FF';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, radius*1.2, radius, 0, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#0288D1'; this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  // — Biome decorations —
  public drawTree(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size/8, cy, size/4, size/2);
    this.ctx.fillStyle = '#006400';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    this.ctx.fill();
  }
  public drawHouse(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#A0522D';
    this.ctx.fillRect(cx - size/2, cy - size/2, size, size);
    this.ctx.fillStyle = '#8B0000';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size/2, cy - size/2);
    this.ctx.lineTo(cx, cy - size);
    this.ctx.lineTo(cx + size/2, cy - size/2);
    this.ctx.closePath();
    this.ctx.fill();
  }
  public drawMountain(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size, cy + size);
    this.ctx.lineTo(cx + size, cy + size);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.fillStyle = '#EEE';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size*0.4, cy - size*0.2);
    this.ctx.lineTo(cx + size*0.4, cy - size*0.2);
    this.ctx.closePath();
    this.ctx.fill();
  }
  public drawBamboo(cx: number, cy: number, height: number): void {
    const w = 4;
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(cx - w/2, cy - height, w, height);
    this.ctx.strokeStyle = '#196619'; this.ctx.lineWidth = 2;
    const segs = Math.floor(height/10);
    for (let i=1; i<=segs; i++){
      const y = cy - (i*height/segs);
      this.ctx.beginPath();
      this.ctx.moveTo(cx - w/2, y);
      this.ctx.lineTo(cx + w/2, y);
      this.ctx.stroke();
    }
  }
  public drawPalm(cx: number, cy: number, size: number): void {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size/8, cy - size, size/4, size);
    this.ctx.strokeStyle = '#228B22'; this.ctx.lineWidth = 3;
    for (let i=0; i<5; i++){
      const ang = Math.PI/2 + (i-2)*0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - size);
      this.ctx.quadraticCurveTo(
        cx + Math.cos(ang)*size,
        cy - size + Math.sin(ang)*size,
        cx + Math.cos(ang)*size*1.2,
        cy - size + Math.sin(ang)*size*1.2
      );
      this.ctx.stroke();
    }
  }
  public drawLantern(cx: number, cy: number, size: number): void {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.ellipse(0,0,size*0.5,size,0,0,Math.PI*2);
    this.ctx.fill();
    this.ctx.strokeStyle='#000'; this.ctx.lineWidth=2; this.ctx.stroke();
    this.ctx.strokeStyle='#FF4500'; this.ctx.lineWidth=3;
    this.ctx.beginPath(); this.ctx.moveTo(0,size); this.ctx.lineTo(0,size+12); this.ctx.stroke();
    this.ctx.restore();
  }
  public drawCherryBlossom(cx: number, cy: number, size: number): void {
    // trunk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size*0.05, cy, size*0.1, size*0.4);
    // blossoms
    for (let i=0; i<6; i++){
      const a = Math.random()*2*Math.PI,
            r = size*0.3*Math.random(),
            bx = cx + Math.cos(a)*r,
            by = cy - size*0.2 + Math.sin(a)*r;
      this.ctx.fillStyle   = '#FFC0CB';
      this.ctx.beginPath();
      this.ctx.arc(bx, by, size*0.12, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#FF69B4';
      this.ctx.lineWidth   = 1;
      this.ctx.stroke();
    }
  }

  // — Characters & text —
  public drawCharacter(
    x: number, y: number,
    dir: 'up'|'down'|'left'|'right',
    moving: boolean,
    color = '#FFD700'
  ): void {
    const s = 32;
    // shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + s/2, s/3, s/6, 0, 0, Math.PI*2);
    this.ctx.fill();
    // body gradient
    const g = this.ctx.createLinearGradient(x-s/2,y-s/2,x+s/2,y+s/2);
    g.addColorStop(0, color);
    g.addColorStop(1, this.adjustColor(color, -30));
    this.ctx.fillStyle = g;
    // head
    this.ctx.beginPath(); this.ctx.arc(x, y - s/2, s/3, 0, Math.PI*2); this.ctx.fill();
    // torso
    this.ctx.fillRect(x - s/4, y - s/2 + s/3, s/2, s/2);
    // legs
    this.ctx.fillStyle = this.adjustColor(color, -20);
    if (moving) {
      const t = Date.now()/200, off = Math.sin(t)*5;
      this.ctx.fillRect(x - s/4, y, s/4, s/3 + off);
      this.ctx.fillRect(x,          y, s/4, s/3 - off);
    } else {
      this.ctx.fillRect(x - s/4, y, s/4, s/3);
      this.ctx.fillRect(x,          y, s/4, s/3);
    }
    this.drawEyes(x, y, s, dir);
  }
  private drawEyes(
    x:number, y:number, s:number,
    dir:'up'|'down'|'left'|'right'
  ): void {
    const eye = s/8, off = s/6;
    this.ctx.fillStyle   = '#fff';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth   = 2;
    let dy = dir==='up'   ? -s/2 - off
           : dir==='down' ? -s/2 + off
           :                 -s/2;
    if (dir!=='right') {
      this.ctx.beginPath();
      this.ctx.arc(x-off, y+dy, eye, 0, Math.PI*2);
      this.ctx.arc(x+off, y+dy, eye, 0, Math.PI*2);
      this.ctx.fill(); this.ctx.stroke();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x+s/4, y-s/2, eye, 0, Math.PI*2);
      this.ctx.fill(); this.ctx.stroke();
    }
    this.ctx.fillStyle = '#000';
    let px = x, py = y - s/2, p = eye/2;
    if      (dir==='up')    py -= p;
    else if (dir==='down')  py += p;
    else if (dir==='left')  px -= p;
    else if (dir==='right') px += p;
    this.ctx.beginPath();
    this.ctx.arc(px, py, eye/2, 0, Math.PI*2);
    this.ctx.fill();
  }
  public drawNPC(x: number, y: number, color: string): void {
    this.drawCharacter(x, y, 'down', false, color);
  }
  public drawText(
    txt: string, x: number, y: number,
    col = 'white', sz = 16,
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.font      = `${sz}px 'Press Start 2P', monospace`;
    this.ctx.fillStyle = col;
    this.ctx.textAlign = align;
    this.ctx.fillText(txt, x, y);
  }

  // stub for any sprite calls
  public drawSprite(
    _key: string,
    dx: number, dy: number,
    dW: number, dH: number,
    _sx: number, _sy: number,
    _sW: number, _sH: number,
    flipped = false
  ): void {
    // fallback to drawing a character placeholder
    this.drawCharacter(dx + dW/2, dy + dH/2, flipped ? 'left' : 'right', false);
  }

  private adjustColor(col:string, amt:number): string {
    const hex = col.replace('#',''), num = parseInt(hex,16);
    let r=(num>>16)+amt, g=((num>>8)&0xff)+amt, b=(num&0xff)+amt;
    r=Math.max(0,Math.min(255,r));
    g=Math.max(0,Math.min(255,g));
    b=Math.max(0,Math.min(255,b));
    return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
  }
}
