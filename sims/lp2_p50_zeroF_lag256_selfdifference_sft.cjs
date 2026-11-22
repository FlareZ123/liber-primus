"use strict";

/**
 * Director #1516: frozen lag-256 self-difference beneath the #1422 zero-F surface inverse.
 *
 * Frozen original inverse:
 *   M = zeroFDecrypt(C)
 *   P[i] = M[i] - M[i-256] mod29, for i >= 256.
 * The first 256 runes are deliberately left undecoded.
 *
 * No alternate sign, phase, reset, lag multiple, or table transform is tested.
 *
 * Run:
 *   node sims/lp2_p50_zeroF_lag256_selfdifference_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes = grid.bytes;
const tokens = grid.pages.flatMap((page) => page.tokens);
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const original = pages.flatMap((page) => page.indices);

assert.equal(original.length, 12956);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);

const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const words = (sourceText.match(runePattern) || []).map((word) =>
  Array.from(word, (glyph) => glyphIndex.get(glyph)));

assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

const special = [
  corpus.translit.indexOf("F"),
  ...corpus.translit.map((value, index) =>
    value.length === 2 ? index : -1).filter((index) => index >= 0)
];
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

/**
 * @param {number} value
 * @param {number} left
 * @param {number} right
 * @returns {number}
 */
function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

/**
 * @param {number} control
 * @returns {number}
 */
function marker(control) {
  if (tokens[control][0] === "0") return 0;
  return special[bytes[control] & 7];
}

/**
 * Frozen #1422 surface forward map.
 * @param {number[]} plain
 * @returns {number[]}
 */
function zeroFEncrypt(plain) {
  const cipher = new Array(plain.length);
  cipher[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    cipher[i] = swap(plain[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return cipher;
}

/**
 * Frozen #1422 surface inverse.
 * @param {number[]} cipher
 * @returns {number[]}
 */
function zeroFDecrypt(cipher) {
  const plain = new Array(cipher.length);
  plain[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    plain[i] = swap(cipher[i], cipher[i - 1], marker((i - 1) & 255));
  }
  return plain;
}

/**
 * @param {number[]} intermediate
 * @returns {(number|null)[]}
 */
function lag256Decode(intermediate) {
  const out = Array(intermediate.length).fill(null);
  for (let i = 256; i < intermediate.length; i++) {
    out[i] = (intermediate[i] - intermediate[i - 256] + 29) % 29;
  }
  return out;
}

/**
 * Exact recurrence forward map using a fixed 256-symbol seed.
 * @param {number[]} plain
 * @param {number[]} seed
 * @returns {number[]}
 */
function lag256Encode(plain, seed) {
  assert.equal(plain.length, original.length);
  assert.equal(seed.length, 256);
  const out = new Array(plain.length);
  for (let i = 0; i < 256; i++) out[i] = seed[i];
  for (let i = 256; i < plain.length; i++) {
    out[i] = (plain[i] + out[i - 256]) % 29;
  }
  return out;
}

/**
 * @param {number[]} stream
 * @returns {number}
 */
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const value of stream) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (stream.length * (stream.length - 1));
}

/**
 * @param {string} file
 * @returns {Map<number, number[][]>}
 */
function nativePools(file) {
  const pools = new Map();
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (!pools.has(encoded.length)) pools.set(encoded.length, []);
    pools.get(encoded.length).push(encoded);
  }
  return pools;
}

// Source-shaped planted positive: preserve every original word length, generate
// native GP words, pass them through the exact lag-256 recurrence and #1422 outer layer.
const pools = nativePools("resources/control/shakespeare_first300k.txt");
let cursor = 0;
const plantedPlain = words.flatMap((word) => {
  const options = pools.get(word.length);
  assert.ok(options?.length);
  const chosen = options[(cursor * 3301 + word.length * 1033) % options.length];
  cursor++;
  return chosen;
});
assert.equal(plantedPlain.length, original.length);

