'use strict';

/**
 * Single-file original-input spatial successor assay on LP2's 32x8 numeric
 * panel. Read-only, Node 22 CommonJS; deterministic inventory-preserving null.
 * The apparent pattern is a hypothesis, NOT a recovered cipher or plaintext.
 */
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/base60-grid.json');
const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(digits.length, 60);
assert.equal(grid.rows.length, 32);
assert.equal(grid.byte_rows.length, 32);

const cells = [];
for (let row = 0; row < 32; row++) {
  assert.equal(grid.rows[row].length, 8);
  assert.equal(grid.byte_rows[row].length, 8);
  for (let col = 0; col < 8; col++) {
    const token = grid.rows[row][col];
    assert.equal(token.length, 2);
    const value = 60 * digits.indexOf(token[0]) + digits.indexOf(token[1]);
    assert.ok(value >= 0 && value < 256, token);
    assert.equal(value, grid.byte_rows[row][col], token);
    cells.push({row, col, value, token});
  }
}
assert.equal(cells.length, 256);
const original = cells.map(x => x.value);

// Each original physical image spans 10, 13, 9 whole rows, respectively.
const sourcePageRows = [[0, 10], [10, 23], [23, 32]];
const edges = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) {
    for (const [dr, dc] of [[0,1], [1,0], [1,1], [1,-1]]) {
      const nextRow = row + dr, nextCol = col + dc;
      if (nextRow < 32 && nextCol >= 0 && nextCol < 8) {
        edges.push([row * 8 + col, nextRow * 8 + nextCol]);
      }
    }
  }
}
assert.equal(edges.length, 906);

/** @param {number[]} tape */
function counts(tape) {
  const bins = Array(16).fill(0);
  for (const [i, j] of edges) {
    const a = tape[i], b = tape[j];
    if (Math.abs(a - b) === 1 && (a >> 4) === (b >> 4)) bins[a >> 4]++;
  }
  return bins;
}
const expectedBins = [0,0,0,2,0,1,0,1,0,2,0,0,1,0,0,7];
assert.deepEqual(counts(original), expectedBins);
const highEdges = edges.filter(([i,j]) =>
  original[i] >= 240 && original[j] >= 240 &&
  Math.abs(original[i] - original[j]) === 1);
assert.equal(highEdges.length, 7);
const highPairs = highEdges.map(([i,j]) => ({
  first: [cells[i].row, cells[i].col, cells[i].token],
  second: [cells[j].row, cells[j].col, cells[j].token],
}));
const highTokens = cells.filter(x => x.value >= 240);
assert.equal(highTokens.length, 17);
assert.equal(original.filter(x => x === 252).length, 0);
// Independently enumerate every length>=3 increasing directed path; all
// prefixes and suffixes are included, without choosing the high-value band.
/** @param {number[]} path @param {number[][]} out */
function extendSuccessors(path, out) {
  if (path.length >= 3) out.push(path);
  const last = path[path.length - 1], r = Math.floor(last / 8), c = last % 8;
  for (const dr of [-1, 0, 1]) {
    for (const dc of [-1, 0, 1]) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= 32 || nc < 0 || nc >= 8) continue;
      const next = nr * 8 + nc;
      if (original[next] === original[last] + 1) {
        extendSuccessors([...path, next], out);
      }
    }
  }
}
const allSuccessorPaths = [];
for (let i = 0; i < original.length; i++) {
  extendSuccessors([i], allSuccessorPaths);
}
assert.equal(allSuccessorPaths.length, 6);
assert.equal(allSuccessorPaths.filter(p => p.length === 3).length, 4);
assert.equal(allSuccessorPaths.filter(p => p.length === 4).length, 2);
assert.deepEqual(
  [...new Set(allSuccessorPaths.map(p => p.map(i => cells[i].token).join('→')))].sort(),
  ['48→49→4A', '48→49→4A→4B', '49→4A→4B', '4D→4E→4F'].sort()
);


// Source-derived check in the historically debated 59-digit alphabet:
// 4H/4I/.../4O are numerically 4 less, but the exact seven
// printed-neighbor consecutive-value edges survive that alternative.
const dropped = digits.replace('f', '');
const base59 = cells.map(c => 59 * dropped.indexOf(c.token[0]) +
  dropped.indexOf(c.token[1]));
assert.equal(base59.length, 256);
assert.ok(base59.every(x => x >= 0 && x < 256));
assert.equal(edges.filter(([i,j]) => cells[i].token[0] === '4' &&
  cells[j].token[0] === '4' &&
  Math.abs(base59[i] - base59[j]) === 1).length, 7);

