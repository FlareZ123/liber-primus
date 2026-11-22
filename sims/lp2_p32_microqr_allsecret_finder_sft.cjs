"use strict";

/**
 * Source-exact, all-secret Micro QR M1 finder obstruction on original
 * LP2 physical p32, read as the source-linked 11x11 GP rune array.
 * Node.js 22 CommonJS, no dependencies. Run directly:
 *   node sims/lp2_p32_microqr_allsecret_finder_sft.cjs
 *
 * ISO/IEC 18004:2015 sections 6.3.2.2 and 6.3.3.2 define M1 as
 * 11x11 and require a fixed 7x7 QR finder. No source clue says this
 * manuscript actually encodes QR. The tested hypothesis is deliberately
 * limited to literal, position-wise binary readings of original runes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json");
const corpus = JSON.parse(fs.readFileSync(file, "utf8"));
const p32 = corpus.pages.find(p => p.page === 32);
assert.equal(p32.indices.length, 121);
const SIDE = 11;
const FINDER = 7;
const rune = (r, c) => p32.indices[SIDE * r + c];
const width = Array.from({length: SIDE}, (_, c) => corpus.prime[rune(0, c)])
  .reduce((a, b) => a + b);
const height = Array.from({length: SIDE}, (_, r) => corpus.prime[rune(r, 0)])
  .reduce((a, b) => a + b);
assert.deepEqual([width, height], [563, 569]);

/** @param {number} r @param {number} c @returns {number} */
function finderBit(r, c) {
  return Number(r === 0 || c === 0 || r === 6 || c === 6 ||
    (r >= 2 && r <= 4 && c >= 2 && c <= 4));
}

/**
 * Exact linear consistency over GF(2). Every runic label gets a free,
 * unspecified bit; optional local row and column masks get additional
 * free bits. This covers an arbitrary secret 29->binary lookup and,
 * when enabled, independent XOR choices for seven rows and columns.
 *
 * @param {number[]} grid Row-major 11x11 source runes
 * @param {number} r0 Placement's top row, 0..4
 * @param {number} c0 Placement's left column, 0..4
 * @param {boolean} rows Allow 7 independent row masks
 * @param {boolean} cols Allow 7 independent column masks
 * @returns {{consistent:boolean,rank:number,usedLabels:number}}
 */
function feasible(grid, r0, c0, rows, cols) {
  const obs = [];
  for (let r = 0; r < FINDER; r++)
    for (let c = 0; c < FINDER; c++)
      obs.push({r, c, symbol: grid[(r + r0) * SIDE + c + c0],
        bit: finderBit(r, c)});
  const symbols = [...new Set(obs.map(x => x.symbol))];
  const indexes = new Map(symbols.map((v, i) => [v, i]));
  const length = symbols.length;
  const basis = new Map();
  for (const {r, c, symbol, bit} of obs) {
    let mask = 1n << BigInt(indexes.get(symbol));
    if (rows) mask ^= 1n << BigInt(length + r);
    if (cols) mask ^= 1n << BigInt(length + (rows ? FINDER : 0) + c);
    let parity = bit;
    while (mask !== 0n) {
      const highest = mask.toString(2).length - 1;
      const pivot = basis.get(highest);
      if (pivot) {
        mask ^= pivot.mask;
        parity ^= pivot.parity;
      } else {
        basis.set(highest, {mask, parity});
        break;
      }
    }
    if (mask === 0n && parity === 1)
      return {consistent: false, rank: basis.size, usedLabels: length};
  }
  return {consistent: true, rank: basis.size, usedLabels: length};
}

/** @param {number[]} grid @param {number} r0 @param {number} c0 */
function directMinimumMismatches(grid, r0, c0) {
  const values = new Map();
  for (let r = 0; r < FINDER; r++)
    for (let c = 0; c < FINDER; c++) {
      const symbol = grid[SIDE * (r + r0) + c + c0];
      const counts = values.get(symbol) || [0, 0];
      counts[finderBit(r, c)]++;
      values.set(symbol, counts);
    }
  return [...values.values()].reduce((sum, counts) => sum + Math.min(...counts), 0);
}

