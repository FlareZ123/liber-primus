#!/usr/bin/env node
"use strict";

/**
 * GP29 additive-key-step convex gate on the original LP2 p0..p55 manuscript.
 *
 * For C_i = P_i + K_i (mod29) and a source-independent key increment
 * D_i = K_i-K_(i-1), an equal ciphertext pair requires
 * D_i = -(P_i-P_(i-1)). For any unknown iid increment distribution within
 * chapter h, the conditional expected repeat count is >= the *smallest*
 * plaintext-difference histogram bin in that chapter. Sum those minima
 * across the nine original visual chapters, without searching a key.
 *
 * Only the source-native English reference class is assessed. The bound
 * is on expectation, not a universal deterministic cipher impossibility.
 *
 * Run on Windows 11 with Node.js 22:
 *   node sims/lp2_chapter_stationary_additive_convex_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const chapters = [[0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]];
const sourceFiles = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const sourceParts = transcription.split("%");
const pages = Array.from({length: 56}, (_, physicalPage) => {
  if (physicalPage === 50) return [];
  // The runeless original p50 has no transcription part of its own.
  const fragment = sourceParts[physicalPage > 50 ? physicalPage - 1 : physicalPage];
  const textWords = fragment.replace(/\/\s*/g, "")
    .match(/[\u16a0-\u16ff]+/gu) || [];
  return textWords.map(word => [...word].map(r => corpus.runes.indexOf(r)));
});
assert.equal(pages.length, 56);
for (let p = 0; p < 56; p++) {
  const original = corpus.pages[p].indices;
  assert.deepEqual(pages[p].flat(), original, "original rune match physical p" + p);
}
assert.equal(pages.flat(2).length, 12956);
assert.equal(pages.reduce((sum, page) => sum + page.length, 0), 2928);
assert.equal(pages[50].length, 0);
assert.deepEqual(chapters.map(([a,b]) => pages.slice(a,b+1)
  .reduce((sum,page) => sum + page.flat().length, 0)),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);

const tokens = corpus.translit.map((text, index) => ({text,index}))
  .sort((a,b) => b.text.length - a.text.length);
/** @param {string} input @param {string} spelling */
function encode(input, spelling) {
  let word = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/Q/g, "C");
  if (spelling === "attested") {
    word = word.replace(/ING/g, "NG").replace(/IO/g, "IA");
  }
  const result = [];
  for (let at = 0; at < word.length;) {
    const match = tokens.find(item => word.startsWith(item.text, at));
    if (!match) return null;
    result.push(match.index);
    at += match.text.length;
  }
  return result;
}
/** @param {number[][][]} data */
function diffHistograms(data) {
  const result = Array.from({length: 56}, () => new Uint32Array(29));
  for (let page = 0; page < 56; page++) {
    let previous = null;
    for (const word of data[page]) {
      for (const current of word) {
        if (previous !== null) {
          result[page][(current - previous + 29) % 29]++;
        }
        previous = current;
      }
    }
  }
  return result;
}
/** @param {Uint32Array[]} perPage */
function statistics(perPage) {
  const whole = new Uint32Array(29);
  for (const row of perPage) for (let i = 0; i < 29; i++) whole[i] += row[i];
  const perChapter = chapters.map(([lo, hi]) => {
    const row = new Uint32Array(29);
    for (let p = lo; p <= hi; p++)
      for (let i = 0; i < 29; i++) row[i] += perPage[p][i];
    return row;
  });
  return {
    comparisons: whole.reduce((sum,n) => sum+n, 0),
    repeated: whole[0],
    wholeMin: Math.min(...whole),
    chapterMin: perChapter.reduce((sum,row) => sum+Math.min(...row), 0),
    pageMin: perPage.reduce((sum,row) => sum+Math.min(...row), 0),
    chapterComparisons: perChapter.map(row => row.reduce((s,n) => s+n, 0)),
    chapterRepeats: perChapter.map(row => row[0]),
    wholeDifferences: Array.from(whole)
  };
}
const original = statistics(diffHistograms(pages));
assert.equal(original.comparisons, 12901);
assert.equal(original.repeated, 86);
assert.equal(original.wholeMin, 86);
assert.equal(original.chapterMin, 86);
assert.equal(original.pageMin, 81);
assert.deepEqual(original.chapterComparisons,
  [726,1140,1722,1895,1017,1427,1673,2995,306]);
assert.deepEqual(original.chapterRepeats, [4,6,9,10,11,13,12,18,3]);
assert.deepEqual(original.wholeDifferences,
  [86,457,503,436,435,445,430,470,425,510,497,454,443,499,470,
   468,446,401,432,472,467,460,420,485,466,466,456,472,430]);

