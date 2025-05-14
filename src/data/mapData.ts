import { GameMap, MapTile } from '../types/GameTypes';

// Create a larger map
const generateMap = (): GameMap => {
  const width = 100; // Doubled map width
  const height = 100; // Doubled map height
  const tileSize = 32;
  
  const tiles: MapTile[][] = [];
  
  // Fill map with water tiles
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        type: 'water',
        walkable: false,
        x,
        y
      };
    }
  }
  
  // Create larger island (circular shape)
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 40; // Doubled radius
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius) {
        tiles[y][x].type = 'grass';
        tiles[y][x].walkable = true;
      }
      
      // Create wider beach
      if (distance >= radius - 4 && distance < radius) {
        tiles[y][x].type = 'sand';
        tiles[y][x].walkable = true;
      }
    }
  }
  
  // Create wider paths
  // Main path from south beach to center
  for (let y = Math.floor(centerY + radius - 1); y >= centerY; y--) {
    const x = Math.floor(centerX);
    if (y < height && y >= 0 && x < width && x >= 0) {
      tiles[y][x].type = 'path';
      tiles[y][x-1].type = 'path';
      tiles[y][x+1].type = 'path';
      tiles[y][x-2].type = 'path';
      tiles[y][x+2].type = 'path';
    }
  }
  
  // Paths to each region from center
  const pathDirections = [
    { dx: 1, dy: 0 },   // East
    { dx: 0, dy: -1 },  // North
    { dx: -1, dy: 0 },  // West
    { dx: 1, dy: 1 },   // Southeast
    { dx: -1, dy: 1 },  // Southwest
    { dx: 0, dy: 1 }    // South
  ];
  
  pathDirections.forEach((dir) => {
    for (let i = 1; i <= 20; i++) { // Longer paths
      const x = Math.floor(centerX + dir.dx * i);
      const y = Math.floor(centerY + dir.dy * i);
      
      if (y < height && y >= 0 && x < width && x >= 0 && tiles[y][x].type !== 'water') {
        tiles[y][x].type = 'path';
        // Make paths wider
        if (x + 1 < width) tiles[y][x+1].type = 'path';
        if (x - 1 >= 0) tiles[y][x-1].type = 'path';
        if (y + 1 < height) tiles[y+1][x].type = 'path';
        if (y - 1 >= 0) tiles[y-1][x].type = 'path';
      }
    }
  });
  
  // Define larger regions
  const regions = [
    {
      id: 'hardwareZone',
      name: 'Hardware Zone',
      x: centerX + 20,
      y: centerY,
      width: 12,
      height: 12,
      minigameId: 'hardwarePuzzle'
    },
    {
      id: 'softwareValley',
      name: 'Software Valley',
      x: centerX,
      y: centerY - 20,
      width: 12,
      height: 12,
      minigameId: 'softwareQuiz'
    },
    {
      id: 'arcadeCove',
      name: 'Arcade Cove',
      x: centerX - 20,
      y: centerY,
      width: 12,
      height: 12,
      minigameId: 'rhythmGame'
    },
    {
      id: 'consoleIsland',
      name: 'Console Island',
      x: centerX + 16,
      y: centerY + 16,
      width: 12,
      height: 12,
      minigameId: 'consoleGuess'
    },
    {
      id: 'mobileBay',
      name: 'Mobile Bay',
      x: centerX - 16,
      y: centerY + 16,
      width: 12,
      height: 12,
      minigameId: 'phoneWeight'
    },
    {
      id: 'internetPoint',
      name: 'Internet Point',
      x: centerX,
      y: centerY + 30,
      width: 12,
      height: 12,
      minigameId: 'networkQuiz'
    }
  ];
  
  // Add larger buildings in each region
  regions.forEach(region => {
    const centerX = Math.floor(region.x + region.width / 2);
    const centerY = Math.floor(region.y + region.height / 2);
    
    // Create larger buildings
    for (let y = centerY - 2; y <= centerY + 2; y++) {
      for (let x = centerX - 2; x <= centerX + 2; x++) {
        if (y < height && y >= 0 && x < width && x >= 0) {
          tiles[y][x].type = 'building';
          tiles[y][x].walkable = false;
        }
      }
    }
    
    // Make entrance walkable
    tiles[centerY][centerX].walkable = true;
    tiles[centerY][centerX].type = 'path';
  });
  
  return {
    width,
    height,
    tileSize,
    tiles,
    regions,
    characters: []
  };
};

export const gameMap = generateMap();
