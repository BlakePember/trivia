import type {
  CategoryDefinition,
  CategoryId,
  ContinentFilter,
  DifficultyFilter,
  PublicTriviaQuestion,
  QuestionDirection,
  QuestionOption,
  QuizDefinition,
  QuizGenerationOptions,
  TriviaQuestion,
} from './types.js';
import { COUNTRIES, type CountryEntry } from './data/countries.js';
import { US_STATES } from './data/usStates.js';
import { US_PRESIDENTS } from './data/usPresidents.js';
import { ELEMENTS } from './data/elements.js';
import { GEO_STATIC_QUESTIONS } from './data/geoQuestions.js';
import { SCIENCE_STATIC_QUESTIONS } from './data/scienceQuestions.js';
import { HISTORY_STATIC_QUESTIONS } from './data/historyQuestions.js';
import { CULTURE_STATIC_QUESTIONS } from './data/cultureQuestions.js';
import { GENERAL_STATIC_QUESTIONS } from './data/generalQuestions.js';
import {
  CURRENT_EVENTS_META,
  CURRENT_EVENTS_QUESTIONS,
} from './data/currentEventsQuestions.js';
import type { StaticQuestionSeed } from './data/staticTypes.js';

export { CURRENT_EVENTS_META };

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'current-events',
    title: 'Current Events',
    tagline: `Weekly Edition · Updated ${CURRENT_EVENTS_META.updatedAt}`,
    description:
      'Fresh weekly trivia covering breaking world news, space & science breakthroughs, sports championships, and pop culture — updated every Tuesday.',
    accent: '#fb7185',
    featured: true,
  },
  {
    id: 'geography',
    title: 'Geography',
    tagline: 'Flags, Capitals, Wonders & Maps',
    description:
      'Master world flags, capitals, famous landmarks, mountain & river extremes, US states, and borders across every continent.',
    accent: '#38bdf8',
    featured: true,
  },
  {
    id: 'science',
    title: 'Science & Nature',
    tagline: 'Space, Periodic Table & Discovery',
    description:
      'Test your instincts on planets, moons, chemical elements, human biology, physics laws, and Earth science.',
    accent: '#34d399',
  },
  {
    id: 'history',
    title: 'History',
    tagline: 'All US Presidents, Ancient & Modern Worlds',
    description:
      'Explore all 47 US presidencies, ancient empires, revolutions, treaties, global turning points, and US civics.',
    accent: '#f59e0b',
  },
  {
    id: 'culture',
    title: 'Pop Culture & Sports',
    tagline: 'Holidays, Film, Music, Gaming & Sports',
    description:
      'World holiday traditions, Oscar classics, iconic albums, legendary video games, Olympics, and sporting records.',
    accent: '#f472b6',
  },
  {
    id: 'general',
    title: 'Tech, Arts & General',
    tagline: 'Computing, Myth, Literature & Mix',
    description:
      'Computing pioneers, world mythology, classic art & books, culinary secrets, and surprising everyday facts.',
    accent: '#a78bfa',
  },
];

