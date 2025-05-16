// src/engine/MapSystem.ts

import { RenderSystem } from './RenderSystem';
import { MapRegion, TileType } from '../types/GameTypes';

interface RegionDef {
  name: string;
  xPct: number;
  yPct: number;
}

type DecoType =
  | 'microTree'
  | 'house'
  | 'city'
  | 'mountain'
  | 'bamboo'
  | 'palm'
  | 'bird'
  | 'banner'
  | 'lantern'
  | 'cherryBlossom'
  | 'mascot'
  | 'floatingIsland';

interface Decoration {
  type: DecoType;
  x: number;
  y: number;          // for bird this is base Y
  size?: number;      // for many
  height?: number;    // for bamboo
  phase?: number;     // for bird
  x2?: number;        // for banner
  y2?: number;        // for banner
}

export class MapSystem {
  public cols = 500;
  public rows = 500;
  public tileSize = 32;

  public regionDefs: RegionDef[] = [
    { name: 'hardwareZone',   xPct: 0.15, yPct: 0.10 },
    { name: 'softwareValley', xPct: 0.85, yPct: 0.10 },
    { name: 'arcadeCove',     xPct: 0.15, yPct: 0.75 },
    { name: 'consoleIsland',  xPct: 0.85, yPct: 0.75 },
    { name: 'mobileBay',      xPct: 0.15, yPct: 0.40 },
    { name: 'internetPoint',  xPct: 0.85, yPct: 0.40 },
  ];

  private pathTiles = new Set<string>();
  private decorations: Decoration[] = [];

  constructor() {
    this.computePaths();
    this.scatterDecorations();
  }

  private bresenham(x0:number,y0:number,x1:number,y1:number): [number,number][] {
    const pts: [number,number][] = [];
    let dx = Math.abs(x1-x0), sx = x0<x1?1:-1;
    let dy = -Math.abs(y1-y0), sy = y0<y1?1:-1;
    let err = dx+dy, x=x0, y=y0;
    while(true){
      pts.push([x,y]);
      if(x===x1 && y===y1) break;
      const e2 = err*2;
      if(e2>=dy){ err+=dy; x+=sx; }
      if(e2<=dx){ err+=dx; y+=sy; }
    }
    return pts;
  }

  private computePaths() {
    const midC = Math.floor(this.cols/2),
          midR = Math.floor(this.rows/2);
    this.regionDefs.forEach(r => {
      const tc = Math.floor(r.xPct*this.cols),
            tr = Math.floor(r.yPct*this.rows);
      this.bresenham(midC,midR,tc,tr).forEach(([c,rr]) =>
        this.pathTiles.add(`${c},${rr}`)
      );
    });
  }

  private scatterDecorations() {
    const totalW = this.cols*this.tileSize,
          totalH = this.rows*this.tileSize,
          midX = totalW/2, midY = totalH/2,
          islandR = Math.min(totalW,totalH)*0.45;

    // Region clusters + new decals
    this.regionDefs.forEach(r => {
      const cx = r.xPct*totalW, cy = r.yPct*totalH;
      const rad= this.tileSize*15;

      // Banners strung from center to each region
      this.decorations.push({
        type: 'banner',
        x: midX, y: midY,
        x2: cx, y2: cy
      });

      // Lanterns near software valley
      if(r.name==='softwareValley'){
        for(let i=0;i<30;i++){
          const a = Math.random()*2*Math.PI;
          const d = Math.sqrt(Math.random())*rad;
          this.decorations.push({
            type:'lantern',
            x: cx+Math.cos(a)*d,
            y: cy+Math.sin(a)*d,
            size:12+Math.random()*8
          });
        }
      }

      // Other clusters
      switch(r.name){
        case 'hardwareZone':
          for(let i=0;i<200;i++){
            const a=Math.random()*2*Math.PI, d=Math.sqrt(Math.random())*rad;
            this.decorations.push({ type:'house', x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d, size:16+Math.random()*24 });
          }
          this.decorations.push({ type:'city', x:cx, y:cy, size:rad*0.8 });
          break;

        case 'softwareValley':
          for(let i=0;i<300;i++){
            const a=Math.random()*2*Math.PI, d=Math.sqrt(Math.random())*rad;
            this.decorations.push({ type:'microTree', x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d, size:12+Math.random()*16 });
          }
          break;

        case 'arcadeCove':
          for(let i=0;i<150;i++){
            const a=Math.random()*2*Math.PI, d=Math.sqrt(Math.random())*rad;
            this.decorations.push({ type:'mascot', x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d, size:16+Math.random()*16 });
          }
          break;

        case 'consoleIsland':
          for(let i=0;i<200;i++){
            const a=Math.random()*2*Math.PI, d=Math.sqrt(Math.random())*rad;
            this.decorations.push({ type:'cherryBlossom', x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d, size:16+Math.random()*24 });
          }
          break;

        case 'mobileBay':
          for(let i=0;i<300;i++){
            const a=Math.random()*2*Math.PI, d=Math.sqrt(Math.random())*rad;
            this.decorations.push({ type:'palm', x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d, size:16+Math.random()*16 });
          }
          break;

        case 'internetPoint':
          for(let i=0;i<200;i++){
            const a=Math.random()*2*Math.PI, d=Math.sqrt(Math.random())*rad;
            this.decorations.push({ type:'floatingIsland', x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d, size:rad*0.5, height:rad*0.3 });
          }
          break;
      }
    });

    // Micro‐trees everywhere
    for(let i=0;i<5000;i++){
      const angle = Math.random()*2*Math.PI;
      const dist  = Math.sqrt(Math.random())*islandR;
      this.decorations.push({
        type:'microTree',
        x: midX + Math.cos(angle)*dist,
        y: midY + Math.sin(angle)*dist,
        size:4 + Math.random()*8
      });
    }
  }

