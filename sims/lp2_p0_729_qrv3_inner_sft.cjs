'use strict';

/**
 * SFT: source-first QR version-3 function-pattern gate for original LP2 pp0–2.
 * Requires Node.js 22; read-only; no optional dependencies.
 *
 * Tests 16 geometric/read orientations and ALL possible static assignments
 * of the 29 GP rune values to QR binary modules without enumerating 2^29.
 * Format/mask/data/ECC cells are excluded from the 199 fixed-source tests.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
assert.equal(source.runes.length, 29);
const pages = source.pages.slice(0, 3);
assert.deepEqual(pages.map(p => [p.page, p.indices.length]), [
  [0, 262], [1, 266], [2, 201]
]);
const original = pages.flatMap(page => page.indices);
assert.equal(original.length, 729);

/**
 * Public QR version-3 fixed module patterns in full 29x29 coordinates:
 * three 7x7 finders plus 1-module separators, timing on row/col 6,
 * bottom-right 5x5 alignment centered at (22,22), fixed dark at (21,8).
 * Format and all variable modules return null.
 * @param {number} row
 * @param {number} col
 * @returns {0 | 1 | null}
 */
function fixedQrModule(row, col) {
  const finderOrigins = [[0, 0], [0, 22], [22, 0]];
  for (const [r0, c0] of finderOrigins) {
    const y = row - r0;
    const x = col - c0;
    if (y >= 0 && y <= 6 && x >= 0 && x <= 6) {
      return y === 0 || y === 6 || x === 0 || x === 6 ||
        (y >= 2 && y <= 4 && x >= 2 && x <= 4) ? 1 : 0;
    }
  }
  for (const [r0, c0] of finderOrigins) {
    const y = row - r0;
    const x = col - c0;
    if (y >= -1 && y <= 7 && x >= -1 && x <= 7) return 0;
  }
  if (row === 6 && col >= 8 && col <= 20) return col % 2 === 0 ? 1 : 0;
  if (col === 6 && row >= 8 && row <= 20) return row % 2 === 0 ? 1 : 0;
  if (row >= 20 && row <= 24 && col >= 20 && col <= 24) {
    const y = row - 20;
    const x = col - 20;
    return y === 0 || y === 4 || x === 0 || x === 4 ||
      (y === 2 && x === 2) ? 1 : 0;
  }
  if (row === 21 && col === 8) return 1;
  return null;
}

/** @type {{row: number, col: number, bit: 0 | 1}[]} */
const tests = [];
const categoryCount = {finder: 0, separator: 0, timing: 0, alignment: 0, dark: 0};
for (let row = 0; row < 27; row++) {
  for (let col = 0; col < 27; col++) {
    const r = row + 1;
    const c = col + 1;
    const bit = fixedQrModule(r, c);
    if (bit === null) continue;
    tests.push({row, col, bit});
    const inBox = (r0, c0, width) =>
      r >= r0 && r < r0 + width && c >= c0 && c < c0 + width;
    const origin = [[0, 0], [0, 22], [22, 0]];
    if (origin.some(([r0, c0]) => inBox(r0, c0, 7))) {
      categoryCount.finder++;
    } else if (origin.some(([r0, c0]) => r >= r0 - 1 && r <= r0 + 7 &&
      c >= c0 - 1 && c <= c0 + 7)) {
      categoryCount.separator++;
    } else if (r === 6 || c === 6) {
      categoryCount.timing++;
    } else if (inBox(20, 20, 5)) {
      categoryCount.alignment++;
    } else {
      categoryCount.dark++;
    }
  }
}
assert.deepEqual(categoryCount, {
  finder: 108, separator: 39, timing: 26, alignment: 25, dark: 1
});
assert.equal(tests.length, 199);

/**
 * One of 8 dihedral symmetry transforms of 27x27, row-major index.
 * @param {number} row
 * @param {number} col
 * @param {number} rotation
 * @param {number} mirrored
 * @returns {number}
 */
function transformedIndex(row, col, rotation, mirrored) {
  let x = mirrored ? 26 - col : col;
  let y = row;
  for (let n = 0; n < rotation; n++) {
    const nextY = 26 - x;
    x = y;
    y = nextY;
  }
  return y * 27 + x;
}

/**
 * Exact all-secret minimum for each position-independent GP29->bit function.
 * Each rune has an unrestricted private bit. Its best bit is the majority
 * of source fixed-pattern targets where that rune appears.
 * @param {number[]} tape
 * @param {number} rotation
 * @param {number} mirrored
 * @param {number} reversed
 * @returns {{errors:number, constrained:number, assignment:number[]}}
 */
function exactBestStaticRuneBinary(tape, rotation, mirrored, reversed) {
  /** @type {number[][]} */
  const counts = Array.from({length: 29}, () => [0, 0]);
  for (const {row, col, bit} of tests) {
    const pos = transformedIndex(row, col, rotation, mirrored);
    const rune = tape[reversed ? 728 - pos : pos];
    assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);
    counts[rune][bit]++;
  }
  const assignment = counts.map(([n0, n1]) => n1 > n0 ? 1 : 0);
  const errors = counts.reduce((sum, [n0, n1]) => sum + Math.min(n0, n1), 0);
  const constrained = counts.reduce((sum, [n0, n1]) => sum + n0 + n1, 0);
  return {errors, constrained, assignment};
}