export const QUIZZES: QuizDefinition[] = [
  // ======================== CURRENT EVENTS (WEEKLY EDITION) ========================
  {
    id: 'cur-weekly',
    category: 'current-events',
    title: 'Weekly Current Events',
    shortTitle: 'This Week',
    description: `${CURRENT_EVENTS_META.weekOf} — ${CURRENT_EVENTS_META.headlineSummary}`,
    icon: 'newspaper',
    supportsTypeIn: true,
    estimatedCount: CURRENT_EVENTS_QUESTIONS.length,
    featured: true,
  },

  // ======================== GEOGRAPHY (6 SUB-QUIZZES) ========================
  {
    id: 'geo-flags',
    category: 'geography',
    title: 'World Flags',
    shortTitle: 'Flags',
    description: 'Identify 90+ crisp vector national flags — go Flag → Country, Country → Flag, or filter by continent.',
    icon: 'flag',
    supportsRegionFilter: true,
    supportsDirection: true,
    directionLabels: {
      standard: 'Flag → Country',
      reverse: 'Country → Flag',
      mixed: 'Mixed Directions',
    },
    supportsTypeIn: true,
    estimatedCount: COUNTRIES.length,
    featured: true,
  },
  {
    id: 'geo-capitals',
    category: 'geography',
    title: 'World Capitals',
    shortTitle: 'Capitals',
    description: 'Match countries to their capital cities (and reverse!) across Europe, Asia, the Americas, Africa, and Oceania.',
    icon: 'landmark',
    supportsRegionFilter: true,
    supportsDirection: true,
    directionLabels: {
      standard: 'Country → Capital',
      reverse: 'Capital → Country',
      mixed: 'Mixed Directions',
    },
    supportsTypeIn: true,
    estimatedCount: COUNTRIES.length,
    featured: true,
  },
  {
    id: 'geo-landmarks',
    category: 'geography',
    title: 'Landmarks & World Wonders',
    shortTitle: 'Landmarks',
    description: 'Locate ancient wonders, iconic skylines, UNESCO sites, castles, and natural monuments.',
    icon: 'compass',
    supportsRegionFilter: true,
    supportsTypeIn: true,
    estimatedCount: GEO_STATIC_QUESTIONS.filter((q) => q.quizId === 'geo-landmarks').length,
    featured: true,
  },
  {
    id: 'geo-extremes',
    category: 'geography',
    title: 'Rivers, Mountains & Extremes',
    shortTitle: 'Extremes',
    description: 'Tallest peaks, longest rivers, deepest lakes, driest deserts, and dramatic straits.',
    icon: 'mountain',
    supportsRegionFilter: true,
    supportsTypeIn: true,
    estimatedCount: GEO_STATIC_QUESTIONS.filter((q) => q.quizId === 'geo-extremes').length,
  },
  {
    id: 'geo-us-states',
    category: 'geography',
    title: 'US States & Capitals',
    shortTitle: 'US States',
    description: 'All 50 US states — drill State Capitals, Reverse Capitals, and famous State Nicknames.',
    icon: 'map-pin',
    supportsDirection: true,
    directionLabels: {
      standard: 'State → Capital',
      reverse: 'Capital → State',
      mixed: 'Capitals & Nicknames',
    },
    supportsTypeIn: true,
    estimatedCount: US_STATES.length,
  },
  {
    id: 'geo-world-facts',
    category: 'geography',
    title: 'Borders, Currencies & Facts',
    shortTitle: 'Borders & Currencies',
    description: 'Landlocked nations, world currencies, time-zone oddities, enclaves, and languages.',
    icon: 'globe',
    supportsRegionFilter: true,
    supportsTypeIn: true,
    estimatedCount: GEO_STATIC_QUESTIONS.filter((q) => q.quizId === 'geo-world-facts').length + 18,
  },

  // ======================== SCIENCE (3 SUB-QUIZZES) ========================
  {
    id: 'sci-elements',
    category: 'science',
    title: 'Periodic Table & Elements',
    shortTitle: 'Elements',
    description: 'Decode chemical symbols, atomic numbers, and surprising properties of 46 essential elements.',
    icon: 'atom',
    supportsDirection: true,
    directionLabels: {
      standard: 'Symbol → Element',
      reverse: 'Element → Symbol',
      mixed: 'Mixed Directions',
    },
    supportsTypeIn: true,
    estimatedCount: ELEMENTS.length,
  },
  {
    id: 'sci-space',
    category: 'science',
    title: 'Space & Astronomy',
    shortTitle: 'Space',
    description: 'Planets, moons, deep-space missions, black holes, stars, and cosmic milestones.',
    icon: 'orbit',
    supportsTypeIn: true,
    estimatedCount: SCIENCE_STATIC_QUESTIONS.filter((q) => q.quizId === 'sci-space').length,
  },
  {
    id: 'sci-general',
    category: 'science',
    title: 'Biology, Physics & Earth',
    shortTitle: 'Bio & Physics',
    description: 'Cells, anatomy, animal marvels, classical & quantum physics, geology, and weather.',
    icon: 'microscope',
    supportsTypeIn: true,
    estimatedCount: SCIENCE_STATIC_QUESTIONS.filter((q) => q.quizId === 'sci-general').length,
  },

  // ======================== HISTORY (4 SUB-QUIZZES) ========================
  {
    id: 'hist-presidents',
    category: 'history',
    title: 'All US Presidents',
    shortTitle: 'US Presidents',
    description: 'Trivia covering all 47 US presidencies — signature milestones, surprising facts, and presidential order #1–#47.',
    icon: 'crown',
    supportsDirection: true,
    directionLabels: {
      standard: 'Presidential Facts',
      reverse: 'Order & Term #',
      mixed: 'Facts & Order',
    },
    supportsTypeIn: true,
    estimatedCount: US_PRESIDENTS.length,
    featured: true,
  },
  {
    id: 'hist-ancient',
    category: 'history',
    title: 'Ancient Civilizations',
    shortTitle: 'Ancient',
    description: 'Egypt, Mesopotamia, Greece, Rome, Mali, China, and the ancient Americas.',
    icon: 'scroll',
    supportsTypeIn: true,
    estimatedCount: HISTORY_STATIC_QUESTIONS.filter((q) => q.quizId === 'hist-ancient').length,
  },
  {
    id: 'hist-modern',
    category: 'history',
    title: 'Modern World History',
    shortTitle: 'Modern World',
    description: 'Renaissance breakthroughs, global voyages, revolutions, treaties, and 20th-century turning points.',
    icon: 'clock',
    supportsTypeIn: true,
    estimatedCount: HISTORY_STATIC_QUESTIONS.filter((q) => q.quizId === 'hist-modern').length,
  },
  {
    id: 'hist-us',
    category: 'history',
    title: 'US History & Civics',
    shortTitle: 'US History',
    description: 'Founding documents, amendments, railroads, civil rights, and Apollo 11.',
    icon: 'landmark',
    supportsTypeIn: true,
    estimatedCount: HISTORY_STATIC_QUESTIONS.filter((q) => q.quizId === 'hist-us').length,
  },

  // ======================== POP CULTURE & SPORTS (4 SUB-QUIZZES) ========================
  {
    id: 'cult-holidays',
    category: 'culture',
    title: 'Holidays & Traditions',
    shortTitle: 'Holidays',
    description: 'Surprising origins and traditions behind Christmas, Halloween, Thanksgiving, Diwali, Lunar New Year, Mardi Gras & more.',
    icon: 'gift',
    supportsTypeIn: true,
    estimatedCount: CULTURE_STATIC_QUESTIONS.filter((q) => q.quizId === 'cult-holidays').length,
    featured: true,
  },
  {
    id: 'cult-film',
    category: 'culture',
    title: 'Movies & Television',
    shortTitle: 'Film & TV',
    description: 'Academy Award winners, beloved animated classics, sci-fi icons, and legendary TV shows.',
    icon: 'film',
    supportsTypeIn: true,
    estimatedCount: CULTURE_STATIC_QUESTIONS.filter((q) => q.quizId === 'cult-film').length,
  },
  {
    id: 'cult-music-games',
    category: 'culture',
    title: 'Music & Video Games',
    shortTitle: 'Music & Games',
    description: 'Record-shattering albums, instruments, classical greats, and gaming history.',
    icon: 'music',
    supportsTypeIn: true,
    estimatedCount: CULTURE_STATIC_QUESTIONS.filter((q) => q.quizId === 'cult-music-games').length,
  },
  {
    id: 'cult-sports',
    category: 'culture',
    title: 'World Sports',
    shortTitle: 'Sports',
    description: 'FIFA World Cup, Olympics, Grand Slam tennis, basketball, chess, Formula 1, and marathons.',
    icon: 'trophy',
    supportsTypeIn: true,
    estimatedCount: CULTURE_STATIC_QUESTIONS.filter((q) => q.quizId === 'cult-sports').length,
  },

  // ======================== TECH, ARTS & GENERAL (3 SUB-QUIZZES) ========================
  {
    id: 'gen-tech',
    category: 'general',
    title: 'Tech & Computing',
    shortTitle: 'Tech',
    description: 'Web history, programming languages, algorithms, networking, and computing pioneers.',
    icon: 'cpu',
    supportsTypeIn: true,
    estimatedCount: GENERAL_STATIC_QUESTIONS.filter((q) => q.quizId === 'gen-tech').length,
  },
  {
    id: 'gen-arts',
    category: 'general',
    title: 'Literature, Myth & Arts',
    shortTitle: 'Arts & Myth',
    description: 'Greek & Norse mythology, world literature, Renaissance masterpieces, and iconic architecture.',
    icon: 'palette',
    supportsTypeIn: true,
    estimatedCount: GENERAL_STATIC_QUESTIONS.filter((q) => q.quizId === 'gen-arts').length,
  },
  {
    id: 'gen-mix',
    category: 'general',
    title: 'General Knowledge Mix',
    shortTitle: 'General Mix',
    description: 'Food & spices, clever inventions, wordplay, mathematics, and wild everyday facts.',
    icon: 'sparkles',
    supportsTypeIn: true,
    estimatedCount: GENERAL_STATIC_QUESTIONS.filter((q) => q.quizId === 'gen-mix').length,
  },
];

