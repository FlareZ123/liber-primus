"use strict";
/**
 * Single-file original LP2 42.5%-insertion word-grammar control.
 * Execute: node sims/lp2_midword_null_length_grammar_sft.cjs
 * Reads exact repository fixtures, performs no writes, and uses frozen seeds.
 * The null's location/value are irrelevant to this necessary word-length test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes = new Set(corpus.runes);
const body = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const original = [];
let page = 0;
let startPage = 0;
let length = 0;
let runeCount = 0;
function finish() {
  if (length) original.push({length, page: startPage});
  length = 0;
}
for (const letter of body) {
  if (runes.has(letter)) {
    if (!length) startPage = page;
    runeCount++;
    length++;
  } else if (letter === "%") {
    page++;
  } else if ("-.$&§0123456789".includes(letter)) {
    finish();
  }
}
finish();
assert.equal(original.length, 2896);
assert.equal(runeCount, 12956);
const physical = (p) => p >= 50 ? p + 1 : p;
const bounds = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const parts = original.map((w) => bounds.findIndex((a, i) =>
  i + 1 < bounds.length && physical(w.page) >= a &&
  physical(w.page) < bounds[i + 1]));
assert.deepEqual(bounds.slice(0, -1).map((_, i) =>
  parts.filter((p) => p === i).length),
[158, 255, 383, 437, 224, 326, 378, 669, 66]);
/**
 * Historical LP1 source-native GP spelling: ING and IO as single runes.
 * @param {string} sourceWord @returns {number}
 */
const labels = ["ING", ...corpus.translit.map((s) => s === "IA" ? "IO" : s)]
  .sort((a, b) => b.length - a.length);
function gpLength(sourceWord) {
  const word = sourceWord.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  let n = 0;
  for (let i = 0; i < word.length;) {
    const label = labels.find((s) => word.startsWith(s, i));
    assert.ok(label, "Unmapped control word " + word);
    n++;
    i += label.length;
  }
  return n;
}
/** @param {string} text @returns {number[]} */
function controlWords(text) {
  return Array.from(text.matchAll(/[A-Za-z]+/g), (m) => gpLength(m[0].toUpperCase()));
}
/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
/** @param {number[]} input @param {number} seed @returns {number[]} */
function chapterShuffle(input, seed) {
  const out = input.slice();
  const next = rng(seed);
  let first = 0;
  while (first < input.length) {
    let last = first + 1;
    while (last < input.length && parts[last] === parts[first]) last++;
    for (let j = last - 1; j > first; j--) {
      const k = first + Math.floor(next() * (j - first + 1));
      [out[k], out[j]] = [out[j], out[k]];
    }
    first = last;
  }
  return out;
}
/**
 * Ten length classes, 1..8 and 9+ (the existing word-grammar SFT uses this binning).
 * @param {number[]} values @returns {number}
 */
function adjacencyMI(values) {
  const cell = Array.from({length: 10}, () => Array(10).fill(0));
  let total = 0;
  for (let i = 1; i < values.length; i++) {
    if (parts[i] !== parts[i - 1]) continue;
    cell[Math.min(9, values[i - 1])][Math.min(9, values[i])]++;
    total++;
  }
  const rows = cell.map((r) => r.reduce((s, x) => s + x, 0));
  const cols = Array.from({length: 10}, (_, j) =>
    cell.reduce((s, row) => s + row[j], 0));
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const n = cell[i][j];
      if (n) sum += n / total *
        Math.log(n * total / (rows[i] * cols[j]));
    }
  }
  return sum;
}
/**
 * @param {number[]} values @param {number} seed @param {number} trials
 * @returns {{mi:number,mean:number,z:number,p:number}}
 */
function nullTest(values, seed, trials) {
  const obs = adjacencyMI(values);
  let sum = 0;
  let sumSquares = 0;
  let greater = 0;
  for (let t = 0; t < trials; t++) {
    const other = adjacencyMI(chapterShuffle(values,
      seed ^ Math.imul(t + 1, 0x9e3779b9)));
    sum += other;
    sumSquares += other * other;
    if (other >= obs) greater++;
  }
  const mean = sum / trials;
  const sd = Math.sqrt(sumSquares / trials - mean * mean);
  return {
    mi: Number(obs.toFixed(8)),
    mean: Number(mean.toFixed(8)),
    z: Number(((obs - mean) / sd).toFixed(3)),
    p: Number(((greater + 1) / (trials + 1)).toFixed(6))
  };
}
/**
 * Insert one extra rune-length position with probability 0.425 into each
 * source word of length at least two. Any interior placement gives this length.
 * @param {number[]} lengths @param {number} seed
 */
function insertionPlant(lengths, seed) {
  const next = rng(seed);
  let inserted = 0;
  const out = lengths.map((n) => {
    const yes = n >= 2 && next() < 0.425;
    if (yes) inserted++;
    return n + Number(yes);
  });
  return {out, inserted};
}
const source = original.map((w) => w.length);
console.log("Original LP2 " + JSON.stringify({
  runes: runeCount, words: original.length,
  multiRuneWords: source.filter((n) => n >= 2).length,
  lengthHistogram1To11And12Plus: Array.from({length: 12}, (_, i) =>
    source.filter((n) => Math.min(n, 12) === i + 1).length)
}));
console.log("Original unsolved source " +
  JSON.stringify(nullTest(source, 11222, 360)));
const START = 1000;
const N = 2896;
let minimumZ = Infinity;
let maximumP = 0;
for (const [name, file, type] of [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 1],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 2],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 3]
]) {
  const lengths = controlWords(read(file));
  assert.ok(lengths.length >= START + 5 * N, name + " word supply");
  for (let i = 0; i < 5; i++) {
    const start = START + i * N;
    const window = lengths.slice(start, start + N);
    const {out, inserted} = insertionPlant(window, 20261116 + (i + 1) * 23 + type);
    const result = nullTest(out, 654321 + 19 * i, 160);
    minimumZ = Math.min(minimumZ, result.z);
    maximumP = Math.max(maximumP, result.p);
    console.log(JSON.stringify({
      source: name, sourceWordOffset: start, sourceWords: N,
      plantedExtraRunes: inserted, resultingRunes: out.reduce((s, n) => s + n, 0),
      ...result
    }));
  }
}
console.log(JSON.stringify({minimumControlZ: minimumZ, maximumControlP: maximumP}));
assert.ok(minimumZ > 1.5, "unexpectedly weak original-order grammar control");
assert.ok(maximumP < 0.1, "unexpectedly indistinct original-order control");
console.log("SFT PASS: 42.5% random single-rune word-interior insertion does not erase all source-prose length order.");
