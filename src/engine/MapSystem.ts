// src/engine/MapSystem.ts

import { RenderSystem } from './RenderSystem';
import { MapRegion, TileType } from '../types/GameTypes';

interface RegionDef {
  name: string;
  xPct: number;
  yPct: number;
}

export class MapSystem {
  private cols = 200;
  private rows = 200;
  public tileSize = 32;

  // Region endpoints (six challenges)
  private regionDefs: RegionDef[] = [
    { name: 'hardwareZone',   xPct: 0.15, yPct: 0.10 },
    { name: 'softwareValley', xPct: 0.85, yPct: 0.10 },
    { name: 'arcadeCove',     xPct: 0.15, yPct: 0.75 },
    { name: 'consoleIsland',  xPct: 0.85, yPct: 0.75 },
    { name: 'mobileBay',      xPct: 0.15, yPct: 0.40 },
    { name: 'internetPoint',  xPct: 0.85, yPct: 0.40 },
  ];

  private pathTiles = new Set<string>();

  // Decorations computed once:
  private trees: { x: number; y: number; size: number }[] = [];
  private houses: { x: number; y: number }[] = [];
  private birds:  { x: number; yBase: number; phase: number }[] = [];

  constructor() {
    this.computePaths();
    this.scatterDecorations();
  }

  /** Bresenham line for path generation */
  private bresenham(x0: number,y0: number,x1: number,y1: number): [number,number][] {
    const pts: [number,number][] = [];
    let dx = Math.abs(x1-x0), sx = x0<x1?1:-1;
    let dy = -Math.abs(y1-y0), sy = y0<y1?1:-1;
    let err = dx+dy, x = x0, y = y0;
    while (true) {
      pts.push([x,y]);
      if (x===x1 && y===y1) break;
      const e2 = err*2;
      if (e2>=dy){ err+=dy; x+=sx; }
      if (e2<=dx){ err+=dx; y+=sy; }
    }
    return pts;
  }

  /** Build pathTiles set from center to each region */
  private computePaths() {
    const midC = Math.floor(this.cols/2), midR = Math.floor(this.rows/2);
    this.regionDefs.forEach(r => {
      const tc = Math.floor(r.xPct * this.cols);
      const tr = Math.floor(r.yPct * this.rows);
      this.bresenham(midC,midR,tc,tr).forEach(([c,rr]) =>
        this.pathTiles.add(`${c},${rr}`)
      );
    });
  }

  /** Scatter trees, houses, birds once */
  private scatterDecorations() {
    const midC = this.cols/2, midR = this.rows/2;
    const radius = Math.min(this.cols,this.rows)*0.45;

    // Trees
    for (let i=0;i<400;i++){
      const ang = Math.random()*2*Math.PI;
      const rad = radius*(0.4+0.4*Math.random());
      const x = (midC+Math.cos(ang)*rad)*this.tileSize;
      const y = (midR+Math.sin(ang)*rad)*this.tileSize;
      this.trees.push({x,y, size:8+Math.random()*8});
    }

    // Houses
    for (let i=0;i<100;i++){
      const ang = Math.random()*2*Math.PI;
      const rad = radius*(0.85+0.1*Math.random());
      const x = (midC+Math.cos(ang)*rad)*this.tileSize;
      const y = (midR+Math.sin(ang)*rad)*this.tileSize;
      this.houses.push({x,y});
    }

    // Birds
    for (let i=0;i<12;i++){
      this.birds.push({
        x: Math.random()*this.cols*this.tileSize,
        yBase: Math.random()*this.rows*this.tileSize*0.2,
        phase: Math.random()*Math.PI*2
      });
    }
  }

  /**
   * Draw the entire map.
   * The camera transform in GameEngine will limit what's visible.
   */
  public render(rs: RenderSystem): void {
    const W = this.cols*this.tileSize, H = this.rows*this.tileSize;
    // 1) Water
    rs.drawRect(0,0,W,H,'#1E90FF');

    // 2) Tiles
    const midC = this.cols/2, midR = this.rows/2;
    const rad  = Math.min(this.cols,this.rows)*0.45;
    for (let r=0;r<this.rows;r++){
      for (let c=0;c<this.cols;c++){
        const dx = c+0.5-midC, dy = r+0.5-midR;
        const dist = Math.hypot(dx,dy);
        let type: TileType = 'water';
        if (dist<=rad){
          if (this.pathTiles.has(`${c},${r}`)) type='path';
          else if (dist>rad-2) type='sand';
          else type='grass';
        }
        rs.drawTile(c*this.tileSize, r*this.tileSize, this.tileSize, type);
      }
    }

    // 3) Decorations
    this.trees.forEach(t => rs.drawTree(t.x,t.y,t.size));
    this.houses.forEach(h => rs.drawHouse(h.x,h.y,32));
    this.birds.forEach((b,i) => {
      const y = b.yBase + 10*Math.sin(Date.now()/1000 + b.phase);
      rs.drawBird(b.x,y,16);
    });

    // 4) Region labels
    this.regionDefs.forEach(r => {
      const rx = r.xPct * W, ry = r.yPct * H;
      rs.drawText(r.name, rx, ry+20, '#FFF', 14, 'center');
    });
  }

  /** Which region are we in? within 2 tiles of the endpoint. */
  public getRegionAtPosition(x:number,y:number): MapRegion|null {
    const c = Math.floor(x/this.tileSize), r = Math.floor(y/this.tileSize);
    for (const rd of this.regionDefs) {
      const tc = Math.floor(rd.xPct*this.cols), tr = Math.floor(rd.yPct*this.rows);
      if (Math.abs(c-tc)<=2 && Math.abs(r-tr)<=2) {
        return { name: rd.name };
      }
    }
    return null;
  }
}