export const CATEGORY_MIX_IDS: Record<CategoryId, string> = {
  'current-events': 'cur-all',
  geography: 'geo-all',
  science: 'sci-all',
  history: 'hist-all',
  culture: 'cult-all',
  general: 'gen-all',
};

const ALL_STATIC_SEEDS: StaticQuestionSeed[] = [
  ...CURRENT_EVENTS_QUESTIONS,
  ...GEO_STATIC_QUESTIONS,
  ...SCIENCE_STATIC_QUESTIONS,
  ...HISTORY_STATIC_QUESTIONS,
  ...CULTURE_STATIC_QUESTIONS,
  ...GENERAL_STATIC_QUESTIONS,
];

export function getCategoryById(id: CategoryId): CategoryDefinition {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function getQuizById(id: string): QuizDefinition | undefined {
  return QUIZZES.find((q) => q.id === id);
}

export function getQuizzesByCategory(category: CategoryId): QuizDefinition[] {
  return QUIZZES.filter((q) => q.category === category);
}

export function getQuizDisplayTitle(quizId: string): string {
  if (quizId === 'mixed') return 'Mixed Trivia (All Categories)';
  for (const cat of CATEGORIES) {
    if (CATEGORY_MIX_IDS[cat.id] === quizId) {
      return `All ${cat.title}`;
    }
  }
  return getQuizById(quizId)?.title ?? 'Mixed Trivia';
}

export function toPublicQuestion(q: TriviaQuestion): PublicTriviaQuestion {
  return {
    id: q.id,
    category: q.category,
    quizId: q.quizId,
    quizTitle: q.quizTitle,
    difficulty: q.difficulty,
    region: q.region,
    promptLabel: q.promptLabel,
    prompt: q.prompt,
    media: q.media,
    options: q.options,
  };
}

// ======================== DETERMINISTIC / SECURE PRNG ========================

function createRng(seed?: number): () => number {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    let state = (seed >>> 0) || 1;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  return () => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] / 4294967296;
    }
    return Math.random();
  };
}

