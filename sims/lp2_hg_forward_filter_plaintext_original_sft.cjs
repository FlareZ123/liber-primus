/**
 * Source-linked H/G forward-filter decoding on original LP2 GP29 runes.
 * Tests the opposite cipher direction to the previously completed causal
 * convolution inverse: plaintext P=K*C, with encryption C=K^{-1}*P.
 * No source-conditioned phases, changed letters or fitted secret keys.
 * Windows Node.js 22, one read-only runnable test file.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const H = [3, 26, 24];
const G = [27, 5, 15];
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];

/** @param {number} value @returns {number} */
const mod = value => ((value % 29) + 29) % 29;

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let factor = 1; factor < 29; factor++) {
    if (mod(value * factor) === 1) return factor;
  }
  throw new Error('GF29 nonunit');
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function product(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}

/** @param {number[]} polynomial @param {number[]} divisor @returns {number[]} */
function remainder(polynomial, divisor) {
  const result = polynomial.slice();
  const invLead = inverse(divisor[divisor.length - 1]);
  for (let i = result.length - divisor.length; i >= 0; i--) {
    const factor = mod(result[i + divisor.length - 1] * invLead);
    for (let j = 0; j < divisor.length; j++) result[i + j] = mod(result[i + j] - factor * divisor[j]);
  }
  return result.slice(0, divisor.length - 1);
}

/** @param {number[]} input @param {number[]} taps @returns {number[]} */
function filter(input, taps) {
  return input.map((_, i) => {
    let sum = 0;
    for (let j = 0; j < taps.length && j <= i; j++) sum += taps[j] * input[i - j];
    return mod(sum);
  });
}

/** @param {number[]} output @param {number[]} taps @returns {number[]} */
function undoFilter(output, taps) {
  const plain = [];
  const invLead = inverse(taps[0]);
  for (let i = 0; i < output.length; i++) {
    let remainder = output[i];
    for (let j = 1; j < taps.length && j <= i; j++) remainder -= taps[j] * plain[i - j];
    plain.push(mod(remainder * invLead));
  }
  return plain;
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, value) => sum + value * (value - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @returns {{e: number,o: number}} */
function commonLetters(symbols) {
  return {
    e: symbols.filter(value => value === 18).length,
    o: symbols.filter(value => value === 3).length,
  };
}

const K = { H, G, HG: product(H, G) };
assert.deepEqual(K.HG, [23, 21, 11, 17, 12]);
assert.deepEqual(remainder(grid.bytes.map(value => mod(value)).reverse(), K.HG), [0, 0, 0, 0]);
assert.deepEqual(remainder(grid.bytes.map(value => mod(value)), K.HG), [25, 8, 18, 24]);
assert.deepEqual(corpus.pages.find(page => page.page === 39).indices.slice(119, 122), G);

const pages = corpus.pages.filter(page => page.page <= 55 && page.runic_count > 0);
const original = pages.flatMap(page => page.indices);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);

let start = 0;
const chapters = chapterLengths.map(length => {
  const part = original.slice(start, start + length);
  assert.equal(part.length, length);
  start += length;
  return part;
});
assert.equal(start, original.length);

const clear = corpus.pages.find(page => page.page === 57).indices;
assert.equal(clear.length, 95);
for (const taps of Object.values(K)) {
  const plantedCipher = undoFilter(clear, taps);
  assert.deepEqual(filter(plantedCipher, taps), clear);
}
const falseDecoded = filter(undoFilter(clear, H), K.HG);
assert.ok(falseDecoded.some((value, i) => value !== clear[i]));

const outcome = {};
for (const [scope, parts] of Object.entries({
  continuous: [original],
  nineChapters: chapters,
  eachPhysicalPage: pages.map(page => page.indices),
})) {
  outcome[scope] = {};
  for (const [filterName, taps] of Object.entries(K)) {
    outcome[scope][filterName] = {};
    for (const direction of ['printed', 'reverse']) {
      const decoded = parts.flatMap(part => {
        const input = direction === 'reverse' ? part.slice().reverse() : part;
        const output = filter(input, taps);
        assert.deepEqual(undoFilter(output, taps), input);
        return direction === 'reverse' ? output.reverse() : output;
      });
      assert.equal(decoded.length, original.length);
      outcome[scope][filterName][direction] = {
        ioc: Number(coincidence(decoded).toFixed(12)),
        eo: commonLetters(decoded),
        initial32: decoded.slice(0, 32),
      };
    }
  }
}
console.log('HG_FORWARD_FILTER_ORIGINAL', JSON.stringify({
  classification: 'direct source-filter decoding, not an authenticated cipher instruction',
  originalLength: original.length, originalIoC: coincidence(original),
  solvedP57Length: clear.length, solvedP57IoC: coincidence(clear),
  keys: K, positivePlantRuneCount: clear.length,
  wrongKeyPlantMatches: falseDecoded.filter((value, i) => value === clear[i]).length,
  results: outcome,
}, null, 2));
