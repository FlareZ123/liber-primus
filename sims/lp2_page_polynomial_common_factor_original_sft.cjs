'use strict';

/**
 * Original LP2 page-polynomial gcd and finite-root screen.
 * Node.js 22 / CommonJS. No network or files written.
 *
 * Source: resources/liber-primus/lp2-corpus.json
 * Only physical unknown pages p0..p55 with runes are included.
 * The first original rune is the constant coefficient over GF(29).
 * No cipher key or plaintext model is fitted.
 */
const assert = require('node:assert/strict');
const { pages } = require('../resources/liber-primus/lp2-corpus.json');

const MOD = 29;
const INV = new Uint8Array(MOD);
for (let a = 1; a < MOD; a++) {
  for (let b = 1; b < MOD; b++) {
    if ((a * b) % MOD === 1) INV[a] = b;
  }
}

/** @param {number[]} a @returns {number[]} */
function trim(a) {
  while (a.length && a[a.length - 1] === 0) a.pop();
  return a;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function remainder(a, b) {
  const r = trim(a.slice());
  assert(b.length > 0);
  const n = b.length;
  const inverseLead = INV[b[n - 1]];
  for (let i = r.length - n; i >= 0; i--) {
    const factor = (r[i + n - 1] * inverseLead) % MOD;
    if (factor === 0) continue;
    for (let j = 0; j < n; j++) {
      const residue = (r[i + j] - factor * b[j]) % MOD;
      r[i + j] = residue < 0 ? residue + MOD : residue;
    }
  }
  return trim(r.slice(0, n - 1));
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function gcd(a, b) {
  let x = trim(a.slice());
  let y = trim(b.slice());
  while (y.length) {
    const r = remainder(x, y);
    x = y;
    y = r;
  }
  return x;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = (out[i + j] + a[i] * b[j]) % MOD;
    }
  }
  return out;
}

/** @param {number[]} a @param {number} x @returns {number} */
function evaluate(a, x) {
  let v = 0;
  for (let i = a.length - 1; i >= 0; i--) v = (v * x + a[i]) % MOD;
  return v;
}

/** @param {number[][]} streams @returns {{roots:number,pairs:number,max:number}} */
function rootStats(streams) {
  const counts = new Uint8Array(MOD);
  let roots = 0;
  for (const a of streams) {
    for (let x = 0; x < MOD; x++) {
      if (evaluate(a, x) === 0) {
        counts[x]++;
        roots++;
      }
    }
  }
  let pairs = 0;
  let max = 0;
  for (const n of counts) {
    pairs += n * (n - 1) / 2;
    max = Math.max(max, n);
  }
  return { roots, pairs, max };
}

// Independent algebraic and field-reduction positive controls.
const factor = multiply([1, 1], [2, 1]);
const a = multiply(factor, [3, 1]);
const b = multiply(factor, [4, 1]);
assert.equal(gcd(a, b).length - 1, 2);
assert.equal(remainder(a, factor).length, 0);
assert.equal(evaluate(a, 28), 0);
assert.equal(evaluate(a, 27), 0);

const corpus = pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(corpus.length, 55);
assert.equal(corpus.reduce((n, p) => n + p.indices.length, 0), 12956);
const original = corpus.map(p => p.indices);
const degrees = new Map();
const high = [];
for (let i = 0; i < original.length; i++) {
  for (let j = i + 1; j < original.length; j++) {
    const degree = gcd(original[i], original[j]).length - 1;
    degrees.set(degree, (degrees.get(degree) || 0) + 1);
    if (degree >= 2) high.push([corpus[i].page, corpus[j].page, degree]);
  }
}
assert.equal(corpus.length * (corpus.length - 1) / 2, 1485);
assert.equal(degrees.get(0), 1403);
assert.equal(degrees.get(1), 82);
assert.equal(high.length, 0);

const observed = rootStats(original);
assert.deepEqual(observed, { roots: 72, pairs: 82, max: 5 });

// Fixed, within-physical-page shuffle null. This preserves all 55
// original page lengths and each page's exact 29-rune histogram.
let seed = 246813579;
/** @param {number} n @returns {number} */
function randomInt(n) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % n;
}
const repetitions = 3000;
const sums = [0, 0];
const sumsSq = [0, 0];
const greaterEqual = [0, 0];
for (let sample = 0; sample < repetitions; sample++) {
  const scrambled = original.map(page => {
    const a = page.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  });
  const sampleStats = rootStats(scrambled);
  const data = [sampleStats.roots, sampleStats.pairs];
  const truth = [observed.roots, observed.pairs];
  for (let k = 0; k < 2; k++) {
    sums[k] += data[k];
    sumsSq[k] += data[k] ** 2;
    if (data[k] >= truth[k]) greaterEqual[k]++;
  }
}
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  physicalPages: corpus.map(p => p.page),
  originalRunes: 12956,
  pairsTested: 1485,
  gcdDegrees: Object.fromEntries(degrees),
  commonFactorDegreeAtLeastTwo: high,
  rootStatistics: observed,
  permutationNull: {
    seedInitial: 246813579,
    repetitions,
    rootTotal: {
      tailCount: greaterEqual[0],
      mean: sums[0] / repetitions,
      standardDeviation: Math.sqrt(sumsSq[0] / repetitions - (sums[0] / repetitions) ** 2)
    },
    sharedRootPairCount: {
      tailCount: greaterEqual[1],
      mean: sums[1] / repetitions,
      standardDeviation: Math.sqrt(sumsSq[1] / repetitions - (sums[1] / repetitions) ** 2)
    }
  },
  status: 'NO UNKNOWN PLAINTEXT OR AUTHENTIC KEY'
}, null, 2));
