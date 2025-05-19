// src/minigames/ArcadeHistoryGame.ts

import { IMinigame } from './IMinigame';

interface Item {
  id: string;
  label: string;
  description: string;
  detail: string;
  x: number;
  y: number;
  w: number;
  h: number;
  drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void;
}

export class ArcadeHistoryGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  private items: Item[] = [];
  private selected: Item | null = null;

  private padding = 30;
  private slotSize = 150;

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    // Let MinigameLoader control size

    this.setupItems();
    this.positionItems();

    canvas.addEventListener('pointerdown', this.onDown);
  }

  public update(dt: number): void {}

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.selected) {
      // Detail overlay
      const dx = this.padding;
      const dy = this.padding;
      const dw = this.canvas.width - 2 * this.padding;
      const dh = this.canvas.height - 2 * this.padding;
      ctx.fillStyle = '#222';
      ctx.fillRect(dx, dy, dw, dh);
      // Title
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '30px sans-serif';
      ctx.fillText(this.selected.label, dx + dw/2, dy + 50);
      // Detail text
      ctx.font = '18px sans-serif';
      const lines = this.wrapText(this.selected.detail, dw - 60);
      lines.forEach((line, i) => {
        ctx.fillText(line, dx + dw/2, dy + 100 + i * 26);
      });
      // Buttons
      const btnW = 180;
      const btnH = 50;
      const by = dy + dh - btnH - 20;
      // Back
      ctx.fillStyle = '#388E3C';
      ctx.fillRect(dx + 40, by, btnW, btnH);
      ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
      ctx.fillText('Back to Museum', dx + 40 + btnW/2, by + 32);
      // Exit
      ctx.fillStyle = '#B71C1C';
      ctx.fillRect(dx + dw - btnW - 40, by, btnW, btnH);
      ctx.fillStyle = '#fff';
      ctx.fillText('Exit Museum', dx + dw - btnW/2 - 40, by + 32);
    } else {
      // Museum title
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '36px sans-serif';
      ctx.fillText('Arcade & Console Museum', this.canvas.width/2, 60);
      // Items
      this.items.forEach(it => {
        it.drawLogo(ctx, it.x, it.y, it.w, it.h);
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText(it.label, it.x + it.w/2, it.y + it.h + 24);
      });
      // Exit button
      const btnW = 180;
      const btnH = 50;
      ctx.fillStyle = '#B71C1C';
      ctx.fillRect(this.canvas.width - btnW - this.padding, this.padding, btnW, btnH);
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText('Exit Museum', this.canvas.width - btnW/2 - this.padding, this.padding + 34);
    }
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onDown);
  }

  private onDown = (e: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.selected) {
      // Buttons
      const dx = this.padding;
      const dy = this.padding;
      const dw = this.canvas.width - 2 * this.padding;
      const dh = this.canvas.height - 2 * this.padding;
      const btnW = 180;
      const btnH = 50;
      const by = dy + dh - btnH - 20;
      // Back
      if (x >= dx + 40 && x <= dx + 40 + btnW && y >= by && y <= by + btnH) {
        this.selected = null;
        return;
      }
      // Exit
      if (x >= dx + dw - btnW - 40 && x <= dx + dw - 40 && y >= by && y <= by + btnH) {
        this.onComplete();
        return;
      }
    } else {
      // Exit on main
      const btnW = 180;
      const btnH = 50;
      if (x >= this.canvas.width - btnW - this.padding && x <= this.canvas.width - this.padding && y >= this.padding && y <= this.padding + btnH) {
        this.onComplete();
        return;
      }
      // Select items
      for (const it of this.items) {
        if (x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h) {
          this.selected = it;
          break;
        }
      }
    }
  }

  private setupItems(): void {
    // Arcade games
    const gameDefs = [
      { id: 'space', label: 'Space Invaders (1978)', detail: 'Taito\'s Space Invaders, released in 1978, was a monumental success. It was one of the earliest shooting games, popularizing the genre and introducing mechanics like destructible cover and a gradually descending enemy horde. Its impact was so significant it reportedly caused a temporary shortage of 100-yen coins in Japan and is credited with expanding the video game industry from a novelty to a global phenomenon.' },
      { id: 'pac', label: 'Pac-Man (1980)', detail: 'Namco\'s Pac-Man (1980) became an icon of 1980s pop culture. It broke from the dominant space shooter mold by offering non-violent gameplay focused on navigating a maze, eating dots, and avoiding ghosts. Its appealing character design, simple yet addictive mechanics, and introduction of cutscenes between levels led to unprecedented mainstream success, spawning merchandise, an animated TV series, and numerous sequels.' },
      { id: 'dk', label: 'Donkey Kong (1981)', detail: 'Nintendo\'s Donkey Kong (1981) was a landmark title that pioneered the platform game genre. It introduced the character Jumpman (later Mario), who had to rescue Pauline from the titular ape. Its multi-screen levels, jumping mechanic, and narrative elements were innovative for its time and established Nintendo as a major force in the arcade industry, paving the way for their home console dominance.' },
      { id: 'qbert', label: 'Q*bert (1982)', detail: 'Gottlieb\'s Q*bert (1982) stood out with its unique isometric graphics, quirky character design, and distinct sound effects (including synthesized speech). The objective was to change the color of all cubes on a pyramid by hopping Q*bert onto them while avoiding enemies. Its challenging puzzle-like gameplay and memorable protagonist made it a significant arcade hit.' },
      { id: 'frog', label: 'Frogger (1981)', detail: 'Developed by Konami and distributed by Sega/Gremlin, Frogger (1981) was an immensely popular arcade game. Players guided a frog across a busy road and a hazardous river to reach home. Its simple premise, combined with increasing difficulty and the need for precise timing and strategy, made it an addictive and enduring classic of the golden age of arcade games.' },
      { id: 'galaga', label: 'Galaga (1981)', detail: 'Namco\'s Galaga (1981) was the successor to Galaxian and a significant evolution in the fixed shooter genre. It introduced new features like enemies that could capture the player\'s ship (which could then be rescued for a dual fighter), challenging stages, and more complex enemy attack patterns. Galaga became one of the most commercially successful and long-lasting arcade games.' }
    ];
    // Consoles
    const consoleDefs = [
      { id: '2600', label: 'Atari 2600 (1977)', detail: 'The Atari Video Computer System (VCS), later rebranded as the Atari 2600, was a pivotal home console. Launched in 1977, it popularized the use of microprocessor-based hardware and game code stored on interchangeable ROM cartridges. This allowed for a vast library of games, including arcade hits like Space Invaders and Pac-Man, as well as original titles like Pitfall!, making it a dominant force in the second generation of video game consoles.' },
      { id: 'intv', label: 'Intellivision (1979)', detail: 'Mattel\'s Intellivision, released in 1979, was a direct competitor to the Atari 2600. It boasted more advanced graphics and sound capabilities for its time, and its controllers featured a 12-button keypad and a directional disc. Intellivision marketed itself as "The Closer You Get To The Real Thing," emphasizing its more sophisticated sports simulations and strategy games. It also pioneered the concept of downloadable games via the PlayCable service.' },
      { id: 'cole', label: 'ColecoVision (1982)', detail: 'Launched by Coleco in 1982, the ColecoVision offered near-arcade-quality graphics and gameplay, significantly outperforming the Atari 2600. Its pack-in title, Donkey Kong, was a major selling point. The console also featured expansion modules that allowed it to play Atari 2600 games, broadening its appeal. Despite its technical strengths, its lifespan was cut short by the video game crash of 1983.' },
      { id: 'sms', label: 'Master System (1985)', detail: 'Sega\'s Master System, released in Japan in 1985 and internationally thereafter, was an 8-bit console designed to compete with the Nintendo Entertainment System (NES). While it struggled against the NES in North America and Japan, it found considerable success in Europe and Brazil. It featured superior graphics capabilities compared to the NES in some respects and had a library including titles like Alex Kidd in Miracle World and Phantasy Star.' },
      { id: 'nes', label: 'NES (1985)', detail: 'The Nintendo Entertainment System (NES), launched as the Famicom in Japan in 1983 and internationally from 1985, is credited with revitalizing the video game industry after the 1983 crash. Its strict quality control for third-party games, iconic controller design, and blockbuster titles like Super Mario Bros., The Legend of Zelda, and Metroid established Nintendo as a dominant player and defined a generation of gaming.' }
    ];

    this.items = [];
    gameDefs.forEach(def => this.items.push({
      ...def,
      description: def.label,
      x: 0, y: 0, w: this.slotSize, h: this.slotSize,
      drawLogo: this.logoFactory(def.id)
    } as Item));
    consoleDefs.forEach(def => this.items.push({
      ...def,
      description: def.label,
      x: 0, y: 0, w: this.slotSize, h: this.slotSize,
      drawLogo: this.logoFactory(def.id)
    } as Item));
  }

  private positionItems(): void {
    const availableW = this.canvas.width - 2 * this.padding;
    const cols = Math.floor(availableW / (this.slotSize + this.padding));
    this.items.forEach((it, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      it.x = this.padding + col * (this.slotSize + this.padding);
      it.y = 100 + row * (this.slotSize + 60);
      it.w = this.slotSize;
      it.h = this.slotSize;
    });
  }

  private logoFactory(id: string) {
    return (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = '#333';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#555'; ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(id.toUpperCase(), x + w/2, y + h/2);
      ctx.textBaseline = 'alphabetic';
    };
  }

  private wrapText(text: string, maxW: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (this.ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }
}
