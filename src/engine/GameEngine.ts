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
  private playerDir: 'up'|'down'|'left'|'right' = 'down';
  private speed = 200;
  private keys: Record<string,boolean> = {};

  private npcs: { x:number; y:number; color:string; name:string }[] = [];
  private currentRegion: string|null = null;

  /** Intro dialogue callback; set by Game.tsx */
  public onIntroDone?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d')!;
    this.rs     = new RenderSystem(this.ctx);
    this.ms     = new MapSystem();

    // Spawn center
    this.playerX = (this.ms['cols']*this.ms.tileSize)/2;
    this.playerY = (this.ms['rows']*this.ms.tileSize)/2;

    // NPCs at region endpoints
    (this.ms as any).regionDefs.forEach((r: any) => {
      const x = r.xPct * this.ms['cols'] * this.ms.tileSize;
      const y = r.yPct * this.ms['rows'] * this.ms.tileSize;
      this.npcs.push({ x,y, color:'#FFF', name:r.name });
    });

    this.attachListeners();
  }

  public start(): void {
    // trigger intro if supplied
    if (this.onIntroDone) {
      this.onIntroDone(); // Game.tsx will handle pausing until dialogues done
    } else {
      this.lastTime = performance.now();
      this.frameId = requestAnimationFrame(this.loop.bind(this));
    }
  }

  /** called by Game.tsx after intro */
  public resume(): void {
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  public resize(w:number,h:number): void {
    this.canvas.width  = w;
    this.canvas.height = h;
    // re-center on resize
    this.playerX = (this.ms['cols']*this.ms.tileSize)/2;
    this.playerY = (this.ms['rows']*this.ms.tileSize)/2;
  }

  public stop(): void {
    if (this.frameId!=null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  private attachListeners(): void {
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup',   e => this.keys[e.key.toLowerCase()] = false);
  }

  private loop(now:number): void {
    const dt = (now - this.lastTime)/1000;
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt:number): void {
    // Movement (Arrow/WASD)
    let dx=0, dy=0;
    if (this.keys['arrowleft']||this.keys['a'])   { dx=-1; this.playerDir='left'; }
    if (this.keys['arrowright']||this.keys['d'])  { dx=1;  this.playerDir='right';}
    if (this.keys['arrowup']||this.keys['w'])     { dy=-1; this.playerDir='up';   }
    if (this.keys['arrowdown']||this.keys['s'])   { dy=1;  this.playerDir='down'; }

    const len = Math.hypot(dx,dy);
    if (len>0) {
      dx/=len; dy/=len;
      this.playerX += dx*this.speed*dt;
      this.playerY += dy*this.speed*dt;
    }

    // Region detection
    const reg: MapRegion|null = this.ms.getRegionAtPosition(this.playerX,this.playerY);
    const name = reg?reg.name:null;
    if (name!==this.currentRegion) {
      this.currentRegion = name;
      console.log('Entered region',name);
      // TODO: trigger dialogue or mini-game
    }
  }

  private render(): void {
    this.rs.begin();

    // camera transform
    const tx = this.canvas.width/2 - this.playerX;
    const ty = this.canvas.height/2 - this.playerY;
    this.ctx.translate(tx,ty);

    // draw map
    this.ms.render(this.rs);

    // draw NPCs
    this.npcs.forEach(npc => {
      this.rs.drawNPC(npc.x,npc.y,npc.color);
      this.rs.drawText(npc.name,npc.x,npc.y-20,'#FFF',14,'center');
    });

    // draw player
    const moving = Object.values(this.keys).some(v=>v);
    this.rs.drawCharacter(this.playerX,this.playerY,this.playerDir,moving);

    // restore
    this.ctx.resetTransform();
    this.rs.end();
  }
}
