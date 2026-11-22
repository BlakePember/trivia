import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Link2,
  LogOut,
  MessageSquare,
  Play,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  UserMinus,
  Users,
  Zap,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MIX_IDS,
  QUIZZES,
  getQuizDisplayTitle,
  getQuizzesByCategory,
} from '../../shared/catalog';
import type { ContinentFilter, DifficultyFilter } from '../../shared/types';
import { useTrivia } from '../context/TriviaContext';
import { buildInviteUrl } from '../utils/routes';
import { QuestionCard } from '../components/QuestionCard';
import { Scoreboard } from '../components/Scoreboard';
import {
  playCorrectSound,
  playFanfareSound,
  playLockInSound,
  playTickSound,
  playWrongSound,
} from '../utils/sounds';

export const RoomPage: React.FC = () => {
  const {
    room,
    playerId,
    serverTimeOffsetMs,
    leaveRoom,
    setReady,
    updateRoomSettings,
    addBot,
    removeBot,
    kickPlayer,
    startRoomMatch,
    submitMultiplayerAnswer,
    rematchRoom,
    sendRoomChat,
  } = useTrivia();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);

  const prevPhaseRef = useRef<string | null>(null);
  const lastTickSecRef = useRef<number>(-1);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Smooth timer tick while countdown / question / reveal is active
  useEffect(() => {
    if (!room || !room.phaseEndsAt) return;
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 100);
    return () => clearInterval(id);
  }, [room?.phase, room?.phaseEndsAt]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [room?.chat.length]);

  const me = useMemo(
    () => room?.players.find((p) => p.playerId === playerId) ?? null,
    [room, playerId]
  );
  const isHost = Boolean(room && room.hostId === playerId);

  // Play phase transition sounds cleanly
  useEffect(() => {
    if (!room) return;
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = room.phase;
    if (prev === room.phase) return;

    lastTickSecRef.current = -1;
    if (room.phase === 'reveal' && me) {
      if (me.lastCorrect === true) {
        playCorrectSound(me.streak);
      } else {
        playWrongSound();
      }
    } else if (room.phase === 'finished') {
      playFanfareSound();
    }
  }, [room?.phase, me?.lastCorrect, me?.streak, room, me]);

  // Countdown urgent ticks
  const remainingMs = useMemo(() => {
    if (!room?.phaseEndsAt) return 0;
    const syncedNow = nowMs + serverTimeOffsetMs;
    return Math.max(0, room.phaseEndsAt - syncedNow);
  }, [room?.phaseEndsAt, nowMs, serverTimeOffsetMs]);

  useEffect(() => {
    if (room?.phase !== 'question') return;
    const sec = Math.ceil(remainingMs / 1000);
    if (sec <= 3 && sec > 0 && sec !== lastTickSecRef.current) {
      lastTickSecRef.current = sec;
      playTickSound(sec === 1);
    }
  }, [room?.phase, remainingMs]);

  const handleSelectAnswer = async (choiceIndex: number) => {
    if (!room || room.phase !== 'question' || !me || me.hasAnsweredCurrent || submitting) return;
    setSubmitting(true);
    playLockInSound();
    await submitMultiplayerAnswer(choiceIndex);
    setSubmitting(false);
  };

  // Keyboard shortcuts 1-4 during active multiplayer question
  useEffect(() => {
    if (!room || room.phase !== 'question' || !me || me.hasAnsweredCurrent) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        void handleSelectAnswer(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase, room?.currentQuestionIndex, me?.hasAnsweredCurrent]);

  if (!room) {
    return (
      <main className="tv-page tv-center-state">
        <div className="tv-card">
          <h2>Connecting to room…</h2>
          <p className="tv-empty-muted">Syncing live match state with the server.</p>
          <button type="button" className="tv-btn tv-btn-ghost" onClick={leaveRoom}>
            Back to Lobby
          </button>
        </div>
      </main>
    );
  }

  const copyText = async (text: string, kind: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 1800);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1800);
      }
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDraft.trim()) return;
    sendRoomChat(chatDraft.trim());
    setChatDraft('');
  };

  const quizTitle = getQuizDisplayTitle(room.settings.quizId);
  const supportsRegion =
    room.settings.quizId === CATEGORY_MIX_IDS.geography ||
    Boolean(QUIZZES.find((q) => q.id === room.settings.quizId)?.supportsRegionFilter);

  const chatBox = (
    <div className="tv-chat-card tv-card">
      <h3 className="tv-card-title">
        <MessageSquare size={15} />
        <span>Room Chat</span>
      </h3>
      <div className="tv-chat-feed">
        {room.chat.map((m) => (
          <div key={m.id} className={`tv-chat-msg ${m.system ? 'system' : ''}`}>
            {!m.system && <strong>{m.senderName}: </strong>}
            <span>{m.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form className="tv-chat-form" onSubmit={handleSendChat}>
        <input
          type="text"
          placeholder="Say hello or talk strategy…"
          value={chatDraft}
          onChange={(e) => setChatDraft(e.target.value)}
          maxLength={220}
        />
        <button type="submit" className="tv-icon-btn" aria-label="Send message">
          <Send size={15} />
        </button>
      </form>
    </div>
  );

  // ======================== WAITING ROOM ========================
  if (room.phase === 'waiting') {
    const canStart = room.players.length >= 2;

    return (
      <main className="tv-page tv-room-waiting">
        <div className="tv-room-banner tv-card">
          <div>
            <div className="tv-room-banner-tags">
              <span className="tv-pill-accent">{room.visibility === 'private' ? 'PRIVATE ROOM' : 'PUBLIC ROOM'}</span>
              <span className="tv-pill-soft">{quizTitle}</span>
            </div>
            <h1>{room.name}</h1>
          </div>

          <div className="tv-room-share">
            <button
              type="button"
              className="tv-code-pill"
              onClick={() => void copyText(room.code, 'code')}
              title="Click to copy room code"
            >
              <span>CODE</span>
              <strong>{room.code}</strong>
              {copiedCode ? <Check size={15} /> : <Copy size={15} />}
            </button>

            <button
              type="button"
              className="tv-btn tv-btn-secondary tv-btn-sm"
              onClick={() => void copyText(buildInviteUrl(room.code), 'link')}
            >
              {copiedLink ? <Check size={14} /> : <Link2 size={14} />}
              <span>{copiedLink ? 'Invite Copied!' : 'Copy Invite Link'}</span>
            </button>

            <button type="button" className="tv-btn tv-btn-ghost tv-btn-sm" onClick={leaveRoom}>
              <LogOut size={14} />
              <span>Leave</span>
            </button>
          </div>
        </div>

        <div className="tv-waiting-grid">
          {/* Players Roster */}
          <section className="tv-card">
            <div className="tv-card-head-row">
              <h2 className="tv-card-title">
                <Users size={17} />
                <span>
                  Players ({room.players.length}/{room.settings.maxPlayers})
                </span>
              </h2>
              {isHost && room.players.length < room.settings.maxPlayers && (
                <div className="tv-bot-btns">
                  <button
                    type="button"
                    className="tv-btn tv-btn-ghost tv-btn-sm"
                    onClick={() => void addBot('casual')}
                  >
                    <Bot size={14} />
                    <span>+ Casual Bot</span>
                  </button>
                  <button
                    type="button"
                    className="tv-btn tv-btn-ghost tv-btn-sm"
                    onClick={() => void addBot('pro')}
                  >
                    <Sparkles size={14} />
                    <span>+ Pro Bot</span>
                  </button>
                </div>
              )}
            </div>

            <div className="tv-roster-list">
              {room.players.map((p) => (
                <div key={p.playerId} className="tv-roster-row">
                  <span className="tv-avatar" style={{ background: p.avatarColor }}>
                    {p.isBot ? <Bot size={14} /> : p.name.slice(0, 1).toUpperCase()}
                  </span>

                  <div className="tv-roster-info">
                    <div className="tv-roster-name">
                      <strong>{p.name}</strong>
                      {p.playerId === playerId && <span className="tv-you-tag">You</span>}
                      {p.isHost && (
                        <span className="tv-host-badge">
                          <Crown size={11} /> Host
                        </span>
                      )}
                      {p.isBot && (
                        <span className="tv-bot-badge">
                          {p.botSkill === 'pro' ? 'Pro AI' : 'Casual AI'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="tv-roster-right">
                    <span className={`tv-ready-tag ${p.ready ? 'ready' : ''}`}>
                      {p.ready ? 'Ready' : 'Waiting'}
                    </span>

                    {isHost && p.isBot && (
                      <button
                        type="button"
                        className="tv-icon-btn danger"
                        onClick={() => void removeBot(p.playerId)}
                        title="Remove AI bot"
                        aria-label="Remove bot"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {isHost && !p.isBot && p.playerId !== playerId && (
                      <button
                        type="button"
                        className="tv-icon-btn danger"
                        onClick={() => kickPlayer(p.playerId)}
                        title="Remove player"
                        aria-label="Kick player"
                      >
                        <UserMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="tv-waiting-footer">
              {isHost ? (
                <button
                  type="button"
                  className="tv-btn tv-btn-primary tv-btn-lg tv-btn-block"
                  disabled={!canStart}
                  onClick={() => void startRoomMatch()}
                >
                  <Play size={18} />
                  <span>
                    {canStart
                      ? `Start Match (${room.players.length} Players)`
                      : 'Invite a Friend or Add an AI Bot to Start'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`tv-btn tv-btn-lg tv-btn-block ${
                    me?.ready ? 'tv-btn-secondary' : 'tv-btn-primary'
                  }`}
                  onClick={() => setReady(!me?.ready)}
                >
                  <CheckCircle2 size={18} />
                  <span>{me?.ready ? 'Ready! Waiting for Host…' : 'Mark Ready'}</span>
                </button>
              )}
            </div>
          </section>

          {/* Match Settings */}
          <section className="tv-card">
            <h2 className="tv-card-title">
              <Settings size={17} />
              <span>Match Settings {isHost ? '(Host Controls)' : ''}</span>
            </h2>

            <div className="tv-field">
              <label>Quiz Topic</label>
              <select
                className="tv-select"
                disabled={!isHost}
                value={room.settings.quizId}
                onChange={(e) => void updateRoomSettings({ quizId: e.target.value, region: 'all' })}
              >
                <optgroup label="Mixes">
                  <option value="mixed">All Categories Mix</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={CATEGORY_MIX_IDS[c.id]}>
                      All {c.title}
                    </option>
                  ))}
                </optgroup>
                {CATEGORIES.map((c) => (
                  <optgroup key={c.id} label={c.title}>
                    {getQuizzesByCategory(c.id).map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="tv-settings-row">
              <div className="tv-field">
                <label>Difficulty</label>
                <select
                  className="tv-select"
                  disabled={!isHost}
                  value={room.settings.difficulty}
                  onChange={(e) =>
                    void updateRoomSettings({ difficulty: e.target.value as DifficultyFilter })
                  }
                >
                  <option value="all">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {supportsRegion && (
                <div className="tv-field">
                  <label>Region</label>
                  <select
                    className="tv-select"
                    disabled={!isHost}
                    value={room.settings.region}
                    onChange={(e) =>
                      void updateRoomSettings({ region: e.target.value as ContinentFilter })
                    }
                  >
                    <option value="all">All World</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Americas">Americas</option>
                    <option value="Africa">Africa</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
              )}
            </div>

            <div className="tv-settings-row">
              <div className="tv-field">
                <label>Questions</label>
                <div className="tv-segmented">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={!isHost}
                      className={room.settings.questionCount === n ? 'active' : ''}
                      onClick={() => void updateRoomSettings({ questionCount: n })}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tv-field">
                <label>Time / Q</label>
                <div className="tv-segmented">
                  {[10, 15, 20, 30].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={!isHost}
                      className={room.settings.secondsPerQuestion === s ? 'active' : ''}
                      onClick={() => void updateRoomSettings({ secondsPerQuestion: s })}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="tv-info-callout">
              <Zap size={15} />
              <span>
                Answers lock in live! Round reveals immediately once every active player answers or the timer hits 0.
              </span>
            </div>
          </section>

          {/* Chat */}
          {chatBox}
        </div>
      </main>
    );
  }

  // ======================== COUNTDOWN ========================
  if (room.phase === 'countdown') {
    const countNum = Math.max(1, Math.ceil(remainingMs / 1000));
    return (
      <main className="tv-page tv-center-state">
        <div className="tv-countdown-card">
          <span className="tv-pill-accent">{quizTitle}</span>
          <h1>Get Ready!</h1>
          <div className="tv-countdown-num">{countNum}</div>
          <p>
            {room.totalQuestions} questions · {room.settings.secondsPerQuestion}s each · Speed + Streak bonuses active!
          </p>
        </div>
      </main>
    );
  }

  // ======================== FINISHED / PODIUM ========================
  if (room.phase === 'finished') {
    const sorted = [...room.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.correctCount - a.correctCount;
    });
    const podiumOrder = [sorted[1], sorted[0], sorted[2]].filter(Boolean);

    return (
      <main className="tv-page tv-podium-page">
        <div className="tv-podium-header">
          <div>
            <span className="tv-pill-accent">MATCH COMPLETE · {quizTitle}</span>
            <h1>Final Standings</h1>
          </div>

          <div className="tv-podium-actions">
            {isHost && (
              <>
                <button
                  type="button"
                  className="tv-btn tv-btn-primary"
                  onClick={() => void startRoomMatch()}
                >
                  <RotateCcw size={16} />
                  <span>Play Again</span>
                </button>
                <button
                  type="button"
                  className="tv-btn tv-btn-secondary"
                  onClick={() => void rematchRoom()}
                >
                  <Settings size={16} />
                  <span>Change Quiz</span>
                </button>
              </>
            )}
            <button type="button" className="tv-btn tv-btn-ghost" onClick={leaveRoom}>
              <LogOut size={15} />
              <span>Leave Room</span>
            </button>
          </div>
        </div>

        {/* Podium Stage */}
        <div className="tv-podium-stage">
          {podiumOrder.map((p) => {
            const rank = sorted.findIndex((x) => x.playerId === p.playerId) + 1;
            const acc =
              room.totalQuestions > 0
                ? Math.round((p.correctCount / room.totalQuestions) * 100)
                : 0;
            return (
              <div key={p.playerId} className={`tv-podium-col rank-${rank}`}>
                <span className="tv-avatar lg" style={{ background: p.avatarColor }}>
                  {p.isBot ? <Bot size={20} /> : p.name.slice(0, 1).toUpperCase()}
                </span>
                <strong className="tv-podium-name">
                  {rank === 1 && <Trophy size={15} className="rank-gold" />} {p.name}
                </strong>
                <span className="tv-podium-pts">{p.score.toLocaleString()} pts</span>
                <div className="tv-podium-pedestal">
                  <span className="tv-podium-rank">#{rank}</span>
                  <small>{acc}% acc</small>
                </div>
              </div>
            );
          })}
        </div>

        <div className="tv-podium-lower">
          <div className="tv-card">
            <h2 className="tv-card-title">Full Player Breakdown</h2>
            <div className="tv-stats-table-wrap">
              <table className="tv-stats-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Correct</th>
                    <th>Best Streak</th>
                    <th>Avg Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p, idx) => {
                    const avgS =
                      p.totalAnswered > 0
                        ? `${(p.totalResponseMs / p.totalAnswered / 1000).toFixed(1)}s`
                        : '—';
                    return (
                      <tr key={p.playerId} className={p.playerId === playerId ? 'is-me' : ''}>
                        <td>#{idx + 1}</td>
                        <td>
                          <strong>{p.name}</strong>
                          {p.playerId === playerId && <span className="tv-you-tag">You</span>}
                        </td>
                        <td>
                          <strong>{p.score.toLocaleString()}</strong>
                        </td>
                        <td>
                          {p.correctCount}/{room.totalQuestions}
                        </td>
                        <td>{p.bestStreak}</td>
                        <td>{avgS}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {room.history.length > 0 && (
              <div className="tv-match-history">
                <h3>Question Recap</h3>
                <div className="tv-review-list">
                  {room.history.map((h) => (
                    <div key={h.questionIndex} className="tv-review-row ok">
                      <div className="tv-review-body">
                        <div className="tv-review-q">
                          <span className="tv-review-num">#{h.questionIndex + 1}</span>
                          <strong>{h.prompt}</strong>
                        </div>
                        <div className="tv-review-ans">
                          <span>
                            Answer: <strong>{h.correctText}</strong>
                          </span>
                          <span className="tv-pill-soft">
                            {Math.round(h.correctRate * 100)}% got it right
                          </span>
                        </div>
                        <p className="tv-review-exp">{h.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {chatBox}
        </div>
      </main>
    );
  }

  // ======================== ACTIVE QUESTION / REVEAL ========================
  const isReveal = room.phase === 'reveal';
  const totalLimitMs = isReveal ? 5000 : room.settings.secondsPerQuestion * 1000;
  const timerPct = Math.max(0, Math.min(100, (remainingMs / totalLimitMs) * 100));
  const timerSec = Math.ceil(remainingMs / 1000);
  const activeCount = room.players.filter((p) => p.isBot || p.connected).length;
  const answeredCount = room.players.filter((p) => p.hasAnsweredCurrent).length;

  return (
    <main className="tv-page tv-mp-match">
      <div className="tv-hud-bar">
        <div className="tv-hud-left">
          <span className="tv-room-code-tag">{room.code}</span>
          <span className="tv-hud-mode">{quizTitle}</span>
        </div>

        <div className="tv-hud-metrics">
          <div className="tv-hud-stat">
            <Users size={15} />
            <strong>
              {answeredCount}/{activeCount} answered
            </strong>
          </div>

          <div className={`tv-hud-timer ${!isReveal && timerSec <= 5 ? 'urgent' : ''}`}>
            <Clock size={15} />
            <strong>{isReveal ? `Next in ${timerSec}s` : `${timerSec}s`}</strong>
          </div>

          <button type="button" className="tv-btn tv-btn-ghost tv-btn-sm" onClick={leaveRoom}>
            Leave
          </button>
        </div>
      </div>

      <div className="tv-timer-track">
        <div
          className={`tv-timer-fill ${isReveal ? 'reveal' : timerSec <= 5 ? 'urgent' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      <div className="tv-mp-arena">
        <div className="tv-mp-stage">
          {room.currentQuestion && (
            <QuestionCard
              question={room.currentQuestion}
              questionNumber={room.currentQuestionIndex + 1}
              totalQuestions={room.totalQuestions}
              selectedIndex={me?.lastChoiceIndex ?? null}
              locked={Boolean(me?.hasAnsweredCurrent) || submitting}
              revealed={isReveal}
              correctIndex={room.reveal?.correctIndex ?? null}
              correctText={room.reveal?.correctText}
              explanation={room.reveal?.explanation}
              optionCounts={room.reveal?.optionCounts}
              pointsDelta={isReveal ? (me?.lastPointsEarned ?? 0) : null}
              onSelectOption={(idx) => void handleSelectAnswer(idx)}
            />
          )}

          {!isReveal && me?.hasAnsweredCurrent && (
            <div className="tv-locked-banner">
              <CheckCircle2 size={17} />
              <span>
                Answer locked in! Waiting for other players ({answeredCount}/{activeCount})…
              </span>
            </div>
          )}

          {isReveal && room.reveal?.fastestPlayerName && room.reveal.fastestMs !== null && (
            <div className="tv-fastest-banner">
              <Zap size={16} />
              <span>
                Fastest correct answer: <strong>{room.reveal.fastestPlayerName}</strong> in{' '}
                {(room.reveal.fastestMs / 1000).toFixed(2)}s!
              </span>
            </div>
          )}
        </div>

        <aside className="tv-mp-sidebar">
          <div className="tv-card">
            <h3 className="tv-card-title">
              <Trophy size={16} />
              <span>Live Leaderboard</span>
            </h3>
            <Scoreboard
              players={room.players}
              currentPlayerId={playerId}
              showAnswerState={!isReveal}
              showRoundDelta={isReveal}
              compact
            />
          </div>

          {chatBox}
        </aside>
      </div>
    </main>
  );
};
