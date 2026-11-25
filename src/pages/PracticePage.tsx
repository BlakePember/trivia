import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Keyboard,
  ListChecks,
  Play,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MIX_IDS,
  QUIZZES,
  appendQuestionHistory,
  generateQuizQuestions,
  getCategoryById,
  getQuizById,
  getQuizzesByCategory,
  getTotalQuestionCount,
} from '../../shared/catalog';
import { COUNTRIES } from '../../shared/data/countries';
import { US_STATES } from '../../shared/data/usStates';
import { US_PRESIDENTS } from '../../shared/data/usPresidents';
import { ELEMENTS } from '../../shared/data/elements';
import { isTypedAnswerCorrect } from '../../shared/scoring';
import type {
  CategoryId,
  ContinentFilter,
  DifficultyFilter,
  QuestionDirection,
  TriviaQuestion,
} from '../../shared/types';
import { useTrivia } from '../context/TriviaContext';
import { CountryFlag } from '../components/CountryFlag';
import { QuizIcon } from '../components/QuizIcon';
import { QuestionCard } from '../components/QuestionCard';
import { playCorrectSound, playFanfareSound, playWrongSound } from '../utils/sounds';

interface PracticeResult {
  question: TriviaQuestion;
  correct: boolean;
  userAnswer: string;
}

type PracticeView = 'browser' | 'session' | 'summary' | 'atlas';

