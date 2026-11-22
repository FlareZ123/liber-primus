#!/usr/bin/env node
"use strict";

// Test one source-shaped 32-byte key hypothesis:
// 32 thirteen-dot intervals -> 32 fragment word counts -> one byte selected
// from each corresponding row of the original 32x8 base-60 grid by count mod 8.
// The full eight-byte row is the per-fragment 64-bit ChaCha20 nonce.
//
// No search over keys, row order, nonce phases, or selector functions is performed.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { train } = require("./grid_keyskip_viterbi.cjs");

const root = path.join(__dirname, "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const grid = readJson("resources/liber-primus/base60-grid.json");
const transcription = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const shakespeare = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");

const pageBase = new Map();
let totalRunes = 0;
for (const page of corpus.pages) {
  pageBase.set(page.page, totalRunes);
  totalRunes += page.indices.length;
}

const stencilOffsets = [];
for (const page of ink.pages) {
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === 13) stencilOffsets.push(pageBase.get(page.page) + mark[0]);
  }
}
stencilOffsets.sort((a, b) => a - b);

const bounds = [0, ...stencilOffsets, totalRunes];
assert.equal(totalRunes, 13136);
assert.equal(stencilOffsets.length, 31);
assert.equal(bounds.length, 33);

const words = [];
const runePattern = /[\u16A0-\u16FF]/u;
let inWord = false;
let wordStart = -1;
let runeOffset = 0;
function finishWord() {
  if (inWord) {
    words.push({ start: wordStart, end: runeOffset - 1 });
    inWord = false;
    wordStart = -1;
  }
}
for (const character of transcription) {
  if (runePattern.test(character)) {
    if (!inWord) {
      inWord = true;
      wordStart = runeOffset;
    }
    runeOffset++;
  } else if (character === "%" || character === "/" || /\s/u.test(character)) {
    // Physical page and print-wrap separators do not end a word.
  } else {
    finishWord();
  }
}
finishWord();
assert.equal(runeOffset, totalRunes);
assert.equal(words.length, 2941);

const wordCounts = [];
for (let f = 0; f < 32; f++) {
  const start = bounds[f];
  const end = bounds[f + 1];
  const crossing = words.filter((w) =>
    w.start < end && w.end >= start && !(w.start >= start && w.end < end)
  );
  assert.equal(crossing.length, 0, "a word crosses a 13-dot boundary");
  wordCounts.push(words.filter((w) => w.start >= start && w.end < end).length);
}
const expectedWordCounts = [
  2,156,3,19,1,153,4,70,0,5,383,0,2,3,432,4,
  220,3,323,2,21,2,324,1,28,669,2,64,2,23,1,19
];
assert.deepEqual(wordCounts, expectedWordCounts);

assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
const key = Buffer.from(wordCounts.map((count, row) => grid.byte_rows[row][count % 8]));
const keyHex = key.toString("hex");
assert.equal(keyHex, "a7f721197254567c7a9041d348da490da90dad0e12fe909cb04c068e49ad8de6");

const ciphertext = Buffer.from(
  corpus.pages.filter((page) => page.page < 56).flatMap((page) => page.indices)
);
assert.equal(ciphertext.length, 12956);
const unknownBounds = bounds.slice(0, 29);
assert.equal(unknownBounds[28], ciphertext.length);
const ranges = Array.from({ length: 28 }, (_, i) => [unknownBounds[i], unknownBounds[i + 1]]);

// OpenSSL's ChaCha20 interface uses a 16-byte IV: 64-bit counter || 64-bit nonce.
// Each original grid row is the nonce; the counter starts at zero for each fragment.
const vectorKey = Buffer.from(Array.from({ length: 32 }, (_, i) => i));
const vectorNonce = Buffer.concat([Buffer.alloc(8), Buffer.from([0,1,2,3,4,5,6,7])]);
const vectorCipher = crypto.createCipheriv("chacha20", vectorKey, vectorNonce);
const vectorHex = Buffer.concat([
  vectorCipher.update(Buffer.alloc(64)),
  vectorCipher.final()
]).toString("hex");
assert.equal(
  vectorHex,
  "f798a189f195e66982105ffb640bb7757f579da31602fc93ec01ac56f85ac3c134a4547b733b46413042c9440049176905d3be59ea1c53f15916155c2be8241a"
);

const pad = Buffer.alloc(ciphertext.length);
for (let f = 0; f < 28; f++) {
  const [start, end] = ranges[f];
  if (end === start) continue;
  const iv = Buffer.concat([Buffer.alloc(8), Buffer.from(grid.byte_rows[f])]);
  const cipher = crypto.createCipheriv("chacha20", key, iv);
  const stream = Buffer.concat([
    cipher.update(Buffer.alloc(end - start)),
    cipher.final()
  ]);
  stream.copy(pad, start);
}

