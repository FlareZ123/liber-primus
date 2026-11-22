'use strict';
/**
 * Source-selected first-chapter prime/difference -> printed p15 Hill4 trial.
 *
 * Windows Node.js 22: node sims/lp2_prime_delta_p15_literal_hill_sft.cjs
 * Frozen original operations: 2015 Feb04 historic prime difference, followed
 * by the literal four-by-four NONNEGATIVE p15 printed square as a Hill map.
 * The 2015 transform's initial rune remains unmodified; the last 728 runes
 * make 182 complete 4-rune blocks. No signs, phases, filler or keys are fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readSquare } = require('./fibonacci_prime_spiral.cjs');
const mod = x => (x % 29 + 29) % 29;
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

/** @param {number} count @returns {number[]} */
function primes(count) {
  const ps = [];
  for (let n = 2; ps.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) ps.push(n);
  }
  return ps;
}

/** Exact 2015 imaginary-F-first prime subtraction and modular difference.
 * @param {number[]} cipher @param {number[]} ps @returns {number[]}
 */
function historicInverse(cipher, ps) {
  let previous = mod(-ps[0]);
  return cipher.map((c, i) => {
    const s = mod(c - ps[i+1]);
    const d = mod(s - previous);
    previous = s;
    return d;
  });
}

/** Inverse of the 2015 witness, including imaginary-F initialization.
 * @param {number[]} deltas @param {number[]} ps @returns {number[]}
 */
function historicForward(deltas, ps) {
  let previous = mod(-ps[0]);
  return deltas.map((d, i) => {
    previous = mod(previous + d);
    return mod(previous + ps[i+1]);
  });
}

/** @param {number} value @returns {number} */
function unitInverse(value) {
  for (let i = 1; i < 29; i++) if (mod(i*value) === 1) return i;
  throw new Error('matrix pivot not invertible');
}

/** @param {number[][]} matrix @returns {number[][]} */
function invert4(matrix) {
  const a = matrix.map((row,i) => row.concat(
    Array.from({length: 4}, (_,j) => Number(i === j))));
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && a[pivot][col] === 0) pivot++;
    assert(pivot < 4, 'printed p15 matrix is singular');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = unitInverse(a[col][col]);
    a[col] = a[col].map(x => mod(x * scale));
    for (let row = 0; row < 4; row++) if (row !== col) {
      const f = a[row][col];
      a[row] = a[row].map((x,j) => mod(x - f * a[col][j]));
    }
  }
  return a.map(row => row.slice(4));
}

/** @param {number[][]} matrix @param {number[]} four @returns {number[]} */
function apply4(matrix, four) {
  assert.equal(four.length, 4);
  return matrix.map(row => mod(row.reduce(
    (sum, value, i) => sum + value * four[i], 0)));
}

/** One unmodified first delta, 182 complete blocks; no truncation.
 * @param {number[][]} matrix @param {number[]} deltas @returns {number[]}
 */
function transform(matrix, deltas) {
  assert.equal(deltas.length, 729);
  const out = [deltas[0]];
  for (let i = 1; i < deltas.length; i += 4) {
    out.push(...apply4(matrix, deltas.slice(i,i+4)));
  }
  return out;
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const c = Array(29).fill(0);
  for (const x of runes) c[x]++;
  return c.reduce((a,n) => a + n*(n-1), 0) /
    (runes.length*(runes.length-1));
}

/** @param {number[]} runes @returns {string} */
function tokens(runes) {
  return runes.map(i=>corpus.translit[i]).join(' ');
}

const printed = readSquare().map(row => row.map(value => value % 29));
assert.deepEqual(printed, [
  [10,3,20,22],[1,22,21,25],[11,17,19,7],[21,17,12,22],
]);
const inverse = invert4(printed);
assert.deepEqual(inverse, [
  [19,1,6,3],[11,7,8,22],[2,10,15,28],[25,4,1,15],
]);
const original = corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),
  [262,266,201]);
assert.equal(original.length, 729);
const ps = primes(730);
const d = historicInverse(original, ps);
assert.equal(d.length, 729);
assert.equal(d[0], 14);
assert.equal((d.length - 1) / 4, 182);
assert.equal(ioc(d), 0.03450459006014561);
const candidate = transform(inverse, d);
assert.equal(ioc(candidate), 0.03428978428978429);
assert.deepEqual(historicForward(transform(printed, candidate), ps),
  original);

// Genuine clear original LP2 source control used as a separate encrypt/decrypt
// plant. Construct a 729-rune fixed known sequence without inserting a crib
// into original unsolved ciphertext.
const p57 = corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length, 95);
const known = Array.from({length: 729}, (_,i) => p57[i % 95]);
const masked = historicForward(transform(printed, known), ps);
const knownRecovered = transform(inverse, historicInverse(masked, ps));
assert.deepEqual(knownRecovered, known);
assert(ioc(known) > 0.05);

// Held-out original test window is fixed by absolute original rune offsets,
// never by candidate output. The first 120 runes are contiguous; 480..519
// are disjoint from the contiguous test and lie within original page 1.
const first120 = tokens(candidate.slice(0,120));
const withheld40 = tokens(candidate.slice(480,520));
console.log(JSON.stringify({
  source: '2015 Feb04 original IRC L89874 and p15 4x4 literal printed integers',
  operation: 'C -> 729 historic prime/difference deltas -> retain delta[0] and multiply 182 successive four-rune vectors by inverse printed p15 matrix',
  firstDelta: d[0], matrix: printed, matrixInverse: inverse,
  original: {runes: original.length, exactReencrypted: true},
  inverse: {
    ioc: ioc(candidate),
    contiguousOriginalRuneOffsets: '0..119',
    first120GP: first120,
    withheldOriginalRuneOffsets: '480..519',
    withheld40GP: withheld40
  },
  authenticKnownP57Plant: {
    runes: known.length, knownSource: 95,
    exactRecovered: true, positivePlainIoc: ioc(known)
  },
  unknownOriginalPlaintextRecovered: 0,
  conclusion: 'The literal printed p15 Hill4 followup gives no coherent source-native plaintext; the manuscript supplies no authored instruction connecting the matrix with the 2015 participant prime/delta stage.'
}, null, 2));