function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickDistractors<T>(
  correct: T,
  preferredPool: readonly T[],
  fallbackPool: readonly T[],
  getKey: (item: T) => string,
  count: number,
  rng: () => number
): T[] {
  const used = new Set<string>([getKey(correct)]);
  const chosen: T[] = [];

  for (const item of shuffleWithRng(preferredPool, rng)) {
    if (chosen.length >= count) break;
    const key = getKey(item);
    if (!used.has(key)) {
      used.add(key);
      chosen.push(item);
    }
  }

  if (chosen.length < count) {
    for (const item of shuffleWithRng(fallbackPool, rng)) {
      if (chosen.length >= count) break;
      const key = getKey(item);
      if (!used.has(key)) {
        used.add(key);
        chosen.push(item);
      }
    }
  }

  return chosen;
}

// ======================== DYNAMIC GENERATORS ========================

function buildFlagQuestions(
  region: ContinentFilter,
  difficulty: DifficultyFilter,
  direction: QuestionDirection,
  rng: () => number
): TriviaQuestion[] {
  let pool = region === 'all' ? COUNTRIES : COUNTRIES.filter((c) => c.region === region);
  if (difficulty !== 'all') {
    const exact = pool.filter((c) => c.difficulty === difficulty);
    if (exact.length >= 4) pool = exact;
  }

  return pool.map((country, idx) => {
    const useReverse =
      direction === 'reverse' || (direction === 'mixed' && (idx % 2 === 1));

    const sameRegion = COUNTRIES.filter((c) => c.region === country.region && c.code !== country.code);
    const distractors = pickDistractors(country, sameRegion, COUNTRIES, (c) => c.code, 3, rng);

    if (useReverse) {
      const allChoices = shuffleWithRng([country, ...distractors], rng);
      const correctIndex = allChoices.findIndex((c) => c.code === country.code);
      return {
        id: `flag-rev-${country.code}`,
        category: 'geography',
        quizId: 'geo-flags',
        quizTitle: 'World Flags',
        difficulty: country.difficulty,
        region: country.region,
        promptLabel: `PICK THE FLAG · ${country.region.toUpperCase()}`,
        prompt: `Which of these is the national flag of ${country.name}?`,
        options: allChoices.map((c) => ({
          text: c.name,
          flagCode: c.code,
        })),
        correctIndex,
        acceptedAnswers: [country.name, ...(country.aliases ?? [])],
        typeable: false,
        explanation: `${country.name} (Capital: ${country.capital}). ${country.fact}`,
      };
    }

    const allChoices = shuffleWithRng([country, ...distractors], rng);
    const correctIndex = allChoices.findIndex((c) => c.code === country.code);
    return {
      id: `flag-std-${country.code}`,
      category: 'geography',
      quizId: 'geo-flags',
      quizTitle: 'World Flags',
      difficulty: country.difficulty,
      region: country.region,
      promptLabel: `WORLD FLAG · ${country.region.toUpperCase()}`,
      prompt: 'Which country does this flag belong to?',
      media: { type: 'flag', countryCode: country.code },
      options: allChoices.map((c) => ({
        text: c.name,
        sublabel: region === 'all' ? c.region : undefined,
      })),
      correctIndex,
      acceptedAnswers: [country.name, ...(country.aliases ?? [])],
      typeable: true,
      explanation: `${country.name} (Capital: ${country.capital}). ${country.fact}`,
    };
  });
}

