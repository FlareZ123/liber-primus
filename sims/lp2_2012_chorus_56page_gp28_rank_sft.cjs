'use strict';

/**
 * Historical 2012 signed Blake chorus as 56 page-local GP28 rank keys.
 *
 * The verified 2012 email says "Let the Chorus be your guide to the depths."
 * Its Blake chorus contains exactly 56 words, matching physical LP2 p0..55.
 * This tests a single source-defined key assignment: one word per page.
 * The rank step excludes the previous ciphertext rune. Repeat outputs
 * represent the reserved GP29 rune EA; no ciphertext symbols are discarded.
 *
 * Node.js 22 CommonJS, read-only single runnable test file.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const message = read('resources/control/cicada2012_blake_chorus.txt');
const text = message.split('BEGIN SOURCE TEXT')[1].split('END SOURCE TEXT')[0];
const sourceWords = text.match(/[A-Za-z]+/g);
assert.equal(sourceWords.length, 56);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[50].indices.length, 0);

const mod = (n, q) => (n % q + q) % q;
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find(x => normalized.startsWith(x.s, i));
    assert.ok(token, 'GP29 encoding token at ' + i + ': ' + normalized);
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
const keys = sourceWords.map(gp);
assert.ok(keys.every(k => k.length > 0));
const pageLengths = corpus.pages.slice(0, 56).map(p => p.indices.length);
const n = pageLengths.reduce((s, x) => s + x, 0);
assert.equal(n, 12956);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);

/** @param {number} rank @param {number} previous @param {string} order */
function fromRank(rank, previous, order) {
  assert.ok(rank >= 0 && rank < 28);
  if (order === 'sorted') return rank >= previous ? rank + 1 : rank;
  return mod(previous + 1 + rank, 29);
}

/** @param {number} c @param {number} previous @param {string} order */
function toRank(c, previous, order) {
  assert.notEqual(c, previous);
  if (order === 'sorted') return c - Number(c > previous);
  return mod(c - previous - 1, 29);
}

/**
 * @typedef {{order:'sorted'|'cyclic', sign:number, phase:number}} Mode
 * @param {number[][]} pages
 * @param {Mode} mode
 * @returns {number[][]}
 */
function inverse(pages, mode) {
  return pages.map((arr, page) => {
    const key = keys[page];
    if (!arr.length) return [];
    let prior = 0;
    return arr.map((c, pos) => {
      const k = key[(pos + mode.phase) % key.length] % 28;
      const plain = pos === 0
        ? mod(c + mode.sign * key[mode.phase % key.length], 29)
        : c === prior ? 28 : mod(toRank(c, prior, mode.order)
          + mode.sign * k, 28);
      prior = c;
      return plain;
    });
  });
}

/**
 * @param {number[][]} pages
 * @param {Mode} mode
 * @returns {number[][]}
 */
function forward(pages, mode) {
  return pages.map((arr, page) => {
    const key = keys[page];
    if (!arr.length) return [];
    let previous = 0;
    return arr.map((plain, pos) => {
      const k = key[(pos + mode.phase) % key.length] % 28;
      const c = pos === 0
        ? mod(plain - mode.sign * key[mode.phase % key.length], 29)
        : plain === 28 ? previous
          : fromRank(mod(plain - mode.sign * k, 28), previous, mode.order);
      previous = c;
      return c;
    });
  });
}

/** @param {number[]} vals @returns {number} */
function ioc(vals) {
  const h = Array(29).fill(0);
  for (const x of vals) h[x]++;
  return h.reduce((sum, x) => sum + x * (x - 1), 0)
    / (vals.length * (vals.length - 1));
}
const flatten = pages => pages.flat();
const cipher = corpus.pages.slice(0, 56).map(p => p.indices);
const original = flatten(cipher);
assert.equal(original.length, 12956);
let doublets = 0;
for (const arr of cipher) for (let i = 1; i < arr.length; i++)
  if (arr[i] === arr[i - 1]) doublets++;
assert.equal(doublets, 86);

// Independent native-English GP29 control. Preserve original page capacities.
const referenceWords = read('resources/control/shakespeare_first300k.txt')
  .match(/[A-Za-z]+/g);
const native = [];
for (const word of referenceWords) {
  native.push(...gp(word));
  if (native.length >= n) break;
}
assert.ok(native.length >= n);
const plant = native.slice(0, n);
const plantPages = [];
let at = 0;
for (const len of pageLengths) {
  plantPages.push(plant.slice(at, at + len));
  at += len;
}
assert.equal(at, n);

const observed = [];
for (const order of ['sorted', 'cyclic'])
  for (const sign of [-1, +1])
    for (const phase of [0, 1]) {
      const mode = {order, sign, phase};
      const decoded = inverse(cipher, mode);
      const reencoded = forward(decoded, mode);
      assert.deepEqual(reencoded, cipher, 'original GP roundtrip: ' + JSON.stringify(mode));
      const plantedCipher = forward(plantPages, mode);
      const recovered = inverse(plantedCipher, mode);
      assert.deepEqual(recovered, plantPages, 'native-GP plant: ' + JSON.stringify(mode));
      const plain = flatten(decoded);
      observed.push({
        ...mode,
        original_ioc: ioc(plain),
        original_prefix: plain.slice(0, 70).map(i => corpus.translit[i]).join(''),
        plant_ioc: ioc(flatten(recovered))
      });
    }

assert.ok(observed.every(m => m.original_ioc < 0.036));
assert.ok(observed.every(m => m.plant_ioc > 0.055));
const result = {
  source_words: sourceWords.length,
  unknown_original_runes: n,
  physical_pages: 56,
  rune_bearing_pages: cipher.filter(a => a.length).length,
  original_doublets: doublets,
  raw_original_ioc: ioc(original),
  native_plant_ioc: ioc(plant),
  modes: observed
};
console.log(JSON.stringify(result, null, 2));
