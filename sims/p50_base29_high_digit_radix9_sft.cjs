"use strict";

/**
 * Original-grid high-digit BASE9 source gate.
 *
 * The 2013 source BASE29 example and p39 red triad identify two exact GF(29)
 * factors of the original 256-byte LP2 numeric table. This study tests one
 * separate lossless interpretation of the 256 otherwise unconstrained byte
 * quotient values: b = 29*q + r, where 0 <= q <= 8 and 0 <= r < 29.
 * The q values are fixed radix-9 digits (not GP29 runes).
 *
 * It checks ONLY big-endian, original printed row-major digit order.
 * No offsets, dictionaries, key searches or ambiguous packing conventions.
 *
 * Run in repo: node sims/p50_base29_high_digit_radix9_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const source = readJson("resources/liber-primus/base60-grid.json");
const bytes = source.byte_rows.flat();
assert.equal(source.byte_rows.length, 32);
assert(source.byte_rows.every(row => row.length === 8));
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} x */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number[]} original @param {number[]} polynomial */
function divide29(original, polynomial) {
  const residue = original.map(mod29), quotient = [];
  let inv = 0;
  for (let i = 1; i < 29; i++) if (mod29(i * polynomial[0]) === 1) inv = i;
  assert.notEqual(inv, 0);
  for (let i = 0; i <= original.length - polynomial.length; i++) {
    const coefficient = mod29(residue[i] * inv);
    quotient.push(coefficient);
    for (let j = 0; j < polynomial.length; j++) {
      residue[i + j] = mod29(residue[i + j] - coefficient * polynomial[j]);
    }
  }
  return {quotient, remainder: residue.slice(quotient.length)};
}
const h = divide29(bytes, [24, 26, 3]);
const g = divide29(h.quotient, [15, 5, 27]);
assert.deepEqual(h.remainder, [0, 0]);
assert.deepEqual(g.remainder, [0, 0]);
assert.equal(g.quotient.length, 252);

const lower = bytes.map(b => b % 29);
const higher = bytes.map(b => Math.floor(b / 29));
assert(higher.every(d => Number.isInteger(d) && d >= 0 && d <= 8));
assert(bytes.every((b, i) => 29 * higher[i] + lower[i] === b));
/** @param {number[]} digits @param {bigint} radix */
function positionalInteger(digits, radix) {
  let value = 0n;
  for (const digit of digits) {
    assert(BigInt(digit) < radix && digit >= 0);
    value = radix * value + BigInt(digit);
  }
  return value;
}
/** @param {bigint} value */
function minimalBytes(value) {
  const out = [];
  do {
    out.unshift(Number(value & 255n));
    value >>= 8n;
  } while (value !== 0n);
  return Buffer.from(out);
}
/** @param {bigint} n @param {number} width @param {bigint} radix */
function fixedDigits(n, width, radix) {
  const result = Array(width).fill(0);
  for (let i = width - 1; i >= 0; i--) {
    result[i] = Number(n % radix);
    n /= radix;
  }
  assert.equal(n, 0n);
  return result;
}
const value = positionalInteger(higher, 9n);
const decoded = minimalBytes(value);
assert.equal(decoded.length, 102);
assert.deepEqual(decoded.subarray(0, 4), Buffer.from([0x09, 0xdf, 0x17, 0x9a]));

const sample = Buffer.from("LIBER PRIMUS: ORIGINAL SOURCE CONTROL", "ascii");
const plantedDigits = fixedDigits(BigInt("0x" + sample.toString("hex")), 256, 9n);
assert.deepEqual(minimalBytes(positionalInteger(plantedDigits, 9n)), sample);
assert(plantedDigits.every(d => d <= 8));

/** @param {number[]} values @param {number} bins */
function frequencies(values, bins) {
  const counts = Array(bins).fill(0);
  for (const value of values) counts[value]++;
  return counts;
}
const digitsHistogram = frequencies(higher, 9);
const digitChi2 = digitsHistogram.reduce((sum, n) =>
  sum + (n - 256 / 9) ** 2 / (256 / 9), 0);
const printable = [...decoded].filter(b => b >= 32 && b <= 126).length;
assert.equal(printable, 35);
assert.equal(digitChi2, 10.765625);
const outputEntropy = (() => {
  const counts = frequencies([...decoded], 256);
  return -counts.reduce((sum, n) => {
    if (n === 0) return sum;
    const p = n / decoded.length;
    return sum + p * Math.log2(p);
  }, 0);
})();
const headers = [
  Buffer.from("%PDF-"), Buffer.from("-----BEGIN PGP"),
  Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from([0x1f, 0x8b]),
  Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.from([0xff, 0xd8, 0xff]),
  Buffer.from([0x42, 0x4d]), Buffer.from("SQLite format 3")
];
assert(headers.every(prefix => !decoded.subarray(0, prefix.length).equals(prefix)));

console.log(JSON.stringify({
  source: "resources/liber-primus/base60-grid.json; original 32x8 bytes",
  originalByteCount: bytes.length,
  sourceHAndGZeroRemainders: true,
  highDigitOperation: "q_i = floor(byte_i/29), original row-major, one base-9 integer",
  highDigitHistogram: digitsHistogram,
  chiSquare9Bins: digitChi2,
  outputBytes: decoded.length,
  outputSha256: crypto.createHash("sha256").update(decoded).digest("hex"),
  first32Hex: decoded.subarray(0, 32).toString("hex"),
  last16Hex: decoded.subarray(-16).toString("hex"),
  printableAsciiBytes: printable,
  empiricalByteEntropy: outputEntropy,
  recognizedHeader: false,
  sourceDirection: "high digits as big-endian radix-9, minimal big-endian bytes",
  roundTripControl: "synthetic ASCII message recovered exactly",
  conclusion: "No directly readable payload. Higher-digit transformation/key remains unspecified."
}, null, 2));
