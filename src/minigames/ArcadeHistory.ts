// src/minigames/ArcadeHistoryGame.ts

import { IMinigame } from './IMinigame';

type Item = { name:string; date:number; desc:string; };

export class ArcadeHistoryGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private onComplete!: () => void;

  // Part 1: arcade games
  private games: Item[] = [
    {name:'Space Invaders', date:1978, desc:'Alien‐shooting classic'},
    {name:'Pac-Man',       date:1980, desc:'Maze‐eating icon'},
    {name:'Donkey Kong',   date:1981, desc:'Jump over barrels'},
    {name:'Frogger',       date:1981, desc:'Cross the road'},
    {name:'Galaga',        date:1981, desc:'Space shooter'},
    {name:'Q*bert',        date:1982, desc:'Isometric jumps'}
  ];
  // shuffled order
  private order1 = [] as Item[];

  // Part 2: consoles
  private consoles: Item[] = [
    {name:'Atari 2600', date:1977, desc:'8-bit home'},
    {name:'ColecoVision',date:1982, desc:'Arcade ports'},
    {name:'NES',        date:1983, desc:'Nintendo revolution'},
    {name:'Sega Master',date:1985, desc:'Sega’s challenger'}
  ];
  private order2 = [] as Item[];

  private stage = 1;
  private dragIndex: number| null = null;
  private dragY = 0;

  init(canvas: HTMLCanvasElement, onComplete: () => void) {
    this.canvas = canvas;
    this.onComplete = onComplete;
    this.order1 = this.shuffle([...this.games]);
    this.order2 = this.shuffle([...this.consoles]);
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup',   this.onUp);
  }

  update(dt: number) {
    // nothing
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#222'; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle = '#FFF'; ctx.font='18px monospace';
    const list = this.stage===1 ? this.order1 : this.order2;
    const header = this.stage===1 ? 'Order the games by release' : 'Order the consoles by release';
    ctx.fillText(header, 20, 30);

    list.forEach((it,i) => {
      const y = 80 + i*60 + (this.dragIndex===i ? (this.dragY - 30) : 0);
      ctx.fillStyle = '#444';
      ctx.fillRect(50, y, 300, 40);
      ctx.fillStyle = '#FFF';
      ctx.fillText(it.name, 60, y+28);
    });
  }

  private onDown = (e: PointerEvent) => {
    const y = e.clientY;
    const list = this.stage===1 ? this.order1 : this.order2;
    list.forEach((_,i) => {
      const top = 80 + i*60, bot = top+40;
      if (y >= top && y <= bot) {
        this.dragIndex = i;
        this.dragY = y;
      }
    });
  };

  private onMove = (e: PointerEvent) => {
    if (this.dragIndex != null) {
      this.dragY = e.clientY;
    }
  };

  private onUp = (e: PointerEvent) => {
    if (this.dragIndex != null) {
      // swap based on drop position
      const newIndex = Math.floor((this.dragY - 80) / 60 + 0.5);
      const list = this.stage===1 ? this.order1 : this.order2;
      const i = this.dragIndex;
      const j = Math.min(list.length-1, Math.max(0, newIndex));
      [list[i], list[j]] = [list[j], list[i]];
      this.dragIndex = null;

      // check if correctly ordered
      const ordered = list.every((it,k) => {
        if (this.stage===1)
          return it.date === this.games.sort((a,b)=>a.date-b.date)[k].date;
        else
          return it.date === this.consoles.sort((a,b)=>a.date-b.date)[k].date;
      });
      if (ordered) {
        if (this.stage===1) {
          alert('🎉 Games ordered! Now match descriptions.');
          this.stage = 2;
        } else {
          alert('✅ Consoles ordered! Well done!');
          this.onComplete();
        }
      }
    }
  };

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerup',   this.onUp);
  }

  private shuffle<T>(arr: T[]): T[] {
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }
}
