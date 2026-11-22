"use strict";

/** Original LP2 pp49–51 numeral-table AES key-expansion source gate. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} a @param {number} b @returns {number} */
function gfMul(a, b) {
  let value = 0;
  for (let bit = 0; bit < 8; bit++) {
    if (b & 1) value ^= a;
    b >>>= 1;
    a = ((a << 1) ^ ((a & 128) ? 0x11b : 0)) & 255;
  }
  return value;
}

/** @param {number} value @param {number} exponent @returns {number} */
function gfPow(value, exponent) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = gfMul(result, value);
    value = gfMul(value, value);
    exponent >>>= 1;
  }
  return result;
}

/** @param {number} value @param {number} bits @returns {number} */
function rotateByte(value, bits) {
  return ((value << bits) | (value >>> (8 - bits))) & 255;
}

const SBOX = Array.from({ length: 256 }, (_, index) => {
  const inv = gfPow(index, 254);
  return (inv ^ rotateByte(inv, 1) ^ rotateByte(inv, 2)
    ^ rotateByte(inv, 3) ^ rotateByte(inv, 4) ^ 0x63) & 255;
});

/**
 * Expand the actual AES-128/192/256 key schedule under FIPS 197.
 * @param {number[]} key Original key prefix (Nk*4 bytes)
 * @returns {number[]} Standard complete round-key byte stream
 */
function expand(key) {
  const nk = key.length / 4;
  assert.ok([4, 6, 8].includes(nk));
  const totalWords = 4 * (nk + 7);
  const words = Array.from({ length: nk }, (_, index) => key.slice(index * 4, index * 4 + 4));
  let rcon = 1;
  for (let i = nk; i < totalWords; i++) {
    let temp = words[i - 1].slice();
    if (i % nk === 0) {
      temp = [temp[1], temp[2], temp[3], temp[0]].map(v => SBOX[v]);
      temp[0] ^= rcon;
      rcon = gfMul(rcon, 2);
    } else if (nk === 8 && i % nk === 4) {
      temp = temp.map(v => SBOX[v]);
    }
    words.push(temp.map((v, j) => v ^ words[i - nk][j]));
  }
  return words.flat();
}

function verifyControls() {
  assert.equal(SBOX[0], 0x63);
  assert.equal(SBOX[0x53], 0xed);
  const fips128 = expand(Array.from({ length: 16 }, (_, i) => i));
  const fips256 = expand(Array.from({ length: 32 }, (_, i) => i));
  assert.equal(Buffer.from(fips128.slice(16, 20)).toString("hex"), "d6aa74fd");
  assert.equal(Buffer.from(fips256.slice(32, 36)).toString("hex"), "a573c29f");
  const plain = Buffer.from("00112233445566778899aabbccddeeff", "hex");
  const enc = crypto.createCipheriv("aes-256-ecb",
    Buffer.from(Array.from({ length: 32 }, (_, i) => i)), null);
  enc.setAutoPadding(false);
  assert.equal(Buffer.concat([enc.update(plain), enc.final()]).toString("hex"),
    "8ea2b7ca516745bfeafc49904b496089");
  console.log("PASS FIPS-197 AES-128/AES-256 expansion and AES-256-ECB known-answer controls");
}

/** @param {number[]} observed @param {number} nk @param {string} order */
function inspect(observed, nk, order) {
  const total = 4 * (nk + 7) * 4;
  const predicted = expand(observed.slice(0, nk * 4));
  let correct = 0;
  let identicalWords = 0;
  let first = -1;
  for (let i = nk * 4; i < total; i++) {
    if (predicted[i] === observed[i]) correct++;
    else if (first < 0) first = i;
  }
  for (let i = nk; i < total / 4; i++) {
    if (predicted.slice(i * 4, i * 4 + 4)
      .every((v, k) => v === observed[i * 4 + k])) identicalWords++;
  }
  assert.ok(first >= 0, "Positive AES schedule hit: investigate before rejecting");
  console.log(order + ", AES-" + nk * 32 + ": " + correct + "/" + (total - nk * 4)
    + " expanded-key bytes match, " + identicalWords
    + " complete words; first disagreement at byte " + first
    + ": observed=" + observed[first] + ", predicted=" + predicted[first]);
  return { order, aes: nk * 32, correct, compared: total - nk * 4,
    identicalWords, first };
}

function main() {
  verifyControls();
  const sourcePath = path.join(__dirname, "..", "resources", "liber-primus", "lp2-grid-256.json");
  const bytes = JSON.parse(fs.readFileSync(sourcePath, "utf8")).bytes;
  assert.equal(bytes.length, 256);
  assert.ok(bytes.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
  const digest = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(digest, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  console.log("PASS original conditional base60 table hash " + digest);
  const layouts = [
    ["printed-row-major", bytes],
    ["printed-column-major",
      Array.from({ length: 256 }, (_, i) => bytes[(i % 32) * 8 + Math.floor(i / 32)])],
  ];
  const results = [];
  for (const [order, data] of layouts) {
    for (const nk of [4, 6, 8]) results.push(inspect(data, nk, order));
  }
  assert.ok(results.every(x => x.identicalWords === 0));
  console.log("PASS: no full AES expanded-key recurrence in either frozen printed-order interpretation");
}

main();
