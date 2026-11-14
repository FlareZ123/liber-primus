#!/usr/bin/env node
'use strict';

/**
 * LP2 p3-p7 original GP29 whole-chapter checksum and source-key gate.
 * Run: node sims/lp2_p3_p7_809_761_1033_source_gate_sft.cjs
 * Node.js 22, CommonJS, standard library only, no writes.
 *
 * Source-visible chapter delimiters are the p3 red heading and the
 * p7 red13 terminator; section boundaries independently recorded in
 * im-results/lp2-global-original-visual-section-map.md.
 * Numerical identity is exploratory, never a decipherment claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} relative @returns {string} */
const source = relative => fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8');
const corpus = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const squares = source('resources/cicada2014-openpuff-magic-squares.txt')
  .match(/\d+/g).map(Number);
const { pages, prime, translit } = corpus;
assert.equal(pages.length, 58);
assert.equal(prime.length, 29);
assert.equal(squares.length, 25 + 49 + 25);
const firstSquare = squares.slice(0, 25);
const middleSquare = squares.slice(25, 74);
const finalSquare = squares.slice(74);
assert.equal(firstSquare[12], 809);
for (let row = 0; row < 5; row++) {
  assert.equal(firstSquare.slice(5 * row, 5 * row + 5)
    .reduce((a, b) => a + b), 3301);
  assert.equal(finalSquare.slice(5 * row, 5 * row + 5)
    .reduce((a, b) => a + b), 1033);
}
assert.equal(middleSquare[24], 331);

