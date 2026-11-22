"use strict";
/**
 * Original 2014 OpenPuff 745-byte magic squares text as an unmodified XOR pad
 * for the original LP2 256-byte printed numerical grid.
 * Source-adjacent known historical recovered file, no fitted salt/offset.
 *
 * Run: node sims/lp2_2014_magic_square_plainbytes_grid_xor_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {Buffer} value */
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");

const squares = fs.readFileSync(path.join(ROOT, "resources/cicada2014-openpuff-magic-squares.txt"));
assert.equal(squares.length, 745);
assert.equal(sha256(squares), "9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const grid = Buffer.from(data.bytes);
assert.equal(grid.length, 256);
assert.equal(sha256(grid), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {Buffer} value */
function xorFromSourceStart(value) {
  assert.ok(value.length <= squares.length);
  return Buffer.from(value.map((b, i) => b ^ squares[i]));
}
/** @param {Buffer} value */
function summarize(value) {
  let printableCount = 0, run = 0, longestRun = 0, gp29Bytes = 0;
  for (const b of value) {
    const printable = b >= 32 && b <= 126 || b === 9 || b === 10 || b === 13;
    printableCount += +printable;
    run = printable ? run + 1 : 0;
    longestRun = Math.max(longestRun, run);
    gp29Bytes += +(b < 29);
  }
  const sig = [
    ["JPEG", "ffd8ff"], ["PNG", "89504e470d0a1a0a"], ["ZIP", "504b0304"],
    ["GZIP", "1f8b08"], ["PDF", "25504446"], ["GIF", "47494638"],
    ["PGP Armor", "2d2d2d2d2d"], ["RIFF", "52494646"], ["Ogg", "4f676753"],
    ["7zip", "377abcaf271c"], ["ID3", "494433"]
  ];
  return {
    length: value.length, sha256: sha256(value),
    leading32Hex: value.subarray(0, 32).toString("hex"),
    printableCount, longestPrintableRun: longestRun, directGpOrdinalBytes: gp29Bytes,
    fileMagic: sig.filter(([, s]) => value.subarray(0, s.length / 2).toString("hex") === s).map(([n]) => n)
  };
}
const output = xorFromSourceStart(grid);
assert.deepEqual(xorFromSourceStart(output), grid);
const known = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp1-plaintext-reference.txt")).subarray(0, 256);
assert.equal(known.length, 256);
const plant = xorFromSourceStart(known);
assert.deepEqual(xorFromSourceStart(plant), known);
console.log(JSON.stringify({
  source: "2014 originally OpenPuff-recovered magicsquares.txt, raw first 256 of 745 authentic bytes",
  originalPrintedGrid: summarize(grid),
  directOriginalXor: summarize(output),
  exactReencryption: true,
  solvedSourcePositive: "256/256 original LP1 plaintext bytes recovered by same source XOR",
  interpretation: "No separate XOR prescription is authenticated; claim plaintext only from source-natural readable output, not a roundtrip"
}, null, 2));
