'use strict';

/**
 * Source-specific p7/p8 GF(3) original-cipher test.
 * Node.js 22, CommonJS, no third-party dependencies or file writes.
 *
 * This is a conditional hypothesis, not an authenticated Cicada cipher:
 * - p7 five red GP-index word products -> feedback taps;
 * - p8 two red GP-index word products [4,3] -> four-zero run, field GF(3);
 * - p7 measured dot-height ranks -> nonzero seed modulo 3;
 * - p8's 243 black runes -> ternary-state table;
 * - p9–p14 -> untouched 1,474-rune receiver.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const { pages, prime, translit } = source;
/** @param {number} value @param {number} modulus @returns {number} */
const mod = (value, modulus = 29) => ((value % modulus) + modulus) % modulus;
/** @param {number[]} values @returns {number} */
const product = values => values.reduce((a, b) => mod(a * b), 1);
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const n = values.length;
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}
/** @param {number[]} values @returns {string} */
const stateKey = values => values.join('');

const redP7 = pages[7].indices.slice(194);
const wordIndices = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(redP7, wordIndices.flat(), 'p7 source rune run changed');
const redP8 = pages[8].indices.slice(0, 12);
assert.deepEqual(redP8, [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17],
  'p8 source red heading changed');
const products = wordIndices.map(product);
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const headerProducts = [product(redP8.slice(0, 4)), product(redP8.slice(4))];
assert.deepEqual(headerProducts, [4, 3], 'original p8 4|8 red heading product mismatch');
const taps = products.map(x => mod(x, headerProducts[1]));
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

// The dot ranks were measured from the original JPEG (physical p7, image 24.jpg).
// See im-results/lp2-p7-fivedot-shamir-dual-dh-source-gate.md for coordinates.
const dotHeightRanks = [3, 5, 1, 4, 2];
const seed = dotHeightRanks.map(x => mod(x, headerProducts[1]));
assert.deepEqual(seed, [0, 2, 1, 1, 2]);
/** @param {number[]} old @returns {number[]} */
function next(old) {
  return [...old.slice(1), mod(old.reduce((a, v, i) => a + v * taps[i], 0), 3)];
}
const orbit = [];
let current = seed;
do {
  assert(orbit.length < 243, 'unexpected nonprimitive GF3 orbit');
  orbit.push(current);
  current = next(current);
} while (stateKey(current) !== stateKey(seed));
assert.equal(orbit.length, 242);
assert.equal(new Set(orbit.map(stateKey)).size, 242);
const trits = orbit.map(row => row[0]);
const zeroRuns = [];
for (let i = 0; i < 242; i++) {
  if ([0, 1, 2, 3].every(j => trits[(i + j) % 242] === 0)) zeroRuns.push(i);
}
assert.deepEqual(zeroRuns, [22, 143]);
const keyCells = pages[8].indices.slice(12);
assert.equal(keyCells.length, 243);
const original = pages.slice(9, 15).flatMap(page => page.indices);
assert.equal(original.length, 1474);

/** @param {number} run @returns {Map<string, number>} */
function makeTable(run) {
  // Insert one zero after a visible sequence of four zero trits.
  const at = (run + 4) % 242;
  const cyclic = trits.slice(0, at).concat([0], trits.slice(at));
  const table = new Map();
  for (let i = 0; i < 243; i++) {
    const address = Array.from({ length: 5 }, (_, j) => cyclic[(i + j) % 243]).join('');
    assert(!table.has(address), 'not a complete five-trit address cycle');
    table.set(address, keyCells[i]);
  }
  assert.equal(table.size, 243);
  assert(table.has('00000'));
  return table;
}
/**
 * @param {number[]} values
 * @param {Map<string, number>} table
 * @param {boolean} primeAddress
 * @param {boolean} plaintextFeedback
 * @param {number} sign
 * @param {boolean} encode
 * @returns {number[]}
 */
function transform(values, table, primeAddress, plaintextFeedback, sign, encode) {
  let prev = pages[8].indices.slice(-5);
  const result = [];
  for (const value of values) {
    const address = prev.map(x => mod(primeAddress ? prime[x] : x, 3)).join('');
    const tableValue = table.get(address);
    assert.notEqual(tableValue, undefined);
    const transformed = mod(value + (encode ? -sign : sign) * tableValue);
    const plain = encode ? value : transformed;
    const cipher = encode ? transformed : value;
    result.push(transformed);
    prev = [...prev.slice(1), plaintextFeedback ? plain : cipher];
  }
  return result;
}
const controlRunes = pages[57].indices;
assert.equal(controlRunes.length, 95);
const plant = Array.from({ length: original.length }, (_, i) => controlRunes[i % 95]);
const rows = [];
for (const splice of zeroRuns) {
  const table = makeTable(splice);
  for (const primeAddress of [false, true])
    for (const plaintextFeedback of [false, true])
      for (const sign of [-1, 1]) {
        const decoded = transform(original, table, primeAddress, plaintextFeedback, sign, false);
        const replay = transform(decoded, table, primeAddress, plaintextFeedback, sign, true);
        assert.deepEqual(replay, original, 'original source replay');
        const encryptedPlant = transform(plant, table, primeAddress, plaintextFeedback, sign, true);
        const clearPlant = transform(encryptedPlant, table, primeAddress, plaintextFeedback, sign, false);
        assert.deepEqual(clearPlant, plant, 'independent solved p57 plant failed');
        rows.push({
          splice, primeAddress, plaintextFeedback, sign,
          ioc: ioc(decoded),
          prefix: decoded.slice(0, 30).map(x => translit[x]).join('')
        });
      }
}
const table0 = makeTable(zeroRuns[0]);
const table1 = makeTable(zeroRuns[1]);
const changedTableValues = [...table0.keys()].filter(k => table0.get(k) !== table1.get(k)).length;
assert.equal(changedTableValues, 119);
assert.equal(rows.length, 16);
rows.sort((a, b) => b.ioc - a.ioc);
assert(rows[0].ioc < 0.04, 'a strong original candidate needs human analysis');
console.log(JSON.stringify({
  source: {
    p7RedProducts: products, p8RedWordProducts: headerProducts,
    p8RedWords: ['XIXM', 'UXMCTHPOB'],
    dotHeightRanks, seed, taps,
    period: orbit.length, zeroRuns,
    p8Black: keyCells.length, originalLength: original.length
  },
  result: {
    originalIoC: ioc(original), positivePlantIoC: ioc(plant),
    completeSplices: zeroRuns.length, changedTableValues,
    cases: rows.length, best: rows[0],
    worst: rows[rows.length - 1],
    everyOriginalReplay: true, everyNativePlantRecovered: true
  }
}, null, 2));
