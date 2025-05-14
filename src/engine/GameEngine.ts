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
  private speed = 200; // px/sec
  private keys: Record<string, boolean> = {};

  private npcs: { x:number; y:number; color:string; name:string }[] = [];
  private currentRegion: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d')!;
    this.rs     = new RenderSystem(this.ctx);
    this.ms     = new MapSystem();

    // Spawn player at map-center
    // Map is cols×tileSize by rows×tileSize
    this.playerX = (this.ms['cols'] * this.ms.tileSize) / 2;
    this.playerY = (this.ms['rows'] * this.ms.tileSize) / 2;

    // Build NPC list from the same regionDefs
    (this.ms as any).regionDefs.forEach((r: any) => {
      const x = r.xPct * this.ms['cols'] * this.ms.tileSize;
      const y = r.yPct * this.ms['rows'] * this.ms.tileSize;
      this.npcs.push({ x, y, color:'#FFF', name:r.name });
    });

    this.attachListeners();
  }

  /** Kick off the loop */
  public start(): void {
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  /** Resize canvas & recenter */
  public resize(w: number, h: number): void {
    this.canvas.width  = w;
    this.canvas.height = h;
    this.playerX = (this.ms['cols'] * this.ms.tileSize) / 2;
    this.playerY = (this.ms['rows'] * this.ms.tileSize) / 2;
  }

  /** Stop the loop */
  public stop(): void {
    if (this.frameId != null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  private attachListeners(): void {
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup',   e => this.keys[e.key.toLowerCase()] = false);
  }

  private loop(now: number): void {
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number): void {
    // Movement
    let dx = 0, dy = 0;
    if (this.keys['arrowleft'] || this.keys['a'])  { dx = -1; this.playerDir = 'left';  }
    if (this.keys['arrowright']|| this.keys['d'])  { dx =  1; this.playerDir = 'right'; }
    if (this.keys['arrowup']   || this.keys['w'])  { dy = -1; this.playerDir = 'up';    }
    if (this.keys['arrowdown'] || this.keys['s'])  { dy =  1; this.playerDir = 'down';  }

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len; dy /= len;
      this.playerX += dx * this.speed * dt;
      this.playerY += dy * this.speed * dt;
    }

    // Region detection
    const region: MapRegion | null = this.ms.getRegionAtPosition(this.playerX, this.playerY);
    const name = region ? region.name : null;
    if (name !== this.currentRegion) {
      this.currentRegion = name;
      console.log('Now in region:', name);
      // TODO: trigger NPC dialogue / mini-game
    }
  }

  private render(): void {
    // 1) Clear & apply camera transform
    this.rs.begin();
    const tx = this.canvas.width  / 2 - this.playerX;
    const ty = this.canvas.height / 2 - this.playerY;
    this.ctx.translate(tx, ty);

    // 2) Draw the big island & decorations
    this.ms.render(this.rs);

    // 3) Draw NPCs
    this.npcs.forEach(npc => {
      this.rs.drawNPC(npc.x, npc.y, npc.color);
      this.rs.drawText(npc.name, npc.x, npc.y - 20, '#FFF', 14, 'center');
    });

    // 4) Draw player
    const moving = Object.values(this.keys).some(k => k);
    this.rs.drawCharacter(this.playerX, this.playerY, this.playerDir, moving);

    // 5) Restore transform & finish
    this.ctx.resetTransform();
    this.rs.end();
  }
}
