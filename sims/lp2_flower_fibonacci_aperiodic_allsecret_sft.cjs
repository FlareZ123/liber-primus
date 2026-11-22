'use strict';
/**
 * All-key, all-phase Fibonacci word A/B selector on original LP2 floral pages.
 * Fibonacci word F0=B, F1=A, F[n]=F[n-1]F[n-2]; F4=ABAAB.
 * Windows 11, Node22 CommonJS single-file test, no arguments or writes.
 * This hypothetical cipher is not an authenticated original instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(base, filename), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const N = 29, E = 18;
const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 48);
const total = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(pages.length, 9);
assert.equal(total, 2408);
assert.equal(corpus.translit[E], 'E');

/** @param {number} length @returns {string} */
function fibonacci(length) {
  let older = 'B', newer = 'A';
  while (newer.length < length) {
    const next = newer + older;
    older = newer;
    newer = next;
  }
  assert.equal(newer.slice(0, 5), 'ABAAB');
  return newer;
}
const sourceWord = fibonacci(11000);
/**
 * The infinite Fibonacci word has exactly L+1 different factors of length L.
 * Assert L+1 observed, thus all possible starts are included.
 * @param {number} length @returns {string[]}
 */
function factors(length) {
  const set = new Set();
  for (let k = 0; k + length <= sourceWord.length; k++) {
    set.add(sourceWord.slice(k, k + length));
  }
  assert.equal(set.size, length + 1);
  return [...set];
}
/**
 * Exact all-secret E capacity for two independent 29-symbol bijections.
 * @param {number[]} indices @param {string} selector @returns {number}
 */
function eCapacity(indices, selector) {
  assert.equal(indices.length, selector.length);
  const byState = [new Uint16Array(N), new Uint16Array(N)];
  for (let i = 0; i < indices.length; i++) {
    const v = indices[i];
    assert.ok(Number.isInteger(v) && v >= 0 && v < N);
    byState[selector[i] === 'A' ? 0 : 1][v]++;
  }
  return Math.max(...byState[0]) + Math.max(...byState[1]);
}
/** @param {number[]} original @returns {number} */
function maxCapacity(original) {
  return Math.max(...factors(original.length).map(mask => eCapacity(original, mask)));
}
const originalByPage = pages.map(p => ({
  page: p.page,
  runes: p.indices.length,
  fibonacciFactors: p.indices.length + 1,
  eUpperBound: maxCapacity(p.indices)
}));
assert.deepEqual(originalByPage.map(p => p.eUpperBound), [18, 21, 20, 23, 20, 20, 22, 23, 20]);
const originalEUpperBound = originalByPage.reduce((sum, p) => sum + p.eUpperBound, 0);
assert.equal(originalEUpperBound, 187);

const digraph = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const letters = {
  A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,
  L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,
  W:7,X:14,Y:26,Z:15
};
/** @param {string} raw @returns {number[]} */
function gp(raw) {
  const s = raw.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const pair = digraph[s.slice(i, i + 2)];
    if (pair !== undefined) { out.push(pair); i++; }
    else out.push(letters[s[i]]);
  }
  return out;
}
/** @param {number[]} seq @param {number} width @returns {number} */
function minWindowE(seq, width) {
  assert.ok(seq.length >= width);
  let count = 0;
  for (let i = 0; i < width; i++) count += Number(seq[i] === E);
  let best = count;
  for (let i = width; i < seq.length; i++) {
    count += Number(seq[i] === E) - Number(seq[i - width] === E);
    best = Math.min(best, count);
  }
  return best;
}
const gibran = gp(read('resources/control/gibran_prophet_58585.txt'));
const shakespeare = gp(read('resources/control/shakespeare_first300k.txt'));
assert.deepEqual([gibran.length, shakespeare.length], [62550, 216874]);
const referenceMinE = [minWindowE(gibran, total), minWindowE(shakespeare, total)];
assert.deepEqual(referenceMinE, [224, 196]);
assert.ok(referenceMinE.every(v => v > originalEUpperBound));

// Reversible native GP29 plant using aperiodic factors and separate affine
// substitution keys for both states on every page. The all-key bound must
// contain this planted plaintext's true E count.
const nativePlain = gibran.slice(0, total);
let offset = 0, plantEUpperBound = 0;
const recovered = [];
for (const p of pages) {
  const source = nativePlain.slice(offset, offset + p.indices.length);
  const mask = sourceWord.slice(71 * p.page, 71 * p.page + source.length);
  const encrypted = [];
  for (let i = 0; i < source.length; i++) {
    const state = mask[i] === 'A' ? 0 : 1;
    const a = 1 + (7 * p.page + 11 * state) % 28;
    const b = (11 * p.page + 5 * state) % N;
    const inv = Array.from({length:28}, (_, j) => j + 1)
      .find(v => a * v % N === 1);
    assert.ok(inv !== undefined);
    const c = (a * source[i] + b) % N;
    encrypted.push(c);
    recovered.push(((c - b + N) * inv) % N);
  }
  plantEUpperBound += maxCapacity(encrypted);
  offset += source.length;
}
assert.equal(offset, total);
assert.deepEqual(recovered, nativePlain);
const plantE = nativePlain.filter(v => v === E).length;
assert.equal(plantE, 263);
assert.equal(plantEUpperBound, 319);
assert.ok(plantE <= plantEUpperBound);

console.log(JSON.stringify({
  status: 'PASS',
  originalSource: 'LP2 p40-p48, nine source-visible floral pages',
  ciphertextRunes: total, originalByPage, originalEUpperBound,
  nativeControlMinE: { Gibran: referenceMinE[0], Shakespeare: referenceMinE[1] },
  nativePlant: { runes: total, exactRecovered: true, E: plantE, capacity: plantEUpperBound },
  conclusion: 'Fixed per-page two-secret-alphabet Fibonacci selector cannot decode either pinned native-English register. No plaintext/key recovered.'
}, null, 2));
