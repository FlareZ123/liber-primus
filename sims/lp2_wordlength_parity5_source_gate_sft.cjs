"use strict";
/**
 * Frozen five-bit parity word-length second-channel test, Director #891.
 * Run from repository root: node sims/lp2_wordlength_parity5_source_gate_sft.cjs
 *
 * The original 2013 BASE29 and 2016 "words"/"numbers" clues motivate
 * testing five bits for 29 runes, but do not authenticate parity as a bit.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const boundaries = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const words = [];
const pageRunes = Array.from({length: 58}, () => []);
let srcPage = 0;
let wordStart = 0;
let wordLength = 0;
/** @param {boolean} stop */
function finish(stop) {
  if (!wordLength) return;
  words.push({len: wordLength, physical: wordStart >= 50 ? wordStart + 1 : wordStart,
    stop});
  wordLength = 0;
}
for (const c of text) {
  if (index.has(c)) {
    if (!wordLength) wordStart = srcPage;
    wordLength++;
    const phys = srcPage >= 50 ? srcPage + 1 : srcPage;
    pageRunes[phys].push(index.get(c));
  } else if (c === "%") {
    srcPage++;
  } else if ("-.$&§0123456789".includes(c)) {
    finish(c === ".");
  }
}
finish(false);
assert.equal(srcPage, 56);
for (const page of corpus.pages) {
  assert.deepEqual(pageRunes[page.page], page.indices,
    "Source transcription disagrees with source corpus at physical page " +
    page.page);
}
const unknown = words.filter((w) => w.physical <= 55);
assert.equal(unknown.length, 2896);
assert.equal(unknown.filter((w) => w.stop).length, 175);
assert.equal(unknown.reduce((s, w) => s + w.len, 0), 12956);

/** @param {{len:number, physical:number, stop:boolean}} w @returns {number} */
function chapter(w) {
  return boundaries.findIndex((start, i) => i < 9 &&
    w.physical >= start && w.physical < boundaries[i + 1]);
}
const chapters = Array.from({length: 9}, () => []);
for (const w of unknown) chapters[chapter(w)].push(w);

/**
 * Frozen grammar. Runes/word contents and line wraps are ignored. Each
 * original sentence stop and each of the nine visual chapter starts resets
 * the five-bit clock. Paragraph marks are ordinary word separators only.
 * Every word length, including 9–14, contributes its parity bit unchanged.
 *
 * @param {{len:number, stop:boolean}[]} sequence
 * @returns {{codes:number[], discarded:number, invalid:number, longest:number, ioc:number}}
 */
function decode(sequence) {
  let b = 0, bits = 0, discarded = 0;
  const codes = [];
  for (const w of sequence) {
    b = (b << 1) | (w.len & 1);
    bits++;
    if (bits === 5) {
      codes.push(b);
      b = 0;
      bits = 0;
    }
    if (w.stop) {
      discarded += bits;
      bits = 0;
      b = 0;
    }
  }
  discarded += bits;
  const good = codes.filter((x) => x < 29);
  const count = Array(29).fill(0);
  for (const x of good) count[x]++;
  const pairs = good.length * (good.length - 1);
  const ioc = pairs ? count.reduce((s, x) => s + x * (x - 1), 0) / pairs : 0;
  let longest = 0, run = 0;
  for (const x of codes) {
    run = x < 29 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return {codes, discarded, invalid: codes.length - good.length, longest, ioc};
}
const observed = chapters.map(decode);
assert.deepEqual(observed[0].codes, [
  15,13,9,28,7,8,7,5,3,27,24,10,19,12,18,5,19,24,17,31,0,31,
  13,26,23,11,10,4,16
]);
assert.deepEqual(observed[1].codes, [
  14,6,9,25,11,26,19,21,11,16,4,22,7,24,17,5,28,15,24,26,13,
  13,12,16,27,5,10,14,31,3,28,22,17,11,5,13,14,16,6,23,2,3,16
]);
assert.equal(observed.reduce((s, v) => s + v.codes.length, 0), 506);
assert.equal(observed.reduce((s, v) => s + v.invalid, 0), 33);

/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const x of arr) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (arr.length * (arr.length - 1));
}
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p57.length, 95);
const solved = [56, 57].map((p) => decode(words.filter((w) => w.physical === p)));
assert.deepEqual(solved.map((x) => x.codes), [[5, 0, 25], [2, 3, 3]]);
// Exact positive packing control using 20 unmodified known GP indices from p57.
const plant = [];
for (const rune of p57.slice(0, 20)) {
  for (let shift = 4; shift >= 0; shift--) {
    plant.push({len: (rune >> shift) & 1 ? 3 : 2, stop: false});
  }
}
assert.deepEqual(decode(plant).codes, p57.slice(0, 20));

let seed = 0x3301891;
/** @returns {number} */
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/**
 * @param {number[]} values
 * @returns {{mean:number, lower:number, upper:number}}
 */
function summary(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    mean: values.reduce((s, x) => s + x, 0) / values.length,
    lower: sorted[Math.floor(0.025 * values.length)],
    upper: sorted[Math.floor(0.975 * values.length)]
  };
}
// Fully deterministic, chapter-local word-length shuffles. Retain the original
// punctuation boundaries, corpus length histogram, and each printed word slot.
const trials = 3000;
const nulls = Array.from({length: 2}, () => ({invalid:[], longest:[], ioc:[]}));
for (let trial = 0; trial < trials; trial++) {
  for (let j = 0; j < 2; j++) {
    const orig = chapters[j];
    const lengths = orig.map((w) => w.len);
    for (let k = lengths.length - 1; k > 0; k--) {
      const at = next() % (k + 1);
      [lengths[at], lengths[k]] = [lengths[k], lengths[at]];
    }
    const sample = decode(orig.map((w, k) => ({len: lengths[k], stop: w.stop})));
    nulls[j].invalid.push(sample.invalid);
    nulls[j].longest.push(sample.longest);
    nulls[j].ioc.push(sample.ioc);
  }
}
console.log("PARITY5 SOURCE GATE / Director #891");
console.log("Original unknown: words=" + unknown.length + " runes=12956, chapters=9");
console.log("Frozen grammar: odd=1 even=0, five bits MSB-first, GP29 0..28, 29..31 invalid");
console.log("Solved control: p56=" + solved[0].codes.join(",") +
  " p57=" + solved[1].codes.join(",") + " p57 native IoC=" + ioc(p57));
console.log("Synthetic first 20 solved p57 rune values recover exactly: PASS");
for (let j = 0; j < 2; j++) {
  const v = observed[j];
  const render = v.codes.map((x) => corpus.translit[x] || "INVALID").join(" ");
  console.log("Chapter " + j + " pp" + boundaries[j] + "-" +
    (boundaries[j + 1] - 1) + ": words=" + chapters[j].length +
    " five-bit groups=" + v.codes.length + " invalid=" + v.invalid +
    " discarded=" + v.discarded + " longest valid=" + v.longest +
    " IoC(valid only)=" + v.ioc);
  console.log("   " + render);
  for (const metric of ["invalid", "longest", "ioc"]) {
    const draws = nulls[j][metric];
    const high = (1 + draws.filter((x) => x >= v[metric]).length) /
      (trials + 1);
    console.log("   null " + metric + ": " + JSON.stringify(summary(draws)) +
      " one-sided p(high)=" + high);
  }
}
console.log("All nine unsolved chapters: 506 groups, 33 invalid; no authenticated readout");
console.log("All assertions and controls: PASS");
