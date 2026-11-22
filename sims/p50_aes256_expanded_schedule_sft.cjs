"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const grid = require("../resources/liber-primus/base60-grid.json");

/**
 * Test the conditional 256-byte LP2 pp49-51 table as a 240-byte AES-256
 * expanded round-key schedule plus one 16-byte source table remainder.
 * This is an independently reproducible structural test, not a cipher search.
 */

/** @param {number} a @param {number} b */
function gfMultiply(a, b) {
  let result = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) result ^= a;
    const high = a & 0x80;
    a = (a << 1) & 0xff;
    if (high) a ^= 0x1b;
    b >>= 1;
  }
  return result;
}

/** @param {number} base @param {number} exponent */
function gfPower(base, exponent) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = gfMultiply(result, base);
    base = gfMultiply(base, base);
    exponent >>= 1;
  }
  return result;
}

/** @param {number} value @param {number} shift */
function rotateByte(value, shift) {
  return ((value << shift) | (value >>> (8 - shift))) & 0xff;
}

/** AES inverse GF(256) followed by the standard affine S-box transform.
 * @param {number} value
 */
function subByte(value) {
  const a = value === 0 ? 0 : gfPower(value, 254);
  return (a ^ rotateByte(a, 1) ^ rotateByte(a, 2) ^
    rotateByte(a, 3) ^ rotateByte(a, 4) ^ 0x63) & 0xff;
}

/**
 * FIPS-197 AES-256 key schedule: 32 key bytes into 60 round-key words.
 * @param {number[]} seed
 * @returns {number[]}
 */
function expandAES256(seed) {
  assert.equal(seed.length, 32);
  const bytes = seed.slice();
  let rcon = 1;
  for (let word = 8; word < 60; word++) {
    let previous = bytes.slice((word - 1) * 4, word * 4);
    if (word % 8 === 0) {
      previous = [previous[1], previous[2], previous[3], previous[0]]
        .map(subByte);
      previous[0] ^= rcon;
      rcon = gfMultiply(rcon, 2);
    } else if (word % 8 === 4) {
      previous = previous.map(subByte);
    }
    for (let offset = 0; offset < 4; offset++) {
      bytes.push(bytes[(word - 8) * 4 + offset] ^ previous[offset]);
    }
  }
  assert.equal(bytes.length, 240);
  return bytes;
}

/** @param {number[]} bytes */
function hex(bytes) {
  return Buffer.from(bytes).toString("hex");
}

/** @param {number[]} candidate240 */
function compare(candidate240) {
  assert.equal(candidate240.length, 240);
  const predicted = expandAES256(candidate240.slice(0, 32));
  let equalBytes = 0, completeWords = 0;
  let firstMismatch = null;
  for (let i = 32; i < 240; i++) {
    if (candidate240[i] === predicted[i]) equalBytes++;
    else if (firstMismatch === null) firstMismatch = i;
  }
  for (let word = 8; word < 60; word++) {
    if (candidate240.slice(word * 4, (word + 1) * 4)
      .every((byte, index) => byte === predicted[word * 4 + index])) {
      completeWords++;
    }
  }
  return {matchedBytes: equalBytes, predictedBytes: 208,
    completeRoundWords: completeWords, predictedWords: 52,
    firstMismatchByte: firstMismatch,
    firstActualWord: hex(candidate240.slice(32, 36)),
    firstExpectedWord: hex(predicted.slice(32, 36))};
}

function main() {
  assert.equal(grid.byte_rows.length, 32);
  assert.ok(grid.byte_rows.every(row => row.length === 8));
  const rowMajor = grid.byte_rows.flat();
  const columnMajor = Array.from({length: 256}, (_, i) =>
    grid.byte_rows[i % 32][Math.floor(i / 32)]);
  assert.equal(rowMajor.length, 256);
  const sourceHash = crypto.createHash("sha256").update(Buffer.from(rowMajor))
    .digest("hex");
  assert.equal(sourceHash,
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  // FIPS 197 appendix A.3 AES-256 32-byte key and the first four expanded words.
  const fipsKey = Buffer.from(
    "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
    "hex");
  const fipsSchedule = expandAES256([...fipsKey]);
  assert.equal(hex(fipsSchedule.slice(32, 48)),
    "9ba354118e6925afa51a8b5f2067fcde");

  const cases = [];
  for (const [layout, source] of [["printed-row-major", rowMajor],
    ["column-major alternative", columnMajor]]) {
    for (const offset of [0, 16]) {
      const candidate = source.slice(offset, offset + 240);
      const result = compare(candidate);
      assert.equal(result.completeRoundWords, 0,
        "An original AES round-key schedule word unexpectedly matched");
      cases.push({layout, offsetBytes: offset, ...result});
    }
  }
  assert.deepEqual(cases.map(item => item.matchedBytes), [1, 1, 2, 0]);

  const plant = expandAES256(rowMajor.slice(0, 32));
  const recovery = compare(plant);
  assert.equal(recovery.matchedBytes, 208);
  assert.equal(recovery.completeRoundWords, 52);
  assert.equal(recovery.firstMismatchByte, null);

  console.log(JSON.stringify({
    scope: "Only direct AES-256 expanded-key layout within the conditional " +
      "256-byte original pp49–51 base60 table",
    sourceByteSha256: sourceHash, fips197ControlWords: hex(fipsSchedule.slice(32, 48)),
    original: cases, plantedControl: recovery,
    conclusion: "0/4 original direct layouts match a single complete AES-256 " +
      "round-key word. No expanded key or original plaintext recovered."
  }, null, 2));
}

main();
