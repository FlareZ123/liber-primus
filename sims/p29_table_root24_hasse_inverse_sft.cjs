'use strict';

/**
 * Source-fixed LP2 p29 and 256-table Hasse/Taylor inversion at the red Ac=24 root.
 *
 * Run at repository root: node sims/p29_table_root24_hasse_inverse_sft.cjs
 *
 * The only selector is the original p39 double root 24, independently repeated
 * by the large red Ac at p54 and the signed 2013 BASE29 example. The polynomial
 * shift X -> X+24 is a bijection on GF(29)[X]. It is a candidate *readout*:
 * it is not itself an authenticated 2014 Cicada decoding instruction.
 *
 * The native original p29 and table inputs produce no GP-English plaintext.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/base60-grid.json');
const MOD = 29;
const ROOT = 24;

/** @param {number} value @returns {number} */
function residue(value) {
  return ((value % MOD) + MOD) % MOD;
}

/**
 * Treat high-degree-first coefficients as a polynomial and return the
 * low-degree-first coefficients of p(X+delta). Horner and the exact binomial
 * transform are equivalent, including for degree >= 29 in characteristic 29.
 *
 * @param {number[]} descending
 * @param {number} delta
 * @returns {number[]}
 */
function shift(descending, delta) {
  /** @type {number[]} */
  let poly = [];
  for (const coefficient of descending) {
    const next = Array(poly.length + 1).fill(0);
    for (let i = 0; i < poly.length; i++) {
      next[i] = residue(next[i] + delta * poly[i]);
      next[i + 1] = residue(next[i + 1] + poly[i]);
    }
    next[0] = residue(next[0] + coefficient);
    poly = next;
  }
  return poly;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(MOD).fill(0);
  for (const value of symbols) {
    assert(Number.isInteger(value) && value >= 0 && value < MOD);
    counts[value]++;
  }
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {string} label @param {number[]} symbols */
function report(label, symbols) {
  const head = symbols.slice(0, 100).map(index => corpus.translit[index]).join('');
  process.stdout.write(JSON.stringify({
    label,
    length: symbols.length,
    index_of_coincidence: Number(ioc(symbols).toFixed(12)),
    first_100_runes: head,
  }) + '\n');
}

assert.equal(MOD, corpus.translit.length);
assert.equal(table.byte_rows.length, 32);
assert(table.byte_rows.every(row => row.length === 8));
const p29 = corpus.pages.find(page => page.page === 29).indices;
const s256 = table.byte_rows.flat().map(value => residue(value));
assert.equal(p29.length, 277);
assert.equal(s256.length, 256);

const pTaylor = shift(p29, ROOT);
const sTaylor = shift(s256, ROOT);
assert.deepEqual(pTaylor.slice(0, 4), [0, 0, 27, 6]);
assert.deepEqual(sTaylor.slice(0, 4), [0, 0, 26, 6]);
const difference = pTaylor.map((value, index) =>
  residue(value - (sTaylor[index] || 0)));
assert.deepEqual(difference.slice(0, 4), [0, 0, 1, 0]);

// The exact inverse is p(X) = Taylor(X-24), with coefficient order restored.
for (const original of [p29, s256]) {
  const transformed = shift(original, ROOT);
  assert.deepEqual(shift(transformed.slice().reverse(), MOD - ROOT).reverse(),
    original);
}
// Independent known-text plant: original solved-page source GP symbols are
// shifted to an artificial ciphertext and recovered exactly. No original
// unsolved ciphertext or fitted key is involved in this test.
const known = corpus.pages.find(page => page.page === 57).indices;
const plantCipher = shift(known, MOD - ROOT).reverse();
assert.deepEqual(shift(plantCipher, ROOT).reverse(), known);

assert(Math.abs(ioc(pTaylor) - 0.03419138806048239) < 1e-12);
assert(Math.abs(ioc(sTaylor) - 0.033486519607843136) < 1e-12);
assert(Math.abs(ioc(difference) - 0.033877465599330296) < 1e-12);
report('p29_root24_low_degree_first', pTaylor);
report('p29_root24_high_degree_first', pTaylor.slice().reverse());
report('table_root24_low_degree_first', sTaylor);
report('table_root24_high_degree_first', sTaylor.slice().reverse());
report('p29_minus_table_root24_low_degree_first', difference);
report('p29_minus_table_root24_high_degree_first', difference.slice().reverse());
/**
 * Repeated polynomial-radix extraction is another complete source-defined
 * readout. The two individually printed factors H and G (and their literal
 * product) are the only allowed bases; no guessed digit permutations or keys.
 *
 * @param {number[]} descending
 * @param {number[]} base low-degree-first
 * @returns {number[][]} low-order polynomial-radix digits, each a degree<base polynomial
 */
function toRadixDigits(descending, base) {
  const degree = base.length - 1;
  const inverseLead = Array.from({ length: MOD - 1 }, (_, i) => i + 1)
    .find(value => residue(value * base[degree]) === 1);
  assert(inverseLead !== undefined);
  let current = descending.slice().reverse();
  while (current.length && current[current.length - 1] === 0) current.pop();
  /** @type {number[][]} */
  const digits = [];
  while (current.length) {
    const work = current.slice();
    const quotient = Array(Math.max(0, current.length - degree)).fill(0);
    for (let i = work.length - 1; i >= degree; i--) {
      const factor = residue(work[i] * inverseLead);
      quotient[i - degree] = factor;
      for (let j = 0; j <= degree; j++) {
        work[i - degree + j] = residue(
          work[i - degree + j] - factor * base[j]);
      }
    }
    digits.push(Array.from({ length: degree }, (_, i) => work[i] || 0));
    current = quotient;
    while (current.length && current[current.length - 1] === 0) {
      current.pop();
    }
  }
  return digits;
}

/**
 * Recover exactly the original high-degree-first polynomial, including its
 * source-preserved leading zero coefficients.
 *
 * @param {number[][]} digits
 * @param {number[]} base
 * @param {number} originalLength
 * @returns {number[]}
 */
function fromRadixDigits(digits, base, originalLength) {
  /** @type {number[]} */
  let coefficients = [];
  for (let i = digits.length - 1; i >= 0; i--) {
    const next = Array(coefficients.length + base.length - 1).fill(0);
    for (let j = 0; j < coefficients.length; j++) {
      for (let k = 0; k < base.length; k++) {
        next[j + k] = residue(next[j + k] + coefficients[j] * base[k]);
      }
    }
    for (let j = 0; j < digits[i].length; j++) {
      next[j] = residue(next[j] + digits[i][j]);
    }
    coefficients = next;
  }
  assert(coefficients.slice(originalLength).every(value => value === 0));
  while (coefficients.length < originalLength) coefficients.push(0);
  return coefficients.slice(0, originalLength).reverse();
}

/** @param {number[]} first @param {number[]} second @returns {number[]} */
function multiply(first, second) {
  const product = Array(first.length + second.length - 1).fill(0);
  for (let i = 0; i < first.length; i++) {
    for (let j = 0; j < second.length; j++) {
      product[i + j] = residue(product[i + j] + first[i] * second[j]);
    }
  }
  return product;
}
const H = [3, 26, 24]; // signed 2013 BASE29 3301=3QO, ascending powers
const G = [27, 5, 15]; // printed red p39 factor, with double root Ac=24
const HG = multiply(H, G);
assert.deepEqual(HG, [23, 21, 11, 17, 12]);
const differenceOriginal = Array.from({ length: p29.length }, (_, i) =>
  residue(p29[p29.length - 1 - i] -
    (i < s256.length ? s256[s256.length - 1 - i] : 0))).reverse();

for (const [sourceName, original] of [
  ['p29', p29],
  ['table', s256],
  ['p29_minus_table', differenceOriginal]
]) {
  for (const [baseName, base] of [['2013_H', H], ['p39_G', G], ['H_times_G', HG]]) {
    const digits = toRadixDigits(original, base);
    assert.deepEqual(fromRadixDigits(digits, base, original.length), original);
    if (sourceName === 'p29_minus_table' && baseName === 'p39_G') {
      assert.deepEqual(digits.slice(0, 2), [[0, 0], [2, 0]]);
    }
    if (sourceName === 'table' && baseName === 'H_times_G') {
      assert.deepEqual(digits[0], [0, 0, 0, 0]);
    }
    const decoded = digits.flat();
    report(sourceName + '_' + baseName + '_digits_low_to_high', decoded);
    report(sourceName + '_' + baseName + '_digits_high_to_low',
      digits.slice().reverse().flat());
  }
}
const planted = toRadixDigits(known, G);
assert.deepEqual(fromRadixDigits(planted, G, known.length), known);
/**
 * Original-source cross-factor DH field candidate:
 * - G-adic digit pairs of P29-S begin 0, then exactly 2 (2013 DH secret).
 * - The independent irreducible H supplies the field GF(29^2).
 * - The signed-DH-related field product beta is derived below from ORIGINAL
 *   P29/G and S/(H*G) H-residues, never fitted from the output.
 * Apply beta^(+-j) to each subsequent G-adic pair with the only two natural
 * initial exponents 0 and 1. This is a new complete reversible direct
 * readout; no LP2 plaintext is obtained. Other clocks require source clues.
 */

/**
 * Ordinary low-degree-first GF29 polynomial long division.
 *
 * @param {number[]} dividend
 * @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divideLow(dividend, divisor) {
  const degree = divisor.length - 1;
  const inv = Array.from({ length: MOD - 1 }, (_, i) => i + 1)
    .find(value => residue(value * divisor[degree]) === 1);
  assert(inv !== undefined);
  const rem = dividend.slice();
  const quotient = Array(Math.max(0, rem.length - degree)).fill(0);
  for (let j = rem.length - 1; j >= degree; j--) {
    const factor = residue(rem[j] * inv);
    quotient[j - degree] = factor;
    for (let k = 0; k <= degree; k++) {
      rem[j - degree + k] = residue(rem[j - degree + k] -
        factor * divisor[k]);
    }
  }
  return { quotient, remainder: rem.slice(0, degree) };
}

/**
 * Multiplication in GF29[X]/(H), where X^2=11X+18.
 *
 * @param {number[]} a [constant, X coefficient]
 * @param {number[]} b [constant, X coefficient]
 * @returns {number[]}
 */
function fieldMultiply(a, b) {
  return [
    residue(a[0] * b[0] + 18 * a[1] * b[1]),
    residue(a[0] * b[1] + a[1] * b[0] + 11 * a[1] * b[1]),
  ];
}

/** @param {number[]} value @param {number} exponent @returns {number[]} */
function fieldPower(value, exponent) {
  assert(Number.isInteger(exponent));
  let n = ((exponent % 70) + 70) % 70;
  let current = value;
  let acc = [1, 0];
  while (n > 0) {
    if (n & 1) acc = fieldMultiply(acc, current);
    current = fieldMultiply(current, current);
    n = Math.floor(n / 2);
  }
  return acc;
}
const pDivG = divideLow(p29.slice().reverse(), G);
const sDivHG = divideLow(s256.slice().reverse(), HG);
assert.deepEqual(pDivG.remainder, [0, 0]);
assert.deepEqual(sDivHG.remainder, [0, 0, 0, 0]);
const aH = divideLow(pDivG.quotient, H).remainder;
const bH = divideLow(sDivHG.quotient, H).remainder;
assert.deepEqual(aH, [16, 19]);
assert.deepEqual(bH, [5, 6]);
const beta = fieldMultiply(aH, bH);
assert.deepEqual(beta, [15, 24]);
assert.deepEqual(fieldPower(beta, 70), [1, 0]);
assert.notDeepEqual(fieldPower(beta, 35), [1, 0]);

const gDigits = toRadixDigits(differenceOriginal, G);
assert.deepEqual(gDigits.slice(0, 2), [[0, 0], [2, 0]]);
const gPayload = gDigits.slice(2); // R=(P-S-2G)/G^2, now in actual G radix
assert.equal(gPayload.length, 137);
for (const sign of [-1, 1]) {
  for (const start of [0, 1]) {
    const decoded = gPayload.map((pair, i) =>
      fieldMultiply(pair, fieldPower(beta, sign * (i + start))));
    const reencryption = decoded.map((pair, i) =>
      fieldMultiply(pair, fieldPower(beta, -sign * (i + start))));
    assert.deepEqual(reencryption, gPayload);
    const symbols = decoded.flat();
    report('g_adic_H_field_DH_beta_sign_' + sign + '_phase_' + start,
      symbols);
    report('g_adic_H_field_DH_beta_reversed_sign_' + sign +
      '_phase_' + start, symbols.slice().reverse());
  }
}

// Source-native full inverse plant under the exact same G-adic/H-field clock.
const knownEven = known.length % 2 === 0 ? known.slice() : [...known, 0];
const knownPairs = Array.from({ length: knownEven.length / 2 }, (_, i) =>
  knownEven.slice(2 * i, 2 * i + 2));
const secretPlant = knownPairs.map((pair, i) =>
  fieldMultiply(pair, fieldPower(beta, -(i + 1))));
assert.deepEqual(secretPlant.map((pair, i) =>
  fieldMultiply(pair, fieldPower(beta, i + 1))), knownPairs);
/**
 * The exact signed 2013 BASE29 test supplies integer 3301, and the same
 * signed 2013 worked example explicitly demonstrates DH exponentiation.
 * This narrow source-derived exponent candidate is a unit-power bijection
 * in GF(29^2); 3301 mod 840 = 781 and gcd(781,840)=1. The inverse exponent
 * is 541. Apply it to the same 137 unfitted G-adic pair symbols, without
 * searching alternate exponents, keys or alphabet permutations.
 */
const SOURCE_EXPONENT = 3301;
const INVERSE_EXPONENT = 541;
assert.equal((SOURCE_EXPONENT * INVERSE_EXPONENT) % 840, 1);
/** @param {number[]} value @param {number} exponent @returns {number[]} */
function fieldPowerFull(value, exponent) {
  let n = exponent;
  let acc = [1, 0];
  let base = value;
  while (n > 0) {
    if (n & 1) acc = fieldMultiply(acc, base);
    base = fieldMultiply(base, base);
    n = Math.floor(n / 2);
  }
  return acc;
}
for (const exponent of [SOURCE_EXPONENT, INVERSE_EXPONENT]) {
  const powered = gPayload.map(pair => fieldPowerFull(pair, exponent));
  const restored = powered.map(pair => fieldPowerFull(pair,
    exponent === SOURCE_EXPONENT ? INVERSE_EXPONENT : SOURCE_EXPONENT));
  assert.deepEqual(restored, gPayload);
  report('g_adic_GF841_field_power_' + exponent, powered.flat());
}
process.stdout.write(
  'All GF29 polynomial, G-adic/DH and BASE29 exponent inverses passed.\n');
