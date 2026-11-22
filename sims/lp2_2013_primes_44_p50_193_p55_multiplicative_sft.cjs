"use strict";
/**
 * An original-source 2013 PRIMES whitespace marker, a p50 numeric-table
 * bracket, and the most direct reversible GF29 multiplicative consumer.
 * No plaintext has been recovered. Node.js 22 built-ins only.
 * Run: node sims/lp2_2013_primes_44_p50_193_p55_multiplicative_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
const markedLeft = 3257;
const markedRight = 3259;
const firstMarkedLeft = 29;
const lastPrintedPrime = 3301;
assert.equal(lastPrintedPrime - markedLeft, 44);
assert.equal(firstMarkedLeft, 29);
/** @param {number} ordinal @returns {number} */
function primeAt(ordinal) {
  let count = 0;
  for (let n = 2;; n++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= n; divisor++) {
      if (n % divisor === 0) { prime = false; break; }
    }
    if (prime && ++count === ordinal) return n;
  }
}
const selectedValue = primeAt(lastPrintedPrime - markedLeft);
const neighboringValue = primeAt(lastPrintedPrime - markedRight);
assert.equal(selectedValue, 193);
assert.equal(neighboringValue, 181);
const markerPositions = bytes.flatMap((value, index) =>
  value === selectedValue ? [index] : []);
assert.deepEqual(markerPositions, [83, 127]);
assert.equal(markerPositions[1] - markerPositions[0], 44);
assert.equal(bytes.includes(neighboringValue), false);
// Competitor: original numeral tokens interpreted in 59-symbol radix (skip f).
const alphabet59 = grid.alphabet.replace("f", "");
assert.equal(alphabet59.length, 59);
const bytes59 = grid.pages.flatMap(page => page.tokens).map(token => {
  assert.equal(token.length, 2);
  const a = alphabet59.indexOf(token[0]);
  const b = alphabet59.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  return a * 59 + b;
});
assert.deepEqual(bytes59.flatMap((v, i) => v === 193 ? [i] : []), [61, 234]);
assert.equal(bytes59[83], 190);
assert.equal(bytes59[127], 190);
const between = bytes.slice(markerPositions[0] + 1, markerPositions[1]);
assert.equal(between.length, 43);
const words = transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const lengths = words.map(word => [...word].length);
assert.deepEqual(lengths,
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const innerLengths = lengths.map(length => Math.max(0, length - 2));
const cipher = words.flatMap(word => [...word].slice(1,-1))
  .map(rune => corpus.runes.indexOf(rune));
const original = [19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18];
assert.deepEqual(cipher, original);
assert.equal(cipher.length, between.length);
const keys = between.map(byte => byte % 29);
assert.ok(keys.every(key => key > 0 && key < 29),
  "Each modular scalar must be invertible");
/** @param {number} n @returns {number} */
function mod(n) { return ((n % 29) + 29) % 29; }
/** @param {number} key @returns {number} */
function inverse(key) {
  for (let n = 1; n < 29; n++) if (mod(n * key) === 1) return n;
  throw new Error("Zero / non-invertible GP29 scalar");
}
/** @param {number[]} runes @param {"divide"|"multiply"} mode @returns {number[]} */
function decode(runes, mode) {
  assert.equal(runes.length, keys.length);
  return runes.map((c, index) =>
    mod(c * (mode === "divide" ? inverse(keys[index]) : keys[index])));
}
/** @param {number[]} runes @param {"divide"|"multiply"} mode @returns {number[]} */
function encode(runes, mode) {
  assert.equal(runes.length, keys.length);
  return runes.map((p, index) =>
    mod(p * (mode === "divide" ? keys[index] : inverse(keys[index]))));
}
/** @param {number[]} runes @returns {string} */
function tokens(runes) {
  return runes.map(index => corpus.translit[index]).join(" ");
}
/** @param {number[]} runes @returns {string} */
function fragments(runes) {
  let offset = 0;
  return innerLengths.map(length => {
    const out = runes.slice(offset, offset + length);
    offset += length;
    return "[" + out.map(index => corpus.translit[index]).join("") + "]";
  }).join(" ");
}
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for(const rune of runes) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}
// A distinct full-page source-sized experiment: left 193 marker plus the
// 43 bracket values forms one 44-position fixed additive key. The original
// p55 contains 76 runes; continue the 44-element key once, without fitting.
const fullCipher = corpus.pages.find(page => page.page === 55).indices;
assert.equal(fullCipher.length, 76);
assert.deepEqual(words.flatMap(w => [...w].map(ch => corpus.runes.indexOf(ch))), fullCipher);
const fullKey44 = bytes.slice(83, 127).map(value => value % 29);
assert.equal(fullKey44.length, 44);
assert.equal(fullKey44[0], 193 % 29);
const fullNative76 = corpus.pages.find(page => page.page === 57).indices.slice(0, 76);
assert.equal(fullNative76.length, 76);
/** @param {number[]} runes @param {number} sign @returns {number[]} */
function full44(runes, sign) {
  assert.equal(runes.length, 76);
  return runes.map((v, i) => mod(v + sign * fullKey44[i % 44]));
}
/** @param {number[]} runes @returns {string} */
function fullWordTokens(runes) {
  let offset = 0;
  return lengths.map(length => {
    const out = runes.slice(offset, offset + length);
    offset += length;
    return out.map(i => corpus.translit[i]).join("");
  }).join(" ");
}
for (const sign of [-1, 1]) {
  const plain = full44(fullCipher, sign);
  assert.deepEqual(full44(plain, -sign), fullCipher);
  const plantedCipher = full44(fullNative76, -sign);
  assert.deepEqual(full44(plantedCipher, sign), fullNative76);
  console.log(JSON.stringify({
    model:"p55-complete76-period44",
    sign, originalReencrypted:76, plantedKnownRecovered:76,
    sourceKey44:fullKey44, originalIoC:ioc(fullCipher),
    decodedIoC:ioc(plain), decodedPrintedWordTokens:fullWordTokens(plain)
  }));
}
const native = corpus.pages.find(page => page.page === 57).indices.slice(0, 43);
assert.equal(native.length, 43);
console.log("Original witness: 2013 PRIMES 3257[double-space]3259 ... 3301");
console.log(JSON.stringify({
  difference:44, prime44:selectedValue, tableMarkerPositions:markerPositions,
  alternativeDifference:42, alternativePrime42:neighboringValue,
  alternativeOccursInTable:bytes.includes(neighboringValue),
  base59Value193Positions:[61,234], base59Value193Separation:173,
  selected43Bytes:between, keys,
  sourceCipherIoC:ioc(cipher), nativeControlIoC:ioc(native)
}));
for (const mode of ["divide", "multiply"]) {
  const plain = decode(cipher, mode);
  assert.deepEqual(encode(plain, mode), cipher,
    mode + " must exactly reencrypt all original p55 interior runes");
  assert.deepEqual(decode(encode(native, mode), mode), native,
    mode + " must recover 43 genuine known p57 runes in a synthetic plant");
  console.log(JSON.stringify({
    mode, plantedKnownRecovered: native.length, originalReencrypted:cipher.length,
    outputIoC:ioc(plain), outputTokens:tokens(plain),
    pageLocalWordInteriorFragments:fragments(plain)
  }));
}
