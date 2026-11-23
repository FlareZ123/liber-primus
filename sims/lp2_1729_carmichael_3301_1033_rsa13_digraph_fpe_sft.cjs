'use strict';

/**
 * Original-source finite 1729 RSA-like digraph format-preserving inverse.
 * Source operands: p8-p14 1729 runes; original repeated 3301/1033 cuneiform;
 * independently seen 13-dot mark; GP29 is a 29-symbol digit alphabet.
 * This is a no-key proof/rejection test and does not authenticate that Cicada
 * selected RSA here. Run on Windows11 / Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const modulus = 1729;
const alphabet = 29;
const domain = alphabet * alphabet;
const publicExponent = 3301;
const equivalentExponent = 1033;
const privateExponent = 13;
assert.equal(modulus, 7 * 13 * 19);
assert.equal((publicExponent - equivalentExponent) % 36, 0);
assert.equal((publicExponent * privateExponent) % 36, 1);
assert.equal((privateExponent ** 3) % 36, 1);
assert.deepEqual(gp.pages.filter(p => p.page >= 8 && p.page <= 14)
  .map(p => p.runic_count), [255, 268, 263, 273, 261, 272, 137]);

/**
 * @param {number} value
 * @param {number} exponent
 * @returns {number}
 */
function modularPower(value, exponent) {
  let result = 1;
  for (let x = value % modulus, e = exponent;
    e > 0; e = Math.floor(e / 2), x = x * x % modulus) {
    if (e % 2) result = result * x % modulus;
  }
  return result;
}

/**
 * @param {number} value
 * @param {number} exponent
 * @returns {{value:number,iterations:number}}
 */
function cycleWalk(value, exponent) {
  assert.ok(Number.isInteger(value) && value >= 0 && value < domain);
  let result = value;
  for (let iterations = 1; iterations <= 3; iterations++) {
    result = modularPower(result, exponent);
    if (result < domain) return { value: result, iterations };
  }
  throw Error('source modulus/exponent must permute the pair-digit domain');
}

for (let n = 0; n < modulus; n++) {
  assert.equal(modularPower(n, publicExponent),
    modularPower(n, equivalentExponent));
  assert.equal(modularPower(modularPower(n, privateExponent),
    publicExponent), n);
  assert.equal(modularPower(modularPower(modularPower(n, privateExponent),
    privateExponent), privateExponent), n);
}
const inverse = Array.from({ length: domain },
  (_, value) => cycleWalk(value, privateExponent));
const forward = Array.from({ length: domain },
  (_, value) => cycleWalk(value, publicExponent));
assert.equal(new Set(inverse.map(x => x.value)).size, domain);
assert.equal(new Set(forward.map(x => x.value)).size, domain);
const passes = [0, 0, 0, 0];
for (let n = 0; n < domain; n++) {
  passes[inverse[n].iterations]++;
  assert.equal(forward[inverse[n].value].value, n);
}
assert.deepEqual(passes, [0, 563, 130, 148]);

/**
 * Pair adjacent original GP29 runes, preserving the final singleton if odd.
 * This is the single fixed big-endian source-digit convention.
 * @param {number[]} source
 * @param {number[]} lookup
 * @returns {number[]}
 */
function transform(source, lookup) {
  const out = source.slice();
  for (let i = 0; i + 1 < source.length; i += 2) {
    const index = alphabet * source[i] + source[i + 1];
    const word = lookup[index].value;
    out[i] = Math.floor(word / alphabet);
    out[i + 1] = word % alphabet;
  }
  return out;
}

/** @param {number[]} v @returns {number} */
function coincidence(v) {
  const frequencies = Array(alphabet).fill(0);
  for (const x of v) frequencies[x]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0)
    / (v.length * (v.length - 1));
}

const solved = gp.pages.find(p => p.page === 57).indices;
const chapters = [[0, 2], [8, 14], [16, 21], [22, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const results = [];
for (const [first, last] of chapters) {
  const ciphertext = gp.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
  const decrypted = transform(ciphertext, inverse);
  assert.deepEqual(transform(decrypted, forward), ciphertext);
  const native = Array.from({ length: ciphertext.length },
    (_, i) => solved[i % solved.length]);
  const encryptedPlant = transform(native, forward);
  assert.deepEqual(transform(encryptedPlant, inverse), native);
  results.push({ originalPages: [first, last],
    runes: ciphertext.length,
    originalIoc: coincidence(ciphertext),
    invertedIoc: coincidence(decrypted),
    nativePositiveIoc: coincidence(native),
    encryptedNativeIoc: coincidence(encryptedPlant),
    nativePositiveExactlyRecovered: native.length,
    decodedPrefix: decrypted.slice(0, 20).map(i => gp.translit[i]).join(' ')
  });
}
assert.ok(results.every(r => r.invertedIoc < 0.05));
console.log(JSON.stringify({
  originalSourceNumbers: [3301, 1033, 1729, 13],
  exponentMod36: 25,
  inverseExponentMod36: 13,
  fullModulusCubeLaw: true,
  pairDigits: 29 * 29,
  cycleWalkPasses: passes,
  all841PairMappingsInvertible: true,
  results
}, null, 2));
console.log('PASS: source-typed RSA13/3301 digraph cyclewalk original and native GP29 positives.');
