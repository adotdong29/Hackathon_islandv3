// src/minigames/SoftwareMazeGame.ts

import { IMinigame } from './IMinigame';

interface Cell {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}
interface Bug {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  speed: number;
  fixed: boolean;
}

export class SoftwareMazeGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  private cols = 15;
  private rows = 11;
  private cellSize = 50;
  private grid: Cell[] = [];

  private phase: 'playing' | 'history' = 'playing';
  private playerX = 0;
  private playerY = 0;
  private moveX = 0;
  private moveY = 0;
  private speed = 300;

  private bugs: Bug[] = [];
  private totalBugs = 4;
  private secondWave = false;
  private prompts = [
    { wrong: 'teh', correct: 'the' },
    { wrong: 'functoin', correct: 'function' },
    { wrong: 'varible', correct: 'variable' },
    { wrong: 'retrun', correct: 'return' }
  ];
  private fixing = false;

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    this.canvas.width = this.cols * this.cellSize;
    this.canvas.height = this.rows * this.cellSize;

    this.generateGrid();
    this.playerX = this.cellSize / 2;
    this.playerY = this.cellSize / 2;
    this.spawnBugs();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('click', this.onCanvasClick);
  }

  public update(dt: number): void {
    if (this.phase !== 'playing' || this.fixing) return;

    // Movement normalization for diagonal
    let dx = this.moveX;
    let dy = this.moveY;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }
    const dist = this.speed * dt / 1000;
    const nextX = this.playerX + dx * dist;
    const nextY = this.playerY + dy * dist;
    const radius = this.cellSize / 3;
    if (!this.isOutOfBounds(nextX, this.playerY, radius)) this.playerX = nextX;
    if (!this.isOutOfBounds(this.playerX, nextY, radius)) this.playerY = nextY;

    // Move bugs
    this.bugs.forEach(b => {
      if (b.fixed) return;
      const moveDist = b.speed * dt / 1000;
      let bx = b.x + b.dirX * moveDist;
      let by = b.y + b.dirY * moveDist;
      const bugR = this.cellSize / 4;

      // Reflect X
      if (bx - bugR < 0 || bx + bugR > this.canvas.width) {
        b.dirX *= -1;
        bx = b.x + b.dirX * moveDist;
      }
      // Reflect Y
      if (by - bugR < 0 || by + bugR > this.canvas.height) {
        b.dirY *= -1;
        by = b.y + b.dirY * moveDist;
      }

      b.x = Math.max(bugR, Math.min(this.canvas.width - bugR, bx));
      b.y = Math.max(bugR, Math.min(this.canvas.height - bugR, by));

      // Collision with player
      const pdx = b.x - this.playerX;
      const pdy = b.y - this.playerY;
      if (Math.hypot(pdx, pdy) < radius + bugR) this.fixBug(b);
    });
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.phase === 'history') {
      this.drawHistory(ctx);
      return;
    }

    this.drawGrid(ctx);

    // Exit portal
    if (this.bugs.every(b => b.fixed) && this.secondWave) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(
        this.cols * this.cellSize - this.cellSize / 2,
        this.rows * this.cellSize - this.cellSize / 2,
        this.cellSize / 3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Draw bugs
    this.bugs.forEach(b => {
      if (b.fixed) return;
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(b.x, b.y, this.cellSize / 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw player
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(this.playerX, this.playerY, this.cellSize / 3, 0, 2 * Math.PI);
    ctx.fill();

    // HUD
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `Bugs: ${this.bugs.filter(b => !b.fixed).length}/${this.totalBugs}`,
      10,
      24
    );
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('click', this.onCanvasClick);
  }

  private generateGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.grid.push({ x, y, walls: { top: false, right: false, bottom: false, left: false } });
      }
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    this.grid.forEach(c => {
      ctx.strokeRect(
        c.x * this.cellSize,
        c.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    });
  }

  private spawnBugs(): void {
    this.bugs = [];
    const bugCount = this.secondWave ? 2 : this.totalBugs;
    for (let i = 0; i < bugCount; i++) {
      const bugR = this.cellSize / 4;
      let x: number, y: number;
      do {
        x = Math.random() * (this.canvas.width - 2 * bugR) + bugR;
        y = Math.random() * (this.canvas.height - 2 * bugR) + bugR;
      } while (this.isOutOfBounds(x, y, bugR));

      // Random direction
      let dirX: number, dirY: number;
      do {
        dirX = Math.random() * 2 - 1;
        dirY = Math.random() * 2 - 1;
      } while (dirX === 0 && dirY === 0);
      const len = Math.hypot(dirX, dirY);
      dirX /= len;
      dirY /= len;

      this.bugs.push({ x, y, dirX, dirY, speed: 120, fixed: false });
    }
  }

  private isOutOfBounds(x: number, y: number, r: number): boolean {
    return x - r < 0 || x + r > this.canvas.width || y - r < 0 || y + r > this.canvas.height;
  }

  private fixBug(b: Bug): void {
    if (b.fixed) return;
    this.fixing = true;
    const prompt = this.prompts.shift()!;
    const ans = window.prompt(`Fix the spelling: "${prompt.wrong}"`);
    if (ans?.trim().toLowerCase() === prompt.correct) {
      b.fixed = true;
      new Audio('fix.mp3').play().catch(() => {});

      // After fixing all in first wave, spawn second
      if (this.bugs.every(bg => bg.fixed) && !this.secondWave) {
        this.secondWave = true;
        this.prompts = [
          { wrong: 'clas', correct: 'class' },
          { wrong: 'objekt', correct: 'object' }
        ];
        this.spawnBugs();
      }
      // After second wave, move to history
      else if (this.bugs.every(bg => bg.fixed) && this.secondWave) {
        this.phase = 'history';
      }
    } else {
      alert(`Incorrect! Should be: ${prompt.correct}`);
    }
    this.fixing = false;
  }

  private drawHistory(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#FFF'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
    const txt =
      'Debugging in the 1980s was a vastly different experience. Programmers often worked with BASIC interpreters or directly in assembly language, frequently on text-based terminals or even with line printers for output. Source-level debuggers were rudimentary or non-existent for many platforms. ' +
      'Techniques involved inserting print statements (like PEEK and POKE in BASIC) to inspect memory, manually stepping through code using machine language monitors, or poring over hexadecimal dumps. For systems using punch cards or paper tape, the cycle of coding, compiling (if applicable), loading, and testing was laborious. ' +
      'This environment fostered a meticulous approach to coding, as finding and fixing bugs was time-consuming and resource-intensive. The constraints of limited memory and processing power also demanded highly efficient, optimized, and carefully crafted code to minimize errors from the outset.';
    this.wrapText(txt, this.canvas.width - 40).forEach((l, i) => ctx.fillText(l, this.canvas.width / 2, 60 + i * 28));

    // Return button
    const bw = 200,
      bh = 40,
      bx = (this.canvas.width - bw) / 2,
      by = this.canvas.height - 80;
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#FFF'; ctx.font = '18px sans-serif'; // textAlign is 'center'
    ctx.textBaseline = 'middle';
    ctx.fillText('Return to Island', bx + bw / 2, by + bh / 2);
    ctx.textBaseline = 'alphabetic'; // Reset
    ctx.textAlign = 'left'; // Reset for safety
  }

  private onCanvasClick = (e: MouseEvent): void => {
    if (this.phase === 'history') {
      // Convert window click to canvas coordinates
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const bw = 200, bh = 40;
      const bx = (this.canvas.width - bw) / 2;
      const by = this.canvas.height - 80;
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        this.onComplete();
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        this.moveX = 0;
        this.moveY = -1;
        break;
      case 'ArrowDown':
      case 's':
        this.moveX = 0;
        this.moveY = 1;
        break;
      case 'ArrowLeft':
      case 'a':
        this.moveX = -1;
        this.moveY = 0;
        break;
      case 'ArrowRight':
      case 'd':
        this.moveX = 1;
        this.moveY = 0;
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      this.moveX = 0;
      this.moveY = 0;
    }
  };

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (this.ctx.measureText(testLine).width > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
