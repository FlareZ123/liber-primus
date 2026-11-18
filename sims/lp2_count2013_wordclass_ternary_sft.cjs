"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words, physicalLP2Page } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const runePrime = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {string} runes @returns {number} */
function gpPrimeSum(runes) {
  let total = 0;
  for (const rune of runes) {
    const prime = runePrime.get(rune);
    assert.notEqual(prime, undefined, "unknown rune in canonical transcription");
    total += prime;
  }
  return total;
}

/**
 * 2013 participant notation, extended conjecturally to composite sums:
 * 0 composite, 1 ordinary prime (+), 2 reversible prime (*).
 * @param {number} sum
 * @returns {0|1|2}
 */
function countCategory(sum) {
  if (!isPrime(sum)) return 0;
  const reversed = Number(String(sum).split("").reverse().join(""));
  return isPrime(reversed) ? 2 : 1;
}

/** @param {number[]} trits @returns {bigint} */
function base3Integer(trits) {
  let n = 0n;
  for (const t of trits) {
    assert.ok(Number.isInteger(t) && t >= 0 && t <= 2);
    n = n * 3n + BigInt(t);
  }
  return n;
}

/** @param {bigint} n @param {number} length @returns {number[]} */
function unpackTrits(n, length) {
  assert.ok(n >= 0n);
  const digits = Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    digits[i] = Number(n % 3n);
    n /= 3n;
  }
  assert.equal(n, 0n, "the register requires more than the declared trits");
  return digits;
}

/** @param {bigint} n @returns {Buffer} */
function minimalBigEndian(n) {
  assert.ok(n >= 0n);
  const rawHex = n.toString(16);
  const hex = rawHex.length % 2 ? "0" + rawHex : rawHex;
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} bytes @returns {bigint} */
function bigEndianInteger(bytes) {
  let n = 0n;
  for (const b of bytes) n = 256n * n + BigInt(b);
  return n;
}

/** @param {Buffer} bytes @returns {number} */
function shannonEntropy(bytes) {
  const counts = Array(256).fill(0);
  for (const b of bytes) counts[b]++;
  return counts.reduce((h, count) => {
    if (!count) return h;
    const p = count / bytes.length;
    return h - p * Math.log2(p);
  }, 0);
}

assert.equal(corpus.runes.length, 29);
assert.ok(corpus.prime.every(isPrime));
const pages = raw.split("%").slice(0, 55);
assert.equal(pages.length, 55);
for (let i = 0; i < pages.length; i++) {
  const indices = Array.from(pages[i]).filter(r => runeIndex.has(r)).map(r => runeIndex.get(r));
  assert.deepEqual(indices, corpus.pages[physicalLP2Page(i)].indices,
    "page transcript must exactly match original indexed rune corpus: " + i);
}

const { words, runeCount, crossPageWords, originalPageFragments } = parseLP2Words(raw);
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);
assert.equal(originalPageFragments, 2928);

const wordSums = words.map(word => gpPrimeSum(word.runes));
const trits = wordSums.map(countCategory);
const values = [0, 1, 2].map(t => trits.filter(x => x === t).length);
assert.deepEqual(values, [2292, 393, 211]);
const n = base3Integer(trits);
assert.deepEqual(unpackTrits(n, trits.length), trits);
const bytes = minimalBigEndian(n);
assert.equal(bytes.length, 574);
assert.equal(bigEndianInteger(bytes), n);
const hex = bytes.toString("hex");
assert.ok(hex.startsWith("2c9453d3d63b10c3e80eca06d997f141"));
const sha = crypto.createHash("sha256").update(bytes).digest("hex");

const p57Words = parseLP2Words(raw, 57).words.filter(w => w.startPage === 56);
assert.equal(p57Words.length, 20);
const p57Sums = p57Words.map(w => gpPrimeSum(w.runes));
const p57Cats = p57Sums.map(countCategory);
assert.equal(p57Sums[0], 449);
assert.equal(p57Cats[0], 1);
assert.equal(p57Sums[14], 151);
assert.equal(p57Cats[14], 2);
assert.deepEqual([0, 1, 2].map(x => p57Cats.filter(y => x === y).length), [18, 1, 1]);

