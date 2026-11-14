'use strict';
/**
 * Exact finite-state inverse gate for the p15 Fibonacci-prime, 30-digit BASE29
 * keystream under the historically authenticated plaintext-F bypass.
 *
 * Reuses the independently positive-tested Cicada encoder. Every possible
 * ciphertext-F interpretation is retained, for both signs and all 30 starting
 * phases. No English score, guessed plaintext, or key tuning is used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { base29Digits } = require('./p15_fibonacci_prime_base29_key_sft.cjs');
const { encrypt, printedWords, concat, original } =
  require('./lp2_ftransparent_original_lexical_viterbi_sft.cjs');

const primeValues = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463,
  829, 1481, 2593, 4507, 7817];
const key = primeValues.flatMap(base29Digits);
const base29 = '0123456789ABCDEFGHIJKLMNOPQRS';
const sourceKey = key.map(value => base29[value]).join('');
assert.equal(sourceKey, '2357DN1E2L5492FSSH1M232C5AC98G');
assert.equal(key.length, 30);

const transcript = fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-transcription.txt'),
  'utf8');
const pages = transcript.split(/^\s*%\s*$/m);
const p15 = pages[15].split('$');
assert.equal(p15.length, 2);
const secondRedHeadingEnds = p15[1].indexOf('.');
assert.ok(secondRedHeadingEnds > 0);
const sectionText = p15[1].slice(secondRedHeadingEnds + 1);
const expected = original.pages.filter(p => p.page >= 15 && p.page <= 22)
  .flatMap(p => p.page === 15 ? p.indices.slice(20) : p.indices);
assert.equal(expected.length, 1883);
const parts = [sectionText, ...pages.slice(16, 23)]
  .map(s => s.replace(/[&$\s]+$/gu, '').trim());
const words = printedWords(parts.join('/'));
assert.deepEqual(concat(words), expected);

/**
 * Original-cipher reachability under the exact plaintext-F transparency.
 * A ciphertext F may be literal F (no key step) or encrypted non-F
 * (one step). A key-consuming branch yielding plaintext F is forbidden.
 * @param {number[]} cipher
 * @param {number} sign
 * @param {number} phase
 */
function reach(cipher, sign, phase) {
  let states = new Set([0]);
  let peakStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    const c = cipher[i];
    for (const consumed of states) {
      if (c === 0) next.add(consumed);
      const shift = sign * key[(phase + consumed) % key.length];
      const plain = ((c - shift) % 29 + 29) % 29;
      if (plain !== 0) next.add(consumed + 1);
    }
    if (!next.size) return {
      completed: false, deadAtZeroBased: i, originalRune: c,
      validPrefixLength: i, peakStates
    };
    states = next;
    if (states.size > peakStates) peakStates = states.size;
  }
  return {
    completed: true, validPrefixLength: cipher.length,
    finalKeyClockStates: [...states].sort((a, b) => a - b), peakStates
  };
}

// Genuine pre-existing, source-clear GP control; encrypt through the actual
// historical rule and then recover reachability with its unknown F clock.
const clearP57 = original.pages.find(p => p.page === 57).indices;
assert.equal(clearP57.length, 95);
for (const sign of [1, -1]) {
  for (let phase = 0; phase < 30; phase++) {
    const shift = consumed => sign * key[(phase + consumed) % key.length];
    const planted = encrypt(clearP57, shift);
    const check = reach(planted, sign, phase);
    assert.equal(check.completed, true, 'Authentic-GP source plant unreachable');
    const literalF = clearP57.filter(p => p === 0).length;
    assert.ok(check.finalKeyClockStates.includes(clearP57.length - literalF),
      'Actual planted key clock was lost');
  }
}
const results = [];
for (const sign of [1, -1]) {
  for (let phase = 0; phase < 30; phase++) {
    results.push({ sign, phase, ...reach(expected, sign, phase) });
  }
}
const survivors = results.filter(p => p.completed);
// A separate, independently source-credible reset policy starts the same
// p15 key fresh on the immediately following physical p16 page (267 runes).
// Testing all thirty phases makes its exact internal phase immaterial.
const page16 = original.pages.find(p => p.page === 16).indices;
assert.equal(page16.length, 267);
const p16Reset = [];
for (const sign of [1, -1]) {
  for (let phase = 0; phase < 30; phase++) {
    p16Reset.push({ sign, phase, ...reach(page16, sign, phase) });
  }
}
const p16Survivors = p16Reset.filter(p => p.completed);
const worstCases = results.slice().sort((a, b) =>
  b.validPrefixLength - a.validPrefixLength).slice(0, 12);
const report = {
  hypothesis: 'p15 sixteen Fibonacci-indexed source primes encoded as signed-2013 BASE29 digits, repeated over original p15-22 GP29 under original plaintext-F bypass',
  exactKey: sourceKey,
  keyLength: key.length,
  originalCipherRunes: expected.length,
  originalPrintedWords: words.length,
  tests: results.length,
  allSourceCiphertextFChoicesRetained: true,
  allSourceKeyPhasesAndBothSigns: true,
  nativeGpAuthenticFTransparentPositiveControls: 60,
  completedOriginalVariants: survivors.length,
  survivors,
  independentPage16Reset: {
    originalRunes: page16.length, testedSignPhaseVariants: p16Reset.length,
    completedVariants: p16Survivors.length,
    survivors: p16Survivors,
    longestValidPrefix: Math.max(...p16Reset.map(p => p.validPrefixLength))
  },
  mostPersistentFailedVariants: worstCases,
  earliestObstruction: Math.min(...results.filter(p => !p.completed).map(p => p.deadAtZeroBased)),
  claimLimit: 'Exact necessary-condition test of one source-derived key and historical cipher. Other mechanisms, keys and symbol encodings are outside scope.'
};
console.log(JSON.stringify(report, null, 2));
