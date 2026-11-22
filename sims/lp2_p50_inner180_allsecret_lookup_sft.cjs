'use strict';

/**
 * Exact source-native all-secret lookup obstruction for p50's 180-cell interior.
 * A proposed fixed byte -> GP29-symbol decoder must map equal table bytes to
 * equal target runes, regardless of any secret mapping or key search.
 *
 * Node 22; no dependencies or command-line arguments.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourceDir = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(sourceDir, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(sourceDir, 'lp2-grid-256.json'), 'utf8'));

assert.equal(grid.bytes.length, 256);
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
const c56 = corpus.pages[56].indices;
const p57 = corpus.pages[57].indices;

/** @param {string} text @returns {number[]} */
function toGp(text) {
  const tokens = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const output = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(({ token }) => word.startsWith(token, i));
      assert.ok(found, 'Not source-native GP29: ' + word.slice(i));
      output.push(found.index);
      i += found.token.length;
    }
  }
  return output;
}

const p56 = toGp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(p56.length, 85);

const interior = Array.from({ length: 30 }, (_, r) =>
  Array.from({ length: 6 }, (_, c) => grid.bytes[(r + 1) * 8 + (c + 1)]));
assert.equal(new Set(interior.flat()).size, 127);

/**
 * All eight rectangular dihedral read orders. For a nonsquare rectangle,
 * row/column traversal with independent reversals covers its D4 symmetries.
 * @param {number} swap
 * @param {number} reverseOuter
 * @param {number} reverseInner
 * @returns {number[]}
 */
function readInterior(swap, reverseOuter, reverseInner) {
  const outer = swap ? 6 : 30;
  const inner = swap ? 30 : 6;
  const result = [];
  for (let r = 0; r < outer; r++) {
    for (let c = 0; c < inner; c++) {
      const x = reverseOuter ? outer - 1 - r : r;
      const y = reverseInner ? inner - 1 - c : c;
      result.push(swap ? interior[y][x] : interior[x][y]);
    }
  }
  assert.equal(result.length, 180);
  return result;
}

/**
 * Count violations of existence of a single deterministic byte-to-symbol
 * function: if a byte was assigned one rune, any different later rune
 * contradicts the proposed function. "First-seen" count is a sufficient
 * obstruction, not a minimum-edit estimate.
 * @param {number[]} bytes
 * @param {number[]} symbols
 * @returns {number}
 */
function conflicts(bytes, symbols) {
  assert.equal(bytes.length, symbols.length);
  const seen = new Map();
  let contradictoryPositions = 0;
  for (let i = 0; i < bytes.length; i++) {
    const original = seen.get(bytes[i]);
    if (original !== undefined && original !== symbols[i]) contradictoryPositions++;
    else if (original === undefined) seen.set(bytes[i], symbols[i]);
  }
  return contradictoryPositions;
}

// Positive control uses an arbitrary secret deterministic mapping and
// demonstrates that duplicate bytes are accepted when the target agrees.
const secretMap = Array.from({ length: 256 }, (_, byte) => (byte * 11 + 23) % 29);
assert.equal(conflicts(interior.flat(), interior.flat().map(b => secretMap[b])), 0);

const targets = [
  ['cipher56+clear57', c56.concat(p57)],
  ['plain56+clear57', p56.concat(p57)]
];
const rows = [];
for (let swap = 0; swap <= 1; swap++) {
  for (let reverseOuter = 0; reverseOuter <= 1; reverseOuter++) {
    for (let reverseInner = 0; reverseInner <= 1; reverseInner++) {
      const bytes = readInterior(swap, reverseOuter, reverseInner);
      const [cipherTarget, plainTarget] = targets.map(([, text]) => conflicts(bytes, text));
      const knownP57 = conflicts(bytes.slice(85), p57);
      rows.push({
        order: (swap ? 'columns' : 'rows') + ':' + reverseOuter + reverseInner,
        cipher56_plus_clear57: cipherTarget,
        plain56_plus_clear57: plainTarget,
        clear57_only: knownP57
      });
    }
  }
}
assert.deepEqual(rows.map(r => r.cipher56_plus_clear57), [51, 53, 52, 51, 50, 52, 52, 51]);
assert.deepEqual(rows.map(r => r.plain56_plus_clear57), [47, 48, 49, 51, 48, 50, 51, 49]);
assert.deepEqual(rows.map(r => r.clear57_only), [15, 15, 21, 18, 15, 16, 14, 16]);

const first = readInterior(0, 0, 0);
assert.equal(first[85], 86);
assert.equal(first[91], 86);
assert.equal(corpus.translit[p57[0]], 'P');
assert.equal(corpus.translit[p57[6]], 'E');
console.log(JSON.stringify({
  result: 'PASS: no shared deterministic byte-to-GP29 map for the 180 core cells',
  source: 'LP2 printed table pp49-51, solved/clear pp56-57',
  coreRows: 30,
  coreCols: 6,
  coreCells: 180,
  distinctCoreByteValues: 127,
  targetLength: 85 + 95,
  exactFirstContradiction: 'row-major byte 86 at core offsets 85 and 91 requires P and E',
  rows
}, null, 2));