/** @returns {number} */
function randomNumber() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
let state = 0x33013301;
const simulations = 200000;
let atLeastOriginalMaximum = 0;
let atLeastOriginalHighBand = 0;
const maxima = Array(16).fill(0);
const means = Array(16).fill(0);
for (let t = 0; t < simulations; t++) {
  const tape = original.slice();
  for (const [lo, hi] of sourcePageRows) {
    const offset = lo * 8, length = (hi - lo) * 8;
    for (let i = length - 1; i > 0; i--) {
      const j = randomNumber() % (i + 1);
      [tape[offset + i], tape[offset + j]] =
        [tape[offset + j], tape[offset + i]];
    }
  }
  const bins = counts(tape);
  const maximum = Math.max(...bins);
  maxima[maximum]++;
  if (maximum >= 7) atLeastOriginalMaximum++;
  if (bins[15] >= 7) atLeastOriginalHighBand++;
  for (let i = 0; i < bins.length; i++) means[i] += bins[i];
}
assert.equal(atLeastOriginalMaximum, 2);
assert.equal(atLeastOriginalHighBand, 1);
state = 0x4a4b4d4f;
let withinRowAtLeastObserved = 0;
for (let t = 0; t < simulations; t++) {
  const tape = original.slice();
  for (let row = 0; row < 32; row++) {
    for (let col = 7; col > 0; col--) {
      const other = randomNumber() % (col + 1);
      const i = row * 8 + col, j = row * 8 + other;
      [tape[i], tape[j]] = [tape[j], tape[i]];
    }
  }
  if (edges.filter(([i,j]) => tape[i] >= 240 && tape[j] >= 240 &&
    Math.abs(tape[i]-tape[j]) === 1).length >= 7) {
    withinRowAtLeastObserved++;
  }
}
assert.equal(withinRowAtLeastObserved, 43);

// Reproduce the separate, previously unrecorded 50k threshold-free path null.
// A path must be entirely within the original physical page.
/** @param {number[]} tape @param {number} firstRow @param {number} endRow @param {number} requiredLength */
function hasIncreasingPath(tape, firstRow, endRow, requiredLength) {
  /** @param {number} index @param {number} length */
  function visit(index, length) {
    if (length >= requiredLength) return true;
    const row = Math.floor(index / 8), col = index % 8;
    for (const dr of [-1, 0, 1]) {
      for (const dc of [-1, 0, 1]) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr, nc = col + dc;
        if (nr < firstRow || nr >= endRow || nc < 0 || nc >= 8) continue;
        const next = nr * 8 + nc;
        if (tape[next] === tape[index] + 1 && visit(next, length + 1)) return true;
      }
    }
    return false;
  }
  for (let i = firstRow * 8; i < endRow * 8; i++) {
    if (visit(i, 1)) return true;
  }
  return false;
}
assert.ok(hasIncreasingPath(original, 0, 10, 3));
assert.ok(hasIncreasingPath(original, 10, 23, 4));
assert.equal(hasIncreasingPath(original, 23, 32, 3), false);
state = 0x3301c1ca;
let jointPageLongPathHits = 0;
const pathNullRuns = 50000;
for (let t = 0; t < pathNullRuns; t++) {
  const tape = original.slice();
  for (const [lo, hi] of sourcePageRows) {
    const offset = lo * 8, length = (hi - lo) * 8;
    for (let i = length - 1; i > 0; i--) {
      const j = randomNumber() % (i + 1);
      [tape[offset + i], tape[offset + j]] =
        [tape[offset + j], tape[offset + i]];
    }
  }
  if (hasIncreasingPath(tape, 0, 10, 3) &&
      hasIncreasingPath(tape, 10, 23, 4)) jointPageLongPathHits++;
}
assert.equal(jointPageLongPathHits, 8);

const output = {
  status: 'PASS',
  source: 'original 32x8 LP2 printed numeric panel',
  pageRowSplits: sourcePageRows,
  graph: 'horizontal vertical diagonal king-neighbor cells',
  originalBandsOfWidth16: expectedBins,
  largestObservedBand: 15,
  largestObservedBandEdgeCount: 7,
  highTokens: highTokens.map(x => ({
    row: x.row, col: x.col, value: x.value, token: x.token,
  })),
  highConsecutiveEdges: highPairs,
  allIncreasingNeighborPathsAtLeastThree: allSuccessorPaths.map(p => p.map(i => ({
    row: cells[i].row, col: cells[i].col, token: cells[i].token,
  }))),

  comparison: 'fixed original cell inventory; shuffle within physical JPEG page only',
  runs: simulations,
  seed: '0x33013301',
  matchedOrExceededObservedMaxOverAll16Bands: atLeastOriginalMaximum,
  matchedOrExceededHighBandAlone: atLeastOriginalHighBand,
  tailPlusOneMaximum: (atLeastOriginalMaximum + 1) / (simulations + 1),
  tailPlusOneHigh: (atLeastOriginalHighBand + 1) / (simulations + 1),
  nullBandMeans: means.map(v => v / simulations),
  withinRowShuffleSeed: '0x4a4b4d4f',
  withinRowMatchedOrExceeded: withinRowAtLeastObserved,
  allPageLongPathNullRuns: pathNullRuns,
  allPageLongPathNullSeed: '0x3301c1ca',
  allPageLongPathNullJointHits: jointPageLongPathHits,
  allPageLongPathNullPlusOne: (jointPageLongPathHits+1)/(pathNullRuns+1),

  withinRowPlusOne: (withinRowAtLeastObserved+1)/(simulations+1),
  nullMaxHistogram: maxima,
  caution: 'Postselected spatial hypothesis; finite permutation tail is not global cryptanalytic discovery probability; no plaintext/opcode.'
};
console.log(JSON.stringify(output, null, 2));