/** @param {number} key */
function addKeyPlant(data, key) {
  return data.map(page => {
    let offset = 0;
    return page.map(word => word.map(value => {
      const cipher = (value + key*offset) % 29;
      offset++;
      return cipher;
    }));
  });
}
/** @param {number} key */
function checkNativePlant(data, key) {
  const encrypted = addKeyPlant(data, key);
  const recovered = encrypted.map(page => {
    let offset = 0;
    return page.map(word => word.map(value => {
      const result = (value - key*offset + 29*offset) % 29;
      offset++;
      return result;
    }));
  });
  assert.deepEqual(recovered, data);
  const p = diffHistograms(data), c = diffHistograms(encrypted);
  for (let page = 0; page < 56; page++)
    for (let difference = 0; difference < 29; difference++)
      assert.equal(c[page][(difference + key) % 29], p[page][difference]);
}

/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
let seed = 0x44171119;
const tests = [];
for (const spelling of ["legacy", "attested"]) {
  for (const sourceFile of sourceFiles) {
    const buckets = Array.from({length:15}, () => []);
    for (const word of read(sourceFile).match(/[A-Za-z]+/g) || []) {
      const encoded = encode(word, spelling);
      if (encoded && encoded.length < buckets.length) {
        buckets[encoded.length].push(encoded);
      }
    }
    for (const page of pages) for (const word of page)
      assert(buckets[word.length].length > 0,
        "unrepresented word length " + word.length);
    seed = 0x44171119;
    const stats = [];
    for (let trial = 0; trial < 320; trial++) {
      const drawn = pages.map(page => page.map(word => {
        const options = buckets[word.length];
        return options[random32() % options.length];
      }));
      if (trial === 0) checkNativePlant(drawn, 11);
      stats.push(statistics(diffHistograms(drawn)));
    }
    const ranges = {};
    for (const field of ["wholeMin", "chapterMin", "pageMin"]) {
      const values = stats.map(item => item[field]);
      ranges[field] = [Math.min(...values), Math.max(...values)];
    }
    tests.push({spelling,sourceFile,plants:stats.length,ranges,
      atOrBelowObservedChapterExpectation:
        stats.filter(x => x.chapterMin <= original.repeated).length});
  }
}
// Frozen original-input and independently native-reference regression values.
const expected = [
  [[164,242],[159,219],[86,125]],
  [[154,224],[146,204],[78,118]],
  [[177,243],[161,222],[88,123]],
  [[172,248],[157,225],[85,124]],
  [[149,225],[139,201],[77,115]],
  [[175,244],[160,215],[85,127]]
];
for (let i = 0; i < tests.length; i++) {
  assert.deepEqual(Object.values(tests[i].ranges), expected[i]);
  assert.equal(tests[i].atOrBelowObservedChapterExpectation, 0);
}
const minNativeChapterMean = Math.min(
  ...tests.map(t => t.ranges.chapterMin[0]));
assert.equal(minNativeChapterMean, 139);
// The iid increment hypothesis makes pair-equality indicators independent
// conditional on fixed plaintext. Poisson-binomial Chernoff bound for S<=86.
const conditionalTailBound = Math.exp(
  -(minNativeChapterMean-original.repeated +
    original.repeated*Math.log(original.repeated/minNativeChapterMean)));
assert(Math.abs(conditionalTailBound-8.218611926357557e-6) < 1e-13);
console.log(JSON.stringify({
  classification: "conditional original-cipher expected-count exclusion for independent chapter-stationary GP29 additive key increments over tested native-English controls",
  input: {physicalPages:56, runeBearingPages:55, localSegments:2928,
    runes:12956, chapters:chapters.map(([from,to]) => "p"+from+"–"+to)},
  original,
  controlSummary: tests,
  nativeOriginalShapedControls: tests.reduce((sum,t) => sum+t.plants,0),
  minimumChapterwiseNativeExpectedRepeatCount: minNativeChapterMean,
  originalObservedEqualPairs: original.repeated,
  iidIncrementConditionalChernoffUpperBound: conditionalTailBound,
  pageResetCounterexample:
    "At page resets some native control minima are <=86; page-specific key-step distributions are not excluded.",
  limitations:
    "Finite matched English control class; the lower bound concerns expected count under iid plaintext-independent key increments. No secret key, actual unknown plaintext, or author-selected opcode is identified."
},null,2));
console.log("SFT PASS");
