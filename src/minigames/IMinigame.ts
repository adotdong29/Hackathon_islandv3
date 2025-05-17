// src/minigames/IMinigame.ts

export interface IMinigame {
    /**
     * Called once when the minigame starts.
     * - canvas: the game canvas
     * - onComplete: call this to return to the island
     */
    init(canvas: HTMLCanvasElement, onComplete: () => void): void;
  
    /** Called every frame with the elapsed time (ms) */
    update(dt: number): void;
  
    /** Called every frame to draw the current state */
    render(ctx: CanvasRenderingContext2D): void;
  
    /** Optional: handle pointer events */
    handlePointer?(e: PointerEvent): void;
  
    /** Optional: handle keyboard events */
    handleKey?(e: KeyboardEvent): void;
  
    /** Called when the minigame is torn down */
    destroy(): void;
  }
  