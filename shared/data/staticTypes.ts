import type { CategoryId, Continent, Difficulty } from '../types.js';

export interface StaticQuestionSeed {
  id: string;
  category: CategoryId;
  quizId: string;
  difficulty: Difficulty;
  region?: Continent;
  promptLabel: string;
  prompt: string;
  answer: string;
  aliases?: string[];
  distractors: [string, string, string];
  explanation: string;
  flagCode?: string;
  typeable?: boolean;
}
