'use strict';

/**
 * Source-locked test of the prime-ordinal self-pair selector in the original
 * 32 × 8 Liber Primus numerical table. A pair at offsets i,j qualifies iff
 * both bytes equal a prime v and j - i is the one-based ordinal of v.
 *
 * No plaintext, language score, secret key or fitted offset is involved.
 * Execute from a working copy of the repository with Node.js 22:
 *   node sims/lp2_p50_primeordinal_selfpair_null_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
/** @type {{bytes:number[]}} */
const grid = JSON.parse(fs.readFileSync(source, 'utf8'));
const observed = grid.bytes;
assert.equal(observed.length, 256);
assert.ok(observed.every(v => Number.isInteger(v) && v >= 0 && v < 256));

const ordinal = new Uint8Array(256);
let rank = 0;
for (let v = 2; v < 256; v++) {
  let prime = true;
  for (let d = 2; d * d <= v; d++) {
    if (v % d === 0) {
      prime = false;
      break;
    }
  }
  if (prime) ordinal[v] = ++rank;
}
assert.equal(rank, 54);

/** @param {number[]} values @returns {[number,number,number,number][]} */
function hits(values) {
  /** @type {[number,number,number,number][]} */
  const result = [];
  for (let i = 0; i < 256; i++) {
    const value = values[i];
    const distance = ordinal[value];
    if (distance > 0 && i + distance < 256 && values[i + distance] === value) {
      result.push([i, i + distance, value, distance]);
    }
  }
  return result;
}

const actual = hits(observed);
assert.deepEqual(actual, [[83, 127, 193, 44]]);

// Exact expected event count in a uniformly random permutation of the
// observed 256-byte multiset. Each ordered offset pair equals v with chance
// frequency[v]*(frequency[v]-1)/(256*255).
const frequency = Array(256).fill(0);
for (const value of observed) frequency[value]++;
let expected = 0;
for (let v = 0; v < 256; v++) {
  if (ordinal[v]) {
    expected += (256 - ordinal[v]) * frequency[v] * (frequency[v] - 1) / (256 * 255);
  }
}
assert.ok(Math.abs(expected - 0.15842524509803924) < 1e-12);
// If an independently specified clue preselects prime #44 = 193, the exact
// chance that the two original occurrences of 193 are 44 cells apart is:
const fixed193Probability = (256 - 44) * frequency[193] * (frequency[193] - 1) / (256 * 255);
assert.equal(frequency[193], 2);
assert.ok(Math.abs(fixed193Probability - 53 / 8160) < 1e-12);

// Fixed-seed exact-multiset Fisher-Yates controls. The XOR-shift generator
// matches the historical in-repo source-shaped null conventions.
let state = 0x33014344;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

const repeats = 200000;
const distribution = Array(8).fill(0);
const permuted = observed.slice();
for (let trial = 0; trial < repeats; trial++) {
  for (let i = 255; i > 0; i--) {
    const j = random32() % (i + 1);
    [permuted[i], permuted[j]] = [permuted[j], permuted[i]];
  }
  distribution[Math.min(7, hits(permuted).length)]++;
}
assert.deepEqual(distribution, [170335, 27514, 2074, 72, 5, 0, 0, 0]);
const matchesAtLeastOne = repeats - distribution[0];
assert.equal(matchesAtLeastOne, 29665);
console.log('Source prime-ordinal self-pair:', JSON.stringify(actual));
console.log('Exact expected number under multiset permutations:', expected.toFixed(12));
console.log('Conditional exact p when preselecting byte193 and gap44:', fixed193Probability.toFixed(9));
console.log('Permutations:', repeats, 'seed: 0x33014344');
console.log('Null counts for 0,1,2,3,4,5,6,7+ hits:', distribution.join(','));
console.log('At least one hit:', matchesAtLeastOne, '/', repeats,
  '=', (matchesAtLeastOne / repeats).toFixed(6));
console.log('Decision: source relation is arithmetically exact, but not a rare table arrangement.');
