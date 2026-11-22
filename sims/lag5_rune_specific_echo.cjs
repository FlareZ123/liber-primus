'use strict';

/**
 * All-29-rune familywise test of word-internal lag-five equality.
 * The observed rune value ᛋ (index 15) was highlighted in prior work,
 * so the correction covers the entire fixed-lag rune identity family,
 * not the original exploratory search over other lags/formulas.
 *
 * Each null keeps each word's exact rune multiset, length and count of
 * adjacent equal runes. An independent training half estimates the
 * standardized baseline for each rune; a test half estimates the null
 * distribution of the maximum across 29 rune-specific scores.
 *
 * @module lag5_rune_specific_echo
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const {
  parseUnsolved, random32, shuffledCopy, adjacentEqualCount
} = require('./lag6_conditioned_echo.cjs');

const N = 29;
const LAG = 5;
const SEED = 0x38a729bb;
const DEFAULT_TRAIN = 3000;
const DEFAULT_TEST = 3000;
const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];

/**
 * @param {number[][]} words Rune-index words with at least 6 runes.
 * @returns {number[]} Number of pairs matching c[i] = c[i-5],
 * classified by their matching rune.
 */
function countRuneEchoes(words) {
  const counts = Array(N).fill(0);
  for (const word of words) {
    for (let i = LAG; i < word.length; i++) {
      if (word[i] === word[i - LAG]) counts[word[i]]++;
    }
  }
  return counts;
}

/**
 * @param {string} source UTF-8 canonical LP2 transcription.
 * @param {number} [trainingReplicates=3000] Samples used ONLY for scaling.
 * @param {number} [testingReplicates=3000] Independent familywise null.
 * @param {number} [seed=SEED] xorshift32 initial seed.
 */
function run(source, trainingReplicates = DEFAULT_TRAIN,
    testingReplicates = DEFAULT_TEST, seed = SEED) {
  if (![trainingReplicates, testingReplicates].every(x => Number.isInteger(x) && x > 1)) {
    throw new RangeError('Both training and test counts must exceed one');
  }
  const full = parseUnsolved(source);
  const words = full.filter(word => word.length > LAG);
  const baseAdjacent = words.map(adjacentEqualCount);
  const observed = countRuneEchoes(words);
  const random = random32(seed);
  let randomizationAttempts = 0;
  const draw = () => {
    const counts = Array(N).fill(0);
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      let permuted;
      do {
        permuted = shuffledCopy(words[wordIndex], random);
        randomizationAttempts++;
      } while (adjacentEqualCount(permuted) !== baseAdjacent[wordIndex]);
      for (let i = LAG; i < permuted.length; i++) {
        if (permuted[i] === permuted[i - LAG]) counts[permuted[i]]++;
      }
    }
    return counts;
  };
  const sums = Array(N).fill(0);
  const squared = Array(N).fill(0);
  for (let replicate = 0; replicate < trainingReplicates; replicate++) {
    const sample = draw();
    for (let rune = 0; rune < N; rune++) {
      sums[rune] += sample[rune];
      squared[rune] += sample[rune] ** 2;
    }
  }
  const means = sums.map(value => value / trainingReplicates);
  const sds = squared.map((value, rune) =>
    Math.sqrt(value / trainingReplicates - means[rune] ** 2));
  if (sds.some(sd => sd === 0)) throw new Error('Null variance degenerate for a rune');
  const zScores = observed.map((value, rune) => (value - means[rune]) / sds[rune]);
  const observedMaximum = Math.max(...zScores);
  const winningRune = zScores.indexOf(observedMaximum);
  let familywiseExceed = 0;
  let fixedSExceed = 0;
  let testSCountSum = 0;
  let largestNullZ = -Infinity;
  for (let replicate = 0; replicate < testingReplicates; replicate++) {
    const sample = draw();
    const maximum = Math.max(...sample.map((value, rune) =>
      (value - means[rune]) / sds[rune]));
    largestNullZ = Math.max(largestNullZ, maximum);
    if (maximum >= observedMaximum) familywiseExceed++;
    if (sample[15] >= observed[15]) fixedSExceed++;
    testSCountSum += sample[15];
  }
  return {
    sourceSha256: createHash('sha256').update(source, 'utf8').digest('hex'),
    originalWords: full.length,
    eligibleWords: words.length,
    eligiblePairs: words.reduce((sum, word) => sum + word.length - LAG, 0),
    observedLag5Matches: observed.reduce((sum, value) => sum + value, 0),
    strongestRune: {
      index: winningRune, rune: ALPHABET[winningRune],
      matches: observed[winningRune], nullMean: means[winningRune],
      nullSd: sds[winningRune], z: observedMaximum
    },
    leadingRunes: observed.map((matches, rune) =>
      ({ index: rune, rune: ALPHABET[rune], matches, nullMean: means[rune],
        nullSd: sds[rune], z: zScores[rune] }))
      .sort((a, b) => b.z - a.z).slice(0, 8),
    null: {
      seed: '0x' + (seed >>> 0).toString(16),
      trainingReplicates, testingReplicates,
      conditioning: 'each word: full symbol multiset, length, exact adjacent-repeat count',
      meanPermutationsPerWord: randomizationAttempts /
        ((trainingReplicates + testingReplicates) * words.length),
      testSCountMean: testSCountSum / testingReplicates,
      largestFamilyNullZ: largestNullZ,
      familywiseExceed,
      familywiseP: (familywiseExceed + 1) / (testingReplicates + 1),
      fixedSExceed,
      fixedSP: (fixedSExceed + 1) / (testingReplicates + 1)
    }
  };
}

if (require.main === module) {
  const source = fs.readFileSync(path.resolve(__dirname, '../resources/lp2-transcription.txt'), 'utf8');
  console.log(JSON.stringify(run(source), null, 2));
}

module.exports = { countRuneEchoes, run };
