import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithUser } from '../test/renderWithUser';
import { ReviewScreen } from './ReviewScreen';
import { makeQuestion } from '../test/factories';
import type { ExamState } from '../hooks/useExam';

function makeExamState(overrides: Partial<ExamState> = {}): ExamState {
  return {
    mode: 'full',
    questions: [],
    currentIndex: 0,
    answers: [],
    flagged: [],
    remainingSeconds: null,
    view: 'review',
    result: null,
    ...overrides,
  };
}

describe('ReviewScreen', () => {
  it('shows stat labels', () => {
    render(<ReviewScreen examState={makeExamState()} onGoToQuestion={vi.fn()} onSubmit={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('Answered')).toBeTruthy();
    expect(screen.getByText('Unanswered')).toBeTruthy();
    expect(screen.getByText('Flagged')).toBeTruthy();
  });

  it('answered count reflects answered questions', () => {
    const q1 = makeQuestion({ id: 'q1' });
    const q2 = makeQuestion({ id: 'q2' });
    const examState = makeExamState({
      questions: [q1, q2],
      answers: [{ questionId: 'q1', selected: ['a'] }, { questionId: 'q2', selected: ['b'] }],
    });
    render(<ReviewScreen examState={examState} onGoToQuestion={vi.fn()} onSubmit={vi.fn()} onBack={vi.fn()} />);
    // 2 answered → "2" appears in answered count cell
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
  });

  it('lists unanswered question buttons; clicking calls onGoToQuestion with index', async () => {
    const q1 = makeQuestion({ id: 'q1' });
    const q2 = makeQuestion({ id: 'q2' });
    const onGoToQuestion = vi.fn();
    const { user } = renderWithUser(
      <ReviewScreen
        examState={makeExamState({ questions: [q1, q2], answers: [] })}
        onGoToQuestion={onGoToQuestion}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Q1' }));
    expect(onGoToQuestion).toHaveBeenCalledWith(0);
  });

  it('lists flagged question buttons; clicking calls onGoToQuestion with index', async () => {
    const q1 = makeQuestion({ id: 'q1' });
    const q2 = makeQuestion({ id: 'q2' });
    const onGoToQuestion = vi.fn();
    // q2 answered and flagged — only appears in flagged section
    const { user } = renderWithUser(
      <ReviewScreen
        examState={makeExamState({
          questions: [q1, q2],
          answers: [{ questionId: 'q1', selected: ['a'] }, { questionId: 'q2', selected: ['a'] }],
          flagged: ['q2'],
        })}
        onGoToQuestion={onGoToQuestion}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Q2' }));
    expect(onGoToQuestion).toHaveBeenCalledWith(1);
  });

  it('Submit Exam button calls onSubmit', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithUser(
      <ReviewScreen examState={makeExamState()} onGoToQuestion={vi.fn()} onSubmit={onSubmit} onBack={vi.fn()} />
    );
    await user.click(screen.getByRole('button', { name: 'Submit Exam' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Keep reviewing button calls onBack', async () => {
    const onBack = vi.fn();
    const { user } = renderWithUser(
      <ReviewScreen examState={makeExamState()} onGoToQuestion={vi.fn()} onSubmit={vi.fn()} onBack={onBack} />
    );
    await user.click(screen.getByRole('button', { name: 'Keep reviewing' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('back arrow button calls onBack', async () => {
    const onBack = vi.fn();
    const { user } = renderWithUser(
      <ReviewScreen examState={makeExamState()} onGoToQuestion={vi.fn()} onSubmit={vi.fn()} onBack={onBack} />
    );
    await user.click(screen.getByRole('button', { name: /Back to exam/ }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
