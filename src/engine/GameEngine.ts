// src/engine/GameEngine.ts

import { RenderSystem }        from './RenderSystem';
import { MapSystem }           from './MapSystem';
import { IMinigame }           from '../minigames/IMinigame';
import { MinigameLoader }      from '../minigames/MinigameLoader';
import { HardwareAssemblyGame } from '../minigames/HardwareAssemblyGame';
import { SoftwareMazeGame }    from '../minigames/SoftwareMazeGame';
import { ArcadeHistoryGame }   from '../minigames/ArcadeHistory';
import { TVAssemblyGame }      from '../minigames/TVAssemblyGame';
import { MobileT9Game }        from '../minigames/MobileT9Game';
import { InternetTroubleshootGame } from '../minigames/InternetTroubleshootGame';

interface Player {
  x: number;
  y: number;
  dir: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  baseSpeed: number; // pixels per second
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private rs: RenderSystem;
  private mapSys: MapSystem;
  private loader: MinigameLoader;

  private lastTime = 0;
  private running = false;

  private player: Player = {
    x: 0,
    y: 0,
    dir: 'down',
    moving: false,
    baseSpeed: 120,
  };

  /** Currently pressed keys (lowercased) */
  private keys = new Set<string>();

  /** Map each region name to its minigame constructor */
  private regionGames: Record<string, () => IMinigame> = {
    hardwareZone:   () => new HardwareAssemblyGame(),
    // softwareValley: () => new SoftwareMazeGame(),
    // arcadeCove:     () => new ArcadeHistoryGame(),
    // consoleIsland:  () => new TVAssemblyGame(),
    // mobileBay:      () => new MobileT9Game(),
    // internetPoint:  () => new InternetTroubleshootGame(),
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.rs     = new RenderSystem(canvas.getContext('2d')!);
    this.mapSys = new MapSystem();
    this.loader = new MinigameLoader(canvas);

    // Place player at island center
    const cx = (this.mapSys.cols * this.mapSys.tileSize) / 2;
    const cy = (this.mapSys.rows * this.mapSys.tileSize) / 2;
    this.player.x = cx;
    this.player.y = cy;

    // Key listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup',   this.handleKeyUp);
  }

  /** Start the game loop */
  public start(): void {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(ts => this.loop(ts));
  }

  /** Stop the game loop */
  public stop(): void {
    this.running = false;
  }

  /** Resize the canvas on window change */
  public resize(width: number, height: number): void {
    this.canvas.width  = width;
    this.canvas.height = height;
  }

  /** Main loop */
  private loop(timestamp: number): void {
    if (!this.running) return;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // If no minigame active, update and render world
    if (!this.loader['current']) {
      this.update(dt);
      this.render();
    }

    requestAnimationFrame(ts => this.loop(ts));
  }

  /** Update world state */
  private update(dt: number): void {
    let dx = 0, dy = 0;
    const k = this.keys;

    // Movement input
    if (k.has('arrowup')    || k.has('w')) { dy -= 1; this.player.dir = 'up'; }
    if (k.has('arrowdown')  || k.has('s')) { dy += 1; this.player.dir = 'down'; }
    if (k.has('arrowleft')  || k.has('a')) { dx -= 1; this.player.dir = 'left'; }
    if (k.has('arrowright') || k.has('d')) { dx += 1; this.player.dir = 'right'; }

    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      // Sprint if Shift is held
      const sprint = k.has('shift');
      const speed  = this.player.baseSpeed * (sprint ? 1.5 : 1);
      const dist   = speed * (dt / 1000);

      const nx = this.player.x + dx * dist;
      const ny = this.player.y + dy * dist;

      // Collision: prevent walking on water
      if (this.mapSys.isWalkable(nx, ny)) {
        this.player.x = nx;
        this.player.y = ny;
      }

      this.player.moving = true;
    } else {
      this.player.moving = false;
    }

    // Update camera to follow player
    this.mapSys.setCameraTarget(this.player.x, this.player.y);
    this.mapSys.update();
  }

  /** Render world */
  private render(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.rs.begin();

    // Draw map & decorations
    this.mapSys.render(
      this.rs,
      this.mapSys.viewportX,
      this.mapSys.viewportY,
      w, h
    );

    // Draw NPCs at each region center
    for (const rd of this.mapSys.regionDefs) {
      const wx = rd.xPct * this.mapSys.cols * this.mapSys.tileSize;
      const wy = rd.yPct * this.mapSys.rows * this.mapSys.tileSize;
      const sx = wx - this.mapSys.viewportX;
      const sy = wy - this.mapSys.viewportY;
      this.rs.drawNPC(sx, sy, '#FF4081');
    }

    // Draw player character
    const px = this.player.x - this.mapSys.viewportX;
    const py = this.player.y - this.mapSys.viewportY;
    this.rs.drawCharacter(px, py, this.player.dir, this.player.moving);

    // UI hint
    this.rs.drawText(
      'Arrows/WASD + Shift to sprint, Space near NPC',
      w / 2, h - 10,
      '#FFF', 14, 'center'
    );

    this.rs.end();
  }

  /** Handle keydown */
  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    // Spacebar launches minigame if near region NPC
    if (key === ' ' || key === 'spacebar') {
      const region = this.mapSys.getRegionAtPosition(this.player.x, this.player.y);
      if (region && this.regionGames[region.name]) {
        const game = this.regionGames[region.name]();
        this.loader.load(game);
      }
      return;
    }

    // Otherwise track movement/sprint keys
    this.keys.add(key);
  };

  /** Handle keyup */
  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
  };
}
