import { describe, expect, it } from 'vitest';
import { hasFlag } from 'country-flag-icons';
import { COUNTRIES } from './data/countries.js';
import { US_STATES } from './data/usStates.js';
import { US_PRESIDENTS } from './data/usPresidents.js';
import { ELEMENTS } from './data/elements.js';
import {
  CURRENT_EVENTS_META,
  CURRENT_EVENTS_QUESTIONS,
} from './data/currentEventsQuestions.js';
import {
  CATEGORIES,
  CATEGORY_MIX_IDS,
  QUIZZES,
  generateQuizQuestions,
  toPublicQuestion,
} from './catalog.js';
import {
  buildAnswerHint,
  calculateAnswerScore,
  getPerformanceGrade,
  isTypedAnswerCorrect,
} from './scoring.js';

describe('Trivia Data Integrity', () => {
  it('has valid unique ISO-2 flag codes for every country in COUNTRIES', () => {
    const seen = new Set<string>();
    for (const c of COUNTRIES) {
      expect(seen.has(c.code), `Duplicate country code ${c.code}`).toBe(false);
      seen.add(c.code);
      expect(hasFlag(c.code), `Missing SVG flag icon for ${c.code} (${c.name})`).toBe(true);
      expect(c.name.trim().length).toBeGreaterThan(1);
      expect(c.capital.trim().length).toBeGreaterThan(1);
    }
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(80);
  });

  it('contains all 50 unique US states', () => {
    expect(US_STATES).toHaveLength(50);
    const abbrs = new Set(US_STATES.map((s) => s.abbr));
    expect(abbrs.size).toBe(50);
  });

  it('contains all 47 US presidencies in sequential order from Washington to Trump', () => {
    expect(US_PRESIDENTS).toHaveLength(47);
    US_PRESIDENTS.forEach((p, idx) => {
      expect(p.order).toBe(idx + 1);
      expect(p.name.trim().length).toBeGreaterThan(3);
      expect(p.prompt.trim().length).toBeGreaterThan(20);
      expect(p.fact.trim().length).toBeGreaterThan(20);
    });
    expect(US_PRESIDENTS[0].name).toBe('George Washington');
    expect(US_PRESIDENTS[15].name).toBe('Abraham Lincoln');
    expect(US_PRESIDENTS[46].name).toBe('Donald Trump');
  });

  it('contains unique chemical elements with valid atomic numbers', () => {
    const nums = new Set(ELEMENTS.map((e) => e.number));
    const syms = new Set(ELEMENTS.map((e) => e.symbol));
    expect(nums.size).toBe(ELEMENTS.length);
    expect(syms.size).toBe(ELEMENTS.length);
    expect(ELEMENTS.length).toBeGreaterThanOrEqual(40);
  });

  it('contains a valid weekly Current Events edition with unique IDs and 4 distinct options', () => {
    expect(CURRENT_EVENTS_META.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(CURRENT_EVENTS_META.weekOf.trim().length).toBeGreaterThan(4);
    expect(CURRENT_EVENTS_QUESTIONS.length).toBeGreaterThanOrEqual(10);

    const ids = new Set<string>();
    for (const q of CURRENT_EVENTS_QUESTIONS) {
      expect(ids.has(q.id), `Duplicate current events ID ${q.id}`).toBe(false);
      ids.add(q.id);
      expect(q.category).toBe('current-events');
      expect(q.quizId).toBe('cur-weekly');
      const allOpts = new Set([q.answer, ...q.distractors].map((s) => s.trim().toLowerCase()));
      expect(allOpts.size, `Duplicate answer/distractor in ${q.id}`).toBe(4);
      expect(q.explanation.trim().length).toBeGreaterThan(15);
    }
  });
});

describe('Quiz Generation', () => {
  it('generates valid 4-option questions for every registered sub-quiz', () => {
    for (const quiz of QUIZZES) {
      const qs = generateQuizQuestions({ quizId: quiz.id, count: 10, seed: 42 });
      expect(qs.length, `Quiz ${quiz.id} generated 0 questions`).toBeGreaterThanOrEqual(8);

      for (const q of qs) {
        expect(q.options).toHaveLength(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
        const texts = new Set(q.options.map((o) => o.text.toLowerCase()));
        expect(texts.size, `Duplicate options in ${q.id}`).toBe(4);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it('supports Geography World Flags in standard, reverse, and region-filtered modes', () => {
    const stdEuro = generateQuizQuestions({
      quizId: 'geo-flags',
      count: 12,
      region: 'Europe',
      direction: 'standard',
      seed: 101,
    });
    expect(stdEuro).toHaveLength(12);
    for (const q of stdEuro) {
      expect(q.region).toBe('Europe');
      expect(q.media?.type).toBe('flag');
      expect(q.typeable).toBe(true);
    }

    const revAsia = generateQuizQuestions({
      quizId: 'geo-flags',
      count: 10,
      region: 'Asia',
      direction: 'reverse',
      seed: 202,
    });
    expect(revAsia).toHaveLength(10);
    for (const q of revAsia) {
      expect(q.region).toBe('Asia');
      expect(q.media).toBeUndefined();
      expect(q.options.every((o) => Boolean(o.flagCode))).toBe(true);
    }
  });

  it('generates all 47 US Presidents without duplicate options and Holidays trivia', () => {
    const presFacts = generateQuizQuestions({
      quizId: 'hist-presidents',
      count: 47,
      direction: 'standard',
      seed: 303,
    });
    expect(presFacts).toHaveLength(47);
    for (const q of presFacts) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
    }

    const presOrder = generateQuizQuestions({
      quizId: 'hist-presidents',
      count: 20,
      direction: 'reverse',
      seed: 404,
    });
    expect(presOrder).toHaveLength(20);
    expect(presOrder.every((q) => q.media?.type === 'badge')).toBe(true);

    const holidays = generateQuizQuestions({
      quizId: 'cult-holidays',
      count: 22,
      seed: 505,
    });
    expect(holidays).toHaveLength(22);
    expect(holidays.every((q) => q.category === 'culture')).toBe(true);
  });

  it('balances Geography Mix and All Categories Mixed Trivia (including custom subsets)', () => {
    const geoMix = generateQuizQuestions({ quizId: CATEGORY_MIX_IDS.geography, count: 12, seed: 77 });
    expect(geoMix).toHaveLength(12);
    const geoQuizzes = new Set(geoMix.map((q) => q.quizId));
    expect(geoQuizzes.size).toBeGreaterThanOrEqual(5);

    const grandMix = generateQuizQuestions({ quizId: 'mixed', count: 15, seed: 88 });
    expect(grandMix).toHaveLength(15);
    const cats = new Set(grandMix.map((q) => q.category));
    expect(cats.size).toBe(CATEGORIES.length);

    const customMix = generateQuizQuestions({
      quizId: 'mixed',
      count: 10,
      categories: ['history', 'culture'],
      seed: 99,
    });
    expect(customMix).toHaveLength(10);
    expect(customMix.every((q) => q.category === 'history' || q.category === 'culture')).toBe(true);
    expect(new Set(customMix.map((q) => q.category)).size).toBe(2);
  });

  it('strips answers cleanly when converting to PublicTriviaQuestion for multiplayer', () => {
    const [q] = generateQuizQuestions({ quizId: 'geo-capitals', count: 1, seed: 12 });
    const pub = toPublicQuestion(q);
    expect(pub.id).toBe(q.id);
    expect(pub.options).toHaveLength(4);
    expect('correctIndex' in pub).toBe(false);
    expect('acceptedAnswers' in pub).toBe(false);
    expect('explanation' in pub).toBe(false);
  });
});

describe('Scoring & Type-In Matching', () => {
  it('awards speed + streak bonuses accurately', () => {
    const wrong = calculateAnswerScore({
      correct: false,
      responseMs: 1000,
      timeLimitMs: 15000,
      newStreak: 0,
    });
    expect(wrong.points).toBe(0);

    const fastFirst = calculateAnswerScore({
      correct: true,
      responseMs: 1500,
      timeLimitMs: 15000,
      newStreak: 1,
    });
    expect(fastFirst.basePoints).toBe(500);
    expect(fastFirst.speedBonus).toBe(450);
    expect(fastFirst.streakBonus).toBe(0);
    expect(fastFirst.points).toBe(950);

    const streakFive = calculateAnswerScore({
      correct: true,
      responseMs: 7500,
      timeLimitMs: 15000,
      newStreak: 6,
    });
    expect(streakFive.streakBonus).toBe(400); // capped at +400
    expect(streakFive.points).toBe(500 + 250 + 400);
  });

  it('matches typed answers with accent insensitivity, aliases, and mild typo forgiveness', () => {
    expect(isTypedAnswerCorrect('brasilia', ['Brasília'])).toBe(true);
    expect(isTypedAnswerCorrect('usa', ['United States', 'USA'])).toBe(true);
    expect(isTypedAnswerCorrect('Reykjavik', ['Reykjavík'])).toBe(true);
    expect(isTypedAnswerCorrect('Austrailia', ['Australia'])).toBe(true);
    expect(isTypedAnswerCorrect('France', ['Germany'])).toBe(false);
    // Short symbols must match strictly without typo forgiveness
    expect(isTypedAnswerCorrect('Au', ['Au'])).toBe(true);
    expect(isTypedAnswerCorrect('Ag', ['Au'])).toBe(false);
  });

  it('builds progressive hints and performance grades', () => {
    expect(buildAnswerHint('Tokyo', 1)).toBe('T____ (5 chars)');
    expect(buildAnswerHint('Tokyo', 2)).toBe('T___o (5 chars)');
    expect(getPerformanceGrade(100).grade).toBe('S');
    expect(getPerformanceGrade(85).grade).toBe('A');
    expect(getPerformanceGrade(70).grade).toBe('B');
    expect(getPerformanceGrade(50).grade).toBe('C');
    expect(getPerformanceGrade(20).grade).toBe('D');
  });
});
