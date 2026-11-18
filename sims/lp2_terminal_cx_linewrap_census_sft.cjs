'use strict';

/**
 * Source-only census for repeated line-wrap continuation fragments in unknown LP2.
 * Tests the residual p34/p55 CX layout link after canonical word-boundary correction.
 *
 * Run:
 *   node sims/lp2_terminal_cx_linewrap_census_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const unknown = source.split('%').slice(0, 55).join('%');
const physicalPage = (page) => page >= 50 ? page + 1 : page;

const words = [];
let word = null;
let rawPage = 0;
let line = 1;
let runeOffset = 0;

function beginWord() {
  if (!word) word = {indices: [], segments: [], startRune: runeOffset};
}

function currentSegment() {
  beginWord();
  const page = physicalPage(rawPage);
  const previous = word.segments.at(-1);
  if (previous && previous.page === page && previous.line === line) return previous;
  const segment = {page, line, indices: []};
  word.segments.push(segment);
  return segment;
}

function finishWord() {
  if (!word) return;
  word.endRune = runeOffset;
  word.runes = word.indices.map((index) => corpus.runes[index]).join('');
  word.translit = word.indices.map((index) => corpus.translit[index]).join('');
  for (const segment of word.segments) {
    segment.runes = segment.indices.map((index) => corpus.runes[index]).join('');
    segment.translit = segment.indices.map((index) => corpus.translit[index]).join('');
  }
  word.index = words.length;
  words.push(word);
  word = null;
}

for (const char of unknown) {
  if (alphabet.has(char)) {
    const index = alphabet.get(char);
    beginWord();
    currentSegment().indices.push(index);
    word.indices.push(index);
    runeOffset++;
  } else if (char === '%') {
    rawPage++;
    line = 1;
  } else if (char === '/') {
    line++;
  } else if (/\s/u.test(char)) {
    // Physical wrapping is retained in segments but does not end a word.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(runeOffset, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter((entry) =>
  entry.segments.some((segment, i) =>
    i > 0 && segment.page !== entry.segments[i - 1].page)).length, 32);

const lineContinuations = [];
for (const entry of words) {
  for (let i = 1; i < entry.segments.length; i++) {
    const previous = entry.segments[i - 1];
    const segment = entry.segments[i];
    if (segment.page !== previous.page) continue;
    lineContinuations.push({
      wordIndex: entry.index,
      word: entry.translit,
      page: segment.page,
      line: segment.line,
      previousLine: previous.line,
      runes: segment.runes,
      translit: segment.translit,
      length: segment.indices.length
    });
  }
}
assert.equal(lineContinuations.length, 388);

const twoRune = lineContinuations.filter((event) => event.length === 2);
assert.equal(twoRune.length, 74);

const counts = new Map();
for (const event of twoRune) {
  counts.set(event.runes, (counts.get(event.runes) || 0) + 1);
}
assert.equal(counts.size, 70);

const repeated = [...counts.entries()]
  .filter(([, count]) => count >= 2)
  .sort((a, b) => {
    const at = [...a[0]].map((rune) =>
      corpus.translit[corpus.runes.indexOf(rune)]).join('');
    const bt = [...b[0]].map((rune) =>
      corpus.translit[corpus.runes.indexOf(rune)]).join('');
    return at.localeCompare(bt);
  });

const repeatedSummary = repeated.map(([runes, count]) => ({
  translit: [...runes].map(
    (rune) => corpus.translit[corpus.runes.indexOf(rune)]).join(''),
  count,
  pages: twoRune.filter((event) => event.runes === runes)
    .map((event) => event.page)
}));
assert.deepEqual(repeatedSummary, [
  {translit: 'CX', count: 2, pages: [34, 55]},
  {translit: 'EAA', count: 2, pages: [17, 37]},
  {translit: 'SX', count: 2, pages: [20, 42]},
  {translit: 'TNG', count: 2, pages: [39, 40]}
]);

const cx = twoRune.filter((event) => event.translit === 'CX');
assert.deepEqual(cx.map((event) => ({
  page: event.page,
  line: event.line,
  previousLine: event.previousLine,
  word: event.word
})), [
  {page: 34, line: 10, previousLine: 9, word: 'BGCX'},
  {page: 55, line: 4, previousLine: 3, word: 'CEAIMCX'}
]);

assert.equal(twoRune.filter((event) => counts.get(event.runes) >= 2).length, 8);

console.log('CANONICAL WORDS: 2,896; WITHIN-PAGE LINE CONTINUATIONS: 388');
console.log('TWO-RUNE CONTINUATIONS: 74 events, 70 distinct types');
console.log('REPEATED TWO-RUNE TYPES: CX, EAA, SX, TNG; each occurs exactly twice');
console.log('CX EVENTS: p34 BGCX line9->10; p55 CEAIMCX line3->4');
console.log('REPEATED-TYPE EVENTS: 8/74 two-rune continuation events');
console.log('VERDICT: CX is a real repeated wrap fragment but is not unique in its source-visible class');
