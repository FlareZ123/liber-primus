"use strict";

/**
 * Director #1422: fixed p50 zero->F surface inverse followed by the canonical
 * base29 quotient/remainder affine byte map.
 *
 * For table byte B = 29q+r, q in 0..8 and r in 0..28:
 *   M = (q+1)P + r mod29
 *   P = inverse(q+1)(M-r) mod29
 *
 * Continuous source-natural phase0 clock only. Predeclared before evaluation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.bytes;
const tokens = grid.pages.flatMap(page => page.tokens);
const original = corpus.pages.filter(page =>
  page.page <= 55 && page.indices.length).flatMap(page => page.indices);
assert.equal(original.length, 12956);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);

const special = [0, 2, 12, 21, 22, 25, 27, 28];

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let candidate = 1; candidate < 29; candidate++) {
    if ((value * candidate) % 29 === 1) return candidate;
  }
  throw new Error("noninvertible value");
}

/** @param {number} value @param {number} left @param {number} right @returns {number} */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/** @param {number} control @returns {number} */
function marker(control) {
  return tokens[control][0] === "0" ? 0 : special[bytes[control] & 7];
}

/** @param {number[]} plain @returns {number[]} */
function outerEncrypt(plain) {
  const out = new Array(plain.length);
  out[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    out[i] = swap(plain[i], out[i - 1], marker((i - 1) & 255));
  }
  return out;
}

/** @param {number[]} cipher @returns {number[]} */
function outerDecrypt(cipher) {
  const out = new Array(cipher.length);
  out[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    out[i] = swap(cipher[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return out;
}

/** @param {number[]} plain @returns {number[]} */
function affineEncrypt(plain) {
  return plain.map((value, index) => {
    const byte = bytes[index & 255];
    const q = Math.floor(byte / 29);
    const r = byte % 29;
    return mod((q + 1) * value + r);
  });
}

/** @param {number[]} cipher @returns {number[]} */
function affineDecrypt(cipher) {
  return cipher.map((value, index) => {
    const byte = bytes[index & 255];
    const q = Math.floor(byte / 29);
    const r = byte % 29;
    return mod(inverse(q + 1) * (value - r));
  });
}

/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const counts = new Uint32Array(29);
  for (const value of stream) counts[value]++;
  return Array.from(counts).reduce(
    (sum, count) => sum + count * (count - 1), 0) /
    (stream.length * (stream.length - 1));
}

const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const wordShapes = (sourceText.match(runePattern) || []).map(word =>
  Array.from(word, rune => runeIndex.get(rune)));
assert.equal(wordShapes.length, 2896);

const dictionary = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  if (!dictionary.has(encoded.length)) dictionary.set(encoded.length, new Set());
  dictionary.get(encoded.length).add(encoded.join(","));
}

/**
 * @param {number[]} stream
 * @returns {{hits:number,longHits:number,maxRunRunes:number,byLength:Object}}
 */
function lexical(stream) {
  let offset = 0;
  let hits = 0;
  let longHits = 0;
  let currentRunes = 0;
  let maxRunRunes = 0;
  const byLength = {};

  for (const shape of wordShapes) {
    const length = shape.length;
    const word = stream.slice(offset, offset + length);
    offset += length;
    const hit = dictionary.get(length)?.has(word.join(",")) || false;
    if (!byLength[length]) byLength[length] = { total: 0, hits: 0 };
    byLength[length].total++;
    byLength[length].hits += Number(hit);
    if (hit) {
      hits++;
      longHits += Number(length >= 5);
      currentRunes += length;
      maxRunRunes = Math.max(maxRunRunes, currentRunes);
    } else {
      currentRunes = 0;
    }
  }

  assert.equal(offset, stream.length);
  return { hits, longHits, maxRunRunes, byLength };
}

const intermediate = outerDecrypt(original);
assert.deepEqual(outerEncrypt(intermediate), original);
assert.equal(intermediate.reduce(
  (sum, value, index) => sum + Number(value !== original[index]), 0), 549);

const plain = affineDecrypt(intermediate);
const result = lexical(plain);
assert.ok(Math.abs(ioc(plain) - 0.03449596169036453) < 1e-15);
assert.equal(result.hits, 187);
assert.equal(result.longHits, 0);
assert.equal(result.maxRunRunes, 5);
assert.deepEqual([1, 2, 3, 4].map(length => result.byLength[length].hits),
  [72, 98, 16, 1]);
for (let length = 5; length <= 14; length++) {
  assert.equal(result.byLength[length].hits, 0);
}

// Complete layered positive.
const p57 = corpus.pages.find(page => page.page === 57).indices;
const positivePlain = Array.from(
  { length: original.length }, (_, index) => p57[index % p57.length]);
const positiveInner = affineEncrypt(positivePlain);
const positiveOuter = outerEncrypt(positiveInner);
assert.deepEqual(affineDecrypt(outerDecrypt(positiveOuter)), positivePlain);

console.log(JSON.stringify({
  model:
    "fixed zero-F surface inverse + B=29q+r affine P=inverse(q+1)(M-r)",
  original: {
    ioc: ioc(plain),
    dictionaryHits: result.hits,
    length5PlusHits: result.longHits,
    longestDictionaryRunRunes: result.maxRunRunes,
    byLength: result.byLength
  },
  positive: {
    runes: positivePlain.length,
    exactLayeredRoundtrip: true
  },
  decision:
    "FAIL: uniform IoC, zero native dictionary words of GP length >=5"
}, null, 2));
