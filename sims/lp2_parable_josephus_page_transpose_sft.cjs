"use strict";

/**
 * #835: freeze the original PARABLE 55-step Josephus removal as a page-order
 * permutation, then test original GP29 text without adding a letter cipher.
 * Reads original resources only. Node.js 22, CommonJS, no dependencies.
 * Reproduce: node sims/lp2_parable_josephus_page_transpose_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const sourceProse = read("resources/control/gibran_prophet_58585.txt");
const parts = transcription.split("%");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeSet = new Set(corpus.runes);
const N = 12956;
const pageIds = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.page);
assert.equal(pageIds.length, 55);
assert.equal(corpus.pages[50].indices.length, 0);

const sizes = new Map();
const originalPages = new Map();
for (let i = 0; i < pageIds.length; i++) {
  const page = pageIds[i];
  const source = parts[i].replace(/\/\s*/g, "").replace(/\s/g, "");
  const characters = source.match(/[\u16A0-\u16FF]/gu) || [];
  assert.deepEqual(characters.map(r => runeToIndex.get(r)),
    corpus.pages[page].indices);
  originalPages.set(page, source);
  sizes.set(page, characters.length);
}
assert.equal([...sizes.values()].reduce((a, b) => a + b, 0), N);

// Derive the page order from the solved original p57 text, never from p0-55.
const p57 = parts[56].replace(/\/\s*/g, "").replace(/\s/g, "");
const parableWords = p57.match(/[\u16A0-\u16FF]+/gu) || [];
assert.equal(parableWords.length, 20);
assert.deepEqual([...parableWords.join("")].map(r => runeToIndex.get(r)),
  corpus.pages[57].indices);
const interiorRunes = parableWords.flatMap(w => [...w].slice(1, -1));
assert.equal(interiorRunes.length, 55);
const steps = interiorRunes.map(r => corpus.prime[runeToIndex.get(r)] - 1);
const remaining = Array.from({length: 56}, (_, i) => i);
const elimination = [];
let cursor = 0;
for (const step of steps) {
  cursor = (cursor + step - 1) % remaining.length;
  elimination.push(remaining.splice(cursor, 1)[0]);
}
assert.deepEqual(remaining, [50]);
assert.deepEqual(elimination.slice(0, 10), [39,49,35,43,8,40,54,27,31,46]);
assert.equal(new Set(elimination).size, 55);
assert.deepEqual([...elimination].sort((a,b) => a-b), pageIds);

// An exact inverse page permutation is available regardless of word breaks.
/** @param {Map<number,string>} pages @param {number[]} order */
function join(pages, order) {
  return order.map(page => pages.get(page)).join("");
}
/** @param {string} text @returns {number[]} */
function lengths(text) {
  return (text.match(/[\u16A0-\u16FF]+/gu) || []).map(w => w.length);
}
/** @param {number[]} values @returns {number} */
function mutualInformation(values) {
  const hist = new Float64Array(100);
  const row = new Float64Array(10), col = new Float64Array(10);
  const n = values.length - 1;
  for (let i = 1; i < values.length; i++) {
    const a = Math.min(9, values[i - 1]) - 1;
    const b = Math.min(9, values[i]) - 1;
    hist[a * 10 + b]++; row[a]++; col[b]++;
  }
  let total = 0;
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) {
    const count = hist[a * 10 + b];
    if (count) total += count / n *
      Math.log(count * n / (row[a] * col[b]));
  }
  return total;
}
/** @param {string} text @returns {number} */
function ioc(text) {
  const hist = new Uint32Array(29);
  let n = 0;
  for (const ch of text) {
    const index = runeToIndex.get(ch);
    if (index !== undefined) { hist[index]++; n++; }
  }
  return hist.reduce((s, v) => s + v * (v - 1), 0) / (n * (n - 1));
}
/** @param {Map<number,string>} pages @param {number[]} order */
function carries(pages, order) {
  let count = 0;
  for (let i = 1; i < order.length; i++) {
    const previous = pages.get(order[i - 1]);
    const next = pages.get(order[i]);
    if (runeSet.has(previous.at(-1)) && runeSet.has(next[0])) count++;
  }
  return count;
}
const original = join(originalPages, pageIds);
const transposed = join(originalPages, elimination);
const oldWords = lengths(original), newWords = lengths(transposed);
assert.equal(oldWords.length, 2896);
assert.equal(newWords.length, 2897);
assert.equal(carries(originalPages, pageIds), 32);
assert.equal(carries(originalPages, elimination), 31);
assert.deepEqual([...original].filter(x => runeSet.has(x)).sort(),
  [...transposed].filter(x => runeSet.has(x)).sort());
