'use strict';

/**
 * Family-wise null test of the LP2 lag-six affine echo.
 *
 * Searches all 28*29 bijective mod-29 affine transformations at lags 2..8,
 * using fresh whole-word shuffles that retain exact rune multiset, word length,
 * and adjacent-equal rune count in EVERY word.
 *
 * @module affine_echo_global_search
 */
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const INDEX = new Map(ALPHABET.map((rune, i) => [rune, i]));
const LAGS = [2, 3, 4, 5, 6, 7, 8];
const MODULUS = 29;
const MODELS_PER_LAG = 28 * 29;
const TRAIN_REPLICATES = 400;
const TEST_REPLICATES = 1000;
const SEED = 0x19871519;

/**
 * Canonical word stream, retaining rune words crossing physical page breaks.
 * @param {string} raw Canonical LP2 transcription.
 * @returns {number[][]}
 */
function parseWords(raw) {
  const pages = raw.split('%').slice(0, 55);
  const text = pages.join('%').replace(/[\r\n\t\/% ]/g, '');
  const words = text.split(/[-.&$§0-9]+/).filter(Boolean).map((word) =>
    [...word].map((rune) => {
      const index = INDEX.get(rune);
      if (index === undefined) throw new Error('Unknown GP rune');
      return index;
    }));
  const runes = words.reduce((sum, word) => sum + word.length, 0);
  if (words.length !== 2896 || runes !== 12956) {
    throw new Error('Canonical LP2 corpus mismatch');
  }
  return words;
}

/** @param {number} seed Nonzero 32-bit seed. */
function random32(seed) {
  let state = seed >>> 0;
  return function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} word Rune values. */
function doublets(word) {
  let count = 0;
  for (let i = 1; i < word.length; i++) count += +(word[i] === word[i - 1]);
  return count;
}

/**
 * Uniform random word-order shuffles conditioned on the exact original
 * adjacent-equal count (modulo negligible xorshift modulo bias).
 * @param {number[][]} words Original word stream.
 * @param {number[]} requirements Exact per-word adjacent doublet counts.
 * @param {() => number} random Deterministic PRNG.
 * @returns {number[][]}
 */
