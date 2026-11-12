"use strict";
/**
 * LP2 printed-word adjacency/sentence grammar, original-source SFT.
 * Node.js 22: node sims/lp2_wordlength_grammar_sft.cjs
 * Source corpus and independent text fixtures are repository-tracked.
 * A positive control is naturally ordered prose, not fabricated cipher text.
 * @returns {void}
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes = new Set(corpus.runes);
const originalText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const original = [];
let indexPage = 0;
let startPage = 0;
let length = 0;
let runeCount = 0;
/** @param {string} punct */
function finish(punct = "") {
  if (!length) return;
  original.push({len: length, page: startPage, punct: punct === "."});
  length = 0;
}
for (const letter of originalText) {
  if (runes.has(letter)) {
    if (!length) startPage = indexPage;
    length++;
    runeCount++;
  } else if (letter === "%") {
    indexPage++;
  } else if ("-.$&§0123456789".includes(letter)) {
    finish(letter);
  }
}
finish();
assert.equal(runeCount, 12956);
assert.equal(original.length, 2896);
assert.equal(original.filter((w) => w.punct).length, 175);
assert.equal(indexPage, 54);
const physical = (n) => n >= 50 ? n + 1 : n;
const bounds = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const chapter = original.map((w) => bounds.findIndex((v, i) =>
  i + 1 < bounds.length && physical(w.page) >= v &&
  physical(w.page) < bounds[i + 1]));
assert.equal(new Set(chapter).size, 9);
const cap = (v) => Math.min(v, 9);
/**
 * Unbiased-looking but deliberately *uncorrected* plug-in MI. All claims
 * use identically estimated and length-histogram-matched permutation nulls.
 * @param {number[]} values @param {number[]} parts @returns {number}
 */
function adjacencyMI(values, parts) {
  const table = Array.from({length: 10}, () => Array(10).fill(0));
  let count = 0;
  for (let i = 1; i < values.length; i++) {
    if (parts[i] !== parts[i - 1]) continue;
    table[cap(values[i - 1])][cap(values[i])]++;
    count++;
  }
  const rows = table.map((r) => r.reduce((a, b) => a + b, 0));
  const cols = Array.from({length: 10}, (_, j) =>
    table.reduce((a, r) => a + r[j], 0));
  let result = 0;
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      const n = table[a][b];
      if (n) result += n / count *
        Math.log(n * count / (rows[a] * cols[b]));
    }
  }
  return result;
}
/**
 * Mutual information between word length and its sentence-local role
 * (start, end, interior). Single-word sentences count as start.
 * @param {Array<{len:number,punct:boolean}>} items
 * @param {number[]} parts @returns {number}
 */
function boundaryMI(items, parts) {
  const t = Array.from({length: 3}, () => Array(10).fill(0));
  const rows = Array(3).fill(0);
  const cols = Array(10).fill(0);
  for (let i = 0; i < items.length; i++) {
    const start = !i || parts[i] !== parts[i - 1] || items[i - 1].punct;
    const role = start ? 0 : items[i].punct ? 1 : 2;
    const l = cap(items[i].len);
    t[role][l]++;
    rows[role]++;
    cols[l]++;
  }
  let result = 0;
  const n = items.length;
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 10; b++) {
      const k = t[a][b];
      if (k) result += k / n * Math.log(k * n / (rows[a] * cols[b]));
    }
  }
  return result;
}
/**
 * Fisher-Yates without changing punctuation/page/chapter, using a fixed
 * 32-bit xorshift and an independent shuffle within each chapter.
 * @param {number[]} values @param {number[]} parts @param {number} seed
 * @returns {number[]}
 */
