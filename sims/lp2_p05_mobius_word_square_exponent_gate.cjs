#!/usr/bin/env node
"use strict";

// Source-led test: use the 25 GP-prime-sum values of LP1 p05's "Some Wisdom"
// square as a repeating word-level exponent schedule for the p05 Mobius map.
// M16 is projectively M05^6, so scale=6 tests it.
//
// Run from the repository root:
//   node sims/lp2_p05_mobius_word_square_exponent_gate.cjs

const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8");
const controlText = fs.readFileSync(
  path.join(root, "resources/control/emerson_essays_2944.txt"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function mod(n, m) {
  return ((n % m) + m) % m;
}
function inverseMod(a, m) {
  for (let x = 1; x < m; x++) if (mod(a * x, m) === 1) return x;
  throw new Error("No modular inverse for " + a + " mod " + m);
}
function phi(n) {
  let result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    while (n % p === 0) n /= p;
    result -= result / p;
  }
  if (n > 1) result -= result / n;
  return Math.round(result);
}

// Row-major GP-prime-sum values for the 5x5 p05 square.
const cellValues = [
  272, 138, 341, 131, 151,
  366, 199, 130, 320, 18,
  226, 245, 91, 245, 226,
  18, 320, 130, 199, 366,
  151, 131, 341, 138, 272
];
assert(cellValues.length === 25, "Expected 25 square cells");
for (let row = 0; row < 5; row++) {
  const sum = cellValues.slice(row * 5, row * 5 + 5)
    .reduce((a, b) => a + b, 0);
  assert(sum === 1033, "p05 row " + row + " does not sum to 1033");
}
assert(cellValues.every((v, i) => v === cellValues[24 - i]),
  "Expected the source square's 180-degree symmetry");

const schedules = {
  raw: cellValues.map((v) => mod(v, 28)),
  phi: cellValues.map((v) => mod(phi(v), 28))
};

// PGL(2,29) map M05 = [[11,6],[6,11]], x -> (11x+6)/(6x+11).
// The MOBIUS cell has GP-prime-sum 226; 226 mod 29 = seed 23.
function applyM05(point) {
  if (point === null) return mod(11 * inverseMod(6, 29), 29);
  const denominator = mod(6 * point + 11, 29);
  if (denominator === 0) return null;
  return mod((11 * point + 6) * inverseMod(denominator, 29), 29);
}
const cyclePoints = [];
let point = mod(226, 29);
for (let i = 0; i < 28; i++) {
  cyclePoints.push(point);
  point = applyM05(point);
}
assert(point === mod(226, 29), "M05 orbit did not close after 28 steps");
const cycleSymbols = cyclePoints.map((x) => x === null ? 1 : x);
const cyclePosition = new Map(cycleSymbols.map((symbol, i) => [symbol, i]));
assert(cycleSymbols.length === 28 && new Set(cycleSymbols).size === 28,
  "M05 rune orbit is not a 28-cycle");
for (let i = 0; i < 28; i++) {
  assert(cyclePosition.has(i), "M05 orbit omits rune index " + i);
}
assert(applyM05(1) === 1 && applyM05(28) === 28,
  "Expected fixed points 1 and 28");

const parsed = parseLP2Words(transcript, 55);
const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const wordIndices = parsed.words.map((word) =>
  [...word.runes].map((rune) => runeToIndex.get(rune)));
assert(wordIndices.every((word) => word.every(Number.isInteger)),
  "Transcript contains a rune absent from the canonical alphabet");
const actual = wordIndices.flat();
const expected = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert(JSON.stringify(actual) === JSON.stringify(expected),
  "Parsed stream does not match canonical corpus pages 0-55");
assert(parsed.words.length === 2896 && parsed.runeCount === 12956,
  "Unexpected canonical word/rune counts");

function transform(inputWords, schedule, scale, sign) {
  return inputWords.map((word, wordIndex) => word.map((symbol) => {
    if (symbol === 28) return 28; // other projective fixed point
    const start = cyclePosition.get(symbol);
    const shift = sign * scale * schedule[wordIndex % 25];
    return cycleSymbols[mod(start + shift, 28)];
  }));
}

function englishToGPWords(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const gp = new Map(corpus.translit.map((token, i) => [token, i]));
  gp.set("ING", 21);
  return (normalized.match(/[A-Z]+/g) || []).map((word) => {
    const encoded = [];
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const token = word.slice(i, i + n);
        if (!gp.has(token)) continue;
        encoded.push(gp.get(token));
        i += n;
        found = true;
        break;
      }
      if (!found) throw new Error("Unmapped control text at " + word.slice(i));
    }
    return encoded;
  });
}

