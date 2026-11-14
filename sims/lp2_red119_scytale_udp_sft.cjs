"use strict";

/**
 * Strict SCY-as-SCYTALE and UDP packet interpretation of the two 119-rune
 * original red-marked prefixes. Hypothesis is conjectural, not creator-issued.
 * Run: node sims/lp2_red119_scytale_udp_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const gp = JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));

/** @param {number[]} digits */
function digitsToBytes(digits) {
  let n = 0n;
  for (const x of digits) n = n * 29n + BigInt(x);
  const rev = [];
  while (n) {
    rev.push(Number(n & 255n));
    n >>= 8n;
  }
  return rev.reverse();
}
/** @param {number[]} data @param {number} count */
function bytesToDigits(data, count) {
  let n = 0n;
  for (const x of data) n = n * 256n + BigInt(x);
  const result = Array(count).fill(0);
  for (let i = count - 1; i >= 0; i--) {
    result[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n, "source bytes must fit exact GP29 digit capacity");
  return result;
}
/** @param {number[]} digits @param {number} rows @param {number} cols */
function transpose(digits, rows, cols) {
  assert.equal(digits.length, rows * cols);
  const result = [];
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++)
      result.push(digits[r * cols + c]);
  return result;
}
/** @param {number[]} transposed @param {number} rows @param {number} cols */
function untranspose(transposed, rows, cols) {
  const result = Array(rows * cols);
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++)
      result[r * cols + c] = transposed[c * rows + r];
  return result;
}
/** @param {number[]} b */
function udp(b) {
  assert.ok(b.length >= 8);
  return {
    src: b[0] * 256 + b[1],
    dst: b[2] * 256 + b[3],
    length: b[4] * 256 + b[5],
    validDeclaredLength: b[4] * 256 + b[5] === b.length
  };
}
// Source fix: only two isolated red three-rune spans, identical start offset 119.
assert.deepEqual(gp.pages[3].indices.slice(119, 122), [13, 23, 2]);
assert.deepEqual(gp.pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.equal(7 * 17, 119);

const original = [];
for (const page of [3, 39]) {
  const runes = gp.pages[page].indices.slice(0, 119);
  for (const [shape, rows, cols] of [["7x17", 7, 17], ["17x7", 17, 7]]) {
    assert.deepEqual(untranspose(transpose(runes, rows, cols), rows, cols), runes);
    for (const reverse of [false, true])
      for (const atbash of [false, true]) {
        const order = transpose(runes, rows, cols);
        const digits = (reverse ? order.reverse() : order)
          .map(v => atbash ? 28 - v : v);
        const bytes = digitsToBytes(digits);
        const header = udp(bytes);
        original.push({
          page, shape, reverse, atbash,
          byteLength: bytes.length,
          first8Hex: bytes.slice(0, 8).map(x => x.toString(16).padStart(2, "0")).join(""),
          ...header
        });
      }
  }
}
assert.equal(original.length, 16);
assert.ok(original.every(x => x.byteLength === 73));
assert.ok(original.every(x => !x.validDeclaredLength));
assert.ok(original.every(x => x.src !== 3301 && x.dst !== 3301));

// A complete independent positive control: a real, well-framed 73-byte
// UDP header and 65-byte payload, packed into exactly 119 BASE29 GP digits.
// SCYTALE is applied and then inverted with no guessed byte/rune padding.
const planted = [0x02, 0x58, 0x0c, 0xe5, 0, 73, 0, 0,
  ...Array.from({length: 65}, (_, i) => (i * 37) % 256)];
assert.equal(planted.length, 73);
assert.equal(udp(planted).src, 600);
assert.equal(udp(planted).dst, 3301);
assert.equal(udp(planted).validDeclaredLength, true);
const plantedDigits = bytesToDigits(planted, 119);
const scytaleEncoded = untranspose(plantedDigits, 7, 17);
assert.deepEqual(transpose(scytaleEncoded, 7, 17), plantedDigits);
assert.deepEqual(digitsToBytes(transpose(scytaleEncoded, 7, 17)), planted);

console.log(JSON.stringify({
  source: "original p3/p39 119-rune pre-red ciphertext, 7×17 SCYTALE, GP29 BASE29, UDP",
  originalModels: original, successfulOriginalPackets: 0,
  successControl: {length: planted.length, destination: 3301, source: 600},
  status: "Negative for these 16 exact scytale/Atbash/UDP readings; no new plaintext or endpoint."
}, null, 2));
