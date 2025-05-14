export class AnimationSystem {
    private animations: Map<string, Animation> = new Map();
    
    constructor() {
      // Initialize common animations
      this.setupAnimations();
    }
    
    private setupAnimations(): void {
      // Set up boat arrival animation
      this.animations.set('boatArrival', {
        frames: 60, // 2 seconds at 30fps
        currentFrame: 0,
        running: false,
        onComplete: null
      });
      
      // Set up character walk animations
      this.animations.set('playerWalk', {
        frames: 8,
        currentFrame: 0,
        running: false,
        onComplete: null
      });
    }
    
    public update(deltaTime: number): void {
      // Update all running animations
      this.animations.forEach(animation => {
        if (animation.running) {
          animation.currentFrame++;
          
          // Check if animation is complete
          if (animation.currentFrame >= animation.frames) {
            animation.running = false;
            if (animation.onComplete) {
              animation.onComplete();
            }
          }
        }
      });
    }
    
    public playAnimation(name: string, onComplete?: () => void): void {
      const animation = this.animations.get(name);
      if (!animation) return;
      
      animation.currentFrame = 0;
      animation.running = true;
      animation.onComplete = onComplete || null;
    }
    
    public stopAnimation(name: string): void {
      const animation = this.animations.get(name);
      if (!animation) return;
      
      animation.running = false;
    }
    
    public isAnimationRunning(name: string): boolean {
      const animation = this.animations.get(name);
      return animation ? animation.running : false;
    }
    
    public getAnimationProgress(name: string): number {
      const animation = this.animations.get(name);
      if (!animation) return 0;
      
      return animation.currentFrame / animation.frames;
    }
    
    public playIntroAnimation(onComplete?: () => void): void {
      // Play the boat arrival animation
      this.playAnimation('boatArrival', onComplete);
    }
  }
  
  interface Animation {
    frames: number;
    currentFrame: number;
    running: boolean;
    onComplete: (() => void) | null;
  }
  