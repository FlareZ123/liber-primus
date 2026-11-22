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

// The same five-dot ornament is reproduced on p23 and solved p56.
// The red heading prime sums are preselected by source-visible ink, and
// the same historically named title values appear under 5^2 and 5.
// These secondary arithmetic operations are also post-hoc, not an inverse.
const sourceInk = JSON.parse(source('resources/liber-primus/lp2-ink-annotations.json'));
/** @param {number} page @returns {number} */
function entireInitialRedSum(page) {
  const ann = sourceInk.pages.find(p => p.page === page);
  assert.ok(ann);
  const red = ann.red_spans.find(s => s.start === 0);
  assert.ok(red);
  return pages[page].indices.slice(red.start, red.start + red.length)
    .reduce((total, glyph) => total + prime[glyph], 0);
}
const otherFiveDotHeadingPrimeSums = [
  { originalPage: 23, gpPrimeSum: entireInitialRedSum(23) },
  { originalPage: 56, gpPrimeSum: entireInitialRedSum(56) }
];
assert.deepEqual(otherFiveDotHeadingPrimeSums.map(x => x.gpPrimeSum),
  [786, 285]);
assert.equal(otherFiveDotHeadingPrimeSums[0].gpPrimeSum - 5 * 5, 761);
assert.equal(otherFiveDotHeadingPrimeSums[1].gpPrimeSum - 5, titleParts[1]);

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
const titlePrimeOrdinal = primes.indexOf(761);
const squareCenterPrimeOrdinal = primes.indexOf(809);
assert.equal(titlePrimeOrdinal, 134); // Zero-based, i.e. 135th ordinary prime.
assert.equal(squareCenterPrimeOrdinal, 139); // Zero-based, 140th.
const fiveDotPrimeSuccessors = primes.slice(titlePrimeOrdinal + 1,
  squareCenterPrimeOrdinal + 1);
assert.deepEqual(fiveDotPrimeSuccessors, [769, 773, 787, 797, 809]);
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
const actualPrimeValueStarts = [titlePrimeOrdinal, squareCenterPrimeOrdinal]
  .map(start => ({
    firstPrime: primes[start], primeIndex: start, ...strictFSurvival(targetCipher, start)
  }));
assert.deepEqual(actualPrimeValueStarts.map(x => x.deadAt), [10, 22]);
// One source-visible prime-successor per each of the five physical pages,
// resetting the authentic p56-type clock on each original page.
const oneSuccessorPerPhysicalPage = pages.slice(3, 8).map((page, i) => ({
  originalPage: page.page,
  firstPrime: fiveDotPrimeSuccessors[i],
  ...strictFSurvival(page.indices, titlePrimeOrdinal + 1 + i)
}));
assert.deepEqual(oneSuccessorPerPhysicalPage.map(x => x.deadAt),
  [24, 54, 21, 3, 71]);


// A different direct consumer, distinct from prior five-*parallel-page*
// 3301-square Hill tests: the actual p3-p7 source CHAPTER has 1145=5*229
// printed runes; excluding its p3 red16 intro and p7 red14 close yields
// 1115=5*223 source-contiguous body runes. The similarly five-dot-headed
// p23-p26 source group has 1021-16=1005=5*201 body runes.
// Test only the genuine recovered 2014 5x5 square on consecutive quintets,
// not an arbitrary fitted matrix or a search over plaintext cribs.
/** @param {number} n @returns {number} */
const mod29 = n => (n % 29 + 29) % 29;
/** @param {number} a @returns {number} */
function invert29(a) {
  for (let k = 1; k < 29; k++) if (mod29(a * k) === 1) return k;
  throw Error('singular GF29 pivot');
}
/** @param {number[][]} matrix @returns {number[][]} */
function inverse5(matrix) {
  const m = matrix.map((row, i) => row.concat(
    Array.from({ length: 5 }, (_, j) => +(i === j))));
  for (let j = 0; j < 5; j++) {
    let pivot = j;
    while (pivot < 5 && m[pivot][j] === 0) pivot++;
    assert.ok(pivot < 5, 'historical 5x5 source matrix is singular');
    [m[pivot], m[j]] = [m[j], m[pivot]];
    const inv = invert29(m[j][j]);
    for (let col = 0; col < 10; col++) m[j][col] = mod29(m[j][col] * inv);
    for (let row = 0; row < 5; row++) if (row !== j) {
      const factor = m[row][j];
      for (let col = 0; col < 10; col++) {
        m[row][col] = mod29(m[row][col] - factor * m[j][col]);
      }
    }
  }
  return m.map(row => row.slice(5));
}
/** @param {number[][]} matrix @returns {number[][]} */
const transpose5 = matrix => matrix[0].map((_, col) =>
  matrix.map(row => row[col]));
