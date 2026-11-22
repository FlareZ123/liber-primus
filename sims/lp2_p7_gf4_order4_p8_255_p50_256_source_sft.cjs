'use strict';

/**
 * Frozen source-specific GP29 decipherment of p8–p14 from a p7 GF(4) clock.
 *
 * p7 final red GP29 word-index products [11,26,8,15,2] -> GF4
 * four-tap coefficients [3,2,0,3] plus initial scalar 2;
 * p8 first red word product=4, second=3, full original length=255;
 * p50 original 32x8 base60 numeric table -> 256 bytes.
 *
 * Standard GF4[x]/(x²+x+1), digit-order 4-base state integer 1..255.
 * Conditional 255-position keystream readouts: state, table byte,
 * nth prime totient and integer totient; additive signs +/- and
 * literal-first-red or source-defined first-black initialization.
 *
 * These are stated decoding hypotheses, not authenticated Cicada ops.
 * Node22 CJS, no third-party libraries, no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {any} */
function json(name) {
  return JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
}
const corpus = json('lp2-corpus.json');
const grid = json('lp2-grid-256.json');
const { pages, prime, translit } = corpus;
/** @param {number} x @param {number} modulus @returns {number} */
const mod = (x, modulus = 29) => ((x % modulus) + modulus) % modulus;
/** @param {number[]} word @returns {number} */
const product29 = word => word.reduce((a, v) => mod(a * v), 1);

/**
 * Multiply polynomials mod x^2+x+1 over F2, using integer encodings
 * 0,1,alpha,alpha+1. Integer 3 is the nonzero generator alpha+1.
 * @param {number} a @param {number} b @returns {number}
 */
function gf4mul(a, b) {
  let out = 0;
  for (let i = 0; i < 2; i++) {
    if ((b >>> i) & 1) out ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return out;
}
/**
 * @param {number[]} taps - four GF4 coefficients.
 * @param {number[]} seed - four GF4 values.
 * @returns {number[][]}
 */
function orbit(taps, seed) {
  let current = [...seed];
  const result = [];
  do {
    result.push([...current]);
    let feedback = 0;
    for (let i = 0; i < 4; i++) feedback ^= gf4mul(current[i], taps[i]);
    current = [...current.slice(1), feedback];
    assert(result.length <= 256, 'GF4 recurrence exceeded entire state space');
  } while (!current.every((v, i) => v === seed[i]));
  return result;
}
/** @param {number[]} state @returns {number} */
const base4 = state => 64 * state[0] + 16 * state[1] + 4 * state[2] + state[3];
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const bins = new Array(29).fill(0);
  for (const x of seq) bins[x]++;
  return bins.reduce((a, x) => a + x * (x - 1), 0) / (seq.length * (seq.length - 1));
}
/** @param {number} limit @returns {number[]} */
function firstPrimes(limit) {
  const out = [];
  for (let n = 2; out.length < limit; n++) {
    if (out.every(p => p * p > n || n % p !== 0)) out.push(n);
  }
  return out;
}
/** @param {number} n @returns {number} */
function totient(n) {
  let remaining = n, answer = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      answer = (answer / p) * (p - 1);
    }
  }
  if (remaining > 1) answer = (answer / remaining) * (remaining - 1);
  return answer;
}
/**
 * @param {number[]} values @param {number[]} key @param {number} sign
 * @returns {number[]}
 */
function shift(values, key, sign) {
  return values.map((v, i) => mod(v + sign * key[i % 255]));
}

