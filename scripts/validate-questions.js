#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
  } catch (e) {
    console.error(`Failed to read ${file}: ${e.message}`);
    process.exit(1);
  }
}

console.log('\n=== ISTQB TAE Question Bank Validation ===\n');

const index = readJson('index.json');
check('index.json has chapters array', Array.isArray(index.chapters));
check('index.json has exam config', typeof index.exam === 'object');

const allIds = new Set();
let globalDuplicates = [];

for (const chapter of index.chapters) {
  const file = `chapter-${chapter.id}.json`;
  console.log(`\n[Chapter ${chapter.id}: ${chapter.title}]`);

  let questions;
  try {
    questions = readJson(file);
  } catch {
    check(`${file} is readable`, false);
    continue;
  }

  check(`${file} is an array`, Array.isArray(questions));
  check(
    `has at least ${chapter.examQuestions} questions (min required)`,
    questions.length >= chapter.examQuestions,
    `found ${questions.length}`
  );

  const pointValues = [...new Set(questions.map(q => q.points))];
  check(
    'all questions have same point value (random selection guarantee)',
    pointValues.length === 1,
    pointValues.length > 1 ? `multiple point values: ${pointValues.join(', ')}` : ''
  );

  for (const q of questions) {
    const optionIds = new Set(q.options.map(o => o.id));

    if (allIds.has(q.id)) {
      globalDuplicates.push(q.id);
    }
    allIds.add(q.id);

    const correctExistInOptions = q.correct.every(c => optionIds.has(c));
    check(
      `${q.id}: correct options exist in options array`,
      correctExistInOptions,
      !correctExistInOptions ? `missing: ${q.correct.filter(c => !optionIds.has(c)).join(', ')}` : ''
    );

    if (q.type === 'single') {
      check(`${q.id}: single type has exactly 1 correct`, q.correct.length === 1, `found ${q.correct.length}`);
    } else if (q.type === 'multiple') {
      check(`${q.id}: multiple type has ≥2 correct`, q.correct.length >= 2, `found ${q.correct.length}`);
    } else {
      check(`${q.id}: type is 'single' or 'multiple'`, false, `found '${q.type}'`);
    }
  }
}

console.log('\n[Global Checks]');
check('no duplicate question IDs across all chapters', globalDuplicates.length === 0, globalDuplicates.join(', '));

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
