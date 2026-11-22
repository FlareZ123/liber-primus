'use strict';
/**
 * GP29 adjacent-transition diagnostic on the original LP2 p0..p55 corpus.
 * Native CommonJS / Node.js 22, Windows 11 compatible, read-only.
 *
 * Question: after conditioning on the extraordinary 86 self repeats, do
 * ordered pairs disclose a stable next-symbol map beyond the unigram rates?
 * Two fixed-seed Monte Carlo controls preserve every physical page length
 * and its exact number of self repeats.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
/** @type {number[][]} */
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.length, 0), 12956);

const ALPHABET = 29;
const SAMPLES = 1200;

/** @returns {Float64Array[]} */
function zeroMatrix() {
  return Array.from({ length: ALPHABET }, () => new Float64Array(ALPHABET));
}

/**
 * @param {number[][]} texts
 * @returns {Float64Array[]}
 */
function countTransitions(texts) {
  const counts = zeroMatrix();
  for (const runes of texts) {
    for (let i = 1; i < runes.length; i++) {
      counts[runes[i - 1]][runes[i]]++;
    }
  }
  return counts;
}

/**
 * Diagonal-conditioned row-by-column Pearson statistic.
 * The diagonal is excluded; the expected off-diagonal destination count
 * equals the row's nonself total times the observed destination marginal
 * renormalized after excluding that row's source symbol.
 * @param {Float64Array[]} matrix
 * @returns {number}
 */
function offDiagonalStatistic(matrix) {
  const rows = matrix.map(row => row.reduce((s, n) => s + n, 0));
  const columns = Array.from({ length: ALPHABET }, (_, j) =>
    matrix.reduce((s, row) => s + row[j], 0));
  const total = rows.reduce((s, n) => s + n, 0);
  let statistic = 0;
  for (let i = 0; i < ALPHABET; i++) {
    const nonself = rows[i] - matrix[i][i];
    for (let j = 0; j < ALPHABET; j++) {
      if (j === i) continue;
      const expected = nonself * columns[j] / (total - columns[i]);
      statistic += (matrix[i][j] - expected) ** 2 / expected;
    }
  }
  return statistic;
}

/**
 * Deterministic xorshift32, for reproducible nulls.
 * @param {number} seed
 * @returns {() => number}
 */
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Sample GP symbol using empirical symbol weights, excluding one glyph.
 * @param {Float64Array} weights
 * @param {number} except -1 means no exclusion.
 * @param {() => number} random
 * @returns {number}
 */
function sampleSymbol(weights, except, random) {
  let sum = 0;
  for (let i = 0; i < ALPHABET; i++) {
    if (i !== except) sum += weights[i];
  }
  let position = random() * sum;
  for (let i = 0; i < ALPHABET; i++) {
    if (i === except) continue;
    position -= weights[i];
    if (position < 0) return i;
  }
  return except === ALPHABET - 1 ? ALPHABET - 2 : ALPHABET - 1;
}

const source = countTransitions(pages);
const repeated = pages.map(page => page.reduce((s, value, i) =>
  s + Number(i > 0 && value === page[i - 1]), 0));
const globalWeights = new Float64Array(ALPHABET);
const pageWeights = pages.map(page => {
  const weight = new Float64Array(ALPHABET);
  for (const value of page) {
    weight[value]++;
    globalWeights[value]++;
  }
  return weight;
});
assert.equal(repeated.reduce((s, n) => s + n, 0), 86);
assert.equal(source.reduce((s, row) =>
  s + row.reduce((x, v) => x + v, 0), 0), 12901);
const observed = offDiagonalStatistic(source);
assert.ok(Math.abs(observed - 783.0869339889692) < 1e-7);

/**
 * Preserve exact per-page repeat count, randomized original-repeat sites,
 * and either global or source-page-local unigram destination weights.
 * @param {boolean} pageLocal
 * @param {() => number} random
 * @param {boolean} plantDependence
 * @returns {Float64Array[]}
 */
function surrogate(pageLocal, random, plantDependence = false) {
  const table = zeroMatrix();
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const length = pages[pageIndex].length;
    const repeats = repeated[pageIndex];
    const positions = new Uint8Array(length);
    const eligible = Array.from({ length: length - 1 }, (_, i) => i + 1);
    for (let i = 0; i < repeats; i++) {
      const selected = i + Math.floor(random() * (eligible.length - i));
      const tmp = eligible[selected];
      eligible[selected] = eligible[i];
      eligible[i] = tmp;
      positions[eligible[i]] = 1;
    }
    const weights = pageLocal ? pageWeights[pageIndex] : globalWeights;
    let previous = sampleSymbol(weights, -1, random);
    for (let i = 1; i < length; i++) {
      let current = positions[i] ? previous :
        sampleSymbol(weights, previous, random);
      if (plantDependence && !positions[i] && random() < 0.30) {
        current = (previous + 1) % ALPHABET;
      }
      table[previous][current]++;
      previous = current;
    }
  }
  return table;
}

/**
 * @param {boolean} pageLocal
 * @returns {{null:string,greaterOrEqual:number,samples:number,upperTailP:number,median:number,p05:number,p95:number}}
 */
function calibrate(pageLocal) {
  const random = makeRandom(pageLocal ? 3302 : 3301);
  const values = [];
  for (let sample = 0; sample < SAMPLES; sample++) {
    values.push(offDiagonalStatistic(surrogate(pageLocal, random)));
  }
  values.sort((a, b) => a - b);
  const greaterOrEqual = values.filter(value => value >= observed).length;
  return {
    null: pageLocal ? 'page-specific marginal + exact page repeat count' :
      'global marginal + exact page repeat count',
    greaterOrEqual,
    samples: SAMPLES,
    upperTailP: (greaterOrEqual + 1) / (SAMPLES + 1),
    median: values[Math.floor(SAMPLES / 2)],
    p05: values[Math.floor(SAMPLES * 0.05)],
    p95: values[Math.floor(SAMPLES * 0.95)]
  };
}

const globalControl = calibrate(false);
const pageControl = calibrate(true);
const planted = offDiagonalStatistic(surrogate(
  false, makeRandom(2014), true
));
assert.ok(planted > 10000, '30% fixed successor plant must be obvious');
assert.ok(globalControl.upperTailP > 0.05);
assert.ok(pageControl.upperTailP > 0.05);

console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  pages: pages.length,
  runes: 12956,
  pageLocalTransitions: 12901,
  selfRepeats: 86,
  observedOffDiagonalPearson: observed,
  globalControl,
  pageControl,
  fixedSuccessorPositive: planted,
  scope: 'No first-order off-diagonal source-level signal at this resolution; no plaintext, cipher or key recovered.'
}, null, 2));
