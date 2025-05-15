// src/engine/RenderSystem.ts

import { TileType } from '../types/GameTypes';

export class RenderSystem {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  public begin(): void { this.ctx.save(); }
  public end(): void   { this.ctx.restore(); }

  public drawNPC(x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 16, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public drawWaterBackground(x: number, y: number, w: number, h: number, time: number): void {
    const gradient = this.ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, '#1E90FF');
    gradient.addColorStop(0.5 + Math.sin(time * 0.5) * 0.1, '#4169E1');
    gradient.addColorStop(1, '#000080');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, w, h);

    // Add subtle wave pattern
    this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (let i = 0; i < w; i += 50) {
      const offset = Math.sin(time + i * 0.02) * 10;
      this.ctx.moveTo(x + i, y + h/2 + offset);
      this.ctx.lineTo(x + i + 25, y + h/2 + offset);
    }
    this.ctx.stroke();
  }

  public drawEnhancedTile(x: number, y: number, size: number, type: TileType, time: number): void {
    let baseColor = '#0077BE';
    let glowColor = 'rgba(0,255,255,0.2)';
    
    switch (type) {
      case 'grass':
        baseColor = '#38B000';
        glowColor = 'rgba(50,255,50,0.2)';
        break;
      case 'sand':
        baseColor = '#FFD166';
        glowColor = 'rgba(255,255,0,0.2)';
        break;
      case 'path':
        baseColor = '#A57939';
        glowColor = 'rgba(255,200,0,0.3)';
        break;
      case 'building':
        baseColor = '#EF476F';
        glowColor = 'rgba(255,0,255,0.3)';
        break;
      case 'obstacle':
        baseColor = '#073B4C';
        glowColor = 'rgba(0,0,255,0.2)';
        break;
    }

    // Base tile
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(x, y, size, size);

    // Animated glow effect for paths
    if (type === 'path') {
      const glowSize = 4 + Math.sin(time * 2) * 2;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = glowSize;
      this.ctx.strokeStyle = 'rgba(255,255,0,0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
      this.ctx.shadowBlur = 0;
    }

    // Grid pattern
    this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, size, size);
  }

  public drawCherryBlossom(x: number, y: number, size: number, time: number): void {
    const petals = 5;
    const angle = (Math.PI * 2) / petals;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(time * 0.5);

    // Draw petals
    this.ctx.fillStyle = '#FFB7C5';
    for (let i = 0; i < petals; i++) {
      this.ctx.beginPath();
      this.ctx.ellipse(
        size/2 * Math.cos(angle * i),
        size/2 * Math.sin(angle * i),
        size/3,
        size/6,
        angle * i,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Center
    this.ctx.fillStyle = '#FF69B4';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size/6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  public drawLantern(x: number, y: number, color: string, time: number): void {
    const glowSize = 10 + Math.sin(time * 2) * 3;
    
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = glowSize;
    
    // Lantern body
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - 10, y + 20);
    this.ctx.lineTo(x + 10, y + 20);
    this.ctx.closePath();
    this.ctx.fill();

    // Glow effect
    this.ctx.beginPath();
    this.ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  public drawFloatingIsland(x: number, y: number, size: number, time: number): void {
    // Base island shape
    this.ctx.fillStyle = '#38B000';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, size, size/2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Rocky bottom
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 5, size * 0.8, size/3, 0, 0, Math.PI);
    this.ctx.fill();

    // Crystal formations
    const crystalCount = Math.floor(size / 10);
    for (let i = 0; i < crystalCount; i++) {
      const angle = (i / crystalCount) * Math.PI * 2;
      const dx = Math.cos(angle) * size * 0.7;
      const dy = Math.sin(angle) * size * 0.3;
      this.drawCrystals(
        x + dx,
        y + dy,
        10 + Math.random() * 10,
        '#00FFFF',
        time + i
      );
    }
  }

  public drawBanner(x: number, y: number, height: number, color: string, time: number): void {
    // Pole
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(x - 2, y, 4, height);

    // Waving banner
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 10);
    
    // Create wave effect
    for (let i = 0; i <= 40; i++) {
      const wave = Math.sin(time * 3 + i * 0.2) * 5;
      this.ctx.lineTo(x + i, y + 10 + wave);
    }
    for (let i = 40; i >= 0; i--) {
      const wave = Math.sin(time * 3 + i * 0.2) * 5;
      this.ctx.lineTo(x + i, y + 25 + wave);
    }
    
    this.ctx.closePath();
    this.ctx.fill();
  }

  public drawMascot(x: number, y: number, time: number): void {
    // Bouncing animation
    const bounce = Math.sin(time * 5) * 5;
    
    // Body
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(x, y + bounce, 15, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(x - 5, y - 2 + bounce, 3, 0, Math.PI * 2);
    this.ctx.arc(x + 5, y - 2 + bounce, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Smile
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y + 2 + bounce, 5, 0, Math.PI);
    this.ctx.stroke();
  }

  public drawPortal(x: number, y: number, time: number): void {
    const rings = 5;
    const maxRadius = 30;
    
    for (let i = 0; i < rings; i++) {
      const radius = maxRadius * ((i + 1) / rings);
      const rotation = time * (i % 2 ? 1 : -1);
      
      this.ctx.strokeStyle = `hsla(${(time * 50 + i * 30) % 360}, 100%, 50%, ${1 - i/rings})`;
      this.ctx.lineWidth = 3;
      
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, radius, radius * 0.5, rotation, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  public drawCrystals(x: number, y: number, size: number, color: string, time: number): void {
    const points = 6;
    const innerRadius = size * 0.4;
    const outerRadius = size;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(time * 0.2);

    // Glow effect
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10 + Math.sin(time * 2) * 3;

    // Crystal shape
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 ? innerRadius : outerRadius;
      const angle = (i * Math.PI) / points;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      i === 0 ? this.ctx.moveTo(px, py) : this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  public drawEnhancedText(text: string, x: number, y: number, time: number): void {
    // Glowing outline
    this.ctx.shadowColor = '#00FFFF';
    this.ctx.shadowBlur = 10 + Math.sin(time * 2) * 3;
    
    this.ctx.font = "16px 'Press Start 2P'";
    this.ctx.textAlign = 'center';
    
    // Outline
    this.ctx.strokeStyle = '#000080';
    this.ctx.lineWidth = 4;
    this.ctx.strokeText(text, x, y);
    
    // Main text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(text, x, y);
    
    this.ctx.shadowBlur = 0;
  }

  // Enhanced versions of existing decoration methods
  public drawEnhancedTree(x: number, y: number, size: number, time: number): void {
    // Swaying animation
    const sway = Math.sin(time + x * 0.1) * 5;
    
    // Trunk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(x - size/8 + sway/2, y, size/4, size/2);
    
    // Leaves with gradient
    const gradient = this.ctx.createRadialGradient(
      x + sway, y, 0,
      x + sway, y, size/2
    );
    gradient.addColorStop(0, '#32CD32');
    gradient.addColorStop(1, '#006400');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x + sway, y, size/2, 0, Math.PI*2);
    this.ctx.fill();
  }

  public drawEnhancedHouse(x: number, y: number, size: number, time: number): void {
    // Glowing windows
    const windowGlow = Math.sin(time * 2) * 0.2 + 0.8;
    
    // Main structure
    this.ctx.fillStyle = '#A0522D';
    this.ctx.fillRect(x - size/2, y - size/2, size, size);
    
    // Roof
    this.ctx.fillStyle = '#8B0000';
    this.ctx.beginPath();
    this.ctx.moveTo(x - size/2, y - size/2);
    this.ctx.lineTo(x, y - size);
    this.ctx.lineTo(x + size/2, y - size/2);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Windows
    this.ctx.fillStyle = `rgba(255, 255, 0, ${windowGlow})`;
    this.ctx.fillRect(x - size/4, y - size/4, size/4, size/4);
    this.ctx.fillRect(x + size/8, y - size/4, size/4, size/4);
  }

  public drawEnhancedMountain(x: number, y: number, size: number, time: number): void {
    // Base mountain
    this.ctx.fillStyle = '#666';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size);
    this.ctx.lineTo(x - size, y + size);
    this.ctx.lineTo(x + size, y + size);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Animated snow effect
    this.ctx.fillStyle = '#FFF';
    for (let i = 0; i < 10; i++) {
      const snowX = x + Math.cos(time + i) * size * 0.8;
      const snowY = y - size * 0.5 + Math.sin(time + i) * size * 0.3;
      this.ctx.beginPath();
      this.ctx.arc(snowX, snowY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Snowcap
    this.ctx.fillStyle = '#EEE';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size);
    this.ctx.lineTo(x - size*0.4, y - size*0.2);
    this.ctx.lineTo(x + size*0.4, y - size*0.2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  public drawEnhancedBamboo(x: number, y: number, height: number, time: number): void {
    const sway = Math.sin(time + x * 0.1) * 5;
    
    // Glowing effect
    this.ctx.shadowColor = '#00FF00';
    this.ctx.shadowBlur = 5;
    
    const w = 4;
    this.ctx.fillStyle = '#228B22';
    
    // Swaying trunk
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.quadraticCurveTo(
      x + sway, y - height/2,
      x + sway, y - height
    );
    this.ctx.lineWidth = w;
    this.ctx.strokeStyle = '#228B22';
    this.ctx.stroke();
    
    // Segments
    const segments = Math.floor(height / 10);
    for (let i = 1; i <= segments; i++) {
      const segY = y - (i * height/segments);
      const segX = x + sway * (i/segments);
      this.ctx.beginPath();
      this.ctx.moveTo(segX - w/2, segY);
      this.ctx.lineTo(segX + w/2, segY);
      this.ctx.strokeStyle = '#196619';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    // Leaves
    const leafY = y - height;
    const leafX = x + sway;
    this.ctx.beginPath();
    this.ctx.moveTo(leafX, leafY);
    this.ctx.lineTo(leafX - 10, leafY - 10);
    this.ctx.lineTo(leafX + 10, leafY - 10);
    this.ctx.closePath();
    this.ctx.fillStyle = '#32CD32';
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
  }

  public drawEnhancedPalm(x: number, y: number, size: number, time: number): void {
    const sway = Math.sin(time + x * 0.1) * 10;
    
    // Trunk
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(x - size/8, y - size, size/4, size);
    
    // Fronds
    this.ctx.strokeStyle = '#228B22';
    this.ctx.lineWidth = 3;
    
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI/2 + (i - 2) * 0.5 + sway * 0.02;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - size);
      this.ctx.quadraticCurveTo(
        x + Math.cos(angle)*size,
        y - size + Math.sin(angle)*size,
        x + Math.cos(angle)*size*1.2,
        y - size + Math.sin(angle)*size*1.2
      );
      this.ctx.stroke();
      
      // Add detail lines
      const detailCount = 5;
      for (let j = 0; j < detailCount; j++) {
        const t = j / (detailCount - 1);
        const px = x + Math.cos(angle)*size*t;
        const py = y - size + Math.sin(angle)*size*t;
        
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(px + Math.cos(angle + Math.PI/2)*10,
                       py + Math.sin(angle + Math.PI/2)*10);
        this.ctx.stroke();
      }
    }
  }

  public drawEnhancedBird(x: number, y: number, size: number, time: number): void {
    const wingPhase = Math.sin(time * 10);
    
    // Body
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(x, y, size/2, 0, Math.PI*2);
    this.ctx.fill();
    
    // Wings
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    
    // Left wing
    this.ctx.beginPath();
    this.ctx.moveTo(x - size/2, y);
    this.ctx.quadraticCurveTo(
      x - size,
      y - size/2 + wingPhase * size/2,
      x - size,
      y - size/2
    );
    
    // Right wing
    this.ctx.moveTo(x + size/2, y);
    this.ctx.quadraticCurveTo(
      x + size,
      y - size/2 + wingPhase * size/2,
      x + size,
      y - size/2
    );
    
    this.ctx.stroke();
  }
}