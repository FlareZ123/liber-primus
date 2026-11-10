"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parsed = parseSharedCorpus();
const lpWords = parsed.words.map(({runes}) => [...runes].map((rune) => {
  assert.ok(runeIndex.has(rune), "unmapped original rune");
  return runeIndex.get(rune);
}));

assert.equal(lpWords.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(corpus.translit.length, 29);
assert.equal(lpWords[1462].map((x) => corpus.translit[x]).join(""), "DJU");
assert.equal(lpWords[1463].map((x) => corpus.translit[x]).join(""), "BEI");
assert.equal(lpWords[2894].map((x) => corpus.translit[x]).join(""), "DJU");
assert.equal(lpWords[2895].map((x) => corpus.translit[x]).join(""), "BEI");
assert.equal(2894 - 1462, 8 * 179);
assert.equal(1462 % 179, 30);
assert.equal(2894 % 179, 30);
assert.equal(corpus.pages[53].indices.length, 179);

const gpTokens = corpus.translit
  .map((label, index) => ({label, index}))
  .sort((a, b) => b.label.length - a.label.length);

function encodeEnglishWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/Q/g, "C")
    .replace(/[^A-Z]/g, "");
  const encoded = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find(({label}) => normalized.startsWith(label, offset));
    assert.ok(token, "unmapped normalized English text: " + normalized.slice(offset));
    encoded.push(token.index);
    offset += token.label.length;
  }
  return encoded;
}

function encodeEnglishWords(text) {
  const rawWords = text.toUpperCase().match(/[A-Z]+/g) || [];
  return rawWords.map(encodeEnglishWord);
}

function popcount(value) {
  let count = 0;
  value >>>= 0;
  while (value) {
    value &= value - 1;
    count++;
  }
  return count;
}

function phaseStats(words) {
  const masks = words.map((word) => {
    let mask = 0;
    for (const symbol of word) mask |= (1 << symbol);
    return mask;
  });

  let phasePairCount = 0;
  let phaseSharedSymbolSum = 0;
  let phaseZeroOverlapPairs = 0;
  let phaseEqualLengthPairs = 0;
  let phaseSamePositionEqualities = 0;
  let lag179EqualLengthPairs = 0;
  let lag179SamePositionEqualities = 0;

  for (let phase = 0; phase < 179; phase++) {
    const indices = [];
    for (let index = phase; index < words.length; index += 179) indices.push(index);

    for (let a = 0; a < indices.length; a++) {
      for (let b = a + 1; b < indices.length; b++) {
        const left = indices[a];
        const right = indices[b];
        const shared = popcount(masks[left] & masks[right]);
        phasePairCount++;
        phaseSharedSymbolSum += shared;
        if (shared === 0) phaseZeroOverlapPairs++;

        if (words[left].length === words[right].length) {
          phaseEqualLengthPairs++;
          for (let position = 0; position < words[left].length; position++) {
            if (words[left][position] === words[right][position]) {
              phaseSamePositionEqualities++;
            }
          }
        }
      }
    }
  }

  for (let index = 0; index + 179 < words.length; index++) {
    const left = words[index];
    const right = words[index + 179];
    if (left.length !== right.length) continue;
    lag179EqualLengthPairs++;
    for (let position = 0; position < left.length; position++) {
      if (left[position] === right[position]) lag179SamePositionEqualities++;
    }
  }

  return {
    phasePairCount,
    phaseSharedSymbolSum,
    phaseZeroOverlapPairs,
    phaseEqualLengthPairs,
    phaseSamePositionEqualities,
    lag179EqualLengthPairs,
    lag179SamePositionEqualities
  };
}

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function lengthBuckets(words) {
  const buckets = new Map();
  for (const word of words) {
    if (!buckets.has(word.length)) buckets.set(word.length, []);
    buckets.get(word.length).push(word);
  }
  return buckets;
}

function sampleLengthMatched(lengths, buckets, random) {
  return lengths.map((length) => {
    const bucket = buckets.get(length);
    assert.ok(bucket && bucket.length, "reference has no words of GP length " + length);
    return bucket[random() % bucket.length];
  });
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0],
    q01: sorted[Math.floor(sorted.length * 0.01)],
    q05: sorted[Math.floor(sorted.length * 0.05)],
    median: sorted[Math.floor(sorted.length * 0.50)],
    q95: sorted[Math.floor(sorted.length * 0.95)],
    max: sorted[sorted.length - 1]
  };
}

// A source-native planted permutation checks that the key-free invariants are
// implemented correctly. It does not claim to decrypt the original.
function randomPermutation(random) {
  const permutation = Array.from({length: 29}, (_, index) => index);
  for (let index = permutation.length - 1; index > 0; index--) {
    const other = random() % (index + 1);
    [permutation[index], permutation[other]] =
      [permutation[other], permutation[index]];
  }
  return permutation;
}

