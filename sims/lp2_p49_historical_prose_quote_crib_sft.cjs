"use strict";

/**
 * Exact source-native GP29 word-length crib gate for the two complete,
 * punctuation-bounded original LP2 sentences flanking the p49-51 table.
 *
 * This searches independently available contemporary 2013 Book of the Law,
 * the repository's full held control prose and a synthetic planted positive.
 * It does not propose an arbitrary cipher or guess unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

/** @param {string} source @returns {number} */
function gpLength(source) {
  return source.toUpperCase().replace(/ING|TH|NG|EO|OE|AE|EA|IA|IO/g, "*")
    .replace(/[^A-Z*]/g, "").length;
}

/** @param {string} source @returns {string[]} */
const englishWords = source => [...source.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g)]
  .map(match => match[0]);

/**
 * @param {number[]} target
 * @param {number[]} source
 * @returns {{distance:number, wordOffset:number}}
 */
function nearest(target, source) {
  let distance = Infinity;
  let wordOffset = -1;
  for (let i = 0; i <= source.length - target.length; i++) {
    let delta = 0;
    for (let j = 0; j < target.length; j++) {
      delta += Math.abs(target[j] - source[i + j]);
      if (delta >= distance) break;
    }
    if (delta < distance) {
      distance = delta;
      wordOffset = i;
    }
  }
  return { distance, wordOffset };
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const pages = transcription.split(/^%$/m);
assert.equal(pages.length, 57);
const runeSet = new Set(corpus.runes);
/** @param {string} s @returns {number[]} */
const nums = s => [...s].filter(ch => runeSet.has(ch)).map(ch => corpus.runes.indexOf(ch));
/** @param {number} p @returns {string} */
const page = p => pages[p < 50 ? p : p - 1].replace(/[\/\r\n]/g, "");
/** @param {string} s @returns {number[]} */
const sourceWords = s => s.split(/[-.&$§]/g).map(bit => nums(bit).length).filter(Boolean);

for (const originalPage of corpus.pages) {
  if (originalPage.page === 50) assert.equal(originalPage.indices.length, 0);
  else assert.deepEqual(nums(page(originalPage.page)), originalPage.indices);
}
const p48 = page(48), p49 = page(49), p51 = page(51), p52 = page(52);
const targetTexts = [
  p48.slice(p48.lastIndexOf(".") + 1) + p49.slice(0, p49.lastIndexOf(".") + 1),
  p51 + p52.slice(0, p52.indexOf(".") + 1)
];
const targets = targetTexts.map(sourceWords);
assert.deepEqual(targets.map(x => x.length), [33, 40]);
assert.deepEqual(targetTexts.map(x => nums(x).length), [138, 170]);

const proseSources = [
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const expected = [
  [1896, 41, 1216, 63, 429],
  [1967, 42, 822, 63, 213],
  [1998, 40, 300, 63, 1199],
  [54189, 34, 10366, 50, 21481],
  [15726, 36, 7529, 52, 9677],
  [77773, 36, 51021, 53, 51620]
];
const results = [];
for (let i = 0; i < proseSources.length; i++) {
  const words = englishWords(read(proseSources[i]));
  const indices = words.map(gpLength);
  const before = nearest(targets[0], indices);
  const after = nearest(targets[1], indices);
  assert.deepEqual([indices.length, before.distance, before.wordOffset,
    after.distance, after.wordOffset], expected[i]);
  assert(before.distance > 0 && after.distance > 0);
  results.push({ source: proseSources[i], availableWords: indices.length, before, after });
}

// Planted contiguous quote from the source register is necessarily recovered;
// the detector is capable of detecting the real quotation pattern if present.
const plant = englishWords(read(proseSources[0])).map(gpLength);
const synthetic = plant.slice(400, 440);
assert.equal(synthetic.length, 40);
assert.deepEqual(nearest(synthetic, plant), { distance: 0, wordOffset: 400 });
console.log(JSON.stringify({
  original: { sentenceWordCounts: [33, 40], sentenceRuneCounts: [138, 170] },
  gpEncoding: "source-native greedy ING,TH,NG,EO,OE,AE,EA,IA,IO single-runes",
  result: "NO EXACT HISTORICAL PROSE QUOTE IN SIX FIXED CORPORA",
  nearest: results,
  plantedPositive: { recoveredAt: 400, matched: 40 }
}, null, 2));
