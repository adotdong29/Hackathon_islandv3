import { Character } from '../types/GameTypes';
import { npcDialogues } from './dialogues';

// Define game characters including player and NPCs
export const characters: Character[] = [
  // Player character
  {
    id: 'player',
    name: 'Player',
    x: 400, // Starting position centered
    y: 400,
    spriteSheet: 'character-atlas',
    dialogues: []
  },
  
  // Guide NPC
  {
    id: 'techGuru',
    name: 'TechGuru',
    x: 400,
    y: 300,
    spriteSheet: 'character-atlas',
    dialogues: []
  },
  
  // Region NPCs
  {
    id: 'hardwareHank',
    name: 'Hardware Hank',
    x: 500,
    y: 300,
    spriteSheet: 'character-atlas',
    dialogues: npcDialogues.hardwareZone
  },
  {
    id: 'softwareSam',
    name: 'Software Sam',
    x: 400,
    y: 200,
    spriteSheet: 'character-atlas',
    dialogues: npcDialogues.softwareValley
  },
  {
    id: 'arcadeAnnie',
    name: 'Arcade Annie',
    x: 300,
    y: 300,
    spriteSheet: 'character-atlas',
    dialogues: npcDialogues.arcadeCove
  },
  {
    id: 'consoleCarl',
    name: 'Console Carl',
    x: 450,
    y: 450,
    spriteSheet: 'character-atlas',
    dialogues: npcDialogues.consoleIsland
  },
  {
    id: 'mobileMolly',
    name: 'Mobile Molly',
    x: 350,
    y: 450,
    spriteSheet: 'character-atlas',
    dialogues: npcDialogues.mobileBay
  },
  {
    id: 'internetIrene',
    name: 'Internet Irene',
    x: 400,
    y: 500,
    spriteSheet: 'character-atlas',
    dialogues: npcDialogues.internetPoint
  },
  
  // Boat captain (for intro)
  {
    id: 'captain',
    name: 'Captain',
    x: 400,
    y: 475,
    spriteSheet: 'character-atlas',
    dialogues: []
  }
];