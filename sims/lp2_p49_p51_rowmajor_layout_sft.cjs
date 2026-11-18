"use strict";

/**
 * SFT: p49-p51 source-layout row-major traversal gate.
 *
 * This verifies only source-shape facts used by Director #1632. Visual
 * conclusions about ordinary reading direction are documented separately in
 * the report from direct inspection of original 66.jpg-68.jpg.
 *
 * Run:
 *   node sims/lp2_p49_p51_rowmajor_layout_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"),
  "utf8"
));
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"),
  "utf8"
));

assert.deepEqual(grid.shape, [32, 8]);
assert.equal(grid.byte_count, 256);
assert.deepEqual(
  grid.pages.map(page => [page.page, page.rows, page.tokens.length]),
  [[49, 10, 80], [50, 13, 104], [51, 9, 72]]
);
assert.equal(grid.pages.reduce((sum, page) => sum + page.rows, 0), 32);
assert.equal(grid.pages.reduce((sum, page) => sum + page.tokens.length, 0), 256);

for (const page of grid.pages) {
  assert.equal(page.tokens.length, page.rows * 8);
}

const seamOffsets = [
  grid.pages[0].tokens.length,
  grid.pages[0].tokens.length + grid.pages[1].tokens.length,
];
assert.deepEqual(seamOffsets, [80, 184]);
assert.ok(seamOffsets.every(offset => offset % 8 === 0));

const pageRuneCounts = new Map(
  corpus.pages.filter(page => page.page >= 49 && page.page <= 51)
    .map(page => [page.page, page.indices.length])
);
assert.equal(pageRuneCounts.get(49), 66);
assert.equal(pageRuneCounts.get(50), 0);
assert.equal(pageRuneCounts.get(51), 96);

/**
 * Count physical page changes for a conceptual global traversal of the 32x8
 * grid when rows 0-9 are p49, 10-22 p50 and 23-31 p51.
 * @param {Array<[number, number]>} coordinates
 */
function pageChanges(coordinates) {
  const pageForRow = row => row < 10 ? 49 : row < 23 ? 50 : 51;
  let changes = 0;
  for (let i = 1; i < coordinates.length; i++) {
    if (pageForRow(coordinates[i - 1][0]) !== pageForRow(coordinates[i][0])) {
      changes++;
    }
  }
  return changes;
}

const rowMajor = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) rowMajor.push([row, col]);
}

const columnMajor = [];
for (let col = 0; col < 8; col++) {
  for (let row = 0; row < 32; row++) columnMajor.push([row, col]);
}

const rowMajorPageChanges = pageChanges(rowMajor);
const columnMajorPageChanges = pageChanges(columnMajor);
assert.equal(rowMajorPageChanges, 2);
assert.equal(columnMajorPageChanges, 23);

const serpentine = [];
for (let row = 0; row < 32; row++) {
  if (row % 2 === 0) {
    for (let col = 0; col < 8; col++) serpentine.push([row, col]);
  } else {
    for (let col = 7; col >= 0; col--) serpentine.push([row, col]);
  }
}
assert.equal(pageChanges(serpentine), 2);

console.log(JSON.stringify({
  status: "source-shape traversal audit",
  shape: grid.shape,
  physicalRows: grid.pages.map(page => ({
    page: page.page,
    rows: page.rows,
    tokens: page.tokens.length,
  })),
  pageSeamTokenOffsets: seamOffsets,
  pageSeamsSplitRows: false,
  runeContext: Object.fromEntries(pageRuneCounts),
  physicalPageChanges: {
    globalRowMajor: rowMajorPageChanges,
    globalColumnMajor: columnMajorPageChanges,
  },
  decision:
    "The 10/13/9 page partition is an exact 32x8 row partition. Global " +
    "row-major preserves ordinary page flow with two page turns; global " +
    "column-major requires 23 inter-page transitions. Original-image " +
    "typography supplies the independent LTR/top-to-bottom direction cue.",
}, null, 2));
