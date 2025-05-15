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
  private frameId: number|null = null;

  public playerX: number;
  public playerY: number;
  private playerDir: 'up'|'down'|'left'|'right' = 'down';

  // base walk speed; holding Shift doubles it
  private baseSpeed = 400;
  private keys: Record<string,boolean> = {};

  private npcs: { x:number; y:number; color:string; name:string }[] = [];
  private currentRegion: string|null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d')!;
    this.rs     = new RenderSystem(this.ctx);
    this.ms     = new MapSystem();

    // Spawn player at exact map-center
    this.playerX = (this.ms.cols * this.ms.tileSize) / 2;
    this.playerY = (this.ms.rows * this.ms.tileSize) / 2;

    // Add Bill Gates at spawn
    this.npcs.push({
      x: this.playerX, y: this.playerY,
      color: '#FFD700', name: 'Bill Gates'
    });

    // Add each region NPC
    this.ms.regionDefs.forEach(r => {
      const x = r.xPct * this.ms.cols * this.ms.tileSize;
      const y = r.yPct * this.ms.rows * this.ms.tileSize;
      this.npcs.push({ x, y, color: '#FFF', name: r.name });
    });

    this.attachListeners();
  }

  /** Begin the game loop */
  public start(): void {
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  /** Resize canvas & recenter player */
  public resize(w:number,h:number): void {
    this.canvas.width  = w;
    this.canvas.height = h;
    this.playerX = (this.ms.cols * this.ms.tileSize)/2;
    this.playerY = (this.ms.rows * this.ms.tileSize)/2;
  }

  /** Stop updates */
  public stop(): void {
    if (this.frameId != null) cancelAnimationFrame(this.frameId);
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
    // movement input
    let dx=0, dy=0;
    if (this.keys['arrowleft']||this.keys['a'])     { dx=-1; this.playerDir='left';  }
    if (this.keys['arrowright']||this.keys['d'])    { dx= 1; this.playerDir='right'; }
    if (this.keys['arrowup']||this.keys['w'])       { dy=-1; this.playerDir='up';    }
    if (this.keys['arrowdown']||this.keys['s'])     { dy= 1; this.playerDir='down';  }

    // sprint if holding Shift
    const speed = this.baseSpeed * (this.keys['shift'] ? 2 : 1);

    const len = Math.hypot(dx,dy);
    if (len > 0) {
      dx/=len; dy/=len;
      this.playerX += dx * speed * dt;
      this.playerY += dy * speed * dt;
    }

    // region detection
    const reg: MapRegion|null = this.ms.getRegionAtPosition(this.playerX,this.playerY);
    const name = reg ? reg.name : null;
    if (name !== this.currentRegion) {
      this.currentRegion = name;
      console.log('Entered region:', name);
      // TODO: trigger dialogue / mini-game here
    }
  }

  private render(): void {
    // calculate camera offsets
    const viewW = this.canvas.width, viewH = this.canvas.height;
    const camX  = this.playerX - viewW/2;
    const camY  = this.playerY - viewH/2;

    this.rs.begin();

    // center camera
    this.ctx.translate(-camX, -camY);

    // draw map & decorations (culled)
    this.ms.render(this.rs, camX, camY, viewW, viewH);

    // draw NPCs within view
    this.npcs.forEach(npc => {
      if (
        npc.x >= camX - 50 && npc.x <= camX + viewW + 50 &&
        npc.y >= camY - 50 && npc.y <= camY + viewH + 50
      ) {
        this.rs.drawNPC(npc.x, npc.y, npc.color);
        this.rs.drawText(npc.name, npc.x, npc.y - 20, '#FFF', 14, 'center');
      }
    });

    // draw player
    const moving = Object.values(this.keys).some(v => v);
    this.rs.drawCharacter(this.playerX, this.playerY, this.playerDir, moving);

    // reset and finish
    this.ctx.resetTransform();
    this.rs.end();
  }
}
