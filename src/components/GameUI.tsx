import React from 'react';
import { GameState } from '../types/GameTypes';
import { MapPin } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  playerPosition: { x: number, y: number };
}

const GameUI: React.FC<GameUIProps> = ({ gameState, playerPosition }) => {
  const { currentRegion, completedMinigames } = gameState;
  
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
      <div className="bg-black/80 p-2 rounded-lg border-2 border-[#00ffff] text-white">
        <div className="flex items-center mb-2">
          <MapPin className="w-4 h-4 text-[#ff00ff] mr-2" />
          <span className="text-xs font-['Press_Start_2P']">
            {currentRegion || 'Island Shore'}
          </span>
        </div>
        
        <div className="text-xs font-['Press_Start_2P']">
          <span className="text-[#ffff00]">Minigames:</span> {completedMinigames.length}/6
        </div>
      </div>
      
      {/* Mini map or other UI elements can be added here */}
    </div>
  );
};

export default GameUI;
