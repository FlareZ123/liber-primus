"use strict";

/**
 * All-order obstruction to reading the p50 256-byte table as one 2048-bit
 * RSA prime factor.
 *
 * For bytes b[0..255], the big-endian integer is
 *   N = sum_i b[i] * 256^(255-i).
 * Since 256 == 1 (mod 3), N == sum_i b[i] (mod 3), independent of byte order.
 *
 * The canonical base60 values and the documented drop-f base59 rival are
 * both byte-valued and both have byte sum divisible by 3. Therefore every
 * byte permutation is composite, so no traversal can turn this table into
 * a prime RSA-4096 factor.
 *
 * SFT: node sims/lp2_p50_rsa4096_factor_allorder_sft.cjs
 * Node.js 22, CommonJS, standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const tokens = grid.pages.flatMap(page => page.tokens);

assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);

const alphabet60 = grid.alphabet;
const alphabet59 = Array.from(alphabet60).filter(ch => ch !== "f").join("");
assert.equal(alphabet59.length, 59);
assert.equal(tokens.filter(token => token.includes("f")).length, 0);

/**
 * @param {string} alphabet
 * @param {number} radix
 * @returns {number[]}
 */
function values(alphabet, radix) {
  return tokens.map(token =>
    radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]));
}

/**
 * @param {number[]} bytes
 * @returns {{sum:number, residue:number, distinct:number, min:number, max:number}}
 */
function summary(bytes) {
  const sum = bytes.reduce((total, value) => total + value, 0);
  return {
    sum,
    residue: sum % 3,
    distinct: new Set(bytes).size,
    min: Math.min(...bytes),
    max: Math.max(...bytes)
  };
}

/**
 * Directly evaluate one ordering modulo 3 as an implementation control.
 *
 * @param {number[]} bytes
 * @returns {number}
 */
function bigintResidue(bytes) {
  let residue = 0;
  for (const value of bytes) residue = (residue * 256 + value) % 3;
  return residue;
}

const base60 = values(alphabet60, 60);
const base59 = values(alphabet59, 59);
const s60 = summary(base60);
const s59 = summary(base59);

assert.deepEqual(s60, {
  sum: 33006,
  residue: 0,
  distinct: 161,
  min: 0,
  max: 255
});
assert.deepEqual(s59, {
  sum: 32499,
  residue: 0,
  distinct: 161,
  min: 0,
  max: 251
});

for (const bytes of [base60, base59]) {
  assert.ok(bytes.every(value => Number.isInteger(value) && value >= 0 && value <= 255));
  assert.equal(bigintResidue(bytes), 0);
  assert.equal(bigintResidue([...bytes].reverse()), 0);

  const rows = Array.from({length: 32}, (_, row) =>
    bytes.slice(row * 8, row * 8 + 8));
  const columnMajor = Array.from({length: 8}, (_, col) =>
    rows.map(row => row[col])).flat();
  assert.equal(bigintResidue(columnMajor), 0);
}

// A 2048-bit RSA prime factor must be prime and greater than 3. The
// canonical first byte 203 already makes the base60 row-major integer
// 2048 bits; every permutation remains divisible by 3 by the proof above.
assert.ok(base60[0] >= 128);

console.log(JSON.stringify({
  model: "p50 256 bytes as one 2048-bit RSA-4096 prime factor",
  invariant: "N mod 3 = byte-sum mod 3 for every byte ordering because 256 mod 3 = 1",
  base60: s60,
  dropFBase59: s59,
  decision: "REJECT: every byte ordering is divisible by 3 under both documented byte renderings"
}, null, 2));
