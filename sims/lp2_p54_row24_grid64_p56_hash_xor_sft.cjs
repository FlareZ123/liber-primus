"use strict";
/**
 * Source-selected final-eight-row base60 table vs p56 AN END 64-byte hash.
 *
 * The original oversized first rune of physical p54 is A (GP index 24).
 * Original pp49-51 have 32 rows of eight base60 cells, and printed row24
 * begins with 00. This selects an 8x8=64-byte candidate suffix without
 * fitting any offsets to ciphertext. Original p56 prints one 64-byte digest.
 *
 * Run: node sims/lp2_p54_row24_grid64_p56_hash_xor_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const witness = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "cicada2014-anend-binary-witness.json"), "utf8"));

assert.equal(corpus.pages[54].indices[0], 24); // Enlarged original A.
assert.equal(corpus.pages[54].indices.length, 232);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
assert.equal(grid.alphabet.length, 60);
assert.equal(grid.rows[24][0], "00");

const bytes = Buffer.from(grid.rows.flat().map(token => {
  assert.equal(token.length, 2);
  const hi = grid.alphabet.indexOf(token[0]);
  const lo = grid.alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  const value = 60 * hi + lo;
  assert(value <= 255);
  return value;
}));
assert.equal(bytes.length, 256);
const first192 = bytes.subarray(0, 24 * 8);
const last64 = bytes.subarray(24 * 8);
const digest = Buffer.from(witness.target_hex, "hex");
assert.equal(last64.length, 64);
assert.equal(digest.length, 64);
assert.equal(last64[0], 0);
assert.deepEqual(
  grid.rows.flatMap((row, r) =>
    row.flatMap((token, c) => token === "00" ? [{row: r, col: c}] : [])),
  [{row: 24, col: 0}, {row: 28, col: 5}],
);
assert.equal(24 + corpus.pages[54].indices.length, 256);

/** @param {string} name @param {Buffer} input @returns {Buffer} */
function hash(name, input) {
  return crypto.createHash(name).update(input).digest();
}

/** @param {Buffer} a @param {Buffer} b @returns {Buffer} */
function xor(a, b) {
  assert.equal(a.length, b.length);
  return Buffer.from(a.map((byte, i) => byte ^ b[i]));
}

/** @param {Buffer} buf @returns {number} */
function printable(buf) {
  return Array.from(buf).filter(x => x >= 32 && x <= 126).length;
}

/** @param {Buffer} value @returns {string} */
function visible(value) {
  return Array.from(value).map(x =>
    x >= 32 && x <= 126 ? String.fromCharCode(x) : ".").join("");
}

const checks = {};
for (const name of ["sha512", "sha3-512", "blake2b512"]) {
  checks[name] = {
    gridFirst192HashEqualsGridLast64: hash(name, first192).equals(last64),
    gridFirst192HashEqualsPrintedP56Digest: hash(name, first192).equals(digest),
    gridLast64HashEqualsPrintedP56Digest: hash(name, last64).equals(digest),
  };
  assert(Object.values(checks[name]).every(value => !value));
}
const xored = xor(last64, digest);
assert.equal(xored.length, 64);
assert.equal(printable(xored), 19);
assert(!xored.includes(Buffer.from("CICADA")));

// Two independent positive controls using exactly the same declared operators.
const plantedDigest = hash("sha512", first192);
assert.equal(plantedDigest.length, last64.length);
assert(hash("sha512", first192).equals(plantedDigest));
const plantedAscii = Buffer.from(
  "CICADA SOURCE SELECTED BYTE XOR ORIGINAL 64 BYTE CONTROL".padEnd(64, " "),
  "ascii",
);
assert.equal(plantedAscii.length, 64);
const plantedOther = xor(digest, plantedAscii);
assert(xor(digest, plantedOther).equals(plantedAscii));

console.log(JSON.stringify({
  source: "Original LP2 pp49-51 numeric table, p54 oversized first rune, p56 hash",
  p54FirstGpIndex: 24,
  sourceRow24FirstToken: grid.rows[24][0],
  sourceZeroPositions: [{row:24,col:0},{row:28,col:5}],
  gridSplit: [first192.length, last64.length],
  printedP56DigestBytes: digest.length,
  rowMajorLast64Hex: last64.toString("hex"),
  directDigestChecks: checks,
  directXorPrintable: printable(xored),
  directXorOf64Ascii: visible(xored),
  directXorHex: xored.toString("hex"),
  fixedPositiveControls: "SHA512 exact plant, XOR exact 64-byte ASCII plant",
  conclusion: "No direct hash relation or readable XOR. Row24 64-byte suffix is a candidate source register without a selected cipher.",
}, null, 2));
