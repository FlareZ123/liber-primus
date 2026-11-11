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

/** Sample native words with exactly the original printed word-length pattern. */
function nativeLengthMatched(original, pools, random) {
  return original.map(word => {
    const choices = pools.get(word.length);
    assert(choices && choices.length, "Missing source word length " + word.length);
    return choices[Math.floor(random() * choices.length)];
  });
}

/** Construct a keyed family containing an arbitrary bijection for every stratum. */
function secretCodec(plain, random) {
  const keys = new Map();
  const cipher = [];
  const inverse = [];
  for (const word of plain) {
    const encoded = [];
    const recovered = [];
    for (let position = 0; position < word.length; position++) {
      const key = word.length + ":" + position;
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
    for (let trial = 0; trial < 400; trial++) {
      const sampled = nativeLengthMatched(original, pools, random);
      scores.push(collisionProfile(sampled).ratio);
    }
    scores.sort((a, b) => a - b);
    const minimum = scores[0];
    const maximum = scores[scores.length - 1];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const atOrBelowOriginal = scores.filter(score => score <= observed.ratio).length;
    totalSamples += scores.length;
    console.log(source + ":", JSON.stringify({
      nativeWords: native.length, trials: scores.length,
      minimum, mean, median: scores[199], maximum, atOrBelowOriginal
    }));
    assert.equal(atOrBelowOriginal, 0,
      "The all-secret exclusion did not pass the source-language control");
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
  console.log("Independent positive-control plant:", JSON.stringify({
    runes: plantedPlain.reduce((sum, word) => sum + word.length, 0),
    secretPermutationTables: planted.keyCount,
    plainRatio: before.ratio, ciphertextRatio: after.ratio,
    exactDecodedSymbols: plantedPlain.reduce((sum, word) => sum + word.length, 0)
  }));
  console.log("PASS: original input, secret-table invariant, native controls, full inverse.");
}

main();
