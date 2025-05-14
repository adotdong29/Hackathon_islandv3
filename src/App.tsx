import React, { useEffect, useState } from 'react';
import Game from './components/Game';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate asset loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      {isLoading ? <LoadingScreen /> : <Game />}
    </div>
  );
}

export default App;
