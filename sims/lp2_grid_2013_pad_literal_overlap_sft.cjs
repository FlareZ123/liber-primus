"use strict";

/**
 * Test if the LP2 pp49–51 grid is a direct copy of the historic CicadaOS
 * DATA/560.13 one-time-pad data. This uses the original 256 table bytes,
 * 32 printed rows, eight printed columns, and the two reading directions.
 * No fitted offsets, inferred ciphers, or arbitrary key transformations.
 *
 * Node.js 22 CommonJS:
 * node sims/lp2_grid_2013_pad_literal_overlap_sft.cjs <DATA/560.13>
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const table = Buffer.from(grid.bytes);
assert.equal(table.length, 256);
const tableHash = crypto.createHash("sha256").update(table).digest("hex");
assert.equal(tableHash,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {Buffer} whole @param {Buffer} needle @returns {number[]} */
function matches(whole, needle) {
  assert.ok(needle.length >= 8);
  const result = [];
  for (let at = whole.indexOf(needle); at >= 0;
    at = whole.indexOf(needle, at + 1)) result.push(at);
  return result;
}
const firstColumn = Buffer.from(Array.from({length: 32}, (_, row) => table[row * 8]));
const firstRow = Buffer.from(table.subarray(0, 8));
const plant = Buffer.alloc(1024);
firstColumn.copy(plant, 111);
firstRow.copy(plant, 555);
assert.deepEqual(matches(plant, firstColumn), [111]);
assert.deepEqual(matches(plant, firstRow), [555]);

const sourcePath = process.argv[2];
assert.ok(sourcePath, "Provide the authentic DATA/560.13 file path");
const pad = fs.readFileSync(sourcePath);
assert.equal(pad.length, 118818811, "Unexpected dataset length");
const padHash = crypto.createHash("sha256").update(pad).digest("hex");
assert.equal(padHash,
  "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");

/** @type {Array<{name:string,data:Buffer}>} */
const candidates = [];
const columnMajor = Buffer.from(Array.from({length: 256},
  (_, i) => table[(i % 32) * 8 + Math.floor(i / 32)]));
for (const [name, bytes] of [["row-major", table], ["column-major", columnMajor]]) {
  candidates.push({name, data: bytes});
  candidates.push({name: name + "-reverse", data: Buffer.from(bytes).reverse()});
}
for (let row = 0; row < 32; row++) {
  const bytes = Buffer.from(table.subarray(row * 8, row * 8 + 8));
  candidates.push({name: "row" + row, data: bytes});
  candidates.push({name: "row" + row + "-reverse", data: Buffer.from(bytes).reverse()});
}
for (let col = 0; col < 8; col++) {
  const bytes = Buffer.from(Array.from({length: 32}, (_, row) => table[row * 8 + col]));
  candidates.push({name: "col" + col, data: bytes});
  candidates.push({name: "col" + col + "-reverse", data: Buffer.from(bytes).reverse()});
}
assert.equal(candidates.length, 84);
const hits = candidates.map(({name, data}) => ({
  name, length: data.length, sourceByteOffsets: matches(pad, data)
})).filter(x => x.sourceByteOffsets.length);
console.log(JSON.stringify({
  sourceTable: "LP2 pp49-51, 32 rows x 8, conditional radix60 byte parse",
  tableSHA256: tableHash, padSHA256: padHash, padLength: pad.length,
  candidates: candidates.length,
  nativePositiveControl: "32-byte column at 111; 8-byte row at 555",
  hits,
  decision: hits.length ? "Review exact source matches" :
    "No 256-byte full grid, 32-byte vertical column, or 8-byte horizontal row is present as a direct unchanged substring of DATA/560.13",
  scope: "Exact byte identity only; no keyed XOR, transformation or nonlinear use tested"
}, null, 2));
