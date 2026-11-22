import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Shuffle,
  Users,
  WifiOff,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MIX_IDS,
  QUIZZES,
  getQuizzesByCategory,
} from '../../shared/catalog';
import {
  MATCHMAKING_QUEUES,
  type ContinentFilter,
  type DifficultyFilter,
  type RoomVisibility,
} from '../../shared/types';
import { useTrivia } from '../context/TriviaContext';

export const LobbyPage: React.FC = () => {
  const {
    connected,
    publicRooms,
    matchmaking,
    queuedId,
    playerName,
    refreshRooms,
    createRoom,
    joinRoom,
    joinQueue,
    leaveQueue,
    setPage,
  } = useTrivia();

  const [joinCode, setJoinCode] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);

  // Create room form state
  const [roomName, setRoomName] = useState('');
  const [visibility, setVisibility] = useState<RoomVisibility>('public');
  const [quizId, setQuizId] = useState<string>('mixed');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [region, setRegion] = useState<ContinentFilter>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState<number>(15);
  const [maxPlayers, setMaxPlayers] = useState<number>(6);
  const [creating, setCreating] = useState(false);

  const supportsRegion = useMemo(() => {
    if (quizId === CATEGORY_MIX_IDS.geography) return true;
    return Boolean(QUIZZES.find((q) => q.id === quizId)?.supportsRegionFilter);
  }, [quizId]);

  const handleJoinCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || joiningCode) return;
    setJoiningCode(true);
    await joinRoom(joinCode.trim());
    setJoiningCode(false);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    await createRoom({
      roomName: roomName.trim() || `${playerName}'s Trivia Room`,
      visibility,
      settings: {
        quizId,
        difficulty,
        region: supportsRegion ? region : 'all',
        questionCount,
        secondsPerQuestion,
        maxPlayers,
      },
    });
    setCreating(false);
  };

  return (
    <main className="tv-page tv-lobby-page">
      <div className="tv-page-header">
        <div>
          <p className="tv-section-eyebrow">LIVE MULTIPLAYER ARENA</p>
          <h1>Compete Head-to-Head</h1>
          <p className="tv-section-sub">
            Queue up for an instant Quick Match, join a public room, or host a private game with friends via room code.
          </p>
        </div>

        <form className="tv-join-bar" onSubmit={handleJoinCode}>
          <KeyRound size={16} />
          <input
            type="text"
            placeholder="Room code (e.g. X7K9PA)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={8}
            aria-label="Enter room code"
          />
          <button
            type="submit"
            className="tv-btn tv-btn-primary tv-btn-sm"
            disabled={!connected || joinCode.trim().length < 4 || joiningCode}
          >
            {joiningCode ? <Loader2 size={15} className="spin" /> : <span>Join</span>}
          </button>
        </form>
      </div>

      {!connected && (
        <div className="tv-offline-banner">
          <WifiOff size={18} />
          <div>
            <strong>Multiplayer server is currently offline or connecting…</strong>
            <p>
              Run <code>npm run dev</code> inside <code>trivia/</code> for local Cloudflare Durable Objects multiplayer, or play{' '}
              <button type="button" className="tv-inline-link" onClick={() => setPage('solo')}>
                Single Player
              </button>{' '}
              and{' '}
              <button type="button" className="tv-inline-link" onClick={() => setPage('practice')}>
                Practice Mode
              </button>{' '}
              100% offline right now!
            </p>
          </div>
        </div>
      )}

      {/* Quick Match Queues */}
      <section className="tv-card tv-qm-section">
        <div className="tv-card-head-row">
          <div>
            <h2 className="tv-card-title">
              <Shuffle size={18} />
              <span>Quick Match Queues</span>
            </h2>
            <p className="tv-card-sub">
              Automatically pairs you with the next online opponent — pick General Trivia or jump straight into Geography!
            </p>
          </div>
          <span className="tv-pill-soft">{matchmaking.onlineCount} players online</span>
        </div>

        <div className="tv-qm-grid">
          {MATCHMAKING_QUEUES.map((q) => {
            const count = matchmaking.queues[q.id] ?? 0;
            const isQueuedHere = queuedId === q.id;
            return (
              <button
                key={q.id}
                type="button"
                disabled={!connected}
                className={`tv-qm-card ${isQueuedHere ? 'queued' : ''}`}
                onClick={() => (isQueuedHere ? leaveQueue() : joinQueue(q.id))}
              >
                <div className="tv-qm-top">
                  <strong>{q.label}</strong>
                  <span className="tv-qm-count">
                    {count > 0 ? `${count} waiting` : 'Open'}
                  </span>
                </div>
                <span className="tv-qm-sub">{q.subtitle}</span>
                <div className="tv-qm-action">
                  {isQueuedHere ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      <span>Searching… Click to cancel</span>
                    </>
                  ) : (
                    <>
                      <span>Join Queue</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="tv-lobby-grid">
        {/* Left: Create Room */}
        <form className="tv-card tv-create-card" onSubmit={handleCreateRoom}>
          <h2 className="tv-card-title">
            <Plus size={18} />
            <span>Create a Room</span>
          </h2>

          <div className="tv-field">
            <label htmlFor="create-room-name">Room Name</label>
            <input
              id="create-room-name"
              type="text"
              className="tv-input"
              placeholder={`${playerName}'s Trivia Room`}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={36}
            />
          </div>

          <div className="tv-field">
            <label>Visibility</label>
            <div className="tv-segmented">
              <button
                type="button"
                className={visibility === 'public' ? 'active' : ''}
                onClick={() => setVisibility('public')}
              >
                <Globe size={14} /> Public Lobby
              </button>
              <button
                type="button"
                className={visibility === 'private' ? 'active' : ''}
                onClick={() => setVisibility('private')}
              >
                <Lock size={14} /> Private Code
              </button>
            </div>
          </div>

          <div className="tv-field">
            <label htmlFor="create-quiz-select">Category / Quiz</label>
            <select
              id="create-quiz-select"
              className="tv-select"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
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
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}
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
                  value={region}
                  onChange={(e) => setRegion(e.target.value as ContinentFilter)}
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
                    className={questionCount === n ? 'active' : ''}
                    onClick={() => setQuestionCount(n)}
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
                    className={secondsPerQuestion === s ? 'active' : ''}
                    onClick={() => setSecondsPerQuestion(s)}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="tv-field">
            <label>Max Players ({maxPlayers})</label>
            <div className="tv-segmented">
              {[2, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={maxPlayers === n ? 'active' : ''}
                  onClick={() => setMaxPlayers(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="tv-btn tv-btn-primary tv-btn-lg tv-btn-block"
            disabled={!connected || creating}
          >
            {creating ? <Loader2 size={17} className="spin" /> : <Plus size={17} />}
            <span>Create &amp; Enter Room</span>
          </button>
        </form>

        {/* Right: Public Rooms Browser */}
        <section className="tv-card tv-rooms-card">
          <div className="tv-card-head-row">
            <h2 className="tv-card-title">
              <Users size={18} />
              <span>Public Rooms ({publicRooms.length})</span>
            </h2>
            <button
              type="button"
              className="tv-btn tv-btn-ghost tv-btn-sm"
              onClick={refreshRooms}
              disabled={!connected}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>

          {publicRooms.length === 0 ? (
            <div className="tv-empty-rooms">
              <Globe size={28} />
              <h3>No public rooms open yet</h3>
              <p>
                Create a public room on the left — you can invite friends with the code or add AI Trivia Bots to jump straight in!
              </p>
            </div>
          ) : (
            <div className="tv-room-list">
              {publicRooms.map((r) => {
                const isJoinable = r.phase === 'waiting' && r.playerCount < r.maxPlayers;
                return (
                  <div key={r.code} className="tv-room-item">
                    <div className="tv-room-item-info">
                      <div className="tv-room-item-top">
                        <strong>{r.name}</strong>
                        <span className="tv-room-code-tag">{r.code}</span>
                      </div>
                      <div className="tv-room-item-meta">
                        <span className="tv-pill-accent">{r.quizTitle}</span>
                        <span>
                          {r.questionCount} Qs · {r.secondsPerQuestion}s
                        </span>
                        <span>Host: {r.hostName}</span>
                      </div>
                    </div>

                    <div className="tv-room-item-right">
                      <span className="tv-room-slots">
                        <Users size={13} /> {r.playerCount}/{r.maxPlayers}
                      </span>
                      <button
                        type="button"
                        className={`tv-btn tv-btn-sm ${isJoinable ? 'tv-btn-primary' : 'tv-btn-ghost'}`}
                        disabled={!isJoinable}
                        onClick={() => void joinRoom(r.code)}
                      >
                        {r.phase === 'waiting'
                          ? r.playerCount >= r.maxPlayers
                            ? 'Full'
                            : 'Join'
                          : 'In Match'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
