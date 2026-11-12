"use strict";

/**
 * One frozen p15 4x4 rank-S-box transfer to the pp49-51 256-byte table.
 * Single runnable Node.js 22 CommonJS test. No secret-key or phase search.
 *
 * Source: the original physical p15 Fibonacci-prime square, archive 32.jpg.
 * The table uses the repository's original row-major base60 byte parse.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const table = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = table.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// Source-exact PRINTED row order. The third-row first entry is 3288.
const square = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820
];
assert.equal(new Set(square).size, 16);
assert.equal(square[5], 3299);

const ordered = square.slice().sort((a, b) => a - b);
const rank = square.map(value => ordered.indexOf(value));

/** @param {number[]} permutation */
function inverse(permutation) {
  const result = Array(16);
  permutation.forEach((value, index) => { result[value] = index; });
  assert.equal(new Set(result).size, 16);
  return result;
}

/** @param {number[]} source @param {number[]} permutation */
function applyNibbles(source, permutation) {
  return source.map(value => (permutation[value >>> 4] << 4) |
    permutation[value & 15]);
}

const families = [
  ["rank", rank],
  ["inverse", inverse(rank)],
  ["descending", rank.map(value => 15 - value)],
  ["descending-inverse", inverse(rank.map(value => 15 - value))]
];
const expectedPrintable = [96, 90, 89, 91];
for (const [index, [name, permutation]] of families.entries()) {
  const decoded = applyNibbles(bytes, permutation);
  const encoded = applyNibbles(decoded, inverse(permutation));
  assert.deepEqual(encoded, bytes, name + " original-input inverse");
  const printable = decoded.filter(v => v >= 32 && v <= 126).length;
  assert.equal(printable, expectedPrintable[index], name + " source regression");
  console.log(name, "ASCII-printable", printable + "/256",
    "first-32-hex", Buffer.from(decoded.slice(0, 32)).toString("hex"));
}

// The unmodified table has a limited high-nibble inventory. Every 4-bit
// bijection maps exactly six source high-nibble labels to printable-ASCII
// high nibbles 2,3,4,5,6,7. Even with an INDEPENDENT arbitrary bijection
// for the low nibble, at most the six largest high-nibble bins can print.
const highCounts = Array(16).fill(0);
for (const value of bytes) highCounts[value >>> 4]++;
const upperBound = highCounts.slice().sort((a, b) => b - a)
  .slice(0, 6).reduce((a, b) => a + b, 0);
assert.equal(upperBound, 120);
assert.equal(new Set(bytes).size, 161);
console.log("Any invertible 4-bit high/low S-box printable upper bound",
  upperBound + "/256", "unique-original-byte-values", 161);

// Positive control: no model-selective claim is inferred from roundtripping.
// Each S-box must exactly recover a new 256-byte ASCII message.
const native = Array.from({length: 256}, (_, i) =>
  "THE PRIMES ARE SACRED AND THE WORDS ARE A MAP. "[i % 46].charCodeAt(0));
assert(native.every(v => v >= 32 && v <= 126));
for (const [name, permutation] of families) {
  const cipher = applyNibbles(native, inverse(permutation));
  assert.deepEqual(applyNibbles(cipher, permutation), native, name + " plant");
}
console.log("PASS: four source-rank transforms; four ASCII native plants.");
