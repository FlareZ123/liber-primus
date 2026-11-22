"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const CORPUS = require("../resources/liber-primus/lp2-corpus.json");
const SOURCES = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/shakespeare_first300k.txt"
];

/** Return a deterministic PRNG with a fixed 32-bit state. @param {number} seed */
function generator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

const runeIndex = new Map(CORPUS.runes.map((rune, index) => [rune, index]));
const sortedGP = CORPUS.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** Greedy native-GP English spelling; contract TH/NG/EO/OE/AE/IA/EA. */
function encodeEnglish(word) {
  const normalized = word.toUpperCase().replace(/[VKZQ]/g, character =>
    ({V: "U", K: "C", Z: "S", Q: "C"})[character]);
  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    const matched = sortedGP.find(({token}) => normalized.startsWith(token, offset));
    if (!matched) return null;
    output.push(matched.index);
    offset += matched.token.length;
  }
  return output;
}

/** @param {string} sourceRelativePath */
function nativeWords(sourceRelativePath) {
  const text = fs.readFileSync(path.join(ROOT, sourceRelativePath), "utf8");
  return (text.match(/[A-Za-z]+/g) || []).map(encodeEnglish).filter(Boolean);
}

/** Exact histogram-conditioned collision invariant for one alphabet S-box per (word length, rune position). */
function collisionProfile(words) {
  const counts = new Map();
  for (const word of words) {
    if (word.length < 2) continue; // Leave easier one-rune words out of the evidence.
    for (let position = 0; position < word.length; position++) {
      const key = word.length + ":" + position;
      if (!counts.has(key)) counts.set(key, new Uint32Array(29));
      counts.get(key)[word[position]]++;
    }
  }
  let numerator = 0;
  let denominator = 0;
  let keptRunes = 0;
  let keptBuckets = 0;
  for (const histogram of counts.values()) {
    const n = histogram.reduce((sum, count) => sum + count, 0);
    if (n < 20) continue; // Discard all underpowered strata.
    keptBuckets++;
    keptRunes += n;
    denominator += n * (n - 1);
    numerator += histogram.reduce((sum, count) => sum + count * (count - 1), 0);
  }
  return {numerator, denominator, keptRunes, keptBuckets,
    ratio: numerator / denominator};
}

/** Key-free invariant with an entirely independent secret alphabet on each page. */
function pageCollisionProfile(words, pageAssignment) {
  const counts = new Map();
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const page = pageAssignment[wordIndex];
    if (page < 0) continue; // Avoid all cross-page words: cipher resets unknown.
    const word = words[wordIndex];
    if (word.length < 2) continue;
    for (let position = 0; position < word.length; position++) {
      const key = page + ":" + word.length + ":" + position;
      if (!counts.has(key)) counts.set(key, new Uint32Array(29));
      counts.get(key)[word[position]]++;
    }
  }
  let numerator = 0;
  let denominator = 0;
  let keptRunes = 0;
  let keptBuckets = 0;
  let maxBucketSize = 0;
  for (const histogram of counts.values()) {
    const n = histogram.reduce((sum, count) => sum + count, 0);
    maxBucketSize = Math.max(maxBucketSize, n);
    if (n < 3) continue;
    keptBuckets++;
    keptRunes += n;
    denominator += n * (n - 1);
    numerator += histogram.reduce((sum, count) => sum + count * (count - 1), 0);
  }
  return {numerator, denominator, keptRunes, keptBuckets,
    maxBucketSize, ratio: numerator / denominator};
}

/** Four native word-level dimensions: page, phase in the p15 16-cell clock,
 * complete-word rune length and position. Secret state resets/changes freely
 * between pages; within-page 16-phase word state is stationary. */
function phase16Profile(words, pages, localOrdinals) {
  const histograms = new Map();
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const page = pages[wordIndex];
    const word = words[wordIndex];
    if (page < 0 || word.length < 2) continue;
    for (let position = 0; position < word.length; position++) {
      const key = page + ":" + (localOrdinals[wordIndex] % 16)
        + ":" + word.length + ":" + position;
      if (!histograms.has(key)) histograms.set(key, new Uint32Array(29));
      histograms.get(key)[word[position]]++;
    }
  }
  let numerator = 0, denominator = 0, keptRunes = 0, keptBuckets = 0;
  let maxBucketSize = 0;
  for (const histogram of histograms.values()) {
    const n = histogram.reduce((sum, count) => sum + count, 0);
    maxBucketSize = Math.max(maxBucketSize, n);
    if (n < 2) continue;
    keptBuckets++;
    keptRunes += n;
    denominator += n * (n - 1);
    numerator += histogram.reduce((sum, count) => sum + count * (count - 1), 0);
  }
  return {numerator, denominator, keptRunes, keptBuckets, maxBucketSize,
    ratio: numerator / denominator};
}

/** Sample only page-contained, at-least-two-rune native words for the 16-lane test. */
function nativePhase16Matched(original, pools, random, pages) {
  return original.map((word, index) => {
    if (pages[index] < 0 || word.length < 2) return word;
    const choices = pools.get(word.length);
    assert(choices && choices.length);
    return choices[Math.floor(random() * choices.length)];
  });
}

