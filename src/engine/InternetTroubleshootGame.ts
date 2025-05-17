// src/minigames/InternetTroubleshootGame.ts

import { IMinigame } from './IMinigame';

interface Component {
  name: string;
  typo: string;
  correct: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fixed: boolean;
}

export class InternetTroubleshootGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  private components: Component[] = [];
  private startTime = 0;
  private elapsed = 0;
  private allFixed = false;
  private parTime = 60_000; // 60 seconds par

  init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    this.canvas.addEventListener('pointerdown', this.handlePointer);

    this.startTime = performance.now();
    this.elapsed = 0;
    this.allFixed = false;

    // Layout a 3×2 grid of components
    const w = canvas.width, h = canvas.height;
    const cols = 3, rows = 2;
    const boxW = w / (cols + 1), boxH = h / (rows + 1);
    const names: Array<[string, string]> = [
      ['Router',        'Ruter'],
      ['Switch',        'Swich'],
      ['Cable',         'Cabel'],
      ['DNS Server',    'DMS Server'],
      ['Data Center',   'Data Cneter'],
      ['Protocol',      'Protocl'],
    ];

    this.components = names.map(([correct, typo], i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = (col + 1) * boxW;
      const cy = (row + 1) * boxH;
      return {
        name: correct,
        typo,
        correct,
        x: cx - boxW / 3,
        y: cy - boxH / 4,
        width: (boxW * 2) / 3,
        height: boxH / 2,
        fixed: false,
      };
    });
  }

  update(dt: number): void {
    if (this.allFixed) return;
    this.elapsed = performance.now() - this.startTime;

    if (this.components.every(c => c.fixed)) {
      this.allFixed = true;
      // Wait 2s for the celebration then back to island
      setTimeout(() => this.onComplete(), 2000);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // clear
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // title
    ctx.fillStyle = '#0F0';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Internet Troubleshooter', this.canvas.width / 2, 40);

    // timer & par
    ctx.fillStyle = '#FFF';
    ctx.font = '18px monospace';
    ctx.fillText(
      `Time: ${(this.elapsed / 1000).toFixed(1)}s   Par: ${(this.parTime / 1000).toFixed(0)}s`,
      this.canvas.width / 2,
      70
    );

    // progress bar
    const barW = this.canvas.width * 0.6,
          barH = 20,
          barX = (this.canvas.width - barW) / 2,
          barY = 90;
    const doneCount = this.components.filter(c => c.fixed).length;
    const pct = doneCount / this.components.length;
    // background
    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, barW, barH);
    // fill
    ctx.fillStyle = '#0F0';
    ctx.fillRect(barX, barY, barW * pct, barH);
    // border
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(barX, barY, barW, barH);

    // draw each component box
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    for (const comp of this.components) {
      // box
      ctx.fillStyle = comp.fixed ? '#088' : '#444';
      ctx.fillRect(comp.x, comp.y, comp.width, comp.height);
      ctx.strokeStyle = comp.fixed ? '#0F0' : '#FFF';
      ctx.strokeRect(comp.x, comp.y, comp.width, comp.height);
      // label
      ctx.fillStyle = '#FFF';
      ctx.fillText(
        comp.fixed ? comp.correct : comp.typo,
        comp.x + 10,
        comp.y + comp.height / 2 + 6
      );
    }

    // completion message
    if (this.allFixed) {
      ctx.fillStyle = '#FF0';
      ctx.font = '32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✓ Internet Restored!', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  private handlePointer = (e: PointerEvent): void => {
    if (this.allFixed) return;
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const comp of this.components) {
      if (!comp.fixed &&
          mx >= comp.x && mx <= comp.x + comp.width &&
          my >= comp.y && my <= comp.y + comp.height
      ) {
        // prompt fix
        const ans = prompt(`Fix the typo in "${comp.typo}"`, comp.correct);
        if (ans !== null && ans.trim().toLowerCase() === comp.correct.toLowerCase()) {
          comp.fixed = true;
        } else {
          alert('Incorrect—check your spelling!');
        }
        break;
      }
    }
  };

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointer);
  }
}
