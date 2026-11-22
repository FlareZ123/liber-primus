"use strict";
/**
 * Source-fixed historical ssss GF(2^64) alternative for original p50:
 * 32 printed rows, each 8-byte row is a single 64-bit Shamir share.
 *
 * ssss 0.5 historical field_init(64) polynomial:
 * X^64 + X^4 + X^3 + X + 1 (source indices21..23 -> [4,3,1]).
 * https://github.com/osresearch/ssss/blob/master/ssss.c
 *
 * Test the documented historical five-share threshold, x=1..32 in
 * printed row order, both original numeral codecs, no fitted offsets.
 * SFT: node sims/p50_2013_ssss_64bit_row_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const INPUT = path.join(__dirname, "..", "resources", "liber-primus",
  "lp2-grid-256.json");
const WIDTH = 64n;
const MASK = (1n << WIDTH) - 1n;
const POLY = (1n << WIDTH) | (1n << 4n) | (1n << 3n) |
  (1n << 1n) | 1n;
const REDUCER = POLY & MASK;

/** @param {bigint} x @returns {number} */
function degree(x) { return x.toString(2).length - 1; }

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function multiply(x, y) {
  let v = 0n;
  while (y !== 0n) {
    if (y & 1n) v ^= x;
    y >>= 1n;
    x = ((x << 1n) & MASK) ^ ((x & (1n << 63n)) ? REDUCER : 0n);
  }
  return v;
}

/** @param {bigint} value @returns {bigint} */
function inverse(value) {
  assert.notEqual(value, 0n);
  let a = value, b = POLY, aa = 1n, bb = 0n;
  while (a !== 1n) {
    let shift = degree(a) - degree(b);
    if (shift < 0) {
      [a, b] = [b, a];
      [aa, bb] = [bb, aa];
      shift = -shift;
    }
    a ^= b << BigInt(shift);
    aa ^= bb << BigInt(shift);
  }
  while (degree(aa) >= 64)
    aa ^= POLY << BigInt(degree(aa) - 64);
  assert.equal(multiply(value, aa), 1n);
  return aa;
}

/**
 * @param {bigint} target
 * @param {bigint[]} xs
 * @param {bigint[]} ys
 * @returns {bigint}
 */
function interpolate(target, xs, ys) {
  let out = 0n;
  for (let i = 0; i < xs.length; i++) {
    let numerator = 1n, denominator = 1n;
    for (let j = 0; j < xs.length; j++) {
      if (i === j) continue;
      numerator = multiply(numerator, target ^ xs[j]);
      denominator = multiply(denominator, xs[i] ^ xs[j]);
    }
    out ^= multiply(ys[i], multiply(numerator, inverse(denominator)));
  }
  return out;
}

/** @param {bigint[]} coefficients @param {bigint} x */
function evaluate(coefficients, x) {
  return coefficients.reduceRight((v, coefficient) =>
    multiply(v, x) ^ coefficient, 0n);
}

/** @param {number[]} bytes @returns {bigint[]} */
function rowsAsShares(bytes) {
  assert.equal(bytes.length, 256);
  return Array.from({ length: 32 }, (_, row) => BigInt("0x" +
    bytes.slice(row * 8, (row + 1) * 8)
      .map(x => x.toString(16).padStart(2, "0")).join("")));
}

function main() {
  const source = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
  const alphabet59 = alphabet60.replace("f", "");
  const derived59 = source.pages.flatMap(page => page.tokens).map(token =>
    59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
  const original = [
    { label: "base60", bytes: source.bytes,
      hash: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290" },
    { label: "base59-f-omitted", bytes: derived59,
      hash: "511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79" }
  ];
  const xs = Array.from({ length: 32 }, (_, i) => BigInt(i + 1));
  const observed = original.map(({ label, bytes, hash }) => {
    assert.equal(crypto.createHash("sha256")
      .update(Buffer.from(bytes)).digest("hex"), hash);
    const ys = rowsAsShares(bytes);
    const fitted = xs.slice(0, 5), values = ys.slice(0, 5);
    const heldOut = xs.slice(5).filter((x, index) =>
      interpolate(x, fitted, values) === ys[index + 5]);
    assert.equal(heldOut.length, 0);
    const hypotheticalSecret = interpolate(0n, fitted, values)
      .toString(16).padStart(16, "0");
    return { label, hash, shares: 32, threshold: 5,
      heldOut: 27, matches: 0, hypotheticalSecret };
  });
  assert.equal(observed[0].hypotheticalSecret, "3d38a7b34d89c553");
  assert.equal(observed[1].hypotheticalSecret, "358a150d26331ee2");

  const coefficients = [1n, 2n, 3n, 4n, 5n];
  const planted = xs.map(x => evaluate(coefficients, x));
  for (let i = 0; i < xs.length; i++) {
    assert.equal(interpolate(xs[i], xs.slice(0, 5),
      planted.slice(0, 5)), planted[i]);
  }
  assert.equal(interpolate(0n, xs.slice(0, 5),
    planted.slice(0, 5)), coefficients[0]);
  console.log(JSON.stringify({
    field: "GF(2^64), historical ssss 0.5 X^64+X^4+X^3+X+1",
    shareLayout: "32 printed row shares, eight bytes each, big-endian",
    results: observed,
    positive: "synthetic 5-of-32 exactly recovered 32/32 and secret",
    conclusion: "Both source-supported radix readings contradict the literal five-share Shamir polynomial."
  }, null, 2));
}

if (require.main === module) main();
module.exports = { multiply, inverse, interpolate, evaluate, rowsAsShares, main };
