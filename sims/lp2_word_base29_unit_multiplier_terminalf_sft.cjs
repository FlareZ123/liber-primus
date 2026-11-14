"use strict";

/**
 * Original LP2 word-level BASE29 unit-multiplication necessary-condition gate.
 *
 * This tests every possible independently secret invertible multiplier for
 * each intact original printed word, without guessing any keys. Multiplication
 * by a unit modulo 29^length preserves both the number of trailing zero GP
 * digits and the final rune F (index 0). The original standalone F word is a
 * key-independent contradiction with ordinary A/I/O English singletons.
 *
 * Inputs: canonical original-source LP2 rune corpus and printed boundaries,
 * plus three independent public-domain prose language controls.
 *
 * Execute with Node.js 22 from the repository root or any working directory.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalTranscript = read("resources/lp2-transcription.txt");

const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit.map((token, index) => [token, index])
  .sort((a, b) => b[0].length - a[0].length);

/** @param {string} word @returns {number[] | null} */
function encodeEnglish(word) {
  const source = word.toUpperCase().replaceAll("QU", "CW")
    .replaceAll("ING", "NG").replaceAll("K", "C")
    .replaceAll("V", "U").replaceAll("Z", "S");
  const result = [];
  for (let i = 0; i < source.length;) {
    const found = gpTokens.find(([token]) => source.startsWith(token, i));
    if (!found) return null;
    result.push(found[1]);
    i += found[0].length;
  }
  return result;
}

/** @param {string} transcription @returns {string[]} */
function getPrintedWords(transcription) {
  const joined = transcription.replace(/\/\s*\r?\n/g, "")
    .replace(/%\s*\r?\n/g, "")
    .replace(/[&$]\s*\r?\n/g, "-")
    .replace(/\s/g, "");
  return [...joined.matchAll(/[\u16a0-\u16ff]+/gu)].map((match) => match[0]);
}

/** @param {string} word @returns {number[]} */
function toIndices(word) {
  return [...word].map((glyph) => {
    const index = runeToIndex.get(glyph);
    assert.notEqual(index, undefined, "unknown GP rune");
    return index;
  });
}

/** @param {number[]} digits @returns {bigint} */
function toBase29(digits) {
  return digits.reduce((value, digit) => 29n * value + BigInt(digit), 0n);
}

/** @param {bigint} x @param {bigint} modulus @returns {bigint} */
function modularInverse(x, modulus) {
  let t = 0n;
  let nextT = 1n;
  let r = modulus;
  let nextR = x % modulus;
  while (nextR !== 0n) {
    const q = r / nextR;
    [t, nextT] = [nextT, t - q * nextT];
    [r, nextR] = [nextR, r - q * nextR];
  }
  assert.equal(r, 1n, "multiplier must be coprime to 29");
  return (t % modulus + modulus) % modulus;
}

/** @param {number[][]} words @returns {Map<number, {n:number, f:number}>} */
function endingsByLength(words) {
  const counts = new Map();
  for (const word of words) {
    const record = counts.get(word.length) || { n: 0, f: 0 };
    record.n++;
    if (word[word.length - 1] === 0) record.f++;
    counts.set(word.length, record);
  }
  return counts;
}

const allWords = getPrintedWords(originalTranscript);
const originalWords = allWords.slice(0, 2896);
const originalIndices = originalWords.flatMap(toIndices);
const canonicalIndices = corpus.pages
  .filter((page) => page.page <= 55).flatMap((page) => page.indices);
assert.equal(corpus.pages[50].runic_count, 0);
assert.equal(originalWords.length, 2896);
assert.equal(originalIndices.length, 12956);
assert.deepEqual(originalIndices, canonicalIndices);

let pos = 0;
const singletonF = [];
for (let i = 0; i < originalWords.length; i++) {
  if (originalWords[i] === corpus.runes[0]) singletonF.push([i, pos]);
  pos += originalWords[i].length;
}
assert.deepEqual(singletonF, [[143, 644]]);
const p2offset = corpus.pages[0].runic_count + corpus.pages[1].runic_count;
assert.equal(644 - p2offset, 116);

const originalCount = endingsByLength(originalWords.map(toIndices));
assert.deepEqual(originalCount.get(3), { n: 720, f: 21 });
assert.equal([...originalCount.values()].reduce((sum, item) => sum + item.f, 0), 82);

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 12988, 26],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 4000, 7],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 16897, 30],
];
for (const [name, filename, expectedN, expectedF] of controls) {
  const words = [...read(filename).matchAll(/[A-Za-z]+/g)]
    .map((match) => encodeEnglish(match[0])).filter((word) => word && word.length);
  const counts = endingsByLength(words);
  const tri = counts.get(3);
  assert.deepEqual(tri, { n: expectedN, f: expectedF });
  let expected = 0;
  for (const [length, orig] of originalCount) {
    const reference = counts.get(length);
    if (reference) expected += orig.n * reference.f / reference.n;
  }
  process.stdout.write(name + ": 3-GP-rune words ending F = " +
    tri.f + "/" + tri.n + "; expected in original's 720 triples = " +
    (720 * tri.f / tri.n).toFixed(4) +
    "; length-conditioned expected across 2,896 words = " +
    expected.toFixed(4) + "\n");
}

// Source-native positive: independently clear p57 words under arbitrary secret
// unit keys, with exact full BASE29 inverse and invariant trailing-F positions.
const p57Words = getPrintedWords(originalTranscript.split(/%\s*\r?\n/).at(-1))
  .map(toIndices);
assert.deepEqual(p57Words.flat(), corpus.pages[57].indices);
let recovered = 0;
for (const [i, word] of p57Words.entries()) {
  const modulus = 29n ** BigInt(word.length);
  const secretUnit = BigInt(1 + (i % 28));
  const plaintextNumber = toBase29(word);
  const ciphertextNumber = plaintextNumber * secretUnit % modulus;
  const decrypted = ciphertextNumber * modularInverse(secretUnit, modulus) % modulus;
  assert.equal(decrypted, plaintextNumber);
  assert.equal(ciphertextNumber % 29n === 0n, plaintextNumber % 29n === 0n);
  recovered += word.length;
}
assert.equal(recovered, 95);

process.stdout.write("ORIGINAL: 2,896 words / 12,956 runes; final-F " +
  "82 words; three-rune final-F 21/720; singleton F at p2:116\n");
process.stdout.write("POSITIVE: all 95 solved p57 runes invert under secret " +
  "unit BASE29 word multipliers\n");
process.stdout.write("DECISION: no unit-multiplication-per-printed-word inverse " +
  "can turn original singleton F into ordinary English A/I/O; " +
  "the triple-ending-F surplus persists under every secret key.\n");
