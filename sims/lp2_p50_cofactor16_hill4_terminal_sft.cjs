"use strict";
/**
 * Single-file test: the exact p50 grid GF29 cofactor of degree16, stripped
 * of its monic leading 1, as a 4x4 Hill key on the 308 source terminal runes.
 * It tests one source-fixed matrix, one standard column-vector orientation.
 *
 * Run: node sims/lp2_p50_cofactor16_hill4_terminal_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const grid = require("../resources/liber-primus/lp2-grid-256.json");
const mod = x => ((x % 29) + 29) % 29;
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes))
  .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
/** The independently established monic product of all low-degree grid factors. */
const factor16 = [1,25,17,11,15,7,11,26,6,26,13,2,6,12,26,20,13];
/** @param {number[]} coeffs @param {number[]} factor @returns {number[]} */
function remainder(coeffs, factor) {
  const a = coeffs.map(mod);
  for (let i = 0; i + factor.length <= a.length; i++) {
    const lead = a[i];
    for (let j = 0; j < factor.length; j++)
      a[i + j] = mod(a[i + j] - lead * factor[j]);
  }
  return a.slice(-(factor.length - 1));
}
assert.deepEqual(remainder(grid.bytes, factor16), Array(16).fill(0));
const key = Array.from({length: 4}, (_, i) => factor16.slice(1 + i * 4, 5 + i * 4));
assert.deepEqual(key, [
  [25,17,11,15], [7,11,26,6], [26,13,2,6], [12,26,20,13]
]);
/** @param {number[][]} matrix @returns {number[][]} */
function invert4(matrix) {
  const a = matrix.map((row, r) => [...row, ...Array.from(
    {length: 4}, (_, c) => Number(c === r))]);
  for (let c = 0; c < 4; c++) {
    const pivot = a.findIndex((row, r) => r >= c && mod(row[c]) !== 0);
    assert.ok(pivot >= c, "Hill4 cofactor must have nonzero determinant");
    [a[c], a[pivot]] = [a[pivot], a[c]];
    const inv = Array.from({length: 28}, (_, i) => i + 1)
      .find(x => mod(x * a[c][c]) === 1);
    assert.ok(inv !== undefined);
    a[c] = a[c].map(v => mod(v * inv));
    for (let r = 0; r < 4; r++) if (r !== c) {
      const mult = a[r][c];
      a[r] = a[r].map((v, k) => mod(v - mult * a[c][k]));
    }
  }
  assert.deepEqual(a.map(row => row.slice(0, 4)), [
    [1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]
  ]);
  return a.map(row => row.slice(4));
}
/** @param {number[]} source @param {number[][]} matrix @returns {number[]} */
function hill4(source, matrix) {
  assert.equal(source.length % 4, 0);
  const result = [];
  for (let k = 0; k < source.length; k += 4) {
    for (let r = 0; r < 4; r++) {
      let n = 0;
      for (let c = 0; c < 4; c++) n += matrix[r][c] * source[k + c];
      result.push(mod(n));
    }
  }
  return result;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const inverse = invert4(key);
assert.deepEqual(inverse, [
  [15,1,22,10],[28,17,5,20],[13,24,19,12],[15,4,23,6]
]);
const p = n => corpus.pages.find(page => page.page === n).indices;
const original = [...p(54), ...p(55)];
assert.deepEqual([p(54).length, p(55).length, original.length],
  [232,76,308]);
const decoded = hill4(original, inverse);
assert.deepEqual(hill4(decoded, key), original);
const clear = Array.from({length: 308}, (_, i) => p(57)[i % 95]);
const encryptedPlant = hill4(clear, key);
assert.deepEqual(hill4(encryptedPlant, inverse), clear);
console.log(JSON.stringify({
  source: "unchanged LP2 32x8 table and source pp54-55 (original 308 runes)",
  factor16, matrix: key, inverse,
  observations: {
    nativeP57IoC: ioc(p(57)),
    chapterOriginalIoC: ioc(original),
    chapterHill4InverseIoC: ioc(decoded),
    p54OriginalIoC: ioc(p(54)),
    p54DecodedIoC: ioc(decoded.slice(0,232)),
    p55OriginalIoC: ioc(p(55)),
    p55DecodedIoC: ioc(decoded.slice(232)),
    openingGp80: decoded.slice(0,80).map(v=>corpus.translit[v]).join("-"),
    p55Gp76: decoded.slice(232).map(v=>corpus.translit[v]).join("-")
  },
  exactOriginalReencryption: "308/308",
  blindSourceNativeRoundTrip: "308/308",
  decision: "Source-visible cofactor16->Hill4 is algebraically exact and reversible, but the original terminal inverse contains no GP prose."
},null,2));
