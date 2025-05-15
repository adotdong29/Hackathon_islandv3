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
  | 'cherryBlossom'
  | 'lantern'
  | 'floatingIsland'
  | 'banner'
  | 'mascot'
  | 'portal'
  | 'crystals';

interface Decoration {
  type: DecoType;
  x: number;
  y: number;          // for bird/lantern/mascot this is base Y
  size?: number;      // for tree/house/city/mountain/palm/crystals
  height?: number;    // for bamboo/banner
  phase?: number;     // for animated elements
  color?: string;     // for lanterns/banners
  floatOffset?: number; // for floating elements
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
  private neonColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF1493', '#4169E1', '#32CD32'];

  constructor() {
    this.computePaths();
    this.scatterDecorations();
  }

  /** Bresenham's line for radial paths */
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

    // Add floating islands around the map edges
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = mapRadiusPx * 0.9;
      this.decorations.push({
        type: 'floatingIsland',
        x: midWorldX + Math.cos(angle) * distance,
        y: midWorldY + Math.sin(angle) * distance,
        size: 80 + Math.random() * 40,
        floatOffset: Math.random() * Math.PI * 2
      });
    }

    // Add portals at each region entrance
    this.regionDefs.forEach(r => {
      const x = r.xPct * this.cols * this.tileSize;
      const y = r.yPct * this.rows * this.tileSize;
      this.decorations.push({
        type: 'portal',
        x: x,
        y: y - 40,
        phase: Math.random() * Math.PI * 2
      });
    });

    // Region-specific clusters with enhanced decorations
    this.regionDefs.forEach(r => {
      const cx = r.xPct * this.cols * this.tileSize;
      const cy = r.yPct * this.rows * this.tileSize;
      const radius = this.tileSize * 15;

      // Add floating lanterns around each region
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rd = radius * 0.8;
        this.decorations.push({
          type: 'lantern',
          x: cx + Math.cos(angle) * rd,
          y: cy + Math.sin(angle) * rd,
          color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)],
          floatOffset: Math.random() * Math.PI * 2
        });
      }

      // Add banners
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const rd = radius * 0.6;
        this.decorations.push({
          type: 'banner',
          x: cx + Math.cos(angle) * rd,
          y: cy + Math.sin(angle) * rd,
          height: 60 + Math.random() * 20,
          color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)]
        });
      }

      switch (r.name) {
        case 'hardwareZone':
          // Cyber city with crystal formations
          for (let i = 0; i < 250; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'crystals',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              size: 16 + Math.random()*24,
              color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)]
            });
          }
          break;

        case 'softwareValley':
          // Cherry blossom forest
          for (let i = 0; i < 400; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'cherryBlossom',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              size: 12 + Math.random()*16,
              phase: Math.random() * Math.PI * 2
            });
          }
          break;

        case 'arcadeCove':
          // Animated mascots and neon signs
          for (let i = 0; i < 20; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            this.decorations.push({
              type: 'mascot',
              x: cx + Math.cos(a)*rd,
              y: cy + Math.sin(a)*rd,
              phase: Math.random() * Math.PI * 2
            });
          }
          break;

        case 'consoleIsland':
          // Crystal mountains and floating platforms
          for (let i = 0; i < 300; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            if (Math.random() < 0.7) {
              this.decorations.push({
                type: 'mountain',
                x: cx + Math.cos(a)*rd,
                y: cy + Math.sin(a)*rd,
                size: 20 + Math.random()*60
              });
            } else {
              this.decorations.push({
                type: 'floatingIsland',
                x: cx + Math.cos(a)*rd,
                y: cy + Math.sin(a)*rd,
                size: 40 + Math.random()*20,
                floatOffset: Math.random() * Math.PI * 2
              });
            }
          }
          break;

        case 'mobileBay':
          // Magical palm trees and lanterns
          for (let i = 0; i < 350; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            if (Math.random() < 0.7) {
              this.decorations.push({
                type: 'palm',
                x: cx + Math.cos(a)*rd,
                y: cy + Math.sin(a)*rd,
                size: 16 + Math.random()*16
              });
            } else {
              this.decorations.push({
                type: 'lantern',
                x: cx + Math.cos(a)*rd,
                y: cy + Math.sin(a)*rd,
                color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)],
                floatOffset: Math.random() * Math.PI * 2
              });
            }
          }
          break;

        case 'internetPoint':
          // Digital bamboo grove with floating data streams
          for (let i = 0; i < 450; i++) {
            const a = Math.random()*2*Math.PI;
            const rd = Math.sqrt(Math.random()) * radius;
            if (Math.random() < 0.7) {
              this.decorations.push({
                type: 'bamboo',
                x: cx + Math.cos(a)*rd,
                y: cy + Math.sin(a)*rd,
                height: 20 + Math.random()*80
              });
            } else {
              this.decorations.push({
                type: 'crystals',
                x: cx + Math.cos(a)*rd,
                y: cy + Math.sin(a)*rd,
                size: 12 + Math.random()*16,
                color: '#00FFFF'
              });
            }
          }
          break;
      }
    });

    // Scatter cherry blossoms and magical elements across the island
    for (let i = 0; i < 2000; i++) {
      const angle = Math.random()*2*Math.PI;
      const d = Math.sqrt(Math.random()) * mapRadiusPx * 0.8;
      if (Math.random() < 0.7) {
        this.decorations.push({
          type: 'cherryBlossom',
          x: midWorldX + Math.cos(angle)*d,
          y: midWorldY + Math.sin(angle)*d,
          size: 4 + Math.random()*8,
          phase: Math.random() * Math.PI * 2
        });
      } else {
        this.decorations.push({
          type: 'crystals',
          x: midWorldX + Math.cos(angle)*d,
          y: midWorldY + Math.sin(angle)*d,
          size: 4 + Math.random()*8,
          color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)]
        });
      }
    }
  }

  public render(
    rs: RenderSystem,
    camX: number, camY: number,
    viewW: number, viewH: number
  ): void {
    const totalW = this.cols * this.tileSize;
    const totalH = this.rows * this.tileSize;

    // 1) Water base with animated gradient
    const time = Date.now() / 1000;
    rs.drawWaterBackground(0, 0, totalW, totalH, time);

    // 2) Ground tiles with enhanced effects
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
        rs.drawEnhancedTile(c*this.tileSize, r*this.tileSize, this.tileSize, type, time);
      }
    }

    // 3) Render decorations with animations
    const M = 64;
    const inView = (x:number,y:number) =>
      x >= camX - M && x <= camX + viewW + M
      && y >= camY - M && y <= camY + viewH + M;

    // Sort decorations by y-coordinate for proper layering
    const visibleDecorations = this.decorations
      .filter(d => inView(d.x, d.y))
      .sort((a, b) => a.y - b.y);

    for (const d of visibleDecorations) {
      const floatY = d.floatOffset ? 
        Math.sin(time + d.floatOffset) * 10 : 0;

      switch (d.type) {
        case 'cherryBlossom':
          rs.drawCherryBlossom(d.x, d.y + floatY, d.size!, time + (d.phase || 0));
          break;
        case 'lantern':
          rs.drawLantern(d.x, d.y + floatY, d.color!, time);
          break;
        case 'floatingIsland':
          rs.drawFloatingIsland(d.x, d.y + floatY, d.size!, time);
          break;
        case 'banner':
          rs.drawBanner(d.x, d.y, d.height!, d.color!, time);
          break;
        case 'mascot':
          rs.drawMascot(d.x, d.y + floatY, time + (d.phase || 0));
          break;
        case 'portal':
          rs.drawPortal(d.x, d.y + floatY, time + (d.phase || 0));
          break;
        case 'crystals':
          rs.drawCrystals(d.x, d.y, d.size!, d.color!, time);
          break;
        case 'microTree':
          rs.drawEnhancedTree(d.x, d.y, d.size!, time);
          break;
        case 'house':
          rs.drawEnhancedHouse(d.x, d.y, d.size!, time);
          break;
        case 'mountain':
          rs.drawEnhancedMountain(d.x, d.y, d.size!, time);
          break;
        case 'bamboo':
          rs.drawEnhancedBamboo(d.x, d.y, d.height!, time);
          break;
        case 'palm':
          rs.drawEnhancedPalm(d.x, d.y, d.size!, time);
          break;
        case 'bird':
          const yoff = 10 * Math.sin(time + (d.phase || 0));
          rs.drawEnhancedBird(d.x, d.y + yoff, 16, time);
          break;
      }
    }

    // 4) Region labels with enhanced styling
    for (const r of this.regionDefs) {
      const rx = r.xPct * totalW, ry = r.yPct * totalH;
      if (inView(rx, ry)) {
        rs.drawEnhancedText(r.name, rx, ry + 20, time);
      }
    }
  }

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