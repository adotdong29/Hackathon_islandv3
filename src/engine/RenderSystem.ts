// src/engine/RenderSystem.ts

import { TileType } from '../types/GameTypes';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }
  public begin() { this.ctx.save(); }
  public end()   { this.ctx.restore(); }

  // ————————————————— Background & Tiles —————————————————

  public renderBackground() {
    const { width, height } = this.ctx.canvas;
    this.ctx.fillStyle = '#004080';
    this.ctx.fillRect(0, 0, width, height);
  }

  public drawRect(x: number, y: number, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  public drawTile(x: number, y: number, size: number, type: TileType) {
    let color = '#0077BE';
    switch (type) {
      case 'grass':    color = '#38B000'; break;
      case 'sand':     color = '#FFD166'; break;
      case 'path':     color = '#A57939'; break;
      case 'building': color = '#EF476F'; break;
      case 'obstacle': color = '#073B4C'; break;
    }
    this.drawRect(x, y, size, size, color);

    // grid/highlight
    if (type === 'path') {
      this.ctx.strokeStyle = 'rgba(255,255,0,0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x+1,y+1,size-2,size-2);
    } else {
      this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x,y,size,size);
    }
  }

  // ————————————————— Bridges, Gates, Platforms —————————————————

  /** Simple wooden bridge across one tile */
  public drawBridge(cx: number, cy: number, size: number = 32) {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size/2, cy - 4, size, 8);
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cx - size/2, cy - 4, size, 8);
  }

  /** Shrine‐style gate */
  public drawGate(cx: number, cy: number, size: number = 48) {
    const h = size, w = size*0.2;
    this.ctx.fillStyle = '#FF4500';
    // posts
    this.ctx.fillRect(cx - size/2, cy - h, w, h);
    this.ctx.fillRect(cx + size/2 - w, cy - h, w, h);
    // lintel
    this.ctx.fillRect(cx - size/2, cy - h, size, w);
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(cx - size/2, cy - h, size, w);
  }

  /** Circular stone platform */
  public drawPlatform(cx: number, cy: number, size: number = 64) {
    this.ctx.fillStyle = '#888';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  // ————————————————— Pathside Decorations —————————————————

  public drawCherryBlossom(cx: number, cy: number, size: number) {
    const ctx = this.ctx;
    // trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(cx - size*0.05, cy, size*0.1, size*0.4);
    // blossoms
    for (let i=0;i<6;i++){
      const a = Math.random()*2*Math.PI, r = size*0.3*Math.random();
      const bx = cx + Math.cos(a)*r, by = cy - size*0.2 + Math.sin(a)*r;
      ctx.fillStyle = '#FFC0CB';
      ctx.beginPath();
      ctx.arc(bx,by,size*0.12,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#FF69B4'; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  public drawLantern(cx: number, cy: number, size: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(0, 0, size*0.5, size, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#FF4500'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0,size); ctx.lineTo(0,size+12); ctx.stroke();
    ctx.restore();
  }

  // ————————————————— Existing Trees, Houses, etc. —————————————————

  public drawTree(cx: number, cy: number, size: number) {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size/8, cy, size/4, size/2);
    this.ctx.fillStyle = '#006400';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    this.ctx.fill();
  }

  public drawHouse(cx: number, cy: number, size: number) {
    this.ctx.fillStyle = '#A0522D';
    this.ctx.fillRect(cx - size/2, cy - size/2, size, size);
    this.ctx.fillStyle = '#8B0000';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size/2, cy - size/2);
    this.ctx.lineTo(cx, cy - size);
    this.ctx.lineTo(cx + size/2, cy - size/2);
    this.ctx.closePath(); this.ctx.fill();
  }

  public drawMountain(cx: number, cy: number, size: number) {
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size, cy + size);
    this.ctx.lineTo(cx + size, cy + size);
    this.ctx.closePath(); this.ctx.fill();
    // snowcap
    this.ctx.fillStyle = '#EEE';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.lineTo(cx - size*0.4, cy - size*0.2);
    this.ctx.lineTo(cx + size*0.4, cy - size*0.2);
    this.ctx.closePath(); this.ctx.fill();
  }

  public drawBamboo(cx: number, cy: number, height: number) {
    const w = 4;
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(cx - w/2, cy - height, w, height);
    this.ctx.strokeStyle = '#196619'; this.ctx.lineWidth = 2;
    const segs = Math.floor(height/10);
    for (let i=1;i<=segs;i++){
      const y = cy - (i*height/segs);
      this.ctx.beginPath(); this.ctx.moveTo(cx - w/2, y);
      this.ctx.lineTo(cx + w/2, y); this.ctx.stroke();
    }
  }

  public drawPalm(cx: number, cy: number, size: number) {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(cx - size/8, cy - size, size/4, size);
    this.ctx.strokeStyle = '#228B22'; this.ctx.lineWidth = 3;
    for (let i=0;i<5;i++){
      const angle = Math.PI/2 + (i-2)*0.5;
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

  public drawBird(cx: number, cy: number, size: number) {
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(cx,cy,size/2,0,2*Math.PI);
    this.ctx.fill();
    this.ctx.strokeStyle='#000'; this.ctx.lineWidth=2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx-size/2,cy);
    this.ctx.lineTo(cx-size,cy-size/2);
    this.ctx.moveTo(cx+size/2,cy);
    this.ctx.lineTo(cx+size,cy-size/2);
    this.ctx.stroke();
  }

  // ————————————————— Characters & Text —————————————————

  public drawCharacter(
    x:number,y:number,
    dir:'up'|'down'|'left'|'right',
    moving:boolean,
    color:string='#FFD700'
  ) {
    const size = 32;
    // shadow
    this.ctx.fillStyle='rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x,y+size/2, size/3, size/6,0,0,2*Math.PI);
    this.ctx.fill();
    // gradient
    const grad = this.ctx.createLinearGradient(
      x-size/2,y-size/2,x+size/2,y+size/2
    );
    grad.addColorStop(0,color);
    grad.addColorStop(1,this.adjustColor(color,-30));
    this.ctx.fillStyle=grad;
    // head
    this.ctx.beginPath();
    this.ctx.arc(x, y-size/2, size/3, 0, 2*Math.PI);
    this.ctx.fill();
    // body
    this.ctx.fillRect(x-size/4, y-size/2+size/3, size/2, size/2);
    // legs
    this.ctx.fillStyle=this.adjustColor(color,-20);
    if(moving){
      const t=Date.now()/200, off=Math.sin(t)*5;
      this.ctx.fillRect(x-size/4,y,size/4,size/3+off);
      this.ctx.fillRect(x,y,size/4,size/3-off);
    } else {
      this.ctx.fillRect(x-size/4,y,size/4,size/3);
      this.ctx.fillRect(x,y,size/4,size/3);
    }
    this.drawEyes(x,y,size,dir);
  }

  private drawEyes(x:number,y:number,size:number,dir:'up'|'down'|'left'|'right'){
    const eye=size/8,off=size/6;
    this.ctx.fillStyle='#fff'; this.ctx.strokeStyle='#000'; this.ctx.lineWidth=2;
    let dy=dir==='up'? -size/2-off: dir==='down'? -size/2+off: -size/2;
    if(dir!=='right'){
      this.ctx.beginPath();
      this.ctx.arc(x-off,y+dy,eye,0,2*Math.PI);
      this.ctx.arc(x+off,y+dy,eye,0,2*Math.PI);
      this.ctx.fill(); this.ctx.stroke();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x+size/4,y-size/2,eye,0,2*Math.PI);
      this.ctx.fill(); this.ctx.stroke();
    }
    this.ctx.fillStyle='#000';
    let px=x, py=y-size/2;
    const p=eye/2;
    if(dir==='up')    py-=p;
    else if(dir==='down') py+=p;
    else if(dir==='left') px-=p;
    else if(dir==='right')px+=p;
    this.ctx.beginPath();
    this.ctx.arc(px,py,eye/2,0,2*Math.PI);
    this.ctx.fill();
  }

  public drawNPC(x:number,y:number,color:string){
    this.drawCharacter(x,y,'down',false,color);
  }

  public drawText(
    txt:string,x:number,y:number,
    col:string='white', sz:number=16,
    align:CanvasTextAlign='left'
  ) {
    this.ctx.font = `${sz}px 'Press Start 2P',monospace`;
    this.ctx.fillStyle=col;
    this.ctx.textAlign=align;
    this.ctx.fillText(txt,x,y);
  }

  private adjustColor(c:string,a:number):string {
    const hex=c.replace('#',''), num=parseInt(hex,16);
    let r=(num>>16)+a, g=((num>>8)&0xff)+a, b=(num&0xff)+a;
    r=Math.max(0,Math.min(255,r));
    g=Math.max(0,Math.min(255,g));
    b=Math.max(0,Math.min(255,b));
    return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
  }
}