/** @param {number[]} tape */
function allReadOrders(tape) {
  const results = [];
  for (let reversed = 0; reversed < 2; reversed++) {
    for (let mirrored = 0; mirrored < 2; mirrored++) {
      for (let rotation = 0; rotation < 4; rotation++) {
        const result = exactBestStaticRuneBinary(tape, rotation, mirrored, reversed);
        results.push({reversed, mirrored, rotation, ...result});
      }
    }
  }
  return results;
}
const originalResults = allReadOrders(original);
assert.equal(originalResults.length, 16);
const errors = originalResults.map(x => x.errors);
assert.equal(Math.min(...errors), 69);
assert.equal(Math.max(...errors), 75);
assert.ok(originalResults.every(x => x.constrained === 199 && x.errors >= 69));

/**
 * Context source carries the original punctuation, word beginnings and
 * physical page breaks without modifying/reordering a single rune sign.
 * A separate bit for every (rune, context) is permitted. This exactly
 * includes all 2^(29*stateCount) private context-specific palettes.
 */
const transcription = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const sourceRuneMap = new Map(source.runes.map((glyph, i) => [glyph, i]));
const textPages = transcription.split('%').slice(0, 3);
const parsed = [], precedingPeriod = [], atWordStart = [], physicalPage = [];
let period = 0;
let wordInitial = 1;
for (let p = 0; p < textPages.length; p++) {
  for (const glyph of textPages[p]) {
    if (sourceRuneMap.has(glyph)) {
      parsed.push(sourceRuneMap.get(glyph));
      precedingPeriod.push(period);
      atWordStart.push(wordInitial);
      physicalPage.push(p);
      wordInitial = 0;
    } else if (glyph === '-' || glyph === '.') {
      period = Number(glyph === '.');
      wordInitial = 1;
    }
  }
}
assert.deepEqual(parsed, original);
assert.equal(precedingPeriod.reduce((a, b) => a + b, 0), 27);
assert.equal(atWordStart.reduce((a, b) => a + b, 0), 158);

/**
 * Exact minimum mismatch after optimizing each rune-context output bit.
 * @param {number[]} context
 * @param {number} stateCount
 * @param {number} rotation
 * @param {number} mirrored
 * @param {number} reversed
 * @returns {number}
 */
function bestContextPalette(context, stateCount, rotation, mirrored, reversed) {
  const counts = Array.from({length: stateCount * 29}, () => [0, 0]);
  for (const {row, col, bit} of tests) {
    const pos = transformedIndex(row, col, rotation, mirrored);
    const i = reversed ? 728 - pos : pos;
    counts[29 * context[i] + original[i]][bit]++;
  }
  return counts.reduce((sum, row) => sum + Math.min(row[0], row[1]), 0);
}
const contextModels = [
  ['preceding-period', precedingPeriod, 2, 68, 73],
  ['word-start', atWordStart, 2, 56, 63],
  ['period-by-word-start',
    precedingPeriod.map((x, i) => x * 2 + atWordStart[i]), 4, 54, 62],
  ['physical-page', physicalPage, 3, 59, 64],
  ['page-by-period',
    physicalPage.map((x, i) => x * 2 + precedingPeriod[i]), 6, 56, 62],
  ['page-by-word-start',
    physicalPage.map((x, i) => x * 2 + atWordStart[i]), 6, 43, 49]
];
for (const [label, state, size, min, max] of contextModels) {
  const errors = [];
  for (let reversed = 0; reversed < 2; reversed++) {
    for (let mirrored = 0; mirrored < 2; mirrored++) {
      for (let rotation = 0; rotation < 4; rotation++) {
        errors.push(bestContextPalette(state, size, rotation, mirrored, reversed));
      }
    }
  }
  assert.equal(Math.min(...errors), min, label + ' min');
  assert.equal(Math.max(...errors), max, label + ' max');
}

// Full-size exact positive under a secret, deliberately arbitrary rune->bit map.
// Every version-3 fixed QR function position receives a rune with the required
// bit. The free QR data/format positions are unconstrained for this diagnostic.
const planted = Array.from({length: 729}, (_, i) => i % 29);
const privateMap = Array.from({length: 29}, (_, r) => (r * 17 + 3) % 2);
for (const {row, col, bit} of tests) {
  const i = row * 27 + col;
  planted[i] = (row * 27 + col) % 14 * 2 + (bit ^ 1);
  assert.equal(privateMap[planted[i]], bit);
}
const plantedFit = exactBestStaticRuneBinary(planted, 0, 0, 0);
assert.equal(plantedFit.errors, 0);
assert.equal(plantedFit.constrained, 199);

// A known wrong private binary assignment need not fit a legitimate plant.
const flippedMismatches = tests.filter(({row, col, bit}) => {
  const rune = planted[row * 27 + col];
  return (1 - privateMap[rune]) !== bit;
}).length;
assert.equal(flippedMismatches, 199);

console.log(JSON.stringify({
  sourcePages: pages.map(p => p.page),
  originalRunes: original.length,
  qrVersion: 3,
  qrSize: 29,
  interior: [27, 27],
  fixedFunctionModules: tests.length,
  breakdown: categoryCount,
  originalOrientations: originalResults.map(
    ({reversed, mirrored, rotation, errors}) =>
      ({reversed, mirrored, rotation, errors})
  ),
  globalBestOriginalErrors: Math.min(...errors),
  sourceNativeSyntheticPositiveErrors: plantedFit.errors,
  wrongSecretMapErrors: flippedMismatches,
  conclusion: 'A static GP29-symbol-to-binary QRv3 interior cannot reproduce all original function modules.'
}, null, 2));