// A full source-native positive: choose one actual p57 word per category,
// encode the exact bytes of a known text as trits, then recover every byte.
const nativeRepresentatives = [0, 1, 2].map(t =>
  p57Words.find(w => countCategory(gpPrimeSum(w.runes)) === t));
const plant = Buffer.from("PARABLE\n", "utf8");
const plantedTrits = Array.from(bigEndianInteger(plant).toString(3), Number);
const plantedNativeWords = plantedTrits.map(t => nativeRepresentatives[t]);
const recoveredPlant = minimalBigEndian(base3Integer(
  plantedNativeWords.map(w => countCategory(gpPrimeSum(w.runes)))));
assert.deepEqual(recoveredPlant, plant);
assert.deepEqual(unpackTrits(base3Integer(plantedTrits), plantedTrits.length), plantedTrits);

const signatureHex = [
  ["PNG", "89504e470d0a1a0a"],
  ["gzip", "1f8b"],
  ["bzip2", "425a68"],
  ["ZIP", "504b0304"],
  ["PDF", "255044462d"],
  ["ELF", "7f454c46"],
  ["7z", "377abcaf271c"],
  ["XZ", "fd377a585a00"],
  ["zstd", "28b52ffd"],
  ["SQLite 3", "53514c69746520666f726d6174203300"],
  ["OpenSSL Salted__", "53616c7465645f5f"]
];
const matchedSignatures = signatureHex.filter(([, sig]) => hex.startsWith(sig))
  .map(([name]) => name);
assert.deepEqual(matchedSignatures, []);
const openPgpPacketStart = (bytes[0] & 0x80) !== 0;
assert.equal(openPgpPacketStart, false);

const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapterCounts = chapters.map(([first, last]) => {
  const indices = words.map((w, i) => ({w, i})).filter(({w}) => {
    const p = physicalLP2Page(w.startPage);
    return first <= p && p <= last;
  }).map(({i}) => i);
  return {pages: first + "-" + last, words: indices.length,
    composite: indices.filter(i => trits[i] === 0).length,
    ordinaryPrime: indices.filter(i => trits[i] === 1).length,
    reversiblePrime: indices.filter(i => trits[i] === 2).length};
});
assert.equal(chapterCounts.reduce((s, c) => s + c.words, 0), words.length);

const report = {
  scope: "original physical LP2 pp0-55, all 2896 printed words and 32 page carries",
  categoryConvention: "composite=0 conjectural; 2013 participant +=1 ordinary prime, *=2 reversible prime",
  source: {runes: runeCount, words: words.length, pageCarries: crossPageWords,
    pageFragments: originalPageFragments, categories: {composite: values[0],
      ordinaryPrime: values[1], reversiblePrime: values[2]}},
  chapterCounts,
  base3: {tritLength: trits.length, integerBitLength: n.toString(2).length,
    decimalValue: n.toString(10), trits: trits.join("")},
  bytes: {length: bytes.length, sha256: sha, first64Hex: hex.slice(0, 128),
    last64Hex: hex.slice(-128), shannonEntropyBitsPerByte: shannonEntropy(bytes),
    matchedWholeHeaderSignatures: matchedSignatures, possibleOpenPgpPacketStart: openPgpPacketStart,
    fullHex: hex},
  sourceNativeControls: {p57Words: p57Words.length, p57CategoryCounts: [18,1,1],
    parable: {GP:449, category:1}, find: {GP:151, category:2},
    plantedMessage: recoveredPlant.toString("utf8"),
    plantedNativeWordCount: plantedNativeWords.length,
    plantedBytes: recoveredPlant.length,
    entireOriginalTritTapeRoundTrip: true},
  verdict: "No independently typed file, key packet or plaintext is selected by this fixed serialized register."
};
console.log(JSON.stringify(report, null, 2));
