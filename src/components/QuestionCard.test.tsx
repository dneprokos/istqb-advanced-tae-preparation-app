import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithUser } from '../test/renderWithUser';
import { QuestionCard } from './QuestionCard';
import { makeQuestion } from '../test/factories';

const singleQ = makeQuestion({
  id: 'q1',
  type: 'single',
  chapter: 1,
  section: '1.1',
  points: 2,
  text: 'What is testing?',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
  ],
  correct: ['a'],
});

const multiQ = makeQuestion({
  id: 'q2',
  type: 'multiple',
  selectCount: 2,
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
  ],
  correct: ['a', 'b'],
});

describe('QuestionCard', () => {
  it('renders question text', () => {
    render(<QuestionCard question={singleQ} selected={[]} isFlagged={false} onAnswer={vi.fn()} onToggleFlag={vi.fn()} />);
    expect(screen.getByText('What is testing?')).toBeTruthy();
  });

  it('renders chapter/section badge and points', () => {
    render(<QuestionCard question={singleQ} selected={[]} isFlagged={false} onAnswer={vi.fn()} onToggleFlag={vi.fn()} />);
    expect(screen.getByText(/Ch1/)).toBeTruthy();
    expect(screen.getByText(/2 pts/)).toBeTruthy();
  });

  it('shows Single answer badge for type single', () => {
    render(<QuestionCard question={singleQ} selected={[]} isFlagged={false} onAnswer={vi.fn()} onToggleFlag={vi.fn()} />);
    expect(screen.getByText('Single answer')).toBeTruthy();
  });

  it('shows Multiple answers badge with select count', () => {
    render(<QuestionCard question={multiQ} selected={[]} isFlagged={false} onAnswer={vi.fn()} onToggleFlag={vi.fn()} />);
    expect(screen.getByText(/Multiple answers/)).toBeTruthy();
    expect(screen.getByText(/select 2/)).toBeTruthy();
  });

  it('single: clicking an option calls onAnswer with that id', async () => {
    const onAnswer = vi.fn();
    const { user } = renderWithUser(
      <QuestionCard question={singleQ} selected={[]} isFlagged={false} onAnswer={onAnswer} onToggleFlag={vi.fn()} />
    );
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    expect(onAnswer).toHaveBeenCalledWith(['a']);
  });

  it('single: clicking another option replaces selection', async () => {
    const onAnswer = vi.fn();
    const { user } = renderWithUser(
      <QuestionCard question={singleQ} selected={['a']} isFlagged={false} onAnswer={onAnswer} onToggleFlag={vi.fn()} />
    );
    await user.click(screen.getByRole('button', { name: /Option B/ }));
    expect(onAnswer).toHaveBeenCalledWith(['b']);
  });

  it('multiple: clicking unselected option adds to selection', async () => {
    const onAnswer = vi.fn();
    const { user } = renderWithUser(
      <QuestionCard question={multiQ} selected={['a']} isFlagged={false} onAnswer={onAnswer} onToggleFlag={vi.fn()} />
    );
    await user.click(screen.getByRole('button', { name: /Option B/ }));
    expect(onAnswer).toHaveBeenCalledWith(['a', 'b']);
  });

  it('multiple: clicking selected option removes it', async () => {
    const onAnswer = vi.fn();
    const { user } = renderWithUser(
      <QuestionCard question={multiQ} selected={['a', 'b']} isFlagged={false} onAnswer={onAnswer} onToggleFlag={vi.fn()} />
    );
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    expect(onAnswer).toHaveBeenCalledWith(['b']);
  });

  it('multiple: cannot exceed selectCount', async () => {
    const onAnswer = vi.fn();
    const { user } = renderWithUser(
      <QuestionCard question={multiQ} selected={['a', 'b']} isFlagged={false} onAnswer={onAnswer} onToggleFlag={vi.fn()} />
    );
    await user.click(screen.getByRole('button', { name: /Option C/ }));
    expect(onAnswer).toHaveBeenCalledWith(['a', 'b']);
  });

  it('flag button calls onToggleFlag', async () => {
    const onToggleFlag = vi.fn();
    const { user } = renderWithUser(
      <QuestionCard question={singleQ} selected={[]} isFlagged={false} onAnswer={vi.fn()} onToggleFlag={onToggleFlag} />
    );
    await user.click(screen.getByTitle('Flag for review'));
    expect(onToggleFlag).toHaveBeenCalledTimes(1);
  });

  it('flag button title reflects unflagged state', () => {
    render(<QuestionCard question={singleQ} selected={[]} isFlagged={false} onAnswer={vi.fn()} onToggleFlag={vi.fn()} />);
    expect(screen.getByTitle('Flag for review')).toBeTruthy();
  });

  it('flag button title reflects flagged state', () => {
    render(<QuestionCard question={singleQ} selected={[]} isFlagged={true} onAnswer={vi.fn()} onToggleFlag={vi.fn()} />);
    expect(screen.getByTitle('Remove flag')).toBeTruthy();
  });
});
