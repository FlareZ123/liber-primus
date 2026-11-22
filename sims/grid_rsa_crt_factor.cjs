"use strict";

/**
 * Test a source-sized RSA private-factor interpretation of the 256-byte
 * LP2 base-60 numeric grid against Cicada's authenticated 4096-bit RSA keys.
 * Includes both public key packets, two 2D grid traversal orders, endian
 * reversal and bytewise complement. Direct exact modular arithmetic only.
 *
 * Run: node sims/grid_rsa_crt_factor.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { dearmor, parseKeys } = require("./grid_rsa_pgp_signature.cjs");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/base60-grid.json"), "utf8"
)).byte_rows;
assert.equal(grid.length, 32);
assert.ok(grid.every(row => Array.isArray(row) && row.length === 8 &&
  row.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255)));

const publicArmor = fs.readFileSync(
  path.join(ROOT, "resources/control/cicada-3301-public-key.asc"), "utf8"
);
const keys = parseKeys(dearmor(publicArmor));
assert.equal(keys.length, 2);
assert.equal(keys[0].fingerprint, "6D854CD7933322A601C3286D181F01E57A35090F");
assert.ok(keys.every(key => key.bits === 4096 && key.exponent === 65537n));

/** @param {number[]} bytes @returns {bigint} */
function unsignedInteger(bytes) {
  return BigInt("0x" + bytes.map(byte => byte.toString(16).padStart(2, "0")).join(""));
}

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x, y) {
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}

/** @param {number[]} bytes */
function readings(bytes) {
  return [
    ["forward", bytes],
    ["reversed", bytes.slice().reverse()],
    ["complement", bytes.map(byte => 255 - byte)]
  ];
}

const rowMajor = grid.flat();
const columnMajor = Array.from({length:8}, (_, column) =>
  grid.map(row => row[column])).flat();
assert.equal(rowMajor.length, 256);
assert.equal(columnMajor.length, 256);

// Arithmetic positive: an independently constructed integer with a known
// factor equal to the source-sized grid candidate must recover that factor.
const factor = unsignedInteger(rowMajor);
assert.equal(gcd(factor * 65537n, factor), factor);

const cases = [];
for (const [traversal, sequence] of [
  ["row-major", rowMajor], ["column-major", columnMajor]
]) {
  for (const [reading, bytes] of readings(sequence)) {
    const candidate = unsignedInteger(bytes);
    assert.ok(candidate > 1n);
    for (let id = 0; id < keys.length; id++) {
      const common = gcd(candidate, keys[id].modulus);
      cases.push({
        traversal, reading, publicKey: id === 0 ? "primary" : "subkey",
        candidateBits: candidate.toString(2).length,
        gcd: common.toString(10),
        exactFactor: keys[id].modulus % candidate === 0n
      });
    }
  }
}
assert.equal(cases.length, 12);
assert.ok(cases.every(row => row.gcd === "1" && !row.exactFactor));

console.log(JSON.stringify({
  model: "256-byte numeric grid as a 2048-bit factor of Cicada's 4096-bit RSA keys",
  publicKeyFingerprint: keys[0].fingerprint,
  sourceGridBytes: rowMajor.length,
  sourceKeyModulusBits: keys.map(key => key.bits),
  sourceConstrainedReadings: cases,
  arithmeticPositiveControl: "gcd(grid * 65537, grid) = grid",
  outcome: "No tested reading divides or shares a nontrivial factor with either RSA modulus.",
  limit: "Does not test transformed, encrypted or approximate factors."
}, null, 2));