assert.equal(ioc(original), ioc(transposed));
assert.ok(Math.abs(ioc(original) - 0.03447839786450569) < 1e-12);

// Native GP prose with the same *exact 55 original rune/page counts*,
// scattered to the physical order then recovered without parameter fitting.
const labels = corpus.translit.map((label, i) => [label, corpus.runes[i]])
  .sort((a,b) => b[0].length - a[0].length);
let native = "", nativeCount = 0;
for (let word of sourceProse.toUpperCase().match(/[A-Z]+/g) || []) {
  word = word.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  let converted = "";
  for (let i = 0; i < word.length;) {
    const hit = labels.find(([label]) => word.startsWith(label, i));
    if (hit) { converted += hit[1]; i += hit[0].length; } else { i++; }
  }
  if (!converted) continue;
  native += (native ? "-" : "") + converted;
  nativeCount += converted.length;
  if (nativeCount >= N) break;
}
native = native.slice(0, native.length - (nativeCount - N));
assert.equal([...native].filter(x => runeSet.has(x)).length, N);
const scattered = new Map();
let offset = 0;
for (const page of elimination) {
  let left = sizes.get(page);
  const start = offset;
  while (left > 0) {
    assert.ok(offset < native.length);
    if (runeSet.has(native[offset])) left--;
    offset++;
  }
  scattered.set(page, native.slice(start, offset));
}
assert.equal(offset, native.length);
assert.equal(join(scattered, elimination), native);
assert.equal(ioc(join(scattered, pageIds)), ioc(native));

// Exact proposed ordering is fixed. Null perturbs page order only, retaining
// original printed page bytes, chapter marks and within-page word strings.
let seed = 0x03301835;
function random() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
}
const draws = 2000;
const values = [];
for (let s = 0; s < draws; s++) {
  const randomized = pageIds.slice();
  for (let i = randomized.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
  }
  values.push(mutualInformation(lengths(join(originalPages, randomized))));
}
const mean = values.reduce((s, x) => s + x, 0) / draws;
const sd = Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0)
  / (draws - 1));
const observedMI = mutualInformation(newWords);
assert.ok(Math.abs(observedMI - 0.011904614634337432) < 1e-12);
assert.ok(Math.abs(mean - 0.011713151194326673) < 1e-12);
assert.ok(Math.abs(sd - 0.0006472027730648106) < 1e-12);
assert.ok(Math.abs(mutualInformation(lengths(native)) - 0.05221841797143233)
  < 1e-12);
console.log(JSON.stringify({
  decision: "NO ORIGINAL PLAINTEXT FROM PURE JOSEPHUS PAGE TRANSPOSITION",
  originalSource: {runes: N, printedWords: oldWords.length,
    crossPageCarries: carries(originalPages, pageIds),
    adjacentLengthMI: mutualInformation(oldWords), indexOfCoincidence: ioc(original)},
  exactOriginalPermutation: {
    survivor: 50, removedPages: elimination,
    firstPrintedPageToRead: elimination[0], printedWords: newWords.length,
    crossPageCarries: carries(originalPages, elimination),
    adjacentLengthMI: observedMI, indexOfCoincidence: ioc(transposed)
  },
  randomPageOrderNull: {draws, seed: "0x03301835", mean, sd,
    z: (observedMI - mean) / sd,
    fractionAtLeastObserved: values.filter(v => v >= observedMI).length / draws},
  independentNativePlant: {
    origin: "Gibran source GP29 normalized in same source-page rune counts",
    exactNativeTextRecovered: join(scattered, elimination) === native,
    nativeWords: lengths(native).length,
    nativeMI: mutualInformation(lengths(native)),
    physicalScatteredMI: mutualInformation(lengths(join(scattered, pageIds))),
    nativeIoC: ioc(native),
    physicalScatteredIoC: ioc(join(scattered, pageIds))
  },
  limitation: "A page permutation cannot change rune unigrams or internal page text; a second author-selected symbol inverse and key would still be required."
}, null, 2));
