"use strict";

/**
 * Original-input half-book link gate. Two three-rune words DJU BEI occur
 * together only on physical LP2 p27 and p55, ending the 56-page unknown
 * half-book. The latter is the last unsolved text before solved AN END.
 *
 * Source-driven test: the exact 28-page interval could indicate pairwise
 * reuse of a page-local substitution clock. Any independently secret
 * bijection at each (page-pair, local rune offset) preserves across-pair
 * rune equality. Calibrate against source-native 29-rune English windows,
 * and demonstrate a full original-length constructive inverse plant.
 *
 * Run: node sims/lp2_p27_p55_halfbook_pair_gate.cjs
 * Node.js >= 20; deterministic; no file writes or network access.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");
const {encodeEnglish} = require("./outer_permutation_assignment.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const pages = corpus.pages.slice(0, 56).map(p => p.indices);
const lengths = pages.map(p => p.length);
const boundaries = [0];
for (const length of lengths) boundaries.push(boundaries.at(-1) + length);
const C = pages.flat();
assert.equal(C.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(lengths[50], 0);
assert.equal(boundaries[56], C.length);
const GP = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number[]} a */
const translit = a => a.map(i => corpus.translit[i]).join("");
const phrase = [23, 11, 1, 17, 18, 10];
assert.equal(translit(phrase), "DJUBEI");
assert.deepEqual(pages[27].slice(28, 34), phrase);
assert.deepEqual(pages[55].slice(70), phrase);

/** @param {{runes:string,length:number,startPage:number}[]} words
 *  @param {number[]} ids
 */
function repeatedAdjacent(words, ids) {
  const byPattern = new Map();
  for (let i = 0; i + 1 < words.length; i++) {
    if (words[i].length < 3 || words[i+1].length < 3 ||
      words[i].startPage !== words[i+1].startPage) continue;
    const key = ids[i] * words.length + ids[i+1];
    if (!byPattern.has(key)) byPattern.set(key, []);
    byPattern.get(key).push(i);
  }
  return [...byPattern.values()].filter(locations => locations.length > 1);
}
const words = parsed.words;
const unique = [...new Set(words.map(w => w.runes))];
const wordIds = new Map(unique.map((w, i) => [w, i]));
const originalIds = words.map(w => wordIds.get(w.runes));
const duplicate = repeatedAdjacent(words, originalIds);
assert.deepEqual(duplicate, [[1462, 2894]]);
assert.deepEqual(duplicate[0].map(i => physicalLP2Page(words[i].startPage)),
  [27, 55]);
assert.equal(words.at(-2).runes, corpus.runes.slice(0, 0).join("") +
  phrase.slice(0, 3).map(i => corpus.runes[i]).join(""));
assert.equal(words.at(-1).runes,
  phrase.slice(3).map(i => corpus.runes[i]).join(""));

/** @param {number} seed */
function xorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** @param {"book"|"page"} scope */
function shuffleGroups(scope) {
  const grouped = new Map();
  for (let i = 0; i < words.length; i++) {
    const key = scope === "book" ? words[i].length :
      words[i].startPage + ":" + words[i].length;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(i);
  }
  return [...grouped.values()].filter(a => a.length > 1);
}

/** @param {"book"|"page"} scope @param {number} trials */
function wordPermutationNull(scope, trials = 5000) {
  const rng = xorshift32(scope === "book" ? 0x3301cafe : 0x3301babe);
  const groups = shuffleGroups(scope);
  let anyDuplicate = 0, lastTwoRepeated = 0, duplicateTotal = 0;
  const tail = originalIds.length - 2;
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = originalIds.slice();
    for (const indices of groups) {
      for (let j = indices.length - 1; j > 0; j--) {
        const k = Math.floor(rng() * (j + 1));
        [shuffled[indices[j]], shuffled[indices[k]]] =
          [shuffled[indices[k]], shuffled[indices[j]]];
      }
    }
    const collisions = repeatedAdjacent(words, shuffled);
    if (collisions.length) anyDuplicate++;
    duplicateTotal += collisions.length;
    if (collisions.some(a => a.includes(tail))) lastTwoRepeated++;
  }
  return {scope, trials, anyDuplicate, lastTwoRepeated,
    meanDuplicatePatterns: duplicateTotal / trials,
    upperTailAtLeastOne: (anyDuplicate + 1) / (trials + 1)};
}

