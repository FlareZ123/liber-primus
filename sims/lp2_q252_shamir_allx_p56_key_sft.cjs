'use strict';

/**
 * Exact original-input gate: p50 H/G quotient Q252 as three Shamir shares
 * with p56's independently known 84 prime-totient residues as a fourth value.
 *
 * Run under Node.js 22 from any working directory. No dependencies beyond
 * Node and this repository's pinned source JSONs. No files are written.
 *
 * This tests all distinct GF(29) four-point evaluation configurations,
 * both natural share layouts, both orientations, and even arbitrary
 * stationary symbol relabelings. Each candidate is tested both literally and under
 * the entire family of secret stationary symbol-to-symbol functions.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const MODULUS = 29;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MODULUS) + MODULUS) % MODULUS;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  /** @type {number[]} */
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) out.push(n);
  }
  return out;
}

/**
 * Interpolate the degree-at-most-two polynomial through (1,y0),
 * (2,y1), (3,y2), then evaluate at x in GF(29).
 * 15 is the inverse of 2 modulo 29.
 * @param {number} x
 * @param {number[]} y
 * @returns {number}
 */
function interpolate(x, y) {
  assert.equal(y.length, 3);
  return mod(15 * (x - 2) * (x - 3) * y[0]
    - (x - 1) * (x - 3) * y[1]
    + 15 * (x - 1) * (x - 2) * y[2]);
}

/**
 * An optimal unrestricted stationary output function assigns each
 * predicted symbol its most frequent target. Every fixed bijection
 * is a special case, so this is an exact upper bound for all 29! maps.
 * @param {number[]} candidate
 * @param {number[]} target
 * @returns {{literal: number, functionUpperBound: number, conflictingGroups: number}}
 */
function measure(candidate, target) {
  assert.equal(candidate.length, target.length);
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  let literal = 0;
  for (let i = 0; i < target.length; i++) {
    counts[candidate[i]][target[i]]++;
    if (candidate[i] === target[i]) literal++;
  }
  return {
    literal,
    functionUpperBound: counts.reduce((sum, row) => sum + Math.max(...row), 0),
    conflictingGroups: counts.filter(row => row.filter(n => n > 0).length > 1).length
  };
}

/** @param {number[]} q @param {'blocks' | 'triplets'} layout @returns {number[][]} */
function shares(q, layout) {
  assert.equal(q.length, 252);
  return Array.from({ length: 84 }, (_, i) => layout === 'blocks'
    ? [q[i], q[i + 84], q[i + 168]]
    : q.slice(i * 3, i * 3 + 3));
}

/** @param {number[]} bytes @returns {number[]} */
function sourceQuotient(bytes) {
  const H = [3, 26, 24];    // conditional ascending polynomial, NOT historical positional BASE29 orientation
  const G = [27, 5, 15];    // original physical p39 red triad, ascending powers
  const F = Array(5).fill(0);
  for (let i = 0; i < H.length; i++) {
    for (let j = 0; j < G.length; j++) F[i + j] = mod(F[i + j] + H[i] * G[j]);
  }
  assert.deepEqual(F, [23, 21, 11, 17, 12]);
  const divisor = F.slice().reverse();
  assert.equal(mod(divisor[0] * 17), 1);

  const remainder = bytes.map(mod);
  const q = [];
  for (let i = 0; i < bytes.length - 4; i++) {
    const coefficient = mod(remainder[i] * 17);
    q.push(coefficient);
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
    }
  }
  assert.deepEqual(remainder.slice(-4), [0, 0, 0, 0]);
  assert.equal(q.length, 252);
  assert.deepEqual(q.slice(0, 4), [0, 12, 9, 28]);
  return q;
}

