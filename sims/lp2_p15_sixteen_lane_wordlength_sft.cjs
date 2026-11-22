"use strict";
/**
 * Original LP2 sixteen-lane complete-word word-length gate.
 * SFT: node sims/lp2_p15_sixteen_lane_wordlength_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = new Set(corpus.runes);
const text = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const words = [];
let page = 0, start = 0, length = 0, runeCount = 0;
function flush() {
  if (length) words.push({len: length, page: start});
  length = 0;
}
for (const ch of text) {
  if (alphabet.has(ch)) {
    if (!length) start = page;
    length++;
    runeCount++;
  } else if (ch === "%") page++;
  else if ("-.$&§0123456789".includes(ch)) flush();
}
flush();
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(page, 54);
const physical = (n) => n >= 50 ? n + 1 : n;
const bounds = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const chapters = words.map(({page: p}) => bounds.findIndex(
  (v, i) => i + 1 < bounds.length
    && physical(p) >= v && physical(p) < bounds[i + 1]));
assert.ok(chapters.every((i) => i >= 0));
const sizes = bounds.slice(0, -1).map((_, i) =>
  chapters.filter((k) => k === i).length);
assert.deepEqual(sizes, [158, 255, 383, 437, 224, 326, 378, 669, 66]);
const original = words.map((w) => w.len);
const clip = (v) => Math.min(v, 9);
/**
 * Original same-chapter lagged word-length mutual information (nats).
 * @param {number[]} arr
 * @param {number[] | null} parts
 * @param {number} lag
 * @returns {{value:number,pairs:number}}
 */
function mi(arr, parts, lag) {
  const grid = Array.from({length: 10}, () => Array(10).fill(0));
  let pairs = 0;
  for (let i = lag; i < arr.length; i++) {
    if (parts && parts[i] !== parts[i - lag]) continue;
    grid[clip(arr[i - lag])][clip(arr[i])]++;
    pairs++;
  }
  const row = grid.map((r) => r.reduce((s, n) => s + n, 0));
  const col = Array.from({length: 10}, (_, j) =>
    grid.reduce((s, r) => s + r[j], 0));
  let value = 0;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const n = grid[i][j];
      if (n) value += n / pairs * Math.log(n * pairs / (row[i] * col[j]));
    }
  }
  return {value, pairs};
}
/**
 * Seeded Fisher-Yates, independently restricted to each source chapter.
 * @param {number[]} a
 * @param {number[]} parts
 * @param {number} seed
 * @returns {number[]}
 */
function shuffle(a, parts, seed) {
  const b = a.slice();
  let state = seed >>> 0;
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }
  for (let begin = 0; begin < b.length;) {
    let end = begin + 1;
    while (end < b.length && parts[end] === parts[begin]) end++;
    for (let i = end - 1; i > begin; i--) {
      const j = begin + Math.floor(random() * (i - begin + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    begin = end;
  }
  return b;
}
/**
 * @param {number[]} arr
 * @param {number[]} parts
 * @param {number} lag
 * @param {number} repeats
 * @returns {{observed:number,pairs:number,nullMean:number,z:number,pUpper:number}}
 */
function test(arr, parts, lag, repeats) {
  const obs = mi(arr, parts, lag);
  let total = 0, square = 0, exceed = 0;
  for (let t = 0; t < repeats; t++) {
    const v = mi(shuffle(arr, parts,
      ((t + 1) * 0x9e3779b9) ^ 0x14af37), parts, lag).value;
    total += v;
    square += v * v;
    if (v >= obs.value) exceed++;
  }
  const mean = total / repeats;
  return {observed: obs.value, pairs: obs.pairs, nullMean: mean,
    z: (obs.value - mean) / Math.sqrt(square / repeats - mean * mean),
    pUpper: (exceed + 1) / (repeats + 1)};
}
/**
 * Source-ordered words into 16 contiguous lanes per chapter;
 * output complete words rowwise across these lanes.
 * @param {number[]} source
 * @param {number[]} parts
 * @returns {number[]}
 */
function interleave(source, parts) {
  const out = [];
  for (let begin = 0; begin < source.length;) {
    let end = begin + 1;
    while (end < source.length && parts[end] === parts[begin]) end++;
    const size = end - begin, lanes = [];
    let cursor = begin;
    for (let col = 0; col < 16; col++) {
      const n = Math.floor(size / 16) + (col < size % 16 ? 1 : 0);
      lanes.push(source.slice(cursor, cursor + n));
      cursor += n;
    }
    for (let row = 0; row < Math.ceil(size / 16); row++) {
      for (let col = 0; col < 16; col++) {
        if (row < lanes[col].length) out.push(lanes[col][row]);
      }
    }
    begin = end;
  }
  return out;
}
/**
 * @param {number[]} stream
 * @param {number[]} parts
 * @returns {number[]}
 */
function deinterleave(stream, parts) {
  const out = [];
  for (let begin = 0; begin < stream.length;) {
    let end = begin + 1;
    while (end < stream.length && parts[end] === parts[begin]) end++;
    const size = end - begin;
    const counts = Array.from({length: 16}, (_, c) =>
      Math.floor(size / 16) + (c < size % 16 ? 1 : 0));
    const lanes = Array.from({length: 16}, () => []);
    let cursor = begin;
    for (let row = 0; row < Math.ceil(size / 16); row++) {
      for (let col = 0; col < 16; col++) {
        if (row < counts[col]) lanes[col].push(stream[cursor++]);
      }
    }
    for (const lane of lanes) out.push(...lane);
    begin = end;
  }
  return out;
}
const labels = ["ING", ...corpus.translit].sort((a, b) => b.length - a.length);
/** @param {string} value @returns {number} */
function gpLength(value) {
  const w = value.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  let count = 0;
  for (let i = 0; i < w.length;) {
    const hit = labels.find((label) => w.startsWith(label, i));
    assert.ok(hit, "Unknown GP transliteration: " + w);
    i += hit.length;
    count++;
  }
  return count;
}
const originalTest = test(original, chapters, 16, 1500);
assert.equal(originalTest.pairs, 2752);
assert.ok(Math.abs(originalTest.observed - 0.009399173463331) < 1e-10);
const controls = {};
for (const [name, file] of [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
]) {
  const native = (read(file).match(/[A-Za-z]+/g) || [])
    .slice(0, original.length).map((w) => gpLength(w.toUpperCase()));
  assert.equal(native.length, 2896);
  const encrypted = interleave(native, chapters);
  assert.deepEqual(deinterleave(encrypted, chapters), native);
  const lag16 = test(encrypted, chapters, 16, 350);
  assert.ok(lag16.z > 6, name + " positive signal not found");
  controls[name] = {nativeLag1: mi(native, chapters, 1).value,
    interleavedLag1: mi(encrypted, chapters, 1).value, lag16};
}
assert.ok(originalTest.z < 3 && originalTest.pUpper > 0.05);
console.log(JSON.stringify({runes: runeCount, words: words.length,
  chapterWordCounts: sizes, originalLag16: originalTest,
  globalLag16: mi(original, null, 16), controls}, null, 2));
console.log("PASS: original 16-lane invariant absent; all positive inverse controls recovered");
