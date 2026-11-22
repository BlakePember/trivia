export type CategoryId = 'geography' | 'science' | 'history' | 'culture' | 'general';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type DifficultyFilter = 'all' | Difficulty;

export type Continent = 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania';
export type ContinentFilter = 'all' | Continent;

export type QuestionDirection = 'standard' | 'reverse' | 'mixed';

export interface QuestionOption {
  text: string;
  sublabel?: string;
  flagCode?: string;
}

export type QuestionMedia =
  | {
      type: 'flag';
      countryCode: string;
    }
  | {
      type: 'element';
      symbol: string;
      atomicNumber: number;
      group: string;
      hideSymbol?: boolean;
      hideName?: boolean;
    }
  | {
      type: 'badge';
      eyebrow: string;
      value: string;
      subvalue?: string;
    };

export interface TriviaQuestion {
  id: string;
  category: CategoryId;
  quizId: string;
  quizTitle: string;
  difficulty: Difficulty;
  region?: Continent;
  promptLabel: string;
  prompt: string;
  media?: QuestionMedia;
  options: QuestionOption[];
  correctIndex: number;
  acceptedAnswers: string[];
  typeable: boolean;
  explanation: string;
}

/** Client-safe version of a question sent during an active multiplayer round (answer hidden). */
export interface PublicTriviaQuestion {
  id: string;
  category: CategoryId;
  quizId: string;
  quizTitle: string;
  difficulty: Difficulty;
  region?: Continent;
  promptLabel: string;
  prompt: string;
  media?: QuestionMedia;
  options: QuestionOption[];
}

export interface QuizDefinition {
  id: string;
  category: CategoryId;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  supportsRegionFilter?: boolean;
  supportsDirection?: boolean;
  directionLabels?: {
    standard: string;
    reverse: string;
    mixed: string;
  };
  supportsTypeIn?: boolean;
  estimatedCount: number;
  featured?: boolean;
}

export interface CategoryDefinition {
  id: CategoryId;
  title: string;
  tagline: string;
  description: string;
  accent: string;
  featured?: boolean;
}

export interface QuizGenerationOptions {
  quizId: string; // specific quiz id, category mix like 'geo-all', or 'mixed'
  count: number;
  categories?: CategoryId[]; // optional subset of categories when quizId === 'mixed'
  difficulty?: DifficultyFilter;
  region?: ContinentFilter;
  direction?: QuestionDirection;
  seed?: number;
  excludeIds?: string[];
}

export type SoloModeType = 'classic' | 'blitz' | 'survival';

export type RoomVisibility = 'public' | 'private';

export type RoomPhase = 'waiting' | 'countdown' | 'question' | 'reveal' | 'finished';

export interface MultiplayerSettings {
  quizId: string;
  difficulty: DifficultyFilter;
  region: ContinentFilter;
  questionCount: number; // 5 | 10 | 15 | 20
  secondsPerQuestion: number; // 10 | 15 | 20 | 30
  maxPlayers: number; // 2..8
}

export interface RoomPlayer {
  playerId: string;
  name: string;
  avatarColor: string;
  isBot: boolean;
  botSkill?: 'casual' | 'pro';
  connected: boolean;
  isHost: boolean;
  ready: boolean;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  totalAnswered: number;
  totalResponseMs: number;
  hasAnsweredCurrent: boolean;
  lastPointsEarned: number;
  lastCorrect: boolean | null;
  lastChoiceIndex: number | null;
}

export interface RoundReveal {
  questionIndex: number;
  correctIndex: number;
  correctText: string;
  explanation: string;
  optionCounts: number[];
  fastestPlayerId: string | null;
  fastestPlayerName: string | null;
  fastestMs: number | null;
}

export interface QuestionHistoryEntry {
  questionIndex: number;
  prompt: string;
  quizTitle: string;
  media?: QuestionMedia;
  correctText: string;
  explanation: string;
  correctRate: number; // 0..1
}

export interface ChatMessage {
  id: string;
  playerId: string;
  senderName: string;
  text: string;
  timestamp: number;
  system?: boolean;
}

export interface RoomState {
  code: string;
  name: string;
  visibility: RoomVisibility;
  hostId: string;
  createdAt: number;
  phase: RoomPhase;
  settings: MultiplayerSettings;
  players: RoomPlayer[];
  currentQuestionIndex: number;
  totalQuestions: number;
  phaseEndsAt: number | null;
  questionStartedAt: number | null;
  currentQuestion: PublicTriviaQuestion | null;
  reveal: RoundReveal | null;
  history: QuestionHistoryEntry[];
  chat: ChatMessage[];
}

export interface PublicRoomSummary {
  code: string;
  name: string;
  hostName: string;
  quizId: string;
  quizTitle: string;
  difficulty: DifficultyFilter;
  phase: RoomPhase;
  playerCount: number;
  maxPlayers: number;
  questionCount: number;
  secondsPerQuestion: number;
  createdAt: number;
}

export interface MatchmakingQueueDef {
  id: string;
  label: string;
  subtitle: string;
  quizId: string;
  questionCount: number;
  secondsPerQuestion: number;
}

export const MATCHMAKING_QUEUES: MatchmakingQueueDef[] = [
  {
    id: 'mixed-10',
    label: 'All Categories',
    subtitle: '10 Qs · 15s',
    quizId: 'mixed',
    questionCount: 10,
    secondsPerQuestion: 15,
  },
  {
    id: 'geo-mix-10',
    label: 'Geography Mix',
    subtitle: 'Flags, Capitals & World',
    quizId: 'geo-all',
    questionCount: 10,
    secondsPerQuestion: 15,
  },
  {
    id: 'geo-flags-10',
    label: 'World Flags',
    subtitle: '10 Flags · 12s',
    quizId: 'geo-flags',
    questionCount: 10,
    secondsPerQuestion: 12,
  },
  {
    id: 'geo-capitals-10',
    label: 'World Capitals',
    subtitle: '10 Capitals · 15s',
    quizId: 'geo-capitals',
    questionCount: 10,
    secondsPerQuestion: 15,
  },
];

export interface MatchmakingStatus {
  onlineCount: number;
  queues: Record<string, number>;
}