/**
 * Apply a reversible 5x5 GF29 transform to consecutive complete quintets.
 * @param {number[]} data
 * @param {number[][]} matrix
 * @param {number[]} order
 * @returns {number[]}
 */
function hill5(data, matrix, order) {
  assert.equal(data.length % 5, 0);
  const out = [];
  for (let offset = 0; offset < data.length; offset += 5) {
    const vec = order.map(i => data[offset + i]);
    for (const row of matrix) {
      out.push(mod29(row.reduce((s, v, j) => s + v * vec[j], 0)));
    }
  }
  return out;
}
/** @param {number[]} seq @returns {number} */
function ioc29(seq) {
  const freq = Array(29).fill(0);
  for (const glyph of seq) freq[glyph]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}
const stage10Square = Array.from({ length: 5 }, (_, r) =>
  firstSquare.slice(r * 5, r * 5 + 5).map(mod29));
const stage10Inverse = inverse5(stage10Square);
const stage10Ops = [
  ['M', stage10Square],
  ['Mtranspose', transpose5(stage10Square)],
  ['Minverse', stage10Inverse],
  ['MtransposeInverse', transpose5(stage10Inverse)]
];
// Original five-dot rank order x-left-to-right to y-top-to-bottom,
// taken as a *candidate* physical transport, not a proven key.
const dotRankOrder = [2, 4, 0, 3, 1];
const blockReadOrders = [['printed', [0, 1, 2, 3, 4]],
  ['fiveDot', dotRankOrder]];
const p23Group = pages.slice(23, 27).flatMap(p => p.indices);
const hillSectionInputs = [
  ['p3-p7 all original', targetCipher],
  ['p3-p7 without red16+14', targetCipher.slice(16, -14)],
  ['p23-p26 without red16', p23Group.slice(16)]
];
assert.deepEqual(hillSectionInputs.map(x => x[1].length),
  [1145, 1115, 1005]);
const hillOriginal = [];
for (const [section, original] of hillSectionInputs) {
  for (const [operation, matrix] of stage10Ops) {
    for (const [reading, order] of blockReadOrders) {
      const output = hill5(original, matrix, order);
      hillOriginal.push({
        section, operation, reading, length: output.length,
        ioc: ioc29(output),
        sample: output.slice(0, 15).map(i => translit[i]).join(' ')
      });
    }
  }
}
assert.equal(hillOriginal.length, 24);
const hillBest = hillOriginal.reduce((a, b) => a.ioc >= b.ioc ? a : b);
assert.ok(hillBest.ioc < 0.04, 'unexpected English-marginal candidate');
assert.ok(ioc29(pages[57].indices) > 0.06);
// Genuine GP29 English plant from 95 clear p57 runes, not learned from unknown.
const solvedNativeHillPlant = hill5(pages[57].indices, stage10Square,
  blockReadOrders[0][1]);
const solvedNativeHillRecovered = hill5(solvedNativeHillPlant, stage10Inverse,
  blockReadOrders[0][1]);
assert.deepEqual(solvedNativeHillRecovered, pages[57].indices);


