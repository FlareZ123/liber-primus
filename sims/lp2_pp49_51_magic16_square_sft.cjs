'use strict';

/**
 * Original LP2 pp49–51 order-16 magic-square gate.
 * Run: node sims/lp2_pp49_51_magic16_square_sft.cjs
 *
 * Tests the unique source-physical page-major row-major 256-cell sequence
 * reshaped to 16x16. No search, transposition, rotation or fitted keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

/** @param {string} relativePath @returns {string} */
function source(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

/** @param {number[][]} square */
function invariants(square) {
  const n = square.length;
  assert.ok(n > 0);
  for (const row of square) {
    assert.equal(row.length, n);
    for (const value of row) assert.ok(Number.isInteger(value));
  }

  const rows = square.map(row => row.reduce((sum, value) => sum + value, 0));
  const cols = Array.from(
    {length: n},
    (_, col) => square.reduce((sum, row) => sum + row[col], 0),
  );
  const diagonals = [
    square.reduce((sum, row, idx) => sum + row[idx], 0),
    square.reduce((sum, row, idx) => sum + row[n - idx - 1], 0),
  ];
  const total = rows.reduce((sum, value) => sum + value, 0);
  const constant = total / n;
  const isMagic = [...rows, ...cols, ...diagonals]
    .every(value => value === constant);
  return {rows, cols, diagonals, total, constant, isMagic};
}

/**
 * @param {string[]} tokens
 * @param {string} alphabet
 * @returns {number[][]}
 */
function reshape(tokens, alphabet) {
  assert.equal(tokens.length, 256);
  const radix = alphabet.length;
  const values = tokens.map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, 'unexpected digit ' + token);
    return radix * hi + lo;
  });
  return Array.from({length: 16}, (_, idx) => values.slice(16 * idx, 16 * (idx + 1)));
}

/** @param {string} sourceText @returns {number[][][]} */
function readHistoricalSquares(sourceText) {
  return sourceText.trim().split(/\r?\n\s*\r?\n/).map(block =>
    block.trim().split(/\r?\n/).map(line =>
      line.trim().split(/\s+/).map(Number),
    ),
  );
}

const original = JSON.parse(source('resources/liber-primus/base60-grid.json'));
const independent = JSON.parse(source('resources/liber-primus/lp2-grid-256.json'));
const expectedPages = [10, 13, 9];
assert.deepEqual(original.page_row_counts, expectedPages);
assert.deepEqual(original.lp2_pages, [49, 50, 51]);
assert.equal(original.rows.length, 32);
for (const row of original.rows) assert.equal(row.length, 8);
assert.equal(original.rows.flat().length, 256);

const tokens = original.rows.flat();
assert.deepEqual(
  tokens,
  independent.pages.flatMap(page => page.tokens),
  'two canonical transcripts must agree in original printed order',
);
assert.deepEqual(
  original.byte_rows.flat(),
  independent.pages.flatMap(page => page.bytes),
  'derived canonical base60 bytes must agree',
);

const archive = JSON.parse(
  source('resources/external/cicada2014-onion6-magic-form-and-response.json'),
);
const html = archive.files[0].raw_html;
assert.ok(html.includes('Order 5 Square, 3301'));
assert.ok(html.includes('Order 7 Square, 1033'));
assert.ok(html.includes('Order 5 Square, 1033'));

const historical = readHistoricalSquares(
  source('resources/cicada2014-openpuff-magic-squares.txt'),
);
assert.deepEqual(historical.map(square => square.length), [5, 7, 5]);
assert.deepEqual(historical.map(square => invariants(square).constant), [3301, 1033, 1033]);
assert.ok(historical.every(square => invariants(square).isMagic));
console.log('PASS: three 2014 historical magic-square positive controls (5/7/5; constants 3301/1033/1033).');
console.log('PASS: 256 original tokens across 10+13+9 printed 8-column rows; two canonical transcripts agree.');

/**
 * Any two-character positional reading with this fixed ordered alphabet
 * has cell value radix * index(high digit) + index(low digit).
 * The first three 16-cell row sums already force incompatible radices.
 * @param {string} alphabet
 */
function firstThreeRowCoefficients(alphabet) {
  return Array.from({length: 3}, (_, row) => {
    const cells = tokens.slice(16 * row, 16 * row + 16);
    return [
      cells.reduce((sum, t) => sum + alphabet.indexOf(t[0]), 0),
      cells.reduce((sum, t) => sum + alphabet.indexOf(t[1]), 0),
    ];
  });
}
const base60Coeffs = firstThreeRowCoefficients(original.alphabet);
const base59Coeffs = firstThreeRowCoefficients(original.alphabet.replace('f', ''));
assert.deepEqual(base60Coeffs, [[40, 395], [22, 431], [19, 474]]);
assert.deepEqual(base59Coeffs, [[40, 391], [22, 427], [19, 469]]);
const tieR12 = 36 / 18;
const tieR13Base60 = 79 / 21;
const tieR13Base59 = 78 / 21;
assert.notEqual(tieR12, tieR13Base60);
assert.notEqual(tieR12, tieR13Base59);
console.log('PASS: no radix solves first-three-row equal sums for either fixed digit alphabet: ' +
  'r=' + tieR12 + ' from rows 1/2, vs r=' + tieR13Base60 +
  ' (base60 digit order) or r=' + tieR13Base59 + ' (base59 digit order) from rows 1/3.');

const base60 = invariants(reshape(tokens, original.alphabet));
assert.deepEqual(
  reshape(tokens, original.alphabet).flat(),
  original.byte_rows.flat(),
);
const base59alphabet = original.alphabet.replace('f', '');
assert.equal(base59alphabet.length, 59);
const base59 = invariants(reshape(tokens, base59alphabet));

assert.deepEqual(base60.rows, [
  2795, 1751, 1614, 1932, 2154, 2060, 1807, 1912,
  2127, 2552, 2613, 1956, 1725, 1734, 2107, 2167,
]);
assert.deepEqual(base60.cols, [
  2314, 2429, 1737, 2146, 1924, 1820, 2134, 2105,
  2154, 2479, 2268, 1625, 2263, 1607, 2228, 1773,
]);
assert.deepEqual(base60.diagonals, [1937, 1823]);
assert.equal(base60.total, 33006);
assert.deepEqual(base59.diagonals, [1909, 1795]);
assert.equal(base59.total, 32499);

for (const [name, output] of [['base60', base60], ['base59', base59]]) {
  assert.equal(output.isMagic, false, name + ' cannot be a magic square');
  assert.equal(new Set(output.rows).size, 16);
  assert.equal(new Set(output.cols).size, 16);
  console.log('\n' + name + ': ' + JSON.stringify(output));
}
console.log('\nPASS: fixed source-physical order-16 reshape is not a magic square in either candidate register.');
