#!/usr/bin/env node
"use strict";

// Source-first SFT for the p50 179^2 / GP29-factor / prime-ordinal DIRECTION selector.
// No external packages are required. Run from any directory with:
//   node sims/lp2_p50_17929_prime_ordinal_direction_sft.cjs

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const readBuffer = (relative) => fs.readFileSync(path.join(root, relative));

const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tokens = grid.pages.flatMap((page) => page.tokens);

// These 32 rows were visually read against original archive images 66.jpg,
// 67.jpg and 68.jpg. The SFT checks that the shared transcription has not drifted.
const auditedRows = [
  "3N 3p 2l 36 1b 3v 26 33",
  "1W 49 2a 3g 47 04 33 3W",
  "21 3M 0F 0X 1g 2H 0x 1R",
  "1n 3I 2r 0P 2U 16 2L 2D",
  "1t 1s 3H 0d 0s 1K 2D 05",
  "1K 1O 0S 1D 3o 1l 3J 1G",
  "4D 0G 0l 0x 1Q 2p 2a 1K",
  "4E 1w 2Q 19 1k 3G 24 0p",
  "22 4F 0P 3C 3J 1D 2n 1m",
  "2i 1J 3P 2v 1s 2O 0k 1M",
  "2M 0w 3L 3D 2r 0S 1p 15",
  "3V 3e 3I 0n 3u 1O 0u 0Z",
  "3g 2U 1C 0Y 1N 3n 0W 3Q",
  "22 13 0V 3c 0E 34 0W 1t",
  "1D 2N 3H 47 0s 2p 0Z 34",
  "0g 3v 1Q 0s 0D 0K 2h 3D",
  "3L 2x 1Q 20 2n 2L 1C 2p",
  "0A 29 3r 0D 45 0k 2e 2W",
  "25 3U 1W 2r 46 2s 2X 39",
  "3p 0X 0E 1q 0q 4B 49 48",
  "3r 3b 3C 1M 1j 0I 4A 48",
  "40 3m 4E 0s 2S 1v 3T 0I",
  "3t 2B 2k 2t 2O 0e 2l 1L",
  "28 2a 0J 1L 0c 3C 2o 0X",
  "00 2Z 2d 1T 2u 1t 1j 0l",
  "1o 1E 3T 18 3E 1G 27 0L",
  "0v 2t 06 11 1A 2U 4B 1O",
  "2M 3d 2S 0x 0w 0q 0p 2V",
  "18 0q 1D 49 2O 00 1v 2t",
  "1k 3s 3G 21 3w 0W 29 2r",
  "2O 2L 0g 3Y 0M 0u 3I 3C",
  "1r 2c 2q 3o 30 0a 39 1K"
];
const auditedTokens = auditedRows.flatMap((row) => row.split(/\s+/));
assert.equal(grid.alphabet, alphabet60);
assert.equal(tokens.length, 256);
assert.deepEqual(tokens, auditedTokens, "p50 table tokens differ from the 256-cell visual audit");
assert.deepEqual(grid.pages.map((page) => page.tokens.length), [80, 104, 72]);

function tokenValue(token, radix) {
  assert.equal(token.length, 2);
  const first = alphabet60.indexOf(token[0]);
  let second = alphabet60.indexOf(token[1]);
  assert.ok(first >= 0 && second >= 0, "invalid table digit: " + token);
  if (radix === 59) {
    assert.notEqual(token[1], "f", "the unused-f base59 control cannot encode lowercase f");
    if (second > alphabet60.indexOf("f")) second -= 1;
  }
  return first * radix + second;
}
function bytesToBigInt(bytes, endian = "BE") {
  const ordered = endian === "LE" ? [...bytes].reverse() : bytes;
  let n = 0n;
  for (const byte of ordered) n = (n << 8n) + BigInt(byte);
  return n;
}
function valuation(n, prime) {
  let count = 0;
  let quotient = n;
  while (quotient % prime === 0n) {
    quotient /= prime;
    count += 1;
  }
  return {count, quotient};
}
function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const bytes60 = tokens.map((token) => tokenValue(token, 60));
assert.deepEqual(grid.bytes, bytes60, "shared byte array is not the base60 decoding of the audited tokens");
const N = bytesToBigInt(bytes60, "BE");
assert.equal(N.toString(2).length, 2048);
const f179 = valuation(N, 179n);
assert.equal(f179.count, 2);
const q = f179.quotient;
assert.equal(q % 179n, 55n);
const f29 = valuation(q, 29n);
assert.equal(f29.count, 1);
const q29 = f29.quotient;
assert.equal(q29 % 179n, 113n);

