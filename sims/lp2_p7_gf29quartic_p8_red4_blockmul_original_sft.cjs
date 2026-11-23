'use strict';

/**
 * Adjacent p7 red five GP29 word products form irreducible GF(29^4),
 * and p8 starts with exactly four red source runes as a field multiplier.
 * Test the source-selected fixed block transform on entire original p8-p14.
 * Compatible with Windows11 / Node.js22; read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const gp = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const p7 = gp.pages.find(p => p.page === 7).indices;
const section = gp.pages.filter(p => p.page >= 8 && p.page <= 14);
const source = section.flatMap(p => p.indices);
const seed = section[0].indices.slice(0, 4);
const words = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(194, 208), words.flat());
const polynomial = words.map(word =>
  word.reduce((acc, value) => acc * value % 29, 1));
assert.deepEqual(polynomial, [11, 26, 8, 15, 2]);
assert.deepEqual(seed, [14, 10, 14, 19]);
assert.equal(source.length, 1729);

/** @param {number} x @returns {number} */
function mod(x) { return ((x % 29) + 29) % 29; }

/**
 * @param {number[]} a four rune indices
 * @param {number[]} b four rune indices
 * @returns {number[]}
 */
function multiply(a, b) {
  const p = Array(7).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) p[i + j] += a[i] * b[j];
  }
  for (let k = 6; k >= 4; k--) {
    const factor = mod(p[k] * 15);
    for (let j = 0; j < 5; j++) p[k - 4 + j] -= factor * polynomial[j];
  }
  return p.slice(0, 4).map(mod);
}

/**
 * @param {number[]} fieldElement
 * @param {number} exponent
 * @returns {number[]}
 */
function power(fieldElement, exponent) {
  let result = [1, 0, 0, 0];
  let base = fieldElement;
  for (let n = exponent; n > 0; n = Math.floor(n / 2)) {
    if (n % 2) result = multiply(result, base);
    base = multiply(base, base);
  }
  return result;
}
const inverse = power(seed, 29 ** 4 - 2);
assert.deepEqual(inverse, [18, 18, 28, 23]);
assert.deepEqual(multiply(seed, inverse), [1, 0, 0, 0]);

/**
 * @param {number[]} runes
 * @param {number[]} sourceFactor
 * @param {number} start
 * @returns {number[]}
 */
function transform(runes, sourceFactor, start) {
  const out = runes.slice();
  for (let i = start; i + 3 < runes.length; i += 4) {
    const changed = multiply(runes.slice(i, i + 4), sourceFactor);
    for (let j = 0; j < 4; j++) out[i + j] = changed[j];
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const f = Array(29).fill(0);
  for (const value of values) f[value]++;
  return f.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

const knownP57 = gp.pages.find(p => p.page === 57).indices;
const native = Array.from({ length: source.length },
  (_, i) => knownP57[i % knownP57.length]);
const results = [];
for (const start of [0, 4, 12]) {
  for (const [label, key, other] of [
    ['inverse', inverse, seed], ['forward', seed, inverse]]) {
    const plaintext = transform(source, key, start);
    assert.deepEqual(transform(plaintext, other, start), source);
    const planted = transform(native, other, start);
    assert.deepEqual(transform(planted, key, start), native);
    results.push({
      startAtSourceRyne: start,
      operation: label,
      originalIoc: coincidence(source.slice(start)),
      resultIoc: coincidence(plaintext.slice(start)),
      authenticNativeIoc: coincidence(native.slice(start)),
      recoveredNativeRunes: source.length,
      outputFirst32: plaintext.slice(start, start + 32)
        .map(index => gp.translit[index]).join(' ')
    });
  }
}
assert.ok(results.every(r => r.resultIoc < 0.05));
console.log(JSON.stringify({
  sourcePolynomial: polynomial,
  originalFourRuneFieldMultiplier: seed,
  exactFieldInverse: inverse,
  fullOriginalRunes: source.length,
  tests: results
}, null, 2));
console.log('PASS: source p7 quartic plus p8 four-rune field block multiplier original/positive.');
