"use strict";

/**
 * Source-fixed all-secret Data Matrix finder test for original LP2 p32.
 * Run with Node.js 22 from any working directory.
 * No third-party packages or cipher assumptions are required.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
    "utf8"
  )
);
const source = corpus.pages.find((page) => page.page === 32);
assert.ok(source, "Original physical LP2 p32 must exist");
assert.equal(source.indices.length, 121);

const grid = Array.from({ length: 11 }, (_, row) =>
  source.indices.slice(11 * row, 11 * row + 11)
);
const sumPrimes = (indices) =>
  indices.reduce((total, rune) => total + corpus.prime[rune], 0);

assert.equal(sumPrimes(grid[0]), 563, "Signed 2016 image width");
assert.equal(sumPrimes(grid.map((row) => row[0])), 569, "Signed 2016 image height");

const interior = grid.slice(1).map((row) => row.slice(1));
assert.ok(interior.every((row) => row.length === 10));

/**
 * One-module-wide ECC200 Data Matrix finder for a 10-by-10 symbol:
 * solid left/bottom; alternating top/right; bottom-right dark.
 * @param {number} x 0..9
 * @param {number} y 0..9
 * @returns {number|null} 1 dark, 0 light, null data-only interior
 */
function finderBit(x, y) {
  if (x === 0 || y === 9) return 1;
  if (y === 0) return Number(x % 2 === 0);
  if (x === 9) return Number(y % 2 === 1);
  return null;
}

/**
 * Map displayed finder coordinates back to source rune coordinates.
 * @param {number} x
 * @param {number} y
 * @param {number} rotations Quarter-turns, 0..3
 * @param {number} reflection 0 or 1
 * @returns {[number, number]}
 */
function orient(x, y, rotations, reflection) {
  if (reflection) x = 9 - x;
  for (let i = 0; i < rotations; i += 1) {
    const oldX = x;
    x = 9 - y;
    y = oldX;
  }
  return [x, y];
}

/**
 * Exact lower bound on finder errors under all 2^29 stationary rune-to-bit
 * alphabets. For each rune, the majority required color is optimal.
 * @param {number[][]} board 10-by-10 GP29 rune ordinals
 * @param {number} rotations 0..3
 * @param {number} reflection 0 or 1
 * @returns {{ errors:number, conflicts:number, distinct:number, cells:number }}
 */
function minimumFinderErrors(board, rotations, reflection) {
  /** @type {Map<number, [number,number]>} */
  const counts = new Map();
  let cells = 0;
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 10; x += 1) {
      const bit = finderBit(x, y);
      if (bit === null) continue;
      const [xx, yy] = orient(x, y, rotations, reflection);
      const rune = board[yy][xx];
      const tally = counts.get(rune) || [0, 0];
      tally[bit] += 1;
      counts.set(rune, tally);
      cells += 1;
    }
  }
  const tallies = [...counts.values()];
  return {
    errors: tallies.reduce((n, t) => n + Math.min(t[0], t[1]), 0),
    conflicts: tallies.filter((t) => t[0] > 0 && t[1] > 0).length,
    distinct: tallies.length,
    cells,
  };
}

const orientations = [];
for (let rot = 0; rot < 4; rot += 1) {
  for (let ref = 0; ref <= 1; ref += 1) {
    orientations.push({ rot, ref, ...minimumFinderErrors(interior, rot, ref) });
  }
}

assert.deepEqual(
  orientations.map((entry) => entry.errors),
  [5, 5, 5, 5, 8, 5, 5, 8],
  "All-secret original-p32 finder mismatch certificate"
);
assert.ok(orientations.every((entry) => entry.cells === 36));
assert.ok(orientations.every((entry) => entry.distinct === 22));
assert.ok(orientations.every((entry) => entry.errors >= 5));

/* Positive plant: make a genuine 36/36 finder using a stationary rune alphabet.
 * Even ordinal 0 denotes light, odd ordinal 1 denotes dark. Data cells vary
 * deterministically, and no original ciphertext rune is altered in testing.
 */
const planted = interior.map((row, y) =>
  row.map((_, x) => {
    const bit = finderBit(x, y);
    return bit === null ? (x * 3 + y * 7) % 2 : bit;
  })
);
assert.equal(minimumFinderErrors(planted, 0, 0).errors, 0);

console.log("Original LP2 p32 first-axis prime sums: 563 x 569.");
console.log("Source-preserving 11x11 reflow -> 10x10 interior; 36 finder cells.");
for (const result of orientations) {
  console.log(
    `rot=${result.rot} mirror=${result.ref} ` +
      `minimum-errors=${result.errors}/36 ` +
      `conflicting-glyphs=${result.conflicts} ` +
      `distinct-finder-glyphs=${result.distinct}`
  );
}
console.log("Stationary all-secret glyph-to-bit Data Matrix: EXCLUDED.");
console.log("Positive syntactic finder plant: 0/36 errors. No LP2 plaintext.");
