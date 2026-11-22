'use strict';

/**
 * #1511 complete printed-word graph correction for the p55 terminal map claim.
 * Read-only CommonJS / Node 22 / standard library.
 *
 * Run:
 *   node sims/lp2_terminal_completeword_graph_sft.cjs
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
const unknownSource = source.split('%').slice(0, 55).join('%');
const words = [];
let fragment = [];
let rawPage = 0;
let line = 1;
let startRawPage = -1;
let endRawPage = -1;
let startLine = -1;
let endLine = -1;
let runeOffset = 0;
let startRune = -1;

const physicalPage = (page) => page >= 50 ? page + 1 : page;

function finishWord() {
  if (!fragment.length) return;
  words.push({
    indices: fragment,
    runes: fragment.map((index) => corpus.runes[index]).join(''),
    translit: fragment.map((index) => corpus.translit[index]).join(''),
    startPage: physicalPage(startRawPage),
    endPage: physicalPage(endRawPage),
    startLine,
    endLine,
    startRune,
    endRune: runeOffset
  });
  fragment = [];
}

for (const char of unknownSource) {
  if (alphabet.has(char)) {
    if (!fragment.length) {
      startRawPage = rawPage;
      startLine = line;
      startRune = runeOffset;
    }
    fragment.push(alphabet.get(char));
    endRawPage = rawPage;
    endLine = line;
    runeOffset++;
  } else if (char === '%') {
    rawPage++;
    line = 1;
  } else if (char === '/') {
    line++;
  } else if (/\s/u.test(char)) {
    // Physical line/page wrapping is not a printed-word delimiter.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(runeOffset, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter((word) => word.startPage !== word.endPage).length, 32);

const frequency = new Map();
const occurrences = new Map();
for (let i = 0; i < words.length; i++) {
  const word = words[i];
  frequency.set(word.runes, (frequency.get(word.runes) || 0) + 1);
  if (!occurrences.has(word.runes)) occurrences.set(word.runes, []);
  occurrences.get(word.runes).push(i);
}
assert.equal([...frequency.values()].filter((count) => count === 2).length, 90);

const CX = 'ᚳᛉ';
const DJU = 'ᛞᛄᚢ';
const BEI = 'ᛒᛖᛁ';

// There is no complete CX word anywhere in p0-p55.
assert.equal(frequency.get(CX) || 0, 0);

const terminal = words.slice(-3);
assert.deepEqual(terminal.map((word) => word.translit), ['CEAIMCX', 'DJU', 'BEI']);
assert.deepEqual(terminal.map((word) => frequency.get(word.runes)), [1, 2, 2]);
assert.deepEqual(
  terminal.map((word) => [word.startPage, word.startLine, word.endLine]),
  [[55, 3, 4], [55, 4, 4], [55, 4, 4]]
);

const spanning = terminal[0];
assert.equal(spanning.runes, 'ᚳᛠᛁᛗᚳᛉ');
assert.equal(spanning.startRune, 12944);
assert.equal(spanning.endRune, 12950);

// p54-p55 is the final 308 runes. The finite-prime exhaustion boundary is
// terminal offset300, therefore global rune boundary12948.
const terminalBoundary = 12956 - 308 + 300;
assert.equal(terminalBoundary, 12948);
assert.equal(terminalBoundary - spanning.startRune, 4);
assert.equal(spanning.endRune - terminalBoundary, 2);

// The earlier p34 line10 CX is also a continuation suffix, not a word.
const p34Span = words.find((word) =>
  word.startPage === 34 && word.startLine === 9 && word.endLine === 10 &&
  word.runes.endsWith(CX));
assert(p34Span);
assert.equal(p34Span.translit, 'BGCX');

// DJU and BEI are genuine repeated complete words and stay adjacent at p27.
assert.deepEqual(
  occurrences.get(DJU).map((index) => [words[index].startPage, words[index].startLine]),
  [[27, 2], [55, 4]]
);
assert.deepEqual(
  occurrences.get(BEI).map((index) => [words[index].startPage, words[index].startLine]),
  [[27, 2], [55, 4]]
);

// Complete three-word windows with every word frequency exactly2.
const allFreq2 = [];
for (let i = 0; i + 2 < words.length; i++) {
  const window = words.slice(i, i + 3);
  if (window.every((word) => frequency.get(word.runes) === 2)) {
    allFreq2.push({
      index: i,
      page: window[0].startPage,
      line: window[0].startLine,
      translit: window.map((word) => word.translit)
    });
  }
}
assert.deepEqual(allFreq2, [
  { index: 1461, page: 27, line: 2, translit: ['BF', 'DJU', 'BEI'] }
]);

function sameSingleLine(a, b) {
  return a.startPage === a.endPage &&
    b.startPage === b.endPage &&
    a.startPage === b.startPage &&
    a.startLine === a.endLine &&
    b.startLine === b.endLine &&
    a.startLine === b.startLine;
}

// Exact frozen #1511 conjunction over complete words:
// 3 consecutive frequency-2 words; other copies on <=2 earlier pages;
// the other copies of words2-3 adjacent on one physical line.
const frozenMatches = [];
for (let i = 0; i + 2 < words.length; i++) {
  const window = words.slice(i, i + 3);
  if (!window.every((word) => frequency.get(word.runes) === 2)) continue;
  const other = window.map((word, k) =>
    occurrences.get(word.runes).find((index) => index !== i + k));
  assert(other.every((index) => index !== undefined));
  const currentFirstPage = Math.min(...window.map((word) => word.startPage));
  const otherPages = other.map((index) => words[index].startPage);
  if (otherPages.some((page) => page >= currentFirstPage)) continue;
  if (new Set(otherPages).size > 2) continue;
  if (other[2] !== other[1] + 1) continue;
  if (!sameSingleLine(words[other[1]], words[other[2]])) continue;
  frozenMatches.push(i);
}
assert.deepEqual(frozenMatches, []);

console.log('CANONICAL GRAPH: 12,956 runes, 2,896 complete words, 90 frequency-2 word types');
console.log('P55 LAST WORDS: CEAIMCX / DJU / BEI with frequencies 1 / 2 / 2');
console.log('BOUNDARY300: cuts CEAIMCX after rune4 of6; CX is only the remaining 2-rune suffix');
console.log('CX COMPLETE-WORD COUNT: 0; p34 line10 CX is likewise the suffix of BGCX');
console.log('ONLY ALL-FREQUENCY-2 COMPLETE TRIPLE: BF / DJU / BEI at p27 line2');
console.log('FROZEN #1511 COMPLETE-WORD CONJUNCTION: 0 observed matches');
console.log('VERDICT: the terminal three-complete-word map premise is false before any permutation null');
