import { RenderSystem } from './RenderSystem';
import { GameMap, MapRegion, MapTile } from '../types/GameTypes';
import { gameMap } from '../data/mapData';

export class MapSystem {
  private map: GameMap;
  private viewportX: number = 0;
  private viewportY: number = 0;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  private tileSize: number = 32;
  private cameraFollowX: number = 0;
  private cameraFollowY: number = 0;
  private cameraSmoothing: number = 0.1;

  constructor() {
    this.map = gameMap;
    this.tileSize = this.map.tileSize;
  }

  public update(deltaTime: number): void {
    // Update camera position to follow target
    this.updateCamera();
  }

  private updateCamera(): void {
    // Smoothly move viewport to center on target
    const targetViewportX = this.cameraFollowX - (this.viewportWidth / 2);
    const targetViewportY = this.cameraFollowY - (this.viewportHeight / 2);
    
    // Apply smoothing
    this.viewportX += (targetViewportX - this.viewportX) * this.cameraSmoothing;
    this.viewportY += (targetViewportY - this.viewportY) * this.cameraSmoothing;
    
    // Clamp viewport to map bounds
    const maxViewportX = Math.max(0, this.map.width * this.tileSize - this.viewportWidth);
    const maxViewportY = Math.max(0, this.map.height * this.tileSize - this.viewportHeight);
    
    this.viewportX = Math.max(0, Math.min(this.viewportX, maxViewportX));
    this.viewportY = Math.max(0, Math.min(this.viewportY, maxViewportY));
  }

  public setCameraTarget(x: number, y: number): void {
    this.cameraFollowX = x;
    this.cameraFollowY = y;
  }

  public render(renderSystem: RenderSystem): void {
    // Get canvas dimensions
    const canvas = renderSystem['ctx'].canvas;
    this.viewportWidth = canvas.width;
    this.viewportHeight = canvas.height;
    
    // Draw the map background (water)
    renderSystem.drawRect(0, 0, this.viewportWidth, this.viewportHeight, '#0077BE');
    
    // Draw map tiles
    this.renderTiles(renderSystem);
    
    // Draw regions
    this.renderRegions(renderSystem);
    
    // Draw mini-map in corner (optional)
    this.renderMiniMap(renderSystem);
  }

