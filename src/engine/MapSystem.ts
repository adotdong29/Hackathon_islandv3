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
  | 'bridge'
  | 'gate'
  | 'platform'
  | 'cherryBlossom'
  | 'lantern';

interface Decoration {
  type: DecoType;
  x: number;
  y: number;
  size?: number;
  height?: number;
  phase?: number;
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

  /** Determine tile type just as render does */
  private getTileTypeAt(c: number, r: number): TileType {
    const midC = this.cols / 2, midR = this.rows / 2;
    const dx = c + 0.5 - midC, dy = r + 0.5 - midR;
    const d = Math.hypot(dx, dy);
    const rad = this.cols * 0.45;
    if (d > rad) return 'water';
    if (this.pathTiles.has(`${c},${r}`)) return 'path';
    if (d > rad - 2) return 'sand';
    return 'grass';
  }

  /** Bresenham’s line algorithm */
  private bresenham(x0: number, y0: number, x1: number, y1: number): [number, number][] {
    const pts: [number, number][] = [];
    let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, x = x0, y = y0;
    while (true) {
      pts.push([x, y]);
      if (x === x1 && y === y1) break;
      const e2 = err * 2;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
    return pts;
  }

  /** Build two-segment (curved) paths from center to each region */
  private computePaths() {
    const midC = Math.floor(this.cols / 2),
          midR = Math.floor(this.rows / 2);

    for (const r of this.regionDefs) {
      const tx = Math.floor(r.xPct * this.cols),
            ty = Math.floor(r.yPct * this.rows);

      // pick a halfway pivot with slight randomness
      const px = Math.floor((midC + tx) / 2 + (Math.random() * 2 - 1) * 10),
            py = Math.floor((midR + ty) / 2 + (Math.random() * 2 - 1) * 10);
      const pivotX = Math.max(0, Math.min(this.cols - 1, px)),
            pivotY = Math.max(0, Math.min(this.rows - 1, py));

      // segment 1: center → pivot
      for (const [c, rr] of this.bresenham(midC, midR, pivotX, pivotY)) {
        this.pathTiles.add(`${c},${rr}`);
      }
      // segment 2: pivot → endpoint
      for (const [c, rr] of this.bresenham(pivotX, pivotY, tx, ty)) {
        this.pathTiles.add(`${c},${rr}`);
      }
    }
  }

  /** Scatter all decorations only on sensible tiles, guard against empty arrays */
  private scatterDecorations() {
    const totalW = this.cols * this.tileSize,
          totalH = this.rows * this.tileSize,
          midX = totalW / 2,
          midY = totalH / 2,
          islandR = Math.min(totalW, totalH) * 0.45,
          clusterTiles = 12;

    // (1) Central platform & gate
    this.decorations.push({ type: 'platform', x: midX, y: midY, size: 128 });
    this.decorations.push({ type: 'gate',     x: midX, y: midY - this.tileSize / 2, size: 64 });

    // (2) Region clusters
    for (const r of this.regionDefs) {
      const cx = Math.floor(r.xPct * this.cols),
            cy = Math.floor(r.yPct * this.rows);
      const wx = cx * this.tileSize + this.tileSize / 2,
            wy = cy * this.tileSize + this.tileSize / 2;

      switch (r.name) {
        case 'hardwareZone':
          // gather path tiles near endpoint
          const candidates = Array.from(this.pathTiles)
            .map(k => k.split(',').map(Number) as [number, number])
            .filter(([c, rr]) =>
              Math.hypot(c - cx, rr - cy) <= clusterTiles &&
              this.getTileTypeAt(c, rr) === 'path'
            );

          if (candidates.length > 0) {
            for (let i = 0; i < 200; i++) {
              const [c, rr] = candidates[Math.floor(Math.random() * candidates.length)];
              this.decorations.push({
                type: 'house',
                x: c * this.tileSize + this.tileSize / 2,
                y: rr * this.tileSize + this.tileSize / 2,
                size: 16 + Math.random() * 24
              });
            }
          }

          // single city block
          this.decorations.push({
            type: 'city',
            x: wx,
            y: wy,
            size: clusterTiles * this.tileSize * 0.8
          });
          break;

        case 'softwareValley':
          // dense micro-trees & cherry blossoms on grass
          for (let i = 0; i < 350; i++) {
            const a = Math.random() * 2 * Math.PI;
            const d = Math.sqrt(Math.random()) * clusterTiles;
            const tx = Math.floor(cx + Math.cos(a) * d),
                  ty = Math.floor(cy + Math.sin(a) * d);
            if (this.getTileTypeAt(tx, ty) === 'grass') {
              if (Math.random() < 0.2) {
                this.decorations.push({
                  type: 'cherryBlossom',
                  x: tx * this.tileSize + this.tileSize / 2,
                  y: ty * this.tileSize + this.tileSize / 2,
                  size: 16 + Math.random() * 16
                });
              } else {
                this.decorations.push({
                  type: 'microTree',
                  x: tx * this.tileSize + this.tileSize / 2,
                  y: ty * this.tileSize + this.tileSize / 2,
                  size: 12 + Math.random() * 12
                });
              }
            }
          }
          // lanterns along the path
          Array.from(this.pathTiles)
            .map(k => k.split(',').map(Number) as [number, number])
            .filter(([c, rr]) =>
              Math.hypot(c - cx, rr - cy) <= clusterTiles &&
              this.getTileTypeAt(c, rr) === 'path' &&
              Math.random() < 0.1
            )
            .forEach(([c, rr]) => {
              this.decorations.push({
                type: 'lantern',
                x: c * this.tileSize + this.tileSize / 2,
                y: rr * this.tileSize + this.tileSize / 2 - this.tileSize / 2,
                size: 12 + Math.random() * 8
              });
            });
          break;

        case 'arcadeCove':
          // seaside houses on sand
          for (let i = 0; i < 180; i++) {
            const a = Math.random() * 2 * Math.PI;
            const d = Math.sqrt(Math.random()) * clusterTiles;
            const tx = Math.floor(cx + Math.cos(a) * d),
                  ty = Math.floor(cy + Math.sin(a) * d);
            if (this.getTileTypeAt(tx, ty) === 'sand') {
              this.decorations.push({
                type: 'house',
                x: tx * this.tileSize + this.tileSize / 2,
                y: ty * this.tileSize + this.tileSize / 2,
                size: 16 + Math.random() * 16
              });
            }
          }
          // birds overhead
          for (let i = 0; i < 30; i++) {
            this.decorations.push({
              type: 'bird',
              x: wx - clusterTiles * this.tileSize + Math.random() * clusterTiles * this.tileSize * 2,
              y: wy - clusterTiles * this.tileSize * 0.5 + Math.random() * clusterTiles * this.tileSize * 0.5,
              phase: Math.random() * Math.PI * 2
            });
          }
          break;

        case 'consoleIsland':
          // mountain peaks on grass
          for (let i = 0; i < 220; i++) {
            const a = Math.random() * 2 * Math.PI;
            const d = Math.sqrt(Math.random()) * clusterTiles;
            const tx = Math.floor(cx + Math.cos(a) * d),
                  ty = Math.floor(cy + Math.sin(a) * d);
            if (this.getTileTypeAt(tx, ty) === 'grass') {
              this.decorations.push({
                type: 'mountain',
                x: tx * this.tileSize + this.tileSize / 2,
                y: ty * this.tileSize + this.tileSize / 2,
                size: 20 + Math.random() * 60
              });
            }
          }
          break;

        case 'mobileBay':
          // palms lining the beach
          for (let i = 0; i < 300; i++) {
            const a = Math.random() * 2 * Math.PI;
            const d = Math.sqrt(Math.random()) * clusterTiles;
            const tx = Math.floor(cx + Math.cos(a) * d),
                  ty = Math.floor(cy + Math.sin(a) * d);
            if (this.getTileTypeAt(tx, ty) === 'sand') {
              this.decorations.push({
                type: 'palm',
                x: tx * this.tileSize + this.tileSize / 2,
                y: ty * this.tileSize + this.tileSize / 2,
                size: 16 + Math.random() * 16
              });
            }
          }
          break;

        case 'internetPoint':
          // bamboo grove on grass
          for (let i = 0; i < 300; i++) {
            const a = Math.random() * 2 * Math.PI;
            const d = Math.sqrt(Math.random()) * clusterTiles;
            const tx = Math.floor(cx + Math.cos(a) * d),
                  ty = Math.floor(cy + Math.sin(a) * d);
            if (this.getTileTypeAt(tx, ty) === 'grass') {
              this.decorations.push({
                type: 'bamboo',
                x: tx * this.tileSize + this.tileSize / 2,
                y: ty * this.tileSize + this.tileSize / 2,
                height: 20 + Math.random() * 80
              });
            }
          }
          break;
      }
    }

    // (3) Bridges where path crosses water
    for (const key of this.pathTiles) {
      const [c, r] = key.split(',').map(Number);
      if (this.getTileTypeAt(c, r) === 'water') {
        this.decorations.push({
          type: 'bridge',
          x: c * this.tileSize + this.tileSize / 2,
          y: r * this.tileSize + this.tileSize / 2,
          size: this.tileSize
        });
      }
    }

    // (4) Micro-trees EVERYWHERE on grass
    const mapW = this.cols * this.tileSize,
          mapH = this.rows * this.tileSize;
    for (let i = 0; i < 2500; i++) {
      let tx: number, ty: number;
      do {
        const a = Math.random() * 2 * Math.PI;
        const dPx = Math.sqrt(Math.random()) * islandR;
        const wx = mapW / 2 + Math.cos(a) * dPx,
              wy = mapH / 2 + Math.sin(a) * dPx;
        tx = Math.floor(wx / this.tileSize);
        ty = Math.floor(wy / this.tileSize);
      } while (this.getTileTypeAt(tx, ty) !== 'grass');

      this.decorations.push({
        type: 'microTree',
        x: tx * this.tileSize + this.tileSize / 2,
        y: ty * this.tileSize + this.tileSize / 2,
        size: 4 + Math.random() * 8
      });
    }
  }

  /**
   * Render only visible tiles & decorations.
   */
  public render(
    rs: RenderSystem,
    camX: number, camY: number,
    viewW: number, viewH: number
  ) {
    const totalW = this.cols * this.tileSize,
          totalH = this.rows * this.tileSize;

    // draw water base
    rs.drawRect(0, 0, totalW, totalH, '#1E90FF');

    // cull & draw ground
    const sc = Math.max(0, Math.floor(camX / this.tileSize) - 1),
          ec = Math.min(this.cols, Math.ceil((camX + viewW) / this.tileSize) + 1),
          sr = Math.max(0, Math.floor(camY / this.tileSize) - 1),
          er = Math.min(this.rows, Math.ceil((camY + viewH) / this.tileSize) + 1);

    const midC = this.cols / 2, midR = this.rows / 2,
          rad  = this.cols * 0.45;

    for (let r = sr; r < er; r++) {
      for (let c = sc; c < ec; c++) {
        const dx = c + 0.5 - midC, dy = r + 0.5 - midR;
        const d  = Math.hypot(dx, dy);
        let type: TileType = 'water';
        if (d <= rad) {
          if (this.pathTiles.has(`${c},${r}`)) type = 'path';
          else if (d > rad - 2)                type = 'sand';
          else                                 type = 'grass';
        }
        rs.drawTile(c * this.tileSize, r * this.tileSize, this.tileSize, type);
      }
    }

    // cull & draw decorations
    const M = 64;
    const inView = (x: number, y: number) =>
      x >= camX - M && x <= camX + viewW + M &&
      y >= camY - M && y <= camY + viewH + M;

    for (const d of this.decorations) {
      if (!inView(d.x, d.y)) continue;
      switch (d.type) {
        case 'microTree':
          rs.drawTree(d.x, d.y, d.size!);
          break;
        case 'house':
          rs.drawHouse(d.x, d.y, d.size!);
          break;
        case 'city':
          rs.drawHouse(d.x, d.y, d.size!);
          break;
        case 'mountain':
          rs.drawMountain(d.x, d.y, d.size!);
          break;
        case 'bamboo':
          rs.drawBamboo(d.x, d.y, d.height!);
          break;
        case 'palm':
          rs.drawPalm(d.x, d.y, d.size!);
          break;
        case 'bird':
          const yoff = 10 * Math.sin(Date.now() / 1000 + d.phase!);
          rs.drawBird(d.x, d.y + yoff, 16);
          break;
        case 'bridge':
          rs.drawBridge(d.x, d.y, d.size!);
          break;
        case 'gate':
          rs.drawGate(d.x, d.y, d.size!);
          break;
        case 'platform':
          rs.drawPlatform(d.x, d.y, d.size!);
          break;
        case 'cherryBlossom':
          rs.drawCherryBlossom(d.x, d.y, d.size!);
          break;
        case 'lantern':
          rs.drawLantern(d.x, d.y, d.size!);
          break;
      }
    }

    // region labels
    for (const r of this.regionDefs) {
      const rx = r.xPct * totalW, ry = r.yPct * totalH;
      if (inView(rx, ry)) {
        rs.drawText(r.name, rx, ry + 20, '#FFF', 14, 'center');
      }
    }
  }

  /** Return the region we're in (within 2 tiles) */
  public getRegionAtPosition(x: number, y: number): MapRegion | null {
    const c = Math.floor(x / this.tileSize),
          r = Math.floor(y / this.tileSize);
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
