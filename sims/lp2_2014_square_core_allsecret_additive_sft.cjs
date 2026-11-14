#!/usr/bin/env node
"use strict";

/**
 * Key-independent obstruction for a stationary additive GP29 key whose
 * symbol at position i depends only on the corresponding 2014 square-core
 * value n_i: K_i = f(n_i). The three source-ordered square interiors have
 * 43 values but only 23 distinct values, creating 20 repeated-value pairs.
 *
 * For every repeated pair i,j, any such key requires
 *   P_i - P_j = C_i - C_j (mod 29),
 * regardless of the unknown function f or additive sign.
 *
 * The script compares these exact 20 constraints with 60,000 deterministic
 * source-native, exact-word-shape controls and includes a synthetic positive
 * control. This is a scoped negative, not a proof about all possible prose.
 * Run from repository root:
 *   node sims/lp2_2014_square_core_allsecret_additive_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const mod = (n, m = 29) => ((n % m) + m) % m;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const plainLP1 = read("resources/liber-primus/lp1-plaintext-reference.txt");

const page55Words = transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const wordLengths = page55Words.map(word => [...word].length);
assert.deepEqual(wordLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const cipher = page55Words.flatMap(word => [...word].slice(1, -1))
  .map(rune => corpus.runes.indexOf(rune));
assert.equal(cipher.length, 43);
assert.ok(cipher.every(value => value >= 0 && value < 29));

const squares = squareText.trim().split(/\r?\n\s*\r?\n/).map(section =>
  section.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(square => square.length), [5,7,5]);
for (const square of squares) assert.ok(square.every(row => row.length === square.length));
const core = squares.flatMap(square =>
  square.slice(1, -1).flatMap(row => row.slice(1, -1)));
assert.equal(core.length, 43);

const groups = new Map();
core.forEach((value, index) => {
  if (!groups.has(value)) groups.set(value, []);
  groups.get(value).push(index);
});
assert.equal(groups.size, 23);
const constraints = [];
for (const [value, positions] of groups) {
  for (let a = 0; a < positions.length; a++) {
    for (let b = a + 1; b < positions.length; b++) {
      const i = positions[a], j = positions[b];
      constraints.push({value, i, j, delta: mod(cipher[i] - cipher[j])});
    }
  }
}
assert.equal(constraints.length, 20);
const expected = [
  [812,0,8,2],[934,1,7,15],[280,2,6,14],[620,3,5,4],
  [223,9,33,22],[14,10,32,13],[47,11,31,23],[293,12,30,0],
  [98,13,29,4],[232,14,28,9],[121,15,27,12],[114,16,26,22],
  [72,17,25,5],[23,18,24,24],[65,19,23,23],[270,20,22,26],
  [199,34,42,13],[130,35,41,20],[320,36,40,13],[245,37,39,9]
];
assert.deepEqual(constraints.map(c => [c.value,c.i,c.j,c.delta]), expected);

/**
 * Source-calibrated GP English encoding, independently validated against
 * solved LP2 p57 below. ING and IO use their attested single-rune spellings.
 */
const tokenMap = corpus.translit.map((spelling, index) => ({
  spelling: spelling.toUpperCase(), index
})).sort((a, b) => b.spelling.length - a.spelling.length);
function encodeNativeWord(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let at = 0; at < normalized.length;) {
    if (normalized.startsWith("ING", at)) {
      output.push(21);
      at += 3;
    } else if (normalized.startsWith("IO", at)) {
      output.push(27);
      at += 2;
    } else {
      const token = tokenMap.find(item => normalized.startsWith(item.spelling, at));
      if (!token) return null;
      output.push(token.index);
      at += token.spelling.length;
    }
  }
  return output;
}
const p57Text = plainLP1.split("### 57\n")[1].trim();
const p57Words = p57Text.match(/[A-Z]+/g) || [];
const p57Encoded = p57Words.flatMap(encodeNativeWord);
assert.equal(p57Words.length, 20);
assert.equal(p57Encoded.length, 95);
assert.deepEqual(p57Encoded, corpus.pages.find(page => page.page === 57).indices);

const sourceFiles = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const sources = sourceFiles.map(([name, file]) => ({
  name,
  words: (read(file).match(/[A-Za-z]+/g) || [])
    .map(encodeNativeWord).filter(Boolean)
}));

const latinAlphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/)
  .filter(line => line.trim() && !line.trimStart().startsWith("#"))
  .map(line => line.trim().split("").map(symbol => latinAlphabet.indexOf(symbol)));
assert.ok(latinWords.every(word => word.every(value => value >= 0 && value < 29)));
const oldEnglish = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const oldRunes = [...oldEnglish.sourceGpBase29]
  .map(symbol => oldEnglish.positiveControlAlphabet.indexOf(symbol));
