export class InputSystem {
    private canvas: HTMLCanvasElement;
    private keys: Map<string, boolean> = new Map();
    private mouseX: number = 0;
    private mouseY: number = 0;
    private mouseDown: boolean = false;
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.setupListeners();
    }
  
    private setupListeners(): void {
      // Keyboard events
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      
      // Mouse events
      this.canvas.addEventListener('mousedown', this.handleMouseDown);
      this.canvas.addEventListener('mouseup', this.handleMouseUp);
      this.canvas.addEventListener('mousemove', this.handleMouseMove);
      
      // Touch events for mobile
      this.canvas.addEventListener('touchstart', this.handleTouchStart);
      this.canvas.addEventListener('touchend', this.handleTouchEnd);
      this.canvas.addEventListener('touchmove', this.handleTouchMove);
    }
  
    public destroy(): void {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    }
  
    // Renamed from update and modified to return normalized direction
    public getMovementInput(): { dx: number, dy: number } {
      let dx = 0;
      let dy = 0;
  
      if (this.isKeyDown('ArrowUp') || this.isKeyDown('w')) {
        dy -= 1;
      }
      if (this.isKeyDown('ArrowDown') || this.isKeyDown('s')) {
        dy += 1;
      }
      if (this.isKeyDown('ArrowLeft') || this.isKeyDown('a')) {
        dx -= 1;
      }
      if (this.isKeyDown('ArrowRight') || this.isKeyDown('d')) {
        dx += 1;
      }
  
      // Normalize if diagonal movement
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }
      return { dx, dy };
    }
  
    public isKeyDown(key: string): boolean {
      return this.keys.get(key) || false;
    }
  
    public isShiftDown(): boolean {
      return this.isKeyDown('Shift');
    }

    public getMousePosition(): { x: number, y: number } | null {
      return { x: this.mouseX, y: this.mouseY };
    }
  
    public isMouseDown(): boolean {
      return this.mouseDown;
    }
  
    private handleKeyDown = (e: KeyboardEvent): void => {
      this.keys.set(e.key, true);
    };
  
    private handleKeyUp = (e: KeyboardEvent): void => {
      this.keys.set(e.key, false);
    };
  
    private handleMouseDown = (e: MouseEvent): void => {
      this.mouseDown = true;
      this.updateMousePosition(e);
    };
  
    private handleMouseUp = (e: MouseEvent): void => {
      this.mouseDown = false;
      this.updateMousePosition(e);
    };
  
    private handleMouseMove = (e: MouseEvent): void => {
      this.updateMousePosition(e);
    };
  
    private handleTouchStart = (e: TouchEvent): void => {
      this.mouseDown = true;
      this.updateTouchPosition(e);
      e.preventDefault();
    };
  
    private handleTouchEnd = (e: TouchEvent): void => {
      this.mouseDown = false;
      e.preventDefault();
    };
  
    private handleTouchMove = (e: TouchEvent): void => {
      this.updateTouchPosition(e);
      e.preventDefault();
    };
  
    private updateMousePosition(e: MouseEvent): void {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    }
  
    private updateTouchPosition(e: TouchEvent): void {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.touches[0].clientX - rect.left;
        this.mouseY = e.touches[0].clientY - rect.top;
      }
    }
}