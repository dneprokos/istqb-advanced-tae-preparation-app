const SEPARATOR_ROW = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/;

export type QuestionTextBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | {
      type: 'matching-list';
      left: { label: string | null; items: string[] };
      right: { label: string | null; items: string[] };
    };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

interface Marker {
  value: number;
  markerStart: number; // index of the marker character itself (the digit or letter)
  itemStart: number; // index where this item's text begins
}

function findMarkers(raw: string, fromIndex: number, kind: 'digit' | 'letter'): Marker[] {
  const markerRe = kind === 'digit' ? /(?:^|[\s(])(\d+)\.\s+/g : /(?:^|[\s(])([A-Z])\.\s+/g;
  markerRe.lastIndex = fromIndex;
  const matches: Marker[] = [];
  let m: RegExpExecArray | null;
  while ((m = markerRe.exec(raw))) {
    const value = kind === 'digit' ? parseInt(m[1], 10) : m[1].charCodeAt(0) - 64;
    matches.push({ value, markerStart: m.index + m[0].indexOf(m[1]), itemStart: m.index + m[0].length });
    markerRe.lastIndex = m.index + m[0].indexOf(m[1]) + 1;
  }
  return matches;
}

/** Longest run of markers with strictly consecutive values starting at 1. */
function longestConsecutiveRun(matches: Marker[]): Marker[] | null {
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].value !== 1) continue;
    let end = i;
    while (end + 1 < matches.length && matches[end + 1].value === matches[end].value + 1) {
      end++;
    }
    return end > i ? matches.slice(i, end + 1) : null;
  }
  return null;
}

function cleanItemText(text: string): string {
  return text.trim().replace(/[.,)]+$/, '').trim();
}

function extractLabel(raw: string, beforeIndex: number): { label: string | null; introEnd: number } {
  const prefix = raw.slice(0, beforeIndex);
  const labelMatch = prefix.match(/\(?\s*([A-Za-z][A-Za-z ]{0,40}):\s*$/);
  if (labelMatch) {
    return { label: labelMatch[1].trim(), introEnd: beforeIndex - labelMatch[0].length };
  }
  return { label: null, introEnd: beforeIndex };
}

/** Text for every item except the last, which is bounded by the next marker. */
function boundedItems(raw: string, run: Marker[]): string[] {
  return run.slice(0, -1).map((marker, i) => cleanItemText(raw.slice(marker.itemStart, run[i + 1].markerStart)));
}

function tryParseMatchingList(raw: string): {
  intro: string;
  left: { label: string | null; items: string[] };
  right: { label: string | null; items: string[] };
  outro: string;
} | null {
  const numberedRun = longestConsecutiveRun(findMarkers(raw, 0, 'digit'));
  if (!numberedRun || numberedRun.length < 2) return null;

  const letterRun = longestConsecutiveRun(findMarkers(raw, numberedRun[numberedRun.length - 1].itemStart, 'letter'));
  if (!letterRun || letterRun.length < 2) return null;
  if (letterRun[0].markerStart <= numberedRun[numberedRun.length - 1].markerStart) return null;

  const { label: leftLabel, introEnd } = extractLabel(raw, numberedRun[0].markerStart);
  const { label: rightLabel, introEnd: numberedHardEnd } = extractLabel(raw, letterRun[0].markerStart);

  const lastNumberedItem = numberedRun[numberedRun.length - 1];
  const leftItems = [
    ...boundedItems(raw, numberedRun),
    cleanItemText(raw.slice(lastNumberedItem.itemStart, numberedHardEnd)),
  ];

  const lastLetterItem = letterRun[letterRun.length - 1];
  const delimiterMatch = raw.slice(lastLetterItem.itemStart).match(/[.,)]/);
  const delimiterIndex = delimiterMatch
    ? lastLetterItem.itemStart + delimiterMatch.index!
    : raw.length;
  const rightItems = [
    ...boundedItems(raw, letterRun),
    cleanItemText(raw.slice(lastLetterItem.itemStart, delimiterIndex)),
  ];

  const intro = raw.slice(0, introEnd).trim();
  const outro = raw.slice(delimiterIndex + 1).trim();

  return {
    intro,
    left: { label: leftLabel, items: leftItems },
    right: { label: rightLabel, items: rightItems },
    outro,
  };
}

export function parseQuestionBlocks(text: string): QuestionTextBlock[] {
  return text.split(/\n\s*\n/).flatMap((raw): QuestionTextBlock[] => {
    const lines = raw.split('\n');
    if (lines.length >= 2 && lines[0].includes('|') && SEPARATOR_ROW.test(lines[1].trim())) {
      return [
        {
          type: 'table',
          headers: splitRow(lines[0]),
          rows: lines.slice(2).filter(line => line.trim().length > 0).map(splitRow),
        },
      ];
    }

    const matching = tryParseMatchingList(raw);
    if (matching) {
      return [
        ...(matching.intro ? [{ type: 'paragraph', content: matching.intro } as const] : []),
        { type: 'matching-list', left: matching.left, right: matching.right } as const,
        ...(matching.outro ? [{ type: 'paragraph', content: matching.outro } as const] : []),
      ];
    }

    return [{ type: 'paragraph', content: raw }];
  });
}
