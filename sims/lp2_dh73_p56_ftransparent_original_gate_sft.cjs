'use strict';

/**
 * Source-fixed DH73 to authentic p56 prime/totient F-transparent rule.
 * SFT: node sims/lp2_dh73_p56_ftransparent_original_gate_sft.cjs
 * Input: exact canonical original GP29 source, no local recoding or guessed cribs.
 *
 * Hypothesis only: candidate 73 from original p57/table DH151 proposal is
 * interpreted as the first prime in the historically demonstrated p56 cipher.
 * This does not assert Cicada selected that operation for unknown pages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = (value) => (value % 29 + 29) % 29;

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let factor = 2; factor * factor <= value; factor++)
    if (value % factor === 0) return false;
  return true;
}

/** @param {number} first @param {number} count @returns {number[]} */
function primesFrom(first, count) {
  const list = [];
  for (let value = first; list.length < count; value++)
    if (isPrime(value)) list.push(value);
  return list;
}
const primes = primesFrom(73, 350);
assert.equal(primes[0], 73);

/**
 * P56 authentic F rule: plaintext GP F (index 0) emits literal ciphertext F
 * and consumes no prime. An encrypted non-F may also emit a ciphertext F;
 * invert every such branch, rejecting any non-F ciphertext which would
 * decrypt to F.
 *
 * @param {number[]} ciphertext
 * @param {number} sign Either +1 or -1 for the inverse shift.
 * @returns {{states: {p:number[],k:number,skips:number[]}[], failAt:number|null}}
 */
function inverse(ciphertext, sign) {
  let states = [{ p: [], k: 0, skips: [] }];
  for (let i = 0; i < ciphertext.length; i++) {
    const next = [];
    for (const state of states) {
      const plaintext = mod(ciphertext[i] + sign * (primes[state.k] - 1));
      if (plaintext !== 0) next.push({
        p: [...state.p, plaintext], k: state.k + 1, skips: state.skips
      });
      if (ciphertext[i] === 0) next.push({
        p: [...state.p, 0], k: state.k, skips: [...state.skips, i]
      });
    }
    if (next.length === 0) return { states: [], failAt: i };
    states = next;
  }
  return { states, failAt: null };
}

/**
 * @param {number[]} plaintext
 * @param {number} sign
 * @returns {number[]}
 */
function forward(plaintext, sign) {
  let keyPosition = 0;
  return plaintext.map((symbol) => {
    if (symbol === 0) return 0;
    const encrypted = mod(symbol - sign * (primes[keyPosition] - 1));
    keyPosition++;
    return encrypted;
  });
}

const p54 = source.pages[54].indices;
const p55 = source.pages[55].indices;
const p57 = source.pages[57].indices;
assert.equal(p55.length, 76);
assert.equal(p54.length + p55.length, 308);
assert.equal(p57.length, 95);

// The DH source claim is frozen upstream, independently of these ciphertext
// results. This experiment tests one literal prime-value serialization of 73.
const original = [
  { name: 'p55', runes: p55, expectedFailures: { 1: 64, '-1': 32 } },
  { name: 'p54+p55', runes: p54.concat(p55),
    expectedFailures: { 1: 6, '-1': 31 } }
];

for (const sign of [1, -1]) {
  // Source-native GP prose, not invented random letters: planted cipher test.
  const nativePlaintext = p57.slice(0, 76);
  const plantedCipher = forward(nativePlaintext, sign);
  const plantedPaths = inverse(plantedCipher, sign);
  assert.equal(plantedPaths.failAt, null);
  assert(plantedPaths.states.some((state) =>
    state.p.length === nativePlaintext.length &&
    state.p.every((symbol, i) => symbol === nativePlaintext[i])));
  assert.deepEqual(forward(nativePlaintext, sign), plantedCipher);

  for (const specimen of original) {
    const result = inverse(specimen.runes, sign);
    assert.equal(result.states.length, 0);
    assert.equal(result.failAt, specimen.expectedFailures[sign]);
    console.log(JSON.stringify({
      candidateStartPrime: 73,
      source: specimen.name,
      sign,
      firstImpossibleOffsetZeroBased: result.failAt,
      fullOriginalInversePaths: result.states.length,
      nativeGPPlant76Recovered: true
    }));
  }
}
console.log('PASS: all four original runs blocked by literal-F rule; both native GP controls pass.');
