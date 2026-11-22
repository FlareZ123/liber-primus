"use strict";

/**
 * Independent GP-native English word-shape calibration of the original LP2
 * five-back return tally. Original source geometry is fixed; no ciphertext
 * parameters or plaintext words are fitted.
 *
 * Reproduce on Windows Node.js 22:
 *   node sims/lp2_lag5_native_wordshape_baseline_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8")
  .replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const sourceFiles = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const gpTokens = corpus.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);
const runeRegex = new RegExp("[" + corpus.runes.join("") + "]+", "gu");

/** @param {string} word @returns {number[]} */
function encodeGP(word) {
  const clean = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (clean.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const token = gpTokens.find(item => clean.startsWith(item.text, i));
      assert(token, "unmapped original spelling: " + word);
      out.push(token.index);
      i += token.text.length;
    }
  }
  return out;
}

/** @param {readonly number[]} word */
function fivebackHits(word) {
  let hits = 0;
  for (let j = 5; j < word.length; j++) {
    if (word[j] === word[j - 5]) hits++;
  }
  return hits;
}

// Source page breaks and original slash-line wraps are not printed-word breaks.
// Physical page 50 is runeless. The first 55 '%' segments correspond to
// the 55 rune-bearing unknown pages, in chronological physical page order.
const unknownSegments = transcript.split(/^\s*%\s*$/m).slice(0, 55);
assert.equal(unknownSegments.length, 55);
const originalText = unknownSegments.join("")
  .replace(/\/\n/g, "").replace(/\n/g, "");
const originalWords = (originalText.match(runeRegex) || [])
  .map(word => Array.from(word, glyph => runeToIndex.get(glyph)));
assert.equal(originalWords.length, 2896);
const originalTape = originalWords.flat();
const canonicalTape = corpus.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
assert.equal(originalTape.length, 12956);
assert.deepEqual(originalTape, canonicalTape);
assert.deepEqual(encodeGP("FOLLOWING"), [0, 3, 15, 15, 3, 7, 21]);
assert.deepEqual(encodeGP("FUNCTION"), [0, 1, 12, 5, 9, 27, 12]);

const originalByLength = new Map();
let observedReturns = 0, eligible = 0, wordsWithTwo = 0, wordsWithThree = 0;
for (const word of originalWords) {
  const hit = fivebackHits(word);
  originalByLength.set(word.length, (originalByLength.get(word.length) || 0) + 1);
  observedReturns += hit;
  eligible += Math.max(0, word.length - 5);
  if (hit >= 2) wordsWithTwo++;
  if (hit >= 3) wordsWithThree++;
}
assert.equal(eligible, 2105);
assert.equal(observedReturns, 104);
assert.equal(wordsWithTwo, 9);
assert.equal(wordsWithThree, 2);
assert.equal(originalWords[2722].map(i => corpus.runes[i]).join(""),
  "ᛋᛞᛝᚷᛚᛋᛞᛝ");

/**
 * Exact moments for independently sampled real GP-encoded reference words,
 * one for every original word slot, conditional on the original rune length.
 * No ciphertext-fit parameters or pseudo-random draws are involved.
 *
 * @param {string} sourceFile
 */
function referenceMoments(sourceFile) {
  const pools = new Map();
  const sourceWords = read(sourceFile).match(/[A-Za-z]+/g) || [];
  for (const plaintext of sourceWords) {
    const word = encodeGP(plaintext), length = word.length;
    let bucket = pools.get(length);
    if (!bucket) {
      bucket = {count: 0, sum: 0, sumSq: 0, atLeastTwo: 0, atLeastThree: 0};
      pools.set(length, bucket);
    }
    const k = fivebackHits(word);
    bucket.count++;
    bucket.sum += k;
    bucket.sumSq += k * k;
    bucket.atLeastTwo += Number(k >= 2);
    bucket.atLeastThree += Number(k >= 3);
  }
  let mean = 0, variance = 0, expectedWordsWithTwo = 0;
  let expectedWordsWithThree = 0;
  for (const [length, n] of originalByLength) {
    const b = pools.get(length);
    assert(b && b.count, "missing GP word length: " + length);
    const mu = b.sum / b.count;
    mean += n * mu;
    variance += n * (b.sumSq / b.count - mu * mu);
    expectedWordsWithTwo += n * b.atLeastTwo / b.count;
    expectedWordsWithThree += n * b.atLeastThree / b.count;
  }
  const sd = Math.sqrt(variance);
  return {
    source: sourceFile,
    sourceTokens: sourceWords.length,
    expectedReturns: mean,
    standardDeviation: sd,
    zObservedMinusExpected: (observedReturns - mean) / sd,
    expectedWordsWithTwo,
    expectedWordsWithThree
  };
}

const references = sourceFiles.map(referenceMoments);
assert(Math.abs(references[0].expectedReturns - 121.7695812226705) < 1e-6);
assert(Math.abs(references[1].expectedReturns - 122.80818291463416) < 1e-6);
assert(Math.abs(references[2].expectedReturns - 130.09744644088047) < 1e-6);
console.log(JSON.stringify({
  original: {
    words: originalWords.length,
    runes: originalTape.length,
    fivebackOpportunities: eligible,
    fivebackReturns: observedReturns,
    wordsWithAtLeastTwoReturns: wordsWithTwo,
    wordsWithAtLeastThreeReturns: wordsWithThree
  },
  references
}, null, 2));
