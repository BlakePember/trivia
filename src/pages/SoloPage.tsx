import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Play,
  RotateCcw,
  Shield,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MIX_IDS,
  QUIZZES,
  generateQuizQuestions,
  getQuizDisplayTitle,
  getQuizzesByCategory,
} from '../../shared/catalog';
import { calculateAnswerScore, getPerformanceGrade } from '../../shared/scoring';
import type {
  CategoryId,
  ContinentFilter,
  DifficultyFilter,
  SoloModeType,
  TriviaQuestion,
} from '../../shared/types';
import { useTrivia } from '../context/TriviaContext';
import { QuestionCard } from '../components/QuestionCard';
import {
  playCorrectSound,
  playFanfareSound,
  playTickSound,
  playWrongSound,
} from '../utils/sounds';

interface SoloReviewEntry {
  question: TriviaQuestion;
  selectedIndex: number | null;
  correct: boolean;
  points: number;
  responseMs: number;
}

type SoloStage = 'setup' | 'playing' | 'summary';

const BLITZ_TOTAL_MS = 60_000;
const SURVIVAL_LIVES = 3;

export const SoloPage: React.FC = () => {
  const {
    soloPreselectQuiz,
    clearSoloPreselectQuiz,
    stats,
    recordSoloRun,
    bookmarks,
    toggleBookmark,
    openPractice,
  } = useTrivia();

  const [stage, setStage] = useState<SoloStage>('setup');
  const [mode, setMode] = useState<SoloModeType>('classic');
  const [quizId, setQuizId] = useState<string>('mixed');
  const [mixedCategories, setMixedCategories] = useState<CategoryId[]>(() =>
    CATEGORIES.map((c) => c.id)
  );
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [region, setRegion] = useState<ContinentFilter>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [secondsPerQ, setSecondsPerQ] = useState<number>(15);

  // Active run state
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(SURVIVAL_LIVES);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(15_000);
  const [blitzBonusFlash, setBlitzBonusFlash] = useState(false);
  const [review, setReview] = useState<SoloReviewEntry[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  const qStartedAtRef = useRef<number>(Date.now());
  const lastTickSecRef = useRef<number>(-1);
  const blitzAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  const currentQuestion = questions[index] ?? null;
  const quizTitle = useMemo(() => getQuizDisplayTitle(quizId), [quizId]);
  const supportsRegion = useMemo(() => {
    if (quizId === CATEGORY_MIX_IDS.geography) return true;
    const def = QUIZZES.find((q) => q.id === quizId);
    return Boolean(def?.supportsRegionFilter);
  }, [quizId]);

  const finishRun = useCallback(
    (finalScore: number, finalBestStreak: number, finalReview: SoloReviewEntry[]) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      if (blitzAutoTimerRef.current) {
        clearTimeout(blitzAutoTimerRef.current);
        blitzAutoTimerRef.current = null;
      }

      const prevBest = stats.bestByMode[mode] ?? 0;
      setIsNewBest(finalScore > prevBest && finalScore > 0);

      const correctCount = finalReview.filter((r) => r.correct).length;
      recordSoloRun({
        mode,
        quizId,
        quizTitle,
        score: finalScore,
        correct: correctCount,
        total: finalReview.length,
        bestStreak: finalBestStreak,
      });

      playFanfareSound();
      setStage('summary');
    },
    [mode, quizId, quizTitle, recordSoloRun, stats.bestByMode]
  );

  const toggleMixedCategory = (catId: CategoryId) => {
    setMixedCategories((prev) => {
      if (prev.includes(catId)) {
        // Keep at least one category selected
        return prev.length > 1 ? prev.filter((c) => c !== catId) : prev;
      }
      return [...prev, catId];
    });
  };

  const startRun = useCallback(
    (customQuestions?: TriviaQuestion[], overrideQuizId?: string) => {
      if (blitzAutoTimerRef.current) {
        clearTimeout(blitzAutoTimerRef.current);
        blitzAutoTimerRef.current = null;
      }

      const targetQuizId = overrideQuizId ?? quizId;
      const countToGenerate = mode === 'classic' ? questionCount : 60;
      const generated =
        customQuestions ??
        generateQuizQuestions({
          quizId: targetQuizId,
          count: countToGenerate,
          categories: targetQuizId === 'mixed' ? mixedCategories : undefined,
          difficulty,
          region: supportsRegion ? region : 'all',
          direction: 'mixed',
        });

      finishedRef.current = false;
      setQuestions(generated);
      setIndex(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setLives(SURVIVAL_LIVES);
      setSelectedIndex(null);
      setRevealed(false);
      setLastPoints(null);
      setReview([]);
      setIsNewBest(false);
      setBlitzBonusFlash(false);
      setTimeLeftMs(mode === 'blitz' ? BLITZ_TOTAL_MS : secondsPerQ * 1000);
      qStartedAtRef.current = Date.now();
      lastTickSecRef.current = -1;
      setStage('playing');
    },
    [difficulty, mixedCategories, mode, questionCount, quizId, region, secondsPerQ, supportsRegion]
  );

  useEffect(() => {
    if (soloPreselectQuiz) {
      setQuizId(soloPreselectQuiz.quizId);
      if (soloPreselectQuiz.quizId === 'mixed') {
        setMixedCategories(CATEGORIES.map((c) => c.id));
      }
      if (soloPreselectQuiz.autoStart) {
        setMode('classic');
        startRun(undefined, soloPreselectQuiz.quizId);
      } else {
        setStage('setup');
      }
      clearSoloPreselectQuiz();
    }
  }, [soloPreselectQuiz, clearSoloPreselectQuiz, startRun]);

  const advanceQuestion = useCallback(() => {
    if (stage !== 'playing') return;

    // Check survival lives exhaustion
    if (mode === 'survival' && lives <= 0) {
      finishRun(score, bestStreak, review);
      return;
    }

    const nextIdx = index + 1;
    if (nextIdx >= questions.length) {
      if (mode === 'classic') {
        finishRun(score, bestStreak, review);
        return;
      }
      // Endless replenishment for Blitz / Survival
      const more = generateQuizQuestions({
        quizId,
        count: 30,
        categories: quizId === 'mixed' ? mixedCategories : undefined,
        difficulty,
        region: supportsRegion ? region : 'all',
        direction: 'mixed',
        excludeIds: questions.slice(-25).map((q) => q.id),
      });
      if (more.length === 0) {
        finishRun(score, bestStreak, review);
        return;
      }
      setQuestions((prev) => [...prev, ...more]);
    }

    setIndex(nextIdx);
    setSelectedIndex(null);
    setRevealed(false);
    setLastPoints(null);
    qStartedAtRef.current = Date.now();
    if (mode !== 'blitz') {
      setTimeLeftMs(secondsPerQ * 1000);
      lastTickSecRef.current = -1;
    }
  }, [
    bestStreak,
    difficulty,
    finishRun,
    index,
    lives,
    mode,
    questions,
    quizId,
    region,
    review,
    score,
    secondsPerQ,
    stage,
    supportsRegion,
  ]);

  const handleAnswer = useCallback(
    (choiceIdx: number | null) => {
      if (stage !== 'playing' || revealed || !currentQuestion) return;

      const responseMs = Math.max(100, Date.now() - qStartedAtRef.current);
      const isCorrect = choiceIdx !== null && choiceIdx === currentQuestion.correctIndex;
      const nextStreak = isCorrect ? streak + 1 : 0;
      const nextBestStreak = Math.max(bestStreak, nextStreak);

      const timeLimitMs = mode === 'blitz' ? 10_000 : secondsPerQ * 1000;
      const scored = calculateAnswerScore({
        correct: isCorrect,
        responseMs,
        timeLimitMs,
        newStreak: nextStreak,
      });

      const nextScore = score + scored.points;
      const nextLives = !isCorrect && mode === 'survival' ? Math.max(0, lives - 1) : lives;

      const entry: SoloReviewEntry = {
        question: currentQuestion,
        selectedIndex: choiceIdx,
        correct: isCorrect,
        points: scored.points,
        responseMs,
      };
      const nextReview = [...review, entry];

      setSelectedIndex(choiceIdx);
      setRevealed(true);
      setScore(nextScore);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setLives(nextLives);
      setLastPoints(scored.points);
      setReview(nextReview);

      if (isCorrect) {
        playCorrectSound(nextStreak);
        if (mode === 'blitz' && nextStreak > 0 && nextStreak % 5 === 0) {
          setTimeLeftMs((t) => Math.min(BLITZ_TOTAL_MS, t + 3000));
          setBlitzBonusFlash(true);
          setTimeout(() => setBlitzBonusFlash(false), 1100);
        }
      } else {
        playWrongSound();
      }

      if (mode === 'survival' && nextLives <= 0) {
        // Brief pause so user sees the missed explanation before summary, or click Continue
      } else if (mode === 'blitz') {
        blitzAutoTimerRef.current = setTimeout(() => {
          advanceQuestion();
        }, 700);
      }
    },
    [
      advanceQuestion,
      bestStreak,
      currentQuestion,
      lives,
      mode,
      revealed,
      review,
      score,
      secondsPerQ,
      stage,
      streak,
    ]
  );

  // Timer loop
  useEffect(() => {
    if (stage !== 'playing') return;
    if (mode !== 'blitz' && revealed) return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => {
        const next = Math.max(0, prev - 100);
        const sec = Math.ceil(next / 1000);
        if (sec <= 3 && sec > 0 && sec !== lastTickSecRef.current) {
          lastTickSecRef.current = sec;
          playTickSound(sec === 1);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage, mode, revealed]);

  // Handle timer reaching 0
  useEffect(() => {
    if (stage !== 'playing' || timeLeftMs > 0) return;
    if (mode === 'blitz') {
      finishRun(score, bestStreak, review);
    } else if (!revealed) {
      handleAnswer(null);
    }
  }, [bestStreak, finishRun, handleAnswer, mode, revealed, review, score, stage, timeLeftMs]);

  // Keyboard shortcuts (1-4 to pick, Enter/Space to advance)
  useEffect(() => {
    if (stage !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!revealed) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          handleAnswer(Number(e.key) - 1);
        }
      } else if (mode !== 'blitz' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advanceQuestion();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advanceQuestion, handleAnswer, mode, revealed, stage]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (blitzAutoTimerRef.current) clearTimeout(blitzAutoTimerRef.current);
    };
  }, []);

  if (stage === 'playing' && currentQuestion) {
    const totalLimitMs = mode === 'blitz' ? BLITZ_TOTAL_MS : secondsPerQ * 1000;
    const timerPct = Math.max(0, Math.min(100, (timeLeftMs / totalLimitMs) * 100));
    const timerSec = Math.ceil(timeLeftMs / 1000);
    const isUrgent = timerSec <= 5;

    return (
      <main className="tv-page tv-play-page">
        <div className="tv-hud-bar">
          <div className="tv-hud-left">
            <span className="tv-hud-mode">
              {mode === 'classic' ? 'Classic' : mode === 'blitz' ? 'Blitz 60s' : 'Survival'} ·{' '}
              {quizTitle}
            </span>
          </div>

          <div className="tv-hud-metrics">
            <div className="tv-hud-stat">
              <Trophy size={15} />
              <strong>{score.toLocaleString()}</strong>
            </div>

            <div className={`tv-hud-stat ${streak >= 3 ? 'hot' : ''}`}>
              <Flame size={15} />
              <strong>{streak}</strong>
            </div>

            {mode === 'survival' && (
              <div className="tv-hud-lives" aria-label={`${lives} lives left`}>
                {Array.from({ length: SURVIVAL_LIVES }).map((_, i) => (
                  <Heart
                    key={i}
                    size={16}
                    className={i < lives ? 'life-full' : 'life-empty'}
                    fill={i < lives ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            )}

            <div className={`tv-hud-timer ${isUrgent ? 'urgent' : ''}`}>
              <Clock size={15} />
              <strong>{timerSec}s</strong>
              {blitzBonusFlash && <span className="tv-blitz-bonus">+3s!</span>}
            </div>

            <button
              type="button"
              className="tv-btn tv-btn-ghost tv-btn-sm"
              onClick={() => finishRun(score, bestStreak, review)}
            >
              Finish
            </button>
          </div>
        </div>

        <div className="tv-timer-track">
          <div
            className={`tv-timer-fill ${isUrgent ? 'urgent' : ''}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={index + 1}
          totalQuestions={mode === 'classic' ? questions.length : undefined}
          selectedIndex={selectedIndex}
          revealed={revealed}
          correctIndex={currentQuestion.correctIndex}
          correctText={currentQuestion.options[currentQuestion.correctIndex].text}
          explanation={currentQuestion.explanation}
          pointsDelta={revealed ? lastPoints : null}
          bookmarked={bookmarks.includes(currentQuestion.id)}
          onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
          onSelectOption={(idx) => handleAnswer(idx)}
        />

        {revealed && mode !== 'blitz' && (
          <div className="tv-play-footer">
            <span className="tv-kbd-hint">Press Enter or Space to continue</span>
            <button
              type="button"
              className="tv-btn tv-btn-primary tv-btn-lg"
              onClick={advanceQuestion}
            >
              <span>
                {mode === 'survival' && lives <= 0
                  ? 'See Results'
                  : mode === 'classic' && index + 1 >= questions.length
                  ? 'See Final Score'
                  : 'Next Question'}
              </span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </main>
    );
  }

  if (stage === 'summary') {
    const correctCount = review.filter((r) => r.correct).length;
    const totalCount = review.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const avgSec =
      totalCount > 0
        ? (review.reduce((acc, r) => acc + r.responseMs, 0) / totalCount / 1000).toFixed(1)
        : '0.0';
    const { grade, label } = getPerformanceGrade(accuracy);
    const missedQuestions = review.filter((r) => !r.correct).map((r) => r.question);

    return (
      <main className="tv-page tv-summary-page">
        <div className="tv-summary-hero">
          <div className={`tv-grade-badge grade-${grade}`}>{grade}</div>
          <div className="tv-summary-copy">
            <div className="tv-summary-tags">
              <span className="tv-pill-accent">{quizTitle}</span>
              <span className="tv-pill-soft">
                {mode === 'classic' ? 'Classic Run' : mode === 'blitz' ? 'Blitz 60s' : 'Survival'}
              </span>
              {isNewBest && <span className="tv-new-best">★ NEW PERSONAL BEST!</span>}
            </div>
            <h1>{label}!</h1>
            <p className="tv-summary-score">
              <strong>{score.toLocaleString()}</strong> points
            </p>
          </div>

          <div className="tv-summary-kpis">
            <div className="tv-kpi">
              <span>Accuracy</span>
              <strong>{accuracy}%</strong>
              <small>
                {correctCount} / {totalCount} correct
              </small>
            </div>
            <div className="tv-kpi">
              <span>Best Streak</span>
              <strong>{bestStreak}</strong>
              <small>in a row</small>
            </div>
            <div className="tv-kpi">
              <span>Avg Speed</span>
              <strong>{avgSec}s</strong>
              <small>per question</small>
            </div>
          </div>
        </div>

        <div className="tv-summary-actions">
          <button type="button" className="tv-btn tv-btn-primary tv-btn-lg" onClick={() => startRun()}>
            <RotateCcw size={17} />
            <span>Play Again</span>
          </button>

          {missedQuestions.length > 0 && (
            <button
              type="button"
              className="tv-btn tv-btn-secondary tv-btn-lg"
              onClick={() => startRun(missedQuestions)}
            >
              <Shield size={17} />
              <span>Retry {missedQuestions.length} Missed</span>
            </button>
          )}

          <button
            type="button"
            className="tv-btn tv-btn-ghost tv-btn-lg"
            onClick={() => setStage('setup')}
          >
            <span>Change Mode / Quiz</span>
          </button>
        </div>

        <section className="tv-review-section">
          <h2>Question Breakdown</h2>
          <div className="tv-review-list">
            {review.map((item, idx) => (
              <div
                key={`${item.question.id}-${idx}`}
                className={`tv-review-row ${item.correct ? 'ok' : 'miss'}`}
              >
                <div className="tv-review-icon">
                  {item.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div className="tv-review-body">
                  <div className="tv-review-q">
                    <span className="tv-review-num">#{idx + 1}</span>
                    <strong>{item.question.prompt}</strong>
                  </div>
                  <div className="tv-review-ans">
                    <span>
                      Answer:{' '}
                      <strong>
                        {item.question.options[item.question.correctIndex].text}
                      </strong>
                    </span>
                    {!item.correct && item.selectedIndex !== null && (
                      <span className="tv-review-yours">
                        (You picked: {item.question.options[item.selectedIndex]?.text})
                      </span>
                    )}
                    {!item.correct && item.selectedIndex === null && (
                      <span className="tv-review-yours">(Time expired)</span>
                    )}
                  </div>
                  <p className="tv-review-exp">{item.question.explanation}</p>
                </div>
                <div className="tv-review-pts">
                  {item.points > 0 ? `+${item.points}` : '0'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // SETUP SCREEN
  return (
    <main className="tv-page tv-setup-page">
      <div className="tv-page-header">
        <div>
          <p className="tv-section-eyebrow">SINGLE PLAYER ARENA</p>
          <h1>Solo Trivia Challenge</h1>
          <p className="tv-section-sub">
            Pick a challenge format, choose any category or Geography sub-quiz, and beat your personal bests.
          </p>
        </div>
        <button
          type="button"
          className="tv-btn tv-btn-ghost"
          onClick={() => openPractice({ categoryId: 'geography' })}
        >
          Want untimed study? Open Practice Mode →
        </button>
      </div>

      <div className="tv-setup-layout">
        <div className="tv-setup-main">
          {/* 1. Mode Selection */}
          <div className="tv-card">
            <h2 className="tv-card-title">1. Choose Game Mode</h2>
            <div className="tv-mode-grid">
              <button
                type="button"
                className={`tv-mode-card ${mode === 'classic' ? 'active' : ''}`}
                onClick={() => setMode('classic')}
              >
                <Zap size={20} />
                <h3>Classic Run</h3>
                <p>Timed 10–20 question match with speed + streak multipliers.</p>
                <span className="tv-mode-best">
                  Best: {(stats.bestByMode.classic ?? 0).toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                className={`tv-mode-card ${mode === 'blitz' ? 'active' : ''}`}
                onClick={() => setMode('blitz')}
              >
                <Timer size={20} />
                <h3>Blitz 60s</h3>
                <p>Rapid-fire 60-second sprint! +3s bonus every 5-streak.</p>
                <span className="tv-mode-best">
                  Best: {(stats.bestByMode.blitz ?? 0).toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                className={`tv-mode-card ${mode === 'survival' ? 'active' : ''}`}
                onClick={() => setMode('survival')}
              >
                <Heart size={20} />
                <h3>Survival</h3>
                <p>3 lives — survive endless questions for the highest score.</p>
                <span className="tv-mode-best">
                  Best: {(stats.bestByMode.survival ?? 0).toLocaleString()}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Topic & Settings */}
          <div className="tv-card">
            <h2 className="tv-card-title">2. Choose Quiz &amp; Settings</h2>

            <div className="tv-field">
              <label htmlFor="solo-quiz-select">Category / Quiz</label>
              <select
                id="solo-quiz-select"
                className="tv-select"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
              >
                <optgroup label="Grand Mixes">
                  <option value="mixed">All Categories Grand Mix</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={CATEGORY_MIX_IDS[c.id]}>
                      All {c.title} (Mix)
                    </option>
                  ))}
                </optgroup>
                {CATEGORIES.map((c) => (
                  <optgroup key={c.id} label={c.title}>
                    {getQuizzesByCategory(c.id).map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} ({q.estimatedCount} Qs)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="tv-quick-chips">
              <span className="tv-quick-label">Quick picks:</span>
              {[
                { id: 'mixed', label: 'Mixed Trivia (All)' },
                { id: 'geo-flags', label: 'World Flags' },
                { id: 'geo-capitals', label: 'World Capitals' },
                { id: 'hist-presidents', label: 'All US Presidents' },
                { id: 'cult-holidays', label: 'Holidays' },
                { id: 'geo-all', label: 'All Geography' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`tv-chip ${quizId === item.id ? 'active' : ''}`}
                  onClick={() => setQuizId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {quizId === 'mixed' && (
              <div className="tv-field">
                <label>
                  Included Categories ({mixedCategories.length}/{CATEGORIES.length})
                </label>
                <div className="tv-chip-wrap">
                  {CATEGORIES.map((c) => {
                    const active = mixedCategories.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`tv-chip ${active ? 'active' : ''}`}
                        onClick={() => toggleMixedCategory(c.id)}
                      >
                        <span
                          className="tv-cat-dot"
                          style={{ background: c.accent, display: 'inline-block', marginRight: 6 }}
                        />
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="tv-settings-row">
              <div className="tv-field">
                <label>Difficulty</label>
                <div className="tv-segmented">
                  {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={difficulty === d ? 'active' : ''}
                      onClick={() => setDifficulty(d)}
                    >
                      {d === 'all' ? 'Mixed' : d[0].toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {supportsRegion && (
                <div className="tv-field">
                  <label>Region</label>
                  <select
                    className="tv-select"
                    value={region}
                    onChange={(e) => setRegion(e.target.value as ContinentFilter)}
                  >
                    <option value="all">All Continents</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Americas">Americas</option>
                    <option value="Africa">Africa</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
              )}
            </div>

            {mode !== 'blitz' && (
              <div className="tv-settings-row">
                {mode === 'classic' && (
                  <div className="tv-field">
                    <label>Questions</label>
                    <div className="tv-segmented">
                      {[10, 15, 20].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={questionCount === n ? 'active' : ''}
                          onClick={() => setQuestionCount(n)}
                        >
                          {n} Qs
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="tv-field">
                  <label>Time per Question</label>
                  <div className="tv-segmented">
                    {[10, 15, 20, 30].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={secondsPerQ === s ? 'active' : ''}
                        onClick={() => setSecondsPerQ(s)}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="tv-setup-cta">
              <button
                type="button"
                className="tv-btn tv-btn-primary tv-btn-lg tv-btn-block"
                onClick={() => startRun()}
              >
                <Play size={18} />
                <span>Start {quizTitle}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Personal Bests & Recent Runs */}
        <aside className="tv-setup-side">
          <div className="tv-card">
            <h2 className="tv-card-title">
              <Award size={17} />
              <span>Your Records</span>
            </h2>
            <div className="tv-record-grid">
              <div className="tv-record-box">
                <span>Games Played</span>
                <strong>{stats.gamesPlayed}</strong>
              </div>
              <div className="tv-record-box">
                <span>Best Streak</span>
                <strong>{stats.bestStreak}</strong>
              </div>
              <div className="tv-record-box">
                <span>Accuracy</span>
                <strong>
                  {stats.totalAnswered > 0
                    ? `${Math.round((stats.totalCorrect / stats.totalAnswered) * 100)}%`
                    : '—'}
                </strong>
              </div>
              <div className="tv-record-box">
                <span>Answered</span>
                <strong>{stats.totalAnswered}</strong>
              </div>
            </div>
          </div>

          <div className="tv-card">
            <h2 className="tv-card-title">Recent Runs</h2>
            {stats.recentRuns.length === 0 ? (
              <p className="tv-empty-muted">
                Complete a solo run to log your high scores and track accuracy over time.
              </p>
            ) : (
              <div className="tv-recent-list">
                {stats.recentRuns.slice(0, 6).map((r) => (
                  <div key={r.id} className="tv-recent-row">
                    <div>
                      <strong>{r.quizTitle}</strong>
                      <span>
                        {r.mode} · {r.correct}/{r.total} correct
                      </span>
                    </div>
                    <strong className="tv-recent-score">{r.score.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};
