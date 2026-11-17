'use strict';

/**
 * Source-frozen GP29 divisor-zeta/Mobius inverse on all unknown original LP2.
 *
 * LP1 prints "MOBIUS" with a primes/totient instruction. This script tests
 * literal number-theoretic Mobius inversion in the natural one-based printed
 * rune order, including source-visible whole-book, visual-chapter, and
 * physical-page clock resets. No offset/key/secret alphabet is fitted.
 *
 * Run as one file on Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const originalPages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const original = originalPages.flatMap((page) => page.indices);
const chapterSizes = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
const knownNative = corpus.pages[57].indices;
assert.equal(originalPages.length, 55);
assert.equal(original.length, 12956);
assert.equal(chapterSizes.reduce((sum, count) => sum + count, 0), original.length);
assert.equal(knownNative.length, 95);
assert.equal(corpus.translit.length, 29);

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * Divisor-zeta convolution. Input p[1..n] => c[n]=sum_(d|n) p[d].
 * @param {number[]} plain
 * @returns {number[]}
 */
function zeta(plain) {
  const result = Array(plain.length).fill(0);
  for (let divisor = 1; divisor <= plain.length; divisor++) {
    for (let multiple = divisor; multiple <= plain.length; multiple += divisor) {
      result[multiple - 1] = mod29(result[multiple - 1] + plain[divisor - 1]);
    }
  }
  return result;
}

/**
 * Mobius inverse of divisor-zeta. Input c[1..n] => p[n] = mu*c[n].
 * @param {number[]} cipher
 * @returns {number[]}
 */
function mobius(cipher) {
  const result = cipher.slice();
  for (let divisor = 1; divisor <= cipher.length; divisor++) {
    for (let multiple = 2 * divisor; multiple <= cipher.length; multiple += divisor) {
      result[multiple - 1] = mod29(result[multiple - 1] - result[divisor - 1]);
    }
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) count[value] += 1;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} sizes @returns {number[][]} */
function splitChapterSizes(sizes) {
  let at = 0;
  const groups = [];
  for (const size of sizes) {
    groups.push(original.slice(at, at + size));
    at += size;
  }
  assert.equal(at, original.length);
  return groups;
}

/** @param {number[]} values @returns {string} */
function transliterate(values) {
  return values.map((n) => corpus.translit[n]).join(' ');
}

const groups = [
  ['continuous', [original]],
  ['nine-chapter-reset', splitChapterSizes(chapterSizes)],
  ['55-physical-page-reset', originalPages.map((page) => page.indices)]
];
const results = [];
for (const [scope, passages] of groups) {
  for (const [direction, decoder, encoder] of [
    ['mobius', mobius, zeta],
    ['zeta', zeta, mobius]
  ]) {
    const decoded = passages.flatMap((part) => decoder(part));
    assert.deepEqual(
      passages.map((part) => encoder(decoder(part))),
      passages,
      scope + ' ' + direction + ' exact original re-encoding'
    );
    // Native authentic p57 plaintext plant, not fitted to original C.
    const plant = passages.map((part, groupIndex) =>
      Array.from({ length: part.length }, (_, i) =>
        knownNative[(i + 7 * groupIndex) % knownNative.length]));
    assert.deepEqual(plant.map((part) => decoder(encoder(part))), plant,
      scope + ' ' + direction + ' p57 native planted inverse');
    results.push({ scope, direction, ioc: ioc(decoded),
      first80: transliterate(decoded.slice(0, 80)) });
  }
}
const expected = [
  0.034479208135983576, 0.03451727897968709,
  0.034523939887865576, 0.03446437301848408,
  0.03448913396158765, 0.03448086442621042
];
assert.equal(results.length, expected.length);
results.forEach((entry, i) => {
  assert.ok(Math.abs(entry.ioc - expected[i]) < 1e-14);
  console.log(entry.scope + ' / ' + entry.direction
    + ' IoC=' + entry.ioc.toFixed(11));
  console.log('  first80 GP tokens: ' + entry.first80);
});
console.log('Original GP29 IoC=' + ioc(original).toFixed(11)
  + '; authentic clear p57 IoC=' + ioc(knownNative).toFixed(11));
console.log('PASS: 6/6 original exact inverses and 6/6 native-p57 plants');
