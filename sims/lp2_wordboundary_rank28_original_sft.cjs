'use strict';

/**
 * Original LP2 pp11–23 word-initial exclusion-rank test.
 * Source inputs are unchanged; every score is invariant under a secret
 * per-page permutation of the 28 legal nonrepeating next-rune choices.
 *
 * @file Source-native, positive-control, and empirical comparator SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * @param {string} relative
 * @returns {string}
 */
function readText(relative) {
  return fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
}

/**
 * @param {number[]} values
 * @param {number} bins
 * @returns {number}
 */
function equalOrderedPairs(values, bins = 29) {
  const counts = Array(bins).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0);
}

/**
 * @param {number[][]} groups
 * @returns {{numerator: number, denominator: number, ioc: number}}
 */
function pooledWithinGroupCoincidence(groups) {
  let numerator = 0;
  let denominator = 0;
  for (const group of groups) {
    numerator += equalOrderedPairs(group);
    denominator += group.length * (group.length - 1);
  }
  return { numerator, denominator, ioc: numerator / denominator };
}

/**
 * @param {string} page
 * @param {Map<string,number>} runeIndex
 * @returns {{ranks: number[], runeCount: number}}
 */
function boundaryRanks(page, runeIndex) {
  let previous = -1;
  let afterWordSeparator = false;
  let runeCount = 0;
  const ranks = [];
  for (const glyph of page) {
    const current = runeIndex.get(glyph);
    if (current !== undefined) {
      if (afterWordSeparator && previous !== -1) {
        // Exactly 0..27 when Cstart differs from Cprevious.
        ranks.push((current - previous + 28) % 29);
      }
      previous = current;
      afterWordSeparator = false;
      runeCount++;
    } else if ('.-&$'.includes(glyph)) {
      if (previous !== -1) afterWordSeparator = true;
    }
    // Slash, space, newline and page labels are layout, not word stops.
  }
  return { ranks, runeCount };
}

const GP_START = {
  A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6,
  H: 8, I: 10, J: 11, K: 5, L: 20, M: 19,
  N: 9, O: 3, P: 13, Q: 5, R: 4, S: 15,
  T: 16, U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15,
};

/**
 * Published GP29 convention merges C/K, S/Z and U/V.
 * The GP rune TH is a single unit at the start of a word.
 * @param {string} text
 * @returns {number[]}
 */
function englishWordInitialRunes(text) {
  return (text.match(/[A-Za-z]+/g) || []).map((rawWord) => {
    const word = rawWord.toUpperCase();
    return word.startsWith('TH') ? 2 : GP_START[word[0]];
  });
}

/**
 * @param {number[]} sequence
 * @param {number[]} groupLengths
 * @param {number} start
 * @returns {number}
 */
function groupedIoC(sequence, groupLengths, start) {
  let cursor = start;
  const groups = [];
  for (const length of groupLengths) {
    groups.push(sequence.slice(cursor, cursor + length));
    cursor += length;
  }
  return pooledWithinGroupCoincidence(groups).ioc;
}

/**
 * @param {number[]} source
 * @param {number[]} lengths
 * @param {number} originalMax
 * @param {number} originalLocalIoC
 * @returns {object}
 */
function controlScreen(source, lengths, originalMax, originalLocalIoC) {
  const size = lengths.reduce((sum, n) => sum + n, 0);
  assert.ok(source.length >= size);
  const counts = Array(29).fill(0);
  for (let i = 0; i < size; i++) counts[source[i]] += 1;
  let minMax = Number.POSITIVE_INFINITY;
  let belowMax = 0;
  const totalMaxWindows = source.length - size + 1;
  for (let start = 0; start < totalMaxWindows; start++) {
    if (start > 0) {
      counts[source[start - 1]]--;
      counts[source[start + size - 1]]++;
    }
    const maxCount = Math.max(...counts);
    if (maxCount < minMax) minMax = maxCount;
    if (maxCount <= originalMax) belowMax++;
  }

  // Fixed stride 3, established before inspecting source windows.
  // This is a bounded, deterministic corpus comparison, not a p-value.
  let minLocalIoC = Number.POSITIVE_INFINITY;
  let belowLocal = 0;
  let totalLocal = 0;
  for (let start = 0; start + size <= source.length; start += 3) {
    const ioc = groupedIoC(source, lengths, start);
    if (ioc < minLocalIoC) minLocalIoC = ioc;
    if (ioc <= originalLocalIoC) belowLocal++;
    totalLocal++;
  }
  return {
    sourceWords: source.length, maxWindows: totalMaxWindows,
    minimumMaxInitialCount: minMax, maxWindowsAtOrBelowOriginal: belowMax,
    localWindows: totalLocal, minimumPageLocalIoC: minLocalIoC,
    localWindowsAtOrBelowOriginal: belowLocal,
  };
}

