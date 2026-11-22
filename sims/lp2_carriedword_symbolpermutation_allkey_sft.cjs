"use strict";
/**
 * LP2 inter-word carried-key / arbitrary per-word alphabet all-secret gate.
 * Tests an invariant that survives ANY bijective GP29 alphabet chosen
 * separately for every complete original printed word. Word-by-word changes
 * may depend on a secret, all previous ciphertext words and source layout.
 * Source words are kept whole across line/physical-page boundaries.
 * Standalone read-only Windows 11 / Node.js 22 CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourcePages = corpus.pages.slice(0, 56);
const originalRunes = sourcePages.flatMap(p => p.indices);
const physicalText = read("resources/liber-primus/lp2-transcription.txt").split("%");
// The source transcript represents the runeless numeric physical p50 by no
// text segment. Its first 55 segments are the 55 rune-bearing p0..55 pages.
const textGroups = physicalText.slice(0, 55);
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runicRegex = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
/** @param {string} joined */
function readCompleteWords(joined) {
  return (joined.match(runicRegex) || [])
    .map(w => Array.from(w, rune => {
      const x = runeToIndex.get(rune);
      assert(Number.isInteger(x));
      return x;
    }));
}
const manuscriptText = textGroups.join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const words = readCompleteWords(manuscriptText);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
assert.deepEqual(words.flat(), originalRunes, "all unmodified original physical runes and 32 page word carries");
assert.equal(sourcePages[50].indices.length, 0);
assert.equal(words.filter(w => w.length === 1).length, 83);
assert.equal(words.filter(w => w.length === 2).length, 448);

/** @param {number[][]} ws */
function patternCounts(ws) {
  let equalPairs = 0;
  let adjacentPairs = 0;
  let longEqualPairs = 0;
  let repeatedWords = 0;
  const byLength = new Map();
  for (const w of ws) {
    const freq = Array(29).fill(0);
    for (const x of w) freq[x]++;
    const collisions = freq.reduce((s, n) => s + n * (n - 1) / 2, 0);
    const adjacent = w.slice(1).filter((x, i) => x === w[i]).length;
    equalPairs += collisions;
    adjacentPairs += adjacent;
    if (w.length >= 4) longEqualPairs += collisions;
    if (collisions > 0) repeatedWords++;
    const row = byLength.get(w.length) || {
      words: 0, equalPairs: 0, adjacent: 0, repeatedWords: 0
    };
    row.words++;
    row.equalPairs += collisions;
    row.adjacent += adjacent;
    row.repeatedWords += Number(collisions > 0);
    byLength.set(w.length, row);
  }
  return {
    words: ws.length, runes: ws.reduce((a, w) => a + w.length, 0),
    equalPairs, adjacentPairs, nonAdjacentPairs: equalPairs - adjacentPairs,
    longEqualPairs, repeatedWords,
    byLength: Object.fromEntries([...byLength].sort((a, b) => a[0] - b[0]))
  };
}
const original = patternCounts(words);
assert.equal(original.equalPairs, 811);
assert.equal(original.adjacentPairs, 63);
assert.equal(original.nonAdjacentPairs, 748);
assert.equal(original.longEqualPairs, 768);
assert.equal(original.repeatedWords, 621);
assert.equal(original.byLength[2].words, 448);
assert.equal(original.byLength[3].words, 720);

/**
 * GP29 source-native orthography attested by originally solved LP1 and
 * independently solved LP2 p57: ING to rune21; IO to rune27.
 * @param {string} word
 */
