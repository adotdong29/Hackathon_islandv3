// src/minigames/HardwareAssemblyGame.ts

import { IMinigame } from './IMinigame';

/**
 * Educational PC Assembly Game
 * Retro Google Doodle Championship Island style
 * Part 1: Interactive Demo
 * Part 2: Logic-based Assembly with auto-snap, labeled sockets, darker theme
 * Completion: In-depth IBM PC history overview with return to map
 */
interface Component {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  placed: boolean;
  targetX: number;
  targetY: number;
  color: string;
  description: string;
  dependencies: string[];
  justSnapped?: number;
}

export class HardwareAssemblyGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;
  private components: Component[] = [];
  private phase: 'demo' | 'assembly' | 'boot' | 'history' = 'demo';
  private demoIndex = 0;
  private dragging: Component | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private progress = 0;
  private bootPct = 0;
  private hintTimer = 0;

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    localStorage.removeItem('hwProgress');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.setupComponents();
    this.addListeners();
  }

  public update(dt: number): void {
    if (this.phase === 'assembly') {
      this.hintTimer += dt;
      if (this.hintTimer > 30000) {
        this.showHint();
        this.hintTimer = 0;
      }
    } else if (this.phase === 'boot') {
      this.bootPct = Math.min(1, this.bootPct + dt / 1000);
      if (this.bootPct >= 1) {
        this.phase = 'history';
      }
    }
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#2E2E2E'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.phase === 'demo') this.drawDemo(ctx);
    else if (this.phase === 'assembly') this.drawAssembly(ctx);
    else if (this.phase === 'boot') this.drawBoot(ctx);
    else this.drawHistory(ctx);
  }

  public destroy(): void {
    this.removeListeners();
  }

  private setupComponents(): void {
    const defs: Partial<Component>[] = [
      { id: 'motherboard', name: 'Motherboard', color: '#455A64', description: 'Main PCB hosting CPU socket, DIMM slots, PCIe lanes, SATA ports.', dependencies: [] },
      { id: 'cpu', name: 'CPU', color: '#546E7A', description: 'Intel 8088 CPU: executes instructions. Installs into CPU socket.', dependencies: ['motherboard'] },
      { id: 'ram', name: 'RAM', color: '#37474F', description: '16–64KB RAM: volatile memory. Install into DIMM slots.', dependencies: ['motherboard'] },
      { id: 'gpu', name: 'Graphics Card', color: '#616161', description: 'CGA graphics card. Connect via PCIe slot.', dependencies: ['motherboard','cpu','ram'] },
      { id: 'storage', name: 'Storage', color: '#546E7A', description: 'Floppy/HDD: holds OS/data. Connect via SATA port.', dependencies: ['motherboard'] },
      { id: 'psu', name: 'Power Supply', color: '#455A64', description: 'Supplies +5V/±12V power. Mount last and connect.', dependencies: ['motherboard','cpu','ram','gpu','storage'] }
    ];
    const mountX=180, mountY=180, mountW=440, mountH=390;
    this.components = defs.map((d,i)=>{
      let tx=0, ty=0;
      if(d.id==='motherboard'){
        tx = mountX+(mountW-100)/2;
        ty = mountY+(mountH-50)/2;
      } else {
        const idx = defs.findIndex(x=>x.id===d.id)-1;
        tx = 230 + (idx%2)*180;
        ty = 300 + Math.floor(idx/2)*140;
      }
      return { id:d.id!, name:d.name!, x:60+i*120, y:80, w:100, h:50, placed:false, targetX:tx, targetY:ty, color:d.color!, description:d.description!, dependencies:d.dependencies! } as Component;
    });
    this.phase='demo'; this.demoIndex=0; this.progress=0; this.bootPct=0; this.hintTimer=0;
    this.loadProgress();
  }

  private addListeners(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('click', this.onCanvasClick);
    window.addEventListener('resize', this.onResize);
  }

  private removeListeners(): void {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    window.removeEventListener('resize', this.onResize);
  }

  private drawDemo(ctx:CanvasRenderingContext2D):void{
    const c=this.components[this.demoIndex];
    ctx.strokeStyle='#90A4AE';ctx.lineWidth=4;ctx.strokeRect(180,180,440,390);
    ctx.fillStyle=c.color;ctx.fillRect(c.x,c.y,c.w,c.h);
    ctx.strokeStyle='#CFD8DC';ctx.strokeRect(c.x,c.y,c.w,c.h);
    ctx.fillStyle='#ECEFF1';ctx.font='14px sans-serif';ctx.fillText(c.name,c.x+5,c.y+20);
    ctx.fillStyle='#37474F';ctx.fillRect(220,260,360,100);
    ctx.fillStyle='#ECEFF1';ctx.font='16px sans-serif';this.wrapText(`${c.name}: ${c.description}`,340).forEach((l,i)=>ctx.fillText(l,230,290+i*24));
    ctx.fillStyle='#CFD8DC';ctx.fillText('Click ▶',520,550);
  }

  private drawAssembly(ctx:CanvasRenderingContext2D):void{
    const mountX=180,mountY=180,mountW=440,mountH=390;
    ctx.fillStyle='#546E7A';ctx.fillRect(mountX,mountY,mountW,mountH);
    ctx.strokeStyle='#B0BEC5';ctx.lineWidth=2;ctx.strokeRect(mountX,mountY,mountW,mountH);
    ctx.fillStyle='#ECEFF1';ctx.font='14px sans-serif';ctx.fillText('Motherboard Mount',mountX+5,mountY-5);
    const sockets=[
      {label:'CPU Socket',x:360,y:260,w:80,h:80},
      {label:'DIMM Slots',x:300,y:360,w:220,h:100},
      {label:'PCIe Slot',x:300,y:480,w:300,h:20},
      {label:'SATA Port',x:620,y:380,w:20,h:10},
      {label:'PSU Mount',x:180,y:560,w:440,h:70}
    ];
    sockets.forEach(s=>{ctx.strokeRect(s.x,s.y,s.w,s.h);ctx.fillText(s.label,s.x+5,s.y-5);});
    if(this.dragging){const d=this.dragging;ctx.save();ctx.strokeStyle='#FFEB3B';ctx.setLineDash([5,5]);ctx.lineWidth=4;ctx.strokeRect(d.targetX,d.targetY,d.w,d.h);ctx.restore();}
    const now=Date.now();
    this.components.forEach(c=>{
      ctx.globalAlpha=c.placed?0.6:1;ctx.fillStyle=c.color;ctx.fillRect(c.x,c.y,c.w,c.h);
      ctx.strokeStyle='#CFD8DC';ctx.strokeRect(c.x,c.y,c.w,c.h);
      ctx.fillStyle='#ECEFF1';ctx.font='12px sans-serif';ctx.fillText(c.name,c.x+5,c.y+15);
      ctx.globalAlpha=1; if(c.justSnapped && now-c.justSnapped<300){ctx.save();ctx.strokeStyle='#76FF03';ctx.lineWidth=6;ctx.strokeRect(c.targetX,c.targetY,c.w,c.h);ctx.restore();}
      if(c.placed){if(c.id==='ram'){c.w=20;c.h=100;}else if(c.id==='storage'){c.w=20;c.h=20;}else if(c.id==='psu'){c.w=mountW;c.h=70;}ctx.strokeStyle='#8BC34A';ctx.lineWidth=2;ctx.beginPath();const sx=c.targetX+c.w/2,sy=c.targetY+c.h/2;let tx=sx,ty=sy;switch(c.id){case'motherboard':tx=mountX+mountW/2;ty=mountY+mountH/2;break;case'cpu':tx=360+40;ty=260+40;break;case'ram':tx=300+110;ty=360+50;break;case'gpu':tx=300+150;ty=480+10;break;case'storage':tx=620+10;ty=380+5;break;case'psu':tx=mountX+mountW/2;ty=560+35;break;}ctx.moveTo(sx,sy);ctx.lineTo(tx,ty);ctx.stroke();}
    });
    ctx.fillStyle='#8BC34A';ctx.fillRect(20,20,this.progress*(this.canvas.width-40),10);
    ctx.fillStyle='#D84315';ctx.fillRect(this.canvas.width-100,10,90,30);ctx.fillStyle='#ECEFF1';ctx.fillText('Reset',this.canvas.width-70,30);
  }

  private drawBoot(ctx:CanvasRenderingContext2D):void{ctx.fillStyle='#212121';ctx.fillRect(0,0,this.canvas.width,this.canvas.height);ctx.fillStyle='#8BC34A';ctx.font='36px monospace';const txt='BOOT INITIATED';const w=ctx.measureText(txt).width;ctx.fillText(txt,(this.canvas.width-w)/2,this.canvas.height/2);ctx.fillRect((this.canvas.width-300)/2,this.canvas.height/2+40,this.bootPct*300,30);}

  private drawHistory(ctx:CanvasRenderingContext2D):void{ctx.fillStyle='#ECEFF1';ctx.fillRect(50,50,this.canvas.width-100,this.canvas.height-100);ctx.fillStyle='#212121';ctx.font='18px sans-serif';this.wrapText('In 1981, IBM 5150 PC standardized open architecture: Intel 8088 CPU, 16–64KB RAM, CGA graphics, 5.25" floppy drive, expansion slots.',this.canvas.width-120).forEach((l,i)=>ctx.fillText(l,70,100+i*28));this.wrapText('Motherboard: PCB backbone; CPU socket holds processor; DIMM slots hold RAM; PCIe slot adds graphics; SATA port connects drives; PSU supplies power.',this.canvas.width-120).forEach((l,i)=>ctx.fillText(l,70,180+i*24));const bw=200,bh=40,bx=(this.canvas.width-bw)/2,by=this.canvas.height-120;ctx.fillStyle='#388E3C';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle='#ECEFF1';ctx.font='20px sans-serif';ctx.fillText('Return to Island',bx+30,by+28);}

  private onCanvasClick=(e:MouseEvent):void=>{const x=e.offsetX,y=e.offsetY;if(this.phase==='demo'){this.demoIndex++;if(this.demoIndex>=this.components.length)this.phase='assembly';}else if(this.phase==='assembly'){if(x>=this.canvas.width-100&&x<=this.canvas.width-10&&y>=10&&y<=40)this.setupComponents();}else if(this.phase==='history'){const bw=200,bh=40,bx=(this.canvas.width-bw)/2,by=this.canvas.height-120;if(x>=bx&&x<=bx+bw&&y>=by&&y<=by+bh)this.onComplete();}};

  private onMouseDown=(e:MouseEvent):void=>{if(this.phase!=='assembly')return;const x=e.offsetX,y=e.offsetY;for(const c of this.components){if(!c.placed&&x>=c.x&&x<=c.x+c.w&&y>=c.y&&y<=c.y+c.h){if(c.dependencies.every(id=>this.components.find(p=>p.id===id)!.placed)){this.dragging=c;this.offsetX=x-c.x;this.offsetY=y-c.y;}else{this.ctx.save();this.ctx.strokeStyle='#F44336';this.ctx.lineWidth=4;this.ctx.strokeRect(c.x-2,c.y-2,c.w+4,c.h+4);this.ctx.restore();}break;}}};

  private onMouseMove=(e:MouseEvent):void=>{if(!this.dragging)return;this.dragging.x=e.offsetX-this.offsetX;this.dragging.y=e.offsetY-this.offsetY;};

  private onMouseUp=(e:MouseEvent):void=>{if(!this.dragging)return;const c=this.dragging,dx=c.x-c.targetX,dy=c.y-c.targetY;if(Math.hypot(dx,dy)<40){c.x=c.targetX;c.y=c.targetY;c.placed=true;c.justSnapped=Date.now();this.checkProgress();this.saveProgress();}this.dragging=null;};

  private showHint():void{const next=this.components.find(c=>!c.placed);if(next){this.ctx.save();this.ctx.strokeStyle='#FFEB3B';this.ctx.lineWidth=5;this.ctx.setLineDash([10,5]);this.ctx.strokeRect(next.targetX-10,next.targetY-10,next.w+20,next.h+20);this.ctx.restore();}}

  private checkProgress():void{this.progress=this.components.filter(c=>c.placed).length/this.components.length;if(this.progress>=1)this.phase='boot';}

  private saveProgress():void{localStorage.setItem('hwProgress',JSON.stringify(this.components.map(c=>c.placed)));}

  private loadProgress():void{const d=localStorage.getItem('hwProgress');if(d){const arr=JSON.parse(d) as boolean[];this.components.forEach((c,i)=>c.placed=arr[i]);this.checkProgress();}}

  private onResize=():void=>{this.canvas.width=window.innerWidth;this.canvas.height=window.innerHeight;};

  private wrapText(text:string,maxWidth:number):string[]{const words=text.split(' '),lines:string[]=[];let cur='';for(const w of words){const test=cur?cur+' '+w:w;if(this.ctx.measureText(test).width>maxWidth){lines.push(cur);cur=w;}else cur=test;}if(cur)lines.push(cur);return lines;}
}
