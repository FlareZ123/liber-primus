#!/usr/bin/env node
'use strict';

// Reproduce one fixed p48-word -> p50-grid coordinate hypothesis.
// Run from any cwd: node sims/lp2_p48_word_prime_coordinate_p50_grid_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');

const pageSegments = transcription.split(/\r?\n%\r?\n/).slice(0, 55);
// lp2-transcription omits runeless physical p50; segments 50–54 are p51–55.
// Exclude the next segment (p56) and the clear p57 text.
assert.equal(pageSegments.length, 55);

let raw = pageSegments.join('')
  .replace(/[\/\n\r\t]/g, '')
  .replace(/\./g, '-')
  .replace(/[&$]/g, '');

const tokens = raw.split('-').filter(Boolean).filter((x) => !/^([1-5]|7)$/.test(x));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = tokens.map((token) => Array.from(token).map((r) => runeIndex.get(r)));
const invalidTokens = tokens.filter((token, i) => words[i].some((x) => x === undefined));
assert.deepEqual(invalidTokens, []);

const sourceRuneCount = words.reduce((n, w) => n + w.length, 0);
assert.equal(words.length, 2896);
assert.equal(sourceRuneCount, 12956);

const table = grid.pages.flatMap((p) => p.bytes);
assert.equal(table.length, 256);

const wordCells = words.map((word) => {
  const primeSum = word.reduce((s, r) => s + corpus.prime[r], 0);
  const row = primeSum % 32;
  const col = (word.length - 1) % 8;
  const cell0 = row * 8 + col;
  const byte = table[cell0];
  return {
    word,
    len: word.length,
    primeSum,
    row,
    col,
    cell0,
    byte,
    q: Math.floor(byte / 29),
    r: byte % 29,
  };
});

// The candidate direction register is the conventional 3x3 keypad:
// 1=SW, 2=S, 3=SE; 4=W, 5=stay, 6=E; 7=NW, 8=N, 9=NE.
const delta = {
  1: [-1, 1], 2: [0, 1], 3: [1, 1],
  4: [-1, 0], 5: [0, 0], 6: [1, 0],
  7: [-1, -1], 8: [0, -1], 9: [1, -1],
};
function nextCell(cell0, q) {
  const x = cell0 % 8;
  const y = Math.floor(cell0 / 8);
  const [dx, dy] = delta[q + 1];
  const nx = x + dx;
  const ny = y + dy;
  if (nx < 0 || nx >= 8 || ny < 0 || ny >= 32) return null;
  return ny * 8 + nx;
}

const predicted = wordCells.slice(0, -1).map((x) => nextCell(x.cell0, x.q));
const actualNext = wordCells.slice(1).map((x) => x.cell0);
const eligible = predicted.filter((x) => x !== null).length;
const matches = predicted.reduce((n, p, i) => n + (p !== null && p === actualNext[i] ? 1 : 0), 0);

const nextFrequency = new Map();
for (const x of actualNext) nextFrequency.set(x, (nextFrequency.get(x) || 0) + 1);
const expectedMarginalCount = predicted.reduce(
  (s, target) => s + (target === null ? 0 : (nextFrequency.get(target) || 0)),
  0,
) / actualNext.length;
const expectedMarginalRate = expectedMarginalCount / eligible;

