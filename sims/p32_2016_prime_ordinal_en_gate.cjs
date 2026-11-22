#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8");
const image = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25.jpg"));

function jpegDimensions(bytes) {
  assert.deepEqual([...bytes.subarray(0, 2)], [0xff, 0xd8]);
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) throw new Error("Malformed JPEG marker stream");
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0xd8 || marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = bytes.readUInt16BE(offset);
    if (sof.has(marker)) {
      return {
        width: bytes.readUInt16BE(offset + 5),
        height: bytes.readUInt16BE(offset + 3),
        marker
      };
    }
    offset += length;
  }
  throw new Error("JPEG has no supported start-of-frame marker");
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function primeRank(n) {
  assert(isPrime(n));
  let rank = 0;
  for (let k = 2; k <= n; k++) if (isPrime(k)) rank++;
  return rank;
}
function totient(n) {
  let result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    while (n % p === 0) n /= p;
    result -= result / p;
  }
  if (n > 1) result -= result / n;
  return result;
}
function words(source) {
  return source.split("-")
    .map(piece => (piece.match(/[\u16A0-\u16FF]/gu) || []).join(""))
    .filter(Boolean);
}

const dimensions = jpegDimensions(image);
assert.deepEqual([dimensions.width, dimensions.height], [563, 569]);

const page = corpus.pages.find(p => p.page === 32);
assert(page);
assert.equal(page.runic_count, 121);
assert.equal(page.indices.length, 121);
const pagePrimeWeights = page.indices.map(index => corpus.prime[index]);
const firstRowSum = pagePrimeWeights.slice(0, 11).reduce((a, b) => a + b, 0);
const firstColumnSum = pagePrimeWeights
  .filter((_, index) => index % 11 === 0)
  .reduce((a, b) => a + b, 0);
assert.deepEqual([firstRowSum, firstColumnSum],
  [dimensions.width, dimensions.height]);

const dimensionRanks = [primeRank(dimensions.width), primeRank(dimensions.height)];
assert.deepEqual(dimensionRanks, [103, 104]);

const pageText = transcript.split("%")[32].replace(/\/\s*/gu, "");
const clauses = pageText.split(/[.&$§]/u).map(words).filter(clause => clause.length);
assert.deepEqual(clauses.map(clause => clause.length), [7, 15]);
const fragments = clauses.flat();
assert.equal(fragments.length, 22);
assert.equal(fragments.reduce((n, fragment) => n + [...fragment].length, 0), 121);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const latin = runes => [...runes]
  .map(rune => corpus.translit[runeIndex.get(rune)]).join("");
const weight = runes => [...runes]
  .reduce((sum, rune) => sum + corpus.prime[runeIndex.get(rune)], 0);

let nextStart = 1;
const locations = fragments.map((fragment, index) => {
  const start = nextStart;
  const length = [...fragment].length;
  nextStart += length;
  return {
    fragment: index + 1,
    start,
    length,
    translit: latin(fragment),
    primeSum: weight(fragment)
  };
});
assert.equal(nextStart, 122);

const selected = locations[18];
const following = locations[19];
assert.deepEqual(
  {fragment: selected.fragment, start: selected.start, length: selected.length,
    translit: selected.translit, primeSum: selected.primeSum},
  {fragment: 19, start: 103, length: 2, translit: "EN", primeSum: 96}
);
assert.deepEqual(
  {fragment: following.fragment, start: following.start, length: following.length,
    translit: following.translit},
  {fragment: 20, start: 105, length: 8, translit: "NWGULAOY"}
);

const oneBased = page.indices.slice(dimensionRanks[0] - 1, dimensionRanks[1])
  .map(index => corpus.translit[index]).join("");
const zeroBased = page.indices.slice(dimensionRanks[0], dimensionRanks[1] + 1)
  .map(index => corpus.translit[index]).join("");
assert.equal(oneBased, "EN");
assert.equal(zeroBased, "NN");
assert.equal(selected.start + selected.length, following.start);

const parsed = parseLP2Words(transcript, 55);
assert.equal(parsed.byContainedPage[32].length, 21);
const completeWordOrdinal = parsed.byContainedPage[32]
  .findIndex(word => word.runes === fragments[18]) + 1;
assert.equal(completeWordOrdinal, 18);
assert.equal(totient(selected.primeSum), 32);

console.log(JSON.stringify({
  archived2016Image: {
    dimensions: [dimensions.width, dimensions.height],
    jpegSofMarker: "0x" + dimensions.marker.toString(16)
  },
  inferredP32Grid: {
    physicalPage: 32,
    runeCount: page.runic_count,
    firstRowPrimeSum: firstRowSum,
    firstColumnPrimeSum: firstColumnSum,
    note: "11x11 row-major reshape is inferred, not printed"
  },
  primeRankAddress: {
    ranks: dimensionRanks,
    oneBasedRunePositions: [103, 104],
    selected: {translit: oneBased, pageLocalFragment: 19,
      completeWordOrdinal: completeWordOrdinal, start: 103, length: 2},
    followingWord: {translit: following.translit, start: following.start}
  },
  wrongOriginControl: {
    zeroBasedOffsets: [103, 104],
    humanRunePositions: [104, 105],
    translit: zeroBased,
    crossesPrintedWordBoundary: true
  },
  selfAddressArithmetic: {gpPrimeSumEN: 96, phi: totient(96), physicalPage: 32},
  conclusion: "Exact correspondence only; no source-selected compass path, key, or plaintext."
}, null, 2));