function buildCapitalQuestions(
  region: ContinentFilter,
  difficulty: DifficultyFilter,
  direction: QuestionDirection,
  rng: () => number
): TriviaQuestion[] {
  let pool = region === 'all' ? COUNTRIES : COUNTRIES.filter((c) => c.region === region);
  // Skip Singapore in capitals quiz since country === capital
  pool = pool.filter((c) => c.name.toLowerCase() !== c.capital.toLowerCase());
  if (difficulty !== 'all') {
    const exact = pool.filter((c) => c.difficulty === difficulty);
    if (exact.length >= 4) pool = exact;
  }

  const allValid = COUNTRIES.filter((c) => c.name.toLowerCase() !== c.capital.toLowerCase());

  return pool.map((country, idx) => {
    const useReverse =
      direction === 'reverse' || (direction === 'mixed' && idx % 2 === 1);

    const sameRegion = allValid.filter((c) => c.region === country.region && c.code !== country.code);
    const distractors = pickDistractors(country, sameRegion, allValid, (c) => c.capital, 3, rng);
    const allChoices = shuffleWithRng([country, ...distractors], rng);
    const correctIndex = allChoices.findIndex((c) => c.code === country.code);

    if (useReverse) {
      return {
        id: `cap-rev-${country.code}`,
        category: 'geography',
        quizId: 'geo-capitals',
        quizTitle: 'World Capitals',
        difficulty: country.difficulty,
        region: country.region,
        promptLabel: `REVERSE CAPITAL · ${country.region.toUpperCase()}`,
        prompt: `${country.capital} is the capital of which country?`,
        options: allChoices.map((c) => ({
          text: c.name,
          sublabel: region === 'all' ? c.region : undefined,
        })),
        correctIndex,
        acceptedAnswers: [country.name, ...(country.aliases ?? [])],
        typeable: true,
        explanation: `${country.capital} is the capital of ${country.name}. ${country.fact}`,
      };
    }

    return {
      id: `cap-std-${country.code}`,
      category: 'geography',
      quizId: 'geo-capitals',
      quizTitle: 'World Capitals',
      difficulty: country.difficulty,
      region: country.region,
      promptLabel: `WORLD CAPITAL · ${country.region.toUpperCase()}`,
      prompt: `What is the capital city of ${country.name}?`,
      media: { type: 'flag', countryCode: country.code },
      options: allChoices.map((c) => ({ text: c.capital })),
      correctIndex,
      acceptedAnswers: [country.capital, ...(country.capitalAliases ?? [])],
      typeable: true,
      explanation: `${country.capital} is the capital of ${country.name}. ${country.fact}`,
    };
  });
}

function buildUSStateQuestions(
  difficulty: DifficultyFilter,
  direction: QuestionDirection,
  rng: () => number
): TriviaQuestion[] {
  let pool = [...US_STATES];
  if (difficulty !== 'all') {
    const exact = pool.filter((s) => s.difficulty === difficulty);
    if (exact.length >= 4) pool = exact;
  }

  return pool.map((st, idx) => {
    const mode =
      direction === 'standard'
        ? 'capital'
        : direction === 'reverse'
        ? 'reverse'
        : idx % 3 === 0
        ? 'capital'
        : idx % 3 === 1
        ? 'reverse'
        : 'nickname';

    const sameRegion = US_STATES.filter((s) => s.usRegion === st.usRegion && s.abbr !== st.abbr);
    const distractors = pickDistractors(st, sameRegion, US_STATES, (s) => s.abbr, 3, rng);
    const allChoices = shuffleWithRng([st, ...distractors], rng);
    const correctIndex = allChoices.findIndex((s) => s.abbr === st.abbr);

    if (mode === 'reverse') {
      return {
        id: `us-rev-${st.abbr}`,
        category: 'geography',
        quizId: 'geo-us-states',
        quizTitle: 'US States & Capitals',
        difficulty: st.difficulty,
        region: 'Americas',
        promptLabel: `US STATE CAPITALS · ${st.usRegion.toUpperCase()}`,
        prompt: `${st.capital} is the state capital of which US state?`,
        options: allChoices.map((s) => ({ text: s.name, sublabel: s.abbr })),
        correctIndex,
        acceptedAnswers: [st.name, st.abbr],
        typeable: true,
        explanation: `${st.capital} is the capital of ${st.name} (${st.abbr}), known as "${st.nickname}."`,
      };
    }

    if (mode === 'nickname') {
      return {
        id: `us-nick-${st.abbr}`,
        category: 'geography',
        quizId: 'geo-us-states',
        quizTitle: 'US States & Capitals',
        difficulty: st.difficulty,
        region: 'Americas',
        promptLabel: 'US STATE NICKNAME',
        prompt: `Which US state is nicknamed "${st.nickname}"?`,
        options: allChoices.map((s) => ({ text: s.name, sublabel: s.usRegion })),
        correctIndex,
        acceptedAnswers: [st.name, st.abbr],
        typeable: true,
        explanation: `${st.name} (${st.abbr}) is nicknamed "${st.nickname}," and its state capital is ${st.capital}.`,
      };
    }

    return {
      id: `us-cap-${st.abbr}`,
      category: 'geography',
      quizId: 'geo-us-states',
      quizTitle: 'US States & Capitals',
      difficulty: st.difficulty,
      region: 'Americas',
      promptLabel: `US STATE CAPITAL · ${st.usRegion.toUpperCase()}`,
      prompt: `What is the capital of ${st.name}?`,
      media: {
        type: 'badge',
        eyebrow: 'US STATE',
        value: st.abbr,
        subvalue: st.nickname,
      },
      options: allChoices.map((s) => ({ text: s.capital })),
      correctIndex,
      acceptedAnswers: [st.capital],
      typeable: true,
      explanation: `${st.capital} is the capital of ${st.name} (${st.abbr}), nicknamed "${st.nickname}."`,
    };
  });
}

