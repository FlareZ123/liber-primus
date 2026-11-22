"use strict";
/**
 * Exact original p50 SHED-difference/base5 to known p56 SHA-512 or
 * 85-GP-rune recipient. This is a finite actual payload recovery test:
 * 256 original table cells →64×4 digits or 85×3 digits +1 sentinel.
 * Windows Node.js22 CommonJS SFT, read-only, source-native controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const file = p => fs.readFileSync(path.join(root, "resources", "liber-primus", p), "utf8");
const original = JSON.parse(file("lp2-grid-256.json"));
const corpus = JSON.parse(file("lp2-corpus.json"));
const reference = file("lp1-plaintext-reference.txt");
const tokens = original.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = original.alphabet;
const alphabet59 = alphabet60.replace("f", "");
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.ok(tokens.every(x => x.length === 2 && !x.includes("f")));
const deltas = tokens.map(token => {
  const sixty = alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1]);
  const fiftyNine = alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1]);
  return sixty - fiftyNine;
});
assert.ok(deltas.every(x => x >= 0 && x <= 4));
assert.deepEqual([0,1,2,3,4].map(x => deltas.filter(v => v === x).length),
  [36,62,62,63,33]);
const p56ref = reference.split(/### 56\r?\n/)[1].split(/### 57\r?\n/)[0];
const parts = p56ref.match(/[0-9a-f]{32,}/gi);
assert.ok(parts);
const hex = parts.join("");
assert.equal(hex.length, 128);
const hash = Array.from({ length: 64 }, (_, i) => parseInt(hex.slice(2 * i, 2 * i + 2), 16));
assert.ok(hash.every(x => Number.isInteger(x) && x >= 0 && x < 256));
const trans = corpus.translit.map((symbol, i) => ({ symbol, i }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/** @param {string} text @returns {number[]} */
function gp(text) {
  const src = text.toUpperCase().replaceAll("ING", "NG").replaceAll("K", "C")
    .replaceAll("V", "U").replaceAll("Q", "CW").replaceAll("Z", "S");
  const output = [];
  for (let i = 0; i < src.length;) {
    if (!/[A-Z]/.test(src[i])) { i++; continue; }
    const hit = trans.find(t => src.startsWith(t.symbol, i));
    assert.ok(hit, "GP source spelling unrecognized at " + i);
    output.push(hit.i);
    i += hit.symbol.length;
  }
  return output;
}
const plain56 = gp(p56ref.split(/\r?\n/).filter(x => !/^[a-f0-9]{32,}$/i.test(x.trim())).join("\n"));
const printed56 = corpus.pages[56].indices;
assert.equal(plain56.length, 85);
assert.equal(printed56.length, 85);
/**
 * Decode a contiguous four-digit base5 group as a raw nonnegative number,
 * optionally reducing to a byte. Every group consumes exactly four values.
 * @param {number[]} a
 * @param {"high"|"low"} orientation
 * @returns {number[]}
 */
function four(a, orientation) {
  assert.equal(a.length % 4, 0);
  const result = [];
  for (let i = 0; i < a.length; i += 4) {
    result.push(orientation === "high" ?
      ((a[i] * 5 + a[i + 1]) * 5 + a[i + 2]) * 5 + a[i + 3] :
      ((a[i + 3] * 5 + a[i + 2]) * 5 + a[i + 1]) * 5 + a[i]);
  }
  return result;
}
/** @param {number[]} a @param {"high"|"low"} orientation */
function triple(a, orientation) {
  const result = [];
  for (let i = 0; i + 2 < a.length; i += 3) {
    result.push(orientation === "high" ?
      (a[i] * 5 + a[i + 1]) * 5 + a[i + 2] :
      (a[i + 2] * 5 + a[i + 1]) * 5 + a[i]);
  }
  return result;
}
// Two-dimensional original page order, a four-row upright cell group,
// an entire column-major reading, and a literal inward circumference peel.
const indexes = {
  row: Array.from({ length: 256 }, (_, i) => i),
  fourRowsByColumn: [],
  column: [],
  spiral: []
};
for (let block = 0; block < 8; block++) {
  for (let col = 0; col < 8; col++) {
    for (let offset = 0; offset < 4; offset++) indexes.fourRowsByColumn.push((block * 4 + offset) * 8 + col);
  }
}
for (let col = 0; col < 8; col++) {
  for (let row = 0; row < 32; row++) indexes.column.push(row * 8 + col);
}
for (let top = 0, bottom = 31, left = 0, right = 7;
  top <= bottom && left <= right; top++, bottom--, left++, right--) {
  for (let c = left; c <= right; c++) indexes.spiral.push(top * 8 + c);
  for (let r = top + 1; r <= bottom; r++) indexes.spiral.push(r * 8 + right);
  if (top < bottom) for (let c = right - 1; c >= left; c--) indexes.spiral.push(bottom * 8 + c);
  if (left < right) for (let r = bottom - 1; r > top; r--) indexes.spiral.push(r * 8 + left);
}
let bestHash = 0;
for (const [layout, permutation] of Object.entries(indexes)) {
  assert.equal(permutation.length, 256);
  assert.equal(new Set(permutation).size, 256);
  const digitStream = permutation.map(i => deltas[i]);
  for (const orientation of ["high", "low"]) {
    const raw = four(digitStream, orientation);
    assert.equal(raw.length, 64);
    const bytes = raw.map(x => x % 256);
    const hits = bytes.filter((x, i) => x === hash[i]).length;
    const valid = raw.filter(x => x <= 255).length;
    bestHash = Math.max(bestHash, hits);
    console.log(JSON.stringify({
      layout, orientation, byteMatches: hits, directInRange: valid,
      decodedHead: bytes.slice(0, 12)
    }));
  }
}
assert.equal(bestHash, 1, "Changed original input or unexpected p56 hash hit");
for (const orientation of ["high", "low"]) {
  const groups = triple(deltas, orientation);
  assert.equal(groups.length, 85);
  for (const [name, target] of [["p56 cipher", printed56], ["p56 plaintext", plain56]]) {
    console.log("original row/3 " + orientation + " " + name +
      " exact matches " + groups.filter((x, i) => x % 29 === target[i]).length + "/85");
  }
}
// Genuine SHA-512 positive control: every original target byte (0..255)
// can be represented by four base5 digits with no modulo loss.
const syntheticFour = hash.flatMap(value => {
  const z = [Math.floor(value / 125), Math.floor(value / 25) % 5,
    Math.floor(value / 5) % 5, value % 5];
  assert.ok(z.every(x => x >= 0 && x <= 4));
  return z;
});
assert.deepEqual(four(syntheticFour, "high"), hash);
const corrupted = syntheticFour.slice();
corrupted[0] = (corrupted[0] + 1) % 5;
assert.notDeepEqual(four(corrupted, "high"), hash);
// Genuine original 85-symbol positive: base5 triples each retain a GP29
// target index; one trailing cell remains available as a visible sentinel.
const syntheticThree = printed56.flatMap(value =>
  [Math.floor(value / 25), Math.floor(value / 5) % 5, value % 5]).concat(0);
assert.equal(syntheticThree.length, 256);
assert.deepEqual(triple(syntheticThree, "high"), printed56);
console.log("PASS. Both source-native plants exact; original SHED-field direct p56 hash and rune recipients rejected.");