function primesThrough(limit) {
  const primes = [];
  for (let n = 2; n <= limit; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes;
}
const primes = primesThrough(179);
assert.equal(primes[29], 113, "113 must be the 30th prime");

const manifest = read("resources/liber-primus/SHA256SUMS.txt");
const manifestHashes = new Map(
  manifest.split(/\r?\n/).map((line) => {
    const parts = line.trim().split(/\s+/);
    return parts.length >= 2 ? [parts[parts.length - 1].replace(/^\*/, ""), parts[0]] : null;
  }).filter(Boolean)
);
const imageHashes = {};
for (const imageName of ["66.jpg", "67.jpg", "68.jpg"]) {
  const actual = sha256(readBuffer("resources/liber-primus/" + imageName));
  assert.equal(actual, manifestHashes.get(imageName), "original image hash mismatch: " + imageName);
  imageHashes[imageName] = actual;
}

function signedWords() {
  const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/).slice(1).join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token))
    .map((token) => token.toUpperCase());
}
const words = signedWords();
assert.equal(words.length, 43);
assert.equal(words[28], "THE");
assert.equal(words[29], "DIRECTION");
assert.equal(words[30], "SEEK");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}
const gp0 = (word) => gp(word).reduce((sum, value) => sum + value, 0);
assert.equal(gp0("READ"), 55);
assert.equal(gp0("THE"), 20);
assert.equal(gp0("DIRECTION"), 98);
assert.equal(gp0("SEEK"), 56);

const theToken = tokens[gp0("THE")];
const directionToken = tokens[gp0("DIRECTION")];
const seekToken = tokens[gp0("SEEK")];
assert.equal(theToken, "1g");
assert.equal(directionToken, "1C");
assert.equal(seekToken, "4E");
const theOffset = tokenValue(theToken, 60);
const directionOffset = tokenValue(directionToken, 60);
const seekOffset = tokenValue(seekToken, 60);
assert.equal(theOffset, 102);
assert.equal(directionOffset, 72);
assert.equal(seekOffset, 254);

const tokenIndices = (token) => tokens.map((value, index) => value === token ? index : -1).filter((index) => index >= 0);
assert.deepEqual(tokenIndices("1C"), [98, 134]);
assert.deepEqual(tokenIndices("4E"), [56, 170]);

// Reconstruct p0's exact printed word boundaries; slash-newline is only wrapping.
const transcriptionPages = transcription.split(/\n%\n/);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
function parsePageWords(pageNumber) {
  const source = transcriptionPages[pageNumber];
  assert.ok(source, "missing transcription page " + pageNumber);
  const result = [];
  let current = [];
  let offset = 0;
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    result.push({index: result.length, start, length: current.length, indices: current});
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return result;
}
const p0Words = parsePageWords(0);
const selectedWords = p0Words.slice(14, 21);
const selectedLengths = selectedWords.map((word) => word.length);
assert.deepEqual(selectedLengths, [2, 2, 3, 3, 7, 5, 8]);
const p0Start = selectedWords[0].start;
const p0End = selectedWords[selectedWords.length - 1].start + selectedWords[selectedWords.length - 1].length - 1;
assert.equal(p0Start, 73);
assert.equal(p0End, 102);
assert.equal(p0End - p0Start + 1, 30);
const coreWords = p0Words.slice(17, 21);
const coreLength = coreWords.reduce((sum, word) => sum + word.length, 0);
assert.equal(coreWords[0].start, 80);
assert.equal(coreWords[coreWords.length - 1].start + coreWords[coreWords.length - 1].length - 1, 102);
assert.equal(coreLength, 23);
const p53 = corpus.pages.find((page) => page.page === 53);
assert.equal(p53.indices.length, 179);
const firstRuneOfInterval = p0Words[14].indices[0];
assert.equal(firstRuneOfInterval, 26);
assert.equal(Number(q29 % 29n), firstRuneOfInterval);