function permute(values, parts, seed) {
  const a = values.slice();
  let state = seed >>> 0;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }
  let start = 0;
  while (start < a.length) {
    let end = start + 1;
    while (end < a.length && parts[end] === parts[start]) end++;
    for (let i = end - 1; i > start; i--) {
      const j = start + Math.floor(random() * (i - start + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    start = end;
  }
  return a;
}
/**
 * @param {Array<{len:number,punct:boolean}>} items
 * @param {number[]} parts @param {"adjacency"|"sentence"} mode
 * @param {number} trials @param {number} seed
 * @returns {{n:number,observed:number,nullMean:number,z:number,pUpper:number}}
 */
function test(items, parts, mode, trials, seed) {
  const lengths = items.map((x) => x.len);
  const calc = (a) => mode === "adjacency" ?
    adjacencyMI(a, parts) :
    boundaryMI(items.map((x, i) => ({len: a[i], punct: x.punct})), parts);
  const observed = calc(lengths);
  let total = 0;
  let totalSquares = 0;
  let high = 0;
  for (let i = 0; i < trials; i++) {
    const v = calc(permute(lengths, parts,
      ((i + 1) * 0x9e3779b9) ^ seed));
    total += v;
    totalSquares += v * v;
    if (v >= observed) high++;
  }
  const mean = total / trials;
  const sd = Math.sqrt(totalSquares / trials - mean * mean);
  return {
    n: items.length,
    observed: Number(observed.toFixed(8)),
    nullMean: Number(mean.toFixed(8)),
    z: Number(((observed - mean) / sd).toFixed(3)),
    pUpper: Number(((high + 1) / (trials + 1)).toFixed(6))
  };
}
const labels = ["ING", ...corpus.translit]
  .sort((a, b) => b.length - a.length);
/** @param {string} sourceWord @returns {number} */
function gpLength(sourceWord) {
  const word = sourceWord.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  let n = 0;
  for (let i = 0; i < word.length;) {
    const label = labels.find((x) => word.startsWith(x, i));
    assert.ok(label, "Unmapped source word " + word);
    i += label.length;
    n++;
  }
  return n;
}
/** @param {string} raw */
function parseEnglish(raw) {
  const result = [];
  let token = "";
  function flush() {
    if (token) {
      result.push({raw: token.length, gp: gpLength(token), punct: false});
      token = "";
    }
  }
  for (const char of raw) {
    if (/^[A-Za-z]$/.test(char)) token += char.toUpperCase();
    else {
      flush();
      if (/[.!?]/.test(char) && result.length) result[result.length - 1].punct = true;
    }
  }
  flush();
  return result;
}
const latinGP = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split("\n").map((line) => line.trim())
  .filter((line) => /^[0-9A-S]+$/.test(line)).map((s) => s.length);
const oldEnglishGP = JSON.parse(
  read("resources/control/beowulf_oe_gp_profile_corrected.json"))
  .allSourceGpWordLengths;
const src = [
  {name: "Vulgate GP", lengths: latinGP},
  {name: "Beowulf GP", lengths: oldEnglishGP}
];
const proseSources = [
  {name: "Gibran", file: "resources/control/gibran_prophet_58585.txt"},
  {name: "Shakespeare", file: "resources/control/shakespeare_first300k.txt"},
  {name: "Emerson", file: "resources/control/emerson_essays_2944.txt"}
];
for (const p of proseSources) {
  p.parsed = parseEnglish(read(p.file));
  for (const register of ["raw", "gp"]) {
    src.push({
      name: p.name + " " + register,
      lengths: p.parsed.map((word) => word[register])
    });
  }
}
const result = {
  source: {runes: runeCount, words: original.length,
    periods: original.filter((w) => w.punct).length,
    chapters: new Set(chapter).size},
  original: {
    adjacency: test(original, chapter, "adjacency", 1500, 0x39889900),
    sentence: test(original, chapter, "sentence", 2000, 0x39ace310)
  },
  chapterHoldout: [],
  naturalSequenceControls: [],
  sentenceControls: []
};
assert.ok(Math.abs(result.original.adjacency.observed - 0.012156) < 0.00001);
assert.ok(Math.abs(result.original.sentence.observed - 0.001468) < 0.00001);
for (const [name, predicate] of [
  ["physical p0-39", (w) => physical(w.page) < 40],
  ["physical p40-55", (w) => physical(w.page) >= 40]
]) {
  const indices = original.map((w, i) => predicate(w) ? i : -1)
    .filter((i) => i >= 0);
  const items = indices.map((i) => original[i]);
  const groups = indices.map((i) => chapter[i]);
  result.chapterHoldout.push({
    name, adjacency: test(items, groups, "adjacency", 1500, 0x390100),
    sentence: test(items, groups, "sentence", 1000, 0x39ccc013)
  });
}
for (const s of src) {
  const z = [];
  const sg = Array(original.length).fill(0);
  for (let start = 0; start + original.length <= s.lengths.length;
       start += original.length) {
    const block = s.lengths.slice(start, start + original.length)
      .map((len) => ({len, punct: false}));
    z.push(test(block, sg, "adjacency", 200,
      0x39cc3301 ^ start).z);
  }
  assert.ok(z.length && Math.min(...z) > 2,
    "Expected independently native source order to pass: " + s.name);
  result.naturalSequenceControls.push({
    source: s.name, windows: z.length,
    minZ: Math.min(...z), medianZ: z.slice().sort((a,b) => a-b)[z.length>>1]
  });
}
for (const p of proseSources) {
  for (const register of ["raw", "gp"]) {
    const z = [];
    for (let start = 0; start + original.length <= p.parsed.length;
         start += original.length) {
      const block = p.parsed.slice(start, start + original.length)
        .map((w) => ({len: w[register], punct: w.punct}));
      const sg = Array(block.length).fill(0);
      z.push(test(block, sg, "sentence", 150, 0x39ccc013).z);
    }
    assert.ok(z.length && Math.min(...z) > 8);
    result.sentenceControls.push({
      source: p.name + " " + register, windows: z.length,
      minZ: Math.min(...z), medianZ: z.slice().sort((a,b) => a-b)[z.length>>1]
    });
  }
}
console.log(JSON.stringify(result, null, 2));
