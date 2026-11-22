'use strict';

/**
 * Original p7 GF29 five-red-product polynomial as a nonlinear reversible
 * two-rune Feistel round on the immediate p8+p9 cross-page receiver.
 * Read-only single-file test for Node.js 22, source text from local corpus.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const p7 = corpus.pages[7].indices;
const p8 = corpus.pages[8].indices;
const p9 = corpus.pages[9].indices;
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p9.length, 268);
assert.equal(corpus.pages[57].indices.length, 95);

const mod = (x) => ((x % 29) + 29) % 29;
const coefficients = [11, 26, 8, 15, 2];

/** @param {number} x @returns {number} */
function polynomial(x) {
  return coefficients.reduceRight((value, coefficient) =>
    mod(value * x + coefficient), 0);
}

assert.deepEqual(Array.from({ length: 29 }, (_, x) => x)
  .filter((x) => polynomial(x) === x), [3, 4]);

const image = new Set(Array.from({ length: 29 }, (_, x) => polynomial(x)));
assert.equal(image.size, 19);
const entireP8OutOfImage = p8.filter((value) => !image.has(value)).length;
assert.equal(entireP8OutOfImage, 86);
assert.equal(p8.slice(12).filter((value) => !image.has(value)).length, 81);

/**
 * Feistel forward convention: (L,R) -> (R,L+sign*f(R)).
 * @param {number[]} values
 * @param {number} sign
 * @param {number} rounds
 * @returns {number[]}
 */
function encrypt(values, sign, rounds) {
  assert.equal(values.length % 2, 0);
  const output = [];
  for (let i = 0; i < values.length; i += 2) {
    let left = values[i];
    let right = values[i + 1];
    for (let k = 0; k < rounds; k++) {
      [left, right] = [right, mod(left + sign * polynomial(right))];
    }
    output.push(left, right);
  }
  return output;
}

/**
 * Feistel inverse: (L,R) -> (R-sign*f(L),L).
 * @param {number[]} values
 * @param {number} sign
 * @param {number} rounds
 * @returns {number[]}
 */
function decrypt(values, sign, rounds) {
  assert.equal(values.length % 2, 0);
  const output = [];
  for (let i = 0; i < values.length; i += 2) {
    let left = values[i];
    let right = values[i + 1];
    for (let k = 0; k < rounds; k++) {
      [left, right] = [mod(right - sign * polynomial(left)), left];
    }
    output.push(left, right);
  }
  return output;
}

/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const receivers = [
  ['p8 original 255 + genuine p9 word-carry rune, 256', p8.concat(p9[0])],
  ['p8 exact black body 243 + genuine p9 word-carry rune, 244',
    p8.slice(12).concat(p9[0])]
];
const native = corpus.pages[57].indices;
assert.ok(coincidence(native) > 0.06);
for (const [name, original] of receivers) {
  assert.equal(original.length % 2, 0);
  console.log('\n' + name + ' sourceIoC=' + coincidence(original).toFixed(8));
  for (const rounds of [1, 2, 3, 4, 5, 8]) {
    for (const sign of [-1, 1]) {
      const decoded = decrypt(original, sign, rounds);
      assert.deepEqual(encrypt(decoded, sign, rounds), original);
      const planted = Array.from({ length: original.length },
        (_, i) => native[i % native.length]);
      assert.deepEqual(decrypt(encrypt(planted, sign, rounds), sign, rounds),
        planted);
      const ioc = coincidence(decoded);
      assert.ok(ioc < 0.05, 'unexpected original IoC requiring inspection');
      console.log('rounds=' + rounds + ' sign=' + sign +
        ' originalIoC=' + ioc.toFixed(8) + ' nativePlant=' +
        planted.length + '/' + planted.length +
        ' first30=' + decoded.slice(0, 30).map((n) => corpus.translit[n]).join(''));
    }
  }
}
console.log('\nPASS: 24 first-party-polynomial Feistel inverses and native controls,');
console.log('all original receivers reencrypt; no native-GP original-text signal.');
