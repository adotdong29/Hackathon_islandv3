// src/engine/GameEngine.ts

import { RenderSystem } from './RenderSystem';
import { MapSystem }    from './MapSystem';
import { MapRegion }    from '../types/GameTypes';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx:    CanvasRenderingContext2D;
  private rs:     RenderSystem;
  private ms:     MapSystem;

  private lastTime = 0;
  private frameId: number | null = null;

  public playerX: number;
  public playerY: number;
  private dir: 'up'|'down'|'left'|'right' = 'down';
  private speed = 400;
  private keys: Record<string,boolean> = {};

  private npcs: { x:number; y:number; color:string; name:string }[] = [];
  private currentRegion: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d')!;
    this.rs     = new RenderSystem(this.ctx);
    this.ms     = new MapSystem();

    // spawn in center
    this.playerX = (this.ms.cols*this.ms.tileSize)/2;
    this.playerY = (this.ms.rows*this.ms.tileSize)/2;

    // Bill Gates at spawn
    this.npcs.push({
      x: this.playerX,
      y: this.playerY,
      color:'#FFD700',
      name:'Bill Gates'
    });

    // add region NPCs
    this.ms.regionDefs.forEach(r => {
      const x = r.xPct * this.ms.cols * this.ms.tileSize;
      const y = r.yPct * this.ms.rows * this.ms.tileSize;
      this.npcs.push({ x,y, color:'#FFF', name:r.name });
    });

    this.attachListeners();
  }

  public start() {
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  public resize(w:number,h:number) {
    this.canvas.width = w; this.canvas.height = h;
  }

  public stop() {
    if(this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  private attachListeners() {
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()]=true);
    window.addEventListener('keyup',   e => this.keys[e.key.toLowerCase()]=false);
  }

  private loop(now:number) {
    const dt = (now - this.lastTime)/1000;
    this.lastTime = now;
    this.update(dt);
    this.render();
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt:number) {
    let dx=0, dy=0;
    if(this.keys['a']||this.keys['arrowleft'])  { dx=-1; this.dir='left'; }
    if(this.keys['d']||this.keys['arrowright']) { dx= 1; this.dir='right';}
    if(this.keys['w']||this.keys['arrowup'])    { dy=-1; this.dir='up';   }
    if(this.keys['s']||this.keys['arrowdown'])  { dy= 1; this.dir='down'; }

    const len = Math.hypot(dx,dy);
    if(len>0){
      dx/=len; dy/=len;
      let sp = this.speed * (this.keys['shift']?2:1);
      this.playerX += dx*sp*dt;
      this.playerY += dy*sp*dt;
    }

    // region change
    const reg = this.ms.getRegionAtPosition(this.playerX, this.playerY);
    const name = reg?reg.name:null;
    if(name !== this.currentRegion){
      this.currentRegion = name;
      console.log('Entered:',name);
    }
  }

  private render() {
    // world render
    const vw = this.canvas.width, vh = this.canvas.height;
    const camX = this.playerX - vw/2, camY = this.playerY - vh/2;

    this.rs.begin();
    this.ctx.translate(-camX, -camY);
    this.ms.render(this.rs, camX, camY, vw, vh);

    // NPCs
    for(const npc of this.npcs){
      if(Math.abs(npc.x - this.playerX) < this.ms.cols*this.ms.tileSize &&
         Math.abs(npc.y - this.playerY) < this.ms.rows*this.ms.tileSize){
        this.rs.drawNPC(npc.x, npc.y, npc.color);
        this.rs.drawText(npc.name, npc.x, npc.y-20, '#FFF',14,'center');
      }
    }

    // player
    const moving = Object.values(this.keys).some(v=>v);
    this.rs.drawCharacter(this.playerX, this.playerY, this.dir, moving);

    this.ctx.resetTransform();
    this.rs.end();

    // mini-map
    const mmSize = 150, mmX = 10, mmY = 10;
    const mapW = this.ms.cols*this.ms.tileSize,
          mapH = this.ms.rows*this.ms.tileSize,
          scale = mmSize/Math.max(mapW,mapH);

    // background
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(mmX,mmY,mmSize,mmSize);

    // viewport rectangle
    this.ctx.strokeStyle = '#fff'; this.ctx.lineWidth=2;
    this.ctx.strokeRect(
      mmX + camX*scale,
      mmY + camY*scale,
      vw*scale,
      vh*scale
    );

    // player dot
    this.ctx.fillStyle = '#f00';
    this.ctx.fillRect(
      mmX + this.playerX*scale - 3,
      mmY + this.playerY*scale - 3,
      6,6
    );

    // region endpoints
    this.ctx.fillStyle = '#ff0';
    for(const r of this.ms.regionDefs){
      const ex = r.xPct * mapW,
            ey = r.yPct * mapH;
      this.ctx.fillRect(mmX + ex*scale - 4, mmY + ey*scale - 4, 8,8);
    }
  }
}
