'use strict';

/**
 * Source-locked GF(29^238) modular-multiplication inverse on LP2 p36.
 *
 * The 256 printed table bytes factor as 28 * H16 * Q238 mod 29.
 * H16 is the product of all low-degree monic factors and Q238 is the
 * irreducible degree-238 factor. P36 has 238 original ciphertext runes.
 *
 * Test ciphertext C = H16 * plaintext (mod Q238), its inverse convention,
 * and both coefficient orientations. No fitted keys or phase searches.
 *
 * Run from the repository root:
 *   node sims/p36_grid_h16_field238_modmul_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} location */
const read = (location) => fs.readFileSync(path.join(root, location), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');

/** @param {number} n */
const fp = (n) => ((n % 29) + 29) % 29;
/** @param {number} x */
function reciprocal(x) {
  for (let k = 1; k < 29; k++) if (fp(x * k) === 1) return k;
  throw new Error('GF29 element has no inverse');
}
/** @param {number[]} a */
function trim(a) {
  const out = a.map(fp);
  while (out.length > 1 && out[out.length - 1] === 0) out.pop();
  return out;
}
/** @param {number[]} a @param {number[]} b @param {number} [factor] */
function add(a, b, factor = 1) {
  return trim(Array.from({length: Math.max(a.length, b.length)},
    (_, i) => fp((a[i] || 0) + factor * (b[i] || 0))));
}
/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = fp(out[i + j] + a[i] * b[j]);
    }
  }
  return trim(out);
}
/** @param {number[]} a @param {number[]} b */
function divide(a, b) {
  let rest = trim(a);
  const den = trim(b);
  const quotient = Array(Math.max(1, rest.length - den.length + 1)).fill(0);
  const leadingInverse = reciprocal(den[den.length - 1]);
  while (rest.length >= den.length && !(rest.length === 1 && rest[0] === 0)) {
    const offset = rest.length - den.length;
    const coefficient = fp(rest[rest.length - 1] * leadingInverse);
    quotient[offset] = coefficient;
    for (let j = 0; j < den.length; j++) {
      rest[offset + j] = fp(rest[offset + j] - coefficient * den[j]);
    }
    rest = trim(rest);
  }
  return { quotient: trim(quotient), remainder: rest };
}
/** @param {number[]} a @param {number[]} modulus */
function reduce(a, modulus) {
  return divide(a, modulus).remainder;
}
/** @param {number[]} a @param {number[]} modulus */
function modularInverse(a, modulus) {
  let [r0, r1] = [modulus, trim(a)];
  let [t0, t1] = [[0], [1]];
  while (!(r1.length === 1 && r1[0] === 0)) {
    const { quotient, remainder } = divide(r0, r1);
    [r0, r1] = [r1, remainder];
    [t0, t1] = [t1, add(t0, multiply(quotient, t1), -1)];
  }
  assert.equal(r0.length, 1, 'H16 must be invertible modulo Q238');
  return reduce(t0.map((x) => fp(x * reciprocal(r0[0]))), modulus);
}
/** @param {number[]} a @param {number} length */
function pad(a, length) {
  return Array.from({length}, (_, i) => a[i] || 0);
}
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}

/** @param {string} sourceText */
function tokenize(sourceText) {
  const alphabet = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const result = [];
  for (const word of sourceText.replace(/^#.*$/gm, ' ').toUpperCase().match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      const match = alphabet.find((part) => word.startsWith(part.s, at));
      if (match) {
        result.push(match.i);
        at += match.s.length;
      } else {
        at++;
      }
    }
  }
  return result;
}

assert.equal(grid.bytes.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const lowFactors = [
  [5, 1], [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
];
const H16 = lowFactors.reduce(multiply, [1]);
const tablePolynomial = grid.bytes.map(fp).reverse().slice(0, 255);
const factored = divide(tablePolynomial, H16);
assert.deepEqual(factored.remainder, [0]);
const Q238 = factored.quotient.map((x) => fp(28 * x));
assert.equal(H16.length, 17);
assert.equal(Q238.length, 239);
assert.equal(Q238[238], 1);
assert.deepEqual(multiply(H16, Q238).map((x) => fp(28 * x)), tablePolynomial);
const inverseH16 = modularInverse(H16, Q238);
assert.deepEqual(reduce(multiply(H16, inverseH16), Q238), [1]);

const p36 = corpus.pages.find((page) => page.page === 36).indices;
assert.equal(p36.length, 238);
const knownPlain = tokenize(lp1);
assert.equal(knownPlain.length, 3504);
let nativeMin = Infinity;
let nativeMax = 0;
for (let i = 0; i + 238 <= knownPlain.length; i++) {
  const x = ioc(knownPlain.slice(i, i + 238));
  nativeMin = Math.min(nativeMin, x);
  nativeMax = Math.max(nativeMax, x);
}
const plantedPlaintext = knownPlain.slice(0, 238);
const variants = [];
for (const highToLow of [true, false]) {
  const cipher = highToLow ? p36.slice().reverse() : p36.slice();
  for (const decoding of ['H16-inverse', 'H16-forward']) {
    const decryptKey = decoding === 'H16-inverse' ? inverseH16 : H16;
    const encryptKey = decoding === 'H16-inverse' ? H16 : inverseH16;
    const decoded = pad(reduce(multiply(cipher, decryptKey), Q238), 238);
    const roundtrip = pad(reduce(multiply(decoded, encryptKey), Q238), 238);
    assert.deepEqual(roundtrip, cipher);
    const encryptedPlant = reduce(multiply(plantedPlaintext, encryptKey), Q238);
    const restoredPlant = pad(reduce(multiply(encryptedPlant, decryptKey), Q238), 238);
    assert.deepEqual(restoredPlant, plantedPlaintext);
    const physical = highToLow ? decoded.slice().reverse() : decoded;
    variants.push({
      coefficientOrder: highToLow ? 'source-high-to-low' : 'source-low-to-high',
      decoding, ioc: ioc(physical),
      prefix: physical.slice(0, 28).map((i) => corpus.translit[i]).join(' '),
      nativePlantRecovered: restoredPlant.length,
      reencryptionMatches: roundtrip.length,
    });
  }
}
assert(variants.every((x) => x.ioc < nativeMin));
console.log(JSON.stringify({
  source: 'original LP2 pp49-51 grid and physical p36',
  originalRuneCount: corpus.pages.filter((p) => p.page <= 55)
    .reduce((sum, p) => sum + p.indices.length, 0),
  page36Runes: p36.length,
  H16Degree: H16.length - 1,
  Q238Degree: Q238.length - 1,
  rawP36IoC: ioc(p36),
  nativeGPReferenceLength: knownPlain.length,
  nativeWindowCount: knownPlain.length - 237,
  nativeWindowMinIoC: nativeMin,
  nativeWindowMaxIoC: nativeMax,
  variants,
  conclusion: 'Four exact reversible native-GP decoders are negative; no unknown plaintext.',
}, null, 2));
