import React from 'react';
import { Bot, Check, Crown, Flame, Medal, Trophy } from 'lucide-react';
import type { RoomPlayer } from '../../shared/types';

interface ScoreboardProps {
  players: RoomPlayer[];
  currentPlayerId: string;
  showAnswerState?: boolean;
  showRoundDelta?: boolean;
  compact?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentPlayerId,
  showAnswerState = false,
  showRoundDelta = false,
  compact = false,
}) => {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.correctCount - a.correctCount;
  });

  return (
    <div className={`tv-scoreboard ${compact ? 'compact' : ''}`}>
      {sorted.map((p, idx) => {
        const isMe = p.playerId === currentPlayerId;
        const rank = idx + 1;
        return (
          <div
            key={p.playerId}
            className={`tv-score-row ${isMe ? 'is-me' : ''} ${
              !p.connected && !p.isBot ? 'disconnected' : ''
            }`}
          >
            <div className="tv-score-rank">
              {rank === 1 ? (
                <Trophy size={15} className="rank-gold" />
              ) : rank === 2 ? (
                <Medal size={15} className="rank-silver" />
              ) : rank === 3 ? (
                <Medal size={15} className="rank-bronze" />
              ) : (
                <span>#{rank}</span>
              )}
            </div>

            <span className="tv-avatar" style={{ background: p.avatarColor }}>
              {p.isBot ? <Bot size={13} /> : p.name.slice(0, 1).toUpperCase()}
            </span>

            <div className="tv-score-identity">
              <div className="tv-score-name">
                <span>{p.name}</span>
                {isMe && <span className="tv-you-tag">You</span>}
                {p.isHost && <Crown size={12} className="tv-host-icon" aria-label="Host" />}
              </div>
              <div className="tv-score-sub">
                {p.streak >= 2 && (
                  <span className="tv-streak-chip">
                    <Flame size={11} /> {p.streak} streak
                  </span>
                )}
                {showAnswerState && p.hasAnsweredCurrent && (
                  <span className="tv-locked-chip">
                    <Check size={11} /> Locked in
                  </span>
                )}
                {showRoundDelta && p.lastCorrect === true && p.lastPointsEarned > 0 && (
                  <span className="tv-delta-chip">+{p.lastPointsEarned}</span>
                )}
                {showRoundDelta && p.lastCorrect === false && (
                  <span className="tv-delta-miss">+0</span>
                )}
              </div>
            </div>

            <div className="tv-score-pts">
              <strong>{p.score.toLocaleString()}</strong>
              <span>pts</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
