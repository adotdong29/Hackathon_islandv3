import { RenderSystem } from './RenderSystem';
import { MapSystem }    from './MapSystem';
import { IMinigame }    from '../minigames/IMinigame';
import { MinigameLoader } from '../minigames/Minigameloader';
import { HardwareAssemblyGame } from '../minigames/HardwareAssemblyGame';
import { InputSystem } from './InputSystem';
import { CharacterSystem } from './CharacterSystem';
import { SpriteSystem } from './SpriteSystem'; // If using sprite animations
// import other games similarly...

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private rs: RenderSystem;
  private mapSys: MapSystem;
  private loader: MinigameLoader;
  private inputSystem: InputSystem;
  private characterSystem: CharacterSystem;
  private spriteSystem: SpriteSystem; // For sprite animations
  private lastTime = 0;
  private running = false;

  // map region → minigame constructor
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
    this.inputSystem = new InputSystem(canvas);
    this.characterSystem = new CharacterSystem();
    this.spriteSystem = new SpriteSystem(); // Initialize SpriteSystem

    // Set player's initial position to map center
    const player = this.characterSystem.getPlayer();
    if (player) {
      const cx = (this.mapSys.cols * this.mapSys.tileSize) / 2;
      const cy = (this.mapSys.rows * this.mapSys.tileSize) / 2;
      player.x = cx;
      player.y = cy;
    }

    // space to start minigame
    window.addEventListener('keydown', e => {
      if (e.key === ' ') {
        const playerPos = this.characterSystem.getPlayerPosition();
        if (playerPos) {
          const region = this.mapSys.getRegionAtPosition(playerPos.x, playerPos.y);
          if (region && this.regionGames[region.name]) {
            this.loader.load(this.regionGames[region.name]());
          }
        }
      }
    });
  }

  /** Start the main loop */
  public start(): void {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(ts => this.loop(ts));
  }

  /** Stop the loop */
  public stop(): void {
    this.running = false;
  }

  /** Resize canvas */
  public resize(width: number, height: number): void {
    this.canvas.width  = width;
    this.canvas.height = height;
  }

  private loop(timestamp: number): void {
    if (!this.running) return;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.loader['current']) {
      this.update(dt);
      this.render();
    }

    requestAnimationFrame(ts => this.loop(ts));
  }

  private update(dt: number): void {
    // Get normalized movement input
    const { dx: normalizedDx, dy: normalizedDy } = this.inputSystem.getMovementInput();
    const isSprinting = this.inputSystem.isShiftDown();

    // Update player movement and state via CharacterSystem
    this.characterSystem.updatePlayerMovement(dt, normalizedDx, normalizedDy, isSprinting, this.mapSys, this.spriteSystem);
    
    // Update camera to follow player
    const playerPos = this.characterSystem.getPlayerPosition();
    if (playerPos) {
      this.mapSys.setCameraTarget(playerPos.x, playerPos.y);
    }
    this.mapSys.update();
    
    this.spriteSystem.update(dt); // Update sprite animations
  }

  private render(): void {
    const w = this.canvas.width, h = this.canvas.height;
    this.rs.begin();
    this.mapSys.render(
      this.rs,
      this.mapSys.viewportX,
      this.mapSys.viewportY,
      w, h
    );
    // Render player and NPCs via CharacterSystem
    this.characterSystem.render(this.rs, this.spriteSystem, this.mapSys.viewportX, this.mapSys.viewportY);
    
    // UI prompt
    this.rs.drawText(
      'Press [Space] near NPC to start',
      w/2, h - 20, '#FFF', 14, 'center'
    );
    this.rs.end();
  }
}
