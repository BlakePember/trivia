import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { TriviaProvider, useTrivia } from './context/TriviaContext';
import { Navbar } from './components/Navbar';
import { HowToPlayModal } from './components/HowToPlayModal';
import { HomePage } from './pages/HomePage';
import { SoloPage } from './pages/SoloPage';
import { PracticePage } from './pages/PracticePage';
import { LobbyPage } from './pages/LobbyPage';
import { RoomPage } from './pages/RoomPage';

const AppShell: React.FC = () => {
  const { page, room, errorBanner, clearError } = useTrivia();

  const renderPage = () => {
    if (page === 'room' && room) return <RoomPage />;
    if (page === 'solo') return <SoloPage />;
    if (page === 'practice') return <PracticePage />;
    if (page === 'multiplayer' || page === 'room') return <LobbyPage />;
    return <HomePage />;
  };

  return (
    <div className="tv-app">
      <Navbar />
      {errorBanner && (
        <div className="tv-toast-error" role="alert">
          <AlertCircle size={16} />
          <span>{errorBanner}</span>
          <button type="button" onClick={clearError} aria-label="Dismiss alert">
            <X size={15} />
          </button>
        </div>
      )}
      {renderPage()}
      <HowToPlayModal />
    </div>
  );
};

export const App: React.FC = () => (
  <TriviaProvider>
    <AppShell />
  </TriviaProvider>
);

export default App;
