'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * A bounded 2014 Stage05 × Stage06 transfer at LP2 original global rune 9133.
 * There are no fitted keys, shifts, phases, permutations or target words.
 */
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const unknown = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(unknown.length, 12956);
assert.equal(corpus.pages.slice(0, 37).reduce((s, p) => s + p.indices.length, 0), 8944);
assert.equal(corpus.pages[37].indices.length, 228);

// The fourth originally printed numbered passage begins at p37 rune189,
// global rune9133, has length96 and thus contains 13 whole seven-rune blocks.
const candidate = unknown.slice(9133, 9229);
const testCipher = candidate.slice(0, 91);
assert.equal(candidate.length, 96);
assert.deepEqual(candidate.slice(0, 10), [21, 11, 15, 11, 19, 4, 19, 9, 17, 15]);

const historicalMaxim = 'TOBELIEVETRUTHISTODESTROYPOSSIBILITY';
const tokens = historicalMaxim.replaceAll('V', 'U').match(/TH|ING|IO|EO|OE|AE|EA|NG|IA|[A-Z]/g);
const key = tokens.map(token => corpus.translit.indexOf(token));
assert.equal(historicalMaxim.length, 36);
assert.equal(key.length, 35);
assert(key.every(v => v >= 0));

const perm = [0, 6, 2, 5, 1, 4, 3];
const inversePerm = [0, 4, 2, 6, 5, 3, 1];
const permutations = [perm, inversePerm];

/** @param {number[]} input @param {number[]} mapping @returns {number[]} */
function reorder(input, mapping) {
  assert.equal(input.length % 7, 0);
  const result = new Array(input.length);
  for (let i = 0; i < input.length; i += 7) {
    for (let j = 0; j < 7; j++) result[i + j] = input[i + mapping[j]];
  }
  return result;
}

/** @param {number[]} input @param {number} sign @returns {number[]} */
function keyed(input, sign) {
  return input.map((symbol, i) => (symbol + 29 + sign * key[i % key.length]) % 29);
}

/** @param {number[]} input @returns {number} */
function ioc(input) {
  const frequencies = Array(29).fill(0);
  for (const symbol of input) frequencies[symbol]++;
  return frequencies.reduce((s, v) => s + v * (v - 1), 0) / (input.length * (input.length - 1));
}

/**
 * @param {number[]} input
 * @param {number[]} mapping
 * @param {number} sign
 * @param {'permutation-first'|'key-first'} order
 * @returns {number[]}
 */
function decode(input, mapping, sign, order) {
  return order === 'permutation-first'
    ? keyed(reorder(input, mapping), sign)
    : reorder(keyed(input, sign), mapping);
}

/**
 * @param {number[]} input
 * @param {number[]} mapping
 * @param {number} sign
 * @param {'permutation-first'|'key-first'} order
 * @returns {number[]}
 */
function encode(input, mapping, sign, order) {
  const reverse = mapping === perm ? inversePerm : perm;
  return order === 'permutation-first'
    ? reorder(keyed(input, -sign), reverse)
    : keyed(reorder(input, reverse), -sign);
}

const nativePlant = corpus.pages[57].indices.slice(0, 91);
assert.equal(nativePlant.length, 91);
assert(Math.abs(ioc(nativePlant) - 0.06031746031746032) < 1e-12);
const summaries = [];
for (const mapping of permutations) {
  for (const sign of [-1, +1]) {
    for (const order of ['permutation-first', 'key-first']) {
      const output = decode(testCipher, mapping, sign, order);
      assert.deepEqual(encode(output, mapping, sign, order), testCipher);
      assert.deepEqual(decode(encode(nativePlant, mapping, sign, order), mapping, sign, order), nativePlant);
      const result = {
        mapping: mapping === perm ? 'source-inverse' : 'source-forward',
        sign, order, ioc: Number(ioc(output).toFixed(9)),
        opening: output.slice(0, 40).map(v => corpus.translit[v]).join('')
      };
      summaries.push(result);
      console.log(JSON.stringify(result));
    }
  }
}
assert.equal(summaries.length, 8);
assert(Math.max(...summaries.map(r => r.ioc)) < 0.038);
console.log(JSON.stringify({
  source: 'LP2 fourth red-numbered item: global runes [9133,9229)',
  testedWholeSevenBlocks: 91,
  untestedRemainder: 5,
  originalIoc91: ioc(testCipher),
  solvedNativeP57Ioc91: ioc(nativePlant),
  bestCompositeIoc: Math.max(...summaries.map(r => r.ioc)),
  verdict: 'No original-page prose or recovered key; conditional negative for the fixed historical composite.'
}));
