/**
 * Base class for all mini-games
 */
export abstract class MiniGameBase {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected width: number;
    protected height: number;
    protected running: boolean = false;
    protected completed: boolean = false;
    protected score: number = 0;
    protected maxScore: number = 100;
    
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d')!;
      this.width = canvas.width;
      this.height = canvas.height;
    }
    
    public abstract start(): void;
    
    public abstract update(deltaTime: number): void;
    
    public abstract render(): void;
    
    public abstract handleInput(type: string, event: Event): void;
    
    public stop(): void {
      this.running = false;
    }
    
    public isRunning(): boolean {
      return this.running;
    }
    
    public isCompleted(): boolean {
      return this.completed;
    }
    
    public getScore(): number {
      return this.score;
    }
    
    public getMaxScore(): number {
      return this.maxScore;
    }
    
    protected resize(): void {
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }
    
    protected complete(success: boolean): void {
      this.completed = true;
      this.running = false;
      
      if (success) {
        // Play success sound or animation
        console.log('Mini-game completed successfully!');
      } else {
        // Play failure sound or animation
        console.log('Mini-game failed!');
      }
    }
    
    public reset(): void {
      this.score = 0;
      this.completed = false;
    }
  }
  