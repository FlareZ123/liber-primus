'use strict';

/**
 * Original-source LPAD13 known-pad key-recovery test.
 * Run from the repository root: node sims/lp2_lpad13_flora_p15_knownpad_recurrence_sft.cjs
 * All source files are read-only; no external packages or fitted keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const runeId = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} values */
const ioc = values => {
  const bins = Array(29).fill(0);
  for (const value of values) bins[value]++;
  return bins.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
};

/** Original printed stops and hyphens are word delimiters; line and page wraps are not. */
let tokenized = '';
for (const rune of transcript) {
  if (runeId.has(rune)) tokenized += rune;
  else if (rune === '-' || rune === '.') tokenized += '|';
}
const wholeWords = [];
let globalOffset = 0;
for (const word of tokenized.split('|').filter(Boolean)) {
  const letters = Array.from(word, rune => runeId.get(rune));
  const start = globalOffset;
  globalOffset += letters.length;
  wholeWords.push({ start, end: globalOffset, letters });
}
const unknown = corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices);
assert.equal(globalOffset, unknown.length + 180);
assert.equal(unknown.length, 12956);
assert.equal(wholeWords.slice(0, 2896).map(word => word.letters.map(i => corpus.runes[i]).join('')).join(''),
  unknown.map(i => corpus.runes[i]).join(''));

const chapterStart = corpus.pages.filter(page => page.page <= 2).reduce((sum, page) => sum + page.indices.length, 0);
const chapterEnd = corpus.pages.filter(page => page.page <= 7).reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(chapterStart, 729);
assert.equal(chapterEnd, 1874);
const scrollWords = wholeWords.filter(word => word.start >= chapterStart && word.end <= chapterEnd);
assert.equal(scrollWords.length, 255);
assert.equal(scrollWords.reduce((sum, word) => sum + word.letters.length, 0), 1145);
assert.ok(scrollWords.every(word => word.letters.length <= 13));

/** Each complete printed word is left-padded with GP29 F=0 to 13 rune slots. */
const padMask = [];
for (const word of scrollWords) {
  for (let n = word.letters.length; n < 13; n++) padMask.push(true);
  for (const _ of word.letters) padMask.push(false);
}
const floral = corpus.pages.filter(page => page.page >= 40 && page.page <= 55).flatMap(page => page.indices);
assert.equal(floral.length, 3316);
assert.equal(floral[0], 0); // source-visible red F on physical page 40
const target = floral.slice(1);
assert.equal(target.length, 3315);
assert.equal(padMask.length, target.length);
assert.equal(padMask.filter(Boolean).length, 2170);

/** The p15 printed numerical square, in original row order. */
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
/** @param {number[][]} matrix */
function characteristic(matrix) {
  let auxiliary = Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => Number(i === j)));
  const coefficients = [1];
  for (let iteration = 1; iteration <= 4; iteration++) {
    const next = Array.from({ length: 4 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) =>
        mod(matrix[i].reduce((sum, v, k) => sum + v * auxiliary[k][j], 0))));
    const trace = next.reduce((sum, row, i) => sum + row[i], 0);
    const inverse = Array.from({ length: 28 }, (_, i) => i + 1)
      .find(value => mod(value * iteration) === 1);
    const coefficient = mod(-trace * inverse);
    coefficients.push(coefficient);
    auxiliary = next.map((row, i) =>
      row.map((v, j) => mod(v + (i === j ? coefficient : 0))));
  }
  return coefficients;
}
const unsignedMatrix = printed.map(row => row.map(mod));
const signedMatrix = printed.map((row, i) =>
  row.map((value, j) => mod(i === 3 && j < 2 ? -value : value)));
const modes = [
  { name: 'visible unsigned p15 square', polynomial: characteristic(unsignedMatrix),
    expected: [1, 14, 22, 5, 17], expectedFailures: 1115, firstResidue: 28 },
  { name: 'Fibonacci-prime signed p15 square', polynomial: characteristic(signedMatrix),
    expected: [1, 14, 27, 10, 7], expectedFailures: 1139, firstResidue: 18 }
];

/** @param {number[]} polynomial @param {number[]} sequence @param {number} start */
function residue(polynomial, sequence, start) {
  let sum = 0;
  for (let j = 0; j < 5; j++) sum += polynomial[j] * sequence[start + 4 - j];
  return mod(sum);
}

/** Any scalar projection of a 4-state linear register with matrix M satisfies charpoly(M). */
for (const mode of modes) {
  assert.deepEqual(mode.polynomial, mode.expected);
  let windows = 0;
  let failures = 0;
  for (let i = 0; i + 5 <= target.length; i++) {
    if (!padMask.slice(i, i + 5).every(Boolean)) continue;
    windows++;
    failures += Number(residue(mode.polynomial, target, i) !== 0);
  }
  assert.equal(windows, 1168);
  assert.equal(failures, mode.expectedFailures);
  assert.equal(residue(mode.polynomial, target, 0), mode.firstResidue);
  assert.deepEqual(target.slice(0, 5), [9, 19, 26, 6, 23]);
  console.log(mode.name + ': ' + failures + '/' + windows + ' known-F five-slot recurrence contradictions; first residue ' + mode.firstResidue);

  // Native-text plant: an arbitrary secret four-state stream is uniquely
  // reconstructed from the first four known F padding positions.
  const seed = [1, 2, 3, 4];
  /** @param {number[]} init */
  function advance(init) {
    const state = init.slice();
    for (let i = 0; i < target.length - 4; i++) {
      let sum = 0;
      for (let j = 1; j <= 4; j++) sum += mode.polynomial[j] * state[i + 4 - j];
      state.push(mod(-sum));
    }
    return state;
  }
  const key = advance(seed);
  const clear = corpus.pages.find(page => page.page === 57).indices;
  assert.equal(clear.length, 95);
  let read = 0;
  const plaintext = padMask.map(isPad => isPad ? 0 : clear[(read++) % clear.length]);
  assert.equal(read, 1145);
  const planted = plaintext.map((value, i) => mod(value + key[i]));
  const recoveredKey = advance(planted.slice(0, 4));
  assert.deepEqual(recoveredKey, key);
  assert.ok(padMask.every((isPad, i) => !isPad || recoveredKey[i] === planted[i]));
  assert.deepEqual(planted.map((value, i) => mod(value - recoveredKey[i])), plaintext);
  assert.equal(planted.filter((_, i) => !padMask[i]).length, 1145);
  console.log('  exact 3315-symbol original-layout planted recovery: 2170 known F key slots and 1145 source-native text slots PASS');
}
console.log('Actual floral ciphertext IoC=' + ioc(target).toFixed(12) +
  '; candidate is incompatible with either full-secret-initial-state source matrix recurrence.');
