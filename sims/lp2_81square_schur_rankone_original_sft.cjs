"use strict";

/**
 * Source 81²/80²−5 bookend: every rank-one Schur-border model exclusion.
 * Exact original GP29 source; Windows Node.js 22 SFT, no third-party deps.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const original = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);

// The duplicated original six-rune bookend closes exactly 81² at offset 6561.
// Next 6395 source runes occupy 80²−5 cells; all five missing tail cells
// remain genuinely UNASSIGNED in the original-cipher decision.
const outer = original.slice(0, 6561);
const inner = original.slice(6561);
assert.equal(outer.length, 81 * 81);
assert.equal(inner.length, 80 * 80 - 5);

const mod = x => (x % 29 + 29) % 29;
const inverseScalar = x =>
  Array.from({ length: 28 }, (_, i) => i + 1).find(k => x * k % 29 === 1);

// Any rank-one matrix has every two-by-two determinant zero. Two fixed,
// disjoint, interior sites suffice to reject ALL 81*81 possible deleted
// source row/column pairs in ALL eight geometric output orientations.
const sites = [[5, 7], [20, 24]];
const outerAt = (r, c) => outer[81 * r + c];

/** The 80×80 output is known at 6395 printed positions; last 5 are free. */
function innerAt(orientation, row, col) {
  let r = row, c = col;
  if (orientation & 4) [r, c] = [c, r];
  if (orientation & 2) r = 79 - r;
  if (orientation & 1) c = 79 - c;
  return inner[80 * r + c]; // Undefined for unknown final five cells.
}

/**
 * Subtract observed target from the 80×80 minor of source 81×81 after
 * deleting one possible source pivot row and column.
 */
function difference(lookup, orientation, deleteRow, deleteCol, row, col) {
  const actualRow = row + Number(row >= deleteRow);
  const actualCol = col + Number(col >= deleteCol);
  const target = lookup(orientation, row, col);
  assert.notEqual(target, undefined, "test coordinate cannot depend on five missing cells");
  return mod(outerAt(actualRow, actualCol) - target);
}

/** Two-by-two minor, with determinant over GF29. */
function minor(lookup, orientation, deleteRow, deleteCol, [row, col]) {
  const a = difference(lookup, orientation, deleteRow, deleteCol, row, col);
  const b = difference(lookup, orientation, deleteRow, deleteCol, row, col + 1);
  const c = difference(lookup, orientation, deleteRow, deleteCol, row + 1, col);
  const d = difference(lookup, orientation, deleteRow, deleteCol, row + 1, col + 1);
  return mod(a * d - b * c);
}

let all = 0, afterFirst = 0, afterSecond = 0, zeroPivots = 0;
for (let orientation = 0; orientation < 8; orientation++) {
  for (let deleteRow = 0; deleteRow < 81; deleteRow++) {
    for (let deleteCol = 0; deleteCol < 81; deleteCol++) {
      all++;
      zeroPivots += Number(outerAt(deleteRow, deleteCol) === 0);
      if (minor(innerAt, orientation, deleteRow, deleteCol, sites[0]) !== 0) continue;
      afterFirst++;
      if (minor(innerAt, orientation, deleteRow, deleteCol, sites[1]) !== 0) continue;
      afterSecond++;
    }
  }
}
assert.equal(all, 8 * 81 * 81);
assert.equal(afterFirst, 6586);
assert.equal(afterSecond, 0, "no original Schur-border candidate can survive");

// Plant the exact original 81×81 source as a matrix with an unknown
// secret nonzero pivot, and generate its actual 80×80 Schur complement.
const a = outerAt(0, 0);
assert.equal(a, 15, "original source pivot");
const inv = inverseScalar(a);
assert.notEqual(inv, undefined);
const plant = Array.from({ length: 6400 }, (_, k) => {
  const r = 1 + Math.floor(k / 80);
  const c = 1 + (k % 80);
  return mod(outerAt(r, c) - outerAt(r, 0) * outerAt(0, c) * inv);
});
const plantAt = (_, row, col) => plant[80 * row + col];
for (const site of sites) {
  assert.equal(minor(plantAt, 0, 0, 0, site), 0, "real Schur plant passes");
}
for (let r = 0; r < 80; r++) for (let c = 0; c < 80; c++) {
  assert.equal(mod(outerAt(r + 1, c + 1) - plantAt(0, r, c)),
    mod(outerAt(r + 1, 0) * outerAt(0, c + 1) * inv),
    "real planted Schur relation is exact at every cell");
}
console.log(JSON.stringify({
  status: "source-original rank-one Schur-border impossibility; no LP2 plaintext",
  firstSquare: 6561,
  secondPrinted: 6395,
  secondMissing: 5,
  tests: "8 output orientations, all 81^2 source row/column removals",
  exactObstructions: { candidates: all, afterFirstMinor: afterFirst,
    afterSecondMinor: afterSecond, zeroPivotChoicesIncluded: zeroPivots },
  completeSourceShurPlant: true
}, null, 2));
