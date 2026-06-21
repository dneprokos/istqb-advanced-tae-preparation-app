import type { Question, Attempt, IndexData, ChapterMeta } from '../types';

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: `q-${Math.random().toString(36).slice(2, 9)}`,
    chapter: 1,
    section: '1.1',
    type: 'single',
    points: 1,
    text: 'Sample question text',
    options: [
      { id: 'a', text: 'Option A' },
      { id: 'b', text: 'Option B' },
      { id: 'c', text: 'Option C' },
    ],
    correct: ['a'],
    explanation: 'Sample explanation',
    reference: 'ISTQB',
    ...overrides,
  };
}

export function makeAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: `attempt-${Math.random().toString(36).slice(2, 9)}`,
    mode: 'full',
    date: '2024-01-01T00:00:00.000Z',
    durationSeconds: 3600,
    earned: 65,
    available: 100,
    percent: 65,
    passed: true,
    chapterBreakdown: [],
    ...overrides,
  };
}

export function makeChapterMeta(overrides: Partial<ChapterMeta> = {}): ChapterMeta {
  return {
    id: 1,
    title: 'Chapter 1',
    examQuestions: 5,
    points: 5,
    ...overrides,
  };
}

export function makeIndexData(overrides: Partial<IndexData> = {}): IndexData {
  return {
    chapters: [makeChapterMeta()],
    exam: {
      totalQuestions: 40,
      totalPoints: 66,
      durationMinutes: 90,
      passPercent: 65,
    },
    ...overrides,
  };
}
