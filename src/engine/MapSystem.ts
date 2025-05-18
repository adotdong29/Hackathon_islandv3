// src/engine/MapSystem.ts

import { RenderSystem } from './RenderSystem';
import { MapRegion, TileType } from '../types/GameTypes';

interface RegionDef { name: string; xPct: number; yPct: number; }
type DecoType =
  | 'microTree' | 'house' | 'city' | 'mountain'
  | 'bamboo' | 'palm' | 'lantern' | 'cherryBlossom'
  | 'bridge' | 'gate' | 'platform' | 'pond';

interface Decoration {
  type: DecoType;
  x: number;
  y: number;
  size?: number;
  height?: number;
}

export class MapSystem {
  public cols = 500;
  public rows = 500;
  public tileSize = 32;

  public viewportX = 0;
  public viewportY = 0;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private cameraFollowX = 0;
  private cameraFollowY = 0;
  private cameraSmoothing = 1.0; // instant follow

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

  public update(): void {
    const tx = this.cameraFollowX - this.viewportWidth / 2;
    const ty = this.cameraFollowY - this.viewportHeight / 2;
    this.viewportX += (tx - this.viewportX) * this.cameraSmoothing;
    this.viewportY += (ty - this.viewportY) * this.cameraSmoothing;
  }

  public setCameraTarget(x: number, y: number): void {
    this.cameraFollowX = x;
    this.cameraFollowY = y;
  }

  private getTileTypeAt(col: number, row: number): TileType {
    const key = `${col},${row}`;
    if (this.pathTiles.has(key)) return 'path';
    const midC = this.cols / 2, midR = this.rows / 2;
    const dx = col + 0.5 - midC, dy = row + 0.5 - midR;
    const d = Math.hypot(dx, dy), rad = this.cols * 0.45;
    if (d > rad) return 'water';
    if (d > rad - 2) return 'sand';
    return 'grass';
  }

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

