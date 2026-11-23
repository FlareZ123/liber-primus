#!/usr/bin/env node
"use strict";

// Test the literal 76-cell p50 table slice suggested by the signed-2016
// PATH -> cell205 -> value76 -> unique 76-rune p55 recipient.
// No arbitrary key search: row-major table, start cell205, forward (one
// circular wrap) or backward (no wrap), base60 values mod29, both additive
// signs, and the known p56 F-transparent/non-consuming rule on/off.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const mod29 = (n) => ((n % 29) + 29) % 29;
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";

const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const duko = read("resources/control/duko_round27_english_quadgrams.txt");
const originalTranscription = read("resources/transcriptions/lp2-image-corrected.txt");

const tokens = table.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const values = tokens.map((token) => {
  assert.equal(token.length, 2);
  const hi = alphabet60.indexOf(token[0]);
  const lo = alphabet60.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  return hi * 60 + lo;
});
assert.equal(tokens[205], "1G");
assert.equal(values[205], 76);

const page55 = corpus.pages.find((page) => page.page === 55);
assert.ok(page55);
const cipher = page55.indices;
assert.equal(cipher.length, 76);
const cipherFPositions = cipher.flatMap((value, i) => value === 0 ? [i] : []);
assert.deepEqual(cipherFPositions, [15, 25, 41]);
assert.deepEqual(corpus.pages.filter((page) => page.indices.length === 76).map((p) => p.page), [55]);

// A 76-entry forward slice from 205 wraps once at cell255; the backward
// slice ends at130 and requires no wrap. Both are explicit direction tests.
const streams = [
  ["forward-wrap", Array.from({length: 76}, (_, i) => values[(205 + i) % 256])],
  ["backward", Array.from({length: 76}, (_, i) => values[205 - i])]
];
assert.equal(streams[0][1][0], 76);
assert.equal(streams[1][1][0], 76);
assert(streams.every(([, stream]) => stream.length === 76));
assert(streams.some(([, stream]) => stream.includes(0)));

// Euler phi(0) is undefined. Since each selected direction contains a zero
// and no original source rule says to skip or replace it, no phi(value)
// variant is invented here.

const quadgrams = new Map();
let quadgramTotal = 0;
for (const line of duko.trim().split(/\r?\n/u)) {
  const match = /^([A-Z]{4})\s+(\d+)$/u.exec(line.trim());
  if (match) {
    const count = Number(match[2]);
    quadgrams.set(match[1], count);
    quadgramTotal += count;
  }
}
function metrics(values29) {
  const text = values29.map((i) => corpus.translit[i]).join("").replace(/[^A-Z]/gu, "");
  let score = 0, windows = 0;
  for (let i = 0; i + 4 <= text.length; i += 1) {
    score += Math.log((quadgrams.get(text.slice(i, i + 4)) || 0.01) / quadgramTotal);
    windows += 1;
  }
  const counts = Array(29).fill(0);
  values29.forEach((value) => { counts[value] += 1; });
  return {
    text,
    meanDukoQuadgramLogScore: score / windows,
    indexOfCoincidence: counts.reduce((sum, n) => sum + n * (n - 1), 0) /
      (values29.length * (values29.length - 1)),
    fPositions: values29.flatMap((value, i) => value === 0 ? [i] : [])
  };
}
function transform(input, key, sign, skipF) {
  let clock = 0;
  const output = input.map((value) => {
    if (skipF && value === 0) return 0;
    const result = mod29(value + sign * key[clock % key.length]);
    clock += 1;
    return result;
  });
  return { output, consumed: clock };
}
function replay(plain, key, sign, skipF) {
  return transform(plain, key, sign, skipF).output;
}

// Reconstruct the p55 word lengths from the original page transcription.
// Hyphen, punctuation and line boundaries separate printed words.
const p55Text = originalTranscription.split("%")[54];
const runeSet = new Set(corpus.runes);
const wordLengths = [];
let pending = "", wordLength = 0, runeCount = 0;
for (const char of p55Text) {
  if (runeSet.has(char)) {
    if (pending.includes("-") || pending.includes(".") || pending.includes("/")) {
      if (wordLength) wordLengths.push(wordLength);
      wordLength = 0;
    }
    wordLength += 1;
    runeCount += 1;
    pending = "";
  } else {
    pending += char;
  }
}
if (wordLength) wordLengths.push(wordLength);
assert.equal(runeCount, 76);
assert.equal(wordLengths.reduce((sum, n) => sum + n, 0), 76);

const variants = [];
for (const [direction, stream] of streams) {
  const key = stream.map(mod29);
  for (const sign of [-1, 1]) {
    for (const skipF of [false, true]) {
      const { output, consumed } = transform(cipher, key, sign, skipF);
      const replayed = replay(output, key, sign, skipF);
      const mismatchPositions = replayed.flatMap((value, i) => value !== cipher[i] ? [i] : []);
      const m = metrics(output);
      const words = [];
      let offset = 0;
      for (const length of wordLengths) {
        words.push(output.slice(offset, offset + length).map((i) => corpus.translit[i]).join(""));
        offset += length;
      }
      variants.push({
        direction,
        sign: sign === -1 ? "subtract" : "add",
        fTransparent: skipF,
        keySymbolsConsumed: consumed,
        ...m,
        extraPlainF: m.fPositions.filter((i) => !cipherFPositions.includes(i)),
        forwardReplayMismatchCount: mismatchPositions.length,
        wordSegmentedOutput: words
      });
    }
  }
}
variants.sort((a, b) => b.meanDukoQuadgramLogScore - a.meanDukoQuadgramLogScore);

// Positive control: prove the additive and F-transparent implementation
// reverses an independently supplied p57 segment when it is genuinely
// encrypted with this fixed stream.
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p57);
const plant = p57.indices.slice(0, 50);
const plantKey = streams[1][1].map(mod29);
const plantCipher = transform(plant, plantKey, 1, true);
const plantRecovered = transform(plantCipher.output, plantKey, -1, true);
assert.deepEqual(plantRecovered.output, plant);
assert.equal(plantCipher.consumed, plantRecovered.consumed);

console.log(JSON.stringify({
  hypothesis: "p50 cell205 as start of a 76-value base60 table key for the unique 76-rune p55 page",
  sourceReceipt: { cell205Token: tokens[205], cell205Base60Value: values[205], p55RuneCount: cipher.length },
  p55: { ciphertextFPositions: cipherFPositions, originalWordLengths: wordLengths, baseline: metrics(cipher) },
  selectedSlices: streams.map(([direction, stream]) => ({
    direction, length: stream.length, firstValue: stream[0], lastValue: stream.at(-1),
    zeroOffsets: stream.flatMap((value, i) => value === 0 ? [i] : [])
  })),
  keyInterpretation: "raw base60 table values reduced mod29; phi is not tested because the selected slices contain 0 and phi(0) is undefined without an extra source rule",
  variants,
  positiveControl: { source: "p57 first 50 runes", exactFTransparentRoundTrip: true },
  conclusion: "Neither source-adjacent 76-cell slice yields readable p55 plaintext under the fixed additive GP29 transfer; the best word-preserving output remains gibberish."
}, null, 2));
