// src/minigames/SoftwareMazeGame.ts

import { IMinigame } from './IMinigame';

interface Cell { x:number; y:number; wallN:boolean; wallE:boolean; wallS:boolean; wallW:boolean; }
interface Bug  { x:number; y:number; dirX:number; dirY:number; }

export class SoftwareMazeGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private onComplete!: () => void;
  private maze: Cell[][] = [];
  private cellSize = 40;
  private rows = 15; cols = 20;
  private player = { x:1, y:1 };
  private bugs: Bug[] = [];
  private remainingBugs = 5;
  private caughtBug: Bug | null = null;
  private words = ['teh','recieve','definately','seperate','occured'];
  private currentWord = '';
  private inputEl!: HTMLInputElement;

  init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.onComplete = onComplete;
    this.generateMaze();
    this.spawnBugs();
    this.remainingBugs = this.bugs.length;

    window.addEventListener('keydown', this.onKey);
    canvas.addEventListener('pointerdown', this.onClick);

    // hidden input for spelling fixes
    this.inputEl = document.createElement('input');
    this.inputEl.style.position = 'absolute';
    this.inputEl.style.top = '-100px';
    document.body.appendChild(this.inputEl);
    this.inputEl.addEventListener('keydown', this.onSpellKey);
  }

  private generateMaze() {
    // simple empty grid (no walls) for demo
    this.maze = [];
    for (let y=0;y<this.rows;y++){
      this.maze[y] = [];
      for (let x=0;x<this.cols;x++){
        this.maze[y][x] = { x,y, wallN:false, wallE:false, wallS:false, wallW:false };
      }
    }
  }

  private spawnBugs() {
    this.bugs = [];
    for (let i=0;i<5;i++){
      this.bugs.push({
        x: Math.floor(Math.random()*this.cols),
        y: Math.floor(Math.random()*this.rows),
        dirX: Math.random()<0.5?1:-1,
        dirY: Math.random()<0.5?1:-1
      });
    }
  }

  update(dt: number): void {
    if (this.caughtBug) return;
    // move bugs
    this.bugs.forEach(b => {
      b.x += b.dirX * dt/200;
      b.y += b.dirY * dt/200;
      if (b.x<0||b.x>this.cols-1) b.dirX*=-1;
      if (b.y<0||b.y>this.rows-1) b.dirY*=-1;
      // catch?
      if (Math.hypot(b.x-this.player.x, b.y-this.player.y)<0.5) {
        this.catchBug(b);
      }
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    // background
    ctx.fillStyle = '#111'; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);

    // maze floor
    for (let y=0;y<this.rows;y++){
      for (let x=0;x<this.cols;x++){
        ctx.fillStyle = '#222';
        ctx.fillRect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
      }
    }

    // bugs
    this.bugs.forEach(b => {
      ctx.fillStyle = '#FF0';
      ctx.beginPath();
      ctx.arc(
        (b.x+0.5)*this.cellSize,
        (b.y+0.5)*this.cellSize,
        this.cellSize*0.3, 0, Math.PI*2);
      ctx.fill();
    });

    // player
    ctx.fillStyle = '#0F0';
    ctx.beginPath();
    ctx.arc(
      (this.player.x+0.5)*this.cellSize,
      (this.player.y+0.5)*this.cellSize,
      this.cellSize*0.3, 0, Math.PI*2);
    ctx.fill();

    // UI
    ctx.fillStyle = '#FFF';
    ctx.font = '20px monospace';
    ctx.fillText(`Bugs left: ${this.remainingBugs}`, 20, 30);

    if (this.caughtBug) {
      ctx.fillStyle='rgba(0,0,0,0.7)';
      ctx.fillRect(50,100,400,200);
      ctx.fillStyle='#FFF';
      ctx.fillText(`Fix spelling: ${this.currentWord}`, 70, 150);
      ctx.fillText(`> ${this.inputEl.value}`, 70, 190);
    }
  }

  private onKey = (e: KeyboardEvent) => {
    if (this.caughtBug) return;
    const {player} = this;
    if (e.key==='ArrowUp')    player.y = Math.max(0,player.y-1);
    if (e.key==='ArrowDown')  player.y = Math.min(this.rows-1,player.y+1);
    if (e.key==='ArrowLeft')  player.x = Math.max(0,player.x-1);
    if (e.key==='ArrowRight') player.x = Math.min(this.cols-1,player.x+1);
  };

  private onClick = (e: PointerEvent) => {
    if (this.caughtBug) {
      this.inputEl.focus();
    }
  };

  private catchBug(bug: Bug) {
    this.caughtBug = bug;
    this.currentWord = this.words.pop()!;
    this.inputEl.value = '';
  }

  private onSpellKey = (e: KeyboardEvent) => {
    if (!this.caughtBug) return;
    if (e.key==='Enter') {
      if (this.inputEl.value.toLowerCase() === this.currentWord.split('').sort().join('') ) {
        // correct
        this.bugs = this.bugs.filter(b=>b!==this.caughtBug);
        this.remainingBugs = this.bugs.length;
        this.caughtBug = null;
        if (this.remainingBugs===0) {
          setTimeout(() => {
            alert('🐞 All bugs fixed! Maze cleared!');
            this.onComplete();
          }, 200);
        }
      } else {
        alert('❌ Try again');
      }
    }
  };

  destroy(): void {
    window.removeEventListener('keydown', this.onKey);
    this.canvas.removeEventListener('pointerdown', this.onClick);
    document.body.removeChild(this.inputEl);
  }
}
