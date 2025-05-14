// Game state types
export interface GameState {
    gamePhase: 'LOADING' | 'INTRO' | 'EXPLORATION' | 'MINIGAME' | 'ENDING';
    currentRegion: string;
    completedMinigames: string[];
    inventory: string[];
    questProgress: {
      mainQuest: number;
      sideQuests: Record<string, number>;
    };
    currentMinigame?: string; // Added to track current minigame
  }
  
  // Dialogue types
  export interface Dialogue {
    text: string;
    speaker: string;
    portrait?: string;
  }
  
  // Character types
  export interface Character {
    id: string;
    name: string;
    x: number;
    y: number;
    spriteSheet: string;
    dialogues: Dialogue[];
  }
  
  // Map types
  export interface MapTile {
    type: 'water' | 'grass' | 'sand' | 'path' | 'building' | 'obstacle';
    walkable: boolean;
    x: number;
    y: number;
  }
  
  export interface MapRegion {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    minigameId?: string;
  }
  
  export interface GameMap {
    width: number;
    height: number;
    tileSize: number;
    tiles: MapTile[][];
    regions: MapRegion[];
    characters: Character[];
  }
  
  // Minigame types
  export interface Minigame {
    id: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    completed: boolean;
  }
  