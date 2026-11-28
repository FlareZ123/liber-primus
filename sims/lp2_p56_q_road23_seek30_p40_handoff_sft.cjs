#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r/g, '');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');

const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]),
  ];
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  let acc = [0, 0];
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [
      mod(acc[0] + coefficient * power[0]),
      mod(acc[1] + coefficient * power[1]),
    ];
    power = mul(power, [0, 1]);
  }
  return acc;
}

const Q = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const EQ = evaluate(Q);
assert.deepEqual(EQ, [17, 24]);

const dlog = new Map();
let state = [1, 0];
for (let k = 0; k < 840; k += 1) {
  assert.ok(!dlog.has(state.join(',')));
  dlog.set(state.join(','), k);
  state = mul(state, EQ);
}
assert.deepEqual(state, [1, 0]);
assert.equal(dlog.size, 840);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const record = ink.pages.find((item) => item.page === page);
  assert.ok(record);
  const span = (record.red_spans || []).find((item) => item.start === start && item.length === length);
  assert.ok(span);
  return [...span.runes].map((rune) => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  });
}

/** @param {number[]} span @returns {{coord:[number,number],k:number}} */
function orbit(span) {
  const E = evaluate(span);
  const k = dlog.get(E.join(','));
  assert.notEqual(k, undefined);
  return {coord: [Math.floor(k / 29), k % 29], k};
}

const q56 = orbit(redSpan(56, 0, 5));
const q40 = orbit(redSpan(40, 0, 8));
assert.deepEqual(q56, {coord: [4, 5], k: 121});
assert.deepEqual(q40, {coord: [5, 8], k: 153});

const p56Cipher = redSpan(56, 0, 5);
const p56Plain = p56Cipher.map((value, i) => mod(value - [1, 2, 4, 6, 10][i]));
assert.equal(p56Plain.map((index) => corpus.translit[index]).join(''), 'ANEND');

const clear = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const words = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(words.length, 43);
assert.equal(words[4], 'EMPTY');
assert.equal(words[5], 'EPIPHANY');
assert.equal(words[23], 'ROAD');
assert.equal(words[29], 'DIRECTION');
assert.equal(words[30], 'SEEK');

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  let offset = 0;
  let sum = 0;
  while (offset < normalized.length) {
    if (normalized.startsWith('ING', offset)) {
      sum += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      sum += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token, 'unmapped GP word ' + word);
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

const adjacentSerialHits = [];
for (let i = 0; i < words.length - 1; i += 1) {
  const serial = 29 * i + (i + 1);
  if (serial === gp0(words[i + 1])) {
    adjacentSerialHits.push({i, left: words[i], right: words[i + 1], serial});
  }
}
assert.deepEqual(adjacentSerialHits, [{
  i: 4,
  left: 'EMPTY',
  right: 'EPIPHANY',
  serial: 121,
}]);
assert.equal(gp0('EPIPHANY'), 121);

const tokens = grid.rows.flat();
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(tokens.length, 256);
assert.equal(alphabet59.length, 59);

/** @param {string} token @param {string} alphabet @param {number} radix @returns {number} */
function numeral(token, alphabet, radix) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return radix * hi + lo;
}

const d59 = tokens.map((token) => numeral(token, alphabet59, 59));
const d60 = tokens.map((token) => numeral(token, alphabet60, 60));
const sink = 189;

/** @param {number[]} table @param {number} start @param {number} count @returns {number|null} */
function step(table, start, count) {
  let value = start;
  for (let i = 0; i < count; i += 1) {
    if (value < 0 || value >= 256) return null;
    value = table[value];
  }
  return value;
}

/** @param {number[]} table @param {number} start @returns {{hit:boolean,path:number[]}} */
function walk(table, start) {
  const out = [start];
  const seen = new Set();
  while (true) {
    const current = out.at(-1);
    if (current === sink) return {hit: true, path: out};
    if (current < 0 || current >= 256 || seen.has(current)) return {hit: false, path: out};
    seen.add(current);
    out.push(table[current]);
  }
}

