#!/usr/bin/env node
'use strict';

/**
 * Source-fixed p57 GP-word → printed 32×8 table address → unique outward
 * neighbor calibration. Run with Node.js 22:
 *   node sims/lp2_p57_find_must_address_null_sft.cjs
 *
 * Read-only. Shuffles preserve the original 256 two-character tokens and
 * the joint correlation of their base59/base60 readings.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');

const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(tokens[150], '2X');
assert.equal(tokens[151], '39');
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
const decode = alphabet => tokens.map(token => {
  const x = alphabet.indexOf(token[0]);
  const y = alphabet.indexOf(token[1]);
  assert.ok(x >= 0 && y >= 0);
  return x * alphabet.length + y;
});
const values59 = decode(alphabet59);
const values60 = decode(alphabet60);

const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p57 = transcription.split('%').at(-1).replace(/[\/\r\n§]/g, '');
const words = p57.split(/[-.]/).filter(Boolean).map(raw => {
  const indices = [...raw].map(rune => runeToIndex.get(rune));
  assert.ok(indices.every(Number.isInteger));
  return {
    text: indices.map(index => corpus.translit[index]).join(''),
    sum: indices.reduce((acc, index) => acc + corpus.prime[index], 0),
    length: indices.length
  };
});
assert.equal(words.length, 20);
const find = words.find(word => word.text === 'FIND');
const must = words.find(word => word.text === 'MUST');
assert.equal(find.sum, 151);
assert.equal(must.sum, 186);
assert.equal(values59[150], 151);
assert.equal(values59[151], 186);
assert.equal(values60[150], 153);
assert.equal(values60[151], 189);

// A point on a ring qualifies only if exactly one cardinal neighbor lies on
// the next shallower ring. This removes corners and possible chosen directions.
function ringDepth(index) {
  const row = Math.floor(index / 8);
  const column = index % 8;
  return Math.min(row, 31 - row, column, 7 - column);
}
const outward = Array.from({ length: 256 }, (_, index) => {
  const row = Math.floor(index / 8);
  const column = index % 8;
  const depth = ringDepth(index);
  if (depth === 0) return -1;
  const adjacent = [];
  if (row > 0) adjacent.push(index - 8);
  if (row < 31) adjacent.push(index + 8);
  if (column > 0) adjacent.push(index - 1);
  if (column < 7) adjacent.push(index + 1);
  const exits = adjacent.filter(cell => ringDepth(cell) === depth - 1);
  return exits.length === 1 ? exits[0] : -1;
});
assert.equal(outward[150], 151);
const eligible = words.filter(word =>
  word.sum >= 1 && word.sum <= 256 && outward[word.sum - 1] >= 0);
assert.equal(eligible.length, 9);

/**
 * @param {number[]} values Immutable original parsed radix values.
 * @param {{sum:number}[]} trialWords Ordered original or matched reference words.
 * @param {number[]|null} permutation Original-token index in each trial cell.
 * @returns {number} Count of distinct ordered word-occurrence transitions.
 */
function transitionCount(values, trialWords, permutation = null) {
  const frequency = new Uint8Array(256);
  for (const word of trialWords) {
    if (word.sum >= 0 && word.sum < 256) frequency[word.sum] += 1;
  }
  let count = 0;
  for (const word of trialWords) {
    const address = word.sum - 1;
    if (address < 0 || address >= 256 || outward[address] < 0) continue;
    const firstValue = values[permutation ? permutation[address] : address];
    if (firstValue !== word.sum) continue;
    const exit = outward[address];
    const secondValue = values[permutation ? permutation[exit] : exit];
    count += frequency[secondValue];
    if (secondValue === word.sum) count -= 1;
  }
  return count;
}
assert.equal(transitionCount(values59, words), 1);
assert.equal(transitionCount(values60, words), 0);

