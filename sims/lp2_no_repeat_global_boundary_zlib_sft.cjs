"use strict";

/**
 * One fixed test of a source-native compressed-text interpretation of the
 * global 29-to-28 enumerative stream.
 *
 * Hypothesis: rank the 55 page heads, then the global repeat-count class,
 * repeat-position mask (colex), and non-repeat deltas (base 28). Use the
 * printed word-boundary masks, ranked page-locally and concatenated in page
 * order, for the quotient. Interpret the resulting fixed-length integer as
 * one big-endian zlib/DEFLATE stream.
 *
 * This is a single preregistered standard-compressor test, not a sweep.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const segments = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8").split("%").slice(0, 55);
const RUNE = /[\u16A0-\u16FF]/u;
const CHOICE = ".-&$§";

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= k; i++) {
    value = value * BigInt(n - k + i) / BigInt(i);
  }
  return value;
}

function rankBoundaries(gaps) {
  let rank = 0n;
  for (let i = 0; i < gaps.length; i++) {
    rank += choose(gaps[i], i + 1);
  }
  return rank;
}

function sourcePage(pageNumber, text) {
  const source = corpus.pages.find(page => page.page === pageNumber);
  assert(source, `missing corpus page ${pageNumber}`);
  const chars = [...text];
  const offsets = [];
  for (let i = 0; i < chars.length; i++) {
    if (RUNE.test(chars[i])) offsets.push(i);
  }
  assert.equal(offsets.length, source.indices.length);
  const boundaries = [];
  for (let i = 1; i < offsets.length; i++) {
    if (chars.slice(offsets[i - 1] + 1, offsets[i])
      .some(character => CHOICE.includes(character))) {
      boundaries.push(i - 1);
    }
  }
  const runes = source.indices;
  const repeats = runes.slice(1).filter((rune, i) => rune === runes[i]).length;
  return {page: pageNumber, runes, boundaries, repeats};
}

function sumRepeatClasses(t, k) {
  let term = 28n ** BigInt(t); // C(t,0) * 28^t
  let sum = term;
  let previous = term;
  for (let j = 1; j <= k; j++) {
    term = previous * BigInt(t - j + 1) / (28n * BigInt(j));
    sum += term;
    previous = term;
  }
  return sum;
}

function repeatClassSize(t, j) {
  return choose(t, j) * 28n ** BigInt(t - j);
}

function rankGlobalCountFirst(pages, repeatLimit) {
  const heads = pages.length;
  const transitions = pages.reduce((sum, page) => sum + page.runes.length - 1, 0);
  const totalRunes = pages.reduce((sum, page) => sum + page.runes.length, 0);
  const headsRank = pages.reduce(
    (rank, page) => rank * 29n + BigInt(page.runes[0]), 0n);

  const repeatPositions = [];
  const nonrepeatDeltas = [];
  let transitionIndex = 0;
  for (const page of pages) {
    for (let i = 1; i < page.runes.length; i++) {
      const delta = (page.runes[i] - page.runes[i - 1] + 29) % 29;
      if (delta === 0) repeatPositions.push(transitionIndex);
      else nonrepeatDeltas.push(delta - 1);
      transitionIndex++;
    }
  }
  const repeats = repeatPositions.length;
  assert.equal(transitionIndex, transitions);
  assert(repeats <= repeatLimit);

  let repeatMaskRank = 0n;
  for (let i = 0; i < repeatPositions.length; i++) {
    repeatMaskRank += choose(repeatPositions[i], i + 1);
  }
  const nonrepeatCount = transitions - repeats;
  const deltaRank = nonrepeatDeltas.reduce(
    (rank, delta) => rank * 28n + BigInt(delta), 0n);

  const allClasses = sumRepeatClasses(transitions, repeatLimit);
  const lowerClasses = repeats === 0 ? 0n : sumRepeatClasses(transitions, repeats - 1);
  const withinClass = repeatMaskRank * 28n ** BigInt(nonrepeatCount) + deltaRank;
  const rank = headsRank * allClasses + lowerClasses + withinClass;
  const capacity = 29n ** BigInt(heads) * allClasses;
  assert(rank >= 0n && rank < capacity);
  return {
    rank, capacity, transitions, heads, totalRunes, repeats,
    repeatPositions, nonrepeatCount, repeatMaskRank, deltaRank,
    allClasses, lowerClasses
  };
}

function bitLength(value) {
  return value === 0n ? 0 : value.toString(2).length;
}

function toFixedBigEndian(value, byteLength) {
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const raw = Buffer.from(hex, "hex");
  assert(raw.length <= byteLength);
  return Buffer.concat([Buffer.alloc(byteLength - raw.length), raw]);
}

assert.equal(segments.length, 55);
const original = segments.map((segment, i) =>
  sourcePage(i < 50 ? i : i + 1, segment));
assert.equal(original.reduce((sum, page) => sum + page.runes.length, 0), 12956);
assert.equal(original.reduce((sum, page) => sum + page.repeats, 0), 86);
assert.equal(original.reduce((sum, page) => sum + page.boundaries.length, 0), 2873);

const ranked = rankGlobalCountFirst(original, 86);
assert.equal(ranked.transitions, 12901);
assert.equal(ranked.repeats, 86);

let boundaryRank = 0n;
let boundarySpace = 1n;
for (const page of original) {
  const positions = page.runes.length - 1;
  const count = page.boundaries.length;
  const pageSpace = choose(positions, count);
  const pageRank = rankBoundaries(page.boundaries);
  assert(pageRank < pageSpace);
  boundaryRank = boundaryRank * pageSpace + pageRank;
  boundarySpace *= pageSpace;
}

const plaintextSpace = 29n ** 12956n;
const Q = (plaintextSpace + ranked.capacity - 1n) / ranked.capacity;
const sideDigit = boundaryRank % Q;
const boundarySalt = boundaryRank / Q;
const plaintextInteger = sideDigit * ranked.capacity + ranked.rank;
assert(plaintextInteger < plaintextSpace);

const byteLength = Math.ceil(bitLength(plaintextSpace - 1n) / 8);
const bytes = toFixedBigEndian(plaintextInteger, byteLength);
function attemptInflate(inflate) {
  try {
    const inflated = inflate(bytes);
    return {
      valid: true,
      outputBytes: inflated.length,
      utf8Preview: inflated.subarray(0, 400).toString("utf8")
    };
  } catch (error) {
    return {
      valid: false,
      errorCode: error.code || null,
      errorMessage: String(error.message).slice(0, 240)
    };
  }
}
const zlibWrapped = attemptInflate(zlib.inflateSync);
const rawDeflate = attemptInflate(zlib.inflateRawSync);
const anyDeflateValid = zlibWrapped.valid || rawDeflate.valid;

console.log(JSON.stringify({
  source: {
    pages: original.length,
    runes: ranked.totalRunes,
    pageHeads: ranked.heads,
    transitions: ranked.transitions,
    repeats: ranked.repeats,
    printedWordBoundaries: 2873
  },
  encoding: {
    order: "page-head tuple; repeat-count class; colex repeat-position mask; base-28 nonrepeat deltas",
    globalRepeatLimit: 86,
    ciphertextRankBits: bitLength(ranked.rank),
    ciphertextCodebookBits: bitLength(ranked.capacity),
    boundaryRankBits: bitLength(boundaryRank),
    boundarySpaceBits: bitLength(boundarySpace),
    quotientBits: bitLength(Q - 1n),
    quotient: sideDigit.toString(),
    boundarySaltBits: bitLength(boundarySalt),
    plaintextIntegerBits: bitLength(plaintextInteger),
    fixedByteLength: byteLength,
    bigEndianPrefixHex: bytes.subarray(0, 16).toString("hex")
  },
  zlibWrapped,
  rawDeflate,
  conclusion: anyDeflateValid
    ? "At least one fixed DEFLATE wrapper is valid; inspect the decompressed output before promoting."
    : "This exact global count-first enumerative rank plus page-concatenated word-boundary quotient is neither zlib-wrapped nor raw DEFLATE. Retire this specific standard-compressor interpretation; this does not reject other source-selected compressed-text models."
}, null, 2));

// This SFT is a negative gate: success means neither zlib-wrapped nor raw
// DEFLATE accepts this exact fixed integer. If the assertion fails, inspect
// the decompressed output before any promotion.
assert.equal(anyDeflateValid, false, "positive gate: valid DEFLATE stream; inspect decompressed output");
