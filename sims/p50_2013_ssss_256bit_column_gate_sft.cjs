"use strict";
/**
 * Original p50 32x8 table versus the actual 2013-era ssss 0.5 Shamir field.
 *
 * A human might read each of the 8 printed columns as a 32-byte share of
 * one 256-bit secret. The 2013 puzzle used ssss-combine with threshold 5.
 * Historical source: https://github.com/osresearch/ssss/blob/master/ssss.c
 * field_init(256) uses X^256 + X^10 + X^5 + X^2 + 1.
 *
 * This is DIFFERENT from eight 32-independent-byte GF(2^8) Shamir rows:
 * the ssss executable uses one GF(2^256) element for each entire share.
 *
 * SFT: node sims/p50_2013_ssss_256bit_column_gate_sft.cjs
 * Node.js 22, CommonJS, built-ins only, unchanged source bytes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const INPUT = path.join(__dirname, "..", "resources", "liber-primus",
  "lp2-grid-256.json");
const EXPECTED_HASH =
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";
const WIDTH = 256n;
const MASK = (1n << WIDTH) - 1n;
const POLY = (1n << WIDTH) | (1n << 10n) | (1n << 5n) |
  (1n << 2n) | 1n;
const REDUCER = POLY & MASK;

/** @param {bigint} v @returns {number} */
function degree(v) {
  return v.toString(2).length - 1;
}

/** @param {bigint} v @returns {bigint} */
function reduce(v) {
  while (degree(v) >= 256) {
    v ^= POLY << BigInt(degree(v) - 256);
  }
  return v;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function multiply(a, b) {
  let v = 0n;
  while (b !== 0n) {
    if ((b & 1n) !== 0n) v ^= a;
    b >>= 1n;
    const carry = (a & (1n << 255n)) !== 0n;
    a = ((a << 1n) & MASK) ^ (carry ? REDUCER : 0n);
  }
  return v;
}

/** @param {bigint} v @returns {bigint} */
function inverse(v) {
  assert.notEqual(v, 0n);
  let a = v, b = POLY, aa = 1n, bb = 0n;
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
  const result = reduce(aa);
  assert.equal(multiply(result, v), 1n);
  return result;
}

/**
 * @param {bigint} target
 * @param {bigint[]} xs
 * @param {bigint[]} ys
 * @returns {bigint}
 */
function interpolate(target, xs, ys) {
  assert.equal(xs.length, ys.length);
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

/** @param {bigint[]} coefficients @param {bigint} x @returns {bigint} */
function evaluate(coefficients, x) {
  return coefficients.reduceRight((value, coefficient) =>
    multiply(value, x) ^ coefficient, 0n);
}

function main() {
  const { bytes } = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  assert.equal(bytes.length, 256);
  const sourceHash = crypto.createHash("sha256")
    .update(Buffer.from(bytes)).digest("hex");
  assert.equal(sourceHash, EXPECTED_HASH);
  const xs = Array.from({ length: 8 }, (_, i) => BigInt(i + 1));
  const ys = xs.map((_, column) =>
    BigInt("0x" + Array.from({ length: 32 }, (_, row) =>
      bytes[row * 8 + column].toString(16).padStart(2, "0")).join("")));

  // A genuine 5-of-8 source polynomial must predict all 3 held-out shares.
  // For any smaller threshold, every withheld share must also be predicted.
  const checks = [];
  for (let threshold = 2; threshold <= 7; threshold++) {
    const knownX = xs.slice(0, threshold);
    const knownY = ys.slice(0, threshold);
    const holdout = xs.slice(threshold).map((x, index) => ({
      x: Number(x),
      matched: interpolate(x, knownX, knownY) === ys[threshold + index]
    }));
    assert.equal(holdout.filter(x => x.matched).length, 0);
    checks.push({ threshold, matches: 0, heldOut: holdout.length });
  }

  // Independent positive using an actual degree-four polynomial with
  // one 256-bit field element per share, exactly as historical ssss.
  const coefficients = [17n, 23n, 42n, 51n, 91n];
  const genuine = xs.map(x => evaluate(coefficients, x));
  for (let i = 0; i < xs.length; i++) {
    assert.equal(interpolate(xs[i], xs.slice(0, 5),
      genuine.slice(0, 5)), genuine[i]);
  }
  assert.equal(interpolate(0n, xs.slice(0, 5),
    genuine.slice(0, 5)), coefficients[0]);

  const hypotheticalSecret = interpolate(0n, xs.slice(0, 5),
    ys.slice(0, 5)).toString(16).padStart(64, "0");
  assert.equal(hypotheticalSecret,
    "d54d8a2748e2b2efbc50f95354cb807c9052d96b26d4102a909c60033e172134");
  const result = {
    sourceSHA256: sourceHash,
    field: "GF(2^256), ssss 0.5, X^256+X^10+X^5+X^2+1",
    layout: "8 printed columns, top-to-bottom 32-byte big-endian shares",
    xCoordinates: xs.map(Number),
    checks,
    positive: "degree-four 5-of-8 shares and recovered secret: PASS",
    firstFiveOnlySecretHex: hypotheticalSecret,
    conclusion: "No threshold 2..7 fits the 8 original columns; the 5-of-8 2013-style Shamir interpretation is rejected. Threshold8 alone is vacuous."
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) main();
module.exports = { degree, reduce, multiply, inverse, interpolate, evaluate, main };
