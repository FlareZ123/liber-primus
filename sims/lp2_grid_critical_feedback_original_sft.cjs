'use strict';
/**
 * 32 original-input source-fixed GP29 feedback inverses driven by
 * the grid-polynomial's two source-marked critical points 13 and 24.
 *
 * s_(i+1) = P(s_i) + f_i   OR   P(s_i + f_i)       (mod 29)
 * f_i is ciphertext or decoded plaintext.
 * Decoding: plaintext_i = ciphertext_i + sign*s_i (mod 29).
 * Seed13 is sourced from the 31 thirteen-dot marks; seed24 is the
 * oversized p54 Ac. Book-continuous and physical-page-reset clocks.
 *
 * A separate Shakespeare GP model is trained before original testing,
 * and all 32 matching source-native plants must recover exactly.
 *
 * Run: node sims/lp2_grid_critical_feedback_original_sft.cjs
 * Negative outcome does not exclude other non-GP or source-key mechanisms.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
function json(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
const original = pages.flat();
assert.equal(original.length, 12956);
const mod = n => ((n % 29) + 29) % 29;
const P = Array.from({ length: 29 }, (_, x) => {
  let v = 0;
  for (const b of grid.bytes) v = mod(v * x + b);
  return v;
});
assert.deepEqual([P[13], P[24]], [8, 0]);

/** Existing GP normalization used by independent corpus controls.
 * @param {string} text @returns {number[]}
 */
function gpEncode(text) {
  const map = new Map(corpus.translit.map((s, i) => [s, i]));
  const output = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const two = word.slice(i, i + 2);
      if (map.has(two)) {
        output.push(map.get(two));
        i += 2;
      } else {
        if (map.has(word[i])) output.push(map.get(word[i]));
        i++;
      }
    }
  }
  return output;
}
const gp = gpEncode(fs.readFileSync(
  path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8'));
assert(gp.length > 200000);
const train = gp.slice(0, 100000);
const native = gp.slice(150000, 150000 + original.length);
assert.equal(native.length, original.length);
const trigrams = new Uint32Array(29 ** 3);
const bigrams = new Uint32Array(29 ** 2);
for (let i = 2; i < train.length; i++) {
  trigrams[train[i - 2] * 841 + train[i - 1] * 29 + train[i]]++;
  bigrams[train[i - 2] * 29 + train[i - 1]]++;
}
const model = Float64Array.from({ length: 29 ** 3 }, (_, i) =>
  Math.log((trigrams[i] + 0.25) /
    (bigrams[Math.floor(i / 29)] + 7.25)));
/** @param {number[]} a */
function score(a) {
  let sum = 0;
  for (let i = 2; i < a.length; i++) {
    sum += model[a[i - 2] * 841 + a[i - 1] * 29 + a[i]];
  }
  return sum / (a.length - 2);
}
/** @param {number[]} a */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const x of a) count[x]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/**
 * @typedef {{seed:number, reset:boolean, feedback:'C'|'P',
 * mix:'inside'|'outside', sign:number}} Mode
 * @param {number[]} data
 * @param {Mode} mode
 * @param {boolean} encrypt
 */
function transform(data, mode, encrypt) {
  const output = [];
  let offset = 0, state = mode.seed;
  for (const page of pages) {
    if (mode.reset) state = mode.seed;
    for (let i = 0; i < page.length; i++) {
      const sourceSymbol = data[offset++];
      const cipher = encrypt ? mod(sourceSymbol - mode.sign * state) : sourceSymbol;
      const plain = encrypt ? sourceSymbol : mod(cipher + mode.sign * state);
      output.push(encrypt ? cipher : plain);
      const feedback = mode.feedback === 'C' ? cipher : plain;
      state = mode.mix === 'inside'
        ? P[mod(state + feedback)]
        : mod(P[state] + feedback);
    }
  }
  assert.equal(offset, data.length);
  return output;
}
const candidateModes = [];
for (const seed of [13, 24])
  for (const reset of [false, true])
    for (const feedback of ['C', 'P'])
      for (const mix of ['inside', 'outside'])
        for (const sign of [-1, 1]) {
          /** @type {Mode} */
          const mode = { seed, reset, feedback, mix, sign };
          const originalPlain = transform(original, mode, false);
          assert.deepEqual(transform(originalPlain, mode, true), original);
          const plantedCipher = transform(native, mode, true);
          assert.deepEqual(transform(plantedCipher, mode, false), native);
          candidateModes.push({ ...mode,
            originalScore: score(originalPlain),
            originalIoc: ioc(originalPlain) });
        }
assert.equal(candidateModes.length, 32);
candidateModes.sort((a, b) => b.originalScore - a.originalScore);
const originalRawScore = score(original);
const nativeScore = score(native);
assert(Math.abs(originalRawScore - (-4.147504344592278)) < 1e-10);
assert(Math.abs(nativeScore - (-2.4594998104466215)) < 1e-10);
assert(Math.abs(candidateModes[0].originalScore -
  (-4.147495136534888)) < 1e-10);
assert(candidateModes.every(x => x.originalScore < -4.14));
console.log(JSON.stringify({
  tested: candidateModes.length,
  originalRunes: original.length,
  originalRaw: { score: originalRawScore, ioc: ioc(original) },
  nativeHeldout: { score: nativeScore, ioc: ioc(native) },
  best: candidateModes.slice(0, 8),
  allOriginalIoc: {
    min: Math.min(...candidateModes.map(x => x.originalIoc)),
    max: Math.max(...candidateModes.map(x => x.originalIoc))
  },
  allOriginalCipherAndPlantRoundtrips: true,
  recoveredOriginalPlaintext: false
}, null, 2));
