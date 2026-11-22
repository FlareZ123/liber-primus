'use strict';
/**
 * Original LP2 256-cell base60 case-toggle and p39 GP29 double-root gate.
 * Source: unchanged printed-table transcription, source scans 66–68.jpg,
 * and the five explicitly modeled alternative glyph readings.
 *
 * The variants are transcription alternatives, NOT proven visual corrections.
 * Read-only single runnable file (Node.js 22 / CommonJS on Windows 11).
 * Run: node sims/lp2_p50_case_toggle_double_root_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name */
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const grid = read('resources/liber-primus/base60-grid.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
assert.equal(digits.length, 60);
assert.equal(grid.alphabet, digits);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);

/** @param {number} value */
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {string} token */
function decode(token) {
  assert.equal(token.length, 2);
  const a = digits.indexOf(token[0]);
  const b = digits.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  const value = 60 * a + b;
  assert.ok(value >= 0 && value <= 255);
  return value;
}

/** Simultaneous Horner polynomial and formal derivative over GF(29).
 * @param {number[]} coefficients
 * @param {number} x
 */
function evaluate(coefficients, x) {
  let value = 0;
  let derivative = 0;
  for (const coefficient of coefficients) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + coefficient);
  }
  return {value, derivative};
}

// The selector itself is independently printed, albeit a hypothetical
// cross-page operator: p39 red 27+5X+15X^2 = 15(X-24)^2 over GF(29).
const red = ink.pages.find((page) => page.page === 39)
  .red_spans.find((span) => span.length === 3);
const gpIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.deepEqual([...red.runes].map((rune) => gpIndex.get(rune)), [27, 5, 15]);
assert.equal(corpus.pages[54].indices[0], 24);
for (let x = 0; x < 29; x++)
  assert.equal(mod(27 + 5 * x + 15 * x * x), mod(15 * (x - 24) ** 2));

const original = tokens.map(decode);
assert.deepEqual(original, grid.byte_rows.flat());
assert.deepEqual(evaluate(original, 24), {value: 0, derivative: 0});

// Five previously explored ambiguous-glyph readings in the manuscript's
// canonical table, not assertions about what its pixels conclusively depict.
const alternatives = [
  {index: 45, old: '1l', replacement: '1L'},
  {index: 50, old: '0l', replacement: '0L'},
  {index: 165, old: '0I', replacement: '0l'},
  {index: 172, old: '2S', replacement: '2s'},
  {index: 246, old: '3I', replacement: '3i'}
];
for (const edit of alternatives)
  assert.equal(tokens[edit.index], edit.old);
/**
 * Remainder of descending coefficients by an ascending GP29 polynomial.
 * @param {number[]} coefficients
 * @param {number[]} divisor
 */
function remainder(coefficients, divisor) {
  const values = coefficients.slice().reverse().map(mod);
  const inverse = Array.from({length:29}, (_, v) => v)
    .find((v) => mod(v * divisor.at(-1)) === 1);
  assert.ok(inverse > 0);
  for (let index = values.length - 1; index >= divisor.length - 1; index--) {
    const factor = mod(values[index] * inverse);
    for (let j = 0; j < divisor.length; j++) {
      const at = index - divisor.length + 1 + j;
      values[at] = mod(values[at] - factor * divisor[j]);
    }
  }
  return values.slice(0, divisor.length - 1);
}
assert.deepEqual(remainder(original, [3, 26, 24]), [0, 0]);
assert.deepEqual(remainder(original, [27, 5, 15]), [0, 0]);
const factors = [];
const rows = [];
for (let mask = 0; mask < (1 << alternatives.length); mask++) {
  const bytes = original.slice();
  for (let i = 0; i < alternatives.length; i++) {
    if (mask & (1 << i)) {
      const edit = alternatives[i];
      bytes[edit.index] = decode(edit.replacement);
    }
  }
  const result = evaluate(bytes, 24);
  rows.push({mask, ...result});
  factors.push({
    mask,
    historicalBase29: remainder(bytes, [3, 26, 24]),
    originalRedTriad: remainder(bytes, [27, 5, 15])
  });
}
const surviving = rows.filter((row) => row.value === 0 && row.derivative === 0)
  .map((row) => row.mask);
assert.deepEqual(surviving, [0, 4]);
assert.deepEqual(rows.filter((row) => row.mask === 31), [
  {mask: 31, value: 21, derivative: 5}
]);
const individual = [1, 2, 4, 8, 16].map((mask) =>
  rows.find((row) => row.mask === mask));
assert.deepEqual(individual, [
  {mask: 1, value: 3, derivative: 19},
  {mask: 2, value: 17, derivative: 28},
  {mask: 4, value: 0, derivative: 0},
  {mask: 8, value: 18, derivative: 26},
  {mask: 16, value: 12, derivative: 19}
]);
assert.deepEqual(
  factors.filter((item) => item.historicalBase29.every((v) => v === 0) &&
    item.originalRedTriad.every((v) => v === 0)).map((item) => item.mask),
  [0, 4]
);
assert.deepEqual(factors[31], {
  mask: 31, historicalBase29: [8, 12], originalRedTriad: [17, 5]
});
assert.equal(decode('0l') - decode('0I'), 29);
console.log(JSON.stringify({
  sourceScans: ['66.jpg', '67.jpg', '68.jpg'],
  tableCells: 256,
  fixedGF29Point: 24,
  original: rows[0],
  independentCaseToggleEffects: individual,
  fiveToggleVariant: rows[31],
  testedCaseAssignments: rows.length,
  doubleRootPreservingAssignments: surviving,
  dualSourceQuadraticPreservingAssignments:
    factors.filter((item) => item.historicalBase29.every((v) => v === 0) &&
      item.originalRedTriad.every((v) => v === 0)).map((item) => item.mask),
  bothFactorRemaindersIfAllFiveChanged: factors[31],
  conclusion: 'Four of five case alternatives affect the exact double root; index165 differs by a multiple of29. Conditional clue checksum only. No LP2 unknown plaintext or key.'
}, null, 2));