// Historical 2015/2016 participants explicitly proposed reversing the
// GP alphabet or the prime-minus-one algorithm for the three five-dot pages.
// Source-fixed p3-7 and p23-26, red-trimmed and complete. This DP allows
// ALL legal F masks, rather than choosing a favorable mask by language score.
/**
 * @param {number[]} ciphertext
 * @param {number} startPrimeIndex
 * @param {-1|1} keySign
 * @returns {number|null} First impossible zero-based rune offset.
 */
function signedPrimeFDeath(ciphertext, startPrimeIndex, keySign) {
  let states = new Set([0]);
  for (let offset = 0; offset < ciphertext.length; offset++) {
    const cipher = ciphertext[offset];
    const next = new Set();
    for (const taken of states) {
      const primeShift = (primes[startPrimeIndex + taken] - 1) % 29;
      const plain = mod29(cipher + keySign * primeShift);
      if (plain !== 0) next.add(taken + 1);
      if (cipher === 0) next.add(taken);
    }
    if (!next.size) return offset;
    states = next;
  }
  return null;
}
assert.equal(signedPrimeFDeath(p56, 0, -1), null);
const atbashInputSets = [
  ['p3-7 entire', targetCipher],
  ['p3-7 trim red', targetCipher.slice(16, -14)],
  ['p23-26 entire', p23Group],
  ['p23-26 trim red', p23Group.slice(16)]
];
const originalAtbashPrimeGates = [];
for (const [section, original] of atbashInputSets) {
  for (const alphabet of ['original', 'Atbash']) {
    for (const order of ['printed', 'reversed']) {
      let cipher = alphabet === 'Atbash' ?
        original.map(x => 28 - x) : original.slice();
      if (order === 'reversed') cipher.reverse();
      for (const keySign of /** @type {const} */ ([-1, 1])) {
        for (const primeIndex of [0, titlePrimeOrdinal,
          squareCenterPrimeOrdinal]) {
          originalAtbashPrimeGates.push({
            section, alphabet, order, keySign,
            firstPrime: primes[primeIndex],
            firstForcedFailure: signedPrimeFDeath(cipher, primeIndex, keySign)
          });
        }
      }
    }
  }
}
assert.equal(originalAtbashPrimeGates.length, 96);
assert.ok(originalAtbashPrimeGates.every(x =>
  x.firstForcedFailure !== null));
const atbashLongest = originalAtbashPrimeGates.reduce((a, b) =>
  a.firstForcedFailure >= b.firstForcedFailure ? a : b);
assert.ok(atbashLongest.firstForcedFailure < 500);


// Distinct historical 2014 source: stage03 Onion comment "Patience is a
// virtue", literally GP-sum 761; its 17 GP runes are a fully sourced
// candidate 761-key, unlike an arbitrary integer-seeded keystream.
// Historical LP1 Vigenere uses an exact source word key plus transparent F.
const patienceKey = [...'PATIENCEISAUIRTUE'].map(ch => translit.indexOf(ch));
assert.equal(patienceKey.length, 17);
assert.ok(patienceKey.every(n => n >= 0));
assert.equal(patienceKey.reduce((s, n) => s + prime[n], 0), 761);
/**
 * Exhaustive F mask survival for a fixed periodic 17-rune GP native key.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number|null}
 */
function keyedFDeath(ciphertext, key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      const plain = mod29(ciphertext[i] + sign * key[consumed % key.length]);
      if (plain !== 0) next.add(consumed + 1);
      if (ciphertext[i] === 0) next.add(consumed);
    }
    if (!next.size) return i;
    states = next;
  }
  return null;
}
// Genuine p57 clear-rune plant: encrypt under *this* sourced key respecting
// bypass and prove the exhaustive decoder admits all95 original positions.
let patienceConsumed = 0;
const patiencePlant = pages[57].indices.map(p => p === 0 ? 0 :
  mod29(p + patienceKey[(patienceConsumed++) % patienceKey.length]));
