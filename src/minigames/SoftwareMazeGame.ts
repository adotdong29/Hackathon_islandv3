// src/minigames/SoftwareMazeGame.ts

import { IMinigame } from './IMinigame';

interface Cell {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}
interface Bug { x: number; y: number; dirX: number; dirY: number; speed: number; fixed: boolean; }

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
    canvas.width = this.cols * this.cellSize;
    canvas.height = this.rows * this.cellSize;
    this.generateMaze();
    this.playerX = this.cellSize / 2;
    this.playerY = this.cellSize / 2;
    this.spawnBugs();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('click', this.onCanvasClick);
  }

  public update(dt: number): void {
    if (this.phase !== 'playing' || this.fixing) return;
    // player movement
    const playerRadius = this.cellSize / 3;
    let dx = this.moveX, dy = this.moveY;
    if (dx || dy) {
      const len = Math.hypot(dx, dy); dx /= len; dy /= len;
      const dist = this.speed * (dt / 1000);
      const nx = this.playerX + dx * dist;
      const ny = this.playerY + dy * dist;
      if (!this.collides(nx, this.playerY, playerRadius)) this.playerX = nx;
      if (!this.collides(this.playerX, ny, playerRadius)) this.playerY = ny;
    }
    // bug movement
    const bugRadius = this.cellSize / 4;
    this.bugs.forEach(b => {
      if (b.fixed) return;
      const dist = b.speed * (dt / 1000);
      
      let potentialX = b.x + b.dirX * dist;
      let potentialY = b.y + b.dirY * dist;

      // Check X-axis collision and reflect if necessary
      if (potentialX - bugRadius < 0) {
        potentialX = bugRadius; // Clamp to boundary
        b.dirX *= -1;           // Reflect direction
      } else if (potentialX + bugRadius > this.canvas.width) {
        potentialX = this.canvas.width - bugRadius; // Clamp to boundary
        b.dirX *= -1;                               // Reflect direction
      }
      b.x = potentialX; // Update X position

      // Check Y-axis collision and reflect if necessary
      if (potentialY - bugRadius < 0) {
        potentialY = bugRadius; // Clamp to boundary
        b.dirY *= -1;           // Reflect direction
      } else if (potentialY + bugRadius > this.canvas.height) {
        potentialY = this.canvas.height - bugRadius; // Clamp to boundary
        b.dirY *= -1;                                // Reflect direction
      }
      b.y = potentialY; // Update Y position

      // Ensure bugs stay strictly within bounds after reflection and movement
      b.x = Math.max(bugRadius, Math.min(this.canvas.width - bugRadius, b.x));
      b.y = Math.max(bugRadius, Math.min(this.canvas.height - bugRadius, b.y));

      const pdx = b.x - this.playerX;
      const pdy = b.y - this.playerY;
      if (Math.hypot(pdx, pdy) < (playerRadius + bugRadius)) this.fixBug(b);
    });
  }

  public render(): void {
    const ctx = this.ctx; ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.phase === 'history') {
      this.drawHistory(ctx);
    } else { // 'playing' phase
      this.renderMaze(ctx);
      // exit portal (only relevant in 'playing' phase)
      if (this.bugs.every(b => b.fixed) && this.secondWave) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.cols*this.cellSize - this.cellSize/2, this.rows*this.cellSize - this.cellSize/2, this.cellSize/3, 0, 2*Math.PI);
        ctx.fill();
      }
      // bugs
      this.bugs.forEach(b => {
        if (b.fixed) return;
        ctx.fillStyle = '#FF0000'; ctx.beginPath(); ctx.arc(b.x, b.y, this.cellSize/4, 0, 2*Math.PI); ctx.fill();
      });
      // player
      ctx.fillStyle = '#00FF00'; ctx.beginPath(); ctx.arc(this.playerX, this.playerY, this.cellSize/3, 0, 2*Math.PI); ctx.fill();
      // HUD
      ctx.fillStyle = '#FFF'; ctx.font = '18px sans-serif';
      ctx.fillText(`Bugs: ${this.bugs.filter(b=>!b.fixed).length}/${this.totalBugs}`, 10, 24);
    }
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('click', this.onCanvasClick);
  }

  private generateMaze(): void {
    // Create an open grid (no internal walls) for smooth paths
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.grid.push({
          x,
          y,
          walls: { top: false, right: false, bottom: false, left: false }
        });
      }
    }
    // simple empty grid for smooth paths
  }

  private renderMaze(ctx: CanvasRenderingContext2D): void {
    // no walls for simplicity
    ctx.strokeStyle='#555'; ctx.lineWidth=1;
    for (const c of this.grid) {
      ctx.strokeRect(c.x*this.cellSize, c.y*this.cellSize, this.cellSize, this.cellSize);
    }
  }

  private spawnBugs(): void {
    this.bugs = [];
    const count = this.totalBugs;
    for (let i=0; i<count; i++) {
      const x = Math.random()*(this.cols-1)*this.cellSize + this.cellSize/2;
      const y = Math.random()*(this.rows-1)*this.cellSize + this.cellSize/2;
      const bugRadius = this.cellSize/4;
      if (this.collides(x,y, bugRadius)) { i--; continue; }

      let dirX = 0;
      let dirY = 0;
      // Ensure the direction vector is not (0,0) and normalize
      do {
        dirX = Math.random() * 2 - 1; // Random float between -1 and 1
        dirY = Math.random() * 2 - 1; // Random float between -1 and 1
      } while (dirX === 0 && dirY === 0);
      
      const len = Math.hypot(dirX, dirY);
      this.bugs.push({x,y,dirX: dirX/len, dirY: dirY/len, speed:120,fixed:false});
    }
  }

  private collides(x: number, y: number, radius: number): boolean {
    return x - radius < 0 || 
           x + radius > this.canvas.width || 
           y - radius < 0 || 
           y + radius > this.canvas.height;
  }

  private fixBug(b:Bug):void{
    if (b.fixed) return;
    this.fixing=true;
    const prompt=this.prompts.shift()!;
    const ans=window.prompt(`Fix the spelling: "${prompt.wrong}"`);
    if(ans?.trim().toLowerCase()===prompt.correct){b.fixed=true; const audio = new Audio('fix.mp3'); audio.play().catch(e => console.warn("Audio play failed:", e));}
    else alert(`Incorrect! Should be: ${prompt.correct}`);
    this.fixing=false;
    // wave logic
    if(this.bugs.every(b2=>b2.fixed)){
      if(!this.secondWave){this.secondWave=true; this.totalBugs=2; this.prompts=[{wrong:'clas',correct:'class'},{wrong:'objekt',correct:'object'}]; this.spawnBugs();}
      else this.phase='history';
    }
  }

  private drawHistory(ctx:CanvasRenderingContext2D):void{
    ctx.fillStyle='#222'; ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.fillStyle='#FFF'; ctx.font='20px sans-serif';
    const txt=`In the 1980s, debugging was manual: BASIC interpreters and assembly languages ran on terminals. Programmers used punch cards, step routines, and fixed bugs line by line. This instilled deep care for efficient, error-free code.`;
    const lines=this.wrapText(txt,this.canvas.width-40);
    lines.forEach((l,i)=>ctx.fillText(l,20,60+i*28));
    const bw=200,bh=40,bx=(this.canvas.width-bw)/2,by=this.canvas.height-80;
    ctx.fillStyle='#388E3C'; ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle='#FFF'; ctx.font='18px sans-serif'; ctx.fillText('Return to Island',bx+20,by+26);
  }

  private onCanvasClick = (e: MouseEvent): void => {
    if (this.phase === 'history') {
      const x = e.offsetX;
      const y = e.offsetY;
      const bw = 200, bh = 40;
      const bx = (this.canvas.width - bw) / 2;
      const by = this.canvas.height - 80;
      // If click is within the Return button bounds
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        this.onComplete();
      }
    }
  };
  private onKeyDown=(e:KeyboardEvent):void=>{ switch(e.key){ case'ArrowUp':case'w':this.moveX=0;this.moveY=-1;break; case'ArrowDown':case's':this.moveX=0;this.moveY=1;break; case'ArrowLeft':case'a':this.moveX=-1;this.moveY=0;break; case'ArrowRight':case'd':this.moveX=1;this.moveY=0;break; }};
  private onKeyUp=(e:KeyboardEvent):void=>{ if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){this.moveX=0;this.moveY=0;} };

  private wrapText(text:string,maxWidth:number):string[]{
    const words=text.split(' '),lines:string[]=[];
    let currentLine='';
    words.forEach(w=>{
      const testLine=currentLine?`${currentLine} ${w}`:w;
      if(this.ctx.measureText(testLine).width>maxWidth){ 
        if(currentLine !== '') lines.push(currentLine); // Push current line only if not empty
        currentLine=w; 
      } else {
        currentLine=testLine;
      }
    });
    if(currentLine) lines.push(currentLine);
    return lines;
  }
}