// Explicit 32-bit seeded generator. Modulo reduction has an absolute
// per-draw deviation bounded by 1/2^32 and affects neither exact analytic
// fixed-pair probabilities nor the qualitative null inference.
let state = 0x6d3fbe21;
function next32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
function shuffle(order, rowsOnly) {
  for (let i = 0; i < 256; i += 1) order[i] = i;
  if (rowsOnly) {
    for (let row = 0; row < 32; row += 1) {
      const base = row * 8;
      for (let col = 7; col > 0; col -= 1) {
        const swapCol = next32() % (col + 1);
        [order[base + col], order[base + swapCol]] =
          [order[base + swapCol], order[base + col]];
      }
    }
  } else {
    for (let i = 255; i > 0; i -= 1) {
      const j = next32() % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
}
function tableNull(trials, rowsOnly) {
  let exact = 0;
  let any59 = 0;
  let any60 = 0;
  let anyEither = 0;
  let total59 = 0;
  let total60 = 0;
  const order = Array.from({ length: 256 }, (_, index) => index);
  for (let k = 0; k < trials; k += 1) {
    shuffle(order, rowsOnly);
    const n59 = transitionCount(values59, words, order);
    const n60 = transitionCount(values60, words, order);
    total59 += n59;
    total60 += n60;
    if (n59 > 0) any59 += 1;
    if (n60 > 0) any60 += 1;
    if (n59 + n60 > 0) anyEither += 1;
    if (values59[order[150]] === 151 && values59[order[151]] === 186) exact += 1;
  }
  return { trials, rowsOnly, exact, any59, any60, anyEither, total59, total60 };
}

// The reference pool is sourced from solved LP1 prose (sections before 56),
// excluding editorial markup, numerical grids and comments. Transliteration
// is a declared approximation: GP has TH/NG/etc digraphs, and K/V/Q/Z are
// normalized to C/U/C/S. The p57 14-rune ineligible title-length word has
// no reference match and remains fixed. It has sum 451 and cannot address 256.
const gpIndex = new Map(corpus.translit.map((rune, index) => [rune, index]));
const digraphs = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
function toGp(word) {
  const source = word.replaceAll('K', 'C').replaceAll('V', 'U')
    .replaceAll('Q', 'C').replaceAll('Z', 'S');
  const indexes = [];
  for (let i = 0; i < source.length;) {
    const piece = digraphs.find(d => source.startsWith(d, i)) || source[i];
    if (!gpIndex.has(piece)) return null;
    indexes.push(gpIndex.get(piece));
    i += piece.length;
  }
  return {
    text: source,
    length: indexes.length,
    sum: indexes.reduce((acc, i) => acc + corpus.prime[i], 0)
  };
}
const lp1BeforeP56 = lp1.split('### 56')[0];
const pool = lp1BeforeP56.split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /^[A-Z][A-Z .,;:!?'"-]*$/.test(line))
  .flatMap(line => line.match(/[A-Z]{2,}/g) || [])
  .map(toGp)
  .filter(Boolean);
const buckets = new Map();
for (const word of pool) {
  if (!buckets.has(word.length)) buckets.set(word.length, []);
  buckets.get(word.length).push(word);
}
assert.ok(words.every(word =>
  buckets.has(word.length) || word.sum > 256));
function referenceNull(trials) {
  let any59 = 0;
  let any60 = 0;
  let anyEither = 0;
  for (let k = 0; k < trials; k += 1) {
    const sample = words.map(word => {
      const bucket = buckets.get(word.length);
      return bucket ? bucket[next32() % bucket.length] : word;
    });
    const n59 = transitionCount(values59, sample);
    const n60 = transitionCount(values60, sample);
    if (n59 > 0) any59 += 1;
    if (n60 > 0) any60 += 1;
    if (n59 + n60 > 0) anyEither += 1;
  }
  return { trials, poolSize: pool.length, any59, any60, anyEither };
}

const trials = 300000;
const global = tableNull(trials, false);
const byRow = tableNull(trials, true);
const matchedLp1 = referenceNull(trials);
const sameRow = values59.slice(18 * 8, 19 * 8);
assert.equal(sameRow.filter(value => value === 151).length, 1);
assert.equal(sameRow.filter(value => value === 186).length, 1);

const result = {
  seed: '0x6d3fbe21',
  original: {
    p57WordOccurrences: words.length,
    eligibleInitialAddresses: eligible.map(word => [word.text, word.sum]),
    base59Transitions: transitionCount(values59, words),
    base60Transitions: transitionCount(values60, words),
    sourcePath: [[150, '2X', 151], [151, '39', 186]]
  },
  exactFixedPairPGlobal: values59.filter(value => value === 151).length *
    values59.filter(value => value === 186).length / (256 * 255),
  exactFixedPairPWithinOriginalRow: 1 / (8 * 7),
  global,
  byRow,
  matchedLp1
};
console.log(JSON.stringify(result, null, 2));
