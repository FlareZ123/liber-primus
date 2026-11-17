#!/usr/bin/env node
'use strict';

/**
 * Original LP2 p15 + circumference-trimmed p39 -> p50 degree-254 GF29
 * polynomial key gate, 17 November 2026 (Agent49).
 *
 * Reproduce on Windows: node sims/lp2_p15_p39_trim238_p50_degree254_lfsr_sft.cjs
 *
 * Two externally source-conditioned key streams are tested: a single
 * order-254 recurrence with p15||p39-internal seed, and a factor-sum recurrence
 * from degree-16 p15 and degree-238 interior-p39 seeds. Both signs.
 * No fitted clock, reverse order, guessed plaintext or added page state.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
/** @param {string} filename */
const load = filename => JSON.parse(
  fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const original = pages.flatMap(p => p.indices);
const p39 = corpus.pages.find(p => p.page === 39).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
assert.equal(original.length, 12956);
assert.equal(grid.bytes.length, 256);
assert.equal(p39.length, 240);
assert.deepEqual(p39.slice(119, 122), [27, 5, 15]);
assert.equal(p57.length, 95);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes))
  .digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * The first table byte 203=7*29 disappears under reduction, and the
 * next coefficient 231 mod29 = 28 is invertible. Thus the complete
 * 256-slot table defines a monic degree-254 polynomial.
 */
const P = grid.bytes.slice(1).map(x => mod(28 * x)).reverse();
assert.equal(P.length, 255);
assert.equal(P.at(-1), 1);
const F16 = [13, 20, 26, 12, 6, 2, 13, 26, 6, 26,
  11, 7, 15, 11, 17, 25, 1];
const remainder = P.slice();
const R238 = Array(239).fill(0);
for (let i = 238; i >= 0; i--) {
  const q = remainder[16 + i];
  R238[i] = q;
  for (let j = 0; j < F16.length; j++) {
    remainder[i + j] = mod(remainder[i + j] - q * F16[j]);
  }
}
assert(remainder.slice(0, 16).every(x => x === 0),
  'Established degree-16 factor must divide the original 256-byte grid');
assert.equal(R238.at(-1), 1);

/** @param {number} ordinal */
function nthPrime(ordinal) {
  let count = 0, candidate = 1;
  while (count < ordinal) {
    candidate++;
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  return candidate;
}

// Same source-attested 16-position red-3299-anchored Fibonacci-prime spiral
// as prior p15 studies. The two inferred negative values restore source
// magnitude signs and are explicitly a mathematical inference.
const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34,
  55, 89, 144, 233, 377, 610, 987];
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const spiralPositions = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const signedSpiral = fib.map(i => 3301 - nthPrime(i + 1));
assert.deepEqual(spiralPositions.map(i => printed.flat()[i]),
  signedSpiral.map(Math.abs));
const seed16 = signedSpiral.map(mod);

// Literal "shed our own circumferences": a single endpoint rune peeled from
// each side of the 240-rune p39 page, retaining the red mid-page triad.
const seed238 = p39.slice(1, -1);
assert.equal(seed238.length, 238);
assert.deepEqual(seed238.slice(118, 121), [27, 5, 15]);
const seed254 = seed16.concat(seed238);
assert.equal(seed254.length, 254);

/**
 * Expand a monic GF29 polynomial recurrence with a fixed d-symbol state.
 * Read only the n generated symbols after the complete seed; no phase fit.
 * @param {number[]} seed
 * @param {number[]} asc monic polynomial, ascending coefficients
 * @param {number} length
 * @returns {number[]}
 */
function expand(seed, asc, length) {
  const degree = asc.length - 1;
  assert.equal(seed.length, degree);
  assert.equal(asc.at(-1), 1);
  const state = seed.slice();
  for (let pos = degree; pos < degree + length; pos++) {
    let next = 0;
    for (let j = 0; j < degree; j++) {
      next -= asc[j] * state[pos - degree + j];
    }
    state.push(mod(next));
  }
  return state.slice(degree);
}

/** @param {number[]} v */
function ioc(v) {
  const counts = Array(29).fill(0);
  for (const x of v) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (v.length * (v.length - 1));
}
let location = 0;
const pageOffset = new Map();
for (const p of pages) {
  pageOffset.set(p.page, {start: location, length: p.indices.length});
  location += p.indices.length;
}
const keyFull = expand(seed254, P, original.length);
const k16 = expand(seed16, F16, original.length);
const k238 = expand(seed238, R238, original.length);
const keyFactor = k16.map((x, i) => mod(x + k238[i]));

const report = { source: {
  original_runes: original.length, p15_seed: seed16.length,
  p39_trimmed: seed238.length, full_degree: P.length - 1,
  quotient_degree: R238.length - 1
}, baseline: ioc(original), results: {} };
const expected = {
  full_concat: {
    minus: [0.03447541892524876, 0.033342107572168114, 0.034398460330151634],
    plus: [0.03446632720263662, 0.0348337281740809, 0.03451410361638446]
  },
  factor_sum: {
    minus: [0.0344870487041078, 0.037349009973384806, 0.03451211357895407],
    plus: [0.03445109886515522, 0.03571115205755901, 0.0343613129647843]
  }
};
for (const [name, key] of Object.entries({full_concat: keyFull, factor_sum: keyFactor})) {
  report.results[name] = {};
  for (const [operation, sign] of [['minus', -1], ['plus', 1]]) {
    const decoded = original.map((v, i) => mod(v + sign * key[i]));
    assert(original.every((v, i) => mod(decoded[i] - sign * key[i]) === v),
      'Complete original ciphertext must re-encode exactly');
    const sourceNative = Array.from({length: original.length},
      (_, i) => p57[i % p57.length]);
    const planted = sourceNative.map((v, i) => mod(v - sign * key[i]));
    assert(planted.every((v, i) => mod(v + sign * key[i]) === sourceNative[i]),
      'Independent solved p57 source-native plant must fully recover');
    const io = [
      ioc(decoded),
      ioc(decoded.slice(0, pages[0].indices.length)),
      ioc(decoded.slice(pageOffset.get(40).start,
        pageOffset.get(53).start + pageOffset.get(53).length))
    ];
    for (let i = 0; i < 3; i++) {
      assert(Math.abs(io[i] - expected[name][operation][i]) < 1e-12,
        'Original source IoC assertion failed: ' + name + '/' + operation + '/' + i);
    }
    report.results[name][operation] = {
      full_ioc: io[0], p0_ioc: io[1], p40_53_ioc: io[2],
      positive_plant_recovered: sourceNative.length,
      first40: decoded.slice(0, 40).map(x => corpus.translit[x]).join(' ')
    };
  }
}
console.log(JSON.stringify(report, null, 2));
