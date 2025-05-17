import { RenderSystem } from './RenderSystem';
import { Character } from '../types/GameTypes';
import { SpriteSystem } from './SpriteSystem';
import { characters } from '../data/Characters';
import { MapSystem } from './MapSystem';

export class CharacterSystem {
  private characters: Character[] = [];
  private player: Character | null = null;
  private playerTargetX: number = 0;
  private playerTargetY: number = 0;
  private playerMoving: boolean = false;
  private basePlayerSpeed: number = 180; // Increased base speed
  private sprintMultiplier: number = 1.75; // How much faster sprint is
  private playerDirection: 'up'|'down'|'left'|'right' = 'down';
  private currentPath: { x: number, y: number }[] = [];
  private currentPathIndex: number = 0;

  constructor() {
    this.characters = characters;
    this.player = this.characters.find(c => c.id === 'player') || null;
    if (this.player) {
      this.playerTargetX = this.player.x;
      this.playerTargetY = this.player.y;
    }
  }

  public updatePlayerMovement(
    deltaTime: number, 
    normalizedDx: number, 
    normalizedDy: number,
    isSprinting: boolean, 
    mapSystem: MapSystem,
    spriteSystem: SpriteSystem // Added for sprite updates
  ): void {
    if (!this.player) return;

    const currentSpeed = isSprinting ? this.basePlayerSpeed * this.sprintMultiplier : this.basePlayerSpeed;

    if (normalizedDx !== 0 || normalizedDy !== 0) {
      const dist = currentSpeed * (deltaTime / 1000);
      const oldX = this.player.x;
      const oldY = this.player.y;

      let newX = this.player.x + normalizedDx * dist;
      let newY = this.player.y + normalizedDy * dist;

      // Attempt to move along X-axis (sliding collision)
      if (mapSystem.isWalkable(newX, this.player.y)) {
        this.player.x = newX;
      }

      // Attempt to move along Y-axis (using potentially updated X)
      if (mapSystem.isWalkable(this.player.x, newY)) {
        this.player.y = newY;
      }
      
      this.playerMoving = (this.player.x !== oldX || this.player.y !== oldY);

      // Update direction based on input intent
      if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
        this.playerDirection = normalizedDx > 0 ? 'right' : 'left';
      } else if (normalizedDy !== 0) { // Check normalizedDy specifically for up/down
        this.playerDirection = normalizedDy > 0 ? 'down' : 'up';
      } else if (normalizedDx !== 0) { // Only horizontal movement
        this.playerDirection = normalizedDx > 0 ? 'right' : 'left';
      }
      // If both normalizedDx and normalizedDy are 0, direction remains (handled by outer if)
    } else {
      this.playerMoving = false;
    }

    // Update sprite system with player's state
    spriteSystem.updateSpritePosition(this.player.id, this.player.x, this.player.y);
    spriteSystem.updateSpriteDirectionAndAnimation(this.player.id, normalizedDx, normalizedDy, this.playerDirection, this.playerMoving);
  }

  public render(renderSystem: RenderSystem, spriteSystem: SpriteSystem, viewportX: number, viewportY: number): void {
    // Render NPCs
    this.characters.forEach(character => {
      if (character.id !== 'player') {
        renderSystem.drawCharacter(
          character.x - viewportX, // x
          character.y - viewportY, // y
          'down', // dir - TODO: NPCs could have dynamic direction
          false,  // moving - TODO: NPCs could move
          this.getNPCColor(character.id)
        );
        // Potentially render NPCs using SpriteSystem if they have complex animations
        // spriteSystem.renderSprite(renderSystem, character.id, character.spriteSheet, viewportX, viewportY);


        // Draw character name above
        renderSystem.drawText(
          character.name,
          character.x - viewportX,
          character.y - 40 - viewportY,
          '#FFFFFF',
          10,
          'center'
        );
      }
    });
    
    // Render player
    if (this.player) {
      // Use SpriteSystem to render the player if you have detailed sprite sheets
      // The 'player' ID in SpriteSystem must match character.id
      // The 'character.spriteSheet' should be the key for the image asset
      spriteSystem.renderSprite(renderSystem, this.player.id, this.player.spriteSheet, viewportX, viewportY);
      // Fallback or simpler rendering:
      // renderSystem.drawCharacter(
      //   this.player.x - viewportX,
      //   this.player.y - viewportY,
      //   this.playerDirection,
      //   this.playerMoving
      // );
    }
  }

  private getNPCColor(id: string): string {
    const colors: Record<string, string> = {
      'techGuru': '#FF69B4',
      'hardwareHank': '#FF4500',
      'softwareSam': '#32CD32',
      'arcadeAnnie': '#9370DB',
      'consoleCarl': '#20B2AA',
      'mobileMolly': '#FFD700',
      'internetIrene': '#FF1493',
      'captain': '#4169E1'
    };
    return colors[id] || '#808080';
  }

  public getPlayerPosition(): { x: number, y: number } | null {
    if (!this.player) return null;
    return { x: this.player.x, y: this.player.y };
  }

  public checkNPCClick(x: number, y: number): Character | null {
    const clickRadius = 40;
    
    for (const character of this.characters) {
      if (character.id === 'player') continue;
      
      const dx = x - character.x;
      const dy = y - character.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= clickRadius) {
        return character;
      }
    }
    
    return null;
  }

  public getPlayer(): Character | null {
    return this.player;
  }

  public getNPCs(): Character[] {
    return this.characters.filter(c => c.id !== 'player');
  }

  public isPlayerMoving(): boolean {
    return this.playerMoving;
  }

  public getPlayerDirection(): 'up'|'down'|'left'|'right' {
    return this.playerDirection;
  }
}