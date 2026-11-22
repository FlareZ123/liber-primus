'use strict';

/**
 * Original LP2 red119 triad --> chapter-heading page --> solved-p56
 * prime-totient key clock: exact all-F-masks gate.
 * Standalone Windows Node22 single-file test with built-in dependencies only.
 *
 * @typedef {{possible:boolean,firstFailure:number,terminal:number}} Feasibility
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = new Map(corpus.pages.map((p) => [p.page, p.indices]));
/** @param {number} n @returns {number} */
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let p = 2; out.length < count; p++) {
    let prime = true;
    for (let f = 2; f * f <= p; f++) {
      if (p % f === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(p);
  }
  return out;
}
const primes = firstPrimes(1600);

/**
 * Exact nondeterministic inverse of authentic solved p56 rule.
 * Plaintext GP rune zero (literal F) copies C=F and skips key consumption.
 * Non-F plaintext consumes exactly one prime-totient shift and may emit F.
 * @param {number[]} cipher
 * @param {(consumed:number)=>number} shift
 * @returns {Feasibility}
 */
function feasible(cipher, shift) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      if (cipher[i] === 0) next.add(consumed);
      if (mod(cipher[i] - shift(consumed)) !== 0) next.add(consumed + 1);
    }
    if (next.size === 0) return {possible: false, firstFailure: i, terminal: 0};
    states = next;
  }
  return {possible: true, firstFailure: -1, terminal: states.size};
}

/** @param {number[]} plain @param {(consumed:number)=>number} shift @returns {number[]} */
function encrypt(plain, shift) {
  let consumed = 0;
  return plain.map((x) => x === 0 ? 0 : mod(x + shift(consumed++)));
}

assert.equal(page.get(33).length, 214);
assert.equal(page.get(40).length, 231);
assert.equal(page.get(56).length, 85);
assert.equal(page.get(57).length, 95);
const triads = [
  {source: 3, target: 33, sum: 137, indices: [13, 23, 2]},
  {source: 39, target: 40, sum: 173, indices: [27, 5, 15]}
];
const candidates = [];
const solved57 = page.get(57);
for (const t of triads) {
  assert.deepEqual(page.get(t.source).slice(119, 122), t.indices);
  assert.equal(t.indices.reduce((s, x) => s + corpus.prime[x], 0), t.sum);
  assert.equal(primes[t.target - 1], t.sum);
  const original = page.get(t.target);
  const native = Array.from({length: original.length}, (_, i) => solved57[i % 95]);
  assert(native.some((x) => x === 0), 'native plant should include literal F');
  for (const start of [t.target, t.sum]) {
    for (const sign of [-1, 1]) {
      const shift = (used) => mod(sign * (primes[start - 1 + used] - 1));
      const tested = feasible(original, shift);
      assert.equal(tested.possible, false);
      const planted = encrypt(native, shift);
      assert.equal(feasible(planted, shift).possible, true);
      // The true native plaintext and its complete cipher are preserved.
      assert.deepEqual(encrypt(native, shift), planted);
      candidates.push({
        sourceTriadPage: t.source,
        targetPage: t.target,
        startingPrimeOrdinal: start,
        firstPrime: primes[start - 1],
        sign,
        originalFeasible: tested.possible,
        firstSourceContradictionZeroBased: tested.firstFailure,
        originalRuneCount: original.length,
        plantedNativeRuneCount: planted.length
      });
    }
  }
}
assert.equal(candidates.length, 8);
assert.deepEqual(candidates.map((c) => c.firstSourceContradictionZeroBased),
  [74, 3, 58, 114, 35, 106, 67, 8]);
const genuine = feasible(page.get(56), (used) => mod(primes[used] - 1));
assert.equal(genuine.possible, true);
assert.equal(genuine.terminal, 5);
console.log(JSON.stringify({
  source: 'The two original red119 three-rune spans and their prime-sum/ordinal addresses',
  cipher: 'Solved LP2 p56 Euler-prime-totient with exact literal-F bypass',
  exactOriginalDecodersTested: candidates.length,
  feasibleOriginalDecoders: candidates.filter((c) => c.originalFeasible).length,
  nativePositivePlants: candidates.length,
  genuineSolvedP56: genuine,
  candidates
}, null, 2));