const pairs = Array.from({length: 28}, (_, i) => ({
  left: boundaries[i], right: boundaries[i+28],
  count: Math.min(lengths[i], lengths[i+28])
}));
assert.equal(pairs.filter(x => x.count > 0).length, 27);

/** @param {number[]} values */
function matchingPositions(values) {
  let equal = 0, total = 0;
  for (const p of pairs) {
    for (let i = 0; i < p.count; i++)
      equal += values[p.left+i] === values[p.right+i];
    total += p.count;
  }
  return {equal, total, fraction: equal / total};
}
const original = matchingPositions(C);
assert.deepEqual([original.equal, original.total], [195, 5663]);

// Positive plant: independent arbitrary secret permutation per page-pair
// and every local rune position, shared by the two members of that pair.
// The secret is not assumed recoverable from unknown original ciphertext.
/** @param {number[]} plain */
function plantSecretBijectivePairClock(plain) {
  const rng = xorshift32(0x33012855);
  const enc = plain.slice(), dec = plain.slice();
  let encCount = 0;
  for (let pair = 0; pair < 28; pair++) {
    const n = Math.max(lengths[pair], lengths[pair+28]);
    for (let i = 0; i < n; i++) {
      const sigma = Array.from({length: 29}, (_, j) => j);
      for (let j = 28; j > 0; j--) {
        const k = Math.floor(rng() * (j+1));
        [sigma[j], sigma[k]] = [sigma[k], sigma[j]];
      }
      const inv = Array(29);
      sigma.forEach((v, k) => {inv[v] = k;});
      for (const p of [pair, pair+28]) {
        if (i >= lengths[p]) continue;
        const at = boundaries[p]+i;
        enc[at] = sigma[plain[at]];
        dec[at] = inv[enc[at]];
        encCount++;
      }
    }
  }
  assert.equal(encCount, C.length);
  assert.deepEqual(dec, plain);
  assert.deepEqual(matchingPositions(enc), matchingPositions(plain));
  return {recoveredRunes: encCount, preservedPairEqualities: true};
}
const references = [
  ["Shakespeare", "shakespeare_first300k.txt"],
  ["Gibran", "gibran_prophet_58585.txt"],
  ["Emerson", "emerson_essays_2944.txt"]
];
const controls = [];
for (const [name, filename] of references) {
  const text = encodeEnglish(read("resources/control/" + filename));
  const ratios = [];
  for (let start = 0; start + C.length <= text.length; start += 97)
    ratios.push(matchingPositions(text.slice(start, start + C.length)).fraction);
  assert(ratios.length > 100);
  ratios.sort((a, b) => a-b);
  assert(ratios[0] > original.fraction);
  controls.push({
    name, gpRunes: text.length, windows: ratios.length,
    minimum: ratios[0], median: ratios[Math.floor(ratios.length/2)],
    maximum: ratios.at(-1), atOrBelowOriginal: 0
  });
}
const planted = plantSecretBijectivePairClock(
  encodeEnglish(read("resources/control/shakespeare_first300k.txt"))
    .slice(0, C.length));
const shuffledBook = wordPermutationNull("book");
const shuffledPage = wordPermutationNull("page");
console.log(JSON.stringify({
  observation: {
    exactSixRuneMatch: {
      runes: translit(phrase), physicalPages: [27, 55],
      localRuneOffsets: [28, 70], sourceWordPositions: [1462, 2894],
      bothWordsMinimumLength: 3, terminalTwoWords: true,
      uniqueEligibleRepeatedBigram: true
    },
    halfBookPageAlignedEquality: original
  },
  hypothesis: "Identical arbitrary secret bijection at each local rune offset in each physical page pair (p,p+28); independent across pair and offsets",
  nativeControls: controls,
  positivePlant: planted,
  wordShuffleControls: [shuffledBook, shuffledPage],
  decision: "The terminal repeated bigram is a source-visible candidate link. " +
    "The half-book page-local key-reuse explanation fails all source-native " +
    "controls; source does not select an alternative cipher or recover plaintext."
}, null, 2));
