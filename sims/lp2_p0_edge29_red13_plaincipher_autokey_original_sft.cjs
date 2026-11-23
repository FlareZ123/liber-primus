"use strict";

/**
 * LP2 p0–p2 original 33-line edge-alphabet / red13 autokey decision.
 * Single runnable source-native test (Node 22, CommonJS).
 * Two historically intelligible evolving Vigenere variants are frozen:
 * (1) plaintext autokey and (2) ciphertext autokey, both at lag13.
 * No unknown plaintext or authentic author opcode is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} pathname @returns {string} */
const read = pathname => fs.readFileSync(path.join(ROOT, pathname), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {string} text @returns {number[][]} */
function printedLines(text) {
  return text.split("/").map(line => [...line].filter(r => runeIndex.has(r))
    .map(r => runeIndex.get(r))).filter(line => line.length > 0);
}
const physical = transcription.split("%").slice(0, 3).map(printedLines);
const opening = physical.flat();
const red13 = opening[0].slice(0, 13);
const black = [opening[0].slice(13), ...opening.slice(1)];
const widths = [
  7, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23, 23,
  24, 23, 23, 21, 23, 23, 22, 21, 21, 21, 21, 23,
  21, 24, 22, 25, 23, 21, 24, 22, 19
];
assert.deepEqual(black.map(x => x.length), widths);
assert.equal(black.length, 33);
assert.deepEqual(red13, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const pageRuneCounts = physical.map(lines => lines.flat().length);
assert.deepEqual(pageRuneCounts, [262, 266, 201]);
for (let page = 0; page < 3; page++) {
  assert.deepEqual(physical[page].flat(), corpus.pages[page].indices);
}

const shell = black.flatMap(line => [line[0], line[line.length - 1]]);
const interior = black.flatMap(line => line.slice(1, -1));
const alphabet = [...new Set(shell)];
const expectedAlphabet = [
  2, 22, 3, 27, 13, 0, 15, 10, 25, 9, 18, 6, 17, 11, 21,
  28, 12, 16, 7, 24, 8, 19, 20, 1, 4, 23, 5, 26, 14
];
assert.equal(shell.length, 66);
assert.equal(interior.length, 650);
assert.deepEqual(alphabet, expectedAlphabet);
assert.equal(new Set(shell.slice(0, 46)).size, 29);
assert.equal(new Set(shell.slice(0, 45)).size, 28);
let offset = 0;
for (const line of black) {
  const recovered = [shell[(black.indexOf(line)) * 2],
    ...interior.slice(offset, offset + line.length - 2),
    shell[(black.indexOf(line)) * 2 + 1]];
  assert.deepEqual(recovered, line);
  offset += line.length - 2;
}
assert.equal(offset, 650);
const p0InteriorLength = physical[0][0].slice(13).length - 2 +
  physical[0].slice(1).reduce((s, line) => s + line.length - 2, 0);
assert.equal(p0InteriorLength, 225);

const rank = Array(29).fill(-1);
alphabet.forEach((x, i) => { rank[x] = i; });
/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;
/** @typedef {"plaintext"|"ciphertext"} Mode */
/**
 * @param {Mode} mode
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function decrypt(mode, ciphertext) {
  const plaintext = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const key = i < 13 ? red13[i] :
      mode === "plaintext" ? plaintext[i - 13] : ciphertext[i - 13];
    plaintext.push(alphabet[mod29(rank[ciphertext[i]] - rank[key])]);
  }
  return plaintext;
}
/**
 * @param {Mode} mode
 * @param {number[]} plaintext
 * @returns {number[]}
 */
function encrypt(mode, plaintext) {
  const ciphertext = [];
  for (let i = 0; i < plaintext.length; i++) {
    const key = i < 13 ? red13[i] :
      mode === "plaintext" ? plaintext[i - 13] : ciphertext[i - 13];
    ciphertext.push(alphabet[mod29(rank[plaintext[i]] + rank[key])]);
  }
  return ciphertext;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) count[value]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values @returns {string} */
const readable = values => values.map(v => corpus.translit[v]).join(" ");

const originalIoC = ioc(interior);
assert.ok(Math.abs(originalIoC - 0.034149579234324996) < 1e-13);
const solvedNative = corpus.pages[57].indices;
assert.equal(solvedNative.length, 95);
const native650 = Array.from({ length: 650 }, (_, i) => solvedNative[i % 95]);
for (const mode of ["plaintext", "ciphertext"]) {
  const candidate = decrypt(mode, interior);
  assert.deepEqual(encrypt(mode, candidate), interior);
  const plant = encrypt(mode, native650);
  assert.deepEqual(decrypt(mode, plant), native650);
  const stats = {
    mode,
    sourcePages: [0, 1, 2],
    titleRunes: 13,
    exteriorRunes: shell.length,
    targetInteriorRunes: interior.length,
    initialOriginalIoC: originalIoC,
    recoveredAllIoC: ioc(candidate),
    recoveredP0IoC: ioc(candidate.slice(0, p0InteriorLength)),
    recoveredP1P2HoldoutIoC: ioc(candidate.slice(p0InteriorLength)),
    originalExactReplay: true,
    nativePlantedExactRecovery: native650.length,
    first100Recovered: readable(candidate.slice(0, 100)),
    recovered650: readable(candidate)
  };
  console.log(JSON.stringify(stats, null, 2));
}
console.log("PASS: source-exact 33-line edge/red13 evolving-autokey original inverse and native planted positives");