/** Sample native words with exactly the original printed word-length pattern. */
function nativeLengthMatched(original, pools, random) {
  return original.map(word => {
    const choices = pools.get(word.length);
    assert(choices && choices.length, "Missing source word length " + word.length);
    return choices[Math.floor(random() * choices.length)];
  });
}

/** Construct a keyed family containing an arbitrary bijection for every stratum. */
function secretCodec(plain, random, pageAssignment = null, localOrdinals = null) {
  const keys = new Map();
  const cipher = [];
  const inverse = [];
  for (let wordIndex = 0; wordIndex < plain.length; wordIndex++) {
    const word = plain[wordIndex];
    const encoded = [];
    const recovered = [];
    for (let position = 0; position < word.length; position++) {
      const key = (pageAssignment ? pageAssignment[wordIndex] + ":" : "")
        + (localOrdinals ? localOrdinals[wordIndex] % 16 + ":" : "")
        + word.length + ":" + position;
      if (!keys.has(key)) {
        const mapping = Array.from({length: 29}, (_, index) => index);
        for (let i = 28; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [mapping[i], mapping[j]] = [mapping[j], mapping[i]];
        }
        const undo = Array(29);
        for (let i = 0; i < 29; i++) undo[mapping[i]] = i;
        keys.set(key, {mapping, undo});
      }
      const {mapping, undo} = keys.get(key);
      const crypt = mapping[word[position]];
      encoded.push(crypt);
      recovered.push(undo[crypt]);
    }
    cipher.push(encoded);
    inverse.push(recovered);
  }
  return {cipher, inverse, keyCount: keys.size};
}

