// src/types/GameTypes.ts

/**
 * All possible tile types on our procedural map.
 */
export type TileType =
  | 'water'
  | 'grass'
  | 'sand'
  | 'path'
  | 'building'
  | 'obstacle';

/**
 * A single map tile.
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
 * The overall game map structure (not used by the procedural MapSystem,
 * but useful if you ever load a static JSON map).
 */
export interface GameMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: MapTile[][];
  regions: MapRegion[];
}

/**
 * A line of dialogue for NPCs or guides.
 */
export interface Dialogue {
  /** The text to display. */
  text: string;
  /** The speaker’s identifier (used for portraits or labels). */
  speaker: string;
}