function buildCurrencyBonusQuestions(
  region: ContinentFilter,
  difficulty: DifficultyFilter,
  rng: () => number
): TriviaQuestion[] {
  // Countries with distinctive, memorable named currencies (skipping generic Euros / US Dollars)
  const distinctive: CountryEntry[] = COUNTRIES.filter((c) => {
    if (c.currency === 'Euro' || c.currency === 'US Dollar') return false;
    if (c.code === 'JP') return false; // already in static facts
    const lowerCur = c.currency.toLowerCase();
    const lowerName = c.name.toLowerCase();
    // Skip trivially guessable currencies that literally contain the country name and "Dollar"
    if (lowerCur.includes('dollar') && lowerCur.includes(lowerName.split(' ')[0])) return false;
    return [
      'GB', 'CH', 'SE', 'PL', 'HU', 'TR', 'KR', 'IN', 'TH', 'VN', 'MY', 'ID',
      'BR', 'MX', 'ZA', 'KE', 'EG', 'BW', 'SA', 'AE', 'IL', 'RU', 'GT',
    ].includes(c.code);
  });

  let pool = region === 'all' ? distinctive : distinctive.filter((c) => c.region === region);
  if (difficulty !== 'all') {
    const exact = pool.filter((c) => c.difficulty === difficulty);
    if (exact.length >= 2) pool = exact;
  }

  return pool.map((c) => {
    const distractors = pickDistractors(c, distinctive, COUNTRIES, (x) => x.currency, 3, rng);
    const allChoices = shuffleWithRng([c, ...distractors], rng);
    const correctIndex = allChoices.findIndex((x) => x.code === c.code);
    const shortCur = c.currency.split(' ').slice(-1)[0];
    return {
      id: `geo-cur-${c.code}`,
      category: 'geography',
      quizId: 'geo-world-facts',
      quizTitle: 'Borders, Currencies & Facts',
      difficulty: c.difficulty,
      region: c.region,
      promptLabel: `WORLD CURRENCY · ${c.region.toUpperCase()}`,
      prompt: `What is the official currency of ${c.name}?`,
      media: { type: 'flag', countryCode: c.code },
      options: allChoices.map((x) => ({ text: x.currency })),
      correctIndex,
      acceptedAnswers: [c.currency, shortCur],
      typeable: true,
      explanation: `${c.name} uses the ${c.currency}. ${c.fact}`,
    };
  });
}

function buildElementQuestions(
  difficulty: DifficultyFilter,
  direction: QuestionDirection,
  rng: () => number
): TriviaQuestion[] {
  let pool = [...ELEMENTS];
  if (difficulty !== 'all') {
    const exact = pool.filter((e) => e.difficulty === difficulty);
    if (exact.length >= 4) pool = exact;
  }

  return pool.map((el, idx) => {
    const useReverse =
      direction === 'reverse' || (direction === 'mixed' && idx % 2 === 1);
    const sameGroup = ELEMENTS.filter((e) => e.group === el.group && e.number !== el.number);
    const distractors = pickDistractors(el, sameGroup, ELEMENTS, (e) => e.symbol, 3, rng);
    const allChoices = shuffleWithRng([el, ...distractors], rng);
    const correctIndex = allChoices.findIndex((e) => e.number === el.number);

    if (useReverse) {
      return {
        id: `el-rev-${el.symbol}`,
        category: 'science',
        quizId: 'sci-elements',
        quizTitle: 'Periodic Table & Elements',
        difficulty: el.difficulty,
        promptLabel: `PERIODIC TABLE · #${el.number}`,
        prompt: `What is the chemical symbol for ${el.name}?`,
        media: {
          type: 'element',
          symbol: '?',
          atomicNumber: el.number,
          group: el.group,
          hideSymbol: true,
        },
        options: allChoices.map((e) => ({ text: e.symbol, sublabel: `#${e.number}` })),
        correctIndex,
        acceptedAnswers: [el.symbol],
        typeable: true,
        explanation: `${el.name} has symbol ${el.symbol} and atomic number ${el.number} (${el.group}). ${el.fact}`,
      };
    }

    return {
      id: `el-std-${el.symbol}`,
      category: 'science',
      quizId: 'sci-elements',
      quizTitle: 'Periodic Table & Elements',
      difficulty: el.difficulty,
      promptLabel: `PERIODIC TABLE · ${el.group.toUpperCase()}`,
      prompt: `Which chemical element has the symbol "${el.symbol}" (Atomic #${el.number})?`,
      media: {
        type: 'element',
        symbol: el.symbol,
        atomicNumber: el.number,
        group: el.group,
      },
      options: allChoices.map((e) => ({ text: e.name })),
      correctIndex,
      acceptedAnswers: [el.name, el.name === 'Aluminum' ? 'Aluminium' : ''].filter(Boolean),
      typeable: true,
      explanation: `${el.symbol} is ${el.name} (atomic number ${el.number}). ${el.fact}`,
    };
  });
}

