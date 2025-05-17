// src/minigames/TVAssemblyGame.ts

import { IMinigame } from './IMinigame';

interface TVPart {
  name:string; x:number; y:number; w:number; h:number;
  placed:boolean; tx:number; ty:number; color:string;
}

export class TVAssemblyGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private onComplete!: () => void;
  private parts: TVPart[] = [];
  private dragging?: TVPart;
  private offsetX=0; private offsetY=0;
  private stage=1;
  private puzzles = ['FRIENDS','SEINFELD','MIAMI VICE'];
  private solvedCount=0;

  init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.onComplete = onComplete;
    this.parts = [];
    // create 5 TV parts
    const names = ['CRT','Coils','Circuit','Tuner','Antenna'];
    names.forEach((n,i)=>{
      this.parts.push({
        name: n,
        x:50, y:100+i*80,
        w:100,h:50,
        placed:false,
        tx:canvas.width*0.6, ty:150+i*70,
        color:'#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0')
      });
    });
    canvas.addEventListener('pointerdown',this.onDown);
    canvas.addEventListener('pointermove',this.onMove);
    canvas.addEventListener('pointerup',this.onUp);
  }

  update(dt:number):void {
    if(this.stage===2 && this.solvedCount>=this.puzzles.length){
      setTimeout(()=>{
        alert('📺 All puzzles solved!');
        this.onComplete();
      },500);
    }
  }

  render(ctx:CanvasRenderingContext2D):void {
    ctx.fillStyle='#111'; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle='#FFF'; ctx.font='20px monospace';
    if(this.stage===1){
      ctx.fillText('Assemble the 1980s TV',20,30);
      this.parts.forEach(p=>{
        ctx.strokeStyle=p.placed?'#0F0':'#888'; ctx.lineWidth=2;
        ctx.strokeRect(p.tx,p.ty,p.w,p.h);
        if(!p.placed||p===this.dragging){
          ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.w,p.h);
          ctx.fillStyle='#000'; ctx.fillText(p.name,p.x+5,p.y+30);
        }
      });
    } else {
      ctx.fillText('Solve TV Puzzles',20,30);
      this.puzzles.forEach((w,i)=>{
        ctx.fillStyle = i < this.solvedCount ? '#0F0' : '#FFF';
        ctx.fillText(w,50,150 + i*60);
      });
    }
  }

  private onDown=(e:PointerEvent)=>{
    if(this.stage!==1) return;
    const r=this.canvas.getBoundingClientRect();
    const mx=e.clientX-r.left, my=e.clientY-r.top;
    this.dragging=this.parts.find(p=>!p.placed&&mx>=p.x&&mx<=p.x+p.w&&my>=p.y&&my<=p.y+p.h);
    if(this.dragging){
      this.offsetX=mx-this.dragging.x;
      this.offsetY=my-this.dragging.y;
    }
  };

  private onMove=(e:PointerEvent)=>{
    if(!this.dragging) return;
    const r=this.canvas.getBoundingClientRect();
    this.dragging.x=e.clientX-r.left-this.offsetX;
    this.dragging.y=e.clientY-r.top -this.offsetY;
  };

  private onUp=(e:PointerEvent)=>{
    if(!this.dragging) return;
    const p=this.dragging;
    if(Math.hypot(p.x-p.tx,p.y-p.ty)<40){
      p.x=p.tx; p.y=p.ty; p.placed=true;
      if(this.parts.every(x=>x.placed)){
        this.stage=2;
      }
    }
    this.dragging=undefined;
  };

  destroy():void{
    this.canvas.removeEventListener('pointerdown',this.onDown);
    this.canvas.removeEventListener('pointermove',this.onMove);
    this.canvas.removeEventListener('pointerup',this.onUp);
  }
}
