'use strict';

/**
 * Source-original LP2 pages49–51 final cells as a three-pointer middle-page selector.
 * Entirely deterministic. Read-only Windows Node.js22 single-file test.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'),
  'utf8'
));
const corpus = JSON.parse(readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const pageLengths = grid.pages.map((page) => page.tokens.length);
assert.deepEqual(pageLengths, [80, 104, 72]);
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const values = tokens.map((token) => {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  const value = high * 60 + low;
  assert.ok(value < 256);
  return value;
});

const lastIndices = [pageLengths[0] - 1, pageLengths[0] + pageLengths[1] - 1, 255];
assert.deepEqual(lastIndices, [79, 183, 255]);
const endTokens = lastIndices.map((index) => tokens[index]);
const endValues = lastIndices.map((index) => values[index]);
assert.deepEqual(endTokens, ['1M', '1L', '1K']);
assert.deepEqual(endValues, [82, 81, 80]);
assert.deepEqual(endValues, [80 + 2, 80 + 1, 80]);
assert.deepEqual(endValues.map((address) => tokens[address]), ['3L', '0w', '2M']);
assert.deepEqual(endValues.map((address) => values[address]), [201, 58, 142]);
console.log('SOURCE: three physical page-end tokens:', endTokens.join(' '));
console.log('SOURCE: radix60 end values:', endValues.join(' '));
console.log('SOURCE: target addresses:', endValues.join(' '));
console.log('SOURCE: target middle-page tokens:', endValues.map((x) => tokens[x]).join(' '));

/** @type {number[]} */
const counts = Array(256).fill(0);
for (const number of values) counts[number]++;
let descending = 0;
for (let number = 2; number < 256; number++) {
  descending += counts[number] * counts[number - 1] * counts[number - 2];
}
const denominator = 256 * 255 * 254;
assert.equal(descending, 266);
assert.equal(counts[82] * counts[81] * counts[80], 16);
console.log('CONDITIONAL SHUFFLE: any descending consecutive end triplet',
  descending + '/' + denominator, '=', descending / denominator);
console.log('CONDITIONAL SHUFFLE: exactly source middle-page reverse addresses',
  '16/' + denominator, '=', 16 / denominator);
console.log('CAVEAT: both conditions were noticed after looking at the source. They are not authorship p-values.');

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const hist = Array(29).fill(0);
  for (const symbol of symbols) hist[symbol]++;
  const matching = hist.reduce((sum, frequency) => sum + frequency * (frequency - 1), 0);
  return matching / (symbols.length * (symbols.length - 1));
}
const page51 = corpus.pages[51].indices;
assert.equal(page51.length, 92);
const candidateKey = endValues.map((address) => values[address] % 29);
assert.deepEqual(candidateKey, [27, 0, 26]);
for (const sign of [-1, 1]) {
  const plaintext = page51.map((c, index) => (c + sign * candidateKey[index % 3] + 58) % 29);
  const recipher = plaintext.map((p, index) => (p - sign * candidateKey[index % 3] + 58) % 29);
  assert.deepEqual(recipher, page51);
  const first40 = plaintext.slice(0, 40).map((x) => corpus.translit[x]).join(' ');
  console.log('CANDIDATE DIRECT p51 GP29 sign=' + sign +
    ' IoC=' + ioc(plaintext).toFixed(12) + ' first40=' + first40);
}
console.log('PASS: page-end pattern, midpoint reverse pointers, exact conditional multiset counts, and p51 direct-reader negatives.');
