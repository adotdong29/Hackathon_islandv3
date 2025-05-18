// src/minigames/InternetTroubleshootGame.ts

import { IMinigame } from './IMinigame';

interface Component {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  typo: string;
  correct: string;
  hint: string;
  fixed: boolean;
}

type Phase = 'inspect' | 'fixing' | 'complete';

export class InternetTroubleshootGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  private comps: Component[] = [];
  private phase: Phase = 'inspect';
  private startTime = 0;
  private endTime = 0;

  constructor() {}

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    this.setupComponents();
    this.startTime = performance.now();
    canvas.addEventListener('click', this.onClick);
  }

  public update(dt: number): void {
    // no continuous animation
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    if (this.phase === 'inspect') {
      this.renderInspect(ctx);
    } else if (this.phase === 'complete') {
      this.renderComplete(ctx);
    }
  }

  public destroy(): void {
    this.canvas.removeEventListener('click', this.onClick);
  }

  private setupComponents(): void {
    const compSize = 100; // Size of each component box
    const spacing = 40;   // Spacing between components
    const topMargin = 120; // Margin from the top for the first row of components
    const sideMargin = 50;  // Margin from the sides of the canvas

    // Layout in two rows
    const labels = [
      {id:'router',label:'Router',typo:'routre',correct:'router',hint:'Starts with r and ends with r'},
      {id:'switch',label:'Switch',typo:'swich',correct:'switch',hint:"Has two t's? Actually one t"},
      {id:'cable',label:'Cable',typo:'cabel',correct:'cable',hint:'Ends with le'},
      {id:'dns',label:'DNS Server',typo:'DN Server',correct:'DNS Server',hint:'Three letters acronym DNS'},
      {id:'cloud',label:'Data Center',typo:'Data Cneter',correct:'Data Center',hint:'Center spelled C-e-n-t-e-r'},
      {id:'tcp',label:'TCP Protocol',typo:'TC Protocol',correct:'TCP Protocol',hint:'Three letters TCP'}
    ];

    // Calculate number of columns based on canvas width
    const availableWidth = this.canvas.width - 2 * sideMargin;
    const itemsPerRow = Math.max(1, Math.floor(availableWidth / (compSize + spacing)));
    const totalItemWidth = itemsPerRow * compSize + (itemsPerRow - 1) * spacing;
    const startXOffset = (this.canvas.width - totalItemWidth) / 2;

    this.comps = labels.map((d, i) => {
      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);
      return {
        id: d.id,
        label: d.label,
        typo: d.typo,
        correct: d.correct,
        hint: d.hint,
        w: compSize,
        h: compSize,
        x: startXOffset + col * (compSize + spacing),
        y: topMargin + row * (compSize + spacing + 20), // +20 for more vertical gap
        fixed: false
      };
    });
  }

  private renderInspect(ctx: CanvasRenderingContext2D): void {
    // Title centered
    ctx.fillStyle = '#222'; ctx.fillRect(0, 0, this.canvas.width, 60);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Internet Down - Click or Tap Components to Inspect', this.canvas.width / 2, 40);
    // Progress bar background centered width
    const progressBarY = 70;
    const progressBarHeight = 15;
    const pbWidth = this.canvas.width * 0.8; // Progress bar width relative to canvas
    const pbX = (this.canvas.width - pbWidth) / 2; // Center the progress bar
    ctx.fillStyle = '#555'; ctx.fillRect(pbX, progressBarY, pbWidth, progressBarHeight);
    // Progress
    const fixedCount = this.comps.filter(c => c.fixed).length;
    const pct = fixedCount / this.comps.length;
    ctx.fillStyle = '#0f0'; ctx.fillRect(pbX, progressBarY, pbWidth * pct, progressBarHeight);
    // Draw components
    this.comps.forEach(c => {
      ctx.save();
      ctx.globalAlpha = c.fixed ? 0.5 : 1;
      ctx.fillStyle = '#444'; ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2);
      ctx.restore();
    });
  }

  private renderComplete(ctx: CanvasRenderingContext2D): void {
    // Celebration
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#0f0'; ctx.font = '32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Internet Restored!', this.canvas.width / 2, 100);

    const secs = ((this.endTime - this.startTime) / 1000).toFixed(2);
    ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
    ctx.fillText(`Time: ${secs} seconds`, this.canvas.width / 2, 150);

    // History overview
    const history = 'ARPANET laid the groundwork in the 1960s, evolving into the modern Internet with TCP/IP standardization in 1983. The World Wide Web, invented in 1989, democratized access, leading to the global interconnected network we use today.';
    ctx.font = '16px sans-serif';
    this.wrapText(history, this.canvas.width - 120).forEach((line, i) => {
      ctx.fillText(line, this.canvas.width / 2, 200 + i * 24);
    });

    // Return button
    const bw=200, bh=50;
    const bx=(this.canvas.width-bw)/2, by=this.canvas.height-150;
    ctx.fillStyle='#388E3C'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle='#fff'; ctx.fillText('Return to Island', this.canvas.width/2, by+32);
  }

  private onClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this.phase === 'inspect') {
      for (const c of this.comps) {
        if (!c.fixed && x>=c.x && x<=c.x+c.w && y>=c.y && y<=c.y+c.h) {
          // prompt fix
          const ans = window.prompt(`Fix typo for ${c.label}: "${c.typo}"\nHint: ${c.hint}`);
          if (ans?.trim() === c.correct) {
            c.fixed = true;
            // Check if all components are fixed after a successful fix
            if (this.comps.every(comp => comp.fixed)) {
              this.phase = 'complete';
              this.endTime = performance.now();
            }
          } else {
            alert(`Incorrect! Should be: ${c.correct}`);
          }
          return; // Process one click at a time
        }
      }
    } else if (this.phase === 'complete') {
      // Return to island
      const bw=200, bh=50;
      const bx=(this.canvas.width-bw)/2, by=this.canvas.height-100; // Adjusted 'by' to match renderComplete
      if (x>=bx && x<=bx+bw && y>=by && y<=by+bh) {
        this.onComplete();
      }
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (this.ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