assert.ok(oldRunes.every(value => value >= 0 && value < 29));
let oldAt = 0;
const oldEnglishWords = oldEnglish.allSourceGpWordLengths.map(length => {
  const word = oldRunes.slice(oldAt, oldAt + length);
  oldAt += length;
  return word;
});
assert.equal(oldAt, oldRunes.length);
const allSources = [
  ...sources,
  {name:"Latin Vulgate", words:latinWords},
  {name:"Old English Beowulf", words:oldEnglishWords}
];
let seed = 0x45001113;
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const controls = [];
for (const {name, words} of sources) {
  const buckets = Array.from({length:32}, () => []);
  for (const word of words) if (word.length < 32) buckets[word.length].push(word);
  for (const length of new Set(wordLengths)) {
    assert.ok(buckets[length].length > 0, "missing exact-length native words");
  }
  const trials = 20000;
  const histogram = new Uint32Array(constraints.length + 1);
  let fullMatches = 0, maximum = 0;
  for (let trial = 0; trial < trials; trial++) {
    const plant = [];
    for (const length of wordLengths) {
      const bucket = buckets[length];
      plant.push(...bucket[random32() % bucket.length].slice(1, -1));
    }
    assert.equal(plant.length, 43);
    let matched = 0;
    for (const c of constraints) {
      if (mod(plant[c.i] - plant[c.j]) === c.delta) matched++;
    }
    histogram[matched]++;
    if (matched === constraints.length) fullMatches++;
    if (matched > maximum) maximum = matched;
  }
  controls.push({
    name, trials, fullMatches, maximumMatchedPairs: maximum,
    minimumViolations: constraints.length - maximum,
    histogram: Array.from(histogram, (count, matched) =>
      count ? {matched, count} : null).filter(Boolean)
  });
}
assert.deepEqual(controls.map(row => [row.fullMatches, row.maximumMatchedPairs]), [
  [0,5],[0,6],[0,6]
]);

// Five of the 20 constraints connect the 13-rune and 7-rune p55 words.
// Enumerate every ordered pair of such source words across all five corpora.
const thirteenWords = allSources.flatMap(source => source.words
  .filter(word => word.length === 13)
  .map(word => ({source:source.name, interior:word.slice(1, -1)})));
const sevenWords = allSources.flatMap(source => source.words
  .filter(word => word.length === 7)
  .map(word => ({source:source.name, interior:word.slice(1, -1)})));
assert.equal(thirteenWords.length, 397);
assert.equal(sevenWords.length, 12285);
const sevenByInterior = new Map();
for (const word of sevenWords) {
  const key = word.interior.join(",");
  if (!sevenByInterior.has(key)) sevenByInterior.set(key, []);
  sevenByInterior.get(key).push(word);
}
let exactOrderedPairMatches = 0;
const exactWordPairExamples = [];
for (const word13 of thirteenWords) {
  const A = word13.interior;
  const required7Interior = [
    mod(A[5] - 12), mod(A[4] - 9), mod(A[3] - 4),
    mod(A[2]), mod(A[1] - 23)
  ];
  const found = sevenByInterior.get(required7Interior.join(",")) || [];
  exactOrderedPairMatches += found.length;
  if (found.length) exactWordPairExamples.push({
    word13, word7:found, required7Interior
  });
}
assert.equal(thirteenWords.length * sevenWords.length, 4877145);
assert.equal(exactOrderedPairMatches, 0);
const wordPairSourceCounts = allSources.map(source => ({
  name:source.name,
  words13:source.words.filter(word => word.length === 13).length,
  words7:source.words.filter(word => word.length === 7).length
}));

// Synthetic positive control: encrypt a source-native word-shape plant with
// an arbitrary stationary f(value). Every repeated-value equation must hold.
const shakespeareBuckets = Array.from({length:32}, () => []);
for (const word of sources[0].words) if (word.length < 32) shakespeareBuckets[word.length].push(word);
const syntheticPlain = [];
for (const length of wordLengths) {
  syntheticPlain.push(...shakespeareBuckets[length][0].slice(1, -1));
}
assert.equal(syntheticPlain.length, 43);
const valueKey = new Map([...groups.keys()].map((value, index) =>
  [value, mod(index * 7 + 11)]));
const syntheticCipher = syntheticPlain.map((plain, i) =>
  mod(plain + valueKey.get(core[i])));
const syntheticMatches = constraints.filter(c =>
  mod(syntheticCipher[c.i] - syntheticCipher[c.j]) ===
  mod(syntheticPlain[c.i] - syntheticPlain[c.j])).length;
assert.equal(syntheticMatches, 20);

console.log(JSON.stringify({
  status: "bounded key-independent negative for stationary additive keys K_i=f(squareCoreValue)",
  source: {
    squareOrders: [5,7,5],
    coreValues: core.length,
    uniqueCoreValues: groups.size,
    repeatedValuePairs: constraints.length,
    p55WordSegmentLengths: wordLengths,
    p55InteriorRunes: cipher.length,
    p57SourceNativeEncoderPositiveControl: "95/95 exact"
  },
  constraints: constraints.map(c => ({
    squareValue: c.value,
    positionsZeroBased: [c.i,c.j],
    requiredPlaintextDifference: c.delta
  })),
  controls,
  exactWordPairGate: {
    sourceCounts: wordPairSourceCounts,
    thirteenRuneWords: thirteenWords.length,
    sevenRuneWords: sevenWords.length,
    orderedPairs: thirteenWords.length * sevenWords.length,
    matches: exactOrderedPairMatches,
    requiredSevenRuneInterior: "B=[A[5]-12,A[4]-9,A[3]-4,A[2],A[1]-23] mod 29"
  },
  aggregate: {
    samples: controls.reduce((sum, row) => sum + row.trials, 0),
    fullMatches: controls.reduce((sum, row) => sum + row.fullMatches, 0),
    maximumMatchedPairs: Math.max(...controls.map(row => row.maximumMatchedPairs))
  },
  syntheticPositiveControl: {
    matchedPairs: syntheticMatches,
    totalPairs: constraints.length,
    passed: syntheticMatches === constraints.length
  },
  scope: "Excludes only stationary additive GP29 keys that are functions solely of the source-ordered 43 square-core values for the tested exact-word-shape native-GP controls. It does not exclude positional/stateful keys, different placements, other languages, or unknown prose."
}, null, 2));