const corpus = JSON.parse(readText('resources/liber-primus/lp2-corpus.json'));
const transcription = readText('resources/liber-primus/lp2-transcription.txt');
const pages = transcription.split('%');
assert.equal(corpus.pages.length, 58);
// Physical p50 is entirely numerical and has no rune-transcript block.
assert.equal(pages.length, 57);
pages.splice(50, 0, '');
assert.equal(pages.length, 58);
const runeIndex = new Map([...corpus.runes].map((rune, index) => [rune, index]));
assert.equal(runeIndex.size, 29);

const pageNumbers = Array.from({ length: 13 }, (_, i) => i + 11);
const expectedLengths = [54, 64, 60, 30, 36, 59, 68, 60, 65, 64, 54, 27, 45];
const groups = pageNumbers.map((page) => {
  const result = boundaryRanks(pages[page], runeIndex);
  assert.equal(result.runeCount, corpus.pages[page].indices.length);
  return result.ranks;
});
assert.deepEqual(groups.map((group) => group.length), expectedLengths);
const raw = groups.flat();
assert.equal(raw.length, 686);
assert.ok(raw.every((rank) => rank >= 0 && rank < 28), 'actual words never have identical boundary runes');
const counts = Array(28).fill(0);
for (const rank of raw) counts[rank]++;
const originalMax = Math.max(...counts);
const originalGlobalPairs = equalOrderedPairs(raw, 28);
const originalGlobalIoC = originalGlobalPairs / (raw.length * (raw.length - 1));
const originalLocal = pooledWithinGroupCoincidence(groups);
assert.equal(originalMax, 40);
assert.equal(originalLocal.numerator, 1374);
assert.equal(originalLocal.denominator, 37818);
assert.equal(originalGlobalIoC, 0.03602817560809517);
assert.equal(originalLocal.ioc, 0.036331905441853087);

// Source-native synthetic POSITIVE: a secret invertible 28-symbol
// affine permutation, and an arbitrary previous-cipher word-final rune.
// It is lossless on GP word initials that do not use index28.
const planted = englishWordInitialRunes(readText('resources/control/shakespeare_first300k.txt')).slice(0, 686);
assert.equal(planted.length, 686);
assert.ok(planted.every((value) => value < 28));
let plantRecovered = 0;
for (let i = 0; i < planted.length; i++) {
  const previous = (17 * i + 9) % 29;
  const permuted = (5 * planted[i] + 7) % 28;
  const observed = (previous + 1 + permuted) % 29;
  assert.notEqual(observed, previous);
  const decodedRank = (observed - previous + 28) % 29;
  // 17 is the inverse of 5 modulo28.
  const recovered = (17 * ((decodedRank - 7 + 28) % 28)) % 28;
  assert.equal(recovered, planted[i]);
  plantRecovered++;
}
assert.equal(plantRecovered, 686);

const references = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/gibran_prophet_58585.txt',
];
const controls = references.map((relative) => ({
  reference: relative,
  ...controlScreen(
    englishWordInitialRunes(readText(relative)),
    expectedLengths,
    originalMax,
    originalLocal.ioc
  ),
}));
for (const check of controls) {
  assert.equal(check.maxWindowsAtOrBelowOriginal, 0);
  assert.equal(check.localWindowsAtOrBelowOriginal, 0);
}
console.log(JSON.stringify({
  sourcePages: pageNumbers, boundaryCounts: expectedLengths, observedSameRunes: 0,
  original: { maximumRankFrequency: originalMax, globalIoC: originalGlobalIoC, pageLocal: originalLocal },
  nativeControlPlantRecovered: plantRecovered, controls,
  decision: 'No stationary or page-permuted GP28 exclusion-rank word-initial register with native English initials; source selector remains absent.',
}, null, 2));
