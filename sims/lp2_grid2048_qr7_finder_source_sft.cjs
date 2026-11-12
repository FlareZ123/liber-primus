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

/**
 * ZXing Aztec full-range, seven-layer 45×45 source geometry.
 * Reference: zxing/core/.../aztec/encoder/Encoder.java drawBullsEye,
 * with center=22 and size=7, plus its six source-fixed orientation cells.
 * The inner 13×13 has seven alternating Manhattan/Chebyshev square rings;
 * mode data begins at radius 7 and is excluded except orientation cells.
 * @returns {number[][]}
 */
function aztecFixedCells() {
  const center = 22;
  const cells = [];
  for (let dr = -6; dr <= 6; dr++) {
    for (let dc = -6; dc <= 6; dc++) {
      const radius = Math.max(Math.abs(dr), Math.abs(dc));
      cells.push([center + dr, center + dc, Number(radius % 2 === 0)]);
    }
  }
  for (const [r, c] of [
    [-7, -7], [-6, -7], [-7, -6], [7, -7], [7, -6], [7, 6]
  ]) cells.push([center + r, center + c, 1]);
  return cells;
}
const AZTEC = aztecFixedCells();
assert.equal(AZTEC.length, 175);

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
 * @param {number[][]} pattern
 * @returns {{score:number, corners:number[]}}
 */
function scoreFinders(modules, rotation, reflection, inverted, pattern = FINDERS) {
  let score = 0;
  const corners = [0, 0, 0];
  for (let i = 0; i < pattern.length; i++) {
    const [row, column, expected] = pattern[i];
    let r = row;
    let c = reflection ? SIDE - 1 - column : column;
    for (let n = 0; n < rotation; n++) {
      const oldR = r;
      r = c;
      c = SIDE - 1 - oldR;
    }
    if ((modules[r * SIDE + c] ^ Number(inverted)) === expected) {
      score++;
      if (pattern === FINDERS) corners[Math.floor(i / 49)]++;
    }
  }
  return {score, corners};
}

/**
 * @param {number[][]} matrix Original 32x8 source, or a planted 32x8 byte matrix
 */
function search(matrix, pattern = FINDERS) {
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
                  ...scoreFinders(image, rotation, reflected, inverted, pattern)
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

  // Five previously published image-audited alternative source bytes have a
  // *total* Hamming distance of only 20 to the canonical 256-byte table.
  // Any subset, under any one fixed QR presentation above, can improve the
  // score by at most 20. Hence all 32 source choices fail without another
  // fitted search or reliance on the canonical transcription alone.
  const sourceAlternatives = [[45, 81], [50, 21], [165, 47],
    [172, 174], [246, 224]];
  let maximumBitChanges = 0;
  for (const [i, alternative] of sourceAlternatives) {
    let changed = matrix.flat()[i] ^ alternative;
    while (changed !== 0) {
      maximumBitChanges += changed & 1;
      changed >>>= 1;
    }
  }
  assert.equal(maximumBitChanges, 20);
  assert.ok(original[0].score + maximumBitChanges < 147);

  // An independently recognizable symbol has exactly the same 45x45 side:
  // full-range Aztec Code, seven layers. The stationary 13x13 central
  // bullseye and its six orientation bits are mandatory irrespective of
  // Aztec payload, data-layer ECC or side-border patterns. This tests the
  // *same* 256 source-natural raster presentations, without another key.
  const aztec = search(matrix, AZTEC);
  assert.equal(aztec[0].score, 105);
  assert.ok(aztec[0].score + maximumBitChanges < AZTEC.length);
  const plantedAztecBits = Array.from({length: MODULES}, (_, i) =>
    plantedBits[i]);
  for (const [r, c, value] of AZTEC) {
    plantedAztecBits[r * SIDE + c] = value;
  }
  const aztecPlant = search(makeTable(plantedAztecBits.concat(
    Array(23).fill(0))), AZTEC);
  assert.equal(aztecPlant[0].score, AZTEC.length);

  console.log(JSON.stringify({
    hypothesis: "First/last 23 bits removed from 256 original bytes; 45x45 QR v7 raster",
    sourceBytes: 256, sourceBits: 2048, qrBits: MODULES,
    trimmedBits: 23, qrFinderBits: FINDERS.length,
    exactSourceSHA256: digest, originalVariants: original.length,
    originalBest: original[0], originalRunnerUp: original[1],
    maxAlternativeBitFlips: maximumBitChanges,
    allAlternativeFinderMatchesUpperBound: original[0].score + maximumBitChanges,
    positivePlantFinderMatches: planted[0].score,
    originalHasRequiredFinders: false,
    aztecFullRange45x45: {
      requiredFinderModules: AZTEC.length,
      originalBest: aztec[0],
      alternativeSourceUpperBound: aztec[0].score + maximumBitChanges,
      plantedFinderMatches: aztecPlant[0].score,
      originalHasRequiredFinders: false
    },
    conclusion: "Direct source-serialized QR-v7 raster is excluded; no unknown LP2 text recovered."
  }, null, 2));
}
main();
