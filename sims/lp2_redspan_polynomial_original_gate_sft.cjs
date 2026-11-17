'use strict';

// Original-input SFT: source-visible red rune spans as GF(29) polynomial divisors.
// Read-only. Run from any directory with Node.js 22.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));
const runeToGP = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} a @returns {number} */
function inv29(a) {
  assert.ok(a > 0 && a < 29, 'nonzero field coefficient');
  for (let i = 1; i < 29; i++) if ((a * i) % 29 === 1) return i;
  throw new Error('not invertible mod 29');
}

/**
 * Divide high-degree-first GF(29) coefficient arrays.
 * @param {number[]} dividend
 * @param {number[]} divisor
 * @returns {{quotient: number[], remainder: number[]}}
 */
function divide(dividend, divisor) {
  assert.ok(dividend.length >= divisor.length && divisor.length >= 2);
  const work = dividend.slice();
  const quotient = [];
  const scale = inv29(divisor[0]);
  const limit = dividend.length - divisor.length;
  for (let i = 0; i <= limit; i++) {
    const q = mod(work[i] * scale);
    quotient.push(q);
    for (let j = 0; j < divisor.length; j++) {
      work[i + j] = mod(work[i + j] - q * divisor[j]);
    }
    assert.equal(work[i], 0);
  }
  return { quotient, remainder: work.slice(limit + 1) };
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const n = symbols.length;
  const freq = Array(29).fill(0);
  for (const x of symbols) freq[x]++;
  return freq.reduce((sum, f) => sum + f * (f - 1), 0) / (n * (n - 1));
}

const unknownPages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
assert.equal(unknownPages.length, 55);
assert.equal(unknownPages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const red = ink.pages.flatMap((p) => (p.red_spans ?? []).map((s, i) => {
  const indexes = Array.from(s.runes, (r) => runeToGP.get(r));
  assert.equal(indexes.length, s.length);
  assert.ok(indexes.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  return { page: p.page, span: i, indices: indexes };
}));
assert.equal(red.length, 18);

console.log('Original GP29, 55 unsolved rune-bearing pages, 12,956 runes; 18 source red-ink spans.');
console.log('Frozen coefficient convention: red heading in ascending powers, target page in descending powers.');
const hits = [];
for (const r of red) {
  const factor = r.indices.slice().reverse();
  for (const p of unknownPages) {
    const { remainder } = divide(p.indices, factor);
    if (remainder.every((x) => x === 0)) {
      hits.push({ redPage: r.page, span: r.span, target: p.page, length: factor.length });
    }
  }
}
assert.deepEqual(hits, [{ redPage: 39, span: 0, target: 29, length: 3 }]);
console.log('All 18 x 55 original-page red-polynomial tests:', JSON.stringify(hits));

const factor = red.find((r) => r.page === 39).indices.slice().reverse();
assert.deepEqual(factor, [15, 5, 27]);
const original = corpus.pages[29].indices;
const { quotient, remainder } = divide(original, factor);
assert.equal(quotient.length, 275);
assert.deepEqual(remainder, [0, 0]);
assert.deepEqual(multiply(quotient, factor), original);
console.log('p29 / original p39 red polynomial: exact 275-rune quotient; exact original reconstruction.');
console.log('p29 IoC:', ioc(original).toFixed(11), 'quotient IoC:', ioc(quotient).toFixed(11));
console.log('Quotient first 60 GP symbols:', quotient.slice(0, 60).map((x) => corpus.translit[x]).join(''));

// Test the more natural instruction: chapter heading polynomial divides its own
// following body, stopping at the next major source-red chapter boundary.
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const bodyTests = [];
for (const [start, end] of chapters) {
  const heading = red.find((r) => r.page === start && r.span === 0);
  assert.ok(heading, 'must have source-red chapter heading');
  const tape = corpus.pages.filter((p) => p.page >= start && p.page <= end)
    .flatMap((p) => p.indices);
  const body = tape.slice(heading.indices.length);
  const result = divide(body, heading.indices.slice().reverse());
  bodyTests.push({ start, end, bodyLen: body.length,
    nonzeroRemainder: result.remainder.filter((x) => x !== 0).length });
}
assert.ok(bodyTests.every((t) => t.nonzeroRemainder > 0));
console.log('Nine original chapter-heading -> following-body division gates:');
for (const result of bodyTests) console.log(JSON.stringify(result));

// Positive control: if a source GP plaintext were multiplied by G(x), this
// exact decoder would recover it, unlike the actual original p29 quotient.
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const planted = Array.from({ length: 275 }, (_, i) => solved[i % solved.length]);
const encoded = multiply(planted, factor);
assert.deepEqual(divide(encoded, factor), { quotient: planted, remainder: [0, 0] });
assert.notDeepEqual(quotient, planted);
console.log('Source-native p57 275-rune plant: exact recovered symbols 275/275.');
console.log('PASS: bounded source-red polynomial division; no unknown plaintext recovered.');
