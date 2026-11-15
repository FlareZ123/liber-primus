'use strict';

/**
 * Signed 2013 DH values select the affine 28-cycle T(x)=8-2(x-8) mod29.
 * This SFT tests whether the original p50 grid's 256 byte digits act as
 * consecutive T-exponents, on original ciphertext, with native p57 plants.
 * Windows Node.js 22, CommonJS, no dependencies or writes.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} rel */
function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}
const corpus = load('resources/liber-primus/lp2-corpus.json');
const table = load('resources/liber-primus/base60-grid.json');
const bytes = table.byte_rows.flat();
const unknown = corpus.pages.slice(0, 56);
const solved = corpus.pages[57].indices;
const field = 29;
const order = 28;

/** @param {number} x */
const mod = (x) => ((x % field) + field) % field;
const orbit = [1];
for (let i = 1; i < order; i++) orbit[i] = mod(orbit[i - 1] * -2);
assert.equal(new Set(orbit).size, order);
assert.equal(mod(orbit.at(-1) * -2), 1);
assert.equal(mod(8 - 2 * (8 - 8)), 8);
assert.equal(mod(8 - 2 * (0 - 8)), 24);

/**
 * T^exponent acting on the GP rune indexed 0..28.
 * @param {number} symbol
 * @param {number} exponent
 */
function power(symbol, exponent) {
  const factor = orbit[((exponent % order) + order) % order];
  return mod(8 + factor * (symbol - 8));
}

/**
 * @param {number[][]} pageArrays
 * @param {'book'|'page'} reset
 * @param {1|-1} sign
 * @returns {number[][]}
 */
function transform(pageArrays, reset, sign) {
  let clock = 0;
  return pageArrays.map((page) => {
    if (reset === 'page') clock = 0;
    return page.map((symbol) => {
      const key = bytes[clock++ % bytes.length] % order;
      return power(symbol, sign * key);
    });
  });
}

/** @param {number[]} source */
function ioc(source) {
  const freq = Array(field).fill(0);
  for (const x of source) freq[x]++;
  return freq.reduce((acc, n) => acc + n * (n - 1), 0) / (source.length * (source.length - 1));
}

/** @param {number[]} source */
function gp(source) {
  return source.map((x) => corpus.translit[x]).join(' ');
}

assert.equal(bytes.length, 256);
assert.equal(unknown.length, 56);
assert.equal(unknown.flatMap((p) => p.indices).length, 12956);
assert.equal(solved.length, 95);
assert.equal(unknown[50].indices.length, 0);
assert.equal(unknown.at(-1).indices.length, 76);

const pages = unknown.map((p) => p.indices);
const outcomes = [];
const expected = [
  ['book', -1, 0.03452735971013253],
  ['book', 1, 0.03447936304082493],
  ['page', -1, 0.0344550072334603],
  ['page', 1, 0.034469461046734914],
];
for (const [reset, sign, expectedIoc] of expected) {
  const plainPages = transform(pages, reset, sign);
  const flat = plainPages.flat();
  assert.equal(flat.length, 12956);
  assert.ok(Math.abs(ioc(flat) - expectedIoc) < 1e-12);
  assert.ok(ioc(flat) < 0.04);
  assert.deepEqual(transform(plainPages, reset, -sign), pages);

  // Encrypt original solved p57 runes as a source-native plant, matched to
  // all 55 nonempty original page lengths and with the original empty page.
  let offset = 0;
  const plantPages = pages.map((page) => page.map(() => solved[(offset++) % solved.length]));
  const encrypted = transform(plantPages, reset, -sign);
  const decoded = transform(encrypted, reset, sign);
  assert.deepEqual(decoded, plantPages);
  assert.equal(decoded.flat().length, 12956);

  outcomes.push({
    reset,
    decryptSign: sign,
    originalPlaintextIoC: ioc(flat),
    first40Translits: gp(flat.slice(0, 40)),
    sourcePlantRecovered: decoded.flat().length,
  });
}
console.log(JSON.stringify({
  source: {
    originalReread: 'LP2 pp0-55 12956 runes',
    tableLength: bytes.length,
    signed2013Values: { serverPublic: 8, sharedSecret: 2 },
    affineFixedPoint: 8,
    multiplicativeOrder: order,
    originalCiphertextIoC: ioc(pages.flat()),
    nativeP57IoC: ioc(solved),
  },
  outcomes,
}, null, 2));
