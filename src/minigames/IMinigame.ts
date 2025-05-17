// src/minigames/IMinigame.ts

export interface IMinigame {
    /** Called once when starting the game */
    init(canvas: HTMLCanvasElement, onComplete: () => void): void;
  
    /** Called each frame with delta‐ms */
    update(dt: number): void;
  
    /** Called each frame to draw */
    render(ctx: CanvasRenderingContext2D): void;
  
    /** Optional: pointer events */
    handlePointer?(e: PointerEvent): void;
  
    /** Optional: key events */
    handleKey?(e: KeyboardEvent): void;
  
    /** Cleanup when exiting */
    destroy(): void;
  }
  