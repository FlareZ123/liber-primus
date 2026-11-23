"use strict";

/**
 * Original-source fixed digraph/byte-codebook capacity test.
 * Tests a 2014-readable 256-entry codebook interpretation of the physical
 * 32-by-8 p49-p51 byte grid, without changing any original ciphertext.
 * Run: node sims/lp2_grid256_digraph_codebook_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {any} */
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const pages = corpus.pages.filter((p) => p.page <= 55);
const bytes = grid.pages.flatMap((p) => p.bytes);
assert.equal(bytes.length, 256);
assert.equal(pages.length, 56);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.ok(bytes.every((x) => Number.isInteger(x) && x >= 0 && x < 256));
/** @param {number[]} sequence @param {0|1} phase @returns {number} */
function countPairs(sequence, phase) {
  const observed = new Set();
  for (let i = phase; i + 1 < sequence.length; i += 2) {
    observed.add(sequence[i] * 29 + sequence[i + 1]);
  }
  return observed.size;
}
const hist = new Array(256).fill(0);
for (const b of bytes) hist[b]++;
const byteOccupancy = {
  cells: bytes.length,
  uniqueBytes: hist.filter((n) => n > 0).length,
  absentBytes: hist.filter((n) => n === 0).length,
  maxMultiplicity: Math.max(...hist),
  multiplicities: Object.fromEntries([0,1,2,3,4].map((n) =>
    [String(n), hist.filter((x) => x === n).length]))
};
assert.equal(byteOccupancy.uniqueBytes, 161);
assert.deepEqual(byteOccupancy.multiplicities,
  {"0":95,"1":92,"2":49,"3":14,"4":6});
const entire = pages.flatMap((p) => p.indices);
const bookPairs = [countPairs(entire, 0), countPairs(entire, 1)];
assert.deepEqual(bookPairs, [832, 838]);
const ranges = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const chapters = ranges.map(([first,last]) => {
  const original = pages.filter((p) => p.page >= first && p.page <= last)
    .flatMap((p) => p.indices);
  return {
    pages: first + "-" + last,
    runes: original.length,
    distinctDigraphs: [countPairs(original, 0), countPairs(original, 1)],
    above256: [countPairs(original, 0) > 256, countPairs(original, 1) > 256]
  };
});
assert.deepEqual(chapters.map((x) => x.distinctDigraphs),
  [[303,303],[414,403],[532,537],[573,556],[373,387],
    [482,495],[518,530],[700,688],[138,140]]);
assert.ok(chapters.slice(0,8).every((c) => c.above256.every(Boolean)));
assert.ok(chapters[8].above256.every((flag) => !flag));
const output = {
  classification: "strict capacity exclusion, not plaintext recovery",
  source: "unchanged original LP2 p0-p55 and 256-cell p49-p51 table",
  byteOccupancy,
  bookPairs,
  chapters,
  excluded: "fixed 256-entry injective one-byte-to-two-GP29-rune codebook, book-global or chapter-private, for either digraph alignment",
  allowed: "running state, page-private codebooks, variable-length base conversion, lossy or side-informed decoding, and non-byte use of the table"
};
console.log(JSON.stringify(output, null, 2));
console.log("PASS: original source fixed digraph/byte-codebook capacity");
