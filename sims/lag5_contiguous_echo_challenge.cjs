'use strict';

/**
 * Original LP2 lag-five contiguous multi-rune echo challenge.
 * Conditions every null word on its exact ciphertext rune multiset,
 * length and within-word adjacent-doublet count.
 *
 * Historical selection caveat: lag five and rune S were previously noticed.
 * This test only corrects its own predeclared lags 2..7.
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const {
  parseUnsolved, random32, shuffledCopy, adjacentEqualCount
} = require('./lag6_conditioned_echo.cjs');

const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const RUNE_INDEX = new Map(ALPHABET.map((rune, index) => [rune, index]));

/**
 * Use only the six LP1 pages printed in clear GP29, not the translated text
 * of pages whose original rune stream is encrypted.
 * @param {string} source Wulfic canonical master transcription.
 */
function parseClearLp1(source) {
  const pageRecords = source.split('%');
  const selected = [3, 8, 9, 10, 11, 14];
  const expectedWords = [31, 40, 55, 49, 38, 18];
  const expectedRunes = [157, 187, 207, 192, 169, 89];
  const pages = selected.map((pageIndex, j) => {
    const normalized = pageRecords[pageIndex].replace(/[\r\n\t\/ ]/g, '');
    const words = normalized.split(/[-.&$§0-9]+/).filter(Boolean).map(word =>
      [...word].map(rune => {
        const value = RUNE_INDEX.get(rune);
        if (value === undefined) throw new Error('Unknown rune in LP1 clear page ' + pageIndex);
        return value;
      }));
    const runes = words.reduce((sum, word) => sum + word.length, 0);
    if (words.length !== expectedWords[j] || runes !== expectedRunes[j]) {
      throw new Error('LP1 clear-page contract changed at p' + pageIndex);
    }
    return { page: pageIndex, words, runes };
  });
  return { pages, words: pages.flatMap(page => page.words) };
}



/**
 * @param {number[][]} words Canonical whole LP2 words.
 * @returns {{pairs:number[], singles:number[], lag5S:number,
 *   lag5WordsWithTwo:number, lag5Triples:number, exposures:number[]}}
 */
function tally(words) {
  const pairs = Array(6).fill(0);
  const singles = Array(11).fill(0);
  const exposures = Array(11).fill(0);
  let lag5S = 0;
  let lag5WordsWithTwo = 0;
  let lag5Triples = 0;
  let conditionalExpectedPairsGivenWordHits = 0;
  for (const word of words) {
    let lag5Own = 0;
    for (let lag = 2; lag <= 12; lag++) {
      for (let i = lag; i < word.length; i++) {
        exposures[lag - 2]++;
        if (word[i] !== word[i - lag]) continue;
        singles[lag - 2]++;
        if (lag === 5) {
          lag5Own++;
          if (word[i] === 15) lag5S++;
        }
        if (lag <= 7 && i > lag && word[i - 1] === word[i - lag - 1]) {
          pairs[lag - 2]++;
          if (lag === 5 && i > lag + 1 &&
              word[i - 2] === word[i - lag - 2]) lag5Triples++;
        }
      }
    }
    if (lag5Own >= 2) {
      lag5WordsWithTwo++;
      // Under uniform placement of this word's observed lag-five hit sites,
      // each adjacent position pair has chance k(k-1)/(n(n-1)).
      conditionalExpectedPairsGivenWordHits += lag5Own * (lag5Own - 1) /
        (word.length - 5);
    }
  }
  return { pairs, singles, lag5S, lag5WordsWithTwo, lag5Triples,
    conditionalExpectedPairsGivenWordHits, exposures };
}