  private computePaths(): void {
    const midC = Math.floor(this.cols / 2), midR = Math.floor(this.rows / 2);
    for (const rd of this.regionDefs) {
      const tx = Math.floor(rd.xPct * this.cols), ty = Math.floor(rd.yPct * this.rows);
      const px = Math.floor((midC + tx) / 2 + (Math.random() * 2 - 1) * 10),
            py = Math.floor((midR + ty) / 2 + (Math.random() * 2 - 1) * 10);
      const pivotX = Math.max(0, Math.min(this.cols - 1, px)),
            pivotY = Math.max(0, Math.min(this.rows - 1, py));

      const line = [
        ...this.bresenham(midC, midR, pivotX, pivotY),
        ...this.bresenham(pivotX, pivotY, tx, ty),
      ];
      // widen to 3×3
      for (const [c, r] of line) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nc = c + dx, nr = r + dy;
            if (nc >= 0 && nc < this.cols && nr >= 0 && nr < this.rows) {
              this.pathTiles.add(`${nc},${nr}`);
            }
          }
        }
      }
    }
  }

  private scatterDecorations(): void {
    const W = this.cols * this.tileSize, H = this.rows * this.tileSize;
    const midX = W / 2, midY = H / 2, islandR = Math.min(W, H) * 0.45, cluster = 12;

    this.decorations.push({ type: 'platform', x: midX, y: midY, size: 128 });
    this.decorations.push({ type: 'gate', x: midX, y: midY - this.tileSize / 2, size: 64 });

    for (const rd of this.regionDefs) {
      const cx = Math.floor(rd.xPct * this.cols), cy = Math.floor(rd.yPct * this.rows);
      const wx = cx * this.tileSize + this.tileSize / 2, wy = cy * this.tileSize + this.tileSize / 2;
      switch (rd.name) {
        case 'hardwareZone': {
          const roads = Array.from(this.pathTiles)
            .map(k => k.split(',').map(Number) as [number, number])
            .filter(([c, r]) =>
              Math.hypot(c - cx, r - cy) <= cluster &&
              this.getTileTypeAt(c, r) === 'path'
            );
          for (let i = 0; i < 200 && roads.length; i++) {
            const [c, r] = roads[Math.floor(Math.random() * roads.length)];
            this.decorations.push({
              type: 'house',
              x: c * this.tileSize + this.tileSize / 2,
              y: r * this.tileSize + this.tileSize / 2,
              size: 16 + Math.random() * 24
            });
          }
          this.decorations.push({
            type: 'city',
            x: wx,
            y: wy,
            size: cluster * this.tileSize * 0.8
          });
        } break;

        case 'softwareValley': {
          for (let i = 0; i < 300; i++) {
            const a = Math.random() * 2 * Math.PI, d = Math.sqrt(Math.random()) * cluster;
            const tx = Math.floor(cx + Math.cos(a) * d),
                  ty = Math.floor(cy + Math.sin(a) * d);
            if (this.getTileTypeAt(tx, ty) === 'grass') {
              if (Math.random() < 0.3) {
                this.decorations.push({
                  type: 'cherryBlossom',
                  x: tx * this.tileSize + this.tileSize / 2,
                  y: ty * this.tileSize + this.tileSize / 2,
                  size: 16 + Math.random() * 16
                });
              } else {
                this.decorations.push({
                  type: 'lantern',
                  x: tx * this.tileSize + this.tileSize / 2,
                  y: ty * this.tileSize + this.tileSize / 2 - this.tileSize / 2,
                  size: 8 + Math.random() * 8
                });
              }
            }
          }
        } break;

        case 'arcadeCove': {
          for (let i = 0; i < 10; i++) {
            this.decorations.push({
              type: 'pond',
              x: wx + (Math.random() * 2 - 1) * cluster * this.tileSize * 0.5,
              y: wy + (Math.random() * 2 - 1) * cluster * this.tileSize * 0.5,
              size: 20 + Math.random() * 40
            });
          }
        } break;

        case 'consoleIsland': {
          for (let i = 0; i < 200; i++) {
            const a = Math.random() * 2 * Math.PI, d = Math.sqrt(Math.random()) * cluster;
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
        } break;

        case 'mobileBay': {
          for (let i = 0; i < 200; i++) {
            const a = Math.random() * 2 * Math.PI, d = Math.sqrt(Math.random()) * cluster;
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
        } break;

        case 'internetPoint': {
          for (let i = 0; i < 200; i++) {
            const a = Math.random() * 2 * Math.PI, d = Math.sqrt(Math.random()) * cluster;
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
        } break;
      }
    }

    // bridges over water
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

    // micro-trees
    for (let i = 0; i < 2000; i++) {
      let tx: number, ty: number;
      do {
        const a = Math.random() * 2 * Math.PI, d = Math.random() * islandR;
        const wx2 = midX + Math.cos(a) * d, wy2 = midY + Math.sin(a) * d;
        tx = Math.floor(wx2 / this.tileSize);
        ty = Math.floor(wy2 / this.tileSize);
      } while (this.getTileTypeAt(tx, ty) !== 'grass');
      this.decorations.push({
        type: 'microTree',
        x: tx * this.tileSize + this.tileSize / 2,
        y: ty * this.tileSize + this.tileSize / 2,
        size: 4 + Math.random() * 6
      });
    }
  }

  public render(
    rs: RenderSystem,
    camX: number, camY: number,
    viewW: number, viewH: number
  ): void {
    this.viewportWidth = viewW;
    this.viewportHeight = viewH;

    const midC = this.cols / 2, midR = this.rows / 2, rad = this.cols * 0.45;
    const sc = Math.max(0, Math.floor(camX / this.tileSize) - 1),
          ec = Math.min(this.cols, Math.ceil((camX + viewW) / this.tileSize) + 1),
          sr = Math.max(0, Math.floor(camY / this.tileSize) - 1),
          er = Math.min(this.rows, Math.ceil((camY + viewH) / this.tileSize) + 1);

    // tiles & bridges
    for (let r = sr; r < er; r++) {
      for (let c = sc; c < ec; c++) {
        const key = `${c},${r}`;
        const dx = c + 0.5 - midC, dy = r + 0.5 - midR;
        const d = Math.hypot(dx, dy);

        if (this.pathTiles.has(key) && d > rad) {
          rs.drawBridge(c * this.tileSize - camX, r * this.tileSize - camY, this.tileSize);
        } else {
          const type = this.getTileTypeAt(c, r);
          rs.drawTile(c * this.tileSize - camX, r * this.tileSize - camY, this.tileSize, type);
        }
      }
    }

    // decorations
    const inView = (x: number, y: number) =>
      x - camX >= -64 && x - camX <= viewW + 64 &&
      y - camY >= -64 && y - camY <= viewH + 64;

    for (const d of this.decorations) {
      if (!inView(d.x, d.y)) continue;
      const dx = d.x - camX, dy = d.y - camY;
      switch (d.type) {
        case 'microTree':     rs.drawTree(dx, dy, d.size!);           break;
        case 'house':         rs.drawHouse(dx, dy, d.size!);          break;
        case 'city':          rs.drawHouse(dx, dy, d.size!);          break;
        case 'mountain':      rs.drawMountain(dx, dy, d.size!);       break;
        case 'bamboo':        rs.drawBamboo(dx, dy, d.height!);       break;
        case 'palm':          rs.drawPalm(dx, dy, d.size!);           break;
        case 'lantern':       rs.drawLantern(dx, dy, d.size!);        break;
        case 'cherryBlossom': rs.drawCherryBlossom(dx, dy, d.size!);  break;
        case 'bridge':        rs.drawBridge(dx, dy, d.size!);         break;
        case 'gate':          rs.drawGate(dx, dy, d.size!);           break;
        case 'platform':      rs.drawPlatform(dx, dy, d.size!);       break;
        case 'pond':          rs.drawPond(dx, dy, d.size!);           break;
      }
    }

    // region labels
    for (const rd of this.regionDefs) {
      const wx = rd.xPct * this.cols * this.tileSize - camX;
      const wy = rd.yPct * this.rows * this.tileSize - camY;
      if (inView(wx, wy)) {
        rs.drawText(rd.name, wx, wy + 20, '#FFF', 14, 'center');
      }
    }
  }

  public isWalkable(x: number, y: number): boolean {
    const tx = Math.floor(x / this.tileSize), ty = Math.floor(y / this.tileSize);
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const type = this.getTileTypeAt(tx, ty);
    return type === 'path' || type === 'sand' || type === 'grass';
  }

  public getRegionAtPosition(x: number, y: number): MapRegion | null {
    const c = Math.floor(x / this.tileSize), r = Math.floor(y / this.tileSize);
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
