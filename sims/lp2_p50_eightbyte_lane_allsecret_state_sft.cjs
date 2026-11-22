"use strict";
/**
 * Independent 8-column byte-state generator test for the original 32x8 table.
 * One arbitrary, completely secret GF(2)-affine 8->8 transition per printed
 * column. Also test arbitrary stationary byte->byte tables per column.
 * Node 22/CommonJS, original source read-only, exact synthetic plants.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const table = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
assert.equal(table.bytes.length, 256);
assert.deepEqual(table.pages.map(p => p.rows), [10, 13, 9]);

/** @param {number[]} equations packed input9+right1 bit row @returns {object} */
function binaryEliminate(equations) {
  const rows = equations.slice();
  let pivotRow = 0;
  for (let bit = 0; bit < 9; bit++) {
    let pick = pivotRow;
    while (pick < rows.length && ((rows[pick] >>> bit) & 1) === 0)
      pick++;
    if (pick === rows.length) continue;
    [rows[pick], rows[pivotRow]] = [rows[pivotRow], rows[pick]];
    for (let i = 0; i < rows.length; i++) {
      if (i !== pivotRow && ((rows[i] >>> bit) & 1))
        rows[i] ^= rows[pivotRow];
    }
    pivotRow++;
  }
  return {rank: pivotRow,
    contradictions: rows.slice(pivotRow).filter(x => x !== 0).length};
}
/** @param {number[]} stream 32 source bytes from one column */
function analyze(stream) {
  assert.equal(stream.length, 32);
  const seen = new Map();
  const contradictions = [];
  let firstAffineFailure = null;
  const pairs = stream.slice(0, -1).map((current, row) =>
    [current, stream[row + 1]]);
  for (let i = 0; i < pairs.length; i++) {
    const [input, output] = pairs[i];
    if (seen.has(input) && seen.get(input) !== output)
      contradictions.push({transition: i, input,
        earlierOutput: seen.get(input), actualOutput: output});
    else seen.set(input, output);
    if (firstAffineFailure !== null) continue;
    for (let outBit = 0; outBit < 8; outBit++) {
      const equations = pairs.slice(0, i + 1).map(([x, y]) =>
        x | 256 | (((y >>> outBit) & 1) << 9));
      if (binaryEliminate(equations).contradictions > 0) {
        firstAffineFailure = i;
        break;
      }
    }
  }
  const full = Array.from({length: 8}, (_, outBit) => {
    const equations = pairs.map(([x, y]) =>
      x | 256 | (((y >>> outBit) & 1) << 9));
    return binaryEliminate(equations).contradictions;
  });
  return {distinctInputs: seen.size, stationaryConflicts: contradictions,
    firstAffineFailure, fullOutputBitContradictions: full};
}
const sourceColumns = Array.from({length: 8}, (_, col) =>
  Array.from({length: 32}, (_, row) => table.bytes[8 * row + col]));
const source = sourceColumns.map(analyze);
assert.deepEqual(source.map(x => x.firstAffineFailure),
  [8, 9, 9, 7, 8, 6, 8, 7]);
assert.deepEqual(source.map(x => x.stationaryConflicts.length),
  [2, 0, 2, 2, 2, 1, 1, 1]);
assert.ok(source.every(x => x.fullOutputBitContradictions.every(v => v > 0)));

// Independent genuine affine byte transition, one per original column.
const plantedColumns = Array.from({length: 8}, (_, col) => {
  let state = (17 * col + 31) & 255;
  const values = [state];
  for (let step = 0; step < 31; step++) {
    const bits = [0,1,2,3,4,5,6,7].map(k => ((state >>> k)&1));
    let next = 0;
    for (let bit = 0; bit < 8; bit++) {
      const b = bits[bit] ^ bits[(bit + 2) % 8] ^ bits[(bit + 5) % 8] ^
        ((col >>> (bit % 3)) & 1);
      next |= b << bit;
    }
    state = next;
    values.push(state);
  }
  return values;
});
const planted = plantedColumns.map(analyze);
assert.ok(planted.every(x => x.firstAffineFailure === null));
assert.ok(planted.every(x => x.stationaryConflicts.length === 0));
assert.ok(planted.every(x => x.fullOutputBitContradictions.every(y => y === 0)));
console.log(JSON.stringify({status: "No source-compatible per-column affine key stream",
  sourceColumns: source,
  syntheticIndependentEightColumnAffinePlant: "8/8 fully compatible",
  interpretation: "Rejects arbitrary independent full-byte GF2-affine state on " +
    "each unchanged printed table column with one transition per row; " +
    "seven columns also contradict any stationary byte->byte lookup"}, null, 2));
