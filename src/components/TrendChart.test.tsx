import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendChart } from './TrendChart';
import { makeAttempt } from '../test/factories';

describe('TrendChart', () => {
  it('renders nothing with 0 attempts', () => {
    const { container } = render(<TrendChart attempts={[]} passPercent={65} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing with exactly 1 attempt', () => {
    const { container } = render(<TrendChart attempts={[makeAttempt()]} passPercent={65} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders an SVG chart with 2+ attempts', () => {
    const attempts = [
      makeAttempt({ percent: 70, passed: true }),
      makeAttempt({ percent: 55, passed: false }),
    ];
    const { container } = render(<TrendChart attempts={attempts} passPercent={65} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('shows the pass threshold label', () => {
    const attempts = [makeAttempt({ percent: 70 }), makeAttempt({ percent: 50 })];
    render(<TrendChart attempts={attempts} passPercent={65} />);
    expect(screen.getByText('65%')).toBeTruthy();
  });

  it('shows score trend heading with attempt count', () => {
    const attempts = [makeAttempt({ percent: 80 }), makeAttempt({ percent: 70 }), makeAttempt({ percent: 60 })];
    render(<TrendChart attempts={attempts} passPercent={65} />);
    expect(screen.getByText(/Score Trend \(last 3\)/)).toBeTruthy();
  });

  it('shows score labels for 10 or fewer attempts', () => {
    const attempts = [
      makeAttempt({ percent: 72.4, passed: true }),
      makeAttempt({ percent: 58.6, passed: false }),
    ];
    render(<TrendChart attempts={attempts} passPercent={65} />);
    expect(screen.getByText('72')).toBeTruthy();
    expect(screen.getByText('59')).toBeTruthy();
  });

  it('renders with 20 attempts (caps at 20)', () => {
    const attempts = Array.from({ length: 25 }, (_, i) =>
      makeAttempt({ percent: 60 + i, passed: i >= 5 })
    );
    const { container } = render(<TrendChart attempts={attempts} passPercent={65} />);
    // Should render chart (20 data points used, not 25)
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText(/last 20/)).toBeTruthy();
  });
});
