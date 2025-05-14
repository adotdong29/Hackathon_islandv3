import { GameMap, MapTile } from '../types/GameTypes';

interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start to this node
  h: number; // Heuristic (estimated cost from this node to goal)
  f: number; // f = g + h
  parent: PathNode | null;
}

export class PathfindingSystem {
  private map: GameMap;
  private gridSize: number;

  constructor(map: GameMap) {
    this.map = map;
    this.gridSize = map.tileSize;
  }

  // A* pathfinding algorithm
  public findPath(startX: number, startY: number, endX: number, endY: number): { x: number, y: number }[] {
    // Convert world coordinates to grid coordinates
    const startGridX = Math.floor(startX / this.gridSize);
    const startGridY = Math.floor(startY / this.gridSize);
    const endGridX = Math.floor(endX / this.gridSize);
    const endGridY = Math.floor(endY / this.gridSize);

    // Check if start or end is out of bounds
    if (
      startGridX < 0 || startGridX >= this.map.width ||
      startGridY < 0 || startGridY >= this.map.height ||
      endGridX < 0 || endGridX >= this.map.width ||
      endGridY < 0 || endGridY >= this.map.height
    ) {
      return [];
    }

    // Check if start or end is not walkable
    if (!this.map.tiles[startGridY][startGridX].walkable || !this.map.tiles[endGridY][endGridX].walkable) {
      return [];
    }

    const openSet: PathNode[] = [];
    const closedSet: Record<string, boolean> = {};

    // Create start node
    const startNode: PathNode = {
      x: startGridX,
      y: startGridY,
      g: 0,
      h: this.heuristic(startGridX, startGridY, endGridX, endGridY),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f score
      let lowestIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openSet[lowestIndex];

      // Check if reached the end
      if (current.x === endGridX && current.y === endGridY) {
        // Reconstruct path
        return this.reconstructPath(current);
      }

      // Remove current from open set
      openSet.splice(lowestIndex, 1);
      closedSet[`${current.x},${current.y}`] = true;

      // Check neighbors
      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        // Skip if already evaluated
        if (closedSet[`${neighbor.x},${neighbor.y}`]) continue;

        // Calculate g score
        const tentativeG = current.g + this.distance(current.x, current.y, neighbor.x, neighbor.y);

        // Find if neighbor is in open set
        const neighborInOpenSet = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!neighborInOpenSet) {
          // New node, add to open set
          const node: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: this.heuristic(neighbor.x, neighbor.y, endGridX, endGridY),
            f: 0,
            parent: current
          };
          node.f = node.g + node.h;
          openSet.push(node);
        } else if (tentativeG < neighborInOpenSet.g) {
          // Better path to existing node
          neighborInOpenSet.g = tentativeG;
          neighborInOpenSet.f = neighborInOpenSet.g + neighborInOpenSet.h;
          neighborInOpenSet.parent = current;
        }
      }
    }

    // No path found
    return [];
  }

  private getNeighbors(x: number, y: number): { x: number, y: number }[] {
    const neighbors: { x: number, y: number }[] = [];
    const directions = [
      { x: 0, y: -1 }, // North
      { x: 1, y: 0 },  // East
      { x: 0, y: 1 },  // South
      { x: -1, y: 0 }  // West
    ];

    for (const dir of directions) {
      const nx = x + dir.x;
      const ny = y + dir.y;

      // Check bounds
      if (nx < 0 || nx >= this.map.width || ny < 0 || ny >= this.map.height) {
        continue;
      }

      // Check if walkable
      if (this.map.tiles[ny][nx].walkable) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    return neighbors;
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    // Simple distance for orthogonal movement
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private reconstructPath(endNode: PathNode): { x: number, y: number }[] {
    const path: { x: number, y: number }[] = [];
    let current: PathNode | null = endNode;

    while (current) {
      // Convert grid coordinates back to world coordinates (center of tile)
      path.unshift({
        x: (current.x * this.gridSize) + (this.gridSize / 2),
        y: (current.y * this.gridSize) + (this.gridSize / 2)
      });
      current = current.parent;
    }

    // Simplify path if needed
    return this.optimizePath(path);
  }

  private optimizePath(path: { x: number, y: number }[]): { x: number, y: number }[] {
    // A simple path optimization to remove redundant points
    // For now, just return the original path
    return path;
  }
}
