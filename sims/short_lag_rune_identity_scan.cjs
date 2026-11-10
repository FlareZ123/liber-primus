'use strict';

/**
 * Scan 174 rune-identity autocorrelation hypotheses:
 * 29 rune identities x word-internal lags 2, 3, 4, 5, 6, 7.
 *
 * Per-word randomizations preserve all rune multiplicities and the precise
 * count of adjacent equal glyphs. Independent training and test randomizations
 * implement a familywise max-z null across the entire specified collection.
 *
 * Lag 1 is excluded because the manuscript's immediate-repeat suppression
 * is already established. Lag 7 has 731 eligible pairs, keeping all tested
 * lags supported by hundreds of positions.
 *
 * @module short_lag_rune_identity_scan
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const {
  parseUnsolved, random32, shuffledCopy, adjacentEqualCount
} = require('./lag6_conditioned_echo.cjs');
const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const MIN_LAG = 2;
const MAX_LAG = 7;
const NUMBER_OF_HYPOTHESES = 29 * (MAX_LAG - MIN_LAG + 1);
const SEED = 0x284ed557;

/**
 * @param {number[][]} words Words with >=3 rune indexes.
 * @returns {number[]} Flattened cells ordered by lag, then rune 0...28.
 */
function scanCounts(words) {
  const counts = Array(NUMBER_OF_HYPOTHESES).fill(0);
  for (const word of words) {
    for (let lag = MIN_LAG; lag <= MAX_LAG; lag++) {
      for (let i = lag; i < word.length; i++) {
        if (word[i] === word[i - lag]) {
          counts[(lag - MIN_LAG) * 29 + word[i]]++;
        }
      }
    }
  }
  return counts;
}

/**
 * @param {string} source Canonical rune-transcription text.
 * @param {number} [train=3000] Independent calibration samples.
 * @param {number} [test=3000] Independent familywise null samples.
 * @param {number} [seed=SEED] Unsigned pseudorandom generator seed.
 */
function run(source, train = 3000, test = 3000, seed = SEED) {
  if (![train, test].every(x => Number.isInteger(x) && x > 1)) {
    throw new RangeError('The independent training and test sample counts must exceed one');
  }
  const original = parseUnsolved(source);
  const words = original.filter(word => word.length > MIN_LAG);
  const adjacentCounts = words.map(adjacentEqualCount);
  const observed = scanCounts(words);
  const rand = random32(seed);
  let attempts = 0;
  const drawCounts = () => {
    const out = Array(NUMBER_OF_HYPOTHESES).fill(0);
    for (let j = 0; j < words.length; j++) {
      let shuffled;
      do {
        shuffled = shuffledCopy(words[j], rand);
        attempts++;
      } while (adjacentEqualCount(shuffled) !== adjacentCounts[j]);
      for (let lag = MIN_LAG; lag <= MAX_LAG; lag++) {
        for (let i = lag; i < shuffled.length; i++) {
          if (shuffled[i] === shuffled[i - lag]) {
            out[(lag - MIN_LAG) * 29 + shuffled[i]]++;
          }
        }
      }
    }
    return out;
  };

  const sums = Array(NUMBER_OF_HYPOTHESES).fill(0);
  const squares = Array(NUMBER_OF_HYPOTHESES).fill(0);
  for (let trial = 0; trial < train; trial++) {
    const counts = drawCounts();
    for (let key = 0; key < NUMBER_OF_HYPOTHESES; key++) {
      sums[key] += counts[key];
      squares[key] += counts[key] ** 2;
    }
  }
  const means = sums.map(n => n / train);
  const standardDeviations = squares.map((sum, k) =>
    Math.sqrt(sum / train - means[k] ** 2));
  const standardize = (count, k) =>
    standardDeviations[k] ? (count - means[k]) / standardDeviations[k] : -Infinity;
  const scores = observed.map(standardize);
  const highestScore = Math.max(...scores);
  const bestKey = scores.indexOf(highestScore);
  let familywiseExceed = 0;
  let largestNullScore = -Infinity;
  for (let trial = 0; trial < test; trial++) {
    const sample = drawCounts();
    const maxScore = Math.max(...sample.map(standardize));
    if (maxScore >= highestScore) familywiseExceed++;
    largestNullScore = Math.max(largestNullScore, maxScore);
  }
  const leading = scores.map((z, k) => ({
    lag: Math.floor(k / 29) + MIN_LAG,
    runeIndex: k % 29,
    rune: ALPHABET[k % 29],
    observed: observed[k], mean: means[k], sd: standardDeviations[k], z
  })).sort((a, b) => b.z - a.z).slice(0, 12);

  return {
    sourceSha256: createHash('sha256').update(source, 'utf8').digest('hex'),
    words: original.length, runes: original.reduce((n, w) => n + w.length, 0),
    families: { runeIdentities: 29, lags: [2, 3, 4, 5, 6, 7],
      total: NUMBER_OF_HYPOTHESES },
    observation: { winningHypothesis: leading[0], leading },
    null: {
      conditionalOn: 'per-word complete rune multiset and exact immediate-repeat count',
      seed: '0x' + (seed >>> 0).toString(16),
      train, test,
      averagePermutationsPerWord: attempts / ((train + test) * words.length),
      largestNullScore,
      familywiseExceed,
      familywiseP: (familywiseExceed + 1) / (test + 1)
    }
  };
}

if (require.main === module) {
  const source = fs.readFileSync(path.resolve(__dirname, '../resources/lp2-transcription.txt'), 'utf8');
  console.log(JSON.stringify(run(source), null, 2));
}

module.exports = { scanCounts, run };
