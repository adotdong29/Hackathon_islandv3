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
  baseSpeed: number;
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
    baseSpeed: 360,
  };

  private keys = new Set<string>();

  private regionGames: Record<string, () => IMinigame> = {
    hardwareZone:   () => new HardwareAssemblyGame(),
    softwareValley: () => new SoftwareMazeGame(),
    arcadeCove:     () => new ArcadeHistoryGame(),
    consoleIsland:  () => new TVAssemblyGame(),
    mobileBay:      () => new MobileT9Game(),
    internetPoint:  () => new InternetTroubleshootGame(),
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.rs     = new RenderSystem(canvas.getContext('2d')!);
    this.mapSys = new MapSystem();
    this.loader = new MinigameLoader(canvas);

    const cx = (this.mapSys.cols * this.mapSys.tileSize) / 2;
    const cy = (this.mapSys.rows * this.mapSys.tileSize) / 2;
    this.player.x = cx;
    this.player.y = cy;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup',   this.handleKeyUp);
  }

  public start(): void {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(ts => this.loop(ts));
  }

  public stop(): void {
    this.running = false;
  }

  public resize(width: number, height: number): void {
    this.canvas.width  = width;
    this.canvas.height = height;
  }

  private loop(timestamp: number): void {
    if (!this.running) return;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.loader.isGameActive()) {
      this.update(dt);
      this.render();
    }

    requestAnimationFrame(ts => this.loop(ts));
  }

  private update(dt: number): void {
    let dx = 0, dy = 0;
    const k = this.keys;

    if (k.has('arrowup')    || k.has('w')) { dy -= 1; this.player.dir = 'up'; }
    if (k.has('arrowdown')  || k.has('s')) { dy += 1; this.player.dir = 'down'; }
    if (k.has('arrowleft')  || k.has('a')) { dx -= 1; this.player.dir = 'left'; }
    if (k.has('arrowright') || k.has('d')) { dx += 1; this.player.dir = 'right'; }

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;

      const sprint = k.has('shift');
      const speed  = this.player.baseSpeed * (sprint ? 3 : 1);
      const dist   = speed * (dt / 1000);

      const nx = this.player.x + dx * dist;
      const ny = this.player.y + dy * dist;

      if (this.mapSys.isWalkable(nx, ny)) {
        this.player.x = nx;
        this.player.y = ny;
      }

      this.player.moving = true;
    } else {
      this.player.moving = false;
    }

    this.mapSys.setCameraTarget(this.player.x, this.player.y);
    this.mapSys.update();
  }

  private render(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.rs.begin();
    this.mapSys.render(
      this.rs,
      this.mapSys.viewportX,
      this.mapSys.viewportY,
      w, h
    );

    for (const rd of this.mapSys.regionDefs) {
      const wx = rd.xPct * this.mapSys.cols * this.mapSys.tileSize;
      const wy = rd.yPct * this.mapSys.rows * this.mapSys.tileSize;
      const sx = wx - this.mapSys.viewportX;
      const sy = wy - this.mapSys.viewportY;
      this.rs.drawNPC(sx, sy, '#FF4081');
    }

    const px = this.player.x - this.mapSys.viewportX;
    const py = this.player.y - this.mapSys.viewportY;
    this.rs.drawCharacter(px, py, this.player.dir, this.player.moving);

    this.rs.drawText(
      'Arrows/WASD + Shift to sprint, Space near NPC',
      w / 2, h - 10,
      '#FFF', 14, 'center'
    );

    this.rs.end();
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    if (key === ' ' || key === 'spacebar') {
      const region = this.mapSys.getRegionAtPosition(this.player.x, this.player.y);
      if (region && this.regionGames[region.name]) {
        const game = this.regionGames[region.name]();
        this.loader.load(game);
      }
      return;
    }

    this.keys.add(key);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
  };
}