/**
 * Evaluate the broader first-neighbor affine GP29 family on only the clear
 * p57 94 postinitial runes, independent of p56 plaintext and its F rule.
 * Every unknown coefficient a,b,c is admitted simultaneously. The matrix
 * obstruction rank([input, neighbor, 1, target]) > rank([input,neighbor,1])
 * precludes all possible source-independent triples.
 * @param {number[][]} equations @returns {number}
 */
function matrixRank(equations) {
  const mod = n => ((n % 29) + 29) % 29;
  const rows = equations.map(r => r.map(mod));
  let rank = 0;
  for (let j = 0; j < rows[0].length && rank < rows.length; j++) {
    const pivot = rows.findIndex((r, i) => i >= rank && r[j] !== 0);
    if (pivot < 0) continue;
    [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];
    let inverse = 1;
    while (mod(rows[rank][j] * inverse) !== 1) inverse++;
    for (let k = j; k < rows[0].length; k++)
      rows[rank][k] = mod(rows[rank][k] * inverse);
    for (let i = 0; i < rows.length; i++) {
      if (i === rank || rows[i][j] === 0) continue;
      const factor = rows[i][j];
      for (let k = j; k < rows[0].length; k++)
        rows[i][k] = mod(rows[i][k] - factor * rows[rank][k]);
    }
    rank++;
  }
  return rank;
}

/** The inner 30x6 crop also consists of rings of lengths 68,60,52.
 * @param {number} corner top-left/top-right/bottom-right/bottom-left
 * @param {boolean} clockwise
 * @returns {number[]}
 */
function ringInterior(corner, clockwise) {
  const all = [];
  for (let depth = 0; depth < 3; depth++) {
    const top = depth, bottom = 29 - depth;
    const left = depth, right = 5 - depth;
    const cells = [];
    for (let c = left; c <= right; c++) cells.push([top, c]);
    for (let r = top + 1; r <= bottom; r++) cells.push([r, right]);
    for (let c = right - 1; c >= left; c--) cells.push([bottom, c]);
    for (let r = bottom - 1; r > top; r--) cells.push([r, left]);
    const starts = [0, right - left,
      right - left + bottom - top, 2 * (right - left) + bottom - top];
    const start = starts[corner];
    const ordered = Array.from({ length: cells.length }, (_, i) =>
      cells[(start + (clockwise ? i : -i) + cells.length) % cells.length]);
    all.push(...ordered.map(([r, c]) => interior[r][c]));
  }
  assert.equal(all.length, 180);
  return all;
}

/**
 * Exhaust a small complete coefficient family by linear rank, not by
 * candidate key search or native-language optimization.
 * @param {number[]} bytes
 * @param {number[]} target
 * @param {'prevByte'|'prevTarget'|'nextByte'} mode
 */
function affineHasSolution(bytes, target, mode) {
  const equations = [];
  // Omit p57's first glyph: a title/page break may reset a state.
  for (let i = 86; i < 180; i++) {
    const second = mode === 'prevByte' ? bytes[i - 1] :
      mode === 'nextByte' ? bytes[(i + 1) % 180] : target[i - 1];
    equations.push([bytes[i] % 29, second % 29, 1, target[i]]);
  }
  return {
    sourceRank: matrixRank(equations.map(r => r.slice(0, 3))),
    augmentedRank: matrixRank(equations)
  };
}
const geometric = [];
for (let swap = 0; swap < 2; swap++)
  for (let revOuter = 0; revOuter < 2; revOuter++)
    for (let revInner = 0; revInner < 2; revInner++)
      geometric.push({name: 'rect-' + swap + revOuter + revInner,
        bytes: readInterior(swap, revOuter, revInner)});
for (let corner = 0; corner < 4; corner++)
  for (let cw = 0; cw < 2; cw++)
    geometric.push({name: 'ring-' + corner + cw,
      bytes: ringInterior(corner, cw === 1)});
assert.equal(geometric.length, 16);
const modes = ['prevByte', 'prevTarget', 'nextByte'];
const affineCases = [];
for (const layout of geometric) for (const mode of modes) {
  const rank = affineHasSolution(layout.bytes, p56.concat(p57), mode);
  assert.deepEqual(rank, {sourceRank: 3, augmentedRank: 4});
  affineCases.push({layout: layout.name, mode, ...rank});
  // Positive control: implant an entire 94-rune GP29 span obeying an arbitrary
  // three-parameter transition and recover a full-rank consistent solution.
  const synthetic = Array(180).fill(0);
  synthetic[85] = 17;
  for (let i = 86; i < 180; i++) {
    const second = mode === 'prevByte' ? layout.bytes[i - 1] :
      mode === 'nextByte' ? layout.bytes[(i + 1) % 180] : synthetic[i - 1];
    synthetic[i] = (3 * layout.bytes[i] + 7 * second + 11) % 29;
  }
  const plant = affineHasSolution(layout.bytes, synthetic, mode);
  assert.equal(plant.sourceRank, plant.augmentedRank);
}
assert.equal(affineCases.length, 48);
console.log(JSON.stringify({
  status: 'PASS: all-secret first-neighbor affine decoding fails on 94 clear p57 runes',
  tested: affineCases.length, layouts: geometric.length,
  operators: modes, knownP57PostinitialRunes: 94,
  rankPairs: [...new Set(affineCases.map(c => c.sourceRank + '/' + c.augmentedRank))],
  positivePlants: affineCases.length
}, null, 2));