function shuffledWords(words, requirements, random) {
  return words.map((word, wordIndex) => {
    if (word.length < 3) return word;
    let candidate;
    do {
      candidate = word.slice();
      for (let i = candidate.length - 1; i > 0; i--) {
        const j = random() % (i + 1);
        [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
      }
    } while (doublets(candidate) !== requirements[wordIndex]);
    return candidate;
  });
}

/** @returns {Array<{a:number,b:number,lookups:Uint16Array}>} */
function affineModels() {
  const models = [];
  for (let a = 1; a < MODULUS; a++) {
    for (let b = 0; b < MODULUS; b++) {
      const lookups = Uint16Array.from({length: MODULUS},
        (_, x) => MODULUS * x + ((a * x + b) % MODULUS));
      models.push({a, b, lookups});
    }
  }
  return models;
}

/**
 * Return counts of all affine candidates across lags in fixed order.
 * @param {number[][]} words
 * @param {ReturnType<typeof affineModels>} models
 * @returns {Uint16Array}
 */
function score(words, models) {
  const output = new Uint16Array(LAGS.length * models.length);
  let key = 0;
  for (const lag of LAGS) {
    const table = new Uint16Array(MODULUS * MODULUS);
    for (const word of words) {
      for (let i = lag; i < word.length; i++) {
        table[MODULUS * word[i - lag] + word[i]]++;
      }
    }
    for (const model of models) {
      let count = 0;
      for (let x = 0; x < MODULUS; x++) {
        count += table[model.lookups[x]];
      }
      output[key++] = count;
    }
  }
  return output;
}

/**
 * Continuous stream check distinguishing within-word and across-word lag-6
 * pairs, with the physical-page-exclusion variant also reported.
 * @param {string} source Original text with page separators.
 */
function boundaryContrast(source) {
  const records = Array.from({length: 55}, () => []);
  let page = 0;
  let word = 0;
  for (const rune of source.split('%').slice(0, 55).join('%')) {
    const value = INDEX.get(rune);
    if (value !== undefined) {
      records[page].push({value, word});
    } else if (rune === '%') {
      page++;
    } else if (!'/\r\n\t '.includes(rune)) {
      word++;
    }
  }
  /** @param {Array<Array<{value:number,word:number}>>} groups */
  const measure = (groups) => {
    const result = {acrossWords: {pairs: 0, matches: 0},
      withinWords: {pairs: 0, matches: 0}};
    for (const entries of groups) {
      for (let i = 6; i < entries.length; i++) {
        const row = entries[i].word === entries[i - 6].word
          ? result.withinWords : result.acrossWords;
        row.pairs++;
        row.matches += +(entries[i].value ===
          (24 - 2 * entries[i - 6].value + 2 * MODULUS) % MODULUS);
      }
    }
    return result;
  };
  return {
    pageLocal: measure(records),
    manuscriptContinuous: measure([records.flat()])
  };
}

/**
 * Compute independent training and test null sets, family-wise correcting
 * the predeclared full search for best-of-5684 selection.
 * @param {string} source
 */
function run(source) {
  const words = parseWords(source);
  const models = affineModels();
  const requirements = words.map(doublets);
  const random = random32(SEED);
  const observed = score(words, models);
  const modelCount = observed.length;
  const sum = new Float64Array(modelCount);
  const sumSquares = new Float64Array(modelCount);

  for (let sample = 0; sample < TRAIN_REPLICATES; sample++) {
    const counts = score(shuffledWords(words, requirements, random), models);
    for (let i = 0; i < modelCount; i++) {
      sum[i] += counts[i];
      sumSquares[i] += counts[i] * counts[i];
    }
  }
  const means = new Float64Array(modelCount);
  const deviations = new Float64Array(modelCount);
  /** @type {Array<{lag:number,a:number,b:number,count:number,expected:number,sd:number,z:number}>} */
  const ranked = [];
  for (let i = 0; i < modelCount; i++) {
    means[i] = sum[i] / TRAIN_REPLICATES;
    deviations[i] = Math.sqrt(Math.max(0,
      sumSquares[i] / TRAIN_REPLICATES - means[i] * means[i]));
    const model = models[i % MODELS_PER_LAG];
    ranked.push({
      lag: LAGS[Math.floor(i / MODELS_PER_LAG)],
      a: model.a, b: model.b, count: observed[i],
      expected: means[i], sd: deviations[i],
      z: deviations[i] > 0
        ? (observed[i] - means[i]) / deviations[i] : -Infinity
    });
  }
  ranked.sort((a, b) => b.z - a.z);
  if (ranked[0].lag !== 6 || ranked[0].a !== 27 ||
      ranked[0].b !== 24 || ranked[0].count !== 80) {
    throw new Error('The previously discovered affine echo is not top');
  }
  const observedMaximum = ranked[0].z;

  const nullMaxima = [];
  let exceed = 0;
  for (let sample = 0; sample < TEST_REPLICATES; sample++) {
    const counts = score(shuffledWords(words, requirements, random), models);
    let maxZ = -Infinity;
    for (let i = 0; i < modelCount; i++) {
      if (deviations[i] > 0) {
        const z = (counts[i] - means[i]) / deviations[i];
        if (z > maxZ) maxZ = z;
      }
    }
    nullMaxima.push(maxZ);
    if (maxZ >= observedMaximum) exceed++;
  }
  nullMaxima.sort((a, b) => a - b);
  const half = words.length / 2;
  /** @param {number[][]} subset */
  const echoCount = (subset) => subset.reduce((total, word) => {
    for (let i = 6; i < word.length; i++) {
      total += +(word[i] === (24 - 2 * word[i - 6] + 58) % 29);
    }
    return total;
  }, 0);

  return {
    schema: 1,
    inputSha256: createHash('sha256').update(source, 'utf8').digest('hex'),
    words: words.length,
    runes: words.reduce((n, word) => n + word.length, 0),
    lags: LAGS,
    candidateAffineMaps: modelCount,
    nullCondition: 'exact per-word rune multiset, length and adjacent doublets',
    trainingReplicates: TRAIN_REPLICATES,
    testingReplicates: TEST_REPLICATES,
    seed: '0x' + SEED.toString(16),
    observedBest: ranked[0],
    observedNextCandidates: ranked.slice(1, 6),
    nullMaximum: {
      mean: nullMaxima.reduce((sum, value) => sum + value, 0) /
        TEST_REPLICATES,
      percentile95: nullMaxima[Math.floor(0.95 * TEST_REPLICATES)],
      percentile99: nullMaxima[Math.floor(0.99 * TEST_REPLICATES)],
      maximum: nullMaxima[nullMaxima.length - 1],
      exceedances: exceed,
      familywiseEmpiricalP: (exceed + 1) / (TEST_REPLICATES + 1)
    },
    withinWordHalfSplit: {
      first1448Words: echoCount(words.slice(0, half)),
      last1448Words: echoCount(words.slice(half))
    },
    lag6BoundaryContrast: boundaryContrast(source)
  };
}

if (require.main === module) {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../resources/lp2-transcription.txt'), 'utf8');
  console.log(JSON.stringify(run(source), null, 2));
}

module.exports = {parseWords, random32, doublets, shuffledWords,
  affineModels, score, boundaryContrast, run};
