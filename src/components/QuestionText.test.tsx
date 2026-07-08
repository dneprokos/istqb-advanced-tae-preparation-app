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

  const deploymentRiskText =
    'You are tasked with implementing a TAS for functional suitability tests that must be executed automatically after each daily build and integrated with the existing CI/CD pipeline. ' +
    'You need to match the following deployment risks with their appropriate mitigation strategies. ' +
    'Risks: 1. Test execution not triggered by the build. 2. Only the full test suite can be executed. 3. Test data unavailable when starting the test. 4. Difficulty in troubleshooting failed tests. ' +
    'Mitigations: A. Log detailed information during test execution. B. Integrate test automation into the CI/CD pipeline. C. Use third-party tools to generate test data. D. Utilize test harnesses and test fixtures. ' +
    'Which of the following BEST matches the deployment risks with their appropriate mitigation strategies?';

  const matchRoleText =
    'Match the list of tasks in the Test Automation Architecture Capabilities below with the correct role name. ' +
    '1. Mapping the abstract test cases to concrete test cases suitable for execution. ' +
    '2. Implementation of test cases and/or test suites. ' +
    '3. Test logging with detailed information about the test steps and actions. ' +
    '4. Mechanism for connecting to the SUT via protocols and services. ' +
    '(Roles: A. Test Definition, B. Test Adaptation, C. Test Generation, D. Test Execution)';

  it('renders a labeled numbered/lettered matching list as two columns with intro and outro preserved', () => {
    render(<QuestionText text={deploymentRiskText} />);
    expect(screen.getByText('Risks')).toBeTruthy();
    expect(screen.getByText('Mitigations')).toBeTruthy();
    expect(screen.getByText('Test execution not triggered by the build')).toBeTruthy();
    expect(screen.getByText('Utilize test harnesses and test fixtures')).toBeTruthy();
    expect(screen.getByText(/You are tasked with implementing a TAS/)).toBeTruthy();
    expect(screen.getByText(/Which of the following BEST matches/)).toBeTruthy();
  });

  it('renders an unlabeled numbered list alongside a parenthesized labeled lettered list', () => {
    render(<QuestionText text={matchRoleText} />);
    expect(screen.queryByText('Roles')).toBeTruthy();
    expect(screen.getByText('Mapping the abstract test cases to concrete test cases suitable for execution')).toBeTruthy();
    expect(screen.getByText('Test Execution')).toBeTruthy();
    expect(screen.getByText(/Match the list of tasks/)).toBeTruthy();
    // no leftover parens/label text bleeding into an outro paragraph
    expect(screen.queryByText(/\(Roles/)).toBeNull();
  });

  it('still renders the pipe-table text as a table, not a matching list', () => {
    render(<QuestionText text={tableText} />);
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.queryByText('Risks')).toBeNull();
  });

  it('falls back to plain paragraph when numbered/lettered markers do not form a clean matching list', () => {
    const notMatching = 'See section 1. Also refer to appendix A. for details.';
    render(<QuestionText text={notMatching} />);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText(notMatching)).toBeTruthy();
  });
});
