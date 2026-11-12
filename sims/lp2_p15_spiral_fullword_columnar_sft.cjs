'use strict';

/**
 * One source-frozen 181x16 whole-word columnar inverse from the physical LP2
 * p15 Fibonacci-prime spiral, plus exact planted GP Latin controls.
 * Run: node sims/lp2_p15_spiral_fullword_columnar_sft.cjs
 * Inputs: the canonical master transcription and independently pinned
 *         Latin Vulgate GP word corpus. No network or file writes.
 *
 * @module lp2_p15_spiral_fullword_columnar_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const RUNES = new Set([...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ']);
const SOURCE_GRID = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const SOURCE_SPIRAL = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const ORDER = SOURCE_SPIRAL.map((value) => SOURCE_GRID.flat().indexOf(value));
assert.deepEqual(ORDER, [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12]);
assert.equal(new Set(ORDER).size, 16);
const COLS = 16;
const ROWS = 181;
const COUNT = ROWS * COLS;

/** @param {string} master @returns {string[]} */
function originalWords(master) {
  const start = master.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ');
  assert.ok(start >= 0);
  const allPages = master.slice(start).split('%');
  assert.equal(allPages.length, 59);
  const text = allPages.slice(0, 56).join('%');
  const words = text.split(/[-.&$§]/)
    .map((part) => [...part].filter((ch) => RUNES.has(ch)).join(''))
    .filter(Boolean);
  assert.equal(words.length, COUNT);
  assert.equal(words.reduce((total, word) => total + word.length, 0), 12956);
  return words;
}

/**
 * @param {number[]} items
 * @param {number[]} order
 * @param {'column-into-row'|'row-into-column'} mode
 * @returns {number[]}
 */
function transform(items, order, mode) {
  assert.equal(items.length, COUNT);
  const out = Array(COUNT);
  for (let column = 0; column < COLS; column++) {
    for (let row = 0; row < ROWS; row++) {
      const linear = row * COLS + order[column];
      const separated = column * ROWS + row;
      if (mode === 'column-into-row') out[linear] = items[separated];
      else out[separated] = items[linear];
    }
  }
  return out;
}

/**
 * @param {number[]} items
 * @returns {number}
 */
function lengthChiSquare(items) {
  const contingency = Array(9).fill(0);
  const rowTotals = [0, 0, 0];
  const colTotals = [0, 0, 0];
  /** @param {number} length @returns {number} */
  const category = (length) => length <= 2 ? 0 : length <= 5 ? 1 : 2;
  for (let i = 1; i < items.length; i++) {
    const before = category(items[i - 1]);
    const after = category(items[i]);
    contingency[3 * before + after]++;
    rowTotals[before]++;
    colTotals[after]++;
  }
  let chisq = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const expected = rowTotals[row] * colTotals[col] / (items.length - 1);
      chisq += (contingency[3 * row + col] - expected) ** 2 / expected;
    }
  }
  return chisq;
}

const master = fs.readFileSync(
  path.join(ROOT, 'resources', 'transcriptions', 'liber_primus_master.txt'),
  'utf8'
);
const source = originalWords(master).map((word) => word.length);
const latin = fs.readFileSync(
  path.join(ROOT, 'resources', 'control', 'latin-vulgate-gp-wholewords.txt'),
  'utf8'
).split(/\r?\n/).filter((line) => /^[0-9A-S]+$/.test(line));
assert.equal(latin.length, 39835);
const control = latin.slice(11000, 11000 + COUNT).map((word) => word.length);
assert.equal(control.length, COUNT);
const controlCipherA = transform(control, ORDER, 'row-into-column');
const controlCipherB = transform(control, ORDER, 'column-into-row');
assert.deepEqual(transform(controlCipherA, ORDER, 'column-into-row'), control);
assert.deepEqual(transform(controlCipherB, ORDER, 'row-into-column'), control);

const decodeA = lengthChiSquare(transform(source, ORDER, 'column-into-row'));
const decodeB = lengthChiSquare(transform(source, ORDER, 'row-into-column'));
assert.ok(Math.abs(lengthChiSquare(source) - 3.949446088360591) < 1e-10);
assert.ok(Math.abs(decodeA - 5.821169872771485) < 1e-10);
assert.ok(Math.abs(decodeB - 1.9744706978565452) < 1e-10);
assert.ok(Math.abs(lengthChiSquare(control) - 85.12569251566023) < 1e-10);

/** @type {number} */
let state = 0x15f1b0ac;
/** @param {number} limit @returns {number} */
function randomIndex(limit) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  state >>>= 0;
  return state % limit;
}

let atLeastA = 0;
let atLeastB = 0;
for (let trial = 0; trial < 10000; trial++) {
  const randomOrder = [...Array(COLS).keys()];
  for (let i = COLS - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
  }
  if (lengthChiSquare(transform(source, randomOrder, 'column-into-row')) >= decodeA) atLeastA++;
  if (lengthChiSquare(transform(source, randomOrder, 'row-into-column')) >= decodeB) atLeastB++;
}
assert.equal(atLeastA, 1955);
assert.equal(atLeastB, 1178);
console.log(JSON.stringify({
  source: 'Original unknown LP2 physical pages 0–55; original p15 spiral key',
  originalWordCount: COUNT,
  GP29Runes: 12956,
  rows: ROWS,
  columns: COLS,
  sourceSpiralOrderZeroBased: ORDER,
  originalChiSquare: lengthChiSquare(source),
  originalDecodedColumnIntoRow: decodeA,
  originalDecodedRowIntoColumn: decodeB,
  random1600: null,
  randomPermutationTests: 10000,
  randomKeysAtLeastAsHigh: { columnIntoRow: atLeastA, rowIntoColumn: atLeastB },
  nativeLatinPositive: {
    sourceStartWord: 11000,
    plaintextChiSquare: lengthChiSquare(control),
    encryptedChiSquareA: lengthChiSquare(controlCipherA),
    encryptedChiSquareB: lengthChiSquare(controlCipherB),
    inverseRecoveredAllWords: true
  },
  interpretation: 'No native word-length adjacency recovery from this original-source, whole-book, fixed 16-column mechanism; not a cipher decryption'
}, null, 2));
