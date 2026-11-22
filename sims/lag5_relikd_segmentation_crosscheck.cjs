#!/usr/bin/env node
'use strict';

// Independent relikd/LiberPrayground word-boundary robustness SFT.
// The four apostrophe boundaries were read from the nine public LP2 section
// files; the 12,956-rune stream itself is identical to our canonical corpus.
// Run from repository root:
//   node sims/lag5_relikd_segmentation_crosscheck.cjs [train=2000] [test=5000] [seed=0x6aab5501]

const fs = require('node:fs');
const assert = require('node:assert/strict');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const parsed = parseSharedCorpus();
const currentWords = parsed.words.map((w) =>
  Array.from(w.runes).map((r) => corpus.runes.indexOf(r)));
const cuts = [1110, 5138, 8515, 10089];

assert.equal(parsed.runeCount, 12956);
assert.equal(currentWords.length, 2896);
assert.ok(currentWords.flat().every((r) => r >= 0));

// Split only at the four apostrophe boundaries found in relikd's pages.
// Offsets count runes before the boundary, from the start of the LP2 stream.
const relikdWords = [];
let offset = 0;
for (const word of currentWords) {
  const end = offset + word.length;
  const localCuts = cuts.filter((cut) => cut > offset && cut < end)
    .map((cut) => cut - offset);
  let start = 0;
  for (const cut of localCuts) {
    relikdWords.push(word.slice(start, cut));
    start = cut;
  }
  relikdWords.push(word.slice(start));
  offset = end;
}

function adjacentEqualCount(word) {
  let count = 0;
  for (let i = 1; i < word.length; i++) {
    if (word[i] === word[i - 1]) count++;
  }
  return count;
}
function tally(words) {
  const singles = Array(11).fill(0);
  const pairs = Array(6).fill(0);
  const exposures = Array(11).fill(0);
  for (const word of words) {
    for (let lag = 2; lag <= 12; lag++) {
      for (let i = lag; i < word.length; i++) {
        exposures[lag - 2]++;
        if (word[i] !== word[i - lag]) continue;
        singles[lag - 2]++;
        if (lag <= 7 && i > lag && word[i - 1] === word[i - lag - 1]) {
          pairs[lag - 2]++;
        }
      }
    }
  }
  return { singles, pairs, exposures };
}
function random32(seed) {
  let x = seed >>> 0;
  if (!x) throw new RangeError('Nonzero RNG seed required');
  return function next() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x;
  };
}
function shuffledCopy(original, random) {
  const word = original.slice();
  for (let i = word.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [word[i], word[j]] = [word[j], word[i]];
  }
  return word;
}
const adjacent = relikdWords.map(adjacentEqualCount);
function shuffledBook(random) {
  return relikdWords.map((word, j) => {
    let candidate;
    do {
      candidate = shuffledCopy(word, random);
    } while (adjacentEqualCount(candidate) !== adjacent[j]);
    return candidate;
  });
}
function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const currentObserved = tally(currentWords);
const observed = tally(relikdWords);
assert.equal(relikdWords.length, 2900);
assert.deepEqual(relikdWords.flat(), currentWords.flat());
assert.deepEqual(currentObserved.singles[3], observed.singles[3]);
assert.deepEqual(currentObserved.exposures[3], observed.exposures[3]);
assert.deepEqual(currentObserved.pairs[3], observed.pairs[3]);
const planted = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1];
const plantedHits = tally([planted]).singles[3];
assert.equal(relikdWords.length, 2900);
assert.deepEqual(observed.singles[3], 104);
assert.deepEqual(observed.exposures[3], 2105);
assert.deepEqual(observed.pairs[3], 9);
assert.equal(plantedHits, 7);

const train = Number(process.argv[2] || '2000');
const test = Number(process.argv[3] || '5000');
const seed = Number(process.argv[4] || '0x6aab5501');
if (!Number.isInteger(train) || train < 30 || !Number.isInteger(test) || test < 30) {
  throw new RangeError('train and test must each be at least 30');
}
const random = random32(seed);
const sumSingles = Array(11).fill(0);
const sumSingles2 = Array(11).fill(0);
const sumPairs = Array(6).fill(0);
const sumPairs2 = Array(6).fill(0);

