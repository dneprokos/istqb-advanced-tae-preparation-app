const SEPARATOR_ROW = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/;

export type QuestionTextBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

export function parseQuestionBlocks(text: string): QuestionTextBlock[] {
  return text.split(/\n\s*\n/).map(raw => {
    const lines = raw.split('\n');
    if (lines.length >= 2 && lines[0].includes('|') && SEPARATOR_ROW.test(lines[1].trim())) {
      return {
        type: 'table',
        headers: splitRow(lines[0]),
        rows: lines.slice(2).filter(line => line.trim().length > 0).map(splitRow),
      };
    }
    return { type: 'paragraph', content: raw };
  });
}