// Independent positive controls: a synthetic true finder with a two-rune
// binary coloring and optional row/column XOR masks must be accepted.
for (const [r0, c0] of [[0, 0], [4, 0], [0, 4], [4, 4]]) {
  const synthetic = new Array(SIDE * SIDE).fill(0);
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 7; c++)
      synthetic[(r + r0) * SIDE + c + c0] =
        finderBit(r, c) ^ Number(r % 2 === 0) ^ Number(c % 3 === 0);
  assert.equal(feasible(synthetic, r0, c0, true, true).consistent, true);
}
const plainSynthetic = new Array(SIDE * SIDE).fill(0);
for (let r = 0; r < 7; r++)
  for (let c = 0; c < 7; c++) plainSynthetic[r * SIDE + c] = finderBit(r, c);
assert.equal(feasible(plainSynthetic, 0, 0, false, false).consistent, true);

// Four source-original runes yield an impossibility witness even with
// independent secret row+column XORs: equal runes repeat in opposite
// rows (M,M and W,W), so the XOR of the four predicted bits must be 0.
// The QR finder instead specifies bits (1,0,0,0), whose XOR equals 1.
const witness = [[3, 2, 1], [3, 5, 0], [5, 2, 0], [5, 5, 0]];
assert.equal(rune(3, 2), rune(5, 2));
assert.equal(rune(3, 5), rune(5, 5));
assert.equal(corpus.translit[rune(3, 2)], "M");
assert.equal(corpus.translit[rune(3, 5)], "W");
assert.equal(witness.reduce((s, [r, c, b]) => s ^ finderBit(r, c) ^ b, 0), 0);
assert.equal(witness.reduce((s, [, , b]) => s ^ b, 0), 1);

const flags = [{name: "secret-rune-only", rows: false, cols: false},
  {name: "secret-rune-and-row", rows: true, cols: false},
  {name: "secret-rune-and-column", rows: false, cols: true},
  {name: "secret-rune-row-and-column", rows: true, cols: true}];
const counts = Object.fromEntries(flags.map(x => [x.name, 0]));
const cornerMinimum = [];
let placements = 0;
for (let r0 = 0; r0 <= SIDE - FINDER; r0++) {
  for (let c0 = 0; c0 <= SIDE - FINDER; c0++) {
    placements++;
    for (const {name, rows, cols} of flags) {
      const actual = feasible(p32.indices, r0, c0, rows, cols);
      if (actual.consistent) counts[name]++;
    }
    if ((r0 === 0 || r0 === 4) && (c0 === 0 || c0 === 4))
      cornerMinimum.push({finderOrigin: [r0, c0],
        minimumErrorsWithoutRowColumnMasks:
          directMinimumMismatches(p32.indices, r0, c0)});
  }
}
assert.equal(placements, 25);
assert.deepEqual(counts, Object.fromEntries(flags.map(x => [x.name, 0])));
assert.deepEqual(cornerMinimum.map(x => x.minimumErrorsWithoutRowColumnMasks),
  [9, 9, 7, 12]);
const xorCertificate = witness.map(([r, c, target]) => ({
  row: r, column: c, originalRuneOffset: r * SIDE + c,
  rune: corpus.runes[rune(r, c)], transliteration: corpus.translit[rune(r, c)],
  requiredFinderBit: target
}));
console.log(JSON.stringify({
  original: "LP2 physical p32, 121 runes, source-motivated 11x11 row-major map",
  imageChecksum: {width, height},
  isoMicroQR: {version: "M1", modules: [11, 11], finder: [7, 7]},
  finderPlacements: placements,
  successfulPlacementsUnderUnknownBinaryMappings: counts,
  directCornerMinimumErrors: cornerMinimum,
  exactTopLeftGF2Contradiction: xorCertificate,
  positiveTests: "true binary finder and unknown row+column XOR finder recovered",
  conclusion: "Literal binary Micro QR ruled out even with arbitrary secret symbol bits and separable row/column XOR masks; no original plaintext or key recovered"
}, null, 2));

module.exports = {feasible, finderBit, directMinimumMismatches};
