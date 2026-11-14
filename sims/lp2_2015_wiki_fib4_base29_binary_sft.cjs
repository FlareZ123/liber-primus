"use strict";

/**
 * Dated 2015 Jan28 IRC wiki proposal: p15 Fibonacci page pointers
 * p13,p21,p34,p55 allegedly form a base64 blob and binary script.
 * Test literal unedited GP29 runes as native BASE29 integer to bytes.
 *
 * Windows 11, Node.js 22, built-ins only.
 * Run: node sims/lp2_2015_wiki_fib4_base29_binary_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const db = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = [13, 21, 34, 55];
const chunks = pages.map(i => db.pages[i].indices);
assert.deepEqual(chunks.map(a => a.length), [272, 273, 261, 76]);

/**
 * Native 2013 BASE29 convention, zero-based 29 GP symbols.
 * Convert the one entire numeral to minimal big-endian unsigned bytes.
 * @param {number[]} digits
 * @returns {Buffer}
 */
function toBytes(digits) {
  let value = 0n;
  for (const d of digits) {
    assert(Number.isInteger(d) && d >= 0 && d < 29);
    value = 29n * value + BigInt(d);
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} bytes @returns {number} */
function maxBase64Run(bytes) {
  let best = 0, n = 0;
  for (const v of bytes) {
    const allowed = v >= 65 && v <= 90 || v >= 97 && v <= 122 ||
      v >= 48 && v <= 57 || v === 43 || v === 47 || v === 61 ||
      v === 10 || v === 13;
    n = allowed ? n + 1 : 0;
    best = Math.max(best, n);
  }
  return best;
}

/** @param {string} name @param {number[]} digits */
function analyze(name, digits) {
  const bytes = toBytes(digits);
  const n = [...bytes].filter(v => v >= 65 && v <= 90 ||
    v >= 97 && v <= 122 || v >= 48 && v <= 57 ||
    v === 43 || v === 47 || v === 61 ||
    v === 10 || v === 13).length;
  return {name, runes: digits.length, bytes: bytes.length,
    base64Characters: n, longestBase64Run: maxBase64Run(bytes),
    initial16Hex: bytes.subarray(0, 16).toString("hex")};
}
const fused = chunks.flat();
const rows = chunks.map((digits, i) => analyze("p" + pages[i], digits));
rows.push(analyze("13-21-34-55", fused));
rows.push(analyze("55-34-21-13", chunks.slice().reverse().flat()));
rows.push(analyze("reversed-rune-book", fused.slice().reverse()));
assert.deepEqual(rows.map(x => [x.bytes, x.base64Characters,
  x.longestBase64Run]), [
  [165, 46, 2], [166, 44, 3], [159, 39, 4], [47, 9, 2],
  [536, 146, 5], [536, 151, 4], [536, 136, 4]
]);
const original = Buffer.from("TWFu", "ascii");
let value = BigInt("0x" + original.toString("hex"));
const digits = [];
while (value) {
  digits.push(Number(value % 29n));
  value /= 29n;
}
digits.reverse();
assert.deepEqual(digits, [2, 10, 28, 18, 5, 20, 26]);
assert.deepEqual(toBytes(digits), original);
assert.equal(maxBase64Run(original), 4);
console.log(JSON.stringify({
  status: "PASS", source: "28 Jan 2015 IRC wiki quote, p15→13/21/34/55",
  positiveControl: "TWFu exact 4/4 bytes", results: rows,
  decision: "No direct complete-page BASE29 integer-to-base64 carrier in these source-selected pages. Other extraction operands remain unspecified."
}, null, 2));
