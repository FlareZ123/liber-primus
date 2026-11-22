"use strict";

/**
 * Original p57 "WITHIN / SHED CIRCUMFERENCES" source-constrained word
 * interior test, exhaustive endpoint-permutation null, and separately
 * matched, solved-LP1-word control.
 *
 * Windows Node.js 22 SFT: node sims/lp2_p57_strict_interior_wordmatch_sft.cjs
 * Read-only. The output is conditional evidence, not a discovered decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const tokenIndex = new Map(corpus.translit.map((r, i) => [r, i]));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const sourceWords = raw.split("%").at(-1)
  .replace(/[\/\r\n§]/g, "").split(/[-.]/).filter(Boolean);
const p57 = sourceWords.map(rawWord => [...rawWord].map(rune => {
  const index = runeIndex.get(rune);
  assert.ok(Number.isInteger(index));
  return index;
}));
assert.equal(p57.length, 20);
const name = word => word.map(i => corpus.translit[i]).join("");
/** @param {number[]} word @returns {number} */
const gpSum = word => word.reduce((sum, index) => sum + corpus.prime[index], 0);
const sums = p57.map(gpSum);
const targets = new Set(sums);
const findings = [];
const chances = [];
for (let i = 0; i < p57.length; i += 1) {
  const word = p57[i], sum = sums[i], count = word.length;
  const interior = sum - corpus.prime[word[0]] - corpus.prime[word.at(-1)];
  const destinations = [];
  let valid = 0;
  for (let first = 0; first < count; first += 1) {
    for (let last = 0; last < count; last += 1) {
      if (first === last) continue;
      const candidate = sum - corpus.prime[word[first]] -
        corpus.prime[word[last]];
      if (targets.has(candidate)) valid += 1;
    }
  }
  const probability = valid / (count * (count - 1));
  const matches = p57.map((other, j) =>
    sums[j] === interior && i !== j ? name(other) : null).filter(Boolean);
  if (matches.length) {
    findings.push({ word: name(word), sum, strictInterior: interior, matches,
      conditionalProbabilityWithReorderedEndpoints: probability });
  }
  if (probability > 0) {
    chances.push({ word: name(word), originalPosition: i, valid,
      orderedPairs: count * (count - 1), probability });
  }
}
assert.deepEqual(findings.map(f => [f.word, f.strictInterior, f.matches]), [
  ["PARABLE", 339, ["TUNNELNG"]],
  ["DIUINITY", 184, ["LICE"]]
]);
assert.equal(chances.length, 5);
const allChances = p57.map((word, i) =>
  chances.find(c => c.originalPosition === i)?.probability || 0);
let distribution = [1];
for (const probability of allChances) {
  const next = new Array(distribution.length + 1).fill(0);
  distribution.forEach((old, i) => {
    next[i] += old * (1 - probability);
    next[i + 1] += old * probability;
  });
  distribution = next;
}
const exactProbabilityAtLeastTwo = distribution.slice(2)
  .reduce((a, b) => a + b, 0);
const selectedTwoProbability = chances.filter(c =>
  ["PARABLE", "DIUINITY"].includes(c.word))
  .reduce((a, b) => a * b.probability, 1);
assert.ok(Math.abs(exactProbabilityAtLeastTwo -
  0.07461397257315626) < 1e-13);
assert.ok(Math.abs(selectedTwoProbability - 1 / 588) < 1e-13);

// Real solved LP1 prose supplies an independent word-list population with
// exact GP-rune word-length matching. The source is editorial Latin text,
// requiring declared normalizations and a GP-specific ING contraction.
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 56")[0];
const digraphs = ["TH", "EO", "NG", "OE", "AE", "IA", "EA"];
/** @param {string} word @returns {number[] | null} */
function encodeEnglish(word) {
  const normalized = word.replaceAll("QU", "CW").replaceAll("V", "U")
    .replaceAll("K", "C").replaceAll("Q", "C").replaceAll("Z", "S");
  const indices = [];
  for (let i = 0; i < normalized.length;) {
    const ing = normalized.startsWith("ING", i);
    const piece = ing ? "NG" :
      digraphs.find(d => normalized.startsWith(d, i)) || normalized[i];
    const index = tokenIndex.get(piece);
    if (!Number.isInteger(index)) return null;
    indices.push(index);
    i += ing ? 3 : piece.length;
  }
  return indices;
}
const pool = lp1.split(/\r?\n/).map(line => line.trim())
  .filter(line => /^[A-Z][A-Z .,;:!?'"-]*$/.test(line))
  .flatMap(line => line.match(/[A-Z]{2,}/g) || [])
  .map(encodeEnglish).filter(Boolean);
assert.equal(pool.length, 553);
const byLength = new Map();
for (const item of pool) {
  if (!byLength.has(item.length)) byLength.set(item.length, []);
  byLength.get(item.length).push(item);
}
assert.deepEqual(p57.filter(word => !byLength.has(word.length)).map(name),
  ["CIRCUMFERENCES"]);
let state = 0x33011723;
/** @returns {number} */
const next32 = () => {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
};
/** @param {number[][]} words @returns {number} */
function interiorMatches(words) {
  const allSums = new Set(words.map(gpSum));
  let count = 0;
  for (const word of words) {
    const interior = gpSum(word) - corpus.prime[word[0]] -
      corpus.prime[word.at(-1)];
    if (allSums.has(interior)) count += 1;
  }
  return count;
}
assert.equal(interiorMatches(p57), 2);
const histogram = new Array(9).fill(0);
const trials = 300000;
for (let trial = 0; trial < trials; trial += 1) {
  const chosen = p57.map(word => {
    const alternatives = byLength.get(word.length);
    return alternatives ?
      alternatives[next32() % alternatives.length] : word;
  });
  histogram[Math.min(interiorMatches(chosen), 8)] += 1;
}
assert.deepEqual(histogram,
  [199714, 79221, 18011, 2721, 306, 26, 1, 0, 0]);

console.log(JSON.stringify({
  originalP57WordOccurrences: p57.length,
  originalUniquePrimeSums: targets.size,
  observedStrictInteriorWholeWordMatches: findings,
  allPossibleTargetingInteriorWords: chances,
  endpointOrderNull: {
    model: "independent uniform rune reorder within original 20 printed words",
    expectedMatches: allChances.reduce((a, b) => a + b, 0),
    exactProbabilityAtLeastTwo,
    exactProbabilityExactlyTwo: distribution[2],
    conditionalProbabilityBothSourceSelectedPARABLEandDIUINITY:
      selectedTwoProbability
  },
  independentSolvedLP1MatchedWordControl: {
    sourceWordPoolOccurrences: pool.length,
    trialCount: trials,
    seed: "0x33011723",
    matchCountHistogram0to8Plus: histogram,
    probabilityTwoOrMore:
      histogram.slice(2).reduce((a, b) => a + b, 0) / trials,
    exception: "Unmatched original 14-rune CIRCUMFERENCES remains fixed"
  },
  decision: "Two literal strict-inside word-prime links are real source facts, but >=2 links occur about 7% under either declared conditional null. No historical source specifies a cryptographic receiver or p55 decipherment."
}, null, 2));
