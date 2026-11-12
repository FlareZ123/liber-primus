"use strict";

/**
 * Original LP2 numeric-grid -> version-7 QR raster necessary-condition gate.
 * Node.js 22; no dependencies, no network and no runtime file writes.
 *
 * Historical data: 32x8 printed 2014 base-60 byte table at physical pp49–51.
 * A 256-byte table has 2048 bits. QR version 7 is 45x45 = 2025 modules.
 * The 23-bit difference can be placed at either source-stream end; the
 * terminal solved page also bears a unique 23-dot red punctuation mark.
 *
 * This tests literal QR module order, with ordinary byte bit conventions.
 * It does not test hidden transposition, external keys, QR encoded datawords,
 * or any bit assignment not specified by the 256 source byte values.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const table = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/base60-grid.json"), "utf8"));
const SIDE = 45;
const MODULES = SIDE * SIDE;
const FINDER_CORNERS = [[0, 0], [0, 38], [38, 0]];

/** @returns {number[][]} QR finder coordinates and expected dark/light bits. */
function finderCells() {
  const cells = [];
  for (const [top, left] of FINDER_CORNERS) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const dark = (r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        cells.push([top + r, left + c, Number(dark)]);
      }
    }
  }
  return cells;
}

const FINDERS = finderCells();
assert.equal(FINDERS.length, 147);

/** @param {number[]} bytes @param {boolean} msb */
function bitsFromBytes(bytes, msb) {
  return bytes.flatMap(byte => Array.from({length: 8}, (_, k) =>
    (byte >>> (msb ? 7 - k : k)) & 1));
}

/**
 * @param {number[]} modules
 * @param {number} rotation Count of quarter-turns
 * @param {boolean} reflection
 * @param {boolean} inverted
 * @returns {{score:number, corners:number[]}}
 */
function scoreFinders(modules, rotation, reflection, inverted) {
  let score = 0;
  const corners = [0, 0, 0];
  for (let i = 0; i < FINDERS.length; i++) {
    const [row, column, expected] = FINDERS[i];
    let r = row;
    let c = reflection ? SIDE - 1 - column : column;
    for (let n = 0; n < rotation; n++) {
      const oldR = r;
      r = c;
      c = SIDE - 1 - oldR;
    }
    if ((modules[r * SIDE + c] ^ Number(inverted)) === expected) {
      score++;
      corners[Math.floor(i / 49)]++;
    }
  }
  return {score, corners};
}

/**
 * @param {number[][]} matrix Original 32x8 source, or a planted 32x8 byte matrix
 */
function search(matrix) {
  const rowMajor = matrix.flat();
  const columnMajor = Array.from({length: 8}, (_, c) =>
    matrix.map(row => row[c])).flat();
  const results = [];

  for (const [order, values] of [
    ["row-major", rowMajor], ["column-major", columnMajor]
  ]) {
    for (const reversedBytes of [false, true]) {
      const bytes = reversedBytes ? values.slice().reverse() : values;
      for (const msbFirst of [true, false]) {
        const bits = bitsFromBytes(bytes, msbFirst);
        assert.equal(bits.length, 2048);
        for (const trim of ["first23", "last23"]) {
          const image = trim === "first23"
            ? bits.slice(23) : bits.slice(0, MODULES);
          assert.equal(image.length, MODULES);
          for (const inverted of [false, true]) {
            for (let rotation = 0; rotation < 4; rotation++) {
              for (const reflected of [false, true]) {
                results.push({
                  order, reversedBytes, msbFirst, trim,
                  inverted, rotation, reflected,
                  ...scoreFinders(image, rotation, reflected, inverted)
                });
              }
            }
          }
        }
      }
    }
  }
  assert.equal(results.length, 256);
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * @param {number[]} bitstream Exactly 2048 bits
 * @returns {number[][]} Source-shaped 32x8 numeric table
 */
function makeTable(bitstream) {
  assert.equal(bitstream.length, 2048);
  const bytes = Array.from({length: 256}, (_, i) => {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      value = (value << 1) | bitstream[i * 8 + j];
    }
    return value;
  });
  return Array.from({length: 32}, (_, r) =>
    bytes.slice(r * 8, (r + 1) * 8));
}

function main() {
  const matrix = table.byte_rows;
  assert.equal(matrix.length, 32);
  for (const row of matrix) {
    assert.equal(row.length, 8);
    for (const value of row) {
      assert.ok(Number.isInteger(value) && value >= 0 && value <= 255);
    }
  }
  const digest = crypto.createHash("sha256")
    .update(Buffer.from(matrix.flat())).digest("hex");
  assert.equal(digest,
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  // Fully independent source-shaped positive plant: random-looking 45x45
  // data modules with three authentic, fixed 7x7 finder patterns.
  let state = 0x3301f00d;
  const plantedBits = Array.from({length: MODULES}, () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state & 1;
  });
  for (const [r, c, bit] of FINDERS) {
    plantedBits[r * SIDE + c] = bit;
  }
  const plantedMatrix = makeTable(plantedBits.concat(Array(23).fill(0)));
  const planted = search(plantedMatrix);
  assert.equal(planted[0].score, 147);
  assert.deepEqual(planted[0].corners, [49, 49, 49]);

  const original = search(matrix);
  assert.equal(original[0].score, 86);
  assert.deepEqual(original[0].corners, [29, 29, 28]);
  assert.ok(original.every(result => result.score < 147));

  console.log(JSON.stringify({
    hypothesis: "First/last 23 bits removed from 256 original bytes; 45x45 QR v7 raster",
    sourceBytes: 256, sourceBits: 2048, qrBits: MODULES,
    trimmedBits: 23, qrFinderBits: FINDERS.length,
    exactSourceSHA256: digest, originalVariants: original.length,
    originalBest: original[0], originalRunnerUp: original[1],
    positivePlantFinderMatches: planted[0].score,
    originalHasRequiredFinders: false,
    conclusion: "Direct source-serialized QR-v7 raster is excluded; no unknown LP2 text recovered."
  }, null, 2));
}
main();
