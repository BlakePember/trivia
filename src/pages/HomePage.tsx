import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Globe,
  GraduationCap,
  Play,
  RefreshCw,
  Shuffle,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MIX_IDS,
  CURRENT_EVENTS_META,
  QUIZZES,
  generateQuizQuestions,
  getQuizzesByCategory,
  getTotalQuestionCount,
} from '../../shared/catalog';
import { useTrivia } from '../context/TriviaContext';
import { CountryFlag } from '../components/CountryFlag';
import { QuizIcon } from '../components/QuizIcon';
import { playCorrectSound, playWrongSound } from '../utils/sounds';

export const HomePage: React.FC = () => {
  const {
    setPage,
    openPractice,
    openSoloWithQuiz,
    connected,
    matchmaking,
    stats,
    mastery,
  } = useTrivia();

  const [sampleSeed, setSampleSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [samplePicked, setSamplePicked] = useState<number | null>(null);

  const sampleQuestion = useMemo(() => {
    const qs = generateQuizQuestions({
      quizId: sampleSeed % 2 === 0 ? 'geo-flags' : 'geo-capitals',
      count: 1,
      difficulty: 'easy',
      direction: 'standard',
      seed: sampleSeed,
    });
    return qs[0];
  }, [sampleSeed]);

  const geoQuizzes = useMemo(() => getQuizzesByCategory('geography'), []);
  const totalQuestions = useMemo(() => getTotalQuestionCount(), []);

  const accuracyPct =
    stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : null;

  const handleSamplePick = (idx: number) => {
    if (samplePicked !== null) return;
    setSamplePicked(idx);
    if (idx === sampleQuestion.correctIndex) {
      playCorrectSound(1);
    } else {
      playWrongSound();
    }
  };

  const nextSample = () => {
    setSamplePicked(null);
    setSampleSeed((s) => s + 1);
  };

  return (
    <main className="tv-page tv-home">
      <section className="tv-hero">
        <div className="tv-hero-copy">
          <div className="tv-eyebrow">
            <span className={`tv-dot ${connected ? 'live' : ''}`} />
            {connected
              ? `${matchmaking.onlineCount} ONLINE · ${totalQuestions}+ QUESTIONS ACROSS ${QUIZZES.length} QUIZZES`
              : `${totalQuestions}+ QUESTIONS · ${QUIZZES.length} QUIZZES · SOLO, PRACTICE & LIVE`}
          </div>

          <h1 className="tv-hero-title">
            Know a little.<br />
            <span className="tv-highlight">Play a lot.</span>
          </h1>

          <p className="tv-hero-desc">
            Jump into a balanced <strong>Mixed Trivia</strong> showdown across every category, drill
            specialized quizzes like <strong>Geography Flags &amp; Capitals</strong>,{' '}
            <strong>All US Presidents</strong>, and <strong>Holidays &amp; Traditions</strong>, or
            battle friends in live multiplayer rooms.
          </p>

          <div className="tv-hero-actions">
            <button
              type="button"
              className="tv-btn tv-btn-primary tv-btn-lg"
              onClick={() => openSoloWithQuiz('mixed', true)}
            >
              <Shuffle size={18} />
              <span>Play Mixed Trivia</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="tv-btn tv-btn-secondary tv-btn-lg"
              onClick={() => openPractice({ categoryId: 'geography', quizId: 'geo-flags' })}
            >
              <GraduationCap size={18} />
              <span>Practice Categories</span>
            </button>

            <button
              type="button"
              className="tv-btn tv-btn-ghost tv-btn-lg"
              onClick={() => setPage('multiplayer')}
            >
              <Globe size={18} />
              <span>Multiplayer</span>
            </button>
          </div>

          {stats.gamesPlayed > 0 && (
            <div className="tv-hero-stats">
              <div className="tv-mini-stat">
                <Trophy size={14} />
                <span>
                  Best Classic: <strong>{(stats.bestByMode.classic ?? 0).toLocaleString()}</strong>
                </span>
              </div>
              <div className="tv-mini-stat">
                <Flame size={14} />
                <span>
                  Best Streak: <strong>{stats.bestStreak}</strong>
                </span>
              </div>
              {accuracyPct !== null && (
                <div className="tv-mini-stat">
                  <Sparkles size={14} />
                  <span>
                    Accuracy: <strong>{accuracyPct}%</strong> ({stats.totalAnswered} Qs)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive live preview card right in the hero */}
        <div className="tv-hero-visual" aria-label="Interactive trivia sample card">
          <div className="tv-sample-card">
            <div className="tv-sample-top">
              <span className="tv-pill-accent">TRY A QUESTION</span>
              <button
                type="button"
                className="tv-sample-refresh"
                onClick={nextSample}
                title="Try another sample question"
              >
                <RefreshCw size={13} />
                <span>Next</span>
              </button>
            </div>

            {sampleQuestion.media?.type === 'flag' && (
              <div className="tv-sample-flag">
                <CountryFlag code={sampleQuestion.media.countryCode} size="lg" />
              </div>
            )}

            <p className="tv-sample-prompt">{sampleQuestion.prompt}</p>

            <div className="tv-sample-options">
              {sampleQuestion.options.map((opt, idx) => {
                const isPicked = samplePicked === idx;
                const isCorrect = samplePicked !== null && idx === sampleQuestion.correctIndex;
                const isWrong = samplePicked !== null && isPicked && idx !== sampleQuestion.correctIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={samplePicked !== null}
                    onClick={() => handleSamplePick(idx)}
                    className={`tv-sample-opt ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  >
                    <span>{opt.text}</span>
                    {isCorrect && <CheckCircle2 size={15} />}
                    {isWrong && <XCircle size={15} />}
                  </button>
                );
              })}
            </div>

            {samplePicked !== null ? (
              <div className="tv-sample-foot">
                <p>{sampleQuestion.explanation}</p>
                <button type="button" className="tv-text-btn" onClick={nextSample}>
                  Try another question →
                </button>
              </div>
            ) : (
              <div className="tv-sample-hint">Click an answer above to test your instincts!</div>
            )}
          </div>
        </div>
      </section>

      {/* Mixed Trivia All-Categories Spotlight */}
      <section className="tv-mixed-banner">
        <div className="tv-mixed-banner-copy">
          <span className="tv-pill-accent">
            <Shuffle size={12} /> ALL-CATEGORIES MIXED TRIVIA
          </span>
          <h2>One Game. Every Category Combined.</h2>
          <p>
            Test your all-around knowledge with a balanced shuffle pulling evenly from{' '}
            <strong>Geography</strong>, <strong>Science &amp; Nature</strong>,{' '}
            <strong>History &amp; US Presidents</strong>,{' '}
            <strong>Pop Culture, Holidays &amp; Sports</strong>, and{' '}
            <strong>Tech, Arts &amp; General</strong>.
          </p>
          <div className="tv-mixed-pills">
            {CATEGORIES.map((c) => (
              <span
                key={c.id}
                className="tv-mixed-cat-chip"
                style={{ '--cat-accent': c.accent } as React.CSSProperties}
              >
                <span className="tv-cat-dot" />
                {c.title}
              </span>
            ))}
          </div>
        </div>

        <div className="tv-mixed-banner-actions">
          <button
            type="button"
            className="tv-btn tv-btn-primary tv-btn-lg"
            onClick={() => openSoloWithQuiz('mixed', true)}
          >
            <Play size={17} />
            <span>Quick Play Mixed (10 Qs)</span>
          </button>
          <div className="tv-mixed-sub-btns">
            <button
              type="button"
              className="tv-btn tv-btn-secondary tv-btn-sm"
              onClick={() => openSoloWithQuiz('mixed', false)}
            >
              <Zap size={14} />
              <span>Customize Solo</span>
            </button>
            <button
              type="button"
              className="tv-btn tv-btn-secondary tv-btn-sm"
              onClick={() => openPractice({ categoryId: 'mixed' })}
            >
              <GraduationCap size={14} />
              <span>Practice Mixed</span>
            </button>
            <button
              type="button"
              className="tv-btn tv-btn-ghost tv-btn-sm"
              onClick={() => setPage('multiplayer')}
            >
              <Globe size={14} />
              <span>Multiplayer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Geography Spotlight */}
      <section className="tv-section">
        <div className="tv-section-head">
          <div>
            <p className="tv-section-eyebrow">FEATURED PRACTICE TRACK</p>
            <h2>Geography Studio</h2>
            <p className="tv-section-sub">
              Drill flags, world capitals, iconic landmarks, mountain &amp; river extremes, all 50 US states, and world borders.
            </p>
          </div>
          <div className="tv-section-actions">
            <button
              type="button"
              className="tv-btn tv-btn-secondary"
              onClick={() => openSoloWithQuiz(CATEGORY_MIX_IDS.geography)}
            >
              <Zap size={15} />
              <span>Solo Geography Mix</span>
            </button>
            <button
              type="button"
              className="tv-btn tv-btn-primary"
              onClick={() => openPractice({ categoryId: 'geography', quizId: 'geo-flags' })}
            >
              <span>Open Practice Studio</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="tv-geo-grid">
          {geoQuizzes.map((quiz) => {
            const doneCount = mastery[quiz.id]?.length ?? 0;
            const pct = Math.min(100, Math.round((doneCount / Math.max(1, quiz.estimatedCount)) * 100));
            return (
              <div key={quiz.id} className="tv-quiz-tile">
                <div className="tv-quiz-tile-top">
                  <span className="tv-quiz-icon">
                    <QuizIcon name={quiz.icon} size={19} />
                  </span>
                  <span className="tv-quiz-count">{quiz.estimatedCount} Qs</span>
                </div>

                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>

                {quiz.id === 'geo-flags' && (
                  <div className="tv-mini-flags" aria-hidden="true">
                    <CountryFlag code="JP" size="xs" />
                    <CountryFlag code="BR" size="xs" />
                    <CountryFlag code="CH" size="xs" />
                    <CountryFlag code="KE" size="xs" />
                    <CountryFlag code="IS" size="xs" />
                    <CountryFlag code="NP" size="xs" />
                  </div>
                )}

                <div className="tv-mastery-mini">
                  <div className="tv-mastery-bar">
                    <div className="tv-mastery-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span>{pct}% mastered</span>
                </div>

                <div className="tv-quiz-tile-actions">
                  <button
                    type="button"
                    className="tv-btn tv-btn-secondary tv-btn-sm"
                    onClick={() => openPractice({ categoryId: 'geography', quizId: quiz.id })}
                  >
                    <GraduationCap size={14} />
                    <span>Practice</span>
                  </button>
                  <button
                    type="button"
                    className="tv-btn tv-btn-ghost tv-btn-sm"
                    onClick={() => openSoloWithQuiz(quiz.id)}
                  >
                    <Zap size={14} />
                    <span>Timed Run</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* All Categories Explorer */}
      <section className="tv-section">
        <div className="tv-section-head">
          <div>
            <p className="tv-section-eyebrow">EXPLORE ALL TOPICS</p>
            <h2>
              {CATEGORIES.length} Categories · {QUIZZES.length} Specialized Quizzes
            </h2>
          </div>
          <div className="tv-section-actions">
            <button
              type="button"
              className="tv-btn tv-btn-secondary tv-btn-sm"
              onClick={() => openPractice({ categoryId: 'current-events', quizId: 'cur-weekly' })}
            >
              Current Events ({CURRENT_EVENTS_META.updatedAt}) →
            </button>
            <button
              type="button"
              className="tv-btn tv-btn-ghost tv-btn-sm"
              onClick={() => openPractice({ categoryId: 'history', quizId: 'hist-presidents' })}
            >
              US Presidents →
            </button>
            <button
              type="button"
              className="tv-btn tv-btn-ghost tv-btn-sm"
              onClick={() => openPractice({ categoryId: 'culture', quizId: 'cult-holidays' })}
            >
              Holidays →
            </button>
          </div>
        </div>

        <div className="tv-cat-strip">
          {CATEGORIES.map((cat) => {
            const quizzes = getQuizzesByCategory(cat.id);
            const totalQs = quizzes.reduce((acc, q) => acc + q.estimatedCount, 0);
            return (
              <button
                key={cat.id}
                type="button"
                className="tv-cat-card"
                style={{ '--cat-accent': cat.accent } as React.CSSProperties}
                onClick={() => openPractice({ categoryId: cat.id, quizId: quizzes[0]?.id })}
              >
                <div className="tv-cat-card-head">
                  <span className="tv-cat-dot" />
                  <span className="tv-cat-meta">
                    {quizzes.length} quizzes · {totalQs} Qs
                  </span>
                </div>
                <h3>{cat.title}</h3>
                <p>{cat.tagline}</p>
                <div className="tv-cat-tags">
                  {quizzes.slice(0, 3).map((q) => (
                    <span key={q.id}>{q.shortTitle}</span>
                  ))}
                  {quizzes.length > 3 && <span>+{quizzes.length - 3} more</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
};
