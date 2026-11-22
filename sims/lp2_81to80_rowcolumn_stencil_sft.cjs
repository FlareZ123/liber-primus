'use strict';
/**
 * Original-LP2 81x81 -> 80x80 four-tap stencil with arbitrary row and column pads.
 * Run: node sims/lp2_81to80_rowcolumn_stencil_sft.cjs
 * Read-only, Node 22/CommonJS; all GP arithmetic is modulo 29.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = corpus.pages.filter(p => p.page >= 0 && p.page <= 55).flatMap(p => p.indices);
assert.equal(source.length, 12956);
assert.deepEqual(source.slice(6555, 6561), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(source.slice(-6), [23, 11, 1, 17, 18, 10]);
let fnv = 2166136261;
for (const rune of source) fnv = Math.imul(fnv ^ rune, 16777619) >>> 0;
assert.equal(fnv, 0xfe63c4ed);
const input = source.slice(0, 6561);
const output = source.slice(6561);
assert.equal(input.length, 81 * 81);
assert.equal(output.length, 80 * 80 - 5);
assert.equal(corpus.runes.length, 29);

const mod = x => ((x % 29) + 29) % 29;
function inverse(x) {
  for (let k = 1; k < 29; k++) if (mod(x * k) === 1) return k;
  throw Error('Singular pivot');
}
/** Eight dihedral orientations; orientation 0 is the printed row-major grid. */
function address(i, j, size, orientation) {
  let x = (orientation & 1) ? size - 1 - i : i;
  let y = j;
  for (let r = 0; r < (orientation >> 1); r++) {
    const oldX = x;
    x = y;
    y = size - 1 - oldX;
  }
  return x * size + y;
}
function read(a, size, i, j, orientation) {
  return a[address(i, j, size, orientation)];
}
function mixed(a, size, i, j, orientation) {
  const v = [read(a, size, i, j, orientation), read(a, size, i + 1, j, orientation),
    read(a, size, i, j + 1, orientation), read(a, size, i + 1, j + 1, orientation)];
  if (v.some(x => x === undefined)) return null;
  return mod(v[3] - v[1] - v[2] + v[0]);
}
/** Eliminate arbitrary row and column masks via adjacent mixed differences. */
function equations(a, b, oa, ob) {
  const rows = [];
  for (let i = 0; i < 79; i++) for (let j = 0; j < 79; j++) {
    const y = mixed(b, 80, i, j, ob);
    if (y === null) continue;
    const x = [mixed(a, 81, i, j, oa), mixed(a, 81, i, j + 1, oa),
      mixed(a, 81, i + 1, j, oa), mixed(a, 81, i + 1, j + 1, oa)];
    assert(x.every(v => v !== null));
    rows.push([...x, y]);
  }
  assert.equal(rows.length, 6236);
  return rows;
}
/** Source-independent first-20 equations fix all four arbitrary secret GF29 coefficients. */
function solveFirst20(rows) {
  const a = rows.slice(0, 20).map(r => r.slice());
  let rank = 0;
  for (let c = 0; c < 4; c++) {
    let pivot = rank;
    while (pivot < a.length && a[pivot][c] === 0) pivot++;
    assert(pivot < a.length, 'First-20 stencil design was rank deficient');
    [a[pivot], a[rank]] = [a[rank], a[pivot]];
    const inv = inverse(a[rank][c]);
    for (let k = c; k < 5; k++) a[rank][k] = mod(a[rank][k] * inv);
    for (let j = 0; j < a.length; j++) if (j !== rank) {
      const factor = a[j][c];
      for (let k = c; k < 5; k++) a[j][k] = mod(a[j][k] - factor * a[rank][k]);
    }
    rank++;
  }
  return a.slice(0, 4).map(r => r[4]);
}
function matches(rows, weights) {
  return rows.reduce((n, row) => n + Number(mod(row[0] * weights[0] +
    row[1] * weights[1] + row[2] * weights[2] + row[3] * weights[3]) === row[4]), 0);
}

// Plant genuinely source-sized plaintext-derived output with a fixed arbitrary
// 2x2 key and fully free nonlinear row/column additive masks.
const plantOrientationA = 5;
const plantOrientationB = 5;
const secret = [3, 5, 13, 23];
const planted = Array(6400);
for (let i = 0; i < 80; i++) for (let j = 0; j < 80; j++) {
  const stencil = secret[0] * read(input, 81, i, j, plantOrientationA)
    + secret[1] * read(input, 81, i, j + 1, plantOrientationA)
    + secret[2] * read(input, 81, i + 1, j, plantOrientationA)
    + secret[3] * read(input, 81, i + 1, j + 1, plantOrientationA);
  planted[address(i, j, 80, plantOrientationB)] =
    mod(stencil + 7 * i + 3 * i * i + 11 * j + 2 * j * j);
}
planted.length = 6395; // Original source has five absent terminal cells.
const positiveRows = equations(input, planted, plantOrientationA, plantOrientationB);
const recovered = solveFirst20(positiveRows);
assert.deepEqual(recovered, secret);
assert.equal(matches(positiveRows, recovered), 6236);
console.log('PLANT PASS: 6236/6236, all four hidden coefficients recovered');

const results = [];
for (let oa = 0; oa < 8; oa++) for (let ob = 0; ob < 8; ob++) {
  const rows = equations(input, output, oa, ob);
  const weights = solveFirst20(rows);
  const hit = matches(rows, weights);
  results.push({ sourceOrientation: oa, receiverOrientation: ob, hit, total: rows.length, weights });
  assert(hit < rows.length, 'An exact original 2D cipher relation was recovered');
}
results.sort((a, b) => b.hit - a.hit);
const best = results[0];
assert.equal(best.hit, 266);
assert.equal(best.sourceOrientation, 5);
assert.equal(best.receiverOrientation, 5);
assert.deepEqual(best.weights, [28, 16, 19, 17]);
assert.equal(results.at(-1).hit, 190);
console.log('ORIGINAL: all 64 dihedral combinations contradict an arbitrary four-tap GF29 stencil plus arbitrary row/column pads');
console.log('Best first-20-fitted readout:', JSON.stringify(best));
console.log('Worst hit count:', results.at(-1).hit);
console.log('PASS: exact conditional exclusion, no recovered plaintext or author-selected key');