function main() {
  const transcript = fs.readFileSync(
    path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8");
  const parsed = parseLP2Words(transcript);
  const original = parsed.words.map(word =>
    Array.from(word.runes, rune => runeIndex.get(rune)));
  assert.equal(original.length, 2896);
  assert.equal(original.reduce((sum, word) => sum + word.length, 0), 12956);
  const pageAssignment = parsed.words.map(word =>
    word.startPage === word.endPage ? word.startPage : -1);
  assert.equal(pageAssignment.filter(page => page >= 0).length, 2864);
  const localPageWordCounts = new Map();
  const localOrdinals = parsed.words.map(word => {
    const n = localPageWordCounts.get(word.startPage) || 0;
    localPageWordCounts.set(word.startPage, n + 1);
    return n;
  });
  assert(original.every(word => word.every(index => Number.isInteger(index))));
  const observed = collisionProfile(original);
  assert.deepEqual(
    {numerator: observed.numerator, denominator: observed.denominator,
      keptRunes: observed.keptRunes, keptBuckets: observed.keptBuckets},
    {numerator: 155338, denominator: 4506722,
      keptRunes: 12563, keptBuckets: 65}
  );
  console.log("Original LP2: words=2896 runes=12956");
  console.log("Per-(length,position) all-secret invariant:", observed);
  const observedPage = pageCollisionProfile(original, pageAssignment);
  assert.deepEqual(
    {numerator: observedPage.numerator, denominator: observedPage.denominator,
      keptRunes: observedPage.keptRunes, keptBuckets: observedPage.keptBuckets},
    {numerator: 2840, denominator: 82188,
      keptRunes: 10936, keptBuckets: 1734}
  );
  assert.equal(observedPage.maxBucketSize, 21);
  const hypotheticalDisputedRuneErrors = 79;
  const upperPossiblePairs = observedPage.numerator +
    hypotheticalDisputedRuneErrors * 2 * (observedPage.maxBucketSize - 1);
  const worstPossibleRatio = upperPossiblePairs / observedPage.denominator;
  assert(worstPossibleRatio < 0.10405);
  console.log("Per-(page,length,position) all-secret invariant:", observedPage);
  console.log("All 79 disputed labels worst-case overbound:", JSON.stringify({
    maxBucketSize: observedPage.maxBucketSize,
    hypotheticalChangedGlyphs: hypotheticalDisputedRuneErrors,
    maxEqualPairs: upperPossiblePairs, maxCollisionRate: worstPossibleRatio
  }));

  const observedPhase16 = phase16Profile(original, pageAssignment, localOrdinals);
  assert.deepEqual({
    numerator: observedPhase16.numerator, denominator: observedPhase16.denominator,
    keptRunes: observedPhase16.keptRunes,
    keptBuckets: observedPhase16.keptBuckets, maxBucketSize: observedPhase16.maxBucketSize
  }, {numerator: 154, denominator: 3866, keptRunes: 3327,
    keptBuckets: 1577, maxBucketSize: 4});
  console.log("Independent p15 16-word-phase all-secret invariant:", observedPhase16);

  const randomLane = generator(0x16f1b);
  const random = generator(20261111);
  let totalSamples = 0;
  let controlPool;
  for (const source of SOURCES) {
    const native = nativeWords(source);
    const pools = new Map();
    for (const word of native) {
      if (!pools.has(word.length)) pools.set(word.length, []);
      pools.get(word.length).push(word);
    }
    const scores = [];
    const pageScores = [];
    const lane16Scores = [];
    for (let trial = 0; trial < 400; trial++) {
      const sampled = nativePhase16Matched(
        original, pools, randomLane, pageAssignment);
      lane16Scores.push(
        phase16Profile(sampled, pageAssignment, localOrdinals).ratio);
    }
    for (let trial = 0; trial < 400; trial++) {
      const sampled = nativeLengthMatched(original, pools, random);
      scores.push(collisionProfile(sampled).ratio);
      pageScores.push(pageCollisionProfile(sampled, pageAssignment).ratio);
    }
    scores.sort((a, b) => a - b);
    pageScores.sort((a, b) => a - b);
    lane16Scores.sort((a, b) => a - b);
    const pageMin = pageScores[0];
    const pageMean = pageScores.reduce((a, b) => a + b, 0) / pageScores.length;
    const pageAtOrBelow = pageScores.filter(score => score <= observedPage.ratio).length;
    const lane16Min = lane16Scores[0];
    const lane16Mean = lane16Scores.reduce((a, b) => a + b, 0) / lane16Scores.length;
    const lane16AtOrBelow = lane16Scores
      .filter(score => score <= observedPhase16.ratio).length;
    const minimum = scores[0];
    const maximum = scores[scores.length - 1];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const atOrBelowOriginal = scores.filter(score => score <= observed.ratio).length;
    totalSamples += scores.length;
    console.log(source + ":", JSON.stringify({
      nativeWords: native.length, trials: scores.length,
      minimum, mean, median: scores[199], maximum, atOrBelowOriginal,
      pageMin, pageMean, pageAtOrBelow,
      lane16Min, lane16Mean, lane16AtOrBelow
    }));
    assert.equal(atOrBelowOriginal, 0,
      "The all-secret exclusion did not pass the source-language control");
    assert.equal(pageAtOrBelow, 0,
      "The independently keyed page alphabets did not pass the control");
    assert.equal(lane16AtOrBelow, 0,
      "The independent 16-phase secret page alphabets did not pass the control");
    if (source === SOURCES[0]) controlPool = pools;
  }
  console.log("Matched native controls at or below original: 0/" + totalSamples);

  const plantedPlain = nativeLengthMatched(original, controlPool, random);
  const planted = secretCodec(plantedPlain, random);
  assert.deepEqual(planted.inverse, plantedPlain);
  const before = collisionProfile(plantedPlain);
  const after = collisionProfile(planted.cipher);
  assert.equal(before.numerator, after.numerator);
  assert.equal(before.denominator, after.denominator);
  assert(before.ratio > observed.ratio * 2);
  console.log("Independent global-table positive-control plant:", JSON.stringify({
    runes: plantedPlain.reduce((sum, word) => sum + word.length, 0),
    secretPermutationTables: planted.keyCount,
    plainRatio: before.ratio, ciphertextRatio: after.ratio,
    exactDecodedSymbols: plantedPlain.reduce((sum, word) => sum + word.length, 0)
  }));
  const plantedByPage = secretCodec(plantedPlain, random, pageAssignment);
  assert.deepEqual(plantedByPage.inverse, plantedPlain);
  const sourcePage = pageCollisionProfile(plantedPlain, pageAssignment);
  const encryptedPage = pageCollisionProfile(plantedByPage.cipher, pageAssignment);
  assert.equal(sourcePage.numerator, encryptedPage.numerator);
  assert.equal(sourcePage.denominator, encryptedPage.denominator);
  assert(sourcePage.ratio > observedPage.ratio * 2);
  console.log("Independent page-specific-table positive-control plant:", JSON.stringify({
    runes: plantedPlain.reduce((sum, word) => sum + word.length, 0),
    secretPermutationTables: plantedByPage.keyCount,
    plaintextPageRatio: sourcePage.ratio,
    ciphertextPageRatio: encryptedPage.ratio,
    exactDecodedSymbols: plantedPlain.reduce((sum, word) => sum + word.length, 0)
  }));
  const phase16Plant = secretCodec(plantedPlain, random, pageAssignment, localOrdinals);
  assert.deepEqual(phase16Plant.inverse, plantedPlain);
  const phase16Source = phase16Profile(plantedPlain, pageAssignment, localOrdinals);
  const phase16Cipher = phase16Profile(phase16Plant.cipher, pageAssignment, localOrdinals);
  assert.equal(phase16Source.numerator, phase16Cipher.numerator);
  assert.equal(phase16Source.denominator, phase16Cipher.denominator);
  assert(phase16Source.ratio > observedPhase16.ratio * 2);
  console.log("Independent p15-16-phase per-page secret-table plant:", JSON.stringify({
    runes: plantedPlain.reduce((sum, word) => sum + word.length, 0),
    secretPermutationTables: phase16Plant.keyCount,
    nativeCollisionFraction: phase16Source.ratio,
    encryptedCollisionFraction: phase16Cipher.ratio,
    exactDecodedSymbols: plantedPlain.reduce((sum, word) => sum + word.length, 0)
  }));
  console.log("PASS: original input, three all-secret invariants, native controls, full inverses.");
}

main();
