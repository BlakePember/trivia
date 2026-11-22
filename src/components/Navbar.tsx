import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Edit3,
  Globe,
  GraduationCap,
  HelpCircle,
  Home,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useTrivia } from '../context/TriviaContext';

export const Navbar: React.FC = () => {
  const {
    page,
    setPage,
    playerName,
    setPlayerName,
    theme,
    toggleTheme,
    muted,
    toggleMute,
    setShowHelp,
    connected,
    matchmaking,
    room,
  } = useTrivia();

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(playerName);

  const commitName = () => {
    if (draftName.trim()) {
      setPlayerName(draftName.trim());
    } else {
      setDraftName(playerName);
    }
    setEditingName(false);
  };

  return (
    <header className="tv-navbar">
      <div className="tv-navbar-inner">
        <div className="tv-brand-cluster">
          <a
            href="https://blakepember.net/"
            className="tv-back-link"
            title="Back to Blake Pember's Portfolio"
            aria-label="Back to Portfolio"
          >
            <ArrowLeft size={15} />
          </a>

          <button className="tv-brand" onClick={() => setPage('home')} type="button">
            <span className="tv-brand-badge" aria-hidden="true">?</span>
            <div className="tv-brand-text">
              <span className="tv-brand-title">Trivia</span>
              <span className="tv-brand-sub">Solo · Practice · Live</span>
            </div>
          </button>
        </div>

        <nav className="tv-nav-links" aria-label="Main navigation">
          <button
            type="button"
            className={`tv-nav-btn ${page === 'home' ? 'active' : ''}`}
            onClick={() => setPage('home')}
          >
            <Home size={15} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`tv-nav-btn ${page === 'solo' ? 'active' : ''}`}
            onClick={() => setPage('solo')}
          >
            <Zap size={15} />
            <span>Single Player</span>
          </button>

          <button
            type="button"
            className={`tv-nav-btn ${page === 'practice' ? 'active' : ''}`}
            onClick={() => setPage('practice')}
          >
            <GraduationCap size={15} />
            <span>Practice</span>
          </button>

          <button
            type="button"
            className={`tv-nav-btn ${page === 'multiplayer' || page === 'room' ? 'active' : ''}`}
            onClick={() => setPage(room ? 'room' : 'multiplayer')}
          >
            <Globe size={15} />
            <span>{room ? `Room ${room.code}` : 'Multiplayer'}</span>
          </button>

          <button
            type="button"
            className="tv-nav-btn tv-nav-help"
            onClick={() => setShowHelp(true)}
            title="How to Play & Shortcuts"
          >
            <HelpCircle size={15} />
            <span>Rules</span>
          </button>
        </nav>

        <div className="tv-nav-actions">
          <div
            className={`tv-conn-pill ${connected ? 'online' : 'offline'}`}
            title={
              connected
                ? `Connected to Trivia multiplayer server (${matchmaking.onlineCount} online)`
                : 'Multiplayer server offline — Single Player & Practice work 100% offline!'
            }
          >
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{connected ? `${matchmaking.onlineCount} online` : 'Offline'}</span>
          </div>

          {editingName ? (
            <form
              className="tv-name-form"
              onSubmit={(e) => {
                e.preventDefault();
                commitName();
              }}
            >
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={20}
                autoFocus
                onBlur={commitName}
                aria-label="Display name"
              />
              <button type="submit" className="tv-icon-btn" aria-label="Save name">
                <Check size={14} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="tv-name-pill"
              onClick={() => {
                setDraftName(playerName);
                setEditingName(true);
              }}
              title="Click to edit your player name"
            >
              <span className="tv-name-avatar">{playerName.slice(0, 1).toUpperCase()}</span>
              <span className="tv-name-label">{playerName}</span>
              <Edit3 size={12} className="tv-name-edit-icon" />
            </button>
          )}

          <button
            type="button"
            className="tv-icon-btn"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            type="button"
            className="tv-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