/** @param {number[]} values */
function average(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * @param {number[][]} words
 * @param {number[]} adjacent
 * @param {() => number} random
 * @returns {number[][]}
 */
function shuffledBook(words, adjacent, random) {
  return words.map((word, j) => {
    let candidate;
    do {
      candidate = shuffledCopy(word, random);
    } while (adjacentEqualCount(candidate) !== adjacent[j]);
    return candidate;
  });
}

/**
 * @param {string} source Original canonical LP2 transcription.
 * @param {number} [train=2000] Independent studentization draws.
 * @param {number} [test=5000] Family-maximum null draws.
 * @param {number} [seed=0x6aab5501] Deterministic xorshift seed.
 */
function run(source, train = 2000, test = 5000, seed = 0x6aab5501) {
  if (!Number.isInteger(train) || train < 30 ||
      !Number.isInteger(test) || test < 30) {
    throw new RangeError('train and test must each be at least 30');
  }
  const words = parseUnsolved(source);
  const observed = tally(words);
  const plantedLag5Word = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1];
  const plantedLag5Hits = tally([plantedLag5Word]).singles[3];
  if (plantedLag5Hits !== 7) throw new Error('Lag-five single-hit positive control failed');
  if (observed.singles[3] !== 104 || observed.pairs[3] !== 9 ||
      observed.lag5S !== 11 || observed.lag5WordsWithTwo !== 9 ||
      observed.exposures[3] !== 2105) {
    throw new Error('Canonical ciphertext invariants changed');
  }
  const random = random32(seed);
  const adjacent = words.map(adjacentEqualCount);
  const training = [];
  for (let i = 0; i < train; i++) {
    training.push(tally(shuffledBook(words, adjacent, random)));
  }
  const means = Array.from({ length: 6 }, (_, j) =>
    average(training.map(s => s.pairs[j])));
  const sd = Array.from({ length: 6 }, (_, j) =>
    Math.sqrt(average(training.map(s => (s.pairs[j] - means[j]) ** 2))));
  const singleMeans = Array.from({ length: 11 }, (_, j) =>
    average(training.map(s => s.singles[j])));
  const singleSd = Array.from({ length: 11 }, (_, j) =>
    Math.sqrt(average(training.map(s => (s.singles[j] - singleMeans[j]) ** 2))));
  if (sd.some(x => x <= 0) || singleSd.some(x => x <= 0)) {
    throw new Error('Degenerate calibration');
  }
  const z = observed.pairs.map((n, j) => (n - means[j]) / sd[j]);
  const singleZ = observed.singles.map((n, j) => (n - singleMeans[j]) / singleSd[j]);
  const singleWinner = Math.max(...singleZ.map(Math.abs));
  const singleWinnerLag = 2 + singleZ.map(Math.abs).indexOf(singleWinner);

  const controlSource = fs.readFileSync(path.resolve(__dirname,
    '../resources/transcriptions/lp1_wulfic_canonical.txt'), 'utf8');
  const clearControl = parseClearLp1(controlSource);
  const controlWords = clearControl.words;
  const controlObserved = tally(controlWords);
  if (controlObserved.singles[3] !== 7 || controlObserved.exposures[3] !== 156) {
    throw new Error('LP1 printed-clear control invariant changed');
  }
  const controlAdjacent = controlWords.map(adjacentEqualCount);
  const controlSeed = 0x51a5c0de;
  const controlRandom = random32(controlSeed);
  const controlTraining = [];
  for (let i = 0; i < train; i++) {
    controlTraining.push(tally(shuffledBook(controlWords, controlAdjacent, controlRandom)));
  }
  const controlMean = average(controlTraining.map(sample => sample.singles[3]));
  const controlSd = Math.sqrt(average(controlTraining.map(sample =>
    (sample.singles[3] - controlMean) ** 2)));
  if (controlSd <= 0) throw new Error('Degenerate LP1 control calibration');
  const controlZ = (controlObserved.singles[3] - controlMean) / controlSd;
  const observedZDifference = singleZ[3] - controlZ;


  const winner = Math.max(...z);
  const winnerLag = 2 + z.indexOf(winner);
  let aboveWinner = 0;
  let aboveFixedLag5 = 0;
  let aboveLag5TwoWords = 0;
  let aboveLag5S = 0;
  let aboveJoint = 0;
  let aboveSingleFamily = 0;
  let aboveFixedSingleLag5 = 0;
  let singleLag5Total = 0;
  let controlAboveObserved = 0;
  let controlLag5Total = 0;
  let jointZDifferenceExceedances = 0;
  let jointZDifferenceTotal = 0;
  let jointZDifferenceSquared = 0;
  let largestSingleNullAbsZ = -Infinity;
  let nullMaximum = -Infinity;
  let pairTotal = 0;
  let manyWordsTotal = 0;
  let sTotal = 0;
  let pairSq = 0;
  for (let i = 0; i < test; i++) {
    const m = tally(shuffledBook(words, adjacent, random));
    const controlNull = tally(shuffledBook(controlWords, controlAdjacent, controlRandom));
    const zLp2 = (m.singles[3] - singleMeans[3]) / singleSd[3];
    const zLp1 = (controlNull.singles[3] - controlMean) / controlSd;
    const zDifference = zLp2 - zLp1;
    if (zDifference >= observedZDifference) jointZDifferenceExceedances++;
    jointZDifferenceTotal += zDifference;
    jointZDifferenceSquared += zDifference * zDifference;
    if (controlNull.singles[3] >= controlObserved.singles[3]) controlAboveObserved++;
    controlLag5Total += controlNull.singles[3];
    const best = Math.max(...m.pairs.map((n, j) => (n - means[j]) / sd[j]));
    const p = m.pairs[3];
    const singleMaxAbsZ = Math.max(...m.singles.map((n, j) =>
      Math.abs((n - singleMeans[j]) / singleSd[j])));
    if (singleMaxAbsZ >= singleWinner) aboveSingleFamily++;
    if (m.singles[3] >= observed.singles[3]) aboveFixedSingleLag5++;
    singleLag5Total += m.singles[3];
    largestSingleNullAbsZ = Math.max(largestSingleNullAbsZ, singleMaxAbsZ);
    nullMaximum = Math.max(nullMaximum, best);
    aboveWinner += Number(best >= winner);
    aboveFixedLag5 += Number(p >= observed.pairs[3]);
    aboveLag5TwoWords += Number(m.lag5WordsWithTwo >= observed.lag5WordsWithTwo);
    aboveLag5S += Number(m.lag5S >= observed.lag5S);
    aboveJoint += Number(p >= observed.pairs[3] && m.lag5S >= observed.lag5S);
    pairTotal += p;
    pairSq += p * p;
    manyWordsTotal += m.lag5WordsWithTwo;
    sTotal += m.lag5S;
  }
  const fixedMean = pairTotal / test;
  return {
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    corpusWords: words.length,
    parameters: { train, test, seed: '0x' + (seed >>> 0).toString(16),
      null: 'exact original whole-word multiset, length, and immediate repeat count',
      pairFamily: 'contiguous multi-rune lag-gap adjacency for lags 2 through 7',
      singleFamily: 'absolute standardized single-hit counts for lags 2 through 12',
      controlSeed: '0x51a5c0de', controlPages: [3, 8, 9, 10, 11, 14] },
    observed,
    lags: z.map((value, j) => ({
      lag: j + 2, originalContiguousPairs: observed.pairs[j],
      originalSingles: observed.singles[j], nullMean: means[j],
      nullSd: sd[j], standardizedScore: value
    })),
    familyMaximum: { lag: winnerLag, score: winner,
      nullLargest: nullMaximum, nullExceedances: aboveWinner,
      empiricalP: (aboveWinner + 1) / (test + 1) },
    singleEquality: {
      lags: singleZ.map((value, j) => ({ lag: j + 2,
        originalHits: observed.singles[j], opportunities: observed.exposures[j],
        nullMean: singleMeans[j], nullSd: singleSd[j], standardizedScore: value })),
      lagFive: { observed: observed.singles[3], opportunities: observed.exposures[3],
        nullMean: singleMeans[3], nullSd: singleSd[3], z: singleZ[3],
        fixedLagExceedances: aboveFixedSingleLag5,
        fixedLagEmpiricalP: (aboveFixedSingleLag5 + 1) / (test + 1),
        testNullMean: singleLag5Total / test },
      familyMaximum: { lag: singleWinnerLag, absoluteZ: singleWinner,
        largestNullAbsoluteZ: largestSingleNullAbsZ,
        exceedances: aboveSingleFamily,
        empiricalP: (aboveSingleFamily + 1) / (test + 1) }
    },
    knownClearLp1Control: {
      source: 'resources/transcriptions/lp1_wulfic_canonical.txt',
      sourceSha256: createHash('sha256').update(controlSource).digest('hex'),
      pages: clearControl.pages.map(page => ({ page: page.page, words: page.words.length, runes: page.runes })),
      words: controlWords.length, runes: controlWords.reduce((sum, word) => sum + word.length, 0),
      adjacentEqualities: controlAdjacent.reduce((sum, count) => sum + count, 0),
      lagFive: { observed: controlObserved.singles[3], opportunities: controlObserved.exposures[3],
        nullMean: controlMean, nullSd: controlSd, z: controlZ,
        upperTailExceedances: controlAboveObserved,
        upperTailEmpiricalP: (controlAboveObserved + 1) / (test + 1),
        testNullMean: controlLag5Total / test },
      comparison: { statistic: 'z(LP2) - z(LP1 clear-GP)', observed: observedZDifference,
        nullMean: jointZDifferenceTotal / test,
        nullSd: Math.sqrt(jointZDifferenceSquared / test - (jointZDifferenceTotal / test) ** 2),
        exceedances: jointZDifferenceExceedances,
        empiricalP: (jointZDifferenceExceedances + 1) / (test + 1) }
    },
    positiveControl: { syntheticWordLag5Hits: plantedLag5Hits, expected: 7 },
    lagFive: { originalPairedMatches: observed.pairs[3],
      nullPairMean: fixedMean,
      nullPairSd: Math.sqrt(pairSq / test - fixedMean * fixedMean),
      nullPairedExceedances: aboveFixedLag5,
      fixedP: (aboveFixedLag5 + 1) / (test + 1),
      originalWordsWithAtLeastTwoMatches: observed.lag5WordsWithTwo,
      nullWordsMean: manyWordsTotal / test,
      nullWordsExceedances: aboveLag5TwoWords,
      originalSMatches: observed.lag5S,
      nullSMean: sTotal / test,
      nullSExceedances: aboveLag5S,
      jointPairedAndSExceedances: aboveJoint,
      jointConditionalP: (aboveJoint + 1) / (test + 1) },
    caution: 'The LP1 printed-clear control is smaller and is not a complete language model; the contrast is a ciphertext-side constraint, not a decryption or proof of a period-five cipher.'
  };
}
if (require.main === module) {
  const source = fs.readFileSync(path.resolve(__dirname, '../resources/lp2-transcription.txt'), 'utf8');
  const train = Number(process.argv[2] || '2000');
  const test = Number(process.argv[3] || '5000');
  const seed = Number(process.argv[4] || '0x6aab5501');
  console.log(JSON.stringify(run(source, train, test, seed), null, 2));
}
module.exports = { tally, run };