export const PracticePage: React.FC = () => {
  const {
    practiceTarget,
    clearPracticeTarget,
    mastery,
    markQuestionMastered,
    resetQuizMastery,
    bookmarks,
    toggleBookmark,
  } = useTrivia();

  const [view, setView] = useState<PracticeView>('browser');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'mixed'>('geography');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('geo-flags');
  const [mixedCategories, setMixedCategories] = useState<CategoryId[]>(() =>
    CATEGORIES.map((c) => c.id)
  );

  // Drill config
  const [region, setRegion] = useState<ContinentFilter>('all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [direction, setDirection] = useState<QuestionDirection>('standard');
  const [answerMode, setAnswerMode] = useState<'choice' | 'type'>('choice');
  const [sessionLength, setSessionLength] = useState<number>(15);
  const [timedDrill, setTimedDrill] = useState<boolean>(false);

  // Study Atlas search
  const [atlasSearch, setAtlasSearch] = useState('');
  const [atlasRegion, setAtlasRegion] = useState<ContinentFilter>('all');

  // Active session state
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [typedFeedback, setTypedFeedback] = useState<{
    submittedText: string;
    isCorrect: boolean;
  } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [newlyMastered, setNewlyMastered] = useState(0);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [timerSec, setTimerSec] = useState(15);
  const recentPracticeIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (practiceTarget) {
      if (practiceTarget.categoryId === 'mixed') {
        setSelectedCategory('mixed');
        setSelectedQuizId('mixed');
        setMixedCategories(CATEGORIES.map((c) => c.id));
      } else if (practiceTarget.categoryId) {
        setSelectedCategory(practiceTarget.categoryId);
        const quizzes = getQuizzesByCategory(practiceTarget.categoryId);
        if (practiceTarget.quizId) {
          setSelectedQuizId(practiceTarget.quizId);
        } else if (quizzes[0]) {
          setSelectedQuizId(quizzes[0].id);
        }
      } else if (practiceTarget.quizId) {
        const q = getQuizById(practiceTarget.quizId);
        if (q) {
          setSelectedCategory(q.category);
          setSelectedQuizId(q.id);
        }
      }
      setView('browser');
      clearPracticeTarget();
    }
  }, [practiceTarget, clearPracticeTarget]);

  const isMixedTab = selectedCategory === 'mixed';
  const categoryDef = isMixedTab ? null : getCategoryById(selectedCategory);
  const categoryQuizzes = useMemo(
    () => (selectedCategory === 'mixed' ? [] : getQuizzesByCategory(selectedCategory)),
    [selectedCategory]
  );
  const activeQuizDef = useMemo(
    () => (isMixedTab ? undefined : getQuizById(selectedQuizId) ?? categoryQuizzes[0]),
    [isMixedTab, selectedQuizId, categoryQuizzes]
  );

  // Ensure selectedQuizId belongs to selectedCategory when switching tabs
  const handleSelectCategory = (catId: CategoryId | 'mixed') => {
    setSelectedCategory(catId);
    setRegion('all');
    setDirection('standard');
    if (catId === 'mixed') {
      setSelectedQuizId('mixed');
      return;
    }
    const list = getQuizzesByCategory(catId);
    if (list[0]) {
      setSelectedQuizId(list[0].id);
    }
  };

  const toggleMixedCategory = (catId: CategoryId) => {
    setMixedCategories((prev) => {
      if (prev.includes(catId)) {
        return prev.length > 1 ? prev.filter((c) => c !== catId) : prev;
      }
      return [...prev, catId];
    });
  };

  const handleSelectQuiz = (qId: string) => {
    setSelectedQuizId(qId);
    setDirection('standard');
    const qDef = getQuizById(qId);
    if (!qDef?.supportsRegionFilter) {
      setRegion('all');
    }
  };

  const currentQuestion = questions[index] ?? null;

  const startPracticeSession = useCallback(
    (overrideQuestions?: TriviaQuestion[], overrideQuizId?: string) => {
      const targetId = overrideQuizId ?? selectedQuizId;
      const qs =
        overrideQuestions ??
        generateQuizQuestions({
          quizId: targetId,
          count: sessionLength === 0 ? 100 : sessionLength,
          categories: targetId === 'mixed' ? mixedCategories : undefined,
          difficulty,
          region:
            activeQuizDef?.supportsRegionFilter || targetId === CATEGORY_MIX_IDS.geography
              ? region
              : 'all',
          direction: activeQuizDef?.supportsDirection ? direction : 'standard',
          excludeIds: recentPracticeIdsRef.current,
        });

      if (!overrideQuestions && qs.length > 0) {
        recentPracticeIdsRef.current = appendQuestionHistory(
          recentPracticeIdsRef.current,
          qs.map((q) => q.id),
          300
        );
      }

      setQuestions(qs);
      setIndex(0);
      setSelectedIndex(null);
      setTypedFeedback(null);
      setRevealed(false);
      setStreak(0);
      setNewlyMastered(0);
      setResults([]);
      setTimerSec(15);
      setView('session');
    },
    [activeQuizDef, difficulty, direction, mixedCategories, region, selectedQuizId, sessionLength]
  );

  const recordOutcome = useCallback(
    (isCorrect: boolean, userAnswer: string) => {
      if (!currentQuestion) return;
      const nextStreak = isCorrect ? streak + 1 : 0;
      setStreak(nextStreak);
      setRevealed(true);
      setResults((prev) => [...prev, { question: currentQuestion, correct: isCorrect, userAnswer }]);

      if (isCorrect) {
        playCorrectSound(nextStreak);
        const already = mastery[currentQuestion.quizId]?.includes(currentQuestion.id);
        if (!already) {
          markQuestionMastered(currentQuestion.quizId, currentQuestion.id);
          setNewlyMastered((n) => n + 1);
        }
      } else {
        playWrongSound();
      }
    },
    [currentQuestion, markQuestionMastered, mastery, streak]
  );

  const handleChoiceSelect = useCallback(
    (idx: number) => {
      if (revealed || !currentQuestion) return;
      setSelectedIndex(idx);
      const isCorrect = idx === currentQuestion.correctIndex;
      recordOutcome(isCorrect, currentQuestion.options[idx]?.text ?? '');
    },
    [currentQuestion, recordOutcome, revealed]
  );

  const handleTypedSubmit = useCallback(
    (text: string) => {
      if (revealed || !currentQuestion) return;
      const isCorrect = isTypedAnswerCorrect(text, currentQuestion.acceptedAnswers);
      setTypedFeedback({ submittedText: text, isCorrect });
      recordOutcome(isCorrect, text);
    },
    [currentQuestion, recordOutcome, revealed]
  );

  const handleRevealTyped = useCallback(() => {
    if (revealed || !currentQuestion) return;
    setTypedFeedback({ submittedText: '', isCorrect: false });
    recordOutcome(false, '(Revealed)');
  }, [currentQuestion, recordOutcome, revealed]);

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      playFanfareSound();
      setView('summary');
      return;
    }
    setIndex((i) => i + 1);
    setSelectedIndex(null);
    setTypedFeedback(null);
    setRevealed(false);
    setTimerSec(15);
  }, [index, questions.length]);

  // Optional 15s practice drill timer
  useEffect(() => {
    if (view !== 'session' || !timedDrill || revealed) return;
    const id = setInterval(() => {
      setTimerSec((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [view, timedDrill, revealed, index]);

  useEffect(() => {
    if (view === 'session' && timedDrill && !revealed && timerSec === 0 && currentQuestion) {
      setTypedFeedback(answerMode === 'type' ? { submittedText: '', isCorrect: false } : null);
      recordOutcome(false, '(Time up)');
    }
  }, [answerMode, currentQuestion, recordOutcome, revealed, timedDrill, timerSec, view]);

  // Keyboard shortcuts
  useEffect(() => {
    if (view !== 'session' || !currentQuestion) return;
    const isFlagGrid = currentQuestion.options.some((o) => Boolean(o.flagCode));
    const effectiveMode = answerMode === 'type' && currentQuestion.typeable && !isFlagGrid ? 'type' : 'choice';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!revealed && effectiveMode === 'choice' && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        handleChoiceSelect(Number(e.key) - 1);
      } else if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [answerMode, currentQuestion, handleChoiceSelect, handleNext, revealed, view]);

  // ======================== STUDY ATLAS REFERENCE VIEW ========================
  if (view === 'atlas') {
    const query = atlasSearch.trim().toLowerCase();
    const isUS = selectedQuizId === 'geo-us-states';
    const isElements = selectedQuizId === 'sci-elements';
    const isPresidents = selectedQuizId === 'hist-presidents';

    const filteredCountries = COUNTRIES.filter((c) => {
      if (atlasRegion !== 'all' && c.region !== atlasRegion) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.capital.toLowerCase().includes(query) ||
        c.currency.toLowerCase().includes(query)
      );
    });

    const filteredStates = US_STATES.filter((s) => {
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.capital.toLowerCase().includes(query) ||
        s.abbr.toLowerCase().includes(query) ||
        s.nickname.toLowerCase().includes(query)
      );
    });

    const filteredPresidents = US_PRESIDENTS.filter((p) => {
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.party.toLowerCase().includes(query) ||
        p.years.toLowerCase().includes(query) ||
        p.fact.toLowerCase().includes(query) ||
        String(p.order) === query
      );
    });

    const filteredElements = ELEMENTS.filter((el) => {
      if (!query) return true;
      return (
        el.name.toLowerCase().includes(query) ||
        el.symbol.toLowerCase().includes(query) ||
        String(el.number) === query
      );
    });

    return (
      <main className="tv-page tv-atlas-page">
        <div className="tv-page-header">
          <div>
            <button
              type="button"
              className="tv-back-btn"
              onClick={() => setView('browser')}
            >
              <ArrowLeft size={15} />
              <span>Back to Practice Studio</span>
            </button>
            <h1>
              {isUS
                ? 'US States & Capitals Reference'
                : isPresidents
                ? 'All 47 US Presidencies Study Guide'
                : isElements
                ? 'Periodic Table Study Sheet'
                : 'World Flags, Capitals & Currencies Atlas'}
            </h1>
            <p className="tv-section-sub">
              Study before you quiz — browse key facts and references, then launch straight into practice.
            </p>
          </div>
          <button
            type="button"
            className="tv-btn tv-btn-primary"
            onClick={() => startPracticeSession()}
          >
            <Play size={16} />
            <span>Quiz Me Now</span>
          </button>
        </div>

        <div className="tv-atlas-controls">
          <div className="tv-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder={
                isUS
                  ? 'Search state, capital, or nickname...'
                  : isPresidents
                  ? 'Search president, number (1–47), party, or year...'
                  : isElements
                  ? 'Search element, symbol, or atomic number...'
                  : 'Search country, capital, or currency...'
              }
              value={atlasSearch}
              onChange={(e) => setAtlasSearch(e.target.value)}
            />
          </div>

          {!isUS && !isElements && !isPresidents && (
            <div className="tv-segmented">
              {(['all', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'] as ContinentFilter[]).map(
                (r) => (
                  <button
                    key={r}
                    type="button"
                    className={atlasRegion === r ? 'active' : ''}
                    onClick={() => setAtlasRegion(r)}
                  >
                    {r === 'all' ? 'All' : r}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {isUS ? (
          <div className="tv-atlas-grid">
            {filteredStates.map((st) => (
              <div key={st.abbr} className="tv-atlas-card">
                <div className="tv-atlas-badge">{st.abbr}</div>
                <div className="tv-atlas-info">
                  <strong>{st.name}</strong>
                  <span>Capital: {st.capital}</span>
                  <small>
                    {st.nickname} · {st.usRegion}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : isPresidents ? (
          <div className="tv-atlas-grid">
            {filteredPresidents.map((p) => (
              <div key={p.order} className="tv-atlas-card">
                <div className="tv-atlas-badge">
                  <small>US</small>
                  <strong>#{p.order}</strong>
                </div>
                <div className="tv-atlas-info">
                  <strong>{p.name}</strong>
                  <span>
                    {p.years} · {p.party}
                  </span>
                  <small>{p.fact}</small>
                </div>
              </div>
            ))}
          </div>
        ) : isElements ? (
          <div className="tv-atlas-grid">
            {filteredElements.map((el) => (
              <div key={el.symbol} className="tv-atlas-card">
                <div className="tv-atlas-badge">
                  <small>#{el.number}</small>
                  <strong>{el.symbol}</strong>
                </div>
                <div className="tv-atlas-info">
                  <strong>{el.name}</strong>
                  <span>{el.group}</span>
                  <small>{el.fact}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tv-atlas-grid">
            {filteredCountries.map((c) => (
              <div key={c.code} className="tv-atlas-card">
                <CountryFlag code={c.code} size="sm" />
                <div className="tv-atlas-info">
                  <strong>{c.name}</strong>
                  <span>Capital: {c.capital}</span>
                  <small>
                    {c.region} · {c.currency}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // ======================== ACTIVE PRACTICE SESSION ========================
  if (view === 'session' && currentQuestion) {
    const isFlagGrid = currentQuestion.options.some((o) => Boolean(o.flagCode));
    const effectiveMode: 'choice' | 'type' =
      answerMode === 'type' && currentQuestion.typeable && !isFlagGrid ? 'type' : 'choice';
    const correctSoFar = results.filter((r) => r.correct).length;
    const progressPct = Math.round(((index + (revealed ? 1 : 0)) / Math.max(1, questions.length)) * 100);

    return (
      <main className="tv-page tv-play-page">
        <div className="tv-hud-bar">
          <div className="tv-hud-left">
            <button
              type="button"
              className="tv-back-btn"
              onClick={() => setView('browser')}
            >
              <ArrowLeft size={15} />
              <span>Exit</span>
            </button>
            <span className="tv-hud-mode">Practice · {currentQuestion.quizTitle}</span>
          </div>

          <div className="tv-hud-metrics">
            <div className="tv-hud-stat">
              <CheckCircle2 size={15} />
              <strong>
                {correctSoFar}/{results.length}
              </strong>
            </div>

            <div className={`tv-hud-stat ${streak >= 3 ? 'hot' : ''}`}>
              <Flame size={15} />
              <strong>{streak}</strong>
            </div>

            {timedDrill && (
              <div className={`tv-hud-timer ${timerSec <= 4 ? 'urgent' : ''}`}>
                <Clock size={15} />
                <strong>{timerSec}s</strong>
              </div>
            )}
          </div>
        </div>

        <div className="tv-timer-track">
          <div className="tv-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={index + 1}
          totalQuestions={questions.length}
          mode={effectiveMode}
          selectedIndex={selectedIndex}
          revealed={revealed}
          correctIndex={currentQuestion.correctIndex}
          correctText={currentQuestion.options[currentQuestion.correctIndex].text}
          explanation={currentQuestion.explanation}
          typedFeedback={typedFeedback}
          bookmarked={bookmarks.includes(currentQuestion.id)}
          onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
          onSelectOption={handleChoiceSelect}
          onSubmitTyped={handleTypedSubmit}
          onRevealTyped={handleRevealTyped}
        />

        {revealed && (
          <div className="tv-play-footer">
            <span className="tv-kbd-hint">Press Enter or Space for next question</span>
            <button
              type="button"
              className="tv-btn tv-btn-primary tv-btn-lg"
              onClick={handleNext}
            >
              <span>{index + 1 >= questions.length ? 'Finish Practice' : 'Next Question'}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </main>
    );
  }

  // ======================== PRACTICE SUMMARY ========================
  if (view === 'summary') {
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
    const missed = results.filter((r) => !r.correct).map((r) => r.question);

    return (
      <main className="tv-page tv-summary-page">
        <div className="tv-summary-hero">
          <div className="tv-grade-badge grade-A">
            <GraduationCap size={34} />
          </div>
          <div className="tv-summary-copy">
            <div className="tv-summary-tags">
              <span className="tv-pill-accent">
                {isMixedTab ? 'Mixed Trivia (All Categories)' : activeQuizDef?.title ?? 'Practice Session'}
              </span>
              {newlyMastered > 0 && (
                <span className="tv-new-best">+{newlyMastered} NEWLY MASTERED!</span>
              )}
            </div>
            <h1>{accuracy >= 90 ? 'Outstanding Mastery!' : accuracy >= 70 ? 'Solid Practice!' : 'Great Study Session!'}</h1>
            <p className="tv-summary-score">
              <strong>{correctCount}</strong> / {results.length} correct ({accuracy}%)
            </p>
          </div>
        </div>

        <div className="tv-summary-actions">
          {missed.length > 0 && (
            <button
              type="button"
              className="tv-btn tv-btn-primary tv-btn-lg"
              onClick={() => startPracticeSession(missed)}
            >
              <RotateCcw size={17} />
              <span>Retry {missed.length} Missed Questions</span>
            </button>
          )}
          <button
            type="button"
            className="tv-btn tv-btn-secondary tv-btn-lg"
            onClick={() => startPracticeSession()}
          >
            <Play size={17} />
            <span>New Practice Set</span>
          </button>
          <button
            type="button"
            className="tv-btn tv-btn-ghost tv-btn-lg"
            onClick={() => setView('browser')}
          >
            <span>Back to Practice Studio</span>
          </button>
        </div>

        <section className="tv-review-section">
          <h2>Study Review</h2>
          <div className="tv-review-list">
            {results.map((r, i) => (
              <div key={`${r.question.id}-${i}`} className={`tv-review-row ${r.correct ? 'ok' : 'miss'}`}>
                <div className="tv-review-icon">
                  {r.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div className="tv-review-body">
                  <div className="tv-review-q">
                    <span className="tv-review-num">#{i + 1}</span>
                    <strong>{r.question.prompt}</strong>
                  </div>
                  <div className="tv-review-ans">
                    <span>
                      Correct:{' '}
                      <strong>{r.question.options[r.question.correctIndex].text}</strong>
                    </span>
                    {!r.correct && <span className="tv-review-yours">(You: {r.userAnswer})</span>}
                  </div>
                  <p className="tv-review-exp">{r.question.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // ======================== PRACTICE STUDIO BROWSER ========================
  const canOpenAtlas =
    selectedQuizId === 'geo-flags' ||
    selectedQuizId === 'geo-capitals' ||
    selectedQuizId === 'geo-world-facts' ||
    selectedQuizId === 'geo-us-states' ||
    selectedQuizId === 'hist-presidents' ||
    selectedQuizId === 'sci-elements';

  const masteredForActive = activeQuizDef ? mastery[activeQuizDef.id]?.length ?? 0 : 0;

  return (
    <main className="tv-page tv-practice-page">
      <div className="tv-page-header">
        <div>
          <p className="tv-section-eyebrow">CATEGORY PRACTICE STUDIO</p>
          <h1>Master Every Category</h1>
          <p className="tv-section-sub">
            Pick a category and specialized sub-quiz — or combine every topic in Mixed Trivia — and track your mastery.
          </p>
        </div>
        {categoryDef ? (
          <button
            type="button"
            className="tv-btn tv-btn-secondary"
            onClick={() => startPracticeSession(undefined, CATEGORY_MIX_IDS[categoryDef.id])}
          >
            <Sparkles size={16} />
            <span>Practice All {categoryDef.title} Mix</span>
          </button>
        ) : (
          <button
            type="button"
            className="tv-btn tv-btn-primary"
            onClick={() => startPracticeSession(undefined, 'mixed')}
          >
            <Shuffle size={16} />
            <span>Start Mixed Trivia Now</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="tv-cat-tabs" role="tablist" aria-label="Trivia categories">
        <button
          type="button"
          role="tab"
          aria-selected={isMixedTab}
          className={`tv-cat-tab ${isMixedTab ? 'active' : ''}`}
          style={{ '--cat-accent': 'var(--accent)' } as React.CSSProperties}
          onClick={() => handleSelectCategory('mixed')}
        >
          <Shuffle size={14} />
          <span>Mixed (All)</span>
        </button>

        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`tv-cat-tab ${active ? 'active' : ''}`}
              style={{ '--cat-accent': cat.accent } as React.CSSProperties}
              onClick={() => handleSelectCategory(cat.id)}
            >
              <span className="tv-cat-dot" />
              <span>{cat.title}</span>
              {cat.featured && <span className="tv-cat-star">Featured</span>}
            </button>
          );
        })}
      </div>

      {isMixedTab ? (
        <div className="tv-practice-layout">
          <div className="tv-card">
            <h2 className="tv-card-title">
              <Shuffle size={18} />
              <span>Combine Categories ({mixedCategories.length}/{CATEGORIES.length} Selected)</span>
            </h2>
            <p className="tv-card-sub">
              Every category is enabled by default for a balanced All-Categories Mixed Trivia session across {QUIZZES.length} quizzes ({getTotalQuestionCount()}+ questions). Toggle categories below to customize your mix.
            </p>

            <div className="tv-subquiz-grid">
              {CATEGORIES.map((cat) => {
                const enabled = mixedCategories.includes(cat.id);
                const quizzes = getQuizzesByCategory(cat.id);
                const count = quizzes.reduce((s, q) => s + q.estimatedCount, 0);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`tv-subquiz-card ${enabled ? 'active' : ''}`}
                    style={{ '--cat-accent': cat.accent } as React.CSSProperties}
                    onClick={() => toggleMixedCategory(cat.id)}
                  >
                    <div className="tv-quiz-tile-top">
                      <span className="tv-cat-card-head" style={{ marginBottom: 0 }}>
                        <span className="tv-cat-dot" />
                        <strong>{cat.title}</strong>
                      </span>
                      <span className="tv-quiz-count">{enabled ? 'Included ✓' : 'Excluded'}</span>
                    </div>
                    <p>{cat.tagline}</p>
                    <div className="tv-cat-tags">
                      {quizzes.map((q) => (
                        <span key={q.id}>{q.shortTitle}</span>
                      ))}
                      <span>{count} Qs</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="tv-practice-config tv-card">
            <div className="tv-config-head">
              <div className="tv-quiz-icon lg">
                <Shuffle size={22} />
              </div>
              <div>
                <span className="tv-pill-accent">ALL CATEGORIES</span>
                <h2>Mixed Trivia Practice</h2>
              </div>
            </div>

            <p className="tv-config-desc">
              Pulls evenly from every selected category — blending flags, capitals, US presidents, holidays, science, film, sports, and tech in one run.
            </p>

            <div className="tv-field">
              <label>Answer Style</label>
              <div className="tv-segmented">
                <button
                  type="button"
                  className={answerMode === 'choice' ? 'active' : ''}
                  onClick={() => setAnswerMode('choice')}
                >
                  <ListChecks size={14} /> Multiple Choice
                </button>
                <button
                  type="button"
                  className={answerMode === 'type' ? 'active' : ''}
                  onClick={() => setAnswerMode('type')}
                >
                  <Keyboard size={14} /> Type Answer
                </button>
              </div>
            </div>

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
                    {d === 'all' ? 'All' : d[0].toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="tv-settings-row">
              <div className="tv-field">
                <label>Set Size</label>
                <div className="tv-segmented">
                  {[
                    { val: 10, label: '10' },
                    { val: 20, label: '20' },
                    { val: 30, label: '30' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className={sessionLength === item.val ? 'active' : ''}
                      onClick={() => setSessionLength(item.val)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tv-field">
                <label>Pace</label>
                <div className="tv-segmented">
                  <button
                    type="button"
                    className={!timedDrill ? 'active' : ''}
                    onClick={() => setTimedDrill(false)}
                  >
                    Untimed
                  </button>
                  <button
                    type="button"
                    className={timedDrill ? 'active' : ''}
                    onClick={() => setTimedDrill(true)}
                  >
                    15s Drill
                  </button>
                </div>
              </div>
            </div>

            <div className="tv-config-actions">
              <button
                type="button"
                className="tv-btn tv-btn-primary tv-btn-lg tv-btn-block"
                onClick={() => startPracticeSession(undefined, 'mixed')}
              >
                <Play size={18} />
                <span>Start Mixed Trivia Practice</span>
              </button>
            </div>
          </aside>
        </div>
      ) : (
      <div className="tv-practice-layout">
        {/* Left: Sub-Quiz Cards */}
        <div className="tv-subquiz-grid">
          {categoryQuizzes.map((quiz) => {
            const selected = quiz.id === activeQuizDef?.id;
            const masteredCount = mastery[quiz.id]?.length ?? 0;
            const pct = Math.min(
              100,
              Math.round((masteredCount / Math.max(1, quiz.estimatedCount)) * 100)
            );
            return (
              <button
                key={quiz.id}
                type="button"
                className={`tv-subquiz-card ${selected ? 'active' : ''}`}
                onClick={() => handleSelectQuiz(quiz.id)}
              >
                <div className="tv-quiz-tile-top">
                  <span className="tv-quiz-icon">
                    <QuizIcon name={quiz.icon} size={18} />
                  </span>
                  <span className="tv-quiz-count">{quiz.estimatedCount} Qs</span>
                </div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>

                {quiz.id === 'geo-flags' && (
                  <div className="tv-mini-flags" aria-hidden="true">
                    <CountryFlag code="US" size="xs" />
                    <CountryFlag code="FR" size="xs" />
                    <CountryFlag code="JP" size="xs" />
                    <CountryFlag code="BR" size="xs" />
                    <CountryFlag code="ZA" size="xs" />
                  </div>
                )}

                <div className="tv-mastery-mini">
                  <div className="tv-mastery-bar">
                    <div className="tv-mastery-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span>
                    {masteredCount}/{quiz.estimatedCount} mastered
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Sub-Quiz Configurator */}
        {activeQuizDef && (
          <aside className="tv-practice-config tv-card">
            <div className="tv-config-head">
              <div className="tv-quiz-icon lg">
                <QuizIcon name={activeQuizDef.icon} size={22} />
              </div>
              <div>
                <span className="tv-pill-soft">{categoryDef?.title}</span>
                <h2>{activeQuizDef.title}</h2>
              </div>
            </div>

            <p className="tv-config-desc">{activeQuizDef.description}</p>

            {/* Region Filter */}
            {activeQuizDef.supportsRegionFilter && (
              <div className="tv-field">
                <label>Continent / Region</label>
                <div className="tv-chip-wrap">
                  {(['all', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'] as ContinentFilter[]).map(
                    (r) => (
                      <button
                        key={r}
                        type="button"
                        className={`tv-chip ${region === r ? 'active' : ''}`}
                        onClick={() => setRegion(r)}
                      >
                        {r === 'all' ? 'All World' : r}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Question Direction */}
            {activeQuizDef.supportsDirection && activeQuizDef.directionLabels && (
              <div className="tv-field">
                <label>Quiz Direction</label>
                <div className="tv-segmented">
                  {(['standard', 'reverse', 'mixed'] as QuestionDirection[]).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      className={direction === dir ? 'active' : ''}
                      onClick={() => setDirection(dir)}
                    >
                      {activeQuizDef.directionLabels![dir]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Format */}
            <div className="tv-field">
              <label>Answer Style</label>
              <div className="tv-segmented">
                <button
                  type="button"
                  className={answerMode === 'choice' ? 'active' : ''}
                  onClick={() => setAnswerMode('choice')}
                >
                  <ListChecks size={14} /> Multiple Choice
                </button>
                <button
                  type="button"
                  className={answerMode === 'type' ? 'active' : ''}
                  onClick={() => setAnswerMode('type')}
                  disabled={activeQuizDef.id === 'geo-flags' && direction === 'reverse'}
                  title={
                    activeQuizDef.id === 'geo-flags' && direction === 'reverse'
                      ? 'Country → Flag uses visual flag options'
                      : 'Type the answer from memory with hints'
                  }
                >
                  <Keyboard size={14} /> Type Answer
                </button>
              </div>
            </div>

            {/* Difficulty */}
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
                    {d === 'all' ? 'All' : d[0].toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Count & Timer */}
            <div className="tv-settings-row">
              <div className="tv-field">
                <label>Set Size</label>
                <div className="tv-segmented">
                  {[
                    { val: 10, label: '10' },
                    { val: 20, label: '20' },
                    { val: 0, label: 'All' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      className={sessionLength === item.val ? 'active' : ''}
                      onClick={() => setSessionLength(item.val)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tv-field">
                <label>Pace</label>
                <div className="tv-segmented">
                  <button
                    type="button"
                    className={!timedDrill ? 'active' : ''}
                    onClick={() => setTimedDrill(false)}
                  >
                    Untimed
                  </button>
                  <button
                    type="button"
                    className={timedDrill ? 'active' : ''}
                    onClick={() => setTimedDrill(true)}
                  >
                    15s Drill
                  </button>
                </div>
              </div>
            </div>

            <div className="tv-config-actions">
              <button
                type="button"
                className="tv-btn tv-btn-primary tv-btn-lg tv-btn-block"
                onClick={() => startPracticeSession()}
              >
                <Play size={18} />
                <span>Start {activeQuizDef.shortTitle} Practice</span>
              </button>

              {canOpenAtlas && (
                <button
                  type="button"
                  className="tv-btn tv-btn-secondary tv-btn-block"
                  onClick={() => {
                    setAtlasSearch('');
                    setAtlasRegion(region);
                    setView('atlas');
                  }}
                >
                  <BookOpen size={16} />
                  <span>Open Study Reference Atlas</span>
                </button>
              )}

              {masteredForActive > 0 && (
                <button
                  type="button"
                  className="tv-text-btn danger"
                  onClick={() => resetQuizMastery(activeQuizDef.id)}
                >
                  <Trash2 size={13} />
                  <span>Reset {activeQuizDef.shortTitle} mastery ({masteredForActive})</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
      )}
    </main>
  );
};
