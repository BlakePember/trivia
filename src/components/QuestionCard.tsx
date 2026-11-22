import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Eye,
  Lightbulb,
  Send,
  XCircle,
} from 'lucide-react';
import type { PublicTriviaQuestion } from '../../shared/types';
import { buildAnswerHint } from '../../shared/scoring';
import { CountryFlag } from './CountryFlag';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  question: PublicTriviaQuestion;
  questionNumber: number;
  totalQuestions?: number;
  mode?: 'choice' | 'type';
  selectedIndex: number | null;
  locked?: boolean;
  revealed?: boolean;
  correctIndex?: number | null;
  correctText?: string;
  explanation?: string;
  optionCounts?: number[];
  typedFeedback?: {
    submittedText: string;
    isCorrect: boolean;
  } | null;
  pointsDelta?: number | null;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  onSelectOption?: (index: number) => void;
  onSubmitTyped?: (text: string) => void;
  onRevealTyped?: () => void;
  showKeyboardHints?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  mode = 'choice',
  selectedIndex,
  locked = false,
  revealed = false,
  correctIndex = null,
  correctText,
  explanation,
  optionCounts,
  typedFeedback,
  pointsDelta,
  bookmarked,
  onToggleBookmark,
  onSelectOption,
  onSubmitTyped,
  onRevealTyped,
  showKeyboardHints = true,
}) => {
  const [typedValue, setTypedValue] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isFlagGrid = question.options.some((o) => Boolean(o.flagCode));
  const useTypeIn = mode === 'type' && !isFlagGrid;

  useEffect(() => {
    setTypedValue('');
    setHintLevel(0);
    if (useTypeIn && !revealed) {
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [question.id, useTypeIn, revealed]);

  const totalVotes = optionCounts ? optionCounts.reduce((a, b) => a + b, 0) : 0;
  const hintText =
    useTypeIn && correctText && hintLevel > 0 ? buildAnswerHint(correctText, hintLevel) : '';

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedValue.trim() || revealed || locked) return;
    onSubmitTyped?.(typedValue.trim());
  };

  return (
    <div className="tv-qcard">
      <div className="tv-qcard-meta">
        <div className="tv-qcard-badges">
          <span className="tv-pill-soft">
            {totalQuestions ? `Q ${questionNumber} / ${totalQuestions}` : `Q #${questionNumber}`}
          </span>
          <span className="tv-pill-accent">{question.promptLabel}</span>
          <span className={`tv-diff-tag diff-${question.difficulty}`}>{question.difficulty}</span>
        </div>

        <div className="tv-qcard-meta-right">
          {pointsDelta !== undefined && pointsDelta !== null && pointsDelta > 0 && (
            <span className="tv-points-pop">+{pointsDelta.toLocaleString()} pts</span>
          )}
          {onToggleBookmark && (
            <button
              type="button"
              className={`tv-bookmark-btn ${bookmarked ? 'active' : ''}`}
              onClick={onToggleBookmark}
              title={bookmarked ? 'Remove from saved study list' : 'Bookmark question to study later'}
              aria-label="Bookmark question"
            >
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {question.media && (
        <div className="tv-qcard-media">
          {question.media.type === 'flag' && (
            <CountryFlag code={question.media.countryCode} size="xl" />
          )}

          {question.media.type === 'element' && (
            <div className="tv-element-tile">
              <span className="tv-element-num">{question.media.atomicNumber}</span>
              <span className="tv-element-sym">{question.media.symbol}</span>
              <span className="tv-element-group">{question.media.group}</span>
            </div>
          )}

          {question.media.type === 'badge' && (
            <div className="tv-info-emblem">
              <span className="tv-info-emblem-eyebrow">{question.media.eyebrow}</span>
              <span className="tv-info-emblem-val">{question.media.value}</span>
              {question.media.subvalue && (
                <span className="tv-info-emblem-sub">{question.media.subvalue}</span>
              )}
            </div>
          )}
        </div>
      )}

      <h2 className="tv-qcard-prompt">{question.prompt}</h2>

      {useTypeIn ? (
        <div className="tv-type-area">
          <form className="tv-type-form" onSubmit={handleTypeSubmit}>
            <input
              ref={inputRef}
              type="text"
              className={`tv-type-input ${
                typedFeedback
                  ? typedFeedback.isCorrect
                    ? 'correct'
                    : 'wrong'
                  : ''
              }`}
              placeholder="Type your answer and press Enter..."
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              disabled={revealed || locked}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="tv-btn tv-btn-primary"
              disabled={!typedValue.trim() || revealed || locked}
            >
              <Send size={15} />
              <span>Check</span>
            </button>
          </form>

          {!revealed && (
            <div className="tv-type-helpers">
              <button
                type="button"
                className="tv-btn tv-btn-ghost tv-btn-sm"
                onClick={() => setHintLevel((h) => Math.min(2, h + 1))}
                disabled={hintLevel >= 2}
              >
                <Lightbulb size={14} />
                <span>{hintLevel === 0 ? 'Show Hint' : 'Stronger Hint'}</span>
              </button>

              {onRevealTyped && (
                <button
                  type="button"
                  className="tv-btn tv-btn-ghost tv-btn-sm"
                  onClick={onRevealTyped}
                >
                  <Eye size={14} />
                  <span>Reveal Answer</span>
                </button>
              )}

              {hintText && <span className="tv-hint-chip">{hintText}</span>}
            </div>
          )}

          {revealed && typedFeedback && (
            <div className={`tv-typed-result ${typedFeedback.isCorrect ? 'correct' : 'wrong'}`}>
              {typedFeedback.isCorrect ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>
                    Spot on! <strong>{correctText}</strong>
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>
                    {typedFeedback.submittedText
                      ? `You typed "${typedFeedback.submittedText}" — `
                      : ''}
                    Correct answer: <strong>{correctText}</strong>
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={`tv-options-grid ${isFlagGrid ? 'flag-grid' : ''}`}>
          {question.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = revealed && correctIndex === idx;
            const isWrongSelection = revealed && isSelected && correctIndex !== idx;
            const isMuted = revealed && !isCorrect && !isSelected;
            const votes = optionCounts?.[idx] ?? 0;
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

            return (
              <button
                key={idx}
                type="button"
                disabled={locked || revealed}
                onClick={() => onSelectOption?.(idx)}
                className={[
                  'tv-option-btn',
                  isFlagGrid ? 'flag-option' : '',
                  isSelected && !revealed ? 'selected' : '',
                  isCorrect ? 'correct' : '',
                  isWrongSelection ? 'wrong' : '',
                  isMuted ? 'dimmed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {revealed && optionCounts && totalVotes > 0 && (
                  <span className="tv-option-bar" style={{ width: `${pct}%` }} aria-hidden="true" />
                )}

                <span className="tv-option-key">
                  {showKeyboardHints && !revealed && !locked ? idx + 1 : OPTION_KEYS[idx]}
                </span>

                {opt.flagCode ? (
                  <div className="tv-option-flag-wrap">
                    <CountryFlag code={opt.flagCode} size="md" />
                    {revealed && <span className="tv-option-flag-label">{opt.text}</span>}
                  </div>
                ) : (
                  <div className="tv-option-copy">
                    <span className="tv-option-text">{opt.text}</span>
                    {opt.sublabel && <span className="tv-option-sub">{opt.sublabel}</span>}
                  </div>
                )}

                <span className="tv-option-status">
                  {isCorrect && <CheckCircle2 size={18} />}
                  {isWrongSelection && <XCircle size={18} />}
                  {revealed && optionCounts && totalVotes > 0 && (
                    <span className="tv-option-votes">{votes}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {revealed && explanation && (
        <div className="tv-explanation-box">
          <div className="tv-explanation-head">
            <Lightbulb size={15} />
            <span>Did you know?</span>
          </div>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
};
