#!/usr/bin/env node
"use strict";

// Reproduce the bounded 2016-message / p32 7x13 circumference test.
// Run from the repository root:
//   node sims/lp2_2016_7x13_p57_circumference_gate.cjs

const fs = require("node:fs");
const assert = require("node:assert/strict");
const read = (p) => fs.readFileSync(p, "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid256 = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcriptionPages = read("resources/lp2-transcription.txt").split("%");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}

assert.equal(transcriptionPages.length, 57);
const lp2Pages = Array.from({ length: 58 }, (_, p) =>
  p === 50 ? [] : printedWords(transcriptionPages[p > 50 ? p - 1 : p])
);
assert.equal(lp2Pages.length, 58);

const body = signed.slice(signed.indexOf("Hello."), signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
assert(body.length > 0);
const paragraphs = body.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
const messageWords = body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];

const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeWord(word) {
  const source = word.toLowerCase().replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = alphabet.find(({ token }) => source.startsWith(token, i));
    if (!hit) throw new Error("No GP token for " + word + " at " + source.slice(i));
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

function primeSum(word) {
  return encodeWord(word).reduce((sum, index) => sum + corpus.prime[index], 0);
}

const mapped = messageWords.map((word, index) => {
  const sum = primeSum(word);
  const page = sum % 58;
  const wordIndex = Math.floor(sum / 58);
  return {
    index: index + 1,
    word,
    sum,
    page,
    wordIndex,
    target: lp2Pages[page]?.[wordIndex] ?? null
  };
});
const targets = mapped.filter((x) => x.target !== null);
assert.equal(paragraphs.length, 7);
assert.equal(messageWords.length, 43);
assert.equal(targets.length, 42);

const stream = targets.flatMap((x) =>
  [...x.target].slice(1, -1).map((rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1);
    return index;
  })
);
assert.equal(stream.length, 91);

const rows = Array.from({ length: 7 }, (_, r) => stream.slice(r * 13, (r + 1) * 13));
assert(rows.every((row) => row.length === 13));

function perimeter(matrix) {
  const height = matrix.length;
  const width = matrix[0].length;
  if (height === 1) return matrix[0].slice();
  if (width === 1) return matrix.map((row) => row[0]);
  const out = [...matrix[0]];
  for (let r = 1; r < height - 1; r++) out.push(matrix[r][width - 1]);
  out.push(...matrix[height - 1].slice().reverse());
  for (let r = height - 2; r >= 1; r--) out.push(matrix[r][0]);
  return out;
}

let layer = rows;
const ringSizes = [];
while (layer.length > 0 && layer[0].length > 0) {
  ringSizes.push(perimeter(layer).length);
  if (layer.length <= 2 || layer[0].length <= 2) break;
  layer = layer.slice(1, -1).map((row) => row.slice(1, -1));
}
assert.deepEqual(ringSizes, [36, 28, 20, 7]);

const innerRows = rows.slice(1, 6).map((row) => row.slice(1, 12));
const inner55 = innerRows.flat();
const center7 = rows[3].slice(3, 10);
assert.equal(inner55.length, 55);
assert.equal(center7.length, 7);

const selectedPositions = [7, 20, 28, 36];
const selectedWords = selectedPositions.map((position) => messageWords[position - 1]);
assert.deepEqual(selectedWords, ["seeks", "their", "are", "found"]);
const selectedSums = selectedWords.map(primeSum);
assert.deepEqual(selectedSums, [253, 114, 175, 130]);
const p50Bytes = selectedSums.map((address) => {
  assert(address >= 0 && address < 256);
  return grid256.bytes[address];
});
assert.deepEqual(p50Bytes, [36, 197, 18, 86]);

// Apply the existing p50-byte compass convention to p32 from zero-based
// index 33 (row 3, column 0). This reuses a provisional convention.
const p32 = corpus.pages.find((page) => page.page === 32).indices;
assert.equal(p32.length, 121);
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];
const directionNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const mod = (n, m) => ((n % m) + m) % m;
let row = 3;
let col = 0;
const compassRoute = [];
for (const byte of p50Bytes) {
  const direction = byte & 7;
  const distance = byte >> 3;
  row = mod(row + directions[direction][0] * distance, 11);
  col = mod(col + directions[direction][1] * distance, 11);
  const index = row * 11 + col;
  compassRoute.push({
    byte,
    direction: directionNames[direction],
    distance,
    index,
    rune: corpus.translit[p32[index]]
  });
}
assert.deepEqual(compassRoute.map((x) => x.index), [77, 108, 99, 100]);
assert.deepEqual(compassRoute.map((x) => x.rune), ["NG", "L", "EA", "R"]);

const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p55.length, 76);
const innerKeyMinus = p55.map((value, i) => mod(value - inner55[i % inner55.length], 29));
const innerKeyPlus = p55.map((value, i) => mod(value + inner55[i % inner55.length], 29));

function ioc(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  let numerator = 0;
  for (const count of counts.values()) numerator += count * (count - 1);
  return numerator / (values.length * (values.length - 1));
}

const tokenRows = rows.map((r) => r.map((index) => corpus.translit[index]));
const tokenInnerRows = innerRows.map((r) => r.map((index) => corpus.translit[index]));
const toTokens = (values) => values.map((index) => corpus.translit[index]);

console.log(JSON.stringify({
  paragraphCount: paragraphs.length,
  messageWordCount: messageWords.length,
  mappedRuneWordCount: targets.length,
  interiorRuneCount: stream.length,
  grid7x13: tokenRows,
  ringSizes,
  inner5x11: tokenInnerRows,
  inner55: toTokens(inner55),
  center7: toTokens(center7),
  ringSizeWordPositions: selectedPositions,
  ringSizeSelectedWords: selectedWords,
  selectedPrimeSums: selectedSums,
  p50Bytes: p50Bytes,
  p32CompassStartIndexZeroBased: 33,
  p32CompassRoute: compassRoute,
  p55Length: p55.length,
  p55RawIoC: ioc(p55),
  p55WithInner55SubtractedIoC: ioc(innerKeyMinus),
  p55WithInner55AddedIoC: ioc(innerKeyPlus)
}, null, 2));
