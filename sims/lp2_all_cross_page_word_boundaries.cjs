#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words, physicalLP2Page} = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const chunks = transcription.trimEnd().split('%').slice(0, 55);
assert.equal(chunks.length, 55, 'LP2 p0–p55 has 55 rune-bearing pages; p50 is image-only');

const records = [];
const pageRuneCounts = new Map();
const pageLineCounts = new Map();
let current = [];
let globalOffset = 0;

function finishWord() {
  if (!current.length) return;
  const pageIds = [...new Set(current.map(item => item.page))];
  if (pageIds.length > 1) {
    assert.equal(pageIds.length, 2, 'a carried word must span exactly two pages');
    const previous = current.filter(item => item.page === pageIds[0]);
    const next = current.filter(item => item.page === pageIds[1]);
    assert.equal(next[0].page, previous[0].page + 1, 'no carry may jump a physical page');
    const first = current[0];
    const last = current.at(-1);
    const leftFirst = previous[0];
    const leftLast = previous.at(-1);
    const rightFirst = next[0];
    const rightLast = next.at(-1);
    records.push({
      from_page: previous[0].page,
      to_page: next[0].page,
      previous_image: (previous[0].page + 17) + '.jpg',
      next_image: (next[0].page + 17) + '.jpg',
      word_runes: current.map(item => item.rune).join(''),
      word_translit: current.map(item => corpus.translit[runeIndex.get(item.rune)]).join(' '),
      previous_fragment: previous.map(item => item.rune).join(''),
      next_fragment: next.map(item => item.rune).join(''),
      previous_local_start: leftFirst.local,
      previous_local_end: leftLast.local,
      next_local_start: rightFirst.local,
      next_local_end: rightLast.local,
      previous_line: leftFirst.line,
      next_line: rightFirst.line,
      previous_line_rune_start: leftFirst.lineRune,
      previous_line_rune_end: leftLast.lineRune,
      next_line_rune_start: rightFirst.lineRune,
      next_line_rune_end: rightLast.lineRune,
      global_start: first.global,
      global_end: last.global,
      word_length: current.length,
      boundary_separator: 'none'
    });
  }
  current = [];
}

for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
  const page = physicalLP2Page(chunkIndex);
  let pageLocalOffset = 0;
  let runeLine = 0;
  for (const rawLine of chunks[chunkIndex].split(/\r?\n/u)) {
    const line = rawLine.replace(/\/\s*$/u, '').trim();
    if (!line) continue;
    if (line === '&' || line === '$') {
      finishWord();
      continue;
    }
    const lineRunes = [...line].filter(rune => runeSet.has(rune)).length;
    if (!lineRunes) {
      finishWord();
      continue;
    }
    runeLine++;
    let lineRuneOffset = 0;
    for (const rune of line) {
      if (runeSet.has(rune)) {
        current.push({
          rune, page, local: pageLocalOffset, line: runeLine,
          lineRune: lineRuneOffset, global: globalOffset
        });
        pageLocalOffset++;
        lineRuneOffset++;
        globalOffset++;
      } else if (rune === '/' || /\s/u.test(rune)) {
        // A printed line wrap is layout, not a word delimiter.
      } else {
        finishWord();
      }
    }
  }
  pageRuneCounts.set(page, pageLocalOffset);
  pageLineCounts.set(page, runeLine);
  const expected = corpus.pages.find(item => item.page === page).runic_count;
  assert.equal(pageLocalOffset, expected, 'page rune count p' + page);
}
// Deliberately do not finishWord() at a page boundary: only printed separators end words.
finishWord();

assert.equal(globalOffset, 12956);
assert.equal(records.length, 32);
assert.equal(corpus.pages.find(item => item.page === 50).runic_count, 0);
for (const record of records) {
  assert.equal(record.to_page, record.from_page + 1);
  assert.equal(record.previous_local_end, pageRuneCounts.get(record.from_page) - 1);
  assert.equal(record.next_local_start, 0);
  assert.equal(record.previous_line, pageLineCounts.get(record.from_page));
  assert.equal(record.next_line, 1);
}
const canonical = parseLP2Words(transcription, 55);
assert.equal(canonical.runeCount, globalOffset);
assert.equal(canonical.crossPageWords, records.length);
assert.deepEqual(
  records.map(record => record.word_runes),
  canonical.words.filter(word => word.startPage !== word.endPage).map(word => word.runes)
);

const lineDistribution = {};
for (const record of records) {
  lineDistribution[record.previous_line] = (lineDistribution[record.previous_line] || 0) + 1;
}
const lengths = records.map(record => record.word_length);
const summary = {
  rune_count: globalOffset,
  rune_bearing_pages: 55,
  rune_bearing_page_transitions: 54,
  cross_page_words: records.length,
  word_delimited_transitions: 22,
  p50_rune_count: 0,
  word_length_range: [Math.min(...lengths), Math.max(...lengths)],
  previous_rune_line_distribution: lineDistribution,
  offsets: 'zero-based; line numbers are one-based rune-bearing lines; line-rune offsets are zero-based',
  note: 'The script derives text offsets from the canonical transcription; visual ink/color assessment is documented separately.'
};
const output = {summary, records};

if (process.argv.includes('--csv')) {
  const headers = [
    'from_page','to_page','previous_image','next_image','word_runes','word_translit',
    'previous_fragment','next_fragment','previous_local_start','previous_local_end',
    'next_local_start','next_local_end','previous_line','next_line',
    'previous_line_rune_start','previous_line_rune_end','next_line_rune_start',
    'next_line_rune_end','global_start','global_end','word_length','boundary_separator'
  ];
  const escape = value => {
    const text = String(value ?? '');
    return /[,"\r\n]/u.test(text) ? '"' + text.replace(/"/gu, '""') + '"' : text;
  };
  process.stdout.write([
    headers.join(','),
    ...records.map(record => headers.map(header => escape(record[header])).join(','))
  ].join('\n') + '\n');
} else {
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}