function ioc(values) {
  const f = Array(29).fill(0);
  for (const x of values) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function mod29(x) { return ((x % 29) + 29) % 29; }

const original = words.flat();
const remainderSequence = wordCells.map((x) => x.r);
const plusWordShift = words.flatMap((w, i) => w.map((x) => mod29(x + wordCells[i].r)));
const minusWordShift = words.flatMap((w, i) => w.map((x) => mod29(x - wordCells[i].r)));

const p48Word = [19, 6, 18, 19, 26, 27, 10, 23]; // M-G-E-M-Y-IA-I-D
const p48Index = words.findIndex((w) => w.length === p48Word.length && w.every((x, i) => x === p48Word[i]));
assert.equal(p48Index, 2663);
const p48 = wordCells[p48Index];
const p48Predicted = predicted[p48Index];
const p48ActualNext = actualNext[p48Index];

const p48PerRuneMap = p48Word.map((rune, col) => {
  const row = corpus.prime[rune] % 32;
  const cell0 = row * 8 + col;
  const byte = table[cell0];
  const q = Math.floor(byte / 29);
  const r = byte % 29;
  return {
    col: col + 1,
    input: corpus.translit[rune],
    prime: corpus.prime[rune],
    row: row + 1,
    cell: cell0 + 1,
    byte,
    q,
    direction: q + 1,
    remainder: r,
    output: corpus.translit[r],
  };
});

const passageLengths = [139, 91, 98, 96, 129];
const passageMultiples = new Set(passageLengths.flatMap((n) => Array.from({ length: 8 }, (_, i) => n * (i + 1))));
const wholeWordPassageMultipleCount = wordCells.filter((x) => passageMultiples.has(x.primeSum)).length;
const wholeWord556Count = wordCells.filter((x) => x.primeSum === 556).length;
const wholeWord258Count = wordCells.filter((x) => x.primeSum === 258).length;
let fourRuneSubstrings258 = 0;
for (const word of words) {
  for (let i = 0; i + 4 <= word.length; i++) {
    const sum = word.slice(i, i + 4).reduce((s, r) => s + corpus.prime[r], 0);
    if (sum === 258) fourRuneSubstrings258++;
  }
}

const result = {
  input: {
    transcriptionSegmentsUsed: 55,
    runeCount: sourceRuneCount,
    wordCount: words.length,
    gridCells: table.length,
  },
  p48Word: {
    wordIndex1: p48Index + 1,
    transliteration: p48Word.map((x) => corpus.translit[x]).join(''),
    runeLength: p48.len,
    gpPrimeSum: p48.primeSum,
    row0: p48.row,
    col0: p48.col,
    cell0: p48.cell0,
    cell1: p48.cell0 + 1,
    tableByte: p48.byte,
    quotientQ: p48.q,
    keypadDirection: p48.q + 1,
    remainderR: p48.r,
    remainderRune: corpus.translit[p48.r],
    predictedNextCell1: p48Predicted === null ? null : p48Predicted + 1,
    actualNextWordCell1: p48ActualNext + 1,
    directionMatchesNextWord: p48Predicted === p48ActualNext,
  },
  allWordTransitions: {
    total: predicted.length,
    inBounds: eligible,
    directionMatches: matches,
    matchRate: matches / eligible,
    marginalExpectedRate: expectedMarginalRate,
  },
  oneRunePerWordRemainder: {
    length: remainderSequence.length,
    ioc: ioc(remainderSequence),
    first50: remainderSequence.slice(0, 50).map((x) => corpus.translit[x]),
  },
  perWordAdditiveKey: {
    originalRuneIoc: ioc(original),
    plusRuneIoc: ioc(plusWordShift),
    minusRuneIoc: ioc(minusWordShift),
  },
  p48PerRuneGridMap: {
    output: p48PerRuneMap.map((x) => x.output).join(' '),
    directions: p48PerRuneMap.map((x) => x.direction),
    cells: p48PerRuneMap,
  },
  numericCoincidenceControls: {
    wholeWordsWithGpPrimeSum556: wholeWord556Count,
    wholeWordsWithGpPrimeSum258: wholeWord258Count,
    fourRuneSubstringsWithGpPrimeSum258: fourRuneSubstrings258,
    wholeWordsMatchingAny1to8MultipleOfOneOfFivePassageLengths: wholeWordPassageMultipleCount,
  },
};

assert.equal(p48.len, 8);
assert.equal(p48.primeSum, 556);
assert.equal(p48.cell0 + 1, 104);
assert.equal(p48.byte, 206);
assert.equal(eligible, 2610);
assert.equal(matches, 11);
assert.equal(wholeWord556Count, 1);
assert.equal(wholeWord258Count, 6);
assert.equal(fourRuneSubstrings258, 38);
assert.equal(wholeWordPassageMultipleCount, 130);

console.log(JSON.stringify(result, null, 2));
