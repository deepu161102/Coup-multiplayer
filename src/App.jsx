import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from './contexts/GameContext';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import GameSetup from './components/setup/GameSetup';
import GameBoard from './components/game/GameBoard';

function AppRouter() {
  const { state } = useGame();

  return (
    <AnimatePresence mode="wait">
      {state.screen === 'welcome' && <WelcomeScreen key="welcome" />}
      {state.screen === 'setup' && <GameSetup key="setup" />}
      {state.screen === 'game' && <GameBoard key="game" />}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppRouter />
    </GameProvider>
  );
}
