import { describe, it, expect } from 'vitest';
import { shuffle, selectQuestions, scoreQuestion, computeResult, getWeakChapters } from './exam';
import type { ChapterMeta, Attempt } from '../types';
import { makeQuestion, makeAttempt } from '../test/factories';

describe('shuffle', () => {
  it('returns same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it('contains same elements (multiset equality)', () => {
    const arr = [1, 2, 3, 4, 5];
    expect([...shuffle(arr)].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });
});

describe('selectQuestions', () => {
  it('returns all when count >= length', () => {
    const qs = [makeQuestion(), makeQuestion(), makeQuestion()];
    expect(selectQuestions(qs, 10)).toHaveLength(3);
  });

  it('returns exactly count when pool is larger', () => {
    const qs = Array.from({ length: 10 }, () => makeQuestion());
    expect(selectQuestions(qs, 5)).toHaveLength(5);
  });

  it('returns only items from input pool', () => {
    const qs = Array.from({ length: 10 }, () => makeQuestion());
    const ids = new Set(qs.map(q => q.id));
    selectQuestions(qs, 5).forEach(q => expect(ids.has(q.id)).toBe(true));
  });
});

describe('scoreQuestion', () => {
  it('returns full points for correct answer', () => {
    const q = makeQuestion({ points: 2, correct: ['a', 'b'] });
    expect(scoreQuestion(q, ['a', 'b'])).toBe(2);
  });

  it('is order-independent', () => {
    const q = makeQuestion({ points: 2, correct: ['a', 'b'] });
    expect(scoreQuestion(q, ['b', 'a'])).toBe(2);
  });

  it('returns 0 for partial selection', () => {
    const q = makeQuestion({ points: 2, correct: ['a', 'b'] });
    expect(scoreQuestion(q, ['a'])).toBe(0);
  });

  it('returns 0 for wrong answer', () => {
    const q = makeQuestion({ points: 1, correct: ['a'] });
    expect(scoreQuestion(q, ['b'])).toBe(0);
  });

  it('returns 0 for empty selection', () => {
    const q = makeQuestion({ points: 1, correct: ['a'] });
    expect(scoreQuestion(q, [])).toBe(0);
  });

  it('returns 0 for superset of correct', () => {
    const q = makeQuestion({ points: 1, correct: ['a'] });
    expect(scoreQuestion(q, ['a', 'b'])).toBe(0);
  });
});

describe('computeResult', () => {
  it('sums earned and available across questions', () => {
    const q1 = makeQuestion({ id: 'q1', points: 2, correct: ['a'], chapter: 1 });
    const q2 = makeQuestion({ id: 'q2', points: 3, correct: ['b'], chapter: 1 });
    const answers = [
      { questionId: 'q1', selected: ['a'] },
      { questionId: 'q2', selected: ['b'] },
    ];
    const r = computeResult([q1, q2], answers, 'full', undefined, 300, 65);
    expect(r.earned).toBe(5);
    expect(r.available).toBe(5);
  });

  it('passes when percent >= passPercent', () => {
    const q = makeQuestion({ id: 'q1', points: 1, correct: ['a'] });
    const r = computeResult([q], [{ questionId: 'q1', selected: ['a'] }], 'full', undefined, 0, 65);
    expect(r.passed).toBe(true);
    expect(r.percent).toBe(100);
  });

  it('fails when percent < passPercent', () => {
    const q = makeQuestion({ id: 'q1', points: 1, correct: ['a'] });
    const r = computeResult([q], [{ questionId: 'q1', selected: ['b'] }], 'full', undefined, 0, 65);
    expect(r.passed).toBe(false);
    expect(r.percent).toBe(0);
  });

  it('passes at the exact boundary (percent === passPercent)', () => {
    const q1 = makeQuestion({ id: 'q1', points: 65, correct: ['a'], chapter: 1 });
    const q2 = makeQuestion({ id: 'q2', points: 35, correct: ['a'], chapter: 1 });
    const r = computeResult(
      [q1, q2],
      [{ questionId: 'q1', selected: ['a'] }, { questionId: 'q2', selected: ['b'] }],
      'full', undefined, 0, 65
    );
    expect(r.percent).toBe(65);
    expect(r.passed).toBe(true);
  });

  it('returns percent 0 with no questions (no divide-by-zero)', () => {
    const r = computeResult([], [], 'full', undefined, 0, 65);
    expect(r.percent).toBe(0);
    expect(r.passed).toBe(false);
  });

  it('builds chapterBreakdown per chapter', () => {
    const q1 = makeQuestion({ id: 'q1', chapter: 1, points: 2, correct: ['a'] });
    const q2 = makeQuestion({ id: 'q2', chapter: 2, points: 3, correct: ['a'] });
    const r = computeResult(
      [q1, q2],
      [{ questionId: 'q1', selected: ['a'] }, { questionId: 'q2', selected: ['b'] }],
      'full', undefined, 0, 65
    );
    expect(r.chapterBreakdown).toHaveLength(2);
    const ch1 = r.chapterBreakdown.find(b => b.chapterId === 1);
    expect(ch1?.earned).toBe(2);
    expect(ch1?.available).toBe(2);
  });

  it('id is truthy and date is a valid ISO string', () => {
    const r = computeResult([], [], 'full', undefined, 0, 65);
    expect(r.id).toBeTruthy();
    expect(new Date(r.date).toISOString()).toBe(r.date);
  });
});

describe('getWeakChapters', () => {
  const chapters: ChapterMeta[] = [
    { id: 1, title: 'Ch1', examQuestions: 5, points: 5 },
    { id: 2, title: 'Ch2', examQuestions: 5, points: 5 },
  ];

  it('returns chapters below passPercent', () => {
    const attempts: Attempt[] = [
      makeAttempt({
        chapterBreakdown: [
          { chapterId: 1, earned: 40, available: 100 },
          { chapterId: 2, earned: 80, available: 100 },
        ],
      }),
    ];
    const result = getWeakChapters(attempts, chapters, 65);
    expect(result).toHaveLength(1);
    expect(result[0].chapterId).toBe(1);
  });

  it('sorts ascending by avgPercent', () => {
    const attempts: Attempt[] = [
      makeAttempt({
        chapterBreakdown: [
          { chapterId: 1, earned: 30, available: 100 },
          { chapterId: 2, earned: 50, available: 100 },
        ],
      }),
    ];
    const result = getWeakChapters(attempts, chapters, 65);
    expect(result).toHaveLength(2);
    expect(result[0].avgPercent).toBeLessThan(result[1].avgPercent);
  });

  it('returns empty array when no attempts', () => {
    expect(getWeakChapters([], chapters, 65)).toHaveLength(0);
  });

  it('respects lastN window — only considers first N attempts', () => {
    const attempts: Attempt[] = [
      makeAttempt({ chapterBreakdown: [{ chapterId: 1, earned: 80, available: 100 }] }),
      makeAttempt({ chapterBreakdown: [{ chapterId: 1, earned: 80, available: 100 }] }),
      makeAttempt({ chapterBreakdown: [{ chapterId: 1, earned: 20, available: 100 }] }),
    ];
    // lastN=2 → slices to first 2 attempts (both 80%) → avg=80% → not weak
    expect(getWeakChapters(attempts, [chapters[0]], 65, 2)).toHaveLength(0);
  });
});