const path56 = walk(d59, q56.k);
assert.equal(path56.hit, true);
assert.equal(path56.path.length - 1, 30);
assert.equal(path56.path.at(-1), sink);
assert.equal(path56.path[23], q40.k);
assert.equal(step(d59, q56.k, 23), q40.k);
assert.equal(step(d60, q56.k, 23), 114);
assert.equal(walk(d60, q56.k).hit, false);

assert.deepEqual(path56.path, [
  121, 233, 230, 115, 243, 211, 60, 104, 120, 41,
  83, 190, 167, 244, 22, 58, 144, 123, 53, 168,
  236, 234, 193, 153, 33, 112, 72, 161, 214, 247, 189,
]);

const fixed59 = d59
  .map((value, index) => value === index ? index : null)
  .filter((value) => value !== null);
assert.deepEqual(fixed59, [sink]);

const qStarts = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const values = [...span.runes].map((rune) => runeIndex.get(rune));
    const E = evaluate(values);
    const k = dlog.get(E.join(','));
    if (k === undefined || k >= 256) continue;
    const w59 = walk(d59, k);
    qStarts.push({
      page: page.page,
      start: span.start,
      length: span.length,
      k,
      coord: [Math.floor(k / 29), k % 29],
      depth59: w59.hit ? w59.path.length - 1 : null,
    });
  }
}
qStarts.sort((a, b) => a.page - b.page || a.start - b.start);
assert.deepEqual(qStarts, [
  {page: 8, start: 0, length: 12, k: 222, coord: [7, 19], depth59: 32},
  {page: 15, start: 0, length: 9, k: 236, coord: [8, 4], depth59: 10},
  {page: 23, start: 0, length: 16, k: 155, coord: [5, 10], depth59: 34},
  {page: 40, start: 0, length: 8, k: 153, coord: [5, 8], depth59: 7},
  {page: 53, start: 128, length: 51, k: 90, coord: [3, 3], depth59: 9},
  {page: 56, start: 0, length: 5, k: 121, coord: [4, 5], depth59: 30},
]);

assert.deepEqual(qStarts.filter((item) => item.depth59 === 30).map((item) => item.page), [56]);

const qByK = new Map(qStarts.map((item) => [item.k, item]));
const transitionHits = [];
for (const [radix, table] of [['base59', d59], ['base60', d60]]) {
  for (const source of qStarts) {
    const destination = step(table, source.k, 23);
    if (destination !== null && qByK.has(destination)) {
      transitionHits.push({
        radix,
        fromPage: source.page,
        start: source.k,
        toPage: qByK.get(destination).page,
        destination,
      });
    }
  }
}
assert.deepEqual(transitionHits, [{
  radix: 'base59',
  fromPage: 56,
  start: 121,
  toPage: 40,
  destination: 153,
}]);

const p27Path = [186, 19, 33, 112, 72, 161, 214, 247, 189];
const p27Highs = p27Path.slice(0, -1).map((address) => Math.floor(address / 29));
assert.deepEqual(p27Highs, [6, 0, 1, 3, 2, 5, 7, 8]);
assert.deepEqual([...p27Highs].sort((a, b) => a - b), [0, 1, 2, 3, 5, 6, 7, 8]);

console.log(JSON.stringify({
  status: 'PASS',
  solvedP56: {
    plaintext: 'AN END',
    qCoordinate: q56.coord,
    qExponent: q56.k,
    sourcePair: [words[4], words[5]],
    epiphanyGP0: gp0('EPIPHANY'),
  },
  unknownP40: {
    qCoordinate: q40.coord,
    qExponent: q40.k,
    sourceInterval: words.slice(5, 9),
  },
  sourceNumbers: {
    roadAndDhP: 23,
    direction: words.indexOf('DIRECTION'),
    seek: words.indexOf('SEEK'),
  },
  p56Path: path56.path,
  road23Handoff: {from: q56.k, to: step(d59, q56.k, 23)},
  qStarts,
  transitionHits,
  adjacentSerialHits,
  p27Highs,
  classification:
    'Exact post-discovery solved-p56 to unknown-p40 Q-state navigation cross-lock. Among all six Q-derived valid p50 starts and both live radices, only base59 maps p56 k121 to p40 k153 in ROAD/DH-p=23 hops; p56 alone has SEEK=30 depth to the unique root. No p40 plaintext is claimed.',
}, null, 2));