const mod = (x, m) => ((x % m) + m) % m;
function reduceByte(value, period, reducer) {
  return reducer === "mod" ? value % period : Math.floor(period * value / 256);
}

function decode(input, mode) {
  const output = Buffer.alloc(input.length);
  for (let f = 0; f < 28; f++) {
    const [start, end] = ranges[f];
    let previousCipher = -1;
    for (let i = start; i < end; i++) {
      const period = mode.family === "exclude" ? 28 : 29;
      const k = reduceByte(pad[i], period, mode.reducer);
      if (mode.family === "add") {
        output[i] = mod(input[i] - mode.sign * k, 29);
      } else if (previousCipher < 0) {
        output[i] = input[i];
      } else if (input[i] === previousCipher) {
        output[i] = 28; // Reserved GP29 symbol: repeat the previous ciphertext rune.
      } else {
        output[i] = mod(mod(input[i] - previousCipher - 1, 29) - mode.sign * k, 28);
      }
      previousCipher = input[i];
    }
  }
  return output;
}

function encode(input, mode) {
  const output = Buffer.alloc(input.length);
  for (let f = 0; f < 28; f++) {
    const [start, end] = ranges[f];
    let previousCipher = -1;
    for (let i = start; i < end; i++) {
      const period = mode.family === "exclude" ? 28 : 29;
      const k = reduceByte(pad[i], period, mode.reducer);
      if (mode.family === "add") {
        output[i] = mod(input[i] + mode.sign * k, 29);
      } else if (previousCipher < 0) {
        output[i] = input[i];
      } else if (input[i] === 28) {
        output[i] = previousCipher;
      } else {
        output[i] = mod(previousCipher + 1 + mod(input[i] + mode.sign * k, 28), 29);
      }
      previousCipher = output[i];
    }
  }
  return output;
}

const model = train(shakespeare.slice(0, 200000));
function languageScore(sequence, segments) {
  let total = 0;
  let count = 0;
  for (const [start, end] of segments) {
    if (end <= start) continue;
    total += model.unigram[sequence[start]];
    count++;
    if (end - start > 1) {
      total += model.bigram[sequence[start] * 29 + sequence[start + 1]];
      count++;
    }
    for (let i = start + 2; i < end; i++) {
      total += model.trigram[(sequence[i - 2] * 29 + sequence[i - 1]) * 29 + sequence[i]];
      count++;
    }
  }
  return total / count;
}

function normalizedIoc(sequence) {
  const frequencies = new Uint32Array(29);
  for (const value of sequence) frequencies[value]++;
  const pairs = frequencies.reduce((sum, n) => sum + n * (n - 1), 0);
  return 29 * pairs / (sequence.length * (sequence.length - 1));
}

const variants = [];
for (const family of ["add", "exclude"]) {
  for (const sign of [1, -1]) {
    for (const reducer of ["mod", "scaled"]) {
      const mode = { family, sign, reducer };
      const plaintext = decode(ciphertext, mode);
      assert.deepEqual(encode(plaintext, mode), ciphertext, "inverse/forward roundtrip failed");
      variants.push({
        ...mode,
        meanGpTrigramLogScore: languageScore(plaintext, ranges),
        normalizedIoc: normalizedIoc(plaintext),
        reserved28Count: family === "exclude" ? plaintext.filter((x) => x === 28).length : null,
        prefix: Array.from(plaintext.subarray(0, 80), (x) => corpus.translit[x]).join(" ")
      });
    }
  }
}
variants.sort((a, b) => b.meanGpTrigramLogScore - a.meanGpTrigramLogScore);

const p57 = Buffer.from(corpus.pages.find((page) => page.page === 57).indices);
const result = {
  hypothesis: "word-count-mod-8 grid-row key; row-as-64-bit-ChaCha20-nonce; 13-dot fragment resets",
  sourceCounts: {
    totalPages: corpus.pages.length,
    totalRunes,
    totalWords: words.length,
    thirteenDotMarks: stencilOffsets.length,
    fragments: wordCounts.length,
    unknownRunes: ciphertext.length,
    unknownFragments: ranges.length
  },
  wordCounts,
  selectedColumns: wordCounts.map((count) => count % 8),
  keyHex,
  unknownFragmentBoundaries: unknownBounds,
  chacha20Vector: "passed",
  scoreControls: {
    rawCiphertext: languageScore(ciphertext, ranges),
    clearP57: languageScore(p57, [[0, p57.length]])
  },
  variants
};

console.log(JSON.stringify(result, null, 2));