const originalStats = phaseStats(lpWords);
assert.equal(originalStats.phasePairCount, 21992);
assert.equal(originalStats.phaseSharedSymbolSum, 13377);
assert.equal(originalStats.phaseZeroOverlapPairs, 11960);
assert.equal(originalStats.phaseEqualLengthPairs, 3160);
assert.equal(originalStats.phaseSamePositionEqualities, 398);
assert.equal(originalStats.lag179EqualLengthPairs, 427);
assert.equal(originalStats.lag179SamePositionEqualities, 50);

const sourceControls = [
  ["Shakespeare", "shakespeare_first300k.txt", 0x179c0de],
  ["Gibran", "gibran_prophet_58585.txt", 0x179c0df],
  ["Emerson", "emerson_essays_2944.txt", 0x179c0e0]
];
const lengths = lpWords.map((word) => word.length);
const controls = [];

for (const [name, filename, seed] of sourceControls) {
  const text = fs.readFileSync(path.join(ROOT, "resources", "control", filename), "utf8");
  const words = encodeEnglishWords(text);
  const buckets = lengthBuckets(words);
  const missingLengths = [...new Set(lengths.filter((length) => !buckets.has(length)))];
  assert.deepEqual(missingLengths, []);

  const random = makeRng(seed);
  const samples = [];
  for (let sample = 0; sample < 500; sample++) {
    const matched = sampleLengthMatched(lengths, buckets, random);
    samples.push(phaseStats(matched));
  }

  const metrics = Object.keys(originalStats);
  const summary = {name, referenceWordCount: words.length, sampleCount: samples.length};
  for (const metric of metrics) {
    summary[metric] = {
      ...summarize(samples.map((sample) => sample[metric])),
      controlsAtOrBelowOriginal: samples.filter(
        (sample) => sample[metric] <= originalStats[metric]).length
    };
  }
  controls.push(summary);
}

// Positive control: one bijection per word phase preserves both invariants.
const plantRandom = makeRng(0x50a7c0de);
const plantPlaintext = sampleLengthMatched(
  lengths, lengthBuckets(encodeEnglishWords(fs.readFileSync(
    path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8"))),
  plantRandom);
const plantBefore = phaseStats(plantPlaintext);
const phaseKeys = Array.from({length: 179}, () => randomPermutation(plantRandom));
const phasePlant = plantPlaintext.map((word, index) =>
  word.map((symbol) => phaseKeys[index % 179][symbol]));
const phaseAfter = phaseStats(phasePlant);
assert.deepEqual(phaseAfter, plantBefore);

// Stronger positive control: one bijection per phase AND within-word position
// preserves corresponding-position equality, including all lag-179 pairs.
const maxWordLength = Math.max(...plantPlaintext.map((word) => word.length));
const positionKeys = Array.from({length: 179}, () =>
  Array.from({length: maxWordLength}, () => randomPermutation(plantRandom)));
const positionPlant = plantPlaintext.map((word, index) =>
  word.map((symbol, position) =>
    positionKeys[index % 179][position][symbol]));
const positionAfter = phaseStats(positionPlant);
assert.equal(positionAfter.phaseEqualLengthPairs, plantBefore.phaseEqualLengthPairs);
assert.equal(positionAfter.phaseSamePositionEqualities, plantBefore.phaseSamePositionEqualities);
assert.equal(positionAfter.lag179EqualLengthPairs, plantBefore.lag179EqualLengthPairs);
assert.equal(positionAfter.lag179SamePositionEqualities, plantBefore.lag179SamePositionEqualities);

const output = {
  model: "fixed 179-word phase permutation; stronger phase × within-word-position permutation",
  source: {
    wordCount: lpWords.length,
    runeCount: parsed.runeCount,
    repeatedBookendWordStarts: [1462, 2894],
    bookendWordGap: 1432,
    phaseOfBothFirstWords: 30,
    p53RuneCount: corpus.pages[53].indices.length,
    gridWidth: 8
  },
  original: originalStats,
  controls,
  plantedControls: {
    phaseWidePermutationPreservesAllStats: true,
    phaseAndPositionPermutationPreservesPositionEqualityStats: true
  },
  scope: [
    "The 179-word clock is retrospective, not an authenticated cipher instruction.",
    "The tests assume canonical ciphertext word boundaries are plaintext word boundaries.",
    "The tests assume native English represented in the 29-symbol GP alphabet.",
    "The exclusions cover fixed bijections per phase, and per phase plus within-word position; evolving state, non-bijective channels and other registers are not tested."
  ]
};

console.log(JSON.stringify(output, null, 2));
