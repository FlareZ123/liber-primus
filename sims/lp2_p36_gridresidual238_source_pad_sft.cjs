'use strict';

/**
 * Original-source single-file test: test whether the 238 coefficients of the
 * 256-cell table's unique degree-238 GF(29) factor directly key p36.
 *
 * Execute under Node.js 22 from the repository root. Uses only built-in APIs.
 * This is a source-led candidate test, not a claimed historical cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(process.cwd(), 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(base, 'lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const source = corpus.pages.find(page => page.page === 36).indices;
const natural = corpus.pages.find(page => page.page === 57).indices;
const mod = value => ((value % 29) + 29) % 29;
const inverse = value => {
  for (let n = 1; n < 29; n++) {
    if (mod(n * value) === 1) return n;
  }
  throw new Error('Noninvertible GF29 element');
};

/** Exact low-first polynomial long division in GF(29). */
function divide(poly, factor) {
  const remainder = poly.slice();
  const quotient = Array(poly.length - factor.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i--) {
    const scale = mod(remainder[i + factor.length - 1] * inverse(factor.at(-1)));
    quotient[i] = scale;
    for (let j = 0; j < factor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - scale * factor[j]);
    }
  }
  assert(remainder.slice(0, factor.length - 1).every(value => value === 0));
  return quotient;
}

/** Unbiased finite-sample index of coincidence. */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

assert.equal(grid.bytes.length, 256);
assert.equal(source.length, 238);
assert.equal(natural.length, 95);
const table = grid.bytes.slice().reverse().map(value => mod(value));
assert.equal(table.at(-1), 0);
table.pop();
let quotient = table;
const smallFactors = [
  [25, 10, 1],                         // (X+5)^2, red p39
  [11, 18, 1],                         // X^2+18X+11, 2013 BASE29
  [24, 16, 14, 1],                     // cubic
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1] // degree nine
];
for (const factor of smallFactors) quotient = divide(quotient, factor);
assert.equal(quotient.length, 239);
assert.equal(quotient.at(-1), 28);
const raw = quotient.slice(0, 238);
const monic = raw.map(value => mod(value * 28));
assert.deepEqual(raw.slice(0, 10), [24, 20, 11, 24, 14, 21, 18, 26, 10, 8]);
assert.deepEqual(monic.slice(0, 10), [5, 9, 18, 5, 15, 8, 11, 3, 19, 21]);

const report = [];
for (const [normalization, originalKey] of [['raw', raw], ['monic', monic]]) {
  for (const reversed of [false, true]) {
    const key = reversed ? originalKey.slice().reverse() : originalKey;
    for (const sign of [-1, 1]) {
      const plaintext = source.map((cipher, index) => mod(cipher + sign * key[index]));
      const reencryption = plaintext.map((value, index) => mod(value - sign * key[index]));
      assert.deepEqual(reencryption, source);
      const planted = Array.from({ length: 238 }, (_, index) => natural[index % natural.length]);
      const encoded = planted.map((value, index) => mod(value - sign * key[index]));
      const recovered = encoded.map((value, index) => mod(value + sign * key[index]));
      assert.deepEqual(recovered, planted);
      report.push({
        normalization, reversed, sign, ioc: Number(ioc(plaintext).toFixed(12)),
        first80: plaintext.slice(0, 80).map(value => corpus.translit[value]).join('')
      });
    }
  }
}
assert.equal(report.length, 8);
assert(Math.max(...report.map(item => item.ioc)) < 0.038);
assert(Math.abs(ioc(source) - 0.03598907917597419) < 1e-12);
console.log(JSON.stringify({
  physical_page: 36, original_runes: source.length,
  source_polynomial_degree: 254, residual_degree: 238,
  raw_source_ioc: Number(ioc(source).toFixed(12)),
  tested: report.length, result: 'NO DIRECT SOURCE-COEFFICIENT PROSE',
  variants: report, native_gp_positive: '8/8 exact 238/238 source-derived plant roundtrips'
}, null, 2));
