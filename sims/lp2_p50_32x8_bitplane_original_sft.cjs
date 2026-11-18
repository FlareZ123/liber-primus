"use strict";

/**
 * Source-fixed 32 x 8 bit-plane reading of the printed LP2 p49-p51 byte grid.
 *
 * Each of the 32 printed rows offers eight bytes. Taking a single fixed bit
 * from every byte produces an eight-bit output byte per row. Eight bit choices
 * and two within-row orientations give exactly 16 source-geometric receivers.
 * This is a finite original-input typed-output test, not a claimed cipher.
 *
 * Windows 11, Node.js 22+, CommonJS, read-only, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const original = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-grid-256.json"),
  "utf8"
));
assert.equal(original.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.equal(original.bytes.length, 256);
assert.ok(original.bytes.every((value) =>
  Number.isInteger(value) && value >= 0 && value <= 255));
const bytes = Buffer.from(original.bytes);
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const sha512 = (buf) => crypto.createHash("sha512").update(buf).digest("hex");
assert.equal(sha256(bytes),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const knownPrintedTarget =
  "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8" +
  "425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.equal(knownPrintedTarget.length, 128);
assert.equal(sha512(Buffer.from("abc")),
  "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" +
  "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f");

/**
 * Extract 32 bytes from the original geometric grid.
 * @param {Buffer} source - Exactly 256 row-major byte values.
 * @param {number} bit - Fixed source bit 0..7.
 * @param {boolean} reverseColumns - Reverse only the eight columns in a row.
 * @returns {Buffer}
 */
function extract(source, bit, reverseColumns) {
  assert.equal(source.length, 256);
  assert.ok(Number.isInteger(bit) && bit >= 0 && bit <= 7);
  const decoded = Buffer.alloc(32);
  for (let row = 0; row < 32; row++) {
    let value = 0;
    for (let column = 0; column < 8; column++) {
      const extracted = (source[row * 8 + column] >>> bit) & 1;
      value |= extracted << (reverseColumns ? column : 7 - column);
    }
    decoded[row] = value;
  }
  return decoded;
}

// Positive: a known typed 32-byte payload planted into one selected bit plane.
const planted = Buffer.from("ORIGINAL-TYPED-BITPLANE-CONTROL!", "ascii");
assert.equal(planted.length, 32);
const artificial = Buffer.alloc(256);
for (let row = 0; row < 32; row++)
  for (let column = 0; column < 8; column++)
    artificial[row * 8 + column] =
      ((planted[row] >>> (7 - column)) & 1) << 2;
assert.deepEqual(extract(artificial, 2, false), planted);

const results = [];
for (let bit = 0; bit < 8; bit++)
  for (const reverseColumns of [false, true]) {
    const candidate = extract(bytes, bit, reverseColumns);
    const printableAscii = [...candidate].filter((c) =>
      c >= 32 && c <= 126).length;
    results.push({
      bit, read: reverseColumns ? "right-to-left" : "left-to-right",
      printableAscii, hex: candidate.toString("hex"),
      sha512MatchesPrintedTarget: sha512(candidate) === knownPrintedTarget
    });
  }


/**
 * A second literal bit-register interpretation lets each printed column
 * choose its corresponding bit significance rather than one common plane.
 * @param {Buffer} source
 * @param {boolean} descending
 * @param {boolean} reverseColumns
 * @returns {Buffer}
 */
function diagonalExtract(source, descending, reverseColumns) {
  assert.equal(source.length, 256);
  const decoded = Buffer.alloc(32);
  for (let row = 0; row < 32; row++) {
    let value = 0;
    for (let column = 0; column < 8; column++) {
      const bit = descending ? 7 - column : column;
      value |= ((source[row * 8 + column] >>> bit) & 1) <<
        (reverseColumns ? column : 7 - column);
    }
    decoded[row] = value;
  }
  return decoded;
}

const diagonals = [];
for (const descending of [false, true])
  for (const reverseColumns of [false, true]) {
    const candidate = diagonalExtract(bytes, descending, reverseColumns);
    diagonals.push({
      bitColumnOrder: descending ? "7..0" : "0..7",
      byteDirection: reverseColumns ? "right-to-left" : "left-to-right",
      printableAscii: [...candidate].filter((c) => c >= 32 && c <= 126).length,
      hex: candidate.toString("hex"),
      sha512MatchesPrintedTarget: sha512(candidate) === knownPrintedTarget
    });
  }
assert.equal(diagonals.length, 4);
assert.equal(diagonals.filter((x) => x.sha512MatchesPrintedTarget).length, 0);
assert.ok(diagonals.every((x) => x.printableAscii <= 14));

assert.equal(results.length, 16);
assert.equal(results.filter((x) => x.sha512MatchesPrintedTarget).length, 0);
assert.equal(Math.max(...results.map((x) => x.printableAscii)), 18);
assert.notEqual(sha512(bytes), knownPrintedTarget);

console.log(JSON.stringify({
  source: "Original 256 printed p49-p51 base60-decoded bytes, 32x8",
  inputSha256: sha256(bytes),
  rule: "One fixed bit per source cell, eight columns per output byte",
  orientations: 2,
  tested: results.length,
  maxPrintableAsciiOf32: Math.max(...results.map((x) => x.printableAscii)),
  matchedPrinted512BitTargetUnderSha512: false,
  originalWholeTableSha512Match: false,
  results,
  diagonalColumnBitReads: diagonals,
  conclusion: "No direct printable 32-byte text or exact p56 target preimage in this finite geometry"
}, null, 2));
console.log("PASS: 20 source-fixed original table bit-register reads and typed positive");