function encodeNative(word) {
  const mappings = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const normal = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < normal.length;) {
    if (normal.startsWith("ING", i)) { result.push(21); i += 3; }
    else if (normal.startsWith("IO", i)) { result.push(27); i += 2; }
    else {
      const match = mappings.find(t => normal.startsWith(t.token, i));
      assert(match, "missing GP token");
      result.push(match.index);
      i += match.token.length;
    }
  }
  return result;
}
/** @param {number} seed */
function rng32(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
/** @param {string} text */
function nativeWordBuckets(text) {
  const bins = new Map();
  for (const w of text.match(/[A-Za-z]+/g) || []) {
    const encoded = encodeNative(w);
    const group = bins.get(encoded.length) || [];
    group.push(encoded);
    bins.set(encoded.length, group);
  }
  return bins;
}
const controls = [
  { name: "Shakespeare", path: "resources/control/shakespeare_first300k.txt", seed: 0x44102a },
  { name: "Emerson", path: "resources/control/emerson_essays_2944.txt", seed: 0x44102b },
  { name: "Gibran", path: "resources/control/gibran_prophet_58585.txt", seed: 0x44102c }
];
const sourceMetrics = ["equalPairs", "adjacentPairs", "nonAdjacentPairs",
  "longEqualPairs", "repeatedWords"];
const stats = [];
const plants = [];
for (const donor of controls) {
  let raw = read(donor.path);
  if (donor.name === "Gibran") {
    const up = raw.toUpperCase();
    const start = up.indexOf("ALMUSTAFA");
    const end = up.indexOf("*** END OF THIS PROJECT", start);
    assert(start >= 0 && end > start);
    raw = raw.slice(start, end);
  }
  const bins = nativeWordBuckets(raw);
  const validOriginal = words.filter(w => bins.has(w.length));
  const actual = patternCounts(validOriginal);
  const rand = rng32(donor.seed);
  const draws = 500;
  const minimum = Object.fromEntries(sourceMetrics.map(key => [key, Infinity]));
  const maximum = Object.fromEntries(sourceMetrics.map(key => [key, -Infinity]));
  const mean = Object.fromEntries(sourceMetrics.map(key => [key, 0]));
  let passOriginalOrLower = 0;
  for (let i = 0; i < draws; i++) {
    const plant = validOriginal.map(w => {
      const group = bins.get(w.length);
      return group[Math.floor(rand() * group.length)];
    });
    if (i === 0) plants.push(plant);
    const value = patternCounts(plant);
    if (value.equalPairs <= actual.equalPairs) passOriginalOrLower++;
    for (const key of sourceMetrics) {
      minimum[key] = Math.min(minimum[key], value[key]);
      maximum[key] = Math.max(maximum[key], value[key]);
      mean[key] += value[key] / draws;
    }
  }
  assert.equal(passOriginalOrLower, 0);
  assert(minimum.equalPairs > actual.equalPairs);
  assert(minimum.adjacentPairs > actual.adjacentPairs);
  assert(minimum.nonAdjacentPairs > actual.nonAdjacentPairs);
  assert(minimum.longEqualPairs > actual.longEqualPairs);
  assert(minimum.repeatedWords > actual.repeatedWords);
  stats.push({
    source: donor.name, wordsCompared: validOriginal.length,
    donorNativeWordLengthsMissing: [...new Set(words.map(w => w.length))]
      .filter(length => !bins.has(length)),
    originalOnComparableSlots: {
      equalPairs: actual.equalPairs, adjacentPairs: actual.adjacentPairs,
      nonAdjacentPairs: actual.nonAdjacentPairs,
      longEqualPairs: actual.longEqualPairs,
      repeatedWords: actual.repeatedWords
    },
    draws, minimum, maximum, mean, atOrBelowOriginalEqualPairs: passOriginalOrLower
  });
}

/**
 * Native GP positive with actual *carried* word state:
 * at each word choose a new invertible affine GP29 alphabet from the prior
 * ciphertext word's last rune, length, and a previous evolving seed.
 * The alphabet is constant within each word; 1- and 2-rune words convey
 * plaintext without requiring an independent embedded nonce.
 * The same evolving key is shared across true physical page boundaries.
 * @param {number[][]} input
 * @param {boolean} decrypt
 */
function carriedAffine(input, decrypt) {
  let seed = 761 % 29;
  let previousCipherEnd = 0;
  let previousWordLength = 0;
  const inv = Array(29).fill(0);
  for (let a = 1; a < 29; a++) {
    for (let b = 1; b < 29; b++) if (a * b % 29 === 1) inv[a] = b;
  }
  const output = [];
  for (const word of input) {
    const mul = 1 + (seed + previousCipherEnd + previousWordLength) % 28;
    const add = (17 * seed + previousCipherEnd + 7 * previousWordLength) % 29;
    const emitted = word.map(x => decrypt
      ? (inv[mul] * ((x - add + 29) % 29)) % 29
      : (mul * x + add) % 29);
    output.push(emitted);
    const ciphertext = decrypt ? word : emitted;
    previousCipherEnd = ciphertext.at(-1);
    previousWordLength = word.length;
    seed = (seed * 5 + 11 + previousCipherEnd + previousWordLength) % 29;
  }
  return output;
}
for (const plant of plants) {
  const encrypted = carriedAffine(plant, false);
  assert.equal(encrypted.length, plant.length);
  assert.deepEqual(carriedAffine(encrypted, true), plant);
  assert.deepEqual(carriedAffine(carriedAffine(encrypted, true), false), encrypted);
  const before = patternCounts(plant);
  const after = patternCounts(encrypted);
  for (const key of sourceMetrics) assert.equal(after[key], before[key]);
}
// Additional first-party solved LP2 p57: true 95-rune native Cicada parable,
// including its source-runic words, not an English text re-encoder.
const solved = readCompleteWords(physicalText[56]);
assert.equal(solved.length, 20);
assert.deepEqual(solved.flat(), corpus.pages[57].indices);
assert.equal(solved.flat().length, 95);
const solvedCipher = carriedAffine(solved, false);
assert.deepEqual(carriedAffine(solvedCipher, true), solved);
for (const key of sourceMetrics) {
  assert.equal(patternCounts(solvedCipher)[key], patternCounts(solved)[key]);
}
console.log(JSON.stringify({
  model: "Any single secret bijective GP29 alphabet held fixed WITHIN each original complete printed word; alphabet may depend arbitrarily on all previous words",
  original,
  nativeMatchedReferences: stats,
  positive: {
    2013PrimeTitleSeed: 761 % 29,
    originalSourceWordCounts: words.length,
    shapeMatchedGPPlantRecovered: plants.map(x => x.flat().length),
    nativeSolvedP57Recovered: solved.flat().length,
    exactWithinWordEqualityPatternsInvariant: true
  },
  decision: "All changing-between-word, fixed-within-word alphabet substitution ciphers preserve 811 original internal equal-rune pairs regardless of carried key; none of 1500 matched native English samples is compatible. More complex per-rune state and changed word boundaries escape."
}, null, 2));
