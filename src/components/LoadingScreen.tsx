import React from 'react';
import { Monitor, HardDrive, Code } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#000080] text-white">
      <h1 className="text-4xl mb-8 text-[#ff00ff] font-['Press_Start_2P']">
        '80s Tech Island
      </h1>
      
      <div className="flex space-x-4 mb-8">
        <Monitor className="w-12 h-12 text-[#00ffff] animate-pulse" />
        <HardDrive className="w-12 h-12 text-[#ffff00] animate-pulse delay-150" />
        <Code className="w-12 h-12 text-[#ff00ff] animate-pulse delay-300" />
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-xl font-['Press_Start_2P']">Loading</span>
        <span className="text-xl font-['Press_Start_2P'] animate-bounce delay-100">.</span>
        <span className="text-xl font-['Press_Start_2P'] animate-bounce delay-200">.</span>
        <span className="text-xl font-['Press_Start_2P'] animate-bounce delay-300">.</span>
      </div>
      
      <p className="mt-16 text-sm text-[#00ffff] font-['Press_Start_2P']">
        Prepare for a radical adventure!
      </p>
    </div>
  );
};

export default LoadingScreen;
