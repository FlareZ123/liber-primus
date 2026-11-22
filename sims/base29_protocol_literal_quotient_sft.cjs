"use strict";

/**
 * Source-frozen audit of the 2013 BASE29 protocol and the original LP2 grid.
 * Node 22: node sims/base29_protocol_literal_quotient_sft.cjs
 *
 * The 2013 challenge specified numeral conversion, random RAND values, and
 * per-session DH; it did not specify polynomial division or a quotient codec.
 * This test is a bounded consequence of treating BASE29 conversion as the
 * literal decoding operation AFTER the two previously identified grid factors.
 * Nothing here establishes unknown LP2 plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** @param {number} value */
const mod = value => (value % 29 + 29) % 29;
/** @param {number} x */
function inverse(x) {
  for (let i = 1; i < 29; i++) {
    if (mod(x * i) === 1) return i;
  }
  throw new Error("Singular polynomial leading coefficient");
}

/**
 * Descending-power polynomial long division over F29.
 * @param {number[]} numerator
 * @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(numerator, divisor) {
  const working = numerator.slice();
  const quotient = [];
  const inverted = inverse(divisor[0]);
  for (let i = 0; i <= numerator.length - divisor.length; i++) {
    const factor = mod(working[i] * inverted);
    quotient.push(factor);
    for (let j = 0; j < divisor.length; j++) {
      working[i + j] = mod(working[i + j] - factor * divisor[j]);
    }
  }
  return { quotient, remainder: working.slice(quotient.length) };
}

/**
 * Interpret a canonical sequence of base29 digits as one big-endian integer.
 * @param {number[]} digits
 * @returns {bigint}
 */
function asInteger(digits) {
  let result = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    result = 29n * result + BigInt(digit);
  }
  return result;
}

/** @param {bigint} value @returns {number[]} */
function asBase29(value) {
  if (value === 0n) return [0];
  const digits = [];
  while (value > 0n) {
    digits.unshift(Number(value % 29n));
    value /= 29n;
  }
  return digits;
}

/** @param {bigint} value */
function asBytes(value) {
  const bytes = [];
  while (value > 0n) {
    bytes.unshift(Number(value & 255n));
    value >>= 8n;
  }
  return Buffer.from(bytes.length ? bytes : [0]);
}

/** @param {Buffer} buffer */
function entropy(buffer) {
  const counts = new Array(256).fill(0);
  for (const x of buffer) counts[x]++;
  return counts.reduce((sum, count) => {
    if (!count) return sum;
    const p = count / buffer.length;
    return sum - p * Math.log2(p);
  }, 0);
}

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(
  root, "resources/liber-primus/lp2-grid-256.json"
), "utf8"));
assert.equal(grid.bytes.length, 256);
const hash = crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex");
assert.equal(hash, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const source3301 = [3, 26, 24];
const source1033 = [1, 6, 18];
assert.equal(asInteger(source3301), 3301n);
assert.equal(asInteger(source1033), 1033n);
assert.deepEqual(asBase29(3301n), source3301);
assert.deepEqual(asBase29(1033n), source1033);
assert.equal(source3301.map(x => "0123456789ABCDEFGHIJKLMNOPQRS"[x]).join(""), "3QO");
assert.equal(source1033.map(x => "0123456789ABCDEFGHIJKLMNOPQRS"[x]).join(""), "16I");

const printed = grid.bytes.map(mod);
const historical = divide(printed, [...source3301].reverse());
assert.deepEqual(historical.remainder, [0, 0]);
const manuscript = divide(historical.quotient, [15, 5, 27]);
assert.deepEqual(manuscript.remainder, [0, 0]);
assert.equal(manuscript.quotient.length, 252);
assert.equal(manuscript.quotient[0], 0);
assert.deepEqual(asBase29(asInteger(manuscript.quotient)), manuscript.quotient.slice(1));

// The actual 2013 BASE29 operation is numeric conversion. Divisibility is
// contingent upon the additional, source-unprescribed polynomial reading.
assert.deepEqual(divide(printed, source3301).remainder, [1, 6]);
assert.deepEqual(divide(printed, source1033).remainder, [3, 11]);
assert.deepEqual(divide(printed, [...source1033].reverse()).remainder, [24, 3]);

// A literal inverse BASE29 of the 251 canonical digits, serialized as
// a minimally sized unsigned big-endian integer. The protocol does not
// independently specify this serialization or any downstream byte codec.
const bytes = asBytes(asInteger(manuscript.quotient));
const hex = bytes.toString("hex");
const printable = [...bytes].filter(b => b >= 32 && b <= 126).length;
assert.equal(bytes.length, 153);
assert.equal(printable, 57);
assert.ok(hex.startsWith("04598e588f3e70d4100f40d7489f9855a468a0d950156d2a"));
assert.ok(hex.endsWith("b60750b93b10d2e3df8a1aad45ad4a4ef84cfc72fc3994ec"));

const result = {
  classification: "bounded literal source-operation test; no plaintext",
  source3301Digits: source3301,
  source1033Digits: source1033,
  polynomialRemainder3301Ascending: historical.remainder,
  polynomialRemainder3301Conventional: [1, 6],
  polynomialRemainder1033Conventional: [3, 11],
  polynomialRemainder1033Ascending: [24, 3],
  secondManuscriptFactorRemainder: manuscript.remainder,
  quotientSlots: manuscript.quotient.length,
  quotientCanonicalDigits: manuscript.quotient.length - 1,
  quotientBigEndianBinaryBytes: bytes.length,
  binaryFirst25Hex: hex.slice(0, 50),
  binaryLast24Hex: hex.slice(-48),
  binaryPrintableBytes: printable,
  binaryEmpiricalEntropy: entropy(bytes),
  note: "No source-fixed output codec; this serialization is a finite natural test, not an exhaustive binary-format exclusion"
};
console.log(JSON.stringify(result, null, 2));
