"use strict";

/**
 * Original LP2 p0–2 printed-line exterior: exact 29-rune cover-time,
 * independent held-out source-line-window inventory, and one frozen
 * original-LP1 Vigenere consumer. This is an exploratory clue test,
 * not a solution or a retrospective plaintext fit.
 *
 * Windows 11 / Node.js 22: node sims/lp2_opening_33line_edge_alphabet_2014_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {string} text */
function physicalLines(text) {
  return text.split("/").map(line => [...line].filter(r => runeIndex.has(r))
    .map(r => runeIndex.get(r))).filter(line => line.length);
}
const pageLines = source.split("%").slice(0, 56).map((part, page) =>
  physicalLines(part).map(indices => ({ page, indices }))).flat();
const openingPageLines = pageLines.filter(line => line.page <= 2);
const redTitle = openingPageLines[0].indices.slice(0, 13);
const black = [
  openingPageLines[0].indices.slice(13),
  ...openingPageLines.slice(1).map(line => line.indices)
];
const widths = [
  7, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23, 23,
  24, 23, 23, 21, 23, 23, 22, 21, 21, 21, 21, 23,
  21, 24, 22, 25, 23, 21, 24, 22, 19
];
assert.deepEqual(black.map(x => x.length), widths);
assert.equal(redTitle.length, 13);
assert.equal(black.flat().length, 716);
assert.equal(pageLines.length, 599);
const core = black.flatMap(line => line.slice(1, -1));
const shell = black.flatMap(line => [line[0], line[line.length - 1]]);
assert.equal(shell.length, 66);
assert.equal(core.length, 650);
assert.equal(shell.length + core.length + redTitle.length, 729);
let offset = 0;
for (let i = 0; i < 33; i++) {
  const word = [shell[i * 2], ...core.slice(offset, offset + widths[i] - 2),
    shell[i * 2 + 1]];
  assert.deepEqual(word, black[i]);
  offset += widths[i] - 2;
}
assert.equal(offset, 650);

/** @param {number[]} a */
function frequency(a) {
  const n = Array(29).fill(0);
  for (const x of a) n[x]++;
  return n;
}
/** @param {number[]} a */
function distinct(a) {
  return frequency(a).filter(v => v > 0).length;
}
const firstOccurrenceAlphabet = [];
for (const v of shell) {
  if (!firstOccurrenceAlphabet.includes(v)) firstOccurrenceAlphabet.push(v);
}
assert.equal(firstOccurrenceAlphabet.length, 29);
let coverTime = 0;
for (let i = 1; i <= shell.length; i++) {
  if (distinct(shell.slice(0, i)) === 29) { coverTime = i; break; }
}
assert.equal(coverTime, 46);
const outerEqualPairs = frequency(shell).reduce((s, n) => s + n * (n - 1) / 2, 0);
assert.equal(outerEqualPairs, 59);
const allLines = pageLines.map((line, i) =>
  i === 0 ? { page: 0, indices: line.indices.slice(13) } : line);
const otherWindows = [];
for (let start = 0; start <= allLines.length - 23; start++) {
  const lines = allLines.slice(start, start + 23);
  if (lines.some(x => x.indices.length < 2)) continue;
  const outer = lines.flatMap(x => [x.indices[0], x.indices[x.indices.length - 1]]);
  if (distinct(outer) === 29) otherWindows.push(start);
}
assert.deepEqual(otherWindows, [0, 1, 2, 3, 4]);

// Null: two independently random, distinct positions on each of the 23
// authentic first black lines, keeping the actual body and line lengths.
// Source-locked before any decryption search. The 46-edge cover-time p-value
// is conditional on this exact source selection and is exploratory.
let seed = 0xacce4401;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const trials = 300000;
let completeAlphabetAt46 = 0;
for (let t = 0; t < trials; t++) {
  const seen = new Uint8Array(29);
  let count = 0;
  for (let lineIndex = 0; lineIndex < 33; lineIndex++) {
    const line = black[lineIndex];
    const i = random() % line.length;
    let j = random() % (line.length - 1);
    if (j >= i) j++;
    if (lineIndex >= 23) continue;
    for (const value of [line[i], line[j]]) {
      if (seen[value] === 0) { seen[value] = 1; count++; }
    }
  }
  if (count === 29) completeAlphabetAt46++;
}
assert.equal(completeAlphabetAt46, 54);

/** @param {number[]} a */
function ioc(a) {
  return frequency(a).reduce((s, v) => s + v * (v - 1), 0) / (a.length * (a.length - 1));
}
/**
 * The one frozen historically documented operation: ordinary subtractive
 * GP29 Vigenere, continuous clock, using the first-occurrence exterior
 * alphabet as a 29-rune key. The manuscript does not instruct this
 * interpretation, so it is a conditional negative, not an author claim.
 * @param {number[]} ciphertext @param {number[]} key
 */
function vigenere(ciphertext, key) {
  return ciphertext.map((c, i) => (c - key[i % key.length] + 29) % 29);
}
const candidate = vigenere(core, firstOccurrenceAlphabet);
const originalCoreIoC = ioc(core), decodedIoC = ioc(candidate);
assert.ok(Math.abs(originalCoreIoC - 0.034149579234324996) < 1e-13);
assert.ok(Math.abs(decodedIoC - 0.03443404053573545) < 1e-13);
for (let i = 0; i < core.length; i++) {
  assert.equal((candidate[i] + firstOccurrenceAlphabet[i % 29]) % 29, core[i]);
}
// A genuine-native GP29 control from the already-solved LP1, encoded to the
// same 650 rune target; confirms actual source-native positive inversion.
const native = JSON.parse(read("resources/liber-primus/lp2-corpus.json"))
  .pages[57].indices;
assert.ok(native.length >= 95);
const plant = Array.from({ length: 650 }, (_, i) => native[i % 95]);
const ciphertextPlant = plant.map((p, i) =>
  (p + firstOccurrenceAlphabet[i % 29]) % 29);
assert.deepEqual(vigenere(ciphertextPlant, firstOccurrenceAlphabet), plant);
const summary = {
  sourcePages: [0, 1, 2],
  physicalBodyLines: black.length, redTitle: redTitle.length,
  originalBlackRunes: 716, wholeBodyCore: 650, originalLineEdgeRunes: 66,
  firstOccurrenceAlphabet, firstOccurrenceCoverTime: coverTime,
  outerEqualPairs, allOriginal23LineWindows: allLines.length - 22,
  all29WindowStarts: otherWindows,
  null: { trials, all29WithinFirst46: completeAlphabetAt46,
    observedFraction: completeAlphabetAt46 / trials },
  sourceDerived29KeyVigenere: { coreOriginalIoC: originalCoreIoC,
    decodedIoC, first80Runes: candidate.slice(0, 80)
      .map(i => gp.translit[i]).join(" "), exactReplay: true }
};
console.log(JSON.stringify(summary, null, 2));
console.log("PASS: authentic opening-line 29-rune cover time and original conditional inverse");
