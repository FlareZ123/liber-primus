'use strict';

/**
 * Original p7->p8 source-derived seventh-root Fourier full-chapter receiver.
 *
 * Physically printed p7 red whole-word rune products are [11,26,8,15,2].
 * In conjunction with the printed red p8 whole-word products [4,3] and
 * terminal red rune17, these supply the conditional 3-4-5 -> 8-15-17
 * Pythagorean finite-field rotation, whose eigenvalues in F29 are 16/20.
 * Both are exact primitive 7th roots of unity.
 *
 * The seven source botanical pages p8..p14 contain exactly 1,729 GP runes
 * and admit two keyless 7-channel layouts. This evaluates both direct
 * Fourier directions for each root, preserving every original rune.
 *
 * This is a bounded original-cipher NEGATIVE, not recovered plaintext.
 * All operations are fully reversible. Independent solved-p57 native clear
 * GP29 is used as a positive plant.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_p7_root7_fourier_botanical_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = x => (x % 29 + 29) % 29;
const e7 = x => (x % 7 + 7) % 7;

/** @param {number} base @param {number} exponent @returns {number} */
function power(base, exponent) {
  let result = 1;
  for (let i = 0; i < exponent; i++) result = result * base % 29;
  return result;
}

/**
 * Seven-point NTT in GF29, exactly invertible.
 * @param {number[]} block exactly seven GP digits
 * @param {number} root primitive seventh root
 * @param {boolean} inverse true applies the normalizing 1/7 factor
 * @returns {number[]}
 */
function transform7(block, root, inverse) {
  assert.equal(block.length, 7);
  const result = [];
  for (let k = 0; k < 7; k++) {
    let total = 0;
    for (let j = 0; j < 7; j++) {
      total += block[j] * power(root, e7((inverse ? -1 : 1) * j * k));
    }
    result.push(mod(total * (inverse ? 25 : 1)));
  }
  return result;
}

/**
 * @param {number[]} input complete rune stream, length divisible by seven
 * @param {'consecutive'|'lanes'} layout
 * @param {number} root primitive seventh root
 * @param {boolean} inverse
 * @returns {number[]}
 */
function apply(input, layout, root, inverse) {
  assert.equal(input.length % 7, 0);
  const result = Array(input.length);
  const width = input.length / 7;
  for (let at = 0; at < width; at++) {
    const indices = Array.from({ length: 7 }, (_, j) =>
      layout === 'consecutive' ? at * 7 + j : j * width + at);
    const seven = transform7(indices.map(i => input[i]), root, inverse);
    for (let j = 0; j < 7; j++) result[indices[j]] = seven[j];
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequency = Array(29).fill(0);
  for (const v of values) frequency[v]++;
  return frequency.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

assert.equal(power(12, 2), 28); // 12^2 = -1 in GF29.
assert.equal(mod(5 * 6), 1);   // hypotenuse-five inverse.
const eigenvalues = [mod((3 + 4 * 12) * 6),
  mod((3 - 4 * 12) * 6)].sort((a, b) => a - b);
assert.deepEqual(eigenvalues, [16, 20]);
for (const root of eigenvalues) {
  assert.equal(power(root, 7), 1);
  for (let k = 1; k < 7; k++) assert.notEqual(power(root, k), 1);
}
// This is a source-derived route to the seventh root; no arbitrary
// generator or user-selected transformation coefficient is supplied.

const botanical = corpus.pages.slice(8, 15);
assert.deepEqual(botanical.map(p => p.indices.length),
  [255, 268, 263, 273, 261, 272, 137]);
const ciphertext = botanical.flatMap(p => p.indices);
assert.equal(ciphertext.length, 1729);
assert.equal(ciphertext.length / 7, 247);
const originalIoC = ioc(ciphertext);
assert(Math.abs(originalIoC - 0.03446048347364137) < 1e-13);

// Native, genuinely solved p57 is independent plaintext. Its first 91
// runes are 13 exact seven-rune blocks for the same reversible operation.
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
assert(ioc(solved) > 0.06);
const plantedPlain = solved.slice(0, 91);

const originalReadouts = [];
for (const root of eigenvalues) {
  for (const layout of ['consecutive', 'lanes']) {
    for (const inverse of [false, true]) {
      const output = apply(ciphertext, layout, root, inverse);
      const reencryption = apply(output, layout, root, !inverse);
      assert.deepEqual(reencryption, ciphertext);
      const plantedCipher = apply(plantedPlain, layout, root, !inverse);
      assert.deepEqual(apply(plantedCipher, layout, root, inverse),
        plantedPlain);
      const score = ioc(output);
      const expected = layout === 'consecutive' ?
        0.034570266478161214 : 0.034501986804618384;
      assert(Math.abs(score - expected) < 1e-13);
      originalReadouts.push({
        root, layout, transform: inverse ? 'inverse' : 'forward',
        recoveredOriginalRunes: output.length,
        originalIoC: score,
        authenticSourceReencryption: true,
        solvedNative91RunePlantRecovered: true,
        first35: output.slice(0, 35)
          .map(i => corpus.translit[i]).join('')
      });
    }
  }
}
assert.equal(originalReadouts.length, 8);
assert(originalReadouts.every(r => r.originalIoC < 0.037));
console.log(JSON.stringify({
  source: 'p7 five-red-number Pythagorean rotation / p8 red3,4,17',
  rootDerivation: 'sqrt(-1)=12, norm(3+4i)/5 -> conjugate roots16,20',
  roots: eigenvalues, sourcePageRange: [8, 14],
  originalRuneCount: ciphertext.length, sevenLaneWidth: 247,
  originalIoC, comparedWithClearP57IoC: ioc(solved),
  originalReadouts,
  finding: 'All 8 direct source-derived Fourier original inverses remain nonprose; source authorship of the Fourier operation remains hypothetical.',
  authenticUnknownPlaintextRecovered: false
}, null, 2));
module.exports = { transform7, apply, ioc };
