export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loadedPromises: Promise<void>[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.ctx.imageSmoothingEnabled = false;
  }

  public loadImage(key: string, src: string): void {
    const img = new Image();
    const promise = new Promise<void>((resolve, reject) => {
      img.onload = () => {
        this.sprites.set(key, img);
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src} for key: ${key}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
    });
    img.src = src;
    this.loadedPromises.push(promise);
  }

  public async waitForLoad(): Promise<void> {
    return Promise.all(this.loadedPromises).then(() => {});
  }

  public begin(): void {
    this.ctx.save();
  }

  public end(): void {
    this.ctx.restore();
  }

  public renderBackground(): void {
    this.ctx.fillStyle = '#004080';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  public drawCharacter(x: number, y: number, direction: string, isMoving: boolean, color: string = '#FFD700'): void {
    const size = 32;
    
    // Draw character shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + size/2, size/3, size/6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw character body with gradient
    const gradient = this.ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.adjustColor(color, -30));
    
    // Draw head
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y - size/2, size/3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw body
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - size/4, y - size/2 + size/3, size/2, size/2);
    
    // Draw legs with animation
    if (isMoving) {
      const time = Date.now() / 200;
      const legOffset = Math.sin(time) * 5;
      
      // Left leg
      this.ctx.fillStyle = this.adjustColor(color, -20);
      this.ctx.fillRect(x - size/4, y, size/4, size/3 + legOffset);
      
      // Right leg
      this.ctx.fillRect(x, y, size/4, size/3 - legOffset);
    } else {
      // Standing still
      this.ctx.fillStyle = this.adjustColor(color, -20);
      this.ctx.fillRect(x - size/4, y, size/4, size/3);
      this.ctx.fillRect(x, y, size/4, size/3);
    }
    
    // Draw eyes based on direction
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    
    const eyeSize = size/8;
    const eyeOffset = size/6;
    
    switch(direction) {
      case 'up':
        this.drawEye(x - eyeOffset, y - size/2 - size/6, eyeSize, 'up');
        this.drawEye(x + eyeOffset, y - size/2 - size/6, eyeSize, 'up');
        break;
      case 'down':
        this.drawEye(x - eyeOffset, y - size/2 + size/6, eyeSize, 'down');
        this.drawEye(x + eyeOffset, y - size/2 + size/6, eyeSize, 'down');
        break;
      case 'left':
        this.drawEye(x - size/3, y - size/2, eyeSize, 'left');
        break;
      case 'right':
        this.drawEye(x + size/4, y - size/2, eyeSize, 'right');
        break;
    }
  }

  private drawEye(x: number, y: number, size: number, direction: string): void {
    // Draw white of eye
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw pupil
    this.ctx.fillStyle = '#000000';
    const pupilOffset = size/3;
    let pupilX = x;
    let pupilY = y;
    
    switch(direction) {
      case 'up':
        pupilY -= pupilOffset;
        break;
      case 'down':
        pupilY += pupilOffset;
        break;
      case 'left':
        pupilX -= pupilOffset;
        break;
      case 'right':
        pupilX += pupilOffset;
        break;
    }
    
    this.ctx.beginPath();
    this.ctx.arc(pupilX, pupilY, size/2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  public drawNPC(x: number, y: number, color: string): void {
    this.drawCharacter(x, y, 'down', false, color);
  }

  public drawText(
    text: string, 
    x: number, 
    y: number, 
    color = 'white', 
    size = 16, 
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.font = `${size}px 'Press Start 2P', monospace`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  public drawRect(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  public drawCircle(
    x: number, 
    y: number, 
    radius: number, 
    color: string
  ): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  public drawSprite(
    spriteKey: string,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    flipped: boolean = false
  ): void {
    // Instead of using sprites, we'll draw the character manually
    const direction = flipped ? 'left' : 'right';
    this.drawCharacter(dx + dWidth/2, dy + dHeight/2, direction, false);
  }
}