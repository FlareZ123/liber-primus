"use strict";
/**
 * Frozen inner-square Hill inverse on original physical LP2 p55.
 * The 2014 source supplies three squares of sizes 5,7,5. Strip each
 * circumference to obtain 3x3,5x5,3x3 keys and process 9+25+9 runes.
 * Reproduce: node sims/lp2_p55_three_2014_square_inner_hill_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const mod = n => ((n % 29) + 29) % 29;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/).map(block =>
    block.trim().split(/\r?\n/).map(row => row.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(m => m.length), [5, 7, 5]);
assert(squares.every(m => m.every(row => row.length === m.length)));
const matrices = squares.map(m => m.slice(1, -1)
  .map(row => row.slice(1, -1).map(mod)));
assert.deepEqual(matrices.map(m => m.length), [3, 5, 3]);
const words = transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const lengths = words.map(w => [...w].length);
assert.deepEqual(lengths, [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const innerLengths = lengths.map(n => Math.max(0, n - 2));
const cipher = words.flatMap(w => [...w].slice(1, -1))
  .map(ch => corpus.runes.indexOf(ch));
const lockedOriginal = [19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18];
assert.deepEqual(cipher, lockedOriginal);
assert.equal(innerLengths.reduce((a, b) => a + b, 0), 43);
/** @param {number} a @returns {number} */
function reciprocal(a) {
  for (let x = 1; x < 29; x++) if (mod(x * a) === 1) return x;
  throw Error("non-invertible field element");
}
/** @param {number[][]} matrix @returns {number[][]} */
function invert(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.map(mod).concat(
    Array.from({length:n}, (_, j) => +(i === j))));
  for (let j = 0; j < n; j++) {
    const i = a.findIndex((row, k) => k >= j && row[j] !== 0);
    assert(i >= j, "singular source inner matrix");
    [a[j], a[i]] = [a[i], a[j]];
    const scale = reciprocal(a[j][j]);
    a[j] = a[j].map(x => mod(x * scale));
    for (let k = 0; k < n; k++) if (k !== j) {
      const factor = a[k][j];
      a[k] = a[k].map((v, h) => mod(v - factor * a[j][h]));
    }
  }
  return a.map(row => row.slice(n));
}
/** @param {number[][]} m @returns {number[][]} */
function transpose(m) { return m[0].map((_, i) => m.map(row => row[i])); }
/** @param {number[][]} m @param {number[]} vector @returns {number[]} */
function product(m, vector) {
  return m.map(row => mod(row.reduce((acc, x, j) => acc + x * vector[j], 0)));
}
/** @param {number[]} symbols @param {number[][][]} keys @returns {number[]} */
function blocks(symbols, keys) {
  const out = []; let start = 0;
  for (const key of keys) {
    const n = key.length;
    for (let i = 0; i < n; i++) {
      out.push(...product(key, symbols.slice(start, start + n)));
      start += n;
    }
  }
  assert.equal(start, symbols.length);
  return out;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const n of a) counts[n]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @returns {string} */
function tokens(a) { return a.map(n => corpus.translit[n]).join(" "); }
/** @param {number[]} a @returns {string} */
function byOriginalWord(a) {
  let offset = 0;
  return innerLengths.map(n => {
    const part = tokens(a.slice(offset, offset + n));
    offset += n;
    return "[" + part + "]";
  }).join(" ");
}
const native = corpus.pages.find(p => p.page === 57).indices.slice(0, 43);
assert.equal(native.length, 43);
for (const mode of ["column", "row"]) {
  const keys = mode === "row" ? matrices.map(transpose) : matrices;
  const inverseKeys = keys.map(invert);
  const plain = blocks(cipher, inverseKeys);
  assert.deepEqual(blocks(plain, keys), cipher);
  const plantedCipher = blocks(native, keys);
  assert.deepEqual(blocks(plantedCipher, inverseKeys), native);
  console.log(JSON.stringify({
    mode, nativePlantRecovered: native.length, cipherLength: cipher.length,
    nativeIoC: ioc(native), cipherIoC: ioc(cipher), decodedIoC: ioc(plain),
    decodedIndices: plain, decodedTokens: tokens(plain),
    printedWordInteriors: byOriginalWord(plain)
  }));
}
