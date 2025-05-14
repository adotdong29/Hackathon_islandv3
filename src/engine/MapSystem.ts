// src/engine/MapSystem.ts

import { RenderSystem } from './RenderSystem';
import { MapRegion } from '../types/GameTypes';

interface RegionDef {
  name: string;
  xPct: number; // fraction from left (0–1)
  yPct: number; // fraction from top (0–1)
}

export class MapSystem {
  private cols = 100;
  private rows = 100;
  public tileSize = 32;

  // Define the 6 region endpoints as percentages of the map
  private regionDefs: RegionDef[] = [
    { name: 'hardwareZone',   xPct: 0.20, yPct: 0.15 },
    { name: 'softwareValley', xPct: 0.80, yPct: 0.15 },
    { name: 'arcadeCove',     xPct: 0.20, yPct: 0.70 },
    { name: 'consoleIsland',  xPct: 0.80, yPct: 0.70 },
    { name: 'mobileBay',      xPct: 0.20, yPct: 0.40 },
    { name: 'internetPoint',  xPct: 0.80, yPct: 0.40 },
  ];

  // Precompute path tiles using Bresenham’s line algorithm
  private pathTiles = new Set<string>();

  constructor() {
    this.computePaths();
  }

  /** Bresenham line between two tile coords */
  private bresenham(x0: number, y0: number, x1: number, y1: number): [number, number][] {
    const points: [number, number][] = [];
    let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0, y = y0;
    while (true) {
      points.push([x, y]);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
    return points;
  }

  /** Compute path tiles from center to each region */
  private computePaths() {
    const midC = Math.floor(this.cols / 2);
    const midR = Math.floor(this.rows / 2);
    this.regionDefs.forEach(r => {
      const tc = Math.floor(r.xPct * this.cols);
      const tr = Math.floor(r.yPct * this.rows);
      const line = this.bresenham(midC, midR, tc, tr);
      line.forEach(([c, rr]) => this.pathTiles.add(`${c},${rr}`));
    });
  }

  /**
   * Draw the entire island (only visible portion will actually appear due to camera transform).
   */
  public render(rs: RenderSystem): void {
    const totalW = this.cols * this.tileSize;
    const totalH = this.rows * this.tileSize;

    // (1) Fill water
    rs.drawRect(0, 0, totalW, totalH, '#1E90FF');

    // (2) Draw each tile (sand, grass, path) based on distance from center & pathTiles
    const midC = this.cols / 2;
    const midR = this.rows / 2;
    const radius = Math.min(this.cols, this.rows) * 0.45;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const dx = c + 0.5 - midC;
        const dy = r + 0.5 - midR;
        const dist = Math.sqrt(dx*dx + dy*dy);
        let type: 'water'|'sand'|'grass' = 'water';
        if (dist <= radius) {
          if (this.pathTiles.has(`${c},${r}`)) {
            type = 'path';
          } else if (dist > radius - 2) {
            type = 'sand';
          } else {
            type = 'grass';
          }
        }
        const px = c * this.tileSize;
        const py = r * this.tileSize;
        rs.drawTile(px, py, this.tileSize, type);
      }
    }

    // (3) Scatter forests
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const rr = radius * (0.5 + 0.5 * Math.random());
      const cx = (midC + Math.cos(angle)*rr) * this.tileSize;
      const cy = (midR + Math.sin(angle)*rr) * this.tileSize;
      const sz = 8 + Math.random()*8;
      rs.drawTree(cx, cy, sz);
    }

    // (4) Scatter beach houses
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const rr = radius * (0.9 + 0.1 * Math.random());
      const cx = (midC + Math.cos(angle)*rr) * this.tileSize;
      const cy = (midR + Math.sin(angle)*rr) * this.tileSize;
      rs.drawHouse(cx, cy, 32);
    }

    // (5) Flap some birds near the top edge
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * totalW;
      const y = Math.random() * (totalH * 0.2);
      rs.drawBird(x, y + 10 * Math.sin(Date.now()/1000 + i), 16);
    }

    // (6) Draw region labels
    this.regionDefs.forEach(r => {
      const rx = r.xPct * totalW;
      const ry = r.yPct * totalH;
      rs.drawText(r.name, rx, ry + 20, '#FFF', 14, 'center');
    });
  }

  /**
   * Which region (if any) contains the given world coordinates?
   * We consider “inside” if within ~2 tiles of the endpoint.
   */
  public getRegionAtPosition(x: number, y: number): MapRegion | null {
    const c = Math.floor(x / this.tileSize);
    const r = Math.floor(y / this.tileSize);
    for (const rd of this.regionDefs) {
      const rc = Math.floor(rd.xPct * this.cols);
      const rr = Math.floor(rd.yPct * this.rows);
      if (Math.abs(c - rc) <= 2 && Math.abs(r - rr) <= 2) {
        return { name: rd.name } as MapRegion;
      }
    }
    return null;
  }
}
