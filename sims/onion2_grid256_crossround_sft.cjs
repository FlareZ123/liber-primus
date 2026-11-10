"use strict";

/**
 * SFT: source-constrained direct cross-round bridge.
 * Original inputs: archived Cicada 2014 onion-2 256-byte growing string
 * and the 256-byte base-60 interpretation of LP2 pp49-51's 32x8 grid.
 * Only the published byte orders, row/column readout, full reversal,
 * XOR, addition/subtraction, natural SHA-256/SHA-512 blocks and a
 * 64x32 unpacked monochrome raster are evaluated.
 *
 * Run: node sims/onion2_grid256_crossround_sft.cjs
 * No files are written and no language key is fitted.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relative */
function source(relative) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", relative), "utf8"));
}

/** @param {Buffer} data */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/** @param {Buffer} left @param {Buffer} right */
function byteMatches(left, right) {
  assert.equal(left.length, right.length);
  let count = 0;
  for (let i = 0; i < left.length; i++) if (left[i] === right[i]) count++;
  return count;
}

/** @param {Buffer} data */
function printedMetrics(data) {
  let printable = 0;
  let run = 0;
  let longest = 0;
  for (const value of data) {
    if (value >= 32 && value <= 126) {
      printable++;
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return { printable, longest };
}

/** @param {Buffer} a @param {Buffer} b @param {"xor"|"plus"|"minus"} op */
function combine(a, b, op) {
  return Buffer.from(a.map((value, i) =>
    op === "xor" ? (value ^ b[i]) : op === "plus" ?
      ((value + b[i]) & 255) : ((value - b[i]) & 255)
  ));
}

/** @param {Buffer} a @param {Buffer} b */
function multisetOverlap(a, b) {
  const counts = new Uint16Array(256);
  for (const v of a) counts[v]++;
  let matches = 0;
  for (const v of b) if (counts[v] > 0) { counts[v]--; matches++; }
  return matches;
}

/** @param {Buffer} data @param {"sha256"|"sha512"} algorithm @param {number} chunks */
function hashBlocks(data, algorithm, chunks) {
  const partSize = data.length / chunks;
  const output = [];
  for (let i = 0; i < chunks; i++) {
    output.push(crypto.createHash(algorithm)
      .update(data.subarray(i * partSize, (i + 1) * partSize)).digest());
  }
  return Buffer.concat(output);
}

/** @param {Buffer} b @param {boolean} msb */
function bitmapStats(b, msb) {
  const bits = Array.from({ length: 32 }, (_, row) =>
    Array.from({ length: 64 }, (_, col) =>
      (b[row * 8 + (col >> 3)] >> (msb ? 7 - (col & 7) : (col & 7))) & 1
    )
  );
  let ones = 0;
  let horizontal = 0;
  let vertical = 0;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 64; x++) {
      ones += bits[y][x];
      if (x < 63 && bits[y][x] === bits[y][x + 1]) horizontal++;
      if (y < 31 && bits[y][x] === bits[y + 1][x]) vertical++;
    }
  }
  return { ones, horizontal, vertical, horizontalPairs: 2016, verticalPairs: 1984 };
}

function main() {
  const onionRecord = source("resources/cicada2014-onion2-timing.json");
  const gridRecord = source("resources/liber-primus/lp2-grid-256.json");
  assert.match(onionRecord.final_hex, /^[0-9a-f]{512}$/i);
  assert(Array.isArray(gridRecord.bytes) && gridRecord.bytes.length === 256);
  assert(gridRecord.bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

  const onion = Buffer.from(onionRecord.final_hex, "hex");
  const grid = Buffer.from(gridRecord.bytes);
  assert.equal(onion.length, 256);
  assert.equal(grid.length, 256);
  assert.equal(sha256(onion), "05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56");
  assert.equal(sha256(grid), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const transposed = Buffer.from(Array.from({ length: 256 }, (_, i) =>
    grid[(i % 32) * 8 + Math.floor(i / 32)]
  ));
  const orientations = [
    ["row", grid],
    ["column", transposed],
    ["row_reverse", Buffer.from(grid).reverse()],
    ["column_reverse", Buffer.from(transposed).reverse()]
  ];
  const overlap = multisetOverlap(onion, grid);
  assert.equal(overlap, 125);
  console.log("Source SHA256 onion:", sha256(onion));
  console.log("Source SHA256 grid: ", sha256(grid));
  console.log("Source byte inventory overlap:", overlap, "of 256 (not a permutation)");
  for (const [name, table] of orientations) {
    const outputs = {};
    for (const operation of ["xor", "plus", "minus"]) {
      const result = combine(onion, table, operation);
      outputs[operation] = {
        ...printedMetrics(result),
        first8Hex: result.subarray(0, 8).toString("hex")
      };
    }
    console.log(name, "direct matches:", byteMatches(onion, table), JSON.stringify(outputs));
  }
  for (const [algorithm, chunks] of [["sha256", 8], ["sha512", 4]]) {
    const hashed = hashBlocks(onion, algorithm, chunks);
    for (const [name, table] of orientations) {
      const identicalChunks = Array.from({ length: chunks }, (_, i) => i)
        .filter(i => hashed.subarray(i * (256 / chunks), (i + 1) * (256 / chunks))
          .equals(table.subarray(i * (256 / chunks), (i + 1) * (256 / chunks)))).length;
      assert.equal(identicalChunks, 0);
      console.log(algorithm, chunks, name,
        "byte matches:", byteMatches(hashed, table),
        "complete digest matches:", identicalChunks);
    }
  }
  for (const msb of [true, false]) {
    console.log("bitmap_32x64", msb ? "MSB" : "LSB", JSON.stringify(bitmapStats(grid, msb)));
  }
  console.log("Decision: no direct original-to-original plaintext, permutation or digest-block bridge.");
}

main();
