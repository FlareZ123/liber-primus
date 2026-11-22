'use strict';

// Conditional original-LP2 source polynomial receiver. A read-only single-file test.
// Run from any working directory: node sims/lp2_p39_quadratic_oneback_original_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8')
);
const MOD = 29;
const START = 24;
const FIRST_POLY = [27, 5, 15];

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** Source p39 red polynomial G(x)=27+5x+15x^2=15(x-24)^2 mod 29.
 * @param {number} x
 * @returns {number}
 */
function g(x) {
  return mod(15 * mod(x - START) ** 2);
}

/** @param {number[]} values @param {'cipher'|'plain'} feedback @returns {number[]} */
function decode(values, feedback) {
  let previous = START;
  return values.map((cipherRune) => {
    const plainRune = mod(cipherRune - g(previous));
    previous = feedback === 'cipher' ? cipherRune : plainRune;
    return plainRune;
  });
}

/** @param {number[]} values @param {'cipher'|'plain'} feedback @returns {number[]} */
function encode(values, feedback) {
  let previous = START;
  return values.map((plainRune) => {
    const cipherRune = mod(plainRune + g(previous));
    previous = feedback === 'cipher' ? cipherRune : plainRune;
    return cipherRune;
  });
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(MOD).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number} first @param {number} last @returns {number[]} */
function original(first, last) {
  return corpus.pages.slice(first, last + 1).flatMap((page) => page.indices);
}

assert.deepStrictEqual(corpus.pages[39].indices.slice(119, 122), FIRST_POLY);
for (let value = 0; value < MOD; value += 1) {
  assert.equal(g(value), mod(27 + 5 * value + 15 * value * value));
}
assert.equal(g(START), 0);

const clearPage = original(57, 57);
assert.equal(clearPage.length, 95);
console.log('p39 original red triad:', FIRST_POLY.join(','), 'at physical rune offset 119');
console.log('G(24)=0; fixed seed 24; cipher-feedback and plain-feedback are the only evaluated updates');
console.log('native original-clear p57 IoC:', ioc(clearPage).toFixed(12));

for (const [first, last, expected] of [
  [40, 53, [0.03459259953724996, 0.03434760381804159]],
  [54, 55, [0.03473074157113245, 0.034286560345192264]],
  [16, 21, [0.03487175384861524, 0.03433024787743505]],
]) {
  const source = original(first, last);
  const plant = Array.from({ length: source.length }, (_, i) => clearPage[i % clearPage.length]);
  console.log('original p' + first + '-p' + last, source.length, 'runes; ciphertext IoC', ioc(source).toFixed(12));
  for (const [index, feedback] of ['cipher', 'plain'].entries()) {
    const inverse = decode(source, feedback);
    assert.deepStrictEqual(encode(inverse, feedback), source);
    assert.deepStrictEqual(decode(encode(plant, feedback), feedback), plant);
    assert.ok(Math.abs(ioc(inverse) - expected[index]) < 1e-12);
    console.log(
      ' feedback=' + feedback,
      'inverse IoC=' + ioc(inverse).toFixed(12),
      'first40=' + inverse.slice(0, 40).map((r) => corpus.translit[r]).join('.'),
      'reencryption=exact',
      'native-plant=exact'
    );
  }
}
console.log('PASS: source-fixed nonlinear one-back inverse is reversible but yields no native-GP plaintext');
