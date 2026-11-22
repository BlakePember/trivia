import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type {
  CategoryId,
  MatchmakingStatus,
  MultiplayerSettings,
  PublicRoomSummary,
  RoomState,
  RoomVisibility,
  SoloModeType,
} from '../../shared/types';
import { TriviaRealtimeClient } from '../services/realtime';
import { type AppPage, navigatePath, parseRoute } from '../utils/routes';
import { setSoundMuted } from '../utils/sounds';
import {
  type LocalPlayerStats,
  type SoloRunRecord,
  loadBookmarks,
  loadMastery,
  loadMuted,
  loadOrCreatePlayerId,
  loadPlayerName,
  loadStats,
  loadTheme,
  saveBookmarks,
  saveMastery,
  saveMuted,
  savePlayerName,
  saveStats,
  saveTheme,
} from '../utils/storage';

interface PracticeDeepLink {
  categoryId?: CategoryId | 'mixed';
  quizId?: string;
}

interface SoloPreselect {
  quizId: string;
  autoStart?: boolean;
}

interface TriviaContextValue {
  page: AppPage;
  setPage: (page: AppPage) => void;
  openPractice: (opts?: PracticeDeepLink) => void;
  openSoloWithQuiz: (quizId: string, autoStart?: boolean) => void;
  practiceTarget: PracticeDeepLink | null;
  clearPracticeTarget: () => void;
  soloPreselectQuiz: SoloPreselect | null;
  clearSoloPreselectQuiz: () => void;

  playerId: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  muted: boolean;
  toggleMute: () => void;
  showHelp: boolean;
  setShowHelp: (open: boolean) => void;

  // Local solo stats & practice mastery
  stats: LocalPlayerStats;
  recordSoloRun: (run: Omit<SoloRunRecord, 'id' | 'timestamp'>) => void;
  mastery: Record<string, string[]>;
  markQuestionMastered: (quizId: string, questionId: string) => void;
  resetQuizMastery: (quizId: string) => void;
  bookmarks: string[];
  toggleBookmark: (questionId: string) => void;

  // Multiplayer realtime state
  connected: boolean;
  publicRooms: PublicRoomSummary[];
  matchmaking: MatchmakingStatus;
  queuedId: string | null;
  room: RoomState | null;
  serverTimeOffsetMs: number;
  errorBanner: string | null;
  clearError: () => void;

  refreshRooms: () => void;
  createRoom: (opts: {
    roomName: string;
    visibility: RoomVisibility;
    settings: MultiplayerSettings;
  }) => Promise<{ ok: boolean; error?: string; code?: string }>;
  joinRoom: (code: string) => Promise<{ ok: boolean; error?: string }>;
  leaveRoom: () => void;
  joinQueue: (queueId: string) => void;
  leaveQueue: () => void;
  setReady: (ready: boolean) => void;
  updateRoomSettings: (
    settings: Partial<MultiplayerSettings>
  ) => Promise<{ ok: boolean; error?: string }>;
  addBot: (skill?: 'casual' | 'pro') => Promise<{ ok: boolean; error?: string }>;
  removeBot: (botId: string) => Promise<{ ok: boolean; error?: string }>;
  kickPlayer: (targetPlayerId: string) => void;
  startRoomMatch: () => Promise<{ ok: boolean; error?: string }>;
  submitMultiplayerAnswer: (choiceIndex: number) => Promise<{ ok: boolean; error?: string }>;
  rematchRoom: () => Promise<{ ok: boolean; error?: string }>;
  sendRoomChat: (text: string) => void;
}

const TriviaContext = createContext<TriviaContextValue | null>(null);

