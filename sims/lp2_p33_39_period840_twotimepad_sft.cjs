/** Original LP2 p33–39 1680=2*840 repeating-pad null test.
 * An identical period-840 GP29 additive key cancels in half-minus-half,
 * while an alternating sign key cancels in half-plus-half.
 * Source-derived motivation: exact physical visual chapter length and
 * independent GF(29^2)* generator order 840; authorial clock not established.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} file */
function get(file) {
  return fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', file), 'utf8');
}
/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} source */
function freq(source) {
  const counts = Array(29).fill(0);
  for (const rune of source) counts[rune]++;
  return counts;
}
/** @param {number[]} a @param {number[]} b @param {'minus'|'plus'} op */
function pair(a, b, op) {
  assert.equal(a.length, 840); assert.equal(b.length, 840);
  return a.map((v, i) => mod(op === 'minus' ? v - b[i] : v + b[i]));
}
/** @param {number[]} h @param {number[]} expected */
function chi2(h, expected) {
  return h.reduce((sum, v, i) => sum + (v - expected[i]) ** 2 / expected[i], 0);
}
/** @param {number[]} frequencies @param {'minus'|'plus'} op */
function expectedDistribution(frequencies, op) {
  const f = frequencies.map(v => v / frequencies.reduce((s, x) => s + x, 0));
  return Array.from({ length: 29 }, (_, d) => 840 * f.reduce((sum, v, i) =>
    sum + v * f[op === 'minus' ? mod(i - d) : mod(d - i)], 0));
}
const corpus = JSON.parse(get('lp2-corpus.json'));
const plaintextSource = get('lp1-plaintext-reference.txt');
const tokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
// Exclude editorial metadata, numeric-only lines and continuation notices.
const clean = plaintextSource.split(/\r?\n/)
  .filter(line => !/^\s*(#|\[|[0-9])/.test(line)).join(' ')
  .toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
  .replace(/K/g, 'C').replace(/[^A-Z]/g, '');
/** @type {number[]} */
const native = [];
for (let i = 0; i < clean.length;) {
  const match = tokens.find(t => clean.startsWith(t.token, i));
  assert.ok(match, 'Unencodable GP transliteration at offset ' + i);
  native.push(match.index); i += match.token.length;
}
assert.equal(native.length, 3078);
const chapter = corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .flatMap(p => p.indices);
assert.equal(chapter.length, 1680);
const first = chapter.slice(0, 840), second = chapter.slice(840);
const key = Array.from({ length: 840 }, (_, i) => mod(i * i + 17 * i + 13));
// Positive plants: same-sign or opposite-sign reuse, exact cancellation and decoding.
const planted = native.slice(0, 1680), leftPlant = planted.slice(0, 840);
const rightPlant = planted.slice(840);
const cipherL = leftPlant.map((v, i) => mod(v + key[i]));
const cipherR = rightPlant.map((v, i) => mod(v + key[i]));
const cipherRAlternating = rightPlant.map((v, i) => mod(v - key[i]));
assert.deepEqual(pair(cipherL, cipherR, 'minus'), pair(leftPlant, rightPlant, 'minus'));
assert.deepEqual(pair(cipherL, cipherRAlternating, 'plus'), pair(leftPlant, rightPlant, 'plus'));
// A period-840 family of 840 arbitrary distinct per-position affine bijections
// preserves every pairwise equality without knowledge of any secret alphabet.
const slopes = Array.from({ length: 840 }, (_, i) => 1 + (i % 28));
const alphabetLeft = leftPlant.map((v, i) => mod(slopes[i] * v + key[i]));
const alphabetRight = rightPlant.map((v, i) => mod(slopes[i] * v + key[i]));
const countEqual = (a, b) => a.reduce((s, v, i) => s + Number(v === b[i]), 0);
assert.equal(countEqual(alphabetLeft, alphabetRight), countEqual(leftPlant, rightPlant));
assert.equal(countEqual(first, second), 28);

for (const [kind, op] of [['same-sign', 'minus'], ['opposite-sign', 'plus']]) {
  const nativeExp = expectedDistribution(freq(native), op);
  const observed = freq(pair(first, second, op));
  let controlMinimumZero = Infinity, controlMaximumChi2 = -Infinity, controlAtLeastAsLarge = 0;
  const observedChi2 = chi2(observed, nativeExp);
  let controlCount = 0;
  for (let i = 0; i + 1680 <= native.length; i++) {
    const control = freq(pair(native.slice(i, i + 840), native.slice(i + 840, i + 1680), op));
    const score = chi2(control, nativeExp);
    controlCount++;
    if (control[0] < controlMinimumZero) controlMinimumZero = control[0];
    if (score > controlMaximumChi2) controlMaximumChi2 = score;
    if (score >= observedChi2) controlAtLeastAsLarge++;
  }
  assert.equal(controlCount, 1399);
  assert.equal(controlAtLeastAsLarge, 0);
  const expectedValues = kind === 'same-sign'
    ? { zero: 28, expected: 51.09591175252403, chi2: 59.97963949631103 }
    : { zero: 30, expected: 19.4797766200933, chi2: 78.86094318992285 };
  assert.equal(observed[0], expectedValues.zero);
  assert.ok(Math.abs(nativeExp[0] - expectedValues.expected) < 1e-9);
  assert.ok(Math.abs(observedChi2 - expectedValues.chi2) < 1e-9);
  console.log(JSON.stringify({
    relation: kind, chapterLength: chapter.length, period: 840,
    nativeGpCorpusLength: native.length, matchingEnglishControlWindows: controlCount,
    observedZero: observed[0], nativeExpectedZero: nativeExp[0],
    observedChi2, maxNativeControlChi2: controlMaximumChi2,
    minNativeControlZero: controlMinimumZero,
    controlsAtLeastAsExtreme: controlAtLeastAsLarge,
    nativePositivePlantRecovered: '1680/1680', inputComparison: observed
  }));
}
console.log('PASS: original fixed half-cycle excludes repeated-key native GP-English in both frozen signs. No unknown plaintext.');
