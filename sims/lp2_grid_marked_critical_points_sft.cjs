'use strict';
/**
 * Source-locked 13/24 critical-point test for the 32x8 LP2 grid.
 *
 * The 31 source-visible thirteen-dot marks select field element 13.
 * The oversized red Ac on p54 selects GP index 24.
 * Treat the original grid's 256 numerical values as descending GF(29)
 * polynomial coefficients, preserving the leading zero modulo 29.
 *
 * Run: node sims/lp2_grid_marked_critical_points_sft.cjs
 *
 * These equalities do not identify an LP2 key or decrypt ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
function load(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
const grid = load('resources/liber-primus/base60-grid.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);

const sourceDot13 = ink.pages.flatMap(p => p.large_punctuation || [])
  .filter(mark => mark[1] === 13);
assert.equal(sourceDot13.length, 31);
const ac = ink.pages.find(p => p.page === 54).red_spans[0].runes[0];
const acIndex = corpus.runes.indexOf(ac);
assert.equal(acIndex, 24);

/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;

/**
 * Hasse derivatives [P(x), P^[1](x), P^[2](x), P^[3](x)] in GF(29).
 * Uses simultaneous Horner evaluation of the original polynomial.
 * @param {number[]} coefficients Descending polynomial coefficients.
 * @param {number} x
 * @returns {[number, number, number, number]}
 */
function jets(coefficients, x) {
  /** @type {[number,number,number,number]} */
  const j = [0, 0, 0, 0];
  for (const c of coefficients) {
    for (let k = 3; k >= 1; k--) j[k] = mod(j[k] * x + j[k - 1]);
    j[0] = mod(j[0] * x + c);
  }
  return j;
}
/** @param {string} alphabet */
function decode(alphabet) {
  return tokens.map(t => {
    const high = alphabet.indexOf(t[0]);
    const low = alphabet.indexOf(t[1]);
    assert(high >= 0 && low >= 0);
    return high * alphabet.length + low;
  });
}
/** @param {number[]} seq */
function columnMajor(seq) {
  return Array.from({ length: 256 }, (_, i) =>
    seq[8 * (i % 32) + Math.floor(i / 32)]);
}

const original = decode(grid.alphabet);
const gridCritical = Array.from({ length: 29 }, (_, x) =>
  ({ x, jet: jets(original, x) })).filter(item => item.jet[1] === 0);
assert.deepEqual(gridCritical, [
  { x: 13, jet: [8, 0, 4, 13] },
  { x: 24, jet: [0, 0, 26, 6] }
]);
assert.deepEqual(jets(original, acIndex), [0, 0, 26, 6]);
const j13 = jets(original, 13);
assert.equal(j13[1], 0);
assert.equal(mod(2 * j13[2]), j13[0]);
assert.equal(j13[3], 13);

const cases = [];
for (const [codec, alphabet] of [
  ['base60', grid.alphabet],
  ['base59', grid.alphabet.replace('f', '')]
]) {
  const base = decode(alphabet);
  for (const [order, seq] of [
    ['row-major', base],
    ['column-major', columnMajor(base)]
  ]) {
    for (const [direction, coeffs] of [
      ['forward', seq],
      ['reversed', [...seq].reverse()]
    ]) {
      const jet13 = jets(coeffs, 13);
      const jet24 = jets(coeffs, 24);
      const markedCriticalPair = jet13[1] === 0 && jet24[1] === 0;
      const fullJetPattern = markedCriticalPair
        && mod(2 * jet13[2]) === jet13[0]
        && jet13[3] === 13 && jet24[0] === 0;
      cases.push({
        codec, order, direction, jet13, jet24,
        markedCriticalPair, fullJetPattern
      });
    }
  }
}
assert.equal(cases.filter(c => c.markedCriticalPair).length, 1);
assert.equal(cases.filter(c => c.fullJetPattern).length, 1);
assert.equal(cases.find(c => c.fullJetPattern).codec, 'base60');
assert.equal(cases.find(c => c.fullJetPattern).order, 'row-major');
assert.equal(cases.find(c => c.fullJetPattern).direction, 'forward');

console.log(JSON.stringify({
  markedInputs: { punctuationSize: 13, count: sourceDot13.length,
    oversizedAcIndex: acIndex },
  exactOriginalCriticalPoints: gridCritical,
  originalSpecialJet: {
    x: 13, value: j13[0], derivative: j13[1],
    secondDerivative: mod(2 * j13[2]),
    thirdHasseCoefficient: j13[3]
  },
  readings: cases,
  interpretation: 'exact original-source fingerprint, not a key or plaintext'
}, null, 2));