const tableBytes = grid.pages.flatMap(page => page.bytes);
assert.equal(tableBytes.length, 256);
assert(tableBytes.every(value => Number.isInteger(value) && value >= 0 && value < 256));
const tableSHA = crypto.createHash('sha256').update(Buffer.from(tableBytes)).digest('hex');
assert.equal(tableSHA, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const q = sourceQuotient(tableBytes);

const p56 = source.pages.find(page => page.page === 56);
assert(p56);
assert.equal(p56.indices.length, 85);
assert.equal(p56.indices[56], 0);
const primes = firstPrimes(84);
assert.equal(primes[83], 433);
const target = primes.map(p => mod(p - 1));

// Authentic solved-source control: exactly one literal plaintext F at
// local offset 56 emits GP-index 0 without consuming the prime key.
let keyClock = 0;
const originalPlain = p56.indices.map((c, i) => i === 56
  ? 0
  : mod(c - target[keyClock++]));
assert.equal(keyClock, 84);
assert.equal(originalPlain.map(i => source.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
keyClock = 0;
assert.deepEqual(originalPlain.map((p, i) => i === 56
  ? 0
  : mod(p + target[keyClock++])), p56.indices);
assert.equal(keyClock, 84);

// Construct a genuine 84-position quadratic-share positive with
// a hidden fixed GP29 bijection. The test must recognize it exactly.
const sigma = x => mod(7 * x + 3);
const positiveShares = target.map((t, i) => {
  const z = mod(25 * (t - 3)); // 7^{-1} mod 29 = 25
  const d = mod(11 * i + 4);
  const e = mod(5 * i + 8);
  return [1, 2, 3].map(x => mod(z + d * (x - 4) + e * (x - 4) ** 2));
});
const positive = positiveShares.map(row => sigma(interpolate(4, row)));
assert.deepEqual(positive, target);
const positiveRaw = positiveShares.map(row => interpolate(4, row));
assert.deepEqual(measure(positiveRaw, target), {
  literal: measure(positiveRaw, target).literal,
  functionUpperBound: 84,
  conflictingGroups: 0
});

/**
 * All evaluation weights of a degree-2 polynomial through any three
 * distinct GF29 coordinates, read at any fourth distinct coordinate.
 *
 * Affine normalization of the independent-coordinate axis lets the
 * three share positions be 0,1,t and evaluation point be u. This
 * enumerates all quadratic interpolation coefficient triples.
 * @returns {{t:number,u:number,lambda:number[]}[]}
 */
function distinctFourPointWeights() {
  /** @type {{t:number,u:number,lambda:number[]}[]} */
  const out = [];
  const visited = new Set();
  /** @param {number} a @returns {number} */
  const inverse = a => {
    for (let n = 1; n < 29; n++) if (mod(a * n) === 1) return n;
    throw new Error('Noninvertible field coordinate');
  };
  for (let t = 2; t < 29; t++) {
    for (let u = 0; u < 29; u++) {
      if (u === 0 || u === 1 || u === t) continue;
      const lambda = [
        mod((u - 1) * (u - t) * inverse(t)),
        mod(u * (u - t) * inverse(mod(1 - t))),
        mod(u * (u - 1) * inverse(mod(t * (t - 1))))
      ];
      assert.equal(mod(lambda[0] + lambda[1] + lambda[2]), 1);
      const signature = lambda.join(',');
      if (!visited.has(signature)) {
        visited.add(signature);
        out.push({ t, u, lambda });
      }
    }
  }
  assert.equal(out.length, 390);
  return out;
}

const coordinateClasses = distinctFourPointWeights();
const cases = [];
for (const reverse of [false, true]) {
  const coeffs = reverse ? q.slice().reverse() : q;
  for (const layout of ['blocks', 'triplets']) {
    const triplets = shares(coeffs, layout);
    for (const { t, u, lambda } of coordinateClasses) {
      const predicted = triplets.map(row => mod(lambda[0] * row[0]
        + lambda[1] * row[1] + lambda[2] * row[2]));
      cases.push({ reverse, layout, t, u, lambda, ...measure(predicted, target) });
    }
  }
}
assert.equal(cases.length, 1560);
assert(cases.every(t => t.functionUpperBound < 84 && t.conflictingGroups > 0));
assert.equal(Math.max(...cases.map(t => t.literal)), 9);
assert.equal(Math.max(...cases.map(t => t.functionUpperBound)), 37);
assert.equal(Math.min(...cases.map(t => t.conflictingGroups)), 17);

// The three source-share coordinates themselves are also ineligible
// as a "fourth" share: every source layout's literal known-key check fails.
for (const reverse of [false, true]) {
  const coeffs = reverse ? q.slice().reverse() : q;
  for (const layout of ['blocks', 'triplets']) {
    const triplets = shares(coeffs, layout);
    for (let k = 0; k < 3; k++) {
      const directShare = triplets.map(row => row[k]);
      const check = measure(directShare, target);
      assert(check.functionUpperBound < 84 && check.conflictingGroups > 0);
    }
  }
}
cases.sort((a, b) => b.functionUpperBound - a.functionUpperBound
  || b.literal - a.literal);
console.log(JSON.stringify({
  gate: 'Q252 quadratic GF29 3-of-3 shares to known p56 prime key',
  sourceSHA256: tableSHA,
  quotientLength: q.length,
  consumedPrimes: target.length,
  lastPrime: primes[83],
  rawDistinctFourPointChoices: 702,
  distinctInterpolationWeights: coordinateClasses.length,
  completeFourPointModels: cases.length,
  directShareControls: 12,
  maxLiteralMatches: 9,
  maxSecretFunctionMatches: 37,
  minConflictingInputGroups: 17,
  bestModels: cases.slice(0, 8),
  sourcePositiveControl: '84/84 original p56 recovered and re-encrypted',
  plantedSecretBijectionControl: '84/84; no equality conflict',
  decision: 'No fixed distinct GF29 four-point Shamir evaluation, in either natural layout or coefficient orientation, can recover the authentic p56 key under even an arbitrary stationary output function.'
}, null, 2));