const plantSeed = Array.from({length: 256}, (unused, i) => (i * 17 + 11) % 29);
const plantedIntermediate = lag256Encode(plantedPlain, plantSeed);
const plantedCipher = zeroFEncrypt(plantedIntermediate);
const recoveredIntermediate = zeroFDecrypt(plantedCipher);
assert.deepEqual(recoveredIntermediate, plantedIntermediate);
const recoveredPlain = lag256Decode(recoveredIntermediate);
for (let i = 256; i < recoveredPlain.length; i++) {
  assert.equal(recoveredPlain[i], plantedPlain[i]);
}
const recoveredIntermediate2 = lag256Encode(
  recoveredPlain.map((value, i) => i < 256 ? 0 : value),
  recoveredIntermediate.slice(0, 256)
);
assert.deepEqual(recoveredIntermediate2, plantedIntermediate);
assert.deepEqual(zeroFEncrypt(recoveredIntermediate2), plantedCipher);

// Original one-shot inverse.
const intermediate = zeroFDecrypt(original);
assert.deepEqual(zeroFEncrypt(intermediate), original);
const decoded = lag256Decode(intermediate);
const decodedKnown = decoded.slice(256);
assert.ok(decodedKnown.every((value) => Number.isInteger(value) && value >= 0 && value < 29));
const reconstructedIntermediate = lag256Encode(
  decoded.map((value, i) => i < 256 ? 0 : value),
  intermediate.slice(0, 256)
);
assert.deepEqual(reconstructedIntermediate, intermediate);
assert.deepEqual(zeroFEncrypt(reconstructedIntermediate), original);

// Native dictionary register, using complete printed words wholly after offset256.
const dictionaryByLength = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  if (!dictionaryByLength.has(encoded.length)) dictionaryByLength.set(encoded.length, new Set());
  dictionaryByLength.get(encoded.length).add(encoded.join(","));
}

let runeOffset = 0;
let eligibleWords = 0;
let dictionaryHits = 0;
let longDictionaryHits = 0;
let longestDictionaryRun = 0;
let currentRun = 0;
for (const word of words) {
  const start = runeOffset;
  const end = start + word.length;
  runeOffset = end;
  if (start < 256) continue;
  eligibleWords++;
  const candidate = decoded.slice(start, end);
  const hit = dictionaryByLength.get(candidate.length)?.has(candidate.join(",")) || false;
  if (hit) {
    dictionaryHits++;
    if (candidate.length >= 5) longDictionaryHits++;
    currentRun++;
    longestDictionaryRun = Math.max(longestDictionaryRun, currentRun);
  } else {
    currentRun = 0;
  }
}
assert.equal(runeOffset, original.length);

/**
 * @param {number[]} values
 * @returns {string}
 */
function render(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const pageStarts = new Map();
let pageOffset = 0;
for (const page of pages) {
  pageStarts.set(page.page, pageOffset);
  pageOffset += page.indices.length;
}
assert.equal(pageOffset, original.length);

const pageSamples = {};
for (const pageNumber of [1, 27, 40, 54, 55]) {
  const page = pages.find((item) => item.page === pageNumber);
  assert.ok(page);
  const start = pageStarts.get(pageNumber);
  const from = Math.max(start, 256);
  const to = Math.min(start + page.indices.length, from + 96);
  pageSamples["p" + pageNumber] = render(decoded.slice(from, to));
}

const result = {
  model: "zeroF inverse, then P[i]=M[i]-M[i-256] mod29 from global rune256",
  plantedPositive: {
    sourceShapedRunes: plantedPlain.length,
    exactRecoveryAfterSeed: true,
    exactIntermediateReconstruction: true,
    exactOuterReencryption: true
  },
  original: {
    exactIntermediateReconstruction: true,
    exactOuterReencryption: true,
    decodedRunes: decodedKnown.length,
    intermediateIoC: ioc(intermediate),
    decodedIoC: ioc(decodedKnown),
    eligibleCompleteWords: eligibleWords,
    exactNativeDictionaryHits: dictionaryHits,
    longDictionaryHitsLengthAtLeast5: longDictionaryHits,
    longestConsecutiveDictionaryRun: longestDictionaryRun,
    pageSamples
  }
};

console.log(JSON.stringify(result, null, 2));