const controlWords = englishToGPWords(controlText);
const controlFlat = controlWords.flat();
const trigramCounts = new Map();
for (let i = 0; i + 2 < controlFlat.length; i++) {
  const key = controlFlat[i] * 841 + controlFlat[i + 1] * 29 + controlFlat[i + 2];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
}
const alpha = 0.05;
const trigramDenominator = controlFlat.length - 2 + alpha * 29 ** 3;

function score(words) {
  const flat = words.flat();
  const frequency = Array(29).fill(0);
  for (const symbol of flat) frequency[symbol]++;
  const ioc = frequency.reduce((sum, n) => sum + n * (n - 1), 0) /
    (flat.length * (flat.length - 1));
  const top12 = frequency.slice().sort((a, b) => b - a)
    .slice(0, 12).reduce((sum, n) => sum + n, 0) / flat.length;

  let allLog = 0;
  for (let i = 0; i + 2 < flat.length; i++) {
    const key = flat[i] * 841 + flat[i + 1] * 29 + flat[i + 2];
    allLog += Math.log(((trigramCounts.get(key) || 0) + alpha) /
      trigramDenominator);
  }
  let withinLog = 0;
  let withinCount = 0;
  for (const word of words) {
    for (let i = 0; i + 2 < word.length; i++) {
      const key = word[i] * 841 + word[i + 1] * 29 + word[i + 2];
      withinLog += Math.log(((trigramCounts.get(key) || 0) + alpha) /
        trigramDenominator);
      withinCount++;
    }
  }
  return {
    ioc,
    top12,
    trigram: allLog / (flat.length - 2),
    withinWordTrigram: withinLog / withinCount
  };
}
function render(words) {
  return words.map((word) => word.map((symbol) => corpus.translit[symbol]).join("")
    .toLowerCase());
}

const baseline = score(wordIndices);
const control = score(controlWords);
const variants = [];
for (const [scheduleName, schedule] of Object.entries(schedules)) {
  for (const [matrixName, scale] of [["M05", 1], ["M16", 6]]) {
    for (const sign of [-1, 1]) {
      const transformed = transform(wordIndices, schedule, scale, sign);
      const restored = transform(transformed, schedule, scale, -sign);
      const roundTrip = JSON.stringify(restored) === JSON.stringify(wordIndices);
      assert(roundTrip, "Round-trip failed for " + scheduleName + "/" + matrixName);
      variants.push({
        name: scheduleName + "_" + matrixName + "_" +
          (sign < 0 ? "inverse" : "forward"),
        metrics: score(transformed),
        roundTrip,
        preview: render(transformed).slice(0, 24)
      });
    }
  }
}

console.log(JSON.stringify({
  input: {
    words: parsed.words.length,
    runes: parsed.runeCount,
    crossPageWords: parsed.crossPageWords,
    matchesCanonicalCorpus: true
  },
  p05CellValues: cellValues,
  rawSchedule: schedules.raw,
  phiSchedule: schedules.phi,
  M05CycleSymbols: cycleSymbols,
  baseline,
  englishControl: control,
  variants
}, null, 2));