  public render(
    rs: RenderSystem,
    camX: number, camY: number,
    viewW: number, viewH: number
  ): void {
    const totalW = this.cols*this.tileSize,
          totalH = this.rows*this.tileSize;

    // ocean
    rs.drawRect(0,0,totalW,totalH,'#1E90FF');

    // tiles (culled)
    const sc = Math.max(0, Math.floor(camX/this.tileSize) -1),
          ec = Math.min(this.cols, Math.ceil((camX+viewW)/this.tileSize)+1),
          sr = Math.max(0, Math.floor(camY/this.tileSize) -1),
          er = Math.min(this.rows, Math.ceil((camY+viewH)/this.tileSize)+1);

    const midC=this.cols/2, midR=this.rows/2, rad = Math.min(this.cols,this.rows)*0.45;

    for(let r=sr;r<er;r++){
      for(let c=sc;c<ec;c++){
        const dx=c+0.5-midC, dy=r+0.5-midR, d=Math.hypot(dx,dy);
        let type:TileType='water';
        if(d<=rad){
          if(this.pathTiles.has(`${c},${r}`)) type='path';
          else if(d>rad-2)                   type='sand';
          else                                type='grass';
        }
        rs.drawTile(c*this.tileSize, r*this.tileSize, this.tileSize, type);
      }
    }

    // decorations (culled)
    const M=64;
    const inView=(x:number,y:number)=>
      x>=camX-M && x<=camX+viewW+M &&
      y>=camY-M && y<=camY+viewH+M;

    for(const d of this.decorations){
      if(!inView(d.x,d.y)) continue;
      switch(d.type){
        case 'microTree': rs.drawTree(d.x,d.y,d.size!); break;
        case 'house':     rs.drawHouse(d.x,d.y,d.size!); break;
        case 'city':      rs.drawHouse(d.x,d.y,d.size!); break;
        case 'mountain':  rs.drawMountain(d.x,d.y,d.size!); break;
        case 'bamboo':    rs.drawBamboo(d.x,d.y,d.height!); break;
        case 'palm':      rs.drawPalm(d.x,d.y,d.size!); break;
        case 'bird':      { const yoff=10*Math.sin(Date.now()/1000+d.phase!); rs.drawBird(d.x,d.y+yoff,16); } break;
        case 'banner':    rs.drawBanner(d.x,d.y,d.x2!,d.y2!); break;
        case 'lantern':   rs.drawLantern(d.x,d.y,d.size!); break;
        case 'cherryBlossom': rs.drawCherryBlossom(d.x,d.y,d.size!); break;
        case 'mascot':    rs.drawMascot(d.x,d.y,d.size!); break;
        case 'floatingIsland': rs.drawFloatingIsland(d.x,d.y,d.size!,d.height!); break;
      }
    }

    // region labels
    for(const r of this.regionDefs){
      const rx=r.xPct*totalW, ry=r.yPct*totalH;
      if(inView(rx,ry)) rs.drawText(r.name, rx, ry+20, '#FFF', 14, 'center');
    }
  }

  public getRegionAtPosition(x:number,y:number): MapRegion|null{
    const c=Math.floor(x/this.tileSize), r=Math.floor(y/this.tileSize);
    for(const rd of this.regionDefs){
      const tc=Math.floor(rd.xPct*this.cols),
            tr=Math.floor(rd.yPct*this.rows);
      if(Math.abs(c-tc)<=2 && Math.abs(r-tr)<=2) return { name: rd.name };
    }
    return null;
  }
}
