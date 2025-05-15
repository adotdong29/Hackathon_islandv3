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
  | 'bird';

interface Decoration {
  type: DecoType;
  x: number;
  y: number;          // for bird this is base Y
  size?: number;      // for tree/house/city/mountain/palm
  height?: number;    // for bamboo
  phase?: number;     // for bird flapping
}

export class MapSystem {
  public cols = 500;
  public rows = 500;
  public tileSize = 32;

  /** The six challenge endpoints */
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

  /** Bresenham’s line for radial paths */
  private bresenham(x0:number,y0:number,x1:number,y1:number): [number,number][] {
    const pts: [number,number][] = [];
    let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, x = x0, y = y0;
    while (true) {
      pts.push([x,y]);
      if (x === x1 && y === y1) break;
      const e2 = err*2;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
    return pts;
  }

  /** Build path tiles from map‐center to each region */
  private computePaths() {
    const midC = Math.floor(this.cols/2),
          midR = Math.floor(this.rows/2);

    this.regionDefs.forEach(r => {
      const tc = Math.floor(r.xPct * this.cols),
            tr = Math.floor(r.yPct * this.rows);
      for (const [c, rr] of this.bresenham(midC, midR, tc, tr)) {
        this.pathTiles.add(`${c},${rr}`);
      }
    });
  }

  /** Scatter both major‐cluster and micro decorations */
  private scatterDecorations() {
    const midWorldX = (this.cols * this.tileSize) / 2;
    const midWorldY = (this.rows * this.tileSize) / 2;
    const mapRadiusPx = Math.min(this.cols, this.rows) * this.tileSize * 0.45;

    // 1) Region‐specific clusters
    this.regionDefs.forEach(r => {
      const cx = r.xPct * this.cols * this.tileSize;
      const cy = r.yPct * this.rows * this.tileSize;
      const radius = this.tileSize * 15;

      switch (r.name) {
        case 'hardwareZone':
          // City: many small houses + one big city block
          for (let i = 0; i < 250; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'house',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              size: 16 + Math.random()*24
            });
          }
          this.decorations.push({
            type: 'city',
            x: cx, y: cy,
            size: radius * 0.8
          });
          break;

        case 'softwareValley':
          // Lush forest
          for (let i = 0; i < 400; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'microTree',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              size: 12 + Math.random()*16
            });
          }
          break;

        case 'arcadeCove':
          // Coastal village + birds overhead
          for (let i = 0; i < 200; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'house',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              size: 16 + Math.random()*16
            });
          }
          for (let i = 0; i < 40; i++) {
            this.decorations.push({
              type: 'bird',
              x: cx - radius + Math.random()*radius*2,
              y: cy - radius*0.5 + Math.random()*radius*0.5,
              phase: Math.random()*Math.PI*2
            });
          }
          break;

        case 'consoleIsland':
          // Mountain peaks
          for (let i = 0; i < 300; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'mountain',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              size: 20 + Math.random()*60
            });
          }
          break;

        case 'mobileBay':
          // Palm beaches
          for (let i = 0; i < 350; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'palm',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              size: 16 + Math.random()*16
            });
          }
          break;

        case 'internetPoint':
          // Bamboo grove
          for (let i = 0; i < 450; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'bamboo',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              height: 20 + Math.random()*80
            });
          }
          break;
      }
    });

    // 2) Micro‐trees ALL OVER the island so the center is never empty
    for (let i = 0; i < 3000; i++) {
      const angle = Math.random()*2*Math.PI;
      const d = Math.sqrt(Math.random()) * mapRadiusPx;
      this.decorations.push({
        type: 'microTree',
        x: midWorldX + Math.cos(angle)*d,
        y: midWorldY + Math.sin(angle)*d,
        size: 4 + Math.random()*8
      });
    }
  }

  /**
   * Render only the visible slice of the map + decorations.
   */
  public render(
    rs: RenderSystem,
    camX: number, camY: number,
    viewW: number, viewH: number
  ): void {
    const totalW = this.cols * this.tileSize;
    const totalH = this.rows * this.tileSize;

    // 1) Water base
    rs.drawRect(0,0,totalW,totalH,'#1E90FF');

    // 2) Cull & draw ground tiles
    const startC = Math.max(0, Math.floor(camX/this.tileSize) - 1);
    const endC   = Math.min(this.cols, Math.ceil((camX+viewW)/this.tileSize) + 1);
    const startR = Math.max(0, Math.floor(camY/this.tileSize) - 1);
    const endR   = Math.min(this.rows, Math.ceil((camY+viewH)/this.tileSize) + 1);

    const midC = this.cols/2, midR = this.rows/2,
          rad  = Math.min(this.cols,this.rows)*0.45;

    for (let r = startR; r < endR; r++) {
      for (let c = startC; c < endC; c++) {
        const dx = c + 0.5 - midC, dy = r + 0.5 - midR;
        const d  = Math.hypot(dx,dy);
        let type: TileType = 'water';
        if (d <= rad) {
          if (this.pathTiles.has(`${c},${r}`)) type='path';
          else if (d > rad - 2)                type='sand';
          else                                 type='grass';
        }
        rs.drawTile(c*this.tileSize, r*this.tileSize, this.tileSize, type);
      }
    }

    // 3) Cull & draw decorations
    const M = 64;
    const inView = (x:number,y:number) =>
      x >= camX - M && x <= camX + viewW + M
      && y >= camY - M && y <= camY + viewH + M;

    for (const d of this.decorations) {
      if (!inView(d.x,d.y)) continue;
      switch (d.type) {
        case 'microTree':
          rs.drawTree(d.x,d.y,d.size!);
          break;
        case 'house':
          rs.drawHouse(d.x,d.y,d.size!);
          break;
        case 'city':
          rs.drawHouse(d.x,d.y,d.size!);
          break;
        case 'mountain':
          rs.drawMountain(d.x,d.y,d.size!);
          break;
        case 'bamboo':
          rs.drawBamboo(d.x,d.y,d.height!);
          break;
        case 'palm':
          rs.drawPalm(d.x,d.y,d.size!);
          break;
        case 'bird':
          const yoff = 10 * Math.sin(Date.now()/1000 + d.phase!);
          rs.drawBird(d.x, d.y + yoff, 16);
          break;
      }
    }

    // 4) Region labels
    for (const r of this.regionDefs) {
      const rx = r.xPct * totalW, ry = r.yPct * totalH;
      if (inView(rx, ry)) {
        rs.drawText(r.name, rx, ry + 20, '#FFF', 14, 'center');
      }
    }
  }

  /** Which region contains this world point? */
  public getRegionAtPosition(x:number,y:number): MapRegion|null {
    const c = Math.floor(x/this.tileSize),
          r = Math.floor(y/this.tileSize);
    for (const rd of this.regionDefs) {
      const tc = Math.floor(rd.xPct * this.cols),
            tr = Math.floor(rd.yPct * this.rows);
      if (Math.abs(c - tc) <= 2 && Math.abs(r - tr) <= 2) {
        return { name: rd.name };
      }
    }
    return null;
  }
}
