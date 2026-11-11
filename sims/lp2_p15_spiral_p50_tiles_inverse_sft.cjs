"use strict";

/** Exact p15 4x4 spiral applied to sixteen original p49–p51 4x4 byte tiles. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources", "liber-primus");
/** @type {{byte_rows:number[][],rows:string[][],alphabet:string}} */
const grid = JSON.parse(fs.readFileSync(path.join(root, "base60-grid.json"), "utf8"));
/** @type {{pages:Array<{page:number, indices:number[]}>,runes:string,translit:string[]}} */
const book = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));

// Source p15 has red 3299 at row1,col1. Its successive next terms
// are right, down, left2, up2, right3, down3, left3.
const P15_SPIRAL = Object.freeze([5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12]);
const printedP15 = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const fibonacciPrinted = [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
assert.deepEqual(P15_SPIRAL.map((i) => printedP15[Math.floor(i / 4)][i % 4]), fibonacciPrinted);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((r) => r.length === 8));
assert.equal(grid.rows.length, 32);
assert.equal(grid.alphabet.length, 60);

/**
 * Contiguous source 4x4 tiles: 8 block rows and 2 block columns.
 * Preserve the printed tile order, and inside each tile use the p15 spiral.
 * @returns {number[]} 256 exact table bytes in the proposed readout order.
 */
function tileSpiralBytes() {
  const output = [];
  for (let br = 0; br < 8; br++) {
    for (let bc = 0; bc < 2; bc++) {
      const tile = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) tile.push(grid.byte_rows[br * 4 + r][bc * 4 + c]);
      }
      output.push(...P15_SPIRAL.map((index) => tile[index]));
    }
  }
  return output;
}

/**
 * @param {number[]} bytes
 * @param {readonly number[]} signature
 * @returns {number} Source offset, -1 if no match.
 */
function findSignature(bytes, signature) {
  for (let i = 0; i <= bytes.length - signature.length; i++) {
    if (signature.every((s, j) => bytes[i + j] === s)) return i;
  }
  return -1;
}

/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((n, c) => n + c * (c - 1), 0) / (values.length * (values.length - 1));
}

const bare = grid.byte_rows.flat();
const spiral = tileSpiralBytes();
assert.equal(spiral.length, 256);
assert.deepEqual([...spiral].sort((a, b) => a - b), [...bare].sort((a, b) => a - b));
const original = book.pages.slice(0, 56).flatMap((page) => page.indices);
const control = book.pages[57].indices;
assert.equal(original.length, 12956);
assert.equal(control.length, 95);
const key = spiral.map((b) => b % 29);
const decrypt = (cipher) => cipher.map((c, i) => (c - key[i % 256] + 29) % 29);
const encrypt = (plain) => plain.map((p, i) => (p + key[i % 256]) % 29);
const plain = decrypt(original);
assert.deepEqual(encrypt(plain), original);
const planted = Array.from({length: original.length}, (_, i) => control[i % control.length]);
assert.deepEqual(decrypt(encrypt(planted)), planted);
const signatures = {
  ZIP: [0x50,0x4B,0x03,0x04],
  PNG: [0x89,0x50,0x4E,0x47],
  GIF: [0x47,0x49,0x46,0x38],
  PDF: [0x25,0x50,0x44,0x46],
  GZIP: [0x1F,0x8B,0x08],
  ZLIB: [0x78,0x9C],
  ID3: [0x49,0x44,0x33],
  RIFF: [0x52,0x49,0x46,0x46],
  ELF: [0x7F,0x45,0x4C,0x46]
};
const offsets = Object.fromEntries(Object.entries(signatures).map(([type, bytes]) => [
  type, {printed: findSignature(bare, bytes), tileSpiral: findSignature(spiral, bytes)}
]));
assert.ok(Object.values(offsets).every((o) => o.tileSpiral < 0));
const report = {
  originalCiphertextRunes: original.length,
  originalTiles: 16,
  tileShape: "4x4",
  distinctByteValues: new Set(spiral).size,
  printFirst32Hex: Buffer.from(bare.slice(0, 32)).toString("hex"),
  spiralFirst32Hex: Buffer.from(spiral.slice(0, 32)).toString("hex"),
  signatures: offsets,
  rawCiphertextIoC: indexOfCoincidence(original),
  decodedIoC: indexOfCoincidence(plain),
  solvedP57IoC: indexOfCoincidence(control),
  exactReencryptedRunes: original.length,
  plantedRecoveredRunes: planted.length,
  decodedFirst95Gp: plain.slice(0, 95).map((x) => book.translit[x]).join(" ")
};
console.log(JSON.stringify(report, null, 2));