  private renderTiles(renderSystem: RenderSystem): void {
    // Calculate visible tiles
    const startCol = Math.floor(this.viewportX / this.tileSize);
    const endCol = Math.ceil((this.viewportX + this.viewportWidth) / this.tileSize);
    const startRow = Math.floor(this.viewportY / this.tileSize);
    const endRow = Math.ceil((this.viewportY + this.viewportHeight) / this.tileSize);
    
    // Draw visible tiles
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (row >= 0 && row < this.map.height && col >= 0 && col < this.map.width) {
          const tile = this.map.tiles[row][col];
          this.renderTile(renderSystem, tile, col * this.tileSize - this.viewportX, row * this.tileSize - this.viewportY);
        }
      }
    }
  }

  private renderTile(renderSystem: RenderSystem, tile: MapTile, x: number, y: number): void {
    // Render different tile types with different colors
    let color = '#0077BE'; // water
    
    switch (tile.type) {
      case 'grass':
        color = '#38B000';
        break;
      case 'sand':
        color = '#FFD166';
        break;
      case 'path':
        color = '#A57939';
        break;
      case 'building':
        color = '#EF476F';
        break;
      case 'obstacle':
        color = '#073B4C';
        break;
    }
    
    // Draw the tile
    renderSystem.drawRect(x, y, this.tileSize, this.tileSize, color);
    
    // Draw grid lines (optional, for debugging)
    if (tile.type === 'path') {
      // Highlight path tiles with a subtle glow
      renderSystem['ctx'].strokeStyle = 'rgba(255, 255, 0, 0.2)';
      renderSystem['ctx'].lineWidth = 2;
      renderSystem['ctx'].strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
    } else {
      // Normal grid lines
      renderSystem['ctx'].strokeStyle = 'rgba(0, 0, 0, 0.1)';
      renderSystem['ctx'].lineWidth = 1;
      renderSystem['ctx'].strokeRect(x, y, this.tileSize, this.tileSize);
    }
  }

  private renderRegions(renderSystem: RenderSystem): void {
    // Draw the regions with labels
    this.map.regions.forEach(region => {
      const x = region.x * this.tileSize - this.viewportX;
      const y = region.y * this.tileSize - this.viewportY;
      const width = region.width * this.tileSize;
      const height = region.height * this.tileSize;
      
      // Only render if visible
      if (
        x + width < 0 ||
        x > this.viewportWidth ||
        y + height < 0 ||
        y > this.viewportHeight
      ) {
        return;
      }
      
      // Draw region outline
      renderSystem['ctx'].strokeStyle = '#FF00FF'; // Magenta
      renderSystem['ctx'].lineWidth = 2;
      renderSystem['ctx'].strokeRect(x, y, width, height);
      
      // Draw region name
      renderSystem.drawText(
        region.name, 
        x + width / 2, 
        y + height / 2, 
        '#FFFFFF',
        12,
        'center'
      );
    });
  }

  private renderMiniMap(renderSystem: RenderSystem): void {
    // Mini-map size and position
    const miniMapSize = 150;
    const padding = 10;
    const miniMapX = this.viewportWidth - miniMapSize - padding;
    const miniMapY = padding;
    
    // Draw mini-map background
    renderSystem['ctx'].fillStyle = 'rgba(0, 0, 0, 0.5)';
    renderSystem['ctx'].fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // Calculate scale
    const mapWidth = this.map.width * this.tileSize;
    const mapHeight = this.map.height * this.tileSize;
    const scale = Math.min(miniMapSize / mapWidth, miniMapSize / mapHeight);
    
    // Draw map tiles at small scale
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y][x];
        let color = '#0077BE'; // water
        
        switch (tile.type) {
          case 'grass':
            color = '#38B000';
            break;
          case 'sand':
            color = '#FFD166';
            break;
          case 'path':
            color = '#A57939';
            break;
          case 'building':
            color = '#EF476F';
            break;
        }
        
        const pixelX = miniMapX + (x * this.tileSize * scale);
        const pixelY = miniMapY + (y * this.tileSize * scale);
        const pixelSize = Math.max(1, this.tileSize * scale);
        
        renderSystem['ctx'].fillStyle = color;
        renderSystem['ctx'].fillRect(pixelX, pixelY, pixelSize, pixelSize);
      }
    }
    
    // Draw viewport rectangle
    const viewportRectX = miniMapX + (this.viewportX * scale);
    const viewportRectY = miniMapY + (this.viewportY * scale);
    const viewportRectWidth = this.viewportWidth * scale;
    const viewportRectHeight = this.viewportHeight * scale;
    
    renderSystem['ctx'].strokeStyle = '#FFFFFF';
    renderSystem['ctx'].lineWidth = 1;
    renderSystem['ctx'].strokeRect(viewportRectX, viewportRectY, viewportRectWidth, viewportRectHeight);
  }

  public checkRegionClick(x: number, y: number): MapRegion | null {
    // Convert screen coordinates to map coordinates
    const mapX = x + this.viewportX;
    const mapY = y + this.viewportY;
    
    // Check if click is inside any region
    for (const region of this.map.regions) {
      const regionX = region.x * this.tileSize;
      const regionY = region.y * this.tileSize;
      const regionWidth = region.width * this.tileSize;
      const regionHeight = region.height * this.tileSize;
      
      if (
        mapX >= regionX && 
        mapX < regionX + regionWidth && 
        mapY >= regionY && 
        mapY < regionY + regionHeight
      ) {
        return region;
      }
    }
    
    return null;
  }

  public getRegionAtPosition(x: number, y: number): MapRegion | null {
    // Check which region contains this position
    for (const region of this.map.regions) {
      const regionX = region.x * this.tileSize;
      const regionY = region.y * this.tileSize;
      const regionWidth = region.width * this.tileSize;
      const regionHeight = region.height * this.tileSize;
      
      if (
        x >= regionX && 
        x < regionX + regionWidth && 
        y >= regionY && 
        y < regionY + regionHeight
      ) {
        return region;
      }
    }
    
    return null;
  }

  public isWalkable(x: number, y: number): boolean {
    // Convert to tile coordinates
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    
    // Check bounds
    if (
      tileX < 0 || 
      tileX >= this.map.width || 
      tileY < 0 || 
      tileY >= this.map.height
    ) {
      return false;
    }
    
    // Check tile walkability
    return this.map.tiles[tileY][tileX].walkable;
  }

  public getMap(): GameMap {
    return this.map;
  }
}
