'use strict';

/**
 * Printed-line-phase invariant for unresolved LP2.
 *
 * Tests whether ciphertext lines share a restarted deterministic, position-
 * indexed substitution/permutation key. A shared bijection at position k
 * preserves collision probability across lines at that same k, even if
 * the substitution alphabet is unknown. Reports per-line-rotation controls
 * and a frozen 28-page/27-page cross-half prediction.
 *
 * Inputs: canonical LP2 corpus and its slash-delimited printed-line source.
 * Run: node sims/printed_line_phase_invariant.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const lp1 = fs.readFileSync(path.join(ROOT, 'resources/transcriptions/lp1_wulfic_canonical.txt'), 'utf8');
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const M = 29;
const WIDTH = 27;
const TAU = 100;
assert.equal(corpus.runes.length, M);

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {string} text @returns {number[]} */
function indices(text) {
  const out = [];
  for (const r of text) if (runeMap.has(r)) out.push(runeMap.get(r));
  return out;
}

const pages = source.split(/^\s*%\s*$/m).map((text, p) => ({
  page: p >= 50 ? p + 1 : p,
  lines: text.split('/').map(indices).filter(a => a.length)
}));
assert.equal(pages.length, 57);
for (const p of pages) {
  const ref = corpus.pages.find(page => page.page === p.page);
  assert.ok(ref);
  assert.deepEqual(p.lines.flat(), ref.indices, 'printed lines disagree with corpus at page ' + p.page);
}
const unsolved = pages.filter(p => p.page < 56);
assert.equal(unsolved.length, 55);
const rows = unsolved.flatMap(p => p.lines);
assert.equal(rows.length, 594);
assert.equal(rows.reduce((n, r) => n + r.length, 0), 12956);
assert.ok(rows.every(r => r.length < WIDTH));

/**
 * Probability of equal ciphertext runes at the same within-line offset.
 * Rotations are independent cyclic shifts of each printed line, preserving
 * its complete inventory, length, and internal runic order.
 * @param {number[][]} lines
 * @param {Int32Array | undefined} shifts
 */
function collision(lines, shifts) {
  const bins = Array.from({length: WIDTH}, () => new Int32Array(M));
  const sizes = new Int32Array(WIDTH);
  for (let j = 0; j < lines.length; j++) {
    const row = lines[j], off = shifts ? shifts[j] : 0;
    for (let k = 0; k < row.length; k++) {
      bins[k][row[(k + off) % row.length]]++;
      sizes[k]++;
    }
  }
  let numerator = 0, denominator = 0;
  for (let k = 0; k < WIDTH; k++) {
    denominator += sizes[k] * (sizes[k] - 1);
    for (const n of bins[k]) numerator += n * (n - 1);
  }
  return numerator / denominator;
}

/**
 * @param {number[][]} lines
 * @param {number} repetitions
 * @param {() => number} random
 */
function rotationNull(lines, repetitions, random) {
  const actual = collision(lines), shifts = new Int32Array(lines.length);
  let high = 0, mean = 0, second = 0;
  for (let i = 0; i < repetitions; i++) {
    for (let j = 0; j < lines.length; j++)
      shifts[j] = random() % lines[j].length;
    const s = collision(lines, shifts);
    high += s >= actual;
    mean += s;
    second += s * s;
  }
  mean /= repetitions;
  return {
    lines: lines.length,
    runes: lines.reduce((n, r) => n + r.length, 0),
    observed: actual,
    nullMean: mean,
    nullSD: Math.sqrt(second / repetitions - mean * mean),
    exceedances: high,
    repetitions,
    pUpper: (high + 1) / (repetitions + 1)
  };
}

/**
 * Position-wise GP-rune log-probabilities learned only from training lines.
 * Shrink by 100 pseudo-observations distributed as training global unigram.
 * @param {number[][]} lines
 */
function learn(lines) {
  const counts = Array.from({length: WIDTH}, () => new Float64Array(M));
  const n = new Int32Array(WIDTH), total = new Float64Array(M);
  let totalN = 0;
  for (const row of lines) for (let k = 0; k < row.length; k++) {
    counts[k][row[k]]++;
    n[k]++;
    total[row[k]]++;
    totalN++;
  }
  const weights = Array.from({length: WIDTH}, () => new Float64Array(M));
  for (let k = 0; k < WIDTH; k++) for (let s = 0; s < M; s++) {
    const q = (total[s] + 1) / (totalN + M);
    weights[k][s] = Math.log((counts[k][s] + TAU * q) / (n[k] + TAU) / q);
  }
  return weights;
}

/** @param {number[][]} lines @param {Float64Array[]} weights @param {Int32Array | undefined} shifts */
function score(lines, weights, shifts) {
  let result = 0;
  for (let j = 0; j < lines.length; j++) {
    const row = lines[j], off = shifts ? shifts[j] : 0;
    for (let k = 0; k < row.length; k++)
      result += weights[k][row[(k + off) % row.length]];
  }
  return result;
}

