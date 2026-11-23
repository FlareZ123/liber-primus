'use strict';

/**
 * Exact source-visible XIX/7-page original receiver for Carmichael 1729.
 * Test a frozen modular exponent-19 involution and one GP29 additive
 * cipher-value receiver; no guessing or fitted plaintext words.
 * Reproduce with Node.js 22 on Windows 11.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = gp.pages.filter(p => p.page >= 8 && p.page <= 14);
assert.deepEqual(source.map(p => p.runic_count),
  [255, 268, 263, 273, 261, 272, 137]);
const cipher = source.flatMap(p => p.indices);
assert.equal(cipher.length, 1729);
assert.deepEqual(source[0].indices.slice(0, 4), [14, 10, 14, 19]);
assert.equal(source[0].indices.slice(0, 4).map(i => gp.translit[i]).join(''),
  'XIXM');
const pageText = read('resources/liber-primus/lp2-transcription.txt')
  .split(/\n%\n/);
assert.ok(pageText[10].includes('-7-'), 'literal source numeral 7 in p10');
assert.equal(pageText.slice(0, 56)
  .reduce((n, section) => n + (section.match(/-7-/g) || []).length, 0), 1);

const mod29 = value => ((value % 29) + 29) % 29;

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function modularPower(base, exponent, modulus) {
  let result = 1;
  for (let e = exponent, b = base % modulus; e; e = Math.floor(e / 2)) {
    if (e % 2) result = result * b % modulus;
    b = b * b % modulus;
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  values.forEach(x => { hist[x]++; });
  return hist.reduce((acc, v) => acc + v * (v - 1), 0)
    / (values.length * (values.length - 1));
}

const N = 1729;
assert.equal((7 - 1) * (13 - 1) * (19 - 1), 1296);
assert.equal(1728 % 36, 0);
assert.equal((19 * 19) % 36, 1);
const map = Array.from({ length: N },
  (_, i) => modularPower(i, 19, N));
assert.equal(new Set(map).size, N);
assert.ok(map.every((x, i) => map[x] === i));
const fixedPoints = map.reduce((n, value, i) => n + Number(value === i), 0);
assert.equal(fixedPoints, 931);
assert.equal((N - fixedPoints) / 2, 399);

const genuineNative = Array.from({ length: N },
  (_, i) => gp.pages[57].indices[i % gp.pages[57].indices.length]);

/**
 * @param {number[]} sourceCipher
 * @param {number} origin
 * @param {number} sign
 * @param {boolean} permutation
 * @returns {number[]}
 */
function decrypt(sourceCipher, origin, sign, permutation) {
  return Array.from({ length: N }, (_, i) =>
    mod29(sourceCipher[permutation ? map[i] : i]
      + sign * (modularPower(i + origin, 19, N) % 29)));
}

/**
 * @param {number[]} plain
 * @param {number} origin
 * @param {number} sign
 * @param {boolean} permutation
 * @returns {number[]}
 */
function encrypt(plain, origin, sign, permutation) {
  const out = Array(N).fill(0);
  for (let i = 0; i < N; i++) {
    out[permutation ? map[i] : i] = mod29(plain[i]
      - sign * (modularPower(i + origin, 19, N) % 29));
  }
  return out;
}

const results = [];
for (const origin of [0, 1]) {
  for (const sign of [-1, 1]) {
    for (const permutation of [false, true]) {
      const plain = decrypt(cipher, origin, sign, permutation);
      assert.deepEqual(encrypt(plain, origin, sign, permutation), cipher);
      assert.deepEqual(decrypt(encrypt(genuineNative, origin, sign, permutation),
        origin, sign, permutation), genuineNative);
      const coincidence = ioc(plain);
      assert.ok(coincidence < 0.05);
      results.push({ origin, sign, permutation,
        originalIoc: coincidence,
        originalFirst24: plain.slice(0, 24).map(i => gp.translit[i]).join(' '),
        trueNativeRecovered: N });
    }
  }
}
console.log(JSON.stringify({
  source: 'p8..p14, XIX substring in p8 first red word, standalone p10 numeral7',
  chapterRunes: N, modulusFactors: [7, 13, 19],
  carmichaelLambda: 36, exponent: 19,
  involution: true, fixedPoints, transpositions: 399,
  rawOriginalIoc: ioc(cipher),
  results
}, null, 2));
console.log('PASS: full original Carmichael-1729 XIX original/rune GP29 positive.');
