"use strict";
/**
 * Source-selected p7 red five-product matrix / inverse-determinant test.
 * Node.js 22, Windows 11, single-file read-only original-input SFT.
 *
 * node sims/lp2_p7_red_fiveword_hill_checksum_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/lp2-transcription.txt").split("%");
const idx = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {number} a @returns {number} */
const mod = a => ((a % 29) + 29) % 29;
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let i = 1; i < 29; i++) if (mod(a * i) === 1) return i;
  throw new Error("No GF29 inverse of " + a);
}
/** @param {number} page @returns {{start:number,end:number,arr:number[]}[]} */
function wordsOn(page) {
  // Numeric-only p50 contributes no rune text section in the canonical text.
  const raw = transcript[page - Number(page > 50)].replace(/\/\s*/g, "");
  let cursor = 0;
  return (raw.match(/[\u16a0-\u16ff]+/gu) || []).map(s => {
    const arr = [...s].map(r => {
      assert.ok(idx.has(r), "Unknown canonical GP29 rune");
      return idx.get(r);
    });
    const value = { start: cursor, end: cursor + arr.length, arr };
    cursor += arr.length;
    return value;
  });
}
/** @param {number} page @param {{start:number,length:number}} span */
function redWordProducts(page, span) {
  return wordsOn(page)
    .filter(x => x.start >= span.start && x.end <= span.start + span.length)
    .map(x => x.arr.reduce((a, b) => mod(a * b), 1));
}
const allRed = ink.pages.flatMap(p => (p.red_spans || []).map(span => ({
  page: p.page, span, products: redWordProducts(p.page, span)
})));
const longRed = allRed.filter(x => x.products.length >= 5);
assert.deepEqual(longRed.map(x => [x.page, x.products.length]), [[7, 5], [53, 12]]);
const p7 = longRed[0].products;
assert.deepEqual(p7, [11, 26, 8, 15, 2]);
const p53 = longRed[1].products;
assert.deepEqual(p53, [7, 14, 25, 16, 17, 23, 3, 4, 0, 22, 4, 1]);
/** @param {number[]} v @returns {{det:number,invDet:number|null,match:boolean}} */
function checksum(v) {
  const det = mod(v[0] * v[3] - v[1] * v[2]);
  const invDet = det ? inverse(det) : null;
  return { det, invDet, match: invDet === v[4] };
}
assert.deepEqual(checksum(p7), { det: 15, invDet: 2, match: true });
const p53Checks = [];
for (let i = 0; i + 4 < p53.length; i++) {
  const test = checksum(p53.slice(i, i + 5));
  p53Checks.push(test);
  assert.equal(test.match, false, "Unexpected second five-red-word matrix checksum");
}
assert.equal(p53Checks.length, 8);
const matrix = [[p7[0], p7[1]], [p7[2], p7[3]]];
const decoder = [[mod(p7[4] * p7[3]), mod(-p7[4] * p7[1])],
  [mod(-p7[4] * p7[2]), mod(p7[4] * p7[0])]];
assert.deepEqual(decoder, [[1, 6], [13, 22]]);
assert.deepEqual(
  [
    [mod(matrix[0][0] * decoder[0][0] + matrix[0][1] * decoder[1][0]),
      mod(matrix[0][0] * decoder[0][1] + matrix[0][1] * decoder[1][1])],
    [mod(matrix[1][0] * decoder[0][0] + matrix[1][1] * decoder[1][0]),
      mod(matrix[1][0] * decoder[0][1] + matrix[1][1] * decoder[1][1])]
  ],
  [[1, 0], [0, 1]]
);
/** @param {number[]} values @param {number[][]} m @param {boolean} transpose */
function pairs(values, m, transpose = false) {
  assert.equal(values.length % 2, 0);
  const o = [];
  for (let i = 0; i < values.length; i += 2) {
    const a = values[i], b = values[i + 1];
    if (transpose) o.push(
      mod(m[0][0] * a + m[1][0] * b),
      mod(m[0][1] * a + m[1][1] * b)
    );
    else o.push(
      mod(m[0][0] * a + m[0][1] * b),
      mod(m[1][0] * a + m[1][1] * b)
    );
  }
  return o;
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const hist = Array(29).fill(0);
  for (const a of arr) hist[a]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (arr.length * (arr.length - 1));
}
const p6Body = corpus.pages[6].indices.slice(82);
const p7Body = corpus.pages[7].indices.slice(0, 194);
assert.deepEqual([p6Body.length, p7Body.length], [114, 194]);
const body = p6Body.concat(p7Body);
assert.equal(body.length, 308);
const observed = [];
for (const transpose of [false, true]) {
  for (const backwards of [false, true]) {
    for (const [part, source] of [["p6", p6Body], ["p7", p7Body], ["joined", body]]) {
      const ciphertext = backwards ? source.slice().reverse() : source;
      const recovered = pairs(ciphertext, decoder, transpose);
      observed.push({
        part, transpose, backwards, count: recovered.length,
        ioc: Number(ioc(recovered).toFixed(9)),
        first70: recovered.slice(0, 70).map(x => corpus.translit[x]).join("")
      });
    }
  }
}
assert.ok(observed.every(x => x.ioc < 0.037));
const control = corpus.pages[57].indices;
assert.equal(control.length, 95);
const nativePlant = Array.from({ length: 308 }, (_, i) => control[i % control.length]);
assert.deepEqual(pairs(pairs(nativePlant, matrix), decoder), nativePlant);
assert.deepEqual(pairs(pairs(nativePlant, matrix, true), decoder, true), nativePlant);
// "Word numbers" alternative: use the same frozen matrix on GP0 and
// GP-prime sums of the 71 intact words inside the original source receiver.
const pageWords = [[6, 82, 196], [7, 0, 194]].flatMap(([page, lo, hi]) =>
  wordsOn(page).filter(w => w.start >= lo && w.end <= hi));
assert.equal(pageWords.length, 71);
const wordReadouts = [];
for (const weight of ["ordinal", "prime"]) {
  const s = pageWords.map(w => mod(w.arr.reduce((a, v) =>
    a + (weight === "prime" ? corpus.prime[v] : v), 0)));
  for (const phase of [0, 1]) {
    const stream = s.slice(phase, phase + 2 * Math.floor((s.length - phase) / 2));
    for (const m of [matrix, decoder]) {
      const readout = pairs(stream, m);
      wordReadouts.push({
        weight, phase, mode: m === matrix ? "forward" : "inverse",
        ioc: Number(ioc(readout).toFixed(9)),
        first50: readout.slice(0, 50).map(x => corpus.translit[x]).join("")
      });
    }
  }
}
assert.ok(wordReadouts.every(x => x.ioc < 0.04));
const report = {
  classification: "STRUCTURAL RED CHECKSUM ONLY; NO VERIFIED LP2 DECRYPTION",
  p7SourceRedProducts: p7,
  p7Determinant: checksum(p7),
  sourceDefinedMatrix: matrix,
  sourceDefinedInverse: decoder,
  allCompleteFiveWordRedWindows: 1 + p53Checks.length,
  checksumMatches: 1,
  p53EightFiveWordWindows: p53Checks,
  sourceBodyRunes: body.length,
  sourceBodyIoC: Number(ioc(body).toFixed(9)),
  decodedDirect: observed,
  decodedWordSum: wordReadouts,
  plantedNativeRunesInvertedExactly: nativePlant.length
};
console.log(JSON.stringify(report, null, 2));
