'use strict';
/**
 * Source-derived, ALL-SECRET necessary-condition gate for a two-term
 * prime-residue trace, NOT an LP2 decoder.
 *
 * Model: C_i = A(q_i mod 29) + A(q_{i+1} mod 29) (mod 29),
 * q_i consecutive ordinary primes; A any unknown GP29 permutation.
 * Since all primes except 29 are nonzero mod 29, the hidden sequence
 * R_i=A(q_i mod29) may contain any fixed missing rune at most once.
 *
 * Reverse recurrence R_{i+1} = C_i - R_i mod29 uniquely determines
 * all hidden values from one of 29 initial states. Exhausting seeds
 * and the 29 possible omitted runes gives a strict, key-free rejection.
 */
const assert = require('node:assert/strict');
const gp = require('../resources/liber-primus/lp2-corpus.json');
const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;

function bestOmission(cipher) {
  let best = { count: Infinity, seed: -1, omitted: -1 };
  for (let seed = 0; seed < MOD; seed++) {
    let state = seed;
    const seen = new Uint32Array(MOD);
    seen[state]++;
    for (const c of cipher) {
      state = mod(c - state);
      seen[state]++;
    }
    for (let missing = 0; missing < MOD; missing++) {
      if (seen[missing] < best.count) {
        best = { count: seen[missing], seed, omitted: missing };
      }
    }
  }
  return best;
}

function encodeAdjacent(underlying) {
  return underlying.slice(0, -1).map((v,i) => mod(v + underlying[i + 1]));
}
function primesUpTo(limit) {
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1, 2);
  for (let p = 2; p * p <= limit; p++) {
    if (sieve[p]) for (let k = p * p; k <= limit; k += p) sieve[k] = 0;
  }
  const result = [];
  for (let p = 2; p <= limit; p++) if (sieve[p]) result.push(p);
  return result;
}

function differenceProfile(cipher) {
  const counts = new Uint32Array(MOD);
  for (let i = 1; i < cipher.length; i++) counts[mod(cipher[i] - cipher[i - 1])]++;
  const expected = (cipher.length - 1 - counts[0]) / 28;
  const nonzeroChi2 = [...counts].slice(1).reduce(
    (sum, observed) => sum + (observed - expected)**2 / expected, 0);
  return { zero: counts[0], nonzeroChi2, counts: [...counts] };
}

const opening = gp.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const blackOpening = opening.slice(13); // original p0 13 red title runes
const floral = gp.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
const allUnsolved = gp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(opening.length, 729);
assert.equal(blackOpening.length, 716);
assert.equal(floral.length, 3008);
assert.equal(allUnsolved.length, 12956);
assert.equal(bestOmission(opening).count, 14);
assert.equal(bestOmission(blackOpening).count, 12);
assert.equal(bestOmission(floral).count, 73);
assert.equal(bestOmission(allUnsolved).count > 1, true);
const origProfile = differenceProfile(allUnsolved);
assert.equal(origProfile.zero, 86);
assert.ok(Math.abs(origProfile.nonzeroChi2 - 41.380294) < 1e-5);

// Positive: any source-prime span after ordinary prime 29; any fixed
// unknown permutation, represented here by affine A(x)=11*x+7.
const primes = primesUpTo(15000).filter(p => p > 29);
assert.ok(primes.length > 740);
const transformed = primes.slice(0, 730).map(p => mod(11 * (p % MOD) + 7));
assert.equal(transformed.includes(7), false); // missing A(0)
const planted = encodeAdjacent(transformed);
assert.equal(planted.length, 729);
const inverse = bestOmission(planted);
assert.equal(inverse.count, 0);
// Demonstrate an exact witness, not just an inferred omitted symbol.
let state = transformed[0];
for (let i=0; i<planted.length; i++) {
  assert.equal(state, transformed[i]);
  state = mod(planted[i] - state);
}
assert.equal(state, transformed.at(-1));
console.log(JSON.stringify({
  original_p0_2: bestOmission(opening),
  original_black_p0_2: bestOmission(blackOpening),
  original_p40_53: bestOmission(floral),
  original_all: bestOmission(allUnsolved),
  original_delta0: origProfile.zero,
  original_delta_nonzero_chi2: origProfile.nonzeroChi2,
  planted: inverse,
  interpretation: 'No prime-interval or static source alphabet permutation can produce the original long ciphertext as adjacent prime-residue sums.'
}, null, 2));