assert.equal(pages[7].page, 7);
assert.equal(pages[8].page, 8);
assert.equal(pages[8].indices.length, 255);
const sourceWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(pages[7].indices.slice(194), sourceWords.flat());
const products = sourceWords.map(product29);
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const redP8 = pages[8].indices.slice(0, 12);
assert.deepEqual(redP8, [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
assert.deepEqual([product29(redP8.slice(0, 4)), product29(redP8.slice(4))], [4, 3]);
const taps = products.slice(0, 4).map(x => x % 4);
const seed = [products[4] % 4, 0, 0, 0];
assert.deepEqual(taps, [3, 2, 0, 3]);
assert.deepEqual(seed, [2, 0, 0, 0]);
const allOmissions = products.map((_, drop) =>
  orbit(products.filter((__, i) => i !== drop).map(v => v % 4), [1, 0, 0, 0]).length
);
assert.deepEqual(allOmissions, [21, 255, 255, 9, 255],
  'primitive recurrence is not a unique choice of omitted p7 product');
const states = orbit(taps, seed);
assert.equal(states.length, 255);
const addresses = states.map(base4);
assert.equal(new Set(addresses).size, 255);
assert(addresses.every(v => v >= 1 && v <= 255));
assert.deepEqual(addresses.slice(0, 8), [128, 1, 7, 30, 123, 236, 177, 199]);
assert.equal(grid.bytes.length, 256);
assert(grid.bytes.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
assert.equal(prime.length, 29);

const primes = firstPrimes(255);
assert.equal(primes[0], 2);
assert.equal(primes.length, 255);
const keyFamilies = {
  'state-index': addresses.map(x => x % 29),
  'p50-byte': addresses.map(x => grid.bytes[x] % 29),
  'prime-totient': addresses.map(x => (primes[x - 1] - 1) % 29),
  'ordinal-totient': addresses.map(x => totient(x) % 29)
};
const cipherAll = pages.slice(8, 15).flatMap(p => p.indices);
const cipherBlack = pages[8].indices.slice(12).concat(pages.slice(9, 15).flatMap(p => p.indices));
assert.equal(cipherAll.length, 1729);
assert.equal(cipherBlack.length, 1717);
const knownGP = pages[57].indices;
assert.equal(knownGP.length, 95);
const cases = [];
for (const [keyName, key] of Object.entries(keyFamilies)) {
  assert.equal(key.length, 255);
  for (const [startName, cipher] of Object.entries({
    'first-red': cipherAll, 'first-black': cipherBlack
  })) {
    for (const sign of [-1, +1]) {
      const clear = shift(cipher, key, sign);
      assert.deepEqual(shift(clear, key, -sign), cipher);
      const planted = Array.from({ length: cipher.length }, (_, i) => knownGP[i % knownGP.length]);
      const encryptedPlant = shift(planted, key, -sign);
      assert.deepEqual(shift(encryptedPlant, key, sign), planted);
      const firstChapterCount = startName === 'first-red' ? 255 : 243;
      const record = {
        keyName, startName, sign, allIoC: ioc(clear),
        p8IoC: ioc(clear.slice(0, firstChapterCount)),
        p9to14IoC: ioc(clear.slice(firstChapterCount)),
        sample: clear.slice(0, 42).map(x => translit[x]).join('')
      };
      cases.push(record);
    }
  }
}
cases.sort((a, b) => b.allIoC - a.allIoC);
assert.equal(cases.length, 16);
assert(cases[0].allIoC < 0.04, 'candidate requires genuine plaintext investigation');
console.log(JSON.stringify({
  original: {
    p7Products: products, p8HeaderProducts: [4, 3],
    tappedGF4: taps, seed, allFiveOmittedPeriods: allOmissions,
    orbitLength: states.length, distinctNonzeroStates: new Set(addresses).size,
    p8Full: 255, p50Bytes: 256, p8ThroughP14: cipherAll.length,
    p8BlackThroughP14: cipherBlack.length,
    rawFullIoC: ioc(cipherAll), rawBlackIoC: ioc(cipherBlack)
  },
  decision: {
    originalCases: cases.length,
    exactOriginalReencryption: '16/16',
    independentNativeGPPlantRecovery: '16/16',
    maxGP29IoC: cases[0].allIoC,
    best: cases[0], worst: cases[cases.length - 1],
    noAuthenticatedOriginalPlaintext: true,
    noCreatorSelectedReceiver: true
  }
}, null, 2));
