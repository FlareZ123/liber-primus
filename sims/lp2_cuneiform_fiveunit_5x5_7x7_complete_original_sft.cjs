"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const solved = JSON.parse(fs.readFileSync(path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const alphabet = solved.runes;
const runeToIndex = new Map(alphabet.map((rune, index) => [rune, index]));
const transcript = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const pages = transcript.split("%");
const numbered = pages.slice(36, 39).join("\n");
const start = numbered.indexOf("1-");
const end = numbered.indexOf("&", numbered.indexOf("5-"));
assert(start >= 0 && end > start);
const parts = numbered.slice(start, end).split(/[1-5]-/).slice(1);

/** Convert visible runes to the canonical GP29 indices without altering word breaks. @param {string} source */
function indices(source) {
  return Array.from(source).filter((rune) => runeToIndex.has(rune)).map((rune) => runeToIndex.get(rune));
}
const original = parts.map(indices);
assert.deepEqual(original.map((v) => v.length), [139, 91, 98, 96, 129]);
const L = Math.min(...original.map((v) => v.length));
const tailLengths = original.map((v) => v.length - L);
assert.equal(L, 91);
assert.deepEqual(tailLengths, [48, 0, 7, 5, 38]);
assert.equal(tailLengths.reduce((a, b) => a + b, 0), 98);

const squareFile = fs.readFileSync(path.join(root, "resources", "cicada2014-openpuff-magic-squares.txt"), "utf8");
const squares = squareFile.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((row) => row.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map((s) => s.length), [5, 7, 5]);
const [A, B, C] = squares;

/** @param {number} x */
function mod(x) { return (x % 29 + 29) % 29; }
/** @param {number[][]} m @param {number[]} v */
function matvec(m, v) { return m.map((row) => mod(row.reduce((sum, n, i) => sum + n * v[i], 0))); }
/** @param {number[][]} a @param {number[][]} b */
function matmul(a, b) { return a.map((row) => b[0].map((unused, col) =>
  mod(row.reduce((sum, n, i) => sum + n * b[i][col], 0)))); }
/** @param {number[][]} m */
function transpose(m) { return m[0].map((unused, col) => m.map((row) => row[col])); }

/** Exact Gauss-Jordan inverse over GF(29). @param {number[][]} a */
function inverse(a) {
  const n = a.length;
  const t = a.map((row, i) => [...row.map(mod), ...Array.from({length: n}, (unused, j) => Number(i === j))]);
  for (let col = 0; col < n; col++) {
    const pivotRow = t.findIndex((row, i) => i >= col && row[col] !== 0);
    assert(pivotRow >= 0, "historical square must be invertible modulo 29");
    [t[col], t[pivotRow]] = [t[pivotRow], t[col]];
    const pivotInverse = Array.from({length: 28}, (unused, i) => i + 1).find((i) => mod(i * t[col][col]) === 1);
    assert(pivotInverse !== undefined);
    t[col] = t[col].map((x) => mod(x * pivotInverse));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = t[row][col];
      t[row] = t[row].map((x, i) => mod(x - factor * t[col][i]));
    }
  }
  return t.map((row) => row.slice(n));
}
const Ai = inverse(A), Bi = inverse(B), Ci = inverse(C);
assert.deepEqual(matmul(A, Ai), A.map((row, i) => row.map((unused, j) => Number(i === j))));
assert.deepEqual(matmul(B, Bi), B.map((row, i) => row.map((unused, j) => Number(i === j))));
assert.deepEqual(matmul(C, Ci), C.map((row, i) => row.map((unused, j) => Number(i === j))));

/** Source-authentic complete geometric operation. 91 five-way vertical cells use
 * the 3301 5x5 and final 1033 5x5 matrices in historical printed order; the
 * 98 surplus runes use the middle 1033 7x7 in two complete 7x7 blocks.
 * The matrix direction is source-fixed, and the original ordinal word offsets
 * are preserved when writing output back into each numbered paragraph.
 * @param {number[][]} input
 * @param {boolean} decrypt
 * @returns {number[][]}
 */
function transform(input, decrypt) {
  const out = input.map((v) => Array(v.length).fill(0));
  for (let col = 0; col < L; col++) {
    const column = input.map((item) => item[col]);
    const moved = decrypt ? matvec(Ci, matvec(Ai, column)) : matvec(A, matvec(C, column));
    for (let i = 0; i < 5; i++) out[i][col] = moved[i];
  }
  const tails = input.flatMap((item) => item.slice(L));
  assert.equal(tails.length, 98);
  const from = decrypt ? Bi : B;
  const recoveredTails = [];
  for (let i = 0; i < tails.length; i += 49) {
    const tile = Array.from({length: 7}, (unused, row) => tails.slice(i + row * 7, i + row * 7 + 7));
    recoveredTails.push(...matmul(matmul(from, tile), transpose(from)).flat());
  }
  let offset = 0;
  for (let i = 0; i < 5; i++) {
    out[i].splice(L, tailLengths[i], ...recoveredTails.slice(offset, offset + tailLengths[i]));
    offset += tailLengths[i];
  }
  assert.equal(offset, 98);
  return out;
}

/** @param {number[]} data */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const n of data) counts[n]++;
  return counts.reduce((sum, f) => sum + f * (f - 1), 0) / (data.length * (data.length - 1));
}
const output = transform(original, true);
assert.deepEqual(transform(output, false), original, "all original symbols must replay exactly");
const native = solved.sections.flatMap((section) => indices(section.source_text));
const plant = [];
let offset = 0;
for (const item of original) {
  plant.push(native.slice(offset, offset + item.length));
  offset += item.length;
}
assert.equal(offset, 553);
assert.deepEqual(transform(transform(plant, false), true), plant, "authentic native GP positive must recover completely");

const info = {
  hypothesis: "source-print-order A5 then C5 across five numbered streams; B7 on two surplus 7x7 tiles",
  inputRuneCounts: original.map((item) => item.length),
  commonFiveWayColumns: L,
  sourceTailLengths: tailLengths,
  sourceTail7x7Tiles: 2,
  originalRuneReplay: 553,
  authenticSolvedNativePositiveReplay: 553,
  originalIoC: ioc(original.flat()),
  decodedIoC: ioc(output.flat()),
  perPassageIoC: output.map(ioc),
  solvedNativeIoC: ioc(plant.flat()),
  originalOutputStart: output.map((item) => item.slice(0, 20).map((index) => alphabet[index]).join(""))
};
console.log(JSON.stringify(info, null, 2));
console.log("PASS: complete original forward and inverse; zero authentic unknown plaintext recovered.");
