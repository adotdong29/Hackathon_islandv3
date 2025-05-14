// src/types/GameTypes.ts

/**
 * The full set of tile types our engine can draw.
 */
export type TileType =
  | 'water'
  | 'grass'
  | 'sand'
  | 'path'
  | 'building'
  | 'obstacle';

/**
 * A single tile on the map.
 */
export interface MapTile {
  type: TileType;
  walkable: boolean;
}

/**
 * A named region endpoint on the map.
 */
export interface MapRegion {
  name: string;
}

/**
 * The overall map definition when loading from data.
 * (Not used by the procedural MapSystem, but kept for compatibility.)
 */
export interface GameMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: MapTile[][];
  regions: MapRegion[];
}