const chapterPageRanges = [[0, 2], [3, 7], [8, 14], [15, 22],
  [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const chapters = chapterPageRanges.map(([first, last]) => {
  /** @type {number[]} */
  const indices = pages.slice(first, last + 1).flatMap(p => p.indices);
  const frequency = Array(29).fill(0);
  for (const glyph of indices) frequency[glyph]++;
  return {
    first, last, length: indices.length, frequency,
    sum: indices.reduce((total, glyph) => total + prime[glyph], 0)
  };
});
assert.deepEqual(chapters.map(c => c.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.deepEqual(chapters.map(c => c.sum),
  [36781, 60675, 88311, 97607, 52024, 74431, 86896, 155581, 15876]);

const selected = chapters[1];
assert.equal(selected.length, 1145);
const constituentPages = pages.slice(3, 8).map(p => ({
  page: p.page, length: p.indices.length,
  gpPrimeSum: p.indices.reduce((s, glyph) => s + prime[glyph], 0)
}));
assert.deepEqual(constituentPages.map(p => p.gpPrimeSum),
  [11462, 12998, 14383, 10581, 11251]);

/** @param {string[]} symbols @returns {number} */
const primeSum = symbols => symbols.reduce((sum, t) => {
  const idx = translit.indexOf(t);
  assert.ok(idx >= 0, 'missing GP transliteration: ' + t);
  return sum + prime[idx];
}, 0);
const title = [
  ['TH', 'E'],
  ['I', 'N', 'S', 'T', 'A', 'R'],
  ['E', 'M', 'E', 'R', 'G', 'E', 'N', 'C', 'E']
];
const titleParts = title.map(primeSum);
assert.deepEqual(titleParts, [72, 280, 409]);
const mp3TitleSum = titleParts.reduce((a, b) => a + b);
assert.equal(mp3TitleSum, 761);

assert.equal(mp3TitleSum, 761);

// A separate original-image feature: the p7 red terminal is five intact
// printed words (2+4+3+2+3=14 GP runes) above a hand-counted five-dot motif.
// Original merged scan is resources/liber-primus/24.jpg.
// Its red-rune sum 766 equals the independent 2013 MP3 label 761 plus five.
// The operation "subtract dots" is provisional, not an author instruction.
const masterText = source('resources/liber-primus/lp2-transcription.txt');
const p7Printed = masterText.split('\n%\n')[7];
const redFooterMatch = p7Printed.match(/\n&\n([^\n]+)\n&\n\$/);
assert.ok(redFooterMatch, 'p7 original red footer must be preserved');
const p7PrintedRedWords = redFooterMatch[1].split(/[-./]/).filter(Boolean);
assert.deepEqual(p7PrintedRedWords.map(w => [...w].length), [2, 4, 3, 2, 3]);
const p7PrintedRedIndices = p7PrintedRedWords.flatMap(word => [...word].map(rune => {
  const index = corpus.runes.indexOf(rune);
  assert.ok(index >= 0);
  return index;
}));
const p7OriginalFinal14 = pages[7].indices.slice(-14);
assert.deepEqual(p7PrintedRedIndices, p7OriginalFinal14);
const p7OriginalRedSum = p7PrintedRedIndices.reduce((s, i) => s + prime[i], 0);
assert.equal(p7OriginalRedSum, 766);
const originalFiveDotCount = 5; // Hand-counted on unmodified combined original 24.jpg.
assert.equal(p7OriginalRedSum - originalFiveDotCount, mp3TitleSum);

const totalOriginalImageCount = 17 + pages.length;
assert.equal(totalOriginalImageCount, 75);
const interestingSum = selected.sum;
assert.equal(interestingSum, 58 * 1033 + mp3TitleSum);
assert.equal(interestingSum, totalOriginalImageCount * firstSquare[12]);

// All continuous original-page windows, with original rune pages unchanged.
// The unique exact whole-page window uses p3 through p7.
const pageSums = pages.slice(0, 56).map(p =>
  p.indices.reduce((sum, glyph) => sum + prime[glyph], 0));
const matchingWindows = [];
let windowsWithin50 = 0;
for (let first = 0; first < 56; first++) {
  let sum = 0;
  for (let last = first; last < 56; last++) {
    sum += pageSums[last];
    if (sum === interestingSum) matchingWindows.push([first, last]);
    if (Math.abs(sum - interestingSum) <= 50) windowsWithin50++;
  }
}
assert.deepEqual(matchingWindows, [[3, 7]]);
assert.equal(windowsWithin50, 1);

// Conditional control: keep every chapter's source rune counts fixed, but
// replace the published prime-to-rune labels by a seeded permutation.
// The original exact equality was noticed retrospectively: this control
// is not a discovery-adjusted probability of deliberate authorship.
let seed = 0x33017610;
/** @returns {number} */
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const samples = 300000;
let exactlySelected = 0;
let anyChapterExact = 0;
let within50Selected = 0;
for (let iteration = 0; iteration < samples; iteration++) {
  const permutedPrimeWeights = prime.slice();
  for (let j = 28; j > 0; j--) {
    const k = next() % (j + 1);
    [permutedPrimeWeights[j], permutedPrimeWeights[k]] =
      [permutedPrimeWeights[k], permutedPrimeWeights[j]];
  }
  let any = false;
  for (let ci = 0; ci < chapters.length; ci++) {
    let s = 0;
    const histogram = chapters[ci].frequency;
    for (let j = 0; j < 29; j++) s += histogram[j] * permutedPrimeWeights[j];
    if (s === interestingSum) any = true;
    if (ci === 1) {
      if (s === interestingSum) exactlySelected++;
      if (Math.abs(s - interestingSum) <= 50) within50Selected++;
    }
  }
  if (any) anyChapterExact++;
}
assert.equal(exactlySelected, 14);
assert.equal(anyChapterExact, 14);
assert.equal(within50Selected, 2156);

// Strict solved-p56 GP prime-totient decoder gate against the original
// p3-p7 ciphertext; no ciphertext-F bypass policy is fitted to language.
// A plaintext F must emit literal F without consuming its prime key.
// Seed is the index of the first prime used, not an additive Caesar shift.
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const values = [];
  for (let x = 2; values.length < count; x++) {
    let isPrime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) {
      isPrime = false;
      break;
    }
    if (isPrime) values.push(x);
  }
  return values;
}
const primes = firstPrimes(2200);
const targetCipher = pages.slice(3, 8).flatMap(p => p.indices);
/**
 * Tests every source-legal F skip mask by DP over consumed prime positions.
 * @param {number[]} ciphertext
 * @param {number} initialIndex
 * @returns {{deadAt: number|null, survivorCount: number}}
 */
function strictFSurvival(ciphertext, initialIndex) {
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const current = ciphertext[i];
    const next = new Set();
    for (const taken of states) {
      const key = (primes[initialIndex + taken] - 1) % 29;
      const plaintext = (current - key + 29) % 29;
      if (plaintext !== 0) next.add(taken + 1);
      if (current === 0) next.add(taken);
    }
    if (!next.size) return { deadAt: i, survivorCount: 0 };
    states = next;
  }
  return { deadAt: null, survivorCount: states.size };
}
// Independently known authentic p56 has the literal F only at offset 56.
const p56 = pages[56].indices;
assert.equal(p56.length, 85);
let consumed = 0;
const p56Plain = p56.map((glyph, i) => {
  if (i === 56) {
    assert.equal(glyph, 0);
    return 0;
  }
  const decoded = (glyph - (primes[consumed++] - 1) % 29 + 29) % 29;
  assert.notEqual(decoded, 0);
  return decoded;
});
assert.equal(consumed, 84);
assert.ok(p56Plain.map(x => translit[x]).join('').startsWith('ANENDWITHINTHEDEEPWEB'));
assert.equal(strictFSurvival(p56, 0).deadAt, null);
const keySeedFailures = [0, 58, 761, 1033].map(start => ({
  primeIndex: start, ...strictFSurvival(targetCipher, start)
}));
assert.deepEqual(keySeedFailures.map(x => x.deadAt), [22, 27, 33, 74]);

console.log(JSON.stringify({
  classification: 'conditional source-number coincidence; no unknown-page decryption',
  source: 'original LP2 canonical rune indices and 2014 three magic squares',
  selectedOriginalPages: [3, 7],
  constituentPages, chapterPrimeSums: chapters.map(x => x.sum),
  originalRuneCount: selected.length,
  historicalTitlePrimeComponents: titleParts,
  p7RedFooter: { originalWords: p7PrintedRedWords.map(w => [...w].length), originalPrimeSum: p7OriginalRedSum, handCountedBlackDots: originalFiveDotCount, difference: mp3TitleSum },
  identities: ['60675 = 58 * 1033 + 761', '60675 = 75 * 809'],
  countOfExactOriginalWholePageWindows: matchingWindows.length,
  matchingWindows, originalWindowsWithin50: windowsWithin50,
  primeRelabelNull: {
    samples, seededXorshift: '0x33017610',
    exactOnChosenChapter: exactlySelected, exactAnyOfNine: anyChapterExact,
    chosenChapterWithin50: within50Selected,
    selectionBiasCaveat: 'post-hoc arithmetic identity; no discovery-wide p-value'
  },
  independentlyKnownPrimeTotientPositive: 'p56 recovered 85/85',
  strictFKeySeedFailures: keySeedFailures,
  result: 'observed checksum equality does not select an authentic key or decipherment'
}, null, 2));
