import { RenderSystem } from './RenderSystem';

interface SpriteAnimation {
  frames: number;
  frameWidth: number;
  frameHeight: number;
  frameSpeed: number;
  loop: boolean;
  currentFrame: number;
  elapsedTime: number;
}

interface SpriteData {
  animations: Record<string, SpriteAnimation>;
  currentAnimation: string;
  direction: 'up' | 'down' | 'left' | 'right';
  x: number;
  y: number;
  width: number;
  height: number;
  flipped: boolean;
  baseFrameY: number; // New property: Starting Y pixel in the atlas for this sprite type
}

export class SpriteSystem {
  private sprites: Map<string, SpriteData> = new Map();

  constructor() {
    this.setupDefaultAnimations();
  }

  private setupDefaultAnimations(): void {
    // --- Player Character ---
    // This ID MUST match the 'id' field of your player in data/Characters.ts
    this.registerSprite('player', {
      animations: {
        'idle': {
          frames: 4,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.1,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0
        }, // Player might have a slight idle bob, hence 4 frames. If static, frames: 1
        'walk': {
          frames: 8,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.12,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0
        }
      },
      currentAnimation: 'idle',
      direction: 'down',
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      flipped: false,
      // IMPORTANT: Adjust this based on your characters.png layout for the player.
      // If player's poses/animations start at the very top, baseFrameY is 0.
      baseFrameY: 0
    });

    // --- NPC Characters ---
    // Example for 'techGuru'. This ID MUST match 'techGuru' in data/Characters.ts
    this.registerSprite('techGuru', {
      animations: {
        'idle': {
          frames: 4,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.08,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0 // If TechGuru only has static poses, set frames: 1
        },
        'talk': {
          frames: 6,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.1,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0 // If TechGuru talk is static poses, set frames: 1
        }
      },
      currentAnimation: 'idle',
      direction: 'down',
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      flipped: false,
      // IMPORTANT: Adjust this. If TechGuru's poses/animations start, for example,
      // 96 pixels down from the top of characters.png (e.g., after 3 rows of 32px player sprites),
      // then baseFrameY would be 96.
      baseFrameY: 96
    });

    // Example for 'hardwareHank'
    this.registerSprite('hardwareHank', {
      animations: {
        // If Hardware Hank only has static directional poses and a static talking pose:
        'idle': { frames: 1, frameWidth: 32, frameHeight: 32, frameSpeed: 1, loop: false, currentFrame: 0, elapsedTime: 0 },
        'talk': { frames: 1, frameWidth: 32, frameHeight: 32, frameSpeed: 1, loop: false, currentFrame: 0, elapsedTime: 0 }
        // If Hardware Hank has actual animations, define them like the player or techGuru example.
      },
      currentAnimation: 'idle',
      direction: 'down',
      x: 0, y: 0, width: 32, height: 32, flipped: false,
      // IMPORTANT: Adjust this. If Hardware Hank's poses start, for example,
      // 192 pixels down from the top of characters.png, then baseFrameY would be 192.
      baseFrameY: 192
    });

    // Example for 'captain' - might only have static directional poses
    this.registerSprite('captain', {
      animations: {
        'idle': { frames: 1, frameWidth: 32, frameHeight: 32, frameSpeed: 1, loop: false, currentFrame: 0, elapsedTime: 0 }
        // If captain has a 'talk' pose/animation, add it here.
        // 'talk': { frames: 1, frameWidth: 32, frameHeight: 32, frameSpeed: 1, loop: false, currentFrame: 0, elapsedTime: 0 }
      },
      currentAnimation: 'idle',
      direction: 'down', // Default direction
      x: 0, y: 0, width: 32, height: 32, flipped: false,
      // IMPORTANT: Adjust this. If Captain's poses start, for example,
      // 288 pixels down from the top of characters.png, then baseFrameY would be 288.
      baseFrameY: 288
    });

    // --- CONTINUE FOR ALL OTHER CHARACTER IDs ---
    // For each character ID in your `data/Characters.ts` (e.g., 'softwareSam', 'arcadeAnnie', etc.):
    // 1. Call `this.registerSprite('characterId', { ... });`
    // 2. Define the `animations` object.
    //    - If it's just static directional poses, an 'idle' animation with `frames: 1` is fine.
    //    - If they have a talking pose, add a 'talk' animation, possibly also with `frames: 1`.
    //    - If they have actual animated sequences (like the player's walk), define those accordingly.
    // 3. Set the correct `baseFrameY` by inspecting your `characters.png`. This is the
    //    Y-pixel coordinate where that specific character's set of poses/rows begins in the atlas.
    // 4. Ensure `frameWidth` and `frameHeight` match the size of one pose/frame for that character.
  }

