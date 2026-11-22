import React from 'react';
import { Flame, Globe, GraduationCap, Keyboard, Trophy, X, Zap } from 'lucide-react';
import { useTrivia } from '../context/TriviaContext';

export const HowToPlayModal: React.FC = () => {
  const { showHelp, setShowHelp } = useTrivia();
  if (!showHelp) return null;

  return (
    <div className="tv-modal-backdrop" onClick={() => setShowHelp(false)} role="dialog" aria-modal="true">
      <div className="tv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tv-modal-head">
          <h2>How to Play Trivia</h2>
          <button
            type="button"
            className="tv-icon-btn"
            onClick={() => setShowHelp(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="tv-modal-body">
          <div className="tv-rule-item">
            <div className="tv-rule-icon"><Zap size={18} /></div>
            <div>
              <h3>Single Player Modes</h3>
              <p>
                <strong>Classic Run:</strong> Timed 10, 15, or 20 question matches with speed &amp; streak scoring.<br />
                <strong>Blitz 60s:</strong> Answer as many questions as possible in 60 seconds (+3s bonus every 5-streak!).<br />
                <strong>Survival:</strong> 3 lives — see how long your streak survives as questions keep rolling.
              </p>
            </div>
          </div>

          <div className="tv-rule-item">
            <div className="tv-rule-icon"><GraduationCap size={18} /></div>
            <div>
              <h3>Category Practice Studio</h3>
              <p>
                Drill specific subjects like <strong>Geography</strong> (World Flags, World Capitals,
                Landmarks, Rivers &amp; Mountains, US States, Borders &amp; Currencies), Science, History,
                Pop Culture, and Tech. Filter by continent or difficulty, switch between{' '}
                <strong>Multiple Choice</strong> and <strong>Type Answer</strong>, track mastery bars,
                and instantly retry any missed questions!
              </p>
            </div>
          </div>

          <div className="tv-rule-item">
            <div className="tv-rule-icon"><Globe size={18} /></div>
            <div>
              <h3>Real-Time Multiplayer</h3>
              <p>
                Join <strong>Quick Match</strong> queues, browse open public rooms, or host a private
                room with a 6-letter code &amp; invite link. Pick any category (including Geography Flags
                or Capitals!) and optionally add AI bots to fill seats.
              </p>
            </div>
          </div>

          <div className="tv-rule-item">
            <div className="tv-rule-icon"><Flame size={18} /></div>
            <div>
              <h3>Speed + Streak Scoring</h3>
              <p>
                Every correct timed answer earns <strong>500 base points</strong> + up to{' '}
                <strong>500 speed bonus</strong> based on remaining time +{' '}
                <strong>+100 per consecutive streak</strong> (up to +400).
              </p>
            </div>
          </div>

          <div className="tv-rule-item">
            <div className="tv-rule-icon"><Keyboard size={18} /></div>
            <div>
              <h3>Keyboard Shortcuts</h3>
              <p>
                Press <kbd>1</kbd>–<kbd>4</kbd> to lock in a multiple-choice answer and{' '}
                <kbd>Enter</kbd> or <kbd>Space</kbd> to advance to the next question.
              </p>
            </div>
          </div>
        </div>

        <div className="tv-modal-foot">
          <button
            type="button"
            className="tv-btn tv-btn-primary"
            onClick={() => setShowHelp(false)}
          >
            <Trophy size={16} />
            <span>Got it, let’s play!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
