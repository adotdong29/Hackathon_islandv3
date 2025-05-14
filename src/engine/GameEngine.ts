import { GameState } from '../types/GameTypes';
import { RenderSystem } from './RenderSystem';
import { InputSystem } from './InputSystem';
import { MapSystem } from './MapSystem';
import { CharacterSystem } from './CharacterSystem';
import { AnimationSystem } from './AnimationSystem';
import { SpriteSystem } from './SpriteSystem';
import { PathfindingSystem } from './PathfindingSystem';
import { npcDialogues } from '../data/dialogues';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private running: boolean = false;
  private lastTime: number = 0;
  private updatePlayerPositionCallback: (x: number, y: number) => void;
  private triggerDialogueCallback: (dialogues: any[]) => void;
  private changeRegionCallback: (regionName: string) => void;
  
  // Game systems
  private renderSystem: RenderSystem;
  private inputSystem: InputSystem;
  private mapSystem: MapSystem;
  private characterSystem: CharacterSystem;
  private animationSystem: AnimationSystem;
  private spriteSystem: SpriteSystem;
  private pathfindingSystem: PathfindingSystem | null = null;

  constructor(
    canvas: HTMLCanvasElement, 
    gameState: GameState,
    updatePlayerPosition: (x: number, y: number) => void,
    triggerDialogue: (dialogues: any[]) => void,
    changeRegion: (regionName: string) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = gameState;
    this.updatePlayerPositionCallback = updatePlayerPosition;
    this.triggerDialogueCallback = triggerDialogue;
    this.changeRegionCallback = changeRegion;
    
    // Initialize systems
    this.renderSystem = new RenderSystem(this.ctx);
    this.inputSystem = new InputSystem(this.canvas);
    this.mapSystem = new MapSystem();
    this.characterSystem = new CharacterSystem();
    this.animationSystem = new AnimationSystem();
    this.spriteSystem = new SpriteSystem();

    // Initialize pathfinding after map is loaded
    this.pathfindingSystem = new PathfindingSystem(this.mapSystem.getMap());
  }

  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
    
    if (this.gameState.gamePhase === 'INTRO') {
      this.startIntroAnimation();
    }
  }

  public stop(): void {
    this.running = false;
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private gameLoop = (timestamp: number): void => {
    if (!this.running) return;
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Get movement from input system
    const movement = this.inputSystem.update();
    
    // Update all game systems
    this.mapSystem.update(deltaTime);
    this.characterSystem.update(deltaTime, movement);
    this.animationSystem.update(deltaTime);
    this.spriteSystem.update(deltaTime);
    
    // Update camera and player position
    const player = this.characterSystem.getPlayer();
    if (player) {
      this.mapSystem.setCameraTarget(player.x, player.y);
      this.updatePlayerPositionCallback(player.x, player.y);
    }
    
    this.checkRegionChange();
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.renderSystem.begin();
    this.renderSystem.renderBackground();
    this.mapSystem.render(this.renderSystem);
    this.characterSystem.render(this.renderSystem, this.spriteSystem);
    this.renderSystem.end();
  }

  public handleClick(): void {
    const mousePos = this.inputSystem.getMousePosition();
    if (!mousePos) return;
    
    const clickedNPC = this.characterSystem.checkNPCClick(mousePos.x, mousePos.y);
    if (clickedNPC && clickedNPC.dialogues.length > 0) {
      this.triggerDialogueCallback(clickedNPC.dialogues);
      return;
    }
    
    const clickedRegion = this.mapSystem.checkRegionClick(mousePos.x, mousePos.y);
    if (clickedRegion) {
      this.changeRegionCallback(clickedRegion.name);
      const regionDialogues = npcDialogues[clickedRegion.id];
      if (regionDialogues) {
        this.triggerDialogueCallback(regionDialogues);
      }
    }
  }

  private checkRegionChange(): void {
    const playerPos = this.characterSystem.getPlayerPosition();
    if (!playerPos) return;
    
    const currentRegion = this.mapSystem.getRegionAtPosition(playerPos.x, playerPos.y);
    if (currentRegion && currentRegion.name !== this.gameState.currentRegion) {
      this.changeRegionCallback(currentRegion.name);
    }
  }

  private startIntroAnimation(): void {
    this.animationSystem.playIntroAnimation(() => {
      // Animation complete callback
    });
  }
}