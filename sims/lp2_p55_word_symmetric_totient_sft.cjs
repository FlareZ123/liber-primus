"use strict";

/**
 * One frozen original-cipher full-word inverse for LP2 p54→p55.
 * The source-led proposal is per-word depth totient with both original
 * word-end glyphs included in a symmetric, completely invertible state.
 * All input/output symbols, the inherited p54 carry, and the source
 * printed word boundaries are retained.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "resources");
const c = require(path.join(root, "liber-primus", "lp2-corpus.json"));
const source = fs.readFileSync(
  path.join(root, "liber-primus", "lp2-transcription.txt"), "utf8"
).replace(/\r\n/g, "\n").split(/^%\s*$/m);
const lp1 = fs.readFileSync(
  path.join(root, "transcriptions", "lp1_wulfic_canonical.txt"), "utf8"
).replace(/\r\n/g, "\n").split(/^%\s*$/m);
const index = new Map(c.runes.map((rune, i) => [rune, i]));
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} depth @returns {number} */
function depthKey(depth) {
  // φ(prime) = prime-1; p56 authentic historical operation.
  return (c.prime[depth] - 1) % 29;
}

/** @param {number[]} word @returns {number[]} */
function decode(word) {
  const end = word.length - 1;
  const state = mod(word[0] + word[end]);
  return word.map((rune, i) => mod(rune - state - depthKey(Math.min(i, end - i))));
}

/** @param {number[]} word @returns {number[]} */
function encode(word) {
  const end = word.length - 1;
  if (end === 0) return [mod(-word[0] - depthKey(0))];
  const result = new Array(word.length);
  result[0] = mod(-word[end] - depthKey(0));
  result[end] = mod(-word[0] - depthKey(0));
  const state = mod(result[0] + result[end]);
  for (let i = 1; i < end; i++) {
    result[i] = mod(word[i] + state + depthKey(Math.min(i, end - i)));
  }
  return result;
}

/** @param {number[]} values @returns {string} */
function latin(values) {
  return values.map((x) => c.translit[x]).join("");
}

/**
 * @param {string} pageText
 * @returns {number[][]}
 */
function printedWords(pageText) {
  const punctuationAndRunes = Array.from(pageText)
    .filter((symbol) => index.has(symbol) || symbol === "-" || symbol === ".");
  const written = punctuationAndRunes.join("");
  return written.split(/[-.]/).filter((word) => word.length > 0)
    .map((word) => Array.from(word, (rune) => {
      const value = index.get(rune);
      assert.notEqual(value, undefined);
      return value;
    }));
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const freq = new Array(29).fill(0);
  for (const v of values) freq[v]++;
  return freq.reduce((n, f) => n + f * (f - 1), 0) / (values.length * (values.length - 1));
}

assert.equal(source.length, 57);
const p54 = c.pages.find((p) => p.page === 54).indices;
const p55 = c.pages.find((p) => p.page === 55).indices;
const p57 = c.pages.find((p) => p.page === 57).indices;
const words54 = printedWords(source[53]);
const words55 = printedWords(source[54]);
assert.deepStrictEqual(words55.map((w) => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.deepStrictEqual(words55.flat(), p55);
assert.deepStrictEqual(words54.flat(), p54);
assert.equal(words54.at(-1).length, 10);
const carried = words54.at(-1).concat(words55[0]);
assert.equal(carried.length, 11);
assert.equal(carried[10], p55[0]);

const completeWords = words55.slice(1);
const decodedWords = completeWords.map((word) => decode(word));
const decodedCarry = decode(carried);
const outputBody = decodedWords.flat();
const output55 = [decodedCarry.at(-1), ...outputBody];
assert.equal(outputBody.length, 75);
assert.equal(output55.length, 76);

for (const word of completeWords.concat([carried])) {
  assert.deepStrictEqual(encode(decode(word)), word);
  assert.deepStrictEqual(decode(encode(word)), word);
}
assert.equal(latin(decodedCarry), "WOXIAGHLFRYOE");
assert.deepStrictEqual(decodedWords.map(latin), [
  "NGXCO", "JP", "NX", "OEALHEP", "IAAMEOTHEA", "ANG",
  "TYAEHFWXOEOTHBEJ", "EADFRNGN", "DPBJ", "IT",
  "PTHNGSAEMF", "PNRNGDEOI", "GY", "XWTAEPD", "IAXC", "EEJ"
]);

// Native original-rune positive plant: a real solved 75-GP-rune p57 substring
// is split into exactly the original 16 p55 complete-word widths.
const nativePlant = p57.slice(0, 75);
let used = 0;
const implanted = completeWords.map((word) => {
  const plain = nativePlant.slice(used, used + word.length);
  used += word.length;
  return encode(plain);
});
assert.equal(used, 75);
assert.deepStrictEqual(implanted.map(decode).flat(), nativePlant);
const carryPlant = p57.slice(0, 11);
assert.deepStrictEqual(decode(encode(carryPlant)), carryPlant);

// Fixed source-preserving null: rotate first-edge glyphs by one *word*,
// leaving final-edge and strict interiors at the original locations.
const firstEdges = completeWords.map((word) => word[0]);
const rotated = completeWords.map((word, i) => [
  firstEdges[(i + 1) % firstEdges.length], ...word.slice(1)
]);
const rotatedDecoded = rotated.map(decode).flat();
assert.equal(rotatedDecoded.length, 75);
assert.deepStrictEqual(rotated.map(decode).map(encode), rotated);

const originalRawIoC = ioc(p55.slice(1));
const decodedIoC = ioc(outputBody);
const rotatedIoC = ioc(rotatedDecoded);
const nativeLp1 = Array.from(lp1[0]).filter((rune) => index.has(rune))
  .map((rune) => 28 - index.get(rune)); // solved LP1 first-page Atbash
const nativeWindows = [];
for (const data of [nativeLp1, p57]) {
  for (let i = 0; i + 75 <= data.length; i++) nativeWindows.push(ioc(data.slice(i, i + 75)));
}
const nativeMinimum = Math.min(...nativeWindows);
assert.equal(nativeWindows.length, 131);
assert.ok(decodedIoC < nativeMinimum);
assert.ok(rotatedIoC < nativeMinimum);

console.log("Original body words/lengths: " + completeWords.map((w) => w.length).join(","));
console.log("p54→p55 one carried word: " + latin(carried));
console.log("decoded continued word: " + latin(decodedCarry));
console.log("decoded 16 full p55 words: " + decodedWords.map(latin).join(" / "));
console.log("Original p55 body IoC: " + originalRawIoC);
console.log("Decoded p55 body IoC: " + decodedIoC);
console.log("First-edge rotated original IoC: " + rotatedIoC);
console.log("Native GP75 windows: " + nativeWindows.length + ", minimum IoC: " + nativeMinimum);
console.log("RESULT: frozen, all-position reversible whole-word depth-totient consumer is nonlinguistic on original; solved native GP plant passes.");
