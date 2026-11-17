"use strict";

/**
 * Exact multiplicative orders of the original LP2 p49–51 table's small
 * GF(29) polynomial factors, with independent source-byte anchoring.
 *
 * These orders constrain candidate key generators. They do not provide a
 * cipher, a seed, an unknown-page plaintext, or evidence of creator intent.
 *
 * SFT: node sims/lp2_grid_gf29_source_factor_orders_sft.cjs
 * Windows 11 / Node.js 22, no external dependencies or file mutations.
 */

const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.ok(bytes.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
assert.equal(createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} n @returns {number} */
function mod(n) { return ((n % 29) + 29) % 29; }

/**
 * Check that a monic ascending-coefficient polynomial exactly divides the
 * untouched high-degree-first original source table over GF(29).
 * @param {number[]} factor
 */
function assertOriginalFactor(factor) {
  const degree = factor.length - 1;
  assert.equal(factor[degree], 1);
  const residual = bytes.map(mod);
  for (let at = 0; at <= residual.length - factor.length; at++) {
    const coefficient = residual[at];
    for (let j = 0; j <= degree; j++) {
      residual[at + j] = mod(residual[at + j] -
        coefficient * factor[degree - j]);
    }
  }
  assert.deepEqual(residual.slice(-degree), Array(degree).fill(0));
}

/**
 * Multiply two field/ring elements modulo an exact monic polynomial.
 * No bitwise operators are used for exponents (the degree-nine period is
 * larger than the 32-bit range), and all intermediate integer values fit.
 * @param {number[]} a
 * @param {number[]} b
 * @param {number[]} f ascending monic coefficients
 * @returns {number[]}
 */
function multiply(a, b, f) {
  const d = f.length - 1;
  const full = Array(2 * d - 1).fill(0);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      full[i + j] = mod(full[i + j] + a[i] * b[j]);
    }
  }
  for (let i = full.length - 1; i >= d; i--) {
    const lead = full[i];
    for (let j = 0; j < d; j++) {
      full[i - d + j] = mod(full[i - d + j] - lead * f[j]);
    }
  }
  return full.slice(0, d);
}

/**
 * Compute X^exponent modulo a monic polynomial over GF29.
 * @param {number[]} f
 * @param {number} exponent exact integer up to 29^9-1
 * @returns {number[]}
 */
function powerX(f, exponent) {
  assert.ok(Number.isSafeInteger(exponent) && exponent >= 0);
  const d = f.length - 1;
  const one = [1, ...Array(d - 1).fill(0)];
  let base = [0, 1, ...Array(d - 2).fill(0)];
  let out = one;
  while (exponent > 0) {
    if (exponent % 2 === 1) out = multiply(out, base, f);
    base = multiply(base, base, f);
    exponent = Math.floor(exponent / 2);
  }
  return out;
}

/**
 * Distinct prime divisors of an exact small-enough integer.
 * @param {number} original
 * @returns {number[]}
 */
function primeDivisors(original) {
  let n = original;
  const primes = [];
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor !== 0) continue;
    primes.push(divisor);
    while (n % divisor === 0) n /= divisor;
  }
  if (n > 1) primes.push(n);
  return primes;
}

/**
 * Prove the exact order of X by checking the candidate exponent and each
 * of its distinct prime-divisor subexponents, without cycling over states.
 * @param {number[]} f
 * @param {number} candidate
 * @returns {number[]}
 */
function assertExactOrder(f, candidate) {
  assertOriginalFactor(f);
  const one = [1, ...Array(f.length - 2).fill(0)];
  assert.deepEqual(powerX(f, candidate), one);
  const divisors = primeDivisors(candidate);
  for (const p of divisors) {
    assert.notDeepEqual(powerX(f, candidate / p), one,
      "order must not divide candidate / " + p);
  }
  return divisors;
}

const tests = [
  { name: "G2_double_root_24", factor: [25, 10, 1], order: 203,
    maxFieldOrder: null },
  { name: "H2_2013_BASE29", factor: [11, 18, 1], order: 840,
    maxFieldOrder: 29 ** 2 - 1 },
  { name: "C3_irreducible", factor: [24, 16, 14, 1], order: 12194,
    maxFieldOrder: 29 ** 3 - 1 },
  { name: "N9_irreducible", factor: [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
    order: 14507145975868, maxFieldOrder: 29 ** 9 - 1 }
];

const findings = tests.map(test => {
  const primes = assertExactOrder(test.factor, test.order);
  if (test.maxFieldOrder !== null) {
    assert.equal(test.maxFieldOrder % test.order, 0);
  }
  return { name: test.name, degree: test.factor.length - 1,
    orderOfX: test.order, possibleFieldOrder: test.maxFieldOrder,
    orderPrimeDivisors: primes,
    primitive: test.maxFieldOrder === null ? null :
      test.order === test.maxFieldOrder };
});
assert.equal(findings[1].primitive, true);
assert.equal(findings[2].primitive, false);
assert.equal(findings[3].primitive, true);
assert.equal(findings[3].orderOfX, 14507145975868);
assert.equal(findings[2].possibleFieldOrder / findings[2].orderOfX, 2);

// Deliberate tamper control: changing an authentic table coefficient breaks
// the independent original-file SHA-256 anchor.
const changed = bytes.slice();
changed[0] = (changed[0] + 1) % 256;
assert.notEqual(createHash("sha256").update(Buffer.from(changed))
  .digest("hex"),
"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

console.log(JSON.stringify({
  source: "original LP2 p49–51 printed 256-cell table, canonical base60",
  sourceSha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  findings,
  scope: "Exact algebraic periods for source factors only; no author-selected cipher, secret seed, or recovered original plaintext"
}, null, 2));