assert.equal(keyedFDeath(patiencePlant, patienceKey, -1), null);
const patienceSourceKeyResults = [];
for (const [section, original] of atbashInputSets) {
  for (const alphabet of ['original', 'Atbash']) {
    for (const order of ['printed', 'reversed']) {
      let arr = alphabet === 'Atbash' ?
        original.map(g => 28 - g) : original.slice();
      if (order === 'reversed') arr.reverse();
      for (const reverseKey of [false, true]) {
        const key = reverseKey ? patienceKey.slice().reverse() : patienceKey;
        for (const sign of /** @type {const} */ ([-1, 1])) {
          patienceSourceKeyResults.push({
            section, alphabet, order, reverseKey, sign,
            deathAt: keyedFDeath(arr, key, sign)
          });
        }
      }
    }
  }
}
assert.equal(patienceSourceKeyResults.length, 64);
assert.ok(patienceSourceKeyResults.every(x => x.deathAt !== null));
const patienceBest = patienceSourceKeyResults.reduce((a, b) =>
  a.deathAt >= b.deathAt ? a : b);
assert.ok(patienceBest.deathAt < 500);
const patiencePageReset = [];
for (const [chapter, first, last] of [['p3-7', 3, 7], ['p23-26', 23, 26]]) {
  for (const alphabet of ['original', 'Atbash']) {
    for (const order of ['printed', 'reversed']) {
      for (const reverseKey of [false, true]) {
        for (const sign of /** @type {const} */ ([-1, 1])) {
          const key = reverseKey ? patienceKey.slice().reverse() : patienceKey;
          const firstForcedFailures = [];
          for (let pg = first; pg <= last; pg++) {
            let cipher = alphabet === 'Atbash' ?
              pages[pg].indices.map(v => 28 - v) : pages[pg].indices.slice();
            if (order === 'reversed') cipher.reverse();
            firstForcedFailures.push(keyedFDeath(cipher, key, sign));
          }
          patiencePageReset.push({
            chapter, alphabet, order, reverseKey, sign,
            firstForcedFailures,
            sourcePagesFullyAccepted: firstForcedFailures.filter(x => x === null).length
          });
        }
      }
    }
  }
}
assert.equal(patiencePageReset.length, 32);
assert.ok(patiencePageReset.every(x =>
  x.sourcePagesFullyAccepted < (x.chapter === 'p3-7' ? 5 : 4)));
assert.equal(Math.max(...patiencePageReset.map(x =>
  x.sourcePagesFullyAccepted)), 2);

console.log(JSON.stringify({
  classification: 'conditional source-number coincidence; no unknown-page decryption',
  source: 'original LP2 canonical rune indices and 2014 three magic squares',
  selectedOriginalPages: [3, 7],
  constituentPages, chapterPrimeSums: chapters.map(x => x.sum),
  originalRuneCount: selected.length,
  historicalTitlePrimeComponents: titleParts,
  p7RedFooter: { originalWords: p7PrintedRedWords.map(w => [...w].length), originalPrimeSum: p7OriginalRedSum, handCountedBlackDots: originalFiveDotCount, difference: mp3TitleSum },
  otherFiveDotHeadingPrimeSums,
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
  fiveDotPrimeSuccessors,
  actualPrimeValueStarts,
  oneSuccessorPerPhysicalPage,
  stage10ContiguousQuintets: { originalSections: hillSectionInputs.map(x => [x[0], x[1].length]), originalModels: hillOriginal.length, best: hillBest, authenticKnownP57ClearIoC: ioc29(pages[57].indices), nativeP57PlantRecovered: solvedNativeHillRecovered.length },
  atbashSourcePrimeGates: { models: originalAtbashPrimeGates.length, allFail: true, longest: atbashLongest },
  original2014Patience761Key: { originalGPKeyLength: patienceKey.length, sourceGPPrimeSum: 761, models: patienceSourceKeyResults.length, allFail: true, longest: patienceBest, plantedKnownP57AcceptedRunes: patiencePlant.length },
  original2014Patience761PageReset: { originalModels: patiencePageReset.length, allChaptersFail: true, mostFullSourcePagesAccepted: 2 },
  result: 'observed checksum equality does not select an authentic key or decipherment'
}, null, 2));
