#!/usr/bin/env node
"use strict";

// Source-motivated p2 -> LP1 p13 phrase-key gate.
// Key: the exact GP29 rune sequence for "PROGRAM YOUR MIND / PROGRAM REALITY"
// from LP1 p13. Operation: solved p56 subtractive additive stream, with F
// transparent/non-consuming. Receiver: LP2 p2. No phase or key fitting.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const mod29 = (n) => ((n % 29) + 29) % 29;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const duko = read("resources/control/duko_round27_english_quadgrams.txt");

assert.equal(corpus.translit[0], "F");
assert.ok(lp1Reference.includes("PROGRAM YOUR MIND"));
assert.ok(lp1Reference.includes("PROGRAM REALITY"));

// The canonical LP1 transcription's tenth section (index 9) is p13.
// Its first 12 rune tokens render the heading "AN INSTRUCTION"; the remaining
// 28 rune tokens render the two PROGRAM imperatives.
const p13Runes = [...lp1.split("&")[9]].filter((r) => corpus.runes.includes(r));
assert.equal(p13Runes.length, 40);
const key = p13Runes.slice(12).map((r) => corpus.runes.indexOf(r));
const keyTranslit = key.map((i) => corpus.translit[i]);
assert.equal(key.length, 28);
assert.equal(keyTranslit.join(""), "PROGRAMYOURMINDPROGRAMREALITY");

function decode(ciphertext, streamKey) {
  let clock = 0;
  const plain = ciphertext.map((value) => {
    if (value === 0) return 0;
    const decoded = mod29(value - streamKey[clock % streamKey.length]);
    clock += 1;
    return decoded;
  });
  return { plain, consumed: clock };
}
function encode(plaintext, streamKey) {
  let clock = 0;
  const cipher = plaintext.map((value) => {
    if (value === 0) return 0;
    const encoded = mod29(value + streamKey[clock % streamKey.length]);
    clock += 1;
    return encoded;
  });
  return { cipher, consumed: clock };
}
function ioc(values) {
  const counts = Array(29).fill(0);
  values.forEach((value) => { counts[value] += 1; });
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
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
function quadgramMean(values) {
  const text = values.map((i) => corpus.translit[i]).join("").replace(/[^A-Z]/gu, "");
  let score = 0;
  let windows = 0;
  for (let i = 0; i + 4 <= text.length; i += 1) {
    score += Math.log((quadgrams.get(text.slice(i, i + 4)) || 0.01) / quadgramTotal);
    windows += 1;
  }
  return { text, meanLogProbability: score / windows, windows };
}

const page = corpus.pages.find((p) => p.page === 2);
assert.ok(page);
const cipher = page.indices;
assert.equal(cipher.length, 201);
const cipherFPositions = cipher.flatMap((value, i) => value === 0 ? [i] : []);
assert.deepEqual(cipherFPositions, [49, 64, 90, 104, 109, 116, 190]);

const result = decode(cipher, key);
const plainFPositions = result.plain.flatMap((value, i) => value === 0 ? [i] : []);
const extraPlainFPositions = plainFPositions.filter((i) => !cipherFPositions.includes(i));
const replay = encode(result.plain, key);
const mismatchPositions = replay.cipher.flatMap((value, i) => value !== cipher[i] ? [i] : []);
assert.equal(result.consumed, 194);
assert.deepEqual(plainFPositions, [
  11, 49, 64, 75, 76, 90, 100, 102, 104,
  109, 116, 132, 158, 164, 176, 183, 189, 190
]);
assert.equal(extraPlainFPositions.length, 11);
assert.equal(mismatchPositions.length, 175);

// Positive control: the same transparent-F implementation exactly reverses
// a p57 plaintext segment encrypted with this fixed 28-rune phrase key.
const p57 = corpus.pages.find((p) => p.page === 57);
assert.ok(p57);
const plant = p57.indices.slice(0, 50);
const plantCipher = encode(plant, key);
const plantRecovered = decode(plantCipher.cipher, key);
assert.deepEqual(plantRecovered.plain, plant);
assert.equal(plantCipher.consumed, plantRecovered.consumed);

console.log(JSON.stringify({
  hypothesis: "LP1 p13 PROGRAM imperatives as 28-rune repeating GP29 key; p56 additive/F-transparent rule; LP2 p2 receiver; phase0",
  keyLength: key.length,
  keyTranslit,
  keyIndices: key,
  receiver: {
    page: 2, length: cipher.length, ciphertextFPositions: cipherFPositions,
    keySymbolsConsumed: result.consumed
  },
  decoded: result.plain.map((i) => corpus.translit[i]).join(""),
  decodedFPositions: plainFPositions,
  extraPlainFPositions,
  ioc: ioc(result.plain),
  quadgram: quadgramMean(result.plain),
  forwardReplayMismatchPositions: mismatchPositions,
  forwardReplayMismatchCount: mismatchPositions.length,
  positiveControl: { source: "p57 first 50 runes", exactRoundTrip: true, symbols: plant.length },
  conclusion: "The fixed p13 phrase key creates 11 plaintext F symbols absent from ciphertext; the authentic p56 F-transparent forward rule then fails at 175/201 positions."
}, null, 2));