for (let n = 0; n < train; n++) {
  const sample = tally(shuffledBook(random));
  for (let j = 0; j < 11; j++) {
    sumSingles[j] += sample.singles[j];
    sumSingles2[j] += sample.singles[j] ** 2;
  }
  for (let j = 0; j < 6; j++) {
    sumPairs[j] += sample.pairs[j];
    sumPairs2[j] += sample.pairs[j] ** 2;
  }
}
const meanSingles = sumSingles.map((x) => x / train);
const sdSingles = sumSingles.map((x, j) =>
  Math.sqrt(sumSingles2[j] / train - meanSingles[j] ** 2));
const meanPairs = sumPairs.map((x) => x / train);
const sdPairs = sumPairs.map((x, j) =>
  Math.sqrt(sumPairs2[j] / train - meanPairs[j] ** 2));
if (sdSingles.some((x) => x <= 0) || sdPairs.some((x) => x <= 0)) {
  throw new Error('Degenerate calibration');
}

const singleZ = observed.singles.map((x, j) => (x - meanSingles[j]) / sdSingles[j]);
const pairZ = observed.pairs.map((x, j) => (x - meanPairs[j]) / sdPairs[j]);
const singleMaximum = Math.max(...singleZ.map(Math.abs));
const pairMaximum = Math.max(...pairZ);
const singleWinnerLag = 2 + singleZ.map(Math.abs).indexOf(singleMaximum);
const pairWinnerLag = 2 + pairZ.indexOf(pairMaximum);
let singleExceedances = 0;
let pairExceedances = 0;
let testSingleLag5 = 0;
let testPairLag5 = 0;
for (let n = 0; n < test; n++) {
  const sample = tally(shuffledBook(random));
  const nullSingleMaximum = Math.max(...sample.singles.map((x, j) =>
    Math.abs((x - meanSingles[j]) / sdSingles[j])));
  const nullPairMaximum = Math.max(...sample.pairs.map((x, j) =>
    (x - meanPairs[j]) / sdPairs[j]));
  if (nullSingleMaximum >= singleMaximum) singleExceedances++;
  if (nullPairMaximum >= pairMaximum) pairExceedances++;
  testSingleLag5 += sample.singles[3];
  testPairLag5 += sample.pairs[3];
}

console.log(JSON.stringify({
  source: 'relikd/LiberPrayground nine LP2 section files; exact 12,956-rune stream',
  segmentation: {
    currentWords: currentWords.length,
    relikdWords: relikdWords.length,
    runes: parsed.runeCount,
    extraBoundaries: cuts,
    extraBoundaryGlyph: "apostrophe U+0027",
  },
  currentSegmentationLag5: { hits: currentObserved.singles[3], opportunities: currentObserved.exposures[3], contiguousPairs: currentObserved.pairs[3] },
  observed,
  positiveControl: { plantedLag5Hits: plantedHits, expected: 7 },
  parameters: { train, test, seed: '0x' + (seed >>> 0).toString(16),
    null: 'independent per-word permutation preserving exact multiset, length, and adjacent-equal count' },
  singleFamily: {
    lags: singleZ.map((z, j) => ({ lag: j + 2, observed: observed.singles[j],
      opportunities: observed.exposures[j], nullMean: meanSingles[j],
      nullSd: sdSingles[j], z })),
    winnerLag: singleWinnerLag,
    maxAbsZ: singleMaximum,
    nullExceedances: singleExceedances,
    empiricalP: (singleExceedances + 1) / (test + 1),
    lag5TestNullMean: testSingleLag5 / test,
  },
  pairFamily: {
    lags: pairZ.map((z, j) => ({ lag: j + 2, observed: observed.pairs[j],
      nullMean: meanPairs[j], nullSd: sdPairs[j], z })),
    winnerLag: pairWinnerLag,
    maxPositiveZ: pairMaximum,
    nullExceedances: pairExceedances,
    empiricalP: (pairExceedances + 1) / (test + 1),
    lag5TestNullMean: testPairLag5 / test,
  },
}, null, 2));
