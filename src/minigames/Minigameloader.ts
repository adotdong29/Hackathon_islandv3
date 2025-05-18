// src/minigames/MinigameLoader.ts

import { IMinigame } from './IMinigame';

export class MinigameLoader {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private current?: IMinigame;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    window.addEventListener('resize', () => this.onResize());
    this.onResize();
    requestAnimationFrame(ts => this.loop(ts));
  }

  public load(game: IMinigame) {
    this.current?.destroy();
    const gameToLoad = game; // Store a reference to the game being loaded
    this.current = gameToLoad;

    // The onComplete callback is for the gameToLoad instance
    gameToLoad.init(this.canvas, () => {
      console.log('🎉 Minigame complete!');
      // Ensure we are dealing with the game that was intended to be completed
      if (this.current === gameToLoad) {
        gameToLoad.destroy(); // Explicitly destroy the completed minigame to clean up its resources
        this.current = undefined; // Signal to the GameEngine that no minigame is active
      }
    });
  }

  public isGameActive(): boolean {
    return !!this.current;
  }

  private loop(timestamp: number) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.current) {
      this.current.update(dt);
      this.current.render(this.ctx);
    }

    requestAnimationFrame(ts => this.loop(ts));
  }

  private onResize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}
