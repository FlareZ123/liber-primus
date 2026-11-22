/**
 * Source-first original nonlinear GP29 bookend two-rune receiver test.
 * P7 original five red-word products define the GP29 polynomial F.
 * P50 two-char conventional base60 token supplies the natural 0..4
 * Feistel/butterfly-round count and an independent direction parity.
 *
 * This is a deliberate low-complexity rival to already-tested scalar
 * F^d source pads. Reads all authentic 6,395 final ciphertext runes,
 * with both original 81x81 source partner K alignments.
 *
 * SFT: node sims/lp2_bookend_p7_feistel_p50_nonlinear_source_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const numbers = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices || []);
assert.equal(original.length, 12956);
const A = original.slice(0, 6561), B = original.slice(6561);
const holes = new Set([2244, 2384, 2476, 2575, 2672]);
const slots = Array.from({ length: 6400 }, (_, i) => i).filter(i => !holes.has(i));
assert.deepEqual([A.length, B.length, slots.length], [6561, 6395, 6395]);
assert.deepEqual(original.slice(6555, 6561), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(original.slice(12950), [23, 11, 1, 17, 18, 10]);
const tokens = numbers.pages.flatMap(p => p.bytes);
assert.equal(tokens.length, 256);

/** @param {number} n */
function mod(n) { return (n % 29 + 29) % 29; }
/** Source-authentic p7 quartic coefficients, ascending GP29 powers. @param {number} x */
function polynomial(x) {
  return mod(11 + 26 * x + 8 * x ** 2 + 15 * x ** 3 + 2 * x ** 4);
}
/** @param {number} x */
function nextFieldUnit(x) {
  const digits = Array(5).fill(0);
  for (let i = 0; i < 4; i++) {
    const trit = x % 3;
    x = Math.floor(x / 3);
    digits[i] += trit;
    digits[i + 1] += trit;
  }
  const carry = digits[4] % 3;
  for (let i = 0; i < 3; i++) digits[i] -= carry;
  return digits.slice(0, 4).reduce((sum, v, i) => sum +
    ((v % 3 + 3) % 3) * 3 ** i, 0);
}
const g = [1];
while (g.length < 80) g.push(nextFieldUnit(g.at(-1)));
assert.equal(new Set(g).size, 80);
assert.equal(nextFieldUnit(g.at(-1)), 1);

const sourceKeys = {
  field: slots.map(i => A[81 * g[Math.floor(i / 80)] + g[i % 80]]),
  crop: slots.map(i => A[81 * (Math.floor(i / 80) + 1) + 1 + i % 80])
};
const clock = B.map((_, j) => {
  const byte = tokens[(6561 + j - 1) % 256];
  return { rounds: Math.floor(byte / 60), direction: byte % 2 === 1 ? 1 : -1 };
});
assert(clock.every(state => state.rounds >= 0 && state.rounds <= 4));

/**
 * F is nonbijective, but either Feistel direction is an exact pair bijection.
 * @param {number[]} pair
 * @param {number} rounds
 * @param {1|-1} direction
 * @returns {number[]}
 */
function feistel(pair, rounds, direction) {
  let [left, right] = pair;
  for (let j = 0; j < rounds; j++) {
    if (direction === 1) [left, right] = [right, mod(left + polynomial(right))];
    else [left, right] = [mod(right - polynomial(left)), left];
  }
  return [left, right];
}

/**
 * P7 source GF29 butterfly [[1,1],[-1,1]], determinant2.
 * Inverse multiplier 15 is 2^(-1) mod29.
 * @param {number[]} pair
 * @param {number} rounds
 * @param {1|-1} direction
 */
function butterfly(pair, rounds, direction) {
  let [left, right] = pair;
  for (let j = 0; j < rounds; j++) {
    if (direction === 1) [left, right] = [mod(left + right), mod(right - left)];
    else [left, right] = [mod(15 * (left - right)), mod(15 * (left + right))];
  }
  return [left, right];
}

/** @param {number[]} runes */
function score(runes) {
  const bins = Array(29).fill(0);
  for (const x of runes) bins[x]++;
  return {
    ioc: bins.reduce((sum, n) => sum + n * (n - 1), 0) /
      (runes.length * (runes.length - 1)),
    top12: [...bins].sort((x, y) => y - x).slice(0, 12).reduce((s, n) => s + n, 0)
  };
}

const results = [];
for (const [name, transform] of Object.entries({ feistel, butterfly })) {
  // Exhaustively prove individual transform round-trips for 29x29 pairs
  // through all five source round counts and both parity directions.
  for (let rounds = 0; rounds <= 4; rounds++) {
    for (let left = 0; left < 29; left++) {
      for (let right = 0; right < 29; right++) {
        const pair = [left, right];
        assert.deepEqual(transform(transform(pair, rounds, 1), rounds, -1), pair);
        assert.deepEqual(transform(transform(pair, rounds, -1), rounds, 1), pair);
      }
    }
  }
  for (const [keyName, key] of Object.entries(sourceKeys)) {
    for (let outputChannel = 0; outputChannel < 2; outputChannel++) {
      const recovered = B.map((cipher, i) =>
        transform([key[i], cipher], clock[i].rounds,
          /** @type {1|-1} */ (clock[i].direction))[outputChannel]);
      const statistics = score(recovered);
      results.push({ transform: name, sourceKey: keyName, outputChannel, ...statistics });
      assert(statistics.ioc >= 0.03 && statistics.ioc <= 0.04);
    }
  }
}
const native = encodeSourceNativeGP(fs.readFileSync(
  path.join(root, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8')).slice(0, 6395);
assert.equal(native.length, 6395);
const nativeStats = score(native);
assert(nativeStats.ioc > 0.045);
const originalStats = score(B);
console.log(JSON.stringify({
  source: 'Original LP2 p0–55 and physical 32x8 p49–51 base60 table',
  p7_gp29_polynomial_coefficients: [11, 26, 8, 15, 2],
  genuine_p7_butterfly_determinant: 2,
  p8_field_source_generator: 4,
  source_predecessor_global_rune_p50_clock: true,
  original_ciphertext: originalStats,
  full_native_gibran_control: nativeStats,
  fully_invertible_original_models: results.length,
  models: results,
  synthetic_all_29x29_positive_replays: 'PASS'
}, null, 2));
