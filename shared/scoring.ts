export interface ScoreResult {
  points: number;
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
}

/**
 * Kahoot/quiz-show inspired scoring:
 * - 500 base points for any correct answer
 * - Up to 500 speed bonus scaled by remaining time ratio
 * - +100 streak bonus per consecutive correct answer starting at streak 2 (capped at +400)
 */
export function calculateAnswerScore(params: {
  correct: boolean;
  responseMs: number;
  timeLimitMs: number;
  newStreak: number;
}): ScoreResult {
  if (!params.correct) {
    return { points: 0, basePoints: 0, speedBonus: 0, streakBonus: 0 };
  }

  const basePoints = 500;
  const clampedMs = Math.max(0, Math.min(params.responseMs, params.timeLimitMs));
  const remainingRatio = params.timeLimitMs > 0 ? Math.max(0, 1 - clampedMs / params.timeLimitMs) : 0.5;
  const speedBonus = Math.round(500 * remainingRatio);
  const streakBonus = params.newStreak >= 2 ? Math.min(400, (params.newStreak - 1) * 100) : 0;

  return {
    points: basePoints + speedBonus + streakBonus,
    basePoints,
    speedBonus,
    streakBonus,
  };
}

export function normalizeAnswerText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’`´.,!?()[\]-]/g, ' ')
    .replace(/\b(the|republic of|kingdom of|state of|city of|saint|st)\b/g, (m) =>
      m === 'st' || m === 'saint' ? 'st' : ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n];
}

/**
 * Checks a typed answer against accepted answers with accent-insensitivity
 * and gentle typo tolerance for longer answers (so "Reykjavik" or "Austrailia" still feels fair).
 */
export function isTypedAnswerCorrect(userInput: string, acceptedAnswers: string[]): boolean {
  const normInput = normalizeAnswerText(userInput);
  if (!normInput) return false;

  for (const candidate of acceptedAnswers) {
    const normCand = normalizeAnswerText(candidate);
    if (!normCand) continue;
    if (normInput === normCand) return true;

    // Allow 1 typo for 5-8 chars, 2 typos for 9+ chars (never allow typos on short codes like symbols/abbreviations)
    if (normCand.length >= 5) {
      const maxDist = normCand.length >= 9 ? 2 : 1;
      if (Math.abs(normInput.length - normCand.length) <= maxDist) {
        if (levenshtein(normInput, normCand) <= maxDist) {
          return true;
        }
      }
    }
  }

  return false;
}

/** Builds a progressive hint like "R _ _ _ _ _ _ _ k (9 letters)" */
export function buildAnswerHint(answer: string, revealLevel: number): string {
  const clean = answer.trim();
  if (!clean) return '';
  if (revealLevel <= 0) return '';

  const chars = [...clean];
  const letters = chars.filter((c) => /[A-Za-z0-9]/.test(c)).length;

  const masked = chars
    .map((ch, idx) => {
      if (!/[A-Za-z0-9]/.test(ch)) return ch;
      if (idx === 0) return ch;
      if (revealLevel >= 2 && idx === chars.length - 1) return ch;
      if (revealLevel >= 2 && idx > 0 && chars[idx - 1] === ' ') return ch;
      return '_';
    })
    .join('');

  return `${masked} (${letters} ${letters === 1 ? 'char' : 'chars'})`;
}

export function getPerformanceGrade(accuracyPercent: number): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  label: string;
} {
  if (accuracyPercent >= 95) return { grade: 'S', label: 'Grandmaster' };
  if (accuracyPercent >= 85) return { grade: 'A', label: 'Trivia Ace' };
  if (accuracyPercent >= 70) return { grade: 'B', label: 'Sharp Mind' };
  if (accuracyPercent >= 50) return { grade: 'C', label: 'Rising Contender' };
  return { grade: 'D', label: 'Warming Up' };
}