export const TriviaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerId] = useState<string>(() => loadOrCreatePlayerId());
  const [playerName, setPlayerNameState] = useState<string>(() => loadPlayerName());
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => loadTheme());
  const [muted, setMutedState] = useState<boolean>(() => {
    const initial = loadMuted();
    setSoundMuted(initial);
    return initial;
  });
  const [showHelp, setShowHelp] = useState(false);

  const [page, setPageState] = useState<AppPage>(() => {
    const parsed = parseRoute(window.location.pathname, window.location.hash);
    return parsed.page;
  });
  const [practiceTarget, setPracticeTarget] = useState<PracticeDeepLink | null>(null);
  const [soloPreselectQuiz, setSoloPreselectQuiz] = useState<SoloPreselect | null>(null);

  const [stats, setStats] = useState<LocalPlayerStats>(() => loadStats());
  const [mastery, setMastery] = useState<Record<string, string[]>>(() => loadMastery());
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());

  const [connected, setConnected] = useState(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [matchmaking, setMatchmaking] = useState<MatchmakingStatus>({
    onlineCount: 0,
    queues: {},
  });
  const [queuedId, setQueuedId] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const clientRef = useRef<TriviaRealtimeClient | null>(null);
  const pendingRoomJoinRef = useRef<string | null>(null);

  // Sync theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const setPage = useCallback((next: AppPage) => {
    setPageState(next);
    if (next === 'home') navigatePath('/');
    else if (next === 'solo') navigatePath('/solo');
    else if (next === 'practice') navigatePath('/practice');
    else if (next === 'multiplayer') navigatePath('/multiplayer');
  }, []);

  const openPractice = useCallback(
    (opts?: PracticeDeepLink) => {
      if (opts) setPracticeTarget(opts);
      setPage('practice');
    },
    [setPage]
  );

  const openSoloWithQuiz = useCallback(
    (quizId: string, autoStart = false) => {
      setSoloPreselectQuiz({ quizId, autoStart });
      setPage('solo');
    },
    [setPage]
  );

  const joinRoom = useCallback(async (codeRaw: string) => {
    const code = codeRaw.trim().toUpperCase();
    const client = clientRef.current;
    if (!client) return { ok: false, error: 'Realtime client initializing.' };
    setErrorBanner(null);
    const res = await client.connectRoom(code);
    if (!res.ok) {
      setErrorBanner(res.error || 'Could not join room.');
      return res;
    }
    setPageState('room');
    navigatePath(`/room/${code}`);
    return { ok: true };
  }, []);

  // Initialize WebSocket client once
  useEffect(() => {
    const client = new TriviaRealtimeClient(playerId, playerName, {
      onLobbyConnectionChange: (isConn) => {
        setConnected(isConn);
        if (!isConn) {
          setQueuedId(null);
        }
      },
      onLobbyMessage: (msg) => {
        if (msg.type === 'lobby:rooms') {
          setPublicRooms(msg.rooms);
        } else if (msg.type === 'matchmaking:status') {
          setMatchmaking(msg.status);
        } else if (msg.type === 'matchmaking:found') {
          setQueuedId(null);
          void joinRoom(msg.roomCode);
        }
      },
      onRoomMessage: (msg) => {
        if (msg.type === 'room:state') {
          setServerTimeOffsetMs(msg.serverTime - Date.now());
          setRoom(msg.room);
          setPageState('room');
        } else if (msg.type === 'room:chat') {
          setRoom((prev) =>
            prev ? { ...prev, chat: [...prev.chat.slice(-49), msg.message] } : prev
          );
        }
      },
      onRoomError: (err) => {
        setRoom(null);
        setErrorBanner(err);
        setPageState('multiplayer');
        navigatePath('/multiplayer', true);
      },
    });

    clientRef.current = client;
    client.connectLobby();

    // Check if initial URL was a direct room invite link (/trivia/room/ABC123)
    const initial = parseRoute(window.location.pathname, window.location.hash);
    if (initial.page === 'room') {
      pendingRoomJoinRef.current = initial.roomCode;
      void client.connectRoom(initial.roomCode).then((res) => {
        if (!res.ok) {
          setErrorBanner(res.error || `Room ${initial.roomCode} not found.`);
          setPageState('multiplayer');
          navigatePath('/multiplayer', true);
        }
      });
    }

    const onPopState = () => {
      const parsed = parseRoute(window.location.pathname, window.location.hash);
      if (parsed.page === 'room') {
        void joinRoom(parsed.roomCode);
      } else {
        setPageState(parsed.page);
      }
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
      client.destroy();
      clientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPlayerName = useCallback((name: string) => {
    const clean = name.trim().slice(0, 20);
    if (!clean) return;
    setPlayerNameState(clean);
    savePlayerName(clean);
    clientRef.current?.setPlayerName(clean);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      setSoundMuted(next);
      saveMuted(next);
      return next;
    });
  }, []);

  const recordSoloRun = useCallback((run: Omit<SoloRunRecord, 'id' | 'timestamp'>) => {
    setStats((prev) => {
      const record: SoloRunRecord = {
        ...run,
        id: `run_${Date.now().toString(36)}`,
        timestamp: Date.now(),
      };
      const prevModeBest = prev.bestByMode[run.mode] ?? 0;
      const nextStats: LocalPlayerStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        totalAnswered: prev.totalAnswered + run.total,
        totalCorrect: prev.totalCorrect + run.correct,
        bestStreak: Math.max(prev.bestStreak, run.bestStreak),
        bestByMode: {
          ...prev.bestByMode,
          [run.mode]: Math.max(prevModeBest, run.score),
        },
        recentRuns: [record, ...prev.recentRuns].slice(0, 12),
      };
      saveStats(nextStats);
      return nextStats;
    });
  }, []);

  const markQuestionMastered = useCallback((quizId: string, questionId: string) => {
    setMastery((prev) => {
      const current = prev[quizId] ?? [];
      if (current.includes(questionId)) return prev;
      const next = { ...prev, [quizId]: [...current, questionId] };
      saveMastery(next);
      return next;
    });
  }, []);

  const resetQuizMastery = useCallback((quizId: string) => {
    setMastery((prev) => {
      const next = { ...prev };
      delete next[quizId];
      saveMastery(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      saveBookmarks(next);
      return next;
    });
  }, []);

  const refreshRooms = useCallback(() => {
    clientRef.current?.sendLobby({ type: 'lobby:list' });
  }, []);

  const createRoom = useCallback(
    async (opts: {
      roomName: string;
      visibility: RoomVisibility;
      settings: MultiplayerSettings;
    }) => {
      const client = clientRef.current;
      if (!client) return { ok: false, error: 'Not connected.' };
      setErrorBanner(null);
      const res = await client.requestLobby<{ ok: boolean; error?: string; code?: string }>({
        type: 'room:create',
        roomName: opts.roomName,
        visibility: opts.visibility,
        settings: opts.settings,
      });
      if (!res.ok || !res.code) {
        setErrorBanner(res.error || 'Could not create room.');
        return res;
      }
      const joined = await joinRoom(res.code);
      if (!joined.ok) return joined;
      return { ok: true, code: res.code };
    },
    [joinRoom]
  );

  const leaveRoom = useCallback(() => {
    clientRef.current?.disconnectRoom(true);
    setRoom(null);
    setPageState('multiplayer');
    navigatePath('/multiplayer');
  }, []);

  const joinQueue = useCallback((queueId: string) => {
    setQueuedId(queueId);
    clientRef.current?.sendLobby({ type: 'matchmaking:join', queueId });
  }, []);

  const leaveQueue = useCallback(() => {
    setQueuedId(null);
    clientRef.current?.sendLobby({ type: 'matchmaking:leave' });
  }, []);

  const setReady = useCallback((ready: boolean) => {
    clientRef.current?.sendRoom({ type: 'room:ready', ready });
  }, []);

  const updateRoomSettings = useCallback(async (settings: Partial<MultiplayerSettings>) => {
    const client = clientRef.current;
    if (!client) return { ok: false, error: 'Not connected.' };
    return client.requestRoom({ type: 'room:settings', settings });
  }, []);

  const addBot = useCallback(async (skill: 'casual' | 'pro' = 'casual') => {
    const client = clientRef.current;
    if (!client) return { ok: false, error: 'Not connected.' };
    return client.requestRoom({ type: 'room:bot:add', skill });
  }, []);

  const removeBot = useCallback(async (botId: string) => {
    const client = clientRef.current;
    if (!client) return { ok: false, error: 'Not connected.' };
    return client.requestRoom({ type: 'room:bot:remove', botId });
  }, []);

  const kickPlayer = useCallback((targetPlayerId: string) => {
    clientRef.current?.sendRoom({ type: 'room:kick', targetPlayerId });
  }, []);

  const startRoomMatch = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return { ok: false, error: 'Not connected.' };
    const res = await client.requestRoom({ type: 'room:start' });
    if (!res.ok && res.error) setErrorBanner(res.error);
    return res;
  }, []);

  const submitMultiplayerAnswer = useCallback(async (choiceIndex: number) => {
    const client = clientRef.current;
    if (!client) return { ok: false, error: 'Not connected.' };
    return client.requestRoom({ type: 'game:answer', choiceIndex });
  }, []);

  const rematchRoom = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return { ok: false, error: 'Not connected.' };
    return client.requestRoom({ type: 'game:rematch' });
  }, []);

  const sendRoomChat = useCallback((text: string) => {
    clientRef.current?.sendRoom({ type: 'room:chat', text });
  }, []);

  return (
    <TriviaContext.Provider
      value={{
        page,
        setPage,
        openPractice,
        openSoloWithQuiz,
        practiceTarget,
        clearPracticeTarget: () => setPracticeTarget(null),
        soloPreselectQuiz,
        clearSoloPreselectQuiz: () => setSoloPreselectQuiz(null),

        playerId,
        playerName,
        setPlayerName,
        theme,
        toggleTheme,
        muted,
        toggleMute,
        showHelp,
        setShowHelp,

        stats,
        recordSoloRun,
        mastery,
        markQuestionMastered,
        resetQuizMastery,
        bookmarks,
        toggleBookmark,

        connected,
        publicRooms,
        matchmaking,
        queuedId,
        room,
        serverTimeOffsetMs,
        errorBanner,
        clearError: () => setErrorBanner(null),

        refreshRooms,
        createRoom,
        joinRoom,
        leaveRoom,
        joinQueue,
        leaveQueue,
        setReady,
        updateRoomSettings,
        addBot,
        removeBot,
        kickPlayer,
        startRoomMatch,
        submitMultiplayerAnswer,
        rematchRoom,
        sendRoomChat,
      }}
    >
      {children}
    </TriviaContext.Provider>
  );
};

export function useTrivia(): TriviaContextValue {
  const ctx = useContext(TriviaContext);
  if (!ctx) throw new Error('useTrivia must be used inside TriviaProvider');
  return ctx;
}
