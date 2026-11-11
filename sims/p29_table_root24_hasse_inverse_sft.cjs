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
process.stdout.write('All exact GF29 inverse, source-size, derivative, and plant assertions passed.\n');
