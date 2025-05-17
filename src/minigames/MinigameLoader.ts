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
    this.current = game;
    game.init(this.canvas, () => {
      // completed: you can show “Back to island” UI here
      console.log('🎉 Minigame complete!');
    });
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
