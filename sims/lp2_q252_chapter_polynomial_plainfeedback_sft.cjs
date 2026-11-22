'use strict';

/**
 * Source-fixed Q252 polynomial plaintext-feedback inverse, LP2 pp0–55.
 * Run with Node.js 22 from any working directory.
 * The only input files are immutable repository resources.
 * No filesystem writes, external dependencies, or guesses of secret keys.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const table = readJSON('resources/liber-primus/base60-grid.json');
const bytes = table.byte_rows.flat();
const digest = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(digest, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(bytes.length, 256);

const mod = (n) => ((n % 29) + 29) % 29;
const original = bytes.map((b) => b % 29);
const remainder = original.slice();
const factorDescending = [12, 17, 11, 21, 23]; // source H*G, monic-normalization not needed
const quotient = [];

for (let i = 0; i < 252; i++) {
  const q = mod(remainder[i] * 17); // 12 * 17 = 1 mod 29
  quotient.push(q);
  for (let j = 0; j < 5; j++) {
    remainder[i + j] = mod(remainder[i + j] - q * factorDescending[j]);
  }
}
assert.deepEqual(remainder.slice(252), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 16), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21]);

const ranges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const chapters = ranges.map(([start, end], i) => {
  const chars = corpus.pages
    .filter((p) => p.page >= start && p.page <= end)
    .flatMap((p) => p.indices);
  assert.equal(chars.length, lengths[i]);
  assert(chars.every((n) => Number.isInteger(n) && n >= 0 && n < 29));
  return chars;
});
assert.equal(chapters.flat().length, 12956);
const native = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(native.length, 95);

const ioc = (values) => {
  const count = Array(29).fill(0);
  for (const n of values) count[n]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};

/** Horner-evaluate a degree-at-most-27 polynomial in GF(29). */
const evaluate = (coefficients, input) =>
  coefficients.reduce((acc, coefficient) => mod(acc * input + coefficient), 0);

/** Invert C[i] = P[i] - sign * f(P[i-1]) modulo 29. */
function decode(cipher, lut, sign, initialPlain) {
  const plain = [initialPlain];
  for (let i = 1; i < cipher.length; i++) {
    plain.push(mod(cipher[i] + sign * lut[plain[i - 1]]));
  }
  return plain;
}

function encode(plain, lut, sign) {
  const cipher = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    cipher.push(mod(plain[i] - sign * lut[plain[i - 1]]));
  }
  return cipher;
}

const runs = [];
for (const reversed of [false, true]) {
  for (const sign of [-1, +1]) {
    const rows = [];
    const decryptedBook = [];
    for (let chapter = 0; chapter < 9; chapter++) {
      const coeff = quotient.slice(28 * chapter, 28 * chapter + 28);
      if (reversed) coeff.reverse();
      const lut = Array.from({ length: 29 }, (_, x) => evaluate(coeff, x));
      const cipher = chapters[chapter];
      const fixed = decode(cipher, lut, sign, cipher[0]);
      decryptedBook.push(...fixed);
      let best = { ioc: -1, seed: -1 };
      for (let seed = 0; seed < 29; seed++) {
        const value = ioc(decode(cipher, lut, sign, seed));
        if (value > best.ioc) best = { ioc: value, seed };
      }
      // A source-authentic 95-rune plaintext plant, with its true known seed.
      const plantedCipher = encode(native, lut, sign);
      assert.deepEqual(decode(plantedCipher, lut, sign, native[0]), native);
      assert.deepEqual(encode(fixed, lut, sign), cipher);
      rows.push({
        chapter,
        length: cipher.length,
        fixed: +ioc(fixed).toFixed(9),
        highestOf29: +best.ioc.toFixed(9),
        seedOfHighest: best.seed
      });
    }
    runs.push({ reversed, sign, totalIoC: +ioc(decryptedBook).toFixed(9), rows });
  }
}

const highest = Math.max(...runs.flatMap((r) => r.rows.map((x) => x.highestOf29)));
assert(highest < 0.037, 'Unexpected native-language-scale concentration; investigate candidate');
console.log(JSON.stringify({
  originalGridSHA256: digest,
  originalRemainder: remainder.slice(252),
  sourceQuotientLength: quotient.length,
  originalRuneCount: chapters.flat().length,
  nativeSolvedP57IoC: +ioc(native).toFixed(9),
  highestChapterIoC: highest,
  variants: runs
}, null, 2));
