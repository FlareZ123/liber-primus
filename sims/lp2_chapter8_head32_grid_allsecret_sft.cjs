"use strict";
/**
 * Original LP2 eight-opening / eight-column 32-row candidate.
 *
 * Source: original LP2 physical chapter openers pp0,3,8,15,23,27,33,40;
 * 32x8 printed base60-derived byte grid on pp49-51.
 *
 * Keyless decision: is T[row,col] (+/-) C[chapter,col,row] separable as
 * an arbitrary 32-component row mask plus an arbitrary 8-component
 * column mask over GF(29)? A valid additive encoding must pass all
 * 217 interior 2x2 anchored differences exactly, independent of masks.
 *
 * Run: node sims/lp2_chapter8_head32_grid_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
/** @param {number} n */
const mod = (n) => (n % 29 + 29) % 29;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const openingPages = [0, 3, 8, 15, 23, 27, 33, 40];
const rows = 32, columns = 8;
const bytes = table.bytes;
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const source = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(source.length, 12956);
const openers = openingPages.map((p) => {
  const found = corpus.pages.find((page) => page.page === p);
  assert(found && found.indices.length >= rows);
  return found.indices.slice(0, rows);
});
const sourceMatrix = Array.from({ length: rows }, (_, r) =>
  Array.from({ length: columns }, (_, c) => openers[c][r]));
const tableMatrix = Array.from({ length: rows }, (_, r) =>
  Array.from({ length: columns }, (_, c) => bytes[8 * r + c] % 29));
/** @param {number[][]} data */
function separability(data) {
  assert.equal(data.length, rows);
  assert(data.every((r) => r.length === columns));
  let passed = 0, constraints = 0;
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < columns; c++) {
      const second = mod(data[r][c] - data[r][0] - data[0][c] + data[0][0]);
      if (second === 0) passed++;
      constraints++;
    }
  }
  assert.equal(constraints, 217);
  return { passed, constraints };
}
/** @param {number[][]} m */
function recoverRowColumn(m) {
  const row = m.map((x) => mod(x[0] - m[0][0]));
  const col = m[0].slice();
  return m.map((r, i) => r.map((value, j) => mod(value - row[i] - col[j])));
}
/** @param {number[]} text */
function ioc(text) {
  const counts = Array(29).fill(0);
  text.forEach((x) => counts[x]++);
  return counts.reduce((sum, v) => sum + v * (v - 1), 0) /
    (text.length * (text.length - 1));
}
const tokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text */
function englishGp(text) {
  const numbers = [];
  for (let word of text.match(/[A-Za-z]+/g) || []) {
    word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
    for (let i = 0; i < word.length;) {
      const part = tokens.find((x) => word.startsWith(x.token, i));
      assert(part, "Unexpected non-GP letter in " + word);
      numbers.push(part.index);
      i += part.token.length;
    }
  }
  return numbers;
}

const native = englishGp(read("resources/control/shakespeare_first300k.txt"));
const histogram = new Float64Array(29);
native.forEach((p) => { histogram[p]++; });
const ln = Array.from(histogram, (v) =>
  Math.log((v + 0.5) / (native.length + 14.5)));
/** @param {number[]} output */
const unigram = (output) =>
  output.reduce((s, v) => s + ln[v], 0) / output.length;
/** @param {number[][]} matrix */
const flatten = (matrix) => openingPages.flatMap((_, c) =>
  Array.from({ length: rows }, (_, r) => matrix[r][c]));
/** @param {number[]} arr */
const transliterate = (arr) => arr.map((x) => corpus.translit[x]).join("");

const cases = [];
for (const sign of [-1, 1]) {
  const aligned = sourceMatrix.map((r, i) =>
    r.map((p, j) => mod(tableMatrix[i][j] + sign * p)));
  const exact = separability(aligned);
  assert.equal(exact.passed, sign === -1 ? 6 : 5);
  assert(exact.passed < exact.constraints);
  cases.push({ sign, ...exact });
}

const sourceStats = { ioc: ioc(flatten(sourceMatrix)),
  unigram: unigram(flatten(sourceMatrix)) };
const keys = [];
for (const layout of ["column", "row"]) {
  for (const sign of [-1, 1]) {
    const candidate = sourceMatrix.map((r, i) => r.map((p, j) => {
      const k = bytes[layout === "column" ? i * 8 + j : j * 32 + i] % 29;
      return mod(p + sign * k);
    }));
    const output = flatten(candidate);
    // Positive plant: the same fixed table keys invert an independent
    // native-English message, without fitting the original ciphertext.
    const planted = native.slice(0, rows * columns);
    assert.equal(planted.length, 256);
    const encrypted = planted.map((v, flatIndex) => {
      const col = Math.floor(flatIndex / 32), row = flatIndex % 32;
      const k = bytes[layout === "column" ? row * 8 + col : col * 32 + row] % 29;
      return mod(v - sign * k);
    });
    const recovered = encrypted.map((v, flatIndex) => {
      const col = Math.floor(flatIndex / 32), row = flatIndex % 32;
      const k = bytes[layout === "column" ? row * 8 + col : col * 32 + row] % 29;
      return mod(v + sign * k);
    });
    assert.deepEqual(recovered, planted);
    keys.push({ layout, sign, ioc: Number(ioc(output).toFixed(10)),
      unigram: Number(unigram(output).toFixed(8)),
      firstChapter: transliterate(candidate.map((x) => x[0])) });
  }
}
assert.deepEqual(keys.map((x) => Number(x.ioc.toFixed(8))),
  [0.03618260, 0.03477328, 0.03523284, 0.03443627]);

// Fully secret two-axis positive plant. Its 40 hidden shifts (gauge
// dimension one) are inferred exactly with 256/256 plaintext recovery.
const positivePlain = Array.from({ length: rows }, (_, i) =>
  Array.from({ length: columns }, (_, j) => native[j * rows + i]));
const positiveRow = Array.from({ length: rows }, (_, i) => mod(7 * i + 3));
const positiveCol = Array.from({ length: columns }, (_, j) => mod(11 * j + 5));
const plantedTable = positivePlain.map((r, i) =>
  r.map((p, j) => mod(p + positiveRow[i] + positiveCol[j])));
const differenced = plantedTable.map((r, i) =>
  r.map((v, j) => mod(v - positivePlain[i][j])));
assert.deepEqual(separability(differenced), { passed: 217, constraints: 217 });
const recoveredShifts = recoverRowColumn(differenced);
assert.deepEqual(recoveredShifts,
  Array.from({ length: rows }, () => Array(columns).fill(0)));
const reconstructedPlain = plantedTable.map((r, i) =>
  r.map((v, j) => mod(v - positiveRow[i] - positiveCol[j])));
assert.deepEqual(reconstructedPlain, positivePlain);

console.log(JSON.stringify({
  source: { pages: openingPages, headerRunes: 256, gridCells: 256,
    gridSHA256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290" },
  keyless: cases, direct: keys, native: {
    ioc: Number(ioc(native.slice(0, 256)).toFixed(10)),
    unigram: Number(unigram(native.slice(0, 256)).toFixed(8))
  }, raw: sourceStats, fullySecretPositive: { predicted: 217,
    matched: 217, recoveredGP: 256 }
}, null, 2));
