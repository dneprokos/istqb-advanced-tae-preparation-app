import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';

describe('TimerDisplay', () => {
  it('formats m:ss under one hour', () => {
    render(<TimerDisplay seconds={125} />);
    expect(screen.getByText(/2:05/)).toBeTruthy();
  });

  it('formats h:mm:ss at exactly one hour', () => {
    render(<TimerDisplay seconds={3600} />);
    expect(screen.getByText(/1:00:00/)).toBeTruthy();
  });

  it('formats h:mm:ss over one hour', () => {
    render(<TimerDisplay seconds={5400} />);
    expect(screen.getByText(/1:30:00/)).toBeTruthy();
  });

  it('pads seconds to two digits', () => {
    render(<TimerDisplay seconds={65} />);
    expect(screen.getByText(/1:05/)).toBeTruthy();
  });

  it('pads minutes to two digits in h:mm:ss', () => {
    render(<TimerDisplay seconds={3665} />);
    expect(screen.getByText(/1:01:05/)).toBeTruthy();
  });

  it('applies warning style when seconds <= 300', () => {
    const { container } = render(<TimerDisplay seconds={300} />);
    expect(container.firstChild).not.toBeNull();
    expect((container.firstChild as HTMLElement).className).toContain('text-red-600');
  });

  it('applies normal style when seconds > 300', () => {
    const { container } = render(<TimerDisplay seconds={301} />);
    expect((container.firstChild as HTMLElement).className).toContain('text-gray-700');
  });

  it('applies warning style at 1 second', () => {
    const { container } = render(<TimerDisplay seconds={1} />);
    expect((container.firstChild as HTMLElement).className).toContain('text-red-600');
  });
});
