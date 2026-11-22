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


/**
 * Five independently source-numbered Hermite-jet constraints:
 *   P(24)=P'(24)=P'(13)=P''(13)-P(13)=Hasse3(13)-13=0.
 * Under the explicitly CONDITIONAL assumption that all five constraints
 * must hold, test whether a single erroneous coefficient residue can be
 * uniquely located and corrected. This says nothing about changes by
 * multiples of 29 in the underlying byte reading.
 * @param {number[]} coeffs
 * @returns {number[]}
 */
function markedSyndrome(coeffs) {
  const a = jets(coeffs, 13), b = jets(coeffs, 24);
  return [b[0], b[1], a[1], mod(2 * a[2] - a[0]), mod(a[3] - 13)];
}
assert.deepEqual(markedSyndrome(original), [0, 0, 0, 0, 0]);
/** @param {number} value */
function inverse29(value) {
  for (let k = 1; k < 29; k++) {
    if (mod(value * k) === 1) return k;
  }
  throw Error('Nonzero field inverse expected');
}
const signatureVectors = [];
for (let pos = 0; pos < 256; pos++) {
  const monomial = Array(256).fill(0);
  monomial[pos] = 1;
  const a = jets(monomial, 13), b = jets(monomial, 24);
  signatureVectors.push([b[0], b[1], a[1],
    mod(2 * a[2] - a[0]), a[3]]);
}
/** @param {number[]} vector */
function signature(vector) {
  const scale = inverse29(vector[0]);
  return vector.map(v => mod(v * scale)).join(',');
}
const lookup = new Map(signatureVectors.map((v, i) => [signature(v), i]));
assert.equal(lookup.size, 256);
let correctedCases = 0;
for (let pos = 0; pos < 256; pos++) {
  for (let error = 1; error < 29; error++) {
    const damaged = original.slice();
    damaged[pos] = mod(damaged[pos] + error);
    const syn = markedSyndrome(damaged);
    const recoveredPos = lookup.get(signature(syn));
    assert.equal(recoveredPos, pos);
    const recoveredError = mod(syn[0] *
      inverse29(signatureVectors[recoveredPos][0]));
    assert.equal(recoveredError, error);
    assert.equal(mod(damaged[recoveredPos] - recoveredError),
      mod(original[recoveredPos]));
    correctedCases++;
  }
}
assert.equal(correctedCases, 256 * 28);

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
  conditionalSingleResidueCorrection: {
    distinctCellSyndromes: lookup.size,
    correctedSingleCellMutations: correctedCases,
    nonzeroFieldResiduesOnly: true,
    doesNotRecoverTheFullOriginalByte: true
  },
  interpretation: 'exact original-source fingerprint, not a key or plaintext'
}, null, 2));
