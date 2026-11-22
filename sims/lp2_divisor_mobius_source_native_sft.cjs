'use strict';
/**
 * Original LP2 candidate: arithmetic Möbius inversion (Dirichlet divisor-zeta
 * transform), selected by literal solved-LP1 MOBIUS + sacred totient clue.
 * All arithmetic is exact mod29, using source-printed GP runes and source
 * visual chapter boundaries. Native solved p57 provides a full positive plant.
 *
 * Windows Node.js 22:
 *   node sims/lp2_divisor_mobius_source_native_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ref = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
assert.ok(ref.includes('MOBIUS'), 'LP1 reference must contain the source MOBIUS name');
assert.ok(ref.includes('THE TOTIENT FUNCTION IS SACRED'), 'Original totient cue missing');

const blocks = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const expectedLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];

/**
 * C(n) = sum_{d divides n} P(d) mod29. The source-visible first rune
 * is at n=1; no leading zero, free phase, key or deleted GP F rune.
 * @param {number[]} source
 * @returns {number[]}
 */
function divisorZeta(source) {
  const out = Array(source.length).fill(0);
  for (let d = 1; d <= source.length; d++) {
    for (let n = d; n <= source.length; n += d) {
      out[n - 1] = (out[n - 1] + source[d - 1]) % 29;
    }
  }
  return out;
}

/**
 * Dirichlet Möbius inversion by triangular elimination on divisibility:
 * P(n) = C(n) - sum_{d|n,d<n} P(d) mod29.
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function mobiusInverse(ciphertext) {
  const out = ciphertext.slice();
  for (let d = 1; d <= ciphertext.length; d++) {
    for (let n = 2 * d; n <= ciphertext.length; n += d) {
      out[n - 1] = (out[n - 1] - out[d - 1] + 29) % 29;
    }
  }
  return out;
}

/**
 * @param {number[]} indices
 * @returns {{n:number,ioc:number,top5:number,preview:string}}
 */
function describe(indices) {
  const count = Array(29).fill(0);
  for (const x of indices) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    count[x]++;
  }
  const n = indices.length;
  const ioc = count.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
  const top = count.slice().sort((a, b) => b - a)
    .slice(0, 5).reduce((a, b) => a + b, 0) / n;
  return {
    n,
    ioc: Number(ioc.toFixed(8)),
    top5: Number(top.toFixed(8)),
    preview: indices.slice(0, 40).map((x) => corpus.translit[x]).join('')
  };
}

function sourceInterval(a, b) {
  return corpus.pages.filter((p) => p.page >= a && p.page <= b)
    .flatMap((p) => p.indices);
}

const allOriginal = sourceInterval(0, 55);
assert.equal(allOriginal.length, 12956);
let total = 0;
let maxUnknownIoc = 0;
for (let k = 0; k < blocks.length; k++) {
  const [a, b] = blocks[k];
  const c = sourceInterval(a, b);
  assert.equal(c.length, expectedLengths[k]);
  total += c.length;
  const inverse = mobiusInverse(c);
  const forward = divisorZeta(c);

  // Both known transformations are individually invertible on the EXACT
  // original chapter input, even when their result is nonlinguistic.
  assert.deepEqual(divisorZeta(inverse), c);
  assert.deepEqual(mobiusInverse(forward), c);
  maxUnknownIoc = Math.max(maxUnknownIoc,
    describe(inverse).ioc, describe(forward).ioc);
  console.log(JSON.stringify({
    pages: [a, b],
    original: describe(c),
    candidateInverse: describe(inverse),
    candidateForward: describe(forward)
  }));
}
assert.equal(total, 12956);
assert.ok(maxUnknownIoc < 0.05,
  'Some original inverse output exceeds predeclared native language gate');

// Also test one uninterrupted all-unknown source stream, rather than
// assuming chapter resets that have never been cipher-authenticated.
const allInverse = mobiusInverse(allOriginal);
const allForward = divisorZeta(allOriginal);
assert.deepEqual(divisorZeta(allInverse), allOriginal);
assert.deepEqual(mobiusInverse(allForward), allOriginal);
console.log('Whole book: ' + JSON.stringify({
  original: describe(allOriginal),
  inverse: describe(allInverse),
  forward: describe(allForward)
}));

// Non-synthetic source-native plaintext: solved physical p57 PARABLE.
// Encrypt its authentic 95 GP29 indices with divisor-zeta, invert the
// resulting ciphertext and require byte-exact original rune recovery.
const clear = sourceInterval(57, 57);
assert.equal(clear.length, 95);
const cipherPlant = divisorZeta(clear);
assert.deepEqual(mobiusInverse(cipherPlant), clear);
assert.ok(describe(clear).ioc > 0.06);
assert.ok(describe(cipherPlant).ioc < 0.05);
console.log('Native solved PARABLE positive: ' + JSON.stringify({
  native: describe(clear),
  coded: describe(cipherPlant),
  recovered: describe(mobiusInverse(cipherPlant))
}));
console.log('PASS: all nine source-visible original chapter inverse+forward negatives, ' +
  'whole-book exact roundtrip, and authentic 95-rune PARABLE Möbius plant.');