// Orientation, byte-order and base59 controls.
const matrix = Array.from({length: 32}, (_, row) => tokens.slice(row * 8, row * 8 + 8));
const flipRows = (m) => m.map((row) => [...row].reverse());
const flipCols = (m) => [...m].reverse();
const transpose = (m) => m[0].map((_, col) => m.map((row) => row[col]));
const transposed = transpose(matrix);
const orientations = [
  ["printed", matrix],
  ["hflip", flipRows(matrix)],
  ["vflip", flipCols(matrix)],
  ["rot180", flipRows(flipCols(matrix))],
  ["transpose", transposed],
  ["transpose-hflip", flipRows(transposed)],
  ["transpose-vflip", flipCols(transposed)],
  ["transpose-rot180", flipRows(flipCols(transposed))]
];
const controlResults = [];
for (const [orientation, orientedGrid] of orientations) {
  for (const radix of [60, 59]) {
    const bytes = orientedGrid.flat().map((token) => tokenValue(token, radix));
    for (const endian of ["BE", "LE"]) {
      const value = bytesToBigInt(bytes, endian);
      const a179 = valuation(value, 179n);
      const a29 = valuation(a179.quotient, 29n);
      controlResults.push({
        orientation, radix, endian,
        v179: a179.count,
        q179mod179: Number(a179.quotient % 179n),
        v29: a29.count,
        q29mod179: Number(a29.quotient % 179n)
      });
    }
  }
}
const jointHits = controlResults
  .filter((item) => item.v179 === 2 && item.q179mod179 === 55 && item.v29 === 1 && item.q29mod179 === 113)
  .map((item) => item.orientation + "/base" + item.radix + "/" + item.endian)
  .sort();
assert.deepEqual(jointHits, ["printed/base60/BE", "rot180/base60/LE"]);
assert.ok(controlResults.filter((item) => item.radix === 59).every((item) => item.v179 === 0));

// Historical 2014 participant derivative is a sensitivity control, not a source.
const old2014 = JSON.parse(read("resources/cicada2014-sexagesimal-source.json"));
const oldValues = old2014.decimal_values;
assert.equal(oldValues.length, 256);
const oldDifferences = oldValues.filter((value, index) => value !== bytes60[index]).length;
assert.equal(oldDifferences, 10);
const oldN = bytesToBigInt(oldValues);
assert.equal(valuation(oldN, 179n).count, 0);
assert.equal(valuation(oldN, 29n).count, 0);

// Explicitly reject the untyped hex-page/direction interpretation: it is not unique.
function hexByte(token) {
  return /^[0-9A-F]{2}$/i.test(token) ? parseInt(token, 16) : null;
}
const hexPairs = [];
for (let i = 0; i < words.length - 1; i += 1) {
  const leftIndex = gp0(words[i]);
  const rightIndex = gp0(words[i + 1]);
  const leftHex = hexByte(tokens[leftIndex]);
  const rightHex = hexByte(tokens[rightIndex]);
  if (leftHex !== null && leftHex <= 57 && [78, 83, 69, 87].includes(rightHex)) {
    hexPairs.push({
      left: words[i],
      right: words[i + 1],
      page: leftHex,
      direction: String.fromCharCode(rightHex)
    });
  }
}
assert.deepEqual(hexPairs, [
  {left: "ROAD", right: "AND", page: 42, direction: "N"},
  {left: "DIRECTION", right: "SEEK", page: 28, direction: "N"}
]);

const result = {
  status: "PASS",
  sourceAudit: {
    visuallyAuditedRows: auditedRows.length,
    tableTokens: tokens.length,
    originalImageHashes: imageHashes,
    2014DerivativeCellDifferences: oldDifferences
  },
  p50Integer: {
    bits: N.toString(2).length,
    sha256Of256Bytes: sha256(Buffer.from(bytes60)),
    v179: f179.count,
    quotientMod179: Number(q % 179n),
    v29After179Squared: f29.count,
    quotientAfter29Mod179: Number(q29 % 179n),
    primeOrdinal: 30,
    prime: 113
  },
  signed2016: {
    alphabeticWordCount: words.length,
    word29: words[28],
    word30: words[29],
    word31: words[30]
  },
  gp0Pointers: {
    the: {gp0: 20, token: theToken, base60: theOffset},
    direction: {gp0: 98, token: directionToken, base60: directionOffset},
    seek: {gp0: 56, token: seekToken, base60: seekOffset},
    tokenOccurrences: { "1C": tokenIndices("1C"), "4E": tokenIndices("4E") }
  },
  p0NestedInterval: {
    offsetsInclusive: [p0Start, p0End],
    runeCount: p0End - p0Start + 1,
    printedWordLengths: selectedLengths,
    prefixRunes: 7,
    dh23CoreOffsetsInclusive: [80, 102],
    dh23CoreRunes: coreLength,
    firstRuneValue: firstRuneOfInterval,
    quotientResidueMod29: Number(q29 % 29n),
    seekExtendedSpan: seekOffset - directionOffset,
    seekSpanEquals179Plus3: seekOffset - directionOffset === 179 + 3
  },
  orientationControl: {jointHits, base59HasNo179Factor: true},
  rejectedUntypedHexPairs: hexPairs,
  interpretation: "Intermediate source-constrained selector only; no recovered plaintext, no creator-authenticated general p50 output type, and no p29 reversible consumer."
};
console.log(JSON.stringify(result, null, 2));
