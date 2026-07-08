import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionText } from './QuestionText';

const tableText =
  'You have done the following tool comparison:\n\n' +
  '| Criteria | Tool A | Tool B | Tool C | Tool D |\n' +
  '|---|---|---|---|---|\n' +
  '| Record/Playback | O | O | O | X |\n' +
  '| Integrates CI/CD | O | P | P | O |\n' +
  '| API automation | O | X | P | O |\n' +
  '| Mobile capability | X | O | O | P |\n' +
  '| Source | COTS | COTS | Open Source | Open Source |\n\n' +
  'O = out of the box functionality, P = functionality can be implemented with programming, X = functionality is not available\n\n' +
  'Which is the best tool for your organization?';

describe('QuestionText', () => {
  it('renders plain text unchanged', () => {
    render(<QuestionText text="What is testing?" />);
    expect(screen.getByText('What is testing?')).toBeTruthy();
  });

  it('renders a valid pipe table as a table with headers and rows', () => {
    render(<QuestionText text={tableText} />);
    const table = screen.getByRole('table');
    expect(table).toBeTruthy();
    ['Criteria', 'Tool A', 'Tool B', 'Tool C', 'Tool D'].forEach(h => {
      expect(screen.getByRole('columnheader', { name: h })).toBeTruthy();
    });
    const mobileRow = screen.getByText('Mobile capability').closest('tr')!;
    const cells = Array.from(mobileRow.querySelectorAll('td')).map(td => td.textContent);
    expect(cells).toEqual(['Mobile capability', 'X', 'O', 'O', 'P']);
  });

  it('renders surrounding paragraphs in order around the table', () => {
    render(<QuestionText text={tableText} />);
    expect(screen.getByText('You have done the following tool comparison:')).toBeTruthy();
    expect(screen.getByText('Which is the best tool for your organization?')).toBeTruthy();
  });

  it('falls back to plain paragraph rendering when a table-ish block has no valid separator row', () => {
    const notATable = 'Line one with | a pipe |\nLine two with | more pipes |';
    render(<QuestionText text={notATable} />);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText(notATable.replace(/\s+/g, ' '))).toBeTruthy();
  });

  it('applies the passed className to plain-text paragraph blocks', () => {
    render(<QuestionText text="Styled text" className="text-base font-medium" />);
    const p = screen.getByText('Styled text');
    expect(p.className).toContain('text-base');
    expect(p.className).toContain('font-medium');
  });
});