/**
 * Freeze weights on one half, test unfitted pages against independent
 * test-line rotations (training fitted once).
 * @param {number[][]} training
 * @param {number[][]} test
 * @param {number} repetitions
 * @param {() => number} random
 */
function transfer(training, test, repetitions, random) {
  const weights = learn(training), actual = score(test, weights);
  const shifts = new Int32Array(test.length);
  let high = 0, mean = 0, second = 0;
  for (let b = 0; b < repetitions; b++) {
    for (let j = 0; j < test.length; j++)
      shifts[j] = random() % test[j].length;
    const value = score(test, weights, shifts);
    high += value >= actual;
    mean += value;
    second += value * value;
  }
  mean /= repetitions;
  return {
    trainingLines: training.length,
    testLines: test.length,
    observedLogLR: actual,
    nullMean: mean,
    nullSD: Math.sqrt(second / repetitions - mean * mean),
    exceedances: high,
    repetitions,
    pUpper: (high + 1) / (repetitions + 1)
  };
}

/** @returns {number[]} */
function englishPrior() {
  const freq = Array(M).fill(1);
  const segments = lp1.split('%');
  for (const n of [3, 8, 9, 10, 11, 14])
    for (const id of indices(segments[n])) freq[id]++;
  for (const page of corpus.pages.filter(p => p.status === 'solved'))
    for (const id of page.indices) freq[id]++;
  const sum = freq.reduce((a, b) => a + b, 0);
  let cdf = 0;
  return freq.map(x => (cdf += x / sum));
}

/** @param {number} count */
function controls(count) {
  const rand = rng(0x1d7e5a33);
  const uniform = () => rand() / 4294967296;
  const cdf = englishPrior();
  const key = Array.from({length: WIDTH}, () => Math.floor(uniform() * M));
  const draw = () => {
    const u = uniform();
    let k = 0;
    while (k < M - 1 && u > cdf[k]) k++;
    return k;
  };
  const shared = [], independent = [];
  for (let trial = 0; trial < count; trial++) {
    const a = [], b = [];
    for (const row of rows) {
      const ar = [], br = [];
      let prevA = -1, prevB = -1;
      for (let k = 0; k < row.length; k++) {
        const p = draw();
        let ca = (p + key[k]) % M;
        let cb = (p + Math.floor(uniform() * M)) % M;
        // Bounded diagnostic 81% rewriting; it does NOT make an invertible cipher.
        if (ca === prevA && uniform() < 0.81) ca = (ca + 1 + Math.floor(uniform() * 28)) % M;
        if (cb === prevB && uniform() < 0.81) cb = (cb + 1 + Math.floor(uniform() * 28)) % M;
        ar.push(ca);
        br.push(cb);
        prevA = ca;
        prevB = cb;
      }
      a.push(ar);
      b.push(br);
    }
    shared.push(collision(a));
    independent.push(collision(b));
  }
  return {
    n: count,
    shared,
    independent,
    gpIoc: cdf.reduce((s, x, i) => {
      const p = x - (i ? cdf[i - 1] : 0);
      return s + p * p;
    }, 0)
  };
}

let withinEqual = 0, withinTotal = 0, acrossEqual = 0, acrossTotal = 0;
for (const page of unsolved) {
  for (const line of page.lines) for (let k = 1; k < line.length; k++) {
    withinTotal++;
    if (line[k] === line[k - 1]) withinEqual++;
  }
  for (let i = 1; i < page.lines.length; i++) {
    acrossTotal++;
    if (page.lines[i][0] === page.lines[i - 1].at(-1)) acrossEqual++;
  }
}
const first = unsolved.filter(p => p.page < 28).flatMap(p => p.lines);
const last = unsolved.filter(p => p.page >= 28).flatMap(p => p.lines);
const splitRandom = rng(0x8a2cf527);
const split = [first, last, rows].map(lines => rotationNull(lines, 2500, splitRandom));
const heldoutRandom = rng(0x13579bdf);
const heldout = [
  transfer(first, last, 3500, heldoutRandom),
  transfer(last, first, 3500, heldoutRandom)
];
const result = {
  pages: unsolved.length,
  lines: rows.length,
  runes: 12956,
  lineEdgeDoublets: {acrossEqual, acrossTotal, withinEqual, withinTotal},
  original: rotationNull(rows, 3000, rng(0x12345678)),
  split,
  heldout,
  diagnosticPlants: controls(20),
  conclusion: 'No recovered ciphertext mechanism, key or LP2 plaintext'
};
assert.equal(acrossEqual, 4);
assert.equal(acrossTotal, 539);
assert.equal(withinEqual, 82);
assert.equal(withinTotal, 12362);
console.log(JSON.stringify(result, null, 2));
