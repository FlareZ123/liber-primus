#!/usr/bin/env node
'use strict';

/**
 * Original p50 outer-ring DH self-index and p55 keyed-consumer gate.
 * Source: canonical LP2 GP29 indices and original 32x8 printed tokens.
 * One file / one test: node sims/lp2_p50_outerring_dh73_selfindex_sft.cjs
 * Results have no claim of recovered original plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
/** @param {string} filename @returns {any} */
const read = (filename) => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const grid = read('resources/liber-primus/base60-grid.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const alphabet = grid.alphabet.replace('f', '');
assert.equal(grid.rows.length, 32);
assert.equal(alphabet.length, 59);
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const values = tokens.map((token) => {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  return hi * 59 + lo;
});
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

/** @param {number} x @param {number} n */
const mod = (x, n) => (x % n + n) % n;
/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let out = 1;
  while (exponent > 0) {
    if (exponent % 2) out = out * base % modulus;
    base = base * base % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return out;
}
/** @param {number[]} x */
function ioc(x) {
  const f = Array(29).fill(0);
  for (const n of x) f[n]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (x.length * (x.length - 1));
}
/** Clockwise outer boundary of the printed 32x8 table from cell zero. */
const outer = [];
for (let c = 0; c < 8; c++) outer.push(c);
for (let r = 1; r < 32; r++) outer.push(r * 8 + 7);
for (let c = 6; c >= 0; c--) outer.push(31 * 8 + c);
for (let r = 30; r > 0; r--) outer.push(r * 8);
assert.equal(outer.length, 76);
assert.equal(new Set(outer).size, 76);
assert.equal(values[outer[73]], 107);

/**
 * A speculative private exponent b: 152 base59 digits obtained by concatenating
 * two-digit outer-ring tokens under a fixed rotation/direction, mod phi(151)=150.
 * @param {number[]} ringValues
 * @param {number} direction
 * @param {number} start
 */
function candidate(ringValues, direction, start) {
  let b = 0;
  for (let i = 0; i < 76; i++) {
    // Multiplying by 59^2 is 31 modulo 150.
    b = (31 * b + ringValues[mod(start + direction * i, 76)]) % 150;
  }
  const B = powMod(35, b, 151);
  const K = powMod(B, 21, 151);
  const index = mod(start + direction * (K % 76), 76);
  return { direction, start, b, B, K, index, value: ringValues[index] };
}
/** @param {number[]} ringValues */
function scan(ringValues) {
  let any = 0;
  let joint = 0;
  let example = null;
  for (const direction of [1, -1]) {
    for (let start = 0; start < 76; start++) {
      const c = candidate(ringValues, direction, start);
      if (c.value === 107) {
        any++;
        if (c.b === 113 && c.K === 73) {
          joint++;
          example = c;
        }
      }
    }
  }
  return { any, joint, example };
}

const ringValues = outer.map((cell) => values[cell]);
const naturalCW = candidate(ringValues, 1, 0);
const naturalCCW = candidate(ringValues, -1, 0);
assert.equal(naturalCW.b, 53);
assert.equal(naturalCCW.b, 143);
assert.equal(powMod(35, 21, 151), 107);
assert.equal(powMod(35, 113, 151), 56);
assert.equal(powMod(56, 21, 151), 73);
const observed = scan(ringValues);
assert.equal(observed.any, 1);
assert.equal(observed.joint, 1);
assert.deepEqual(observed.example, {
  direction: -1, start: 70, b: 113, B: 56, K: 73, index: 73, value: 107
});

// Test whether at least one of 152 a posteriori rotation/direction choices
// yields the same observed self-index, preserving the exact ring-value multiset.
let state = 174291;
/** @returns {number} */
function rand32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 10000;
let anyHit = 0, jointHit = 0, exactFixed = 0;
for (let i = 0; i < trials; i++) {
  const shuffled = ringValues.slice();
  for (let j = 75; j > 0; j--) {
    const k = rand32() % (j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  const result = scan(shuffled);
  if (result.any > 0) anyHit++;
  if (result.joint > 0) jointHit++;
  if (candidate(shuffled, -1, 70).value === 107) exactFixed++;
}
// The following are deterministic regression checks, not cryptographic facts.
assert.equal(anyHit, 8960);
assert.equal(jointHit, 3623);
assert.equal(exactFixed, 141);

// One frozen speculative 76-key receiver: K=73 rotates the 76-cell outer
// ring, and key rune i is tableValue_i mod29. Compare both geometric
// traversal orientations and both additive signs on original p55.
const decoded = [];
for (const direction of [1, -1]) {
  for (const sign of [1, -1]) {
    const key = p55.map((_, i) =>
      ringValues[mod(direction * (73 + i), 76)] % 29);
    const plain = p55.map((c, i) => mod(c + sign * key[i], 29));
    const reencryption = plain.map((p, i) => mod(p - sign * key[i], 29));
    assert.deepEqual(reencryption, p55);
    // Synthetic native-GP positive: known clear p57 slice, encrypted and
    // decrypted using the exact original key schedule.
    const plant = p57.slice(0, 76);
    const encrypted = plant.map((p, i) => mod(p - sign * key[i], 29));
    const recovered = encrypted.map((c, i) => mod(c + sign * key[i], 29));
    assert.deepEqual(recovered, plant);
    const readable = plain.map((n) => corpus.translit[n]).join('');
    decoded.push({
      direction, sign, keyFirst8: key.slice(0, 8),
      ioc: Number(ioc(plain).toFixed(8)), plain: readable
    });
  }
}
assert(decoded.every((o) => o.ioc <= 0.036));

console.log(JSON.stringify({
  source: { base: 59, ringSize: 76, naturalCW, naturalCCW },
  dh: { p: 151, g: 35, a: 21, A: 107, b: 113, B: 56, K: 73 },
  observed, randomMultisetNull: {
    trials, anyHit, jointHit, exactFixed,
    anyRate: anyHit / trials, jointRate: jointHit / trials
  },
  originalP55IoC: ioc(p55), knownClearP57IoC: ioc(p57),
  originalP55DirectK73Receivers: decoded,
  conclusion: 'No authenticated original plaintext; ring-start freedom defeats the DH self-index coincidence.'
}, null, 2));
