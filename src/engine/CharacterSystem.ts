import { RenderSystem } from './RenderSystem';
import { Character } from '../types/GameTypes';
import { SpriteSystem } from './SpriteSystem';
import { characters } from '../data/Characters';

export class CharacterSystem {
  private characters: Character[] = [];
  private player: Character | null = null;
  private playerTargetX: number = 0;
  private playerTargetY: number = 0;
  private playerMoving: boolean = false;
  private playerSpeed: number = 5;
  private playerDirection: string = 'down';
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

  public update(deltaTime: number, movement: { x: number, y: number }): void {
    if (this.player) {
      // Update player position based on keyboard input
      if (movement.x !== 0 || movement.y !== 0) {
        this.player.x += movement.x;
        this.player.y += movement.y;
        this.playerMoving = true;

        // Update direction based on movement
        if (Math.abs(movement.x) > Math.abs(movement.y)) {
          this.playerDirection = movement.x > 0 ? 'right' : 'left';
        } else {
          this.playerDirection = movement.y > 0 ? 'down' : 'up';
        }
      } else {
        this.playerMoving = false;
      }
    }
  }

  public render(renderSystem: RenderSystem, spriteSystem: SpriteSystem): void {
    // Render NPCs
    this.characters.forEach(character => {
      if (character.id !== 'player') {
        renderSystem.drawCharacter(
          character.x,
          character.y,
          'down',
          false,
          this.getNPCColor(character.id)
        );
        
        // Draw character name above
        renderSystem.drawText(
          character.name,
          character.x,
          character.y - 40,
          '#FFFFFF',
          10,
          'center'
        );
      }
    });
    
    // Render player
    if (this.player) {
      renderSystem.drawCharacter(
        this.player.x,
        this.player.y,
        this.playerDirection,
        this.playerMoving,
        '#FFD700'
      );
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

  public getPlayerDirection(): string {
    return this.playerDirection;
  }
}