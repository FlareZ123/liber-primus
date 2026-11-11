#!/usr/bin/env node
"use strict";

/**
 * Issue #375: exactly one source-visible p33 7-row x 13-column readout.
 * Run: node sims/p33_91_source_13column_sft.cjs
 * Transposition preserves original GP29 rune counts and index of coincidence.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = corpus.pages.find(page => page.page === 33);
assert(source && source.runic_count === 214);
assert(fs.statSync(path.join(root, "resources/liber-primus/50.jpg")).size > 0);
const alpha = corpus.translit;
const cipher = source.indices.slice(0, 91);
assert.equal(cipher.length, 91);
assert.deepEqual(cipher.slice(0, 10).map(i => alpha[i]),
  ["D", "EO", "X", "C", "F", "I", "A", "W", "H", "G"]);

/** Row-major 7x13 input, column-major readout. @param {number[]} input */
function read13Columns(input) {
  assert.equal(input.length, 91);
  return Array.from({length: 91}, (_, k) =>
    input[(k % 7) * 13 + Math.floor(k / 7)]);
}

/** Column-major 7x13 input, row-major reconstruction. @param {number[]} input */
function write13Columns(input) {
  assert.equal(input.length, 91);
  return Array.from({length: 91}, (_, k) =>
    input[(k % 13) * 7 + Math.floor(k / 13)]);
}

/** @param {number[]} values */
function histogram(values) {
  const counts = Array(29).fill(0);
  values.forEach(value => { counts[value]++; });
  return counts;
}

/** @param {number[]} counts @param {number} n */
function ioc(counts, n = 91) {
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (n * (n - 1));
}

/** @param {string} sourceText */
function tokenizeGP(sourceText) {
  const text = sourceText.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const byToken = new Map(alpha.map((token, i) => [token, i]));
  const multigraphs = alpha.filter(token => token.length > 1)
    .sort((a, b) => b.length - a.length);
  const output = [];
  for (let i = 0; i < text.length;) {
    const ch = text[i];
    if (ch >= "A" && ch <= "Z") {
      const token = multigraphs.find(item => text.startsWith(item, i));
      if (token) {
        output.push(byToken.get(token));
        i += token.length;
      } else if (byToken.has(ch)) {
        output.push(byToken.get(ch));
        i++;
      } else i++;
    } else i++;
  }
  return output;
}

/** @param {number[]} training */
function trigramModel(training) {
  const trigrams = new Uint32Array(29 ** 3);
  const bigrams = new Uint32Array(29 ** 2);
  for (let i = 0; i + 2 < training.length; i++) {
    trigrams[training[i] * 841 + training[i + 1] * 29 + training[i + 2]]++;
    bigrams[training[i] * 29 + training[i + 1]]++;
  }
  /** @param {number[]} text */
  return text => {
    let sum = 0;
    for (let i = 0; i + 2 < text.length; i++) {
      const a = text[i], b = text[i + 1], c = text[i + 2];
      sum += Math.log((trigrams[a * 841 + b * 29 + c] + 0.1) /
        (bigrams[a * 29 + b] + 2.9));
    }
    return sum / (text.length - 2);
  };
}

/** Deterministic xorshift32. @param {number} seed */
function rng(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

/** @param {number[]} values @param {() => number} random */
function shuffle(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const candidate = read13Columns(cipher);
assert.deepEqual(write13Columns(candidate), cipher);
const cipherHistogram = histogram(cipher);
const originalIoC = ioc(cipherHistogram);
assert.equal(ioc(histogram(candidate)), originalIoC);
const p57 = corpus.pages.find(page => page.page === 57).indices;
const solvedP57Windows = Array.from({length: p57.length - 90}, (_, i) =>
  ioc(histogram(p57.slice(i, i + 91))));

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
];
const reports = [];
let plantedEnglish = null;
for (let si = 0; si < controls.length; si++) {
  const [name, file] = controls[si];
  const tokens = tokenizeGP(read(file));
  const split = Math.floor(tokens.length * 0.8);
  const score = trigramModel(tokens.slice(0, split));
  const heldout = tokens.slice(split);
  const count = heldout.length - 90;
  let counts = histogram(heldout.slice(0, 91));
  let minimumIoC = Infinity;
  let minimumChanges = 91;
  let windowsAtOrBelowOriginal = 0;

  for (let start = 0; start < count; start++) {
    const currentIoC = ioc(counts);
    minimumIoC = Math.min(minimumIoC, currentIoC);
    if (currentIoC <= originalIoC + 1e-15) windowsAtOrBelowOriginal++;
    const changes = counts.reduce((sum, count, index) =>
      sum + Math.abs(count - cipherHistogram[index]), 0) / 2;
    minimumChanges = Math.min(minimumChanges, changes);
    if (start + 91 < heldout.length) {
      counts[heldout[start]]--;
      counts[heldout[start + 91]]++;
    }
  }
  const random = rng(0x330101 + si);
  const nativeScores = [], shuffledScores = [];
  for (let sample = 0; sample < 1000; sample++) {
    const start = Math.floor(random() * (heldout.length - 90));
    nativeScores.push(score(heldout.slice(start, start + 91)));
    shuffledScores.push(score(shuffle(cipher, random)));
  }
  nativeScores.sort((a, b) => a - b);
  shuffledScores.sort((a, b) => a - b);
  const candidateScore = score(candidate);
  reports.push({
    source: name, nativeTokens: tokens.length, heldoutWindows: count,
    minimumNativeIoC: minimumIoC, windowsAtOrBelowOriginal,
    minimumSymbolChangesForExactHistogram: minimumChanges,
    rawTrigram: score(cipher), thirteenColumnTrigram: candidateScore,
    nativeMedian: nativeScores[500], nativeMin: nativeScores[0],
    shuffledMedian: shuffledScores[500],
    shuffledMax: shuffledScores[999],
    candidatePercentileVsShuffled:
      shuffledScores.filter(x => x <= candidateScore).length / 1000,
  });

  if (si === 0) {
    const plain = heldout.slice(100, 191);
    assert.equal(plain.length, 91);
    const encrypted = write13Columns(plain);
    assert.deepEqual(read13Columns(encrypted), plain);
    assert.deepEqual(write13Columns(read13Columns(encrypted)), encrypted);
    plantedEnglish = {
      plain: plain.map(x => alpha[x]).join(""),
      ciphertext: encrypted.map(x => alpha[x]).join(""),
      exactRecovery: true,
      nativeTrigram: score(plain),
      encryptedTrigram: score(encrypted),
    };
  }
}

assert.equal(reports.reduce((total, r) => total + r.heldoutWindows, 0), 121039);
assert(reports.every(r => r.windowsAtOrBelowOriginal === 0));
assert.deepEqual(reports.map(r => r.minimumSymbolChangesForExactHistogram),
  [30, 35, 32]);

console.log(JSON.stringify({
  hypothesis: "Original physical p33 first titled unit: 91=7x13, 13 dots",
  printedImage: "resources/liber-primus/50.jpg",
  runeOffsets: [0, 91],
  includedRedHeader: cipher.slice(0, 10).map(i => alpha[i]).join(" "),
  originalGP29Indices: cipher,
  originalIoC,
  originalRuneHistogram: cipherHistogram,
  candidateGP29Indices: candidate,
  candidateTransliteration: candidate.map(i => alpha[i]).join(""),
  originalReconstructedExactly: true,
  solvedP57Windows,
  plantedEnglish,
  nativeEnglishControls: reports,
  conclusion: "The one unkeyed 13-column readout yields no genuine English plaintext; distinct source-selected mechanisms remain untested.",
}, null, 2));
