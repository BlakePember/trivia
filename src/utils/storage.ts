import type { SoloModeType } from '../../shared/types';

export interface SoloRunRecord {
  id: string;
  mode: SoloModeType;
  quizId: string;
  quizTitle: string;
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  timestamp: number;
}

export interface LocalPlayerStats {
  gamesPlayed: number;
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  bestByMode: Partial<Record<SoloModeType, number>>;
  recentRuns: SoloRunRecord[];
}

const KEYS = {
  playerId: 'trivia_player_id',
  playerName: 'trivia_player_name',
  theme: 'trivia_theme',
  muted: 'trivia_muted',
  stats: 'trivia_solo_stats_v1',
  mastery: 'trivia_practice_mastery_v1',
  bookmarks: 'trivia_bookmarks_v1',
  recentQuestions: 'trivia_recent_questions_v1',
};

const ADJECTIVES = ['Swift', 'Atlas', 'Sharp', 'Cosmic', 'Bright', 'Clever', 'Bold', 'Stellar'];
const NOUNS = ['Explorer', 'Cartographer', 'Scholar', 'Navigator', 'Voyager', 'Quizzer', 'Scout'];

function randomDefaultName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(10 + Math.random() * 89);
  return `${adj}${noun}${num}`;
}

export function loadOrCreatePlayerId(): string {
  try {
    const saved = localStorage.getItem(KEYS.playerId);
    if (saved) return saved;
    const next = `trv_${crypto.randomUUID()}`;
    localStorage.setItem(KEYS.playerId, next);
    return next;
  } catch {
    return `trv_${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function loadPlayerName(): string {
  try {
    const saved = localStorage.getItem(KEYS.playerName);
    if (saved && saved.trim()) return saved.trim().slice(0, 20);
    const created = randomDefaultName().slice(0, 20);
    localStorage.setItem(KEYS.playerName, created);
    return created;
  } catch {
    return 'QuizExplorer';
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(KEYS.playerName, name.trim().slice(0, 20));
  } catch {
    // ignore
  }
}

export function loadTheme(): 'dark' | 'light' {
  try {
    return localStorage.getItem(KEYS.theme) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(KEYS.theme, theme);
  } catch {
    // ignore
  }
}

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(KEYS.muted) === 'true';
  } catch {
    return false;
  }
}

export function saveMuted(value: boolean): void {
  try {
    localStorage.setItem(KEYS.muted, String(value));
  } catch {
    // ignore
  }
}

const DEFAULT_STATS: LocalPlayerStats = {
  gamesPlayed: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  bestByMode: {},
  recentRuns: [],
};

export function loadStats(): LocalPlayerStats {
  try {
    const raw = localStorage.getItem(KEYS.stats);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw) as Partial<LocalPlayerStats>;
    return {
      gamesPlayed: parsed.gamesPlayed ?? 0,
      totalAnswered: parsed.totalAnswered ?? 0,
      totalCorrect: parsed.totalCorrect ?? 0,
      bestStreak: parsed.bestStreak ?? 0,
      bestByMode: parsed.bestByMode ?? {},
      recentRuns: Array.isArray(parsed.recentRuns) ? parsed.recentRuns.slice(0, 12) : [],
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: LocalPlayerStats): void {
  try {
    localStorage.setItem(KEYS.stats, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function loadMastery(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(KEYS.mastery);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string[]>;
  } catch {
    return {};
  }
}

export function saveMastery(mastery: Record<string, string[]>): void {
  try {
    localStorage.setItem(KEYS.mastery, JSON.stringify(mastery));
  } catch {
    // ignore
  }
}

export function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.bookmarks);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.bookmarks, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function loadRecentQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.recentQuestions);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string').slice(-300)
      : [];
  } catch {
    return [];
  }
}

export function saveRecentQuestionIds(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.recentQuestions, JSON.stringify(ids.slice(-300)));
  } catch {
    // ignore
  }
}
