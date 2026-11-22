'use strict';

/**
 * Original LP2 GP29 cross-corpus source-codeword gate.
 *
 * The p50 256-cell table is divisible over GF(29) by the product of the
 * signed 2013 BASE29 H polynomial and p39 red-triad G polynomial. Test whether
 * this exact signature recurs on original unknown-page rune sequences, and
 * whether polynomial division exposes GP-native prose.
 *
 * Read-only single runnable test (SFT), Node.js 22, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {any} */
function read(name) {
  return JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'
  ));
}

const corpus = read('lp2-corpus.json');
const grid = read('lp2-grid-256.json');
const mod = x => ((x % 29) + 29) % 29;
const H = [24, 26, 3];
const G = [15, 5, 27];
const HG = [12, 17, 11, 21, 23];

/**
 * Descending-order GF29 polynomial multiplication.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}

/**
 * Descending-order polynomial quotient with exact GF29 remainder.
 * @param {number[]} source
 * @param {number[]} divisor
 * @returns {{q:number[],remainder:number[]}}
 */
function divide(source, divisor) {
  const inverseLeading = Array.from({length: 29}, (_, i) => i)
    .find(x => mod(x * divisor[0]) === 1);
  assert.notEqual(inverseLeading, undefined);
  const buf = source.map(x => mod(x));
  const q = [];
  for (let i = 0; i <= buf.length - divisor.length; i++) {
    const x = mod(buf[i] * inverseLeading);
    q.push(x);
    for (let j = 0; j < divisor.length; j++) {
      buf[i + j] = mod(buf[i + j] - x * divisor[j]);
    }
  }
  return {q, remainder: buf.slice(-(divisor.length - 1))};
}

/**
 * Residues P(24), P'(24), and the two remainder coefficients modulo monic H.
 * All four zero exactly iff the source polynomial has factor HG.
 * @param {number[]} source
 * @returns {number[]}
 */
function syndrome(source) {
  let v = 0, d = 0, h0 = 0, h1 = 0;
  for (const x of source) {
    const prev = v;
    v = mod(24 * v + x);
    d = mod(24 * d + prev);
    [h0, h1] = [mod(18 * h1 + x), mod(h0 + 11 * h1)];
  }
  return [v, d, h0, h1];
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

assert.deepEqual(multiply(H, G), HG);
assert.equal(grid.bytes.length, 256);
assert.equal(corpus.pages[50].indices.length, 0);
const tableResidues = grid.bytes.map(x => x % 29);
assert.deepEqual(syndrome(tableResidues), [0, 0, 0, 0]);
const tableDecoded = divide(tableResidues, HG);
assert.deepEqual(tableDecoded.remainder, [0, 0, 0, 0]);
assert.deepEqual(tableDecoded.q.slice(0, 10),
  [0, 12, 9, 28, 2, 25, 23, 21, 18, 28]);

const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const all = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(all.length, 12956);

const exactGPages = [];
const exactHPages = [];
const allRunePages = corpus.pages.filter(p => p.indices.length > 0);
for (const page of allRunePages) {
  const s = syndrome(page.indices);
  if (s[0] === 0 && s[1] === 0) exactGPages.push(page.page);
  if (s[2] === 0 && s[3] === 0) exactHPages.push(page.page);
}
assert.deepEqual(exactGPages, [29]);
assert.deepEqual(exactHPages, []);

const gWindows = [], hWindows = [], hgWindows = [];
for (let i = 0; i + 256 <= all.length; i++) {
  const s = syndrome(all.slice(i, i + 256));
  if (!s[0] && !s[1]) gWindows.push(i);
  if (!s[2] && !s[3]) hWindows.push(i);
  if (s.every(x => x === 0)) hgWindows.push(i);
}
assert.equal(all.length - 255, 12701);
assert.equal(gWindows.length, 11);
assert.equal(hWindows.length, 22);
assert.deepEqual(hgWindows, []);

const p29 = corpus.pages[29].indices;
assert.equal(p29.length, 277);
const p29G = divide(p29, G);
const p29H = divide(p29, H);
assert.deepEqual(p29G.remainder, [0, 0]);
assert.deepEqual(p29H.remainder, [16, 20]);
const continuous = divide(all, HG);
assert.deepEqual(continuous.remainder, [24, 14, 9, 0]);
const individualPageQuotient = pages.flatMap(p => divide(p.indices, HG).q);
assert.equal(continuous.q.length, 12952);
assert.equal(individualPageQuotient.length, 12736);
assert.ok(Math.abs(ioc(continuous.q) - 0.034471523754023396) < 1e-12);
assert.ok(Math.abs(ioc(individualPageQuotient) - 0.03452758985346836) < 1e-12);

const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const planted = multiply(solved, HG);
const recovered = divide(planted, HG);
assert.deepEqual(recovered.q, solved);
assert.deepEqual(recovered.remainder, [0, 0, 0, 0]);

console.log(JSON.stringify({
  status: 'no original unknown plaintext or full HG-codeword window',
  table: {
    symbols: 256,
    syndrome: syndrome(tableResidues),
    quotient: tableDecoded.q.length
  },
  original: {
    unknownRunes: all.length,
    tested256RuneWindows: all.length - 255,
    gFactorWindows: gWindows.length,
    hFactorWindows: hWindows.length,
    fullHGFactorWindows: hgWindows.length,
    exactGWholePages: exactGPages,
    exactHWholePages: exactHPages,
    ioc: ioc(all),
    continuousHgQuotientIoc: ioc(continuous.q),
    independentPageHgQuotientIoc: ioc(individualPageQuotient)
  },
  p29: {
    originalRunes: p29.length,
    gRemainder: p29G.remainder,
    hRemainder: p29H.remainder,
    gQuotientIoc: ioc(p29G.q)
  },
  positivePlantRecovered: String(solved.length) + '/' + String(solved.length)
}, null, 2));
