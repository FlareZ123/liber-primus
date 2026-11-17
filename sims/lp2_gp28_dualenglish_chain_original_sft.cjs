'use strict';

/**
 * Source-native dual-English GP28 chain architecture test on all original
 * LP2 unknown GP29 runes. Read-only single-file test, Node.js 22 / Windows.
 *   node sims/lp2_gp28_dualenglish_chain_original_sft.cjs
 *
 * This tests a concrete explanation of the near-exclusion of consecutive
 * identical ciphertext glyphs. It does not search key text offsets.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceNames = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
];
const runeNames = corpus.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
const units28 = Array.from({ length: 27 }, (_, i) => i + 1)
  .filter((x) => x % 2 !== 0 && x % 7 !== 0);

/** @param {number} x @param {number} n @returns {number} */
const mod = (x, n) => ((x % n) + n) % n;

/** @param {string} raw @returns {number[]} */
function toGp(raw) {
  const text = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  /** @type {number[]} */
  const result = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        result.push(21); i += 3; continue;
      }
      if (word.startsWith('IO', i)) {
        result.push(27); i += 2; continue;
      }
      const entry = runeNames.find((name) => word.startsWith(name.token, i));
      assert.ok(entry, 'GP tokenizer must encode authentic Latin source');
      result.push(entry.index);
      i += entry.token.length;
    }
  }
  return result;
}
assert.deepEqual(toGp('THINGS'), [2, 21, 15]);
assert.deepEqual(toGp('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);

const original = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
assert.equal(original.length, 55);
assert.equal(original.reduce((s, page) => s + page.indices.length, 0), 12956);
const steps = Array(29).fill(0);
for (const page of original) {
  for (let i = 1; i < page.indices.length; i++) {
    steps[mod(page.indices[i] - page.indices[i - 1], 29)]++;
  }
}
assert.equal(steps[0], 86);
assert.equal(steps.slice(1).reduce((a, b) => a + b, 0), 12815);
const actual = steps.slice(1);
const N = 12815;

/**
 * Independent P and K GP28 marginal frequencies, conditioning both on
 * not being the hypothesized reserved EA (GP ordinal 28).
 * @param {number[]} gp
 * @returns {number[]}
 */
function frequency(gp) {
  const count = Array(29).fill(0);
  for (const value of gp) count[value]++;
  const n = count.slice(0, 28).reduce((s, value) => s + value, 0);
  return count.slice(0, 28).map((value) => value / n);
}

/**
 * Search all 28 t, 12 invertible output scalings a and 28 offsets b.
 * H = 1 + (a*(rankEA(P) + t*rankEA(K)) + b) mod28, with H=0 reserved
 * for P=EA. This includes inverse direction, cyclic shifts and secret
 * invertible affine output alphabets; it does not introduce an arbitrary
 * 28! step permutation or plaintext-dependent keystream.
 *
 * @param {number[]} p probabilities of plaintext symbols
 * @param {number[]} k probabilities of independent key symbols
 */
function bestModel(p, k) {
  let best = { chi2: Infinity, t: -1, a: -1, b: -1 };
  for (let t = 0; t < 28; t++) {
    const probability = new Float64Array(28);
    for (let i = 0; i < 28; i++) {
      for (let j = 0; j < 28; j++) {
        probability[(i + t * j) % 28] += p[i] * k[j];
      }
    }
    for (const a of units28) {
      for (let b = 0; b < 28; b++) {
        let chi2 = 0;
        for (let i = 0; i < 28; i++) {
          const expected = N * probability[i];
          const observed = actual[(a * i + b) % 28];
          chi2 += (observed - expected) ** 2 / expected;
        }
        if (chi2 < best.chi2) best = { chi2, t, a, b };
      }
    }
  }
  return best;
}

const texts = sourceNames.map((name) => toGp(read(name)));
const probabilities = texts.map(frequency);
assert.deepEqual(texts.map((v) => v.length), [217106, 62492, 321327]);
const expectedChi = [
  [153.97097533741254, 143.37795262290498, 166.1463832265752],
  [143.37795262290487, 146.7768049927899, 161.82999289807702],
  [166.1463832265752, 161.82999289807725, 188.54883218894201],
];

const results = [];
for (let p = 0; p < 3; p++) {
  for (let k = 0; k < 3; k++) {
    const best = bestModel(probabilities[p], probabilities[k]);
    assert.ok(Math.abs(best.chi2 - expectedChi[p][k]) < 1e-6);
    assert.ok(best.chi2 > 140);
    results.push({
      plaintextRegister: sourceNames[p], keyRegister: sourceNames[k], ...best,
    });
  }
}

// Known solved p57 GP-native positive: exact reversible predecessor transport,
// with independent running-key stream and an EA interruption.
const planted = corpus.pages[57].indices.slice();
assert.equal(planted.length, 95);
planted[56] = 28; // explicit GP28 exception, independently located by this plant
const plainKey = texts[1].filter((value) => value !== 28).slice(0, planted.length);
const t = 11, a = 17, b = 5;
let oldCipher = 7;
const encrypted = planted.map((value, i) => {
  const step = value === 28 ? 0 : 1 + ((a * (value + t * plainKey[i]) + b) % 28);
  oldCipher = (oldCipher + step) % 29;
  return oldCipher;
});
let preceding = 7;
const inverseA = units28.find((candidate) => (candidate * a) % 28 === 1);
assert.equal(inverseA, 5);
const decrypted = encrypted.map((value, i) => {
  const delta = mod(value - preceding, 29);
  preceding = value;
  if (delta === 0) return 28;
  const u = mod((delta - 1 - b) * inverseA, 28);
  return mod(u - t * plainKey[i], 28);
});
assert.deepEqual(decrypted, planted);
const positiveDoublets = encrypted.reduce(
  (n, value, i) => n + (i > 0 && value === encrypted[i - 1] ? 1 : 0), 0);
assert.ok(positiveDoublets >= 1);

console.log(JSON.stringify({
  originalRunes: 12956,
  originalPageLocalTransitions: 12901,
  originalEqualAdjacent: 86,
  originalNonzeroSteps: N,
  originalNonzeroStepChi2FromUniform:
    actual.reduce((s, count) => s + (count - N / 28) ** 2 / (N / 28), 0),
  family: 'EA-reserved, GP28 dual-English rank sums, all fixed invertible output affine maps',
  writerCrossPairs: results,
  minimumChi2: Math.min(...results.map((item) => item.chi2)),
  sourcePositive: {
    runesRecovered: decrypted.length, implantedEA: 56,
    literalRepeatEvents: positiveDoublets,
  },
}, null, 2));
