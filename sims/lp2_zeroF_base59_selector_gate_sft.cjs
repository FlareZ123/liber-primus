'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const original = pages.flatMap((page) => page.indices);
const tokens = grid.pages.flatMap((page) => page.tokens);
const a59 = grid.alphabet.replace('f', '');

assert.equal(grid.alphabet.length, 60);
assert.equal(a59.length, 59);
assert.equal(original.length, 12956);
assert.equal(tokens.length, 256);

const sourceText = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runePattern = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const words = (sourceText.match(runePattern) || []).map((word) =>
  Array.from(word, (glyph) => glyphIndex.get(glyph)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

const pageAt = new Uint8Array(original.length);
let offset = 0;
for (const page of pages) {
  pageAt.fill(page.page, offset, offset + page.indices.length);
  offset += page.indices.length;
}

const special = [
  corpus.translit.indexOf('F'),
  ...corpus.translit.map((value, index) => value.length === 2 ? index : -1)
    .filter((index) => index >= 0)
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

/** @param {string} token @returns {number} */
function base59(token) {
  const hi = a59.indexOf(token[0]);
  const lo = a59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * 59 + lo;
}

/** @param {number} value @param {number} left @param {number} right @returns {number} */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/** @param {'residue'|'column'} kind @param {number} control @returns {number} */
function marker(kind, control) {
  if (tokens[control][0] === '0') return 0;
  const selector = kind === 'residue' ? base59(tokens[control]) % 8 : control % 8;
  return special[selector];
}

/** @param {number[]} cipher @param {'residue'|'column'} kind @returns {number[]} */
function decrypt(cipher, kind) {
  const out = new Array(cipher.length);
  out[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    const control = (i - 1) & 255;
    out[i] = swap(cipher[i], cipher[i - 1], marker(kind, control));
  }
  return out;
}

/** @param {number[]} plain @param {'residue'|'column'} kind @returns {number[]} */
function encrypt(plain, kind) {
  const out = new Array(plain.length);
  out[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    const control = (i - 1) & 255;
    out[i] = swap(plain[i], out[i - 1], marker(kind, control));
  }
  return out;
}

/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const h = new Uint32Array(29);
  for (const value of stream) h[value]++;
  return Array.from(h).reduce((sum, n) => sum + n * (n - 1), 0) /
    (stream.length * (stream.length - 1));
}

/** @param {number[]} stream @returns {{adjacent:number,lag5:number}} */
function structure(stream) {
  let adjacent = 0;
  for (let i = 1; i < stream.length; i++) {
    if (pageAt[i] === pageAt[i - 1] && stream[i] === stream[i - 1]) adjacent++;
  }
  let pos = 0;
  let lag5 = 0;
  for (const word of words) {
    for (let j = 5; j < word.length; j++) {
      if (stream[pos + j] === stream[pos + j - 5]) lag5++;
    }
    pos += word.length;
  }
  return { adjacent, lag5 };
}

const dictionary = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  if (!dictionary.has(encoded.length)) dictionary.set(encoded.length, new Set());
  dictionary.get(encoded.length).add(encoded.join(','));
}

/** @param {number[]} stream @returns {{hits:number,longHits:number,longestRun:number}} */
function lexical(stream) {
  let pos = 0;
  let hits = 0;
  let longHits = 0;
  let run = 0;
  let longestRun = 0;
  for (const sourceWord of words) {
    const word = stream.slice(pos, pos + sourceWord.length);
    pos += sourceWord.length;
    const hit = dictionary.get(word.length)?.has(word.join(',')) || false;
    if (hit) {
      hits++;
      if (word.length >= 5) longHits++;
      run++;
      longestRun = Math.max(longestRun, run);
    } else {
      run = 0;
    }
  }
  return { hits, longHits, longestRun };
}

const rendered = (stream) => stream.slice(0, 80).map((v) => corpus.translit[v]).join('');
const result = {};
for (const kind of ['residue', 'column']) {
  const decoded = decrypt(original, kind);
  assert.deepEqual(encrypt(decoded, kind), original);
  result[kind] = {
    ioc: ioc(decoded),
    structure: structure(decoded),
    lexical: lexical(decoded),
    prefix: rendered(decoded)
  };
}

assert.deepEqual(structure(original), { adjacent: 86, lag5: 104 });
assert.equal(base59('0u'), 55);
assert.equal(grid.alphabet.indexOf('0'), 0);
const base60_0u = grid.alphabet.indexOf('u');
assert.equal(base60_0u, 56);
assert.notDeepEqual(result.residue, result.column);

console.log(JSON.stringify({
  sourceBridge: {
    base59Alphabet: a59,
    token0u: { base59: base59('0u'), base60: base60_0u },
    special
  },
  original: { ioc: ioc(original), structure: structure(original) },
  candidates: result,
  decision: 'Neither selector may be promoted without language; inspect exact outputs against the fixed source-native gate.'
}, null, 2));
