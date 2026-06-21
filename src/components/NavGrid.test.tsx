import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavGrid } from './NavGrid';
import { makeQuestion } from '../test/factories';
import type { AttemptAnswer } from '../types';

const q1 = makeQuestion({ id: 'q1' });
const q2 = makeQuestion({ id: 'q2' });
const q3 = makeQuestion({ id: 'q3' });
const questions = [q1, q2, q3];

describe('NavGrid', () => {
  it('renders one button per question labelled 1..n', () => {
    render(<NavGrid questions={questions} answers={[]} flagged={[]} currentIndex={0} onGoTo={vi.fn()} />);
    expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '3' })).toBeTruthy();
  });

  it('clicking a cell calls onGoTo with correct index', async () => {
    const onGoTo = vi.fn();
    const user = userEvent.setup();
    render(<NavGrid questions={questions} answers={[]} flagged={[]} currentIndex={0} onGoTo={onGoTo} />);
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onGoTo).toHaveBeenCalledWith(1);
  });

  it('current index gets blue class', () => {
    render(<NavGrid questions={questions} answers={[]} flagged={[]} currentIndex={1} onGoTo={vi.fn()} />);
    expect(screen.getByRole('button', { name: '2' }).className).toContain('bg-blue-600');
  });

  it('answered question gets green class', () => {
    const answers: AttemptAnswer[] = [{ questionId: 'q2', selected: ['a'] }];
    render(<NavGrid questions={questions} answers={answers} flagged={[]} currentIndex={0} onGoTo={vi.fn()} />);
    expect(screen.getByRole('button', { name: '2' }).className).toContain('bg-green-500');
  });

  it('flagged question gets amber class', () => {
    render(<NavGrid questions={questions} answers={[]} flagged={['q3']} currentIndex={0} onGoTo={vi.fn()} />);
    expect(screen.getByRole('button', { name: '3' }).className).toContain('bg-amber-400');
  });

  it('current takes priority over flagged', () => {
    render(<NavGrid questions={questions} answers={[]} flagged={['q1']} currentIndex={0} onGoTo={vi.fn()} />);
    expect(screen.getByRole('button', { name: '1' }).className).toContain('bg-blue-600');
  });

  it('unanswered question has no background color class', () => {
    render(<NavGrid questions={questions} answers={[]} flagged={[]} currentIndex={0} onGoTo={vi.fn()} />);
    const btn2 = screen.getByRole('button', { name: '2' });
    expect(btn2.className).not.toContain('bg-');
  });
});
