'use strict';

/**
 * Source-exact single-file test of two literal numeric readings of the
 * physical LP2 pp49–51 table. No cipher key, page offset or plaintext is fit.
 *
 * Run with Node.js in the repository root. The original printed tokens and
 * the conventional base-60 derived-byte table are both checked.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const source = JSON.parse(readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'),
  'utf8',
));
const ink = JSON.parse(readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8',
));
const corpus = JSON.parse(readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8',
));

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
const modulus = 29;
const H = [3, 26, 24];   // Signed 2013 BASE29 3301 = 3QO, ascending coefficients
const H1033 = [1, 6, 18]; // Matched source control: BASE29 1033 = 16I
const G = [27, 5, 15];   // Original LP2 p39 red 27,5,15, ascending coefficients
const F = [23, 21, 11, 17, 12]; // H*G over GF(29), ascending coefficients

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % modulus) + modulus) % modulus;
}

/** @param {number} value @param {number} exponent @returns {number} */
function power(value, exponent) {
  let out = 1;
  for (let n = exponent, a = mod(value); n > 0; n = Math.floor(n / 2), a = mod(a * a)) {
    if (n % 2 === 1) out = mod(out * a);
  }
  return out;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}

/**
 * @param {number[]} descendingCoefficients
 * @param {number[]} divisor Ascending polynomial coefficients over GF(29)
 * @returns {number[]} Ascending remainder coefficients
 */
function remainder(descendingCoefficients, divisor) {
  const coefficients = descendingCoefficients.slice().reverse().map(mod);
  const inv = power(divisor[divisor.length - 1], modulus - 2);
  for (let i = coefficients.length - 1; i >= divisor.length - 1; i--) {
    const scale = mod(coefficients[i] * inv);
    for (let j = 0; j < divisor.length; j++) {
      const at = i - divisor.length + 1 + j;
      coefficients[at] = mod(coefficients[at] - scale * divisor[j]);
    }
  }
  return coefficients.slice(0, divisor.length - 1);
}

/**
 * @param {string[][]} rows
 * @param {string} alphabet
 * @returns {number[]}
 */
function parseCells(rows, alphabet) {
  const out = [];
  for (const row of rows) {
    assert.equal(row.length, 8);
    for (const token of row) {
      assert.equal(token.length, 2);
      const high = alphabet.indexOf(token[0]);
      const low = alphabet.indexOf(token[1]);
      assert.ok(high >= 0 && low >= 0, 'Original printed token must use the declared radix');
      out.push(high * alphabet.length + low);
    }
  }
  return out;
}

assert.equal(source.rows.length, 32);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(source.alphabet, alphabet60);
assert.deepEqual(multiply(H, G), F);
assert.ok(source.rows.flat().every(token => !token.includes('f')));

const original60 = parseCells(source.rows, alphabet60);
const alternative59 = parseCells(source.rows, alphabet59);
assert.equal(original60.length, 256);
assert.deepEqual(original60, source.byte_rows.flat());

const r60 = { H: remainder(original60, H), G: remainder(original60, G), F: remainder(original60, F) };
const r59 = { H: remainder(alternative59, H), G: remainder(alternative59, G), F: remainder(alternative59, F) };
const reversed60 = remainder(original60.slice().reverse(), F);
const reversed59 = remainder(alternative59.slice().reverse(), F);
const source1033Control = {
  base60: remainder(original60, H1033),
  base59: remainder(alternative59, H1033),
};

assert.deepEqual(r60, { H: [0, 0], G: [0, 0], F: [0, 0, 0, 0] });
assert.deepEqual(r59, { H: [20, 17], G: [22, 12], F: [8, 19, 1, 7] });
assert.deepEqual(reversed60, [25, 8, 18, 24]);
assert.deepEqual(reversed59, [14, 9, 27, 24]);
assert.deepEqual(source1033Control, { base60: [3, 24], base59: [8, 21] });

const alteredCells = original60.filter((value, index) => value !== alternative59[index]).length;
assert.equal(alteredCells, 220);

// Exhaust the 18 source-image red inscriptions in both original orientations,
// not just the discovered p39 red quadratic.
const runeOrdinals = new Map(corpus.runes.map((rune, i) => [rune, i]));
const corpusPages = new Map(corpus.pages.map(page => [page.page, page]));
const redFactorTests = [];
for (const inkPage of ink.pages) {
  const page = corpusPages.get(inkPage.page);
  assert.ok(page);
  for (const span of (inkPage.red_spans || [])) {
    const inkIndices = Array.from(span.runes, rune => runeOrdinals.get(rune));
    assert.deepEqual(page.indices.slice(span.start, span.start + span.length), inkIndices);
    for (const direction of ['forward', 'reverse']) {
      const polynomial = direction === 'forward' ? inkIndices.slice() : inkIndices.slice().reverse();
      while (polynomial.length > 1 && polynomial.at(-1) === 0) polynomial.pop();
      assert.ok(polynomial.length >= 2, 'Only nonconstant original source factors');
      redFactorTests.push({
        page: inkPage.page, start: span.start, length: span.length, direction,
        base60: remainder(original60, polynomial).every(x => x === 0),
        base59: remainder(alternative59, polynomial).every(x => x === 0),
      });
    }
  }
}
assert.equal(redFactorTests.length, 36);
assert.deepEqual(redFactorTests.filter(row => row.base59), []);
assert.deepEqual(redFactorTests.filter(row => row.base60), [
  { page:39, start:119, length:3, direction:'forward', base60:true, base59:false },
]);


console.log(JSON.stringify({
  interpretation: '256 printed pp49–51 cells as descending GF(29) polynomial coefficients',
  originalOrder: '32 x 8, row-major',
  factorH: H,
  sourceMatched1033Base29QuadraticControl: { factor: H1033, remainders: source1033Control },
  factorG: G,
  factorProduct: F,
  base60: { residues: r60, reversedProductResidue: reversed60 },
  base59_without_lowercase_f: { residues: r59, reversedProductResidue: reversed59 },
  numericallyChangedCells: alteredCells,
  originalRedSpanCount: 18,
  bidirectionalRedFactorTests: redFactorTests.length,
  base60RedFactors: redFactorTests.filter(row => row.base60),
  base59RedFactors: redFactorTests.filter(row => row.base59),
  conditionalExactFactorChanceForPrespecifiedFactors: 1 / (29 ** 4),
  status: 'Radix discriminator, not authenticated author intent or a decryption',
}, null, 2));