  public registerSprite(id: string, data: SpriteData): void {
    this.sprites.set(id, data);
  }

  public updateSpritePosition(id: string, x: number, y: number): void {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.x = x;
      sprite.y = y;
    }
  }

  public updateSpriteDirectionAndAnimation(
    id: string, 
    normalizedDx: number, // Expect normalized input
    normalizedDy: number, // Expect normalized input
    explicitDirection: 'up'|'down'|'left'|'right', // from CharacterSystem
    isMoving: boolean      // from CharacterSystem
  ): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;

    sprite.direction = explicitDirection;

    // Flipping logic for left/right
    if (sprite.direction === 'left') {
      sprite.flipped = true;
    } else if (sprite.direction === 'right') {
      sprite.flipped = false;
    } else {
      sprite.flipped = false; // No flipping for up/down
    }

    // Set animation based on movement
    const targetAnimation = isMoving ? 'walk' : 'idle';
    if (sprite.animations[targetAnimation]) {
      sprite.currentAnimation = targetAnimation;
    } else if (sprite.animations['idle']) { // Fallback to idle if 'walk' doesn't exist
      sprite.currentAnimation = 'idle';
    }
  }
  public setAnimation(id: string, animation: string): void {
    const sprite = this.sprites.get(id);
    if (sprite && sprite.animations[animation]) {
      sprite.currentAnimation = animation;
    }
  }

  public update(deltaTime: number): void {
    this.sprites.forEach(sprite => {
      const animation = sprite.animations[sprite.currentAnimation];
      if (!animation) return;

      animation.elapsedTime += deltaTime / 1000;

      if (animation.elapsedTime >= animation.frameSpeed) {
        animation.currentFrame = (animation.currentFrame + 1) % animation.frames;
        animation.elapsedTime = 0;

        if (!animation.loop && animation.currentFrame === 0) {
          // If animation doesn't loop and reached the end, set to idle
          sprite.currentAnimation = 'idle';
        }
      }
    });
  }

  public renderSprite(renderSystem: RenderSystem, id: string, spriteKey: string, viewportX: number, viewportY: number): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    const animation = sprite.animations[sprite.currentAnimation];
    if (!animation) return;


    const frameX = animation.currentFrame * animation.frameWidth;
    let frameY = 0;

    // Different row for each direction
    switch (sprite.direction) {
      case 'down':
        frameY = sprite.baseFrameY + 0; // Offset from the character's base Y
        break;
      case 'left':
        frameY = sprite.baseFrameY + animation.frameHeight; // Second row for this character
        break;
      case 'right':
        frameY = sprite.baseFrameY + animation.frameHeight; // Same row as left, but sprite.flipped handles visual
        break;
      case 'up':
        frameY = sprite.baseFrameY + (animation.frameHeight * 2); // Third row for this character
        break;
    }

    renderSystem.drawSprite(
      spriteKey,
      sprite.x - sprite.width / 2 - viewportX, // Adjust for viewport
      sprite.y - sprite.height / 2 - viewportY, // Adjust for viewport
      sprite.width,
      sprite.height,
      frameX,
      frameY,
      animation.frameWidth,
      animation.frameHeight,
      sprite.flipped // Pass the flipped status
    );
  }

  public getSpriteData(id: string): SpriteData | undefined {
    return this.sprites.get(id);
  }
}