function materializeStaticSeed(seed: StaticQuestionSeed, rng: () => number): TriviaQuestion {
  const quizTitle = getQuizById(seed.quizId)?.title ?? 'Trivia';
  const rawOptions: { text: string; isCorrect: boolean }[] = [
    { text: seed.answer, isCorrect: true },
    ...seed.distractors.map((d) => ({ text: d, isCorrect: false })),
  ];
  const shuffled = shuffleWithRng(rawOptions, rng);
  const correctIndex = shuffled.findIndex((o) => o.isCorrect);

  return {
    id: seed.id,
    category: seed.category,
    quizId: seed.quizId,
    quizTitle,
    difficulty: seed.difficulty,
    region: seed.region,
    promptLabel: seed.promptLabel,
    prompt: seed.prompt,
    media: seed.flagCode ? { type: 'flag', countryCode: seed.flagCode } : undefined,
    options: shuffled.map((o): QuestionOption => ({ text: o.text })),
    correctIndex,
    acceptedAnswers: [seed.answer, ...(seed.aliases ?? [])],
    typeable: seed.typeable ?? true,
    explanation: seed.explanation,
  };
}

function formatOrdinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function buildPresidentQuestions(
  difficulty: DifficultyFilter,
  direction: QuestionDirection,
  rng: () => number
): TriviaQuestion[] {
  let pool = [...US_PRESIDENTS];
  if (difficulty !== 'all') {
    const exact = pool.filter((p) => p.difficulty === difficulty);
    if (exact.length >= 4) pool = exact;
  }

  return pool.map((pres, idx) => {
    const useOrderMode =
      direction === 'reverse' || (direction === 'mixed' && idx % 3 === 2);

    // Prefer nearby-era presidents as plausible distractors, strictly deduplicating by full name
    const nearbyEra = US_PRESIDENTS.filter(
      (p) => p.name !== pres.name && Math.abs(p.order - pres.order) <= 7
    );
    const distractors = pickDistractors(
      pres,
      nearbyEra,
      US_PRESIDENTS,
      (p) => p.name,
      3,
      rng
    );
    const allChoices = shuffleWithRng([pres, ...distractors], rng);
    const correctIndex = allChoices.findIndex((p) => p.name === pres.name);
    const ord = formatOrdinal(pres.order);

    if (useOrderMode) {
      return {
        id: `pres-ord-${pres.order}`,
        category: 'history',
        quizId: 'hist-presidents',
        quizTitle: 'All US Presidents',
        difficulty: pres.difficulty,
        promptLabel: `US PRESIDENT #${pres.order} · ${pres.years}`,
        prompt: `Who served as the ${ord} President of the United States (${pres.years})?`,
        media: {
          type: 'badge',
          eyebrow: 'US PRESIDENCY',
          value: `#${pres.order}`,
          subvalue: `${pres.years} · ${pres.party}`,
        },
        options: allChoices.map((p) => ({ text: p.name })),
        correctIndex,
        acceptedAnswers: [pres.name, ...(pres.aliases ?? [])],
        typeable: true,
        explanation: `${pres.name} served as the ${ord} US President (${pres.years}). ${pres.fact}`,
      };
    }

    return {
      id: `pres-fact-${pres.order}`,
      category: 'history',
      quizId: 'hist-presidents',
      quizTitle: 'All US Presidents',
      difficulty: pres.difficulty,
      promptLabel: `US PRESIDENTS · ${pres.party.toUpperCase()}`,
      prompt: pres.prompt,
      options: allChoices.map((p) => ({
        text: p.name,
        sublabel: `#${p.order} · ${p.years}`,
      })),
      correctIndex,
      acceptedAnswers: [pres.name, ...(pres.aliases ?? [])],
      typeable: true,
      explanation: `${pres.name} (${ord} President, ${pres.years}). ${pres.fact}`,
    };
  });
}

function getPoolForSingleQuiz(
  quizId: string,
  region: ContinentFilter,
  difficulty: DifficultyFilter,
  direction: QuestionDirection,
  rng: () => number
): TriviaQuestion[] {
  if (quizId === 'geo-flags') {
    return buildFlagQuestions(region, difficulty, direction, rng);
  }
  if (quizId === 'geo-capitals') {
    return buildCapitalQuestions(region, difficulty, direction, rng);
  }
  if (quizId === 'geo-us-states') {
    return buildUSStateQuestions(difficulty, direction, rng);
  }
  if (quizId === 'sci-elements') {
    return buildElementQuestions(difficulty, direction, rng);
  }
  if (quizId === 'hist-presidents') {
    return buildPresidentQuestions(difficulty, direction, rng);
  }

  let seeds = ALL_STATIC_SEEDS.filter((s) => s.quizId === quizId);
  if (region !== 'all') {
    const regional = seeds.filter((s) => s.region === region);
    if (regional.length > 0) seeds = regional;
  }

  let questions = seeds.map((s) => materializeStaticSeed(s, rng));

  if (quizId === 'geo-world-facts') {
    const currencyQs = buildCurrencyBonusQuestions(region, difficulty, rng);
    questions = [...questions, ...currencyQs];
  }

  if (difficulty !== 'all') {
    const exact = questions.filter((q) => q.difficulty === difficulty);
    const others = questions.filter((q) => q.difficulty !== difficulty);
    // Keep exact difficulty first, fallback to others only if caller requests more than exact count
    return [...shuffleWithRng(exact, rng), ...shuffleWithRng(others, rng)];
  }

  return shuffleWithRng(questions, rng);
}

/**
 * Round-robin balanced picker across multiple sub-quiz pools so mixed modes
 * (like All Geography or All Categories) feel delightfully varied.
 */
function pickBalancedAcrossQuizzes(
  quizIds: string[],
  count: number,
  region: ContinentFilter,
  difficulty: DifficultyFilter,
  direction: QuestionDirection,
  excludeSet: Set<string>,
  rng: () => number
): TriviaQuestion[] {
  const orderedIds = shuffleWithRng(quizIds, rng);
  const pools = orderedIds.map((id) =>
    shuffleWithRng(getPoolForSingleQuiz(id, region, difficulty, direction, rng), rng).filter(
      (q) => !excludeSet.has(q.id)
    )
  );

  // If difficulty was specified, prioritize exact matches at the front of each pool
  if (difficulty !== 'all') {
    for (let i = 0; i < pools.length; i++) {
      const exact = pools[i].filter((q) => q.difficulty === difficulty);
      const rest = pools[i].filter((q) => q.difficulty !== difficulty);
      pools[i] = [...exact, ...rest];
    }
  }

  const picked: TriviaQuestion[] = [];
  const seen = new Set<string>();
  let progress = true;

  while (picked.length < count && progress) {
    progress = false;
    for (const pool of pools) {
      if (picked.length >= count) break;
      while (pool.length > 0) {
        const next = pool.shift()!;
        if (!seen.has(next.id)) {
          seen.add(next.id);
          picked.push(next);
          progress = true;
          break;
        }
      }
    }
  }

  return shuffleWithRng(picked, rng);
}

/**
 * Generates a ready-to-play list of TriviaQuestions for Solo, Practice, or Multiplayer.
 */
export function generateQuizQuestions(opts: QuizGenerationOptions): TriviaQuestion[] {
  const rng = createRng(opts.seed);
  const region = opts.region ?? 'all';
  const difficulty = opts.difficulty ?? 'all';
  const direction = opts.direction ?? 'standard';
  const excludeSet = new Set(opts.excludeIds ?? []);
  const targetCount = Math.max(1, Math.min(opts.count, 100));

  // Grand mixed mode across all (or selected) categories
  if (opts.quizId === 'mixed') {
    const activeCats =
      opts.categories && opts.categories.length > 0
        ? opts.categories
        : CATEGORIES.map((c) => c.id);
    // Balance first by category, then evenly across each category's sub-quizzes
    const categoryOrder = shuffleWithRng(activeCats, rng);
    const catPools = categoryOrder.map((catId) => {
      const catQuizzes = getQuizzesByCategory(catId).map((q) => q.id);
      return pickBalancedAcrossQuizzes(
        catQuizzes,
        targetCount,
        region,
        difficulty,
        direction === 'standard' ? 'mixed' : direction,
        excludeSet,
        rng
      );
    });

    const picked: TriviaQuestion[] = [];
    const seen = new Set<string>();
    let progress = true;
    while (picked.length < targetCount && progress) {
      progress = false;
      for (const pool of catPools) {
        if (picked.length >= targetCount) break;
        while (pool.length > 0) {
          const next = pool.shift()!;
          if (!seen.has(next.id)) {
            seen.add(next.id);
            picked.push(next);
            progress = true;
            break;
          }
        }
      }
    }
    return shuffleWithRng(picked, rng);
  }

  // Category-level mix (e.g. 'geo-all', 'sci-all', 'hist-all', 'cult-all', 'gen-all')
  const matchedCat = CATEGORIES.find((c) => CATEGORY_MIX_IDS[c.id] === opts.quizId);
  if (matchedCat) {
    const catQuizIds = getQuizzesByCategory(matchedCat.id).map((q) => q.id);
    return pickBalancedAcrossQuizzes(
      catQuizIds,
      targetCount,
      region,
      difficulty,
      direction,
      excludeSet,
      rng
    );
  }

  // Single specific sub-quiz
  const pool = getPoolForSingleQuiz(opts.quizId, region, difficulty, direction, rng);
  const filtered = pool.filter((q) => !excludeSet.has(q.id));
  const source = filtered.length >= Math.min(targetCount, 4) ? filtered : pool;

  if (difficulty !== 'all') {
    const exact = shuffleWithRng(
      source.filter((q) => q.difficulty === difficulty),
      rng
    );
    const fallback = shuffleWithRng(
      source.filter((q) => q.difficulty !== difficulty),
      rng
    );
    return [...exact, ...fallback].slice(0, targetCount);
  }

  return shuffleWithRng(source, rng).slice(0, targetCount);
}

export function getTotalQuestionCount(): number {
  return QUIZZES.reduce((sum, q) => sum + q.estimatedCount, 0);
}
