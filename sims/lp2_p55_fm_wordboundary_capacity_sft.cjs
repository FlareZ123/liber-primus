"use strict";
/**
 * Exact key-independent GP29 p55 word-boundary capacity proof for standard
 * 26-symbol fractionated Morse with unchanged printed word division.
 *
 * Original evidence: p55 has 17 authentic printed words and 76 runes,
 * including the source 1-rune carry from p54. Its text comes from the
 * first-party-image-aligned runic source and must match lp2-corpus.json.
 *
 * Hypothesis: each printed ciphertext word corresponds to one Morse plaintext
 * word, with every double-x Morse word delimiter placed at the adjoining
 * final/initial 3-trit codewords and no letter trits crossing that boundary.
 * The double-x may end in the preceding trigram, straddle the codeword
 * boundary, or begin in the following trigram:
 *   (left ends xx) OR (left ends x AND right begins x) OR (right begins xx).
 *
 * Under the conventional forbidden xxx code:
 *   only two codewords end xx: .xx and -xx;
 *   only two begin xx: xx. and xx-;
 *   only eight end x and only eight begin x.
 * Since each source rune has one secret codeword, at most two distinct
 * ciphertext runes can occupy either special class. Exhaust subsets of
 * original boundary symbols; all other edges must have both end-x/start-x.
 * This tests EVERY secret injective standard-FM codeword mapping under the
 * stated physical word-edge alignment. It is a necessary condition only.
 *
 * Run: node sims/lp2_p55_fm_wordboundary_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const canonical = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(canonical.length, 76);
const original = fs.readFileSync(path.join(ROOT, "resources/external/Liber Primus 57.txt"), "utf8")
  .replace(/\r\n/g, "\n");
const physical = original.split("%55\n")[1]?.split("%56\n")[0];
assert.ok(physical, "Original p55 transcription block must be available");
const runeId = new Map(corpus.runes.map((r, i) => [r, i]));
const words = physical.replace(/\[[^\]]*\]/g, "").replace(/\n/g, "")
  .split("᛫")
  .map((word) => [...word].filter((r) => runeId.has(r)).map((r) => runeId.get(r)))
  .filter((word) => word.length > 0);
assert.deepEqual(words.flat(), canonical, "Physical word boundaries must match canonical GP rune tape");
assert.deepEqual(words.map((w) => w.length), [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const ends = words.slice(0, -1).map((w) => w.at(-1));
const starts = words.slice(1).map((w) => w[0]);
assert.equal(ends.length, 16);
const endTypes = [...new Set(ends)], startTypes = [...new Set(starts)];
assert.equal(endTypes.length, 14);
assert.equal(startTypes.length, 13);
/**
 * @param {number[]} values
 * @returns {Array<Set<number>>}
 */
function upToTwo(values) {
  const results = [new Set()];
  for (const a of values) results.push(new Set([a]));
  for (let i = 0; i < values.length; i++)
    for (let j = i + 1; j < values.length; j++)
      results.push(new Set([values[i], values[j]]));
  return results;
}
/**
 * Return the necessary double-x frontier. A symbol in 'e2' can use a
 * suffix-xx code; a symbol in 's2' can use a prefix-xx code. The rest of
 * the physical word boundaries force an end-x code and a start-x code.
 * The bounds are generously relaxed: a code may be reused in categories
 * for the purpose of the LOWER BOUND, even when injectivity forbids it.
 *
 * @param {number[]} left
 * @param {number[]} right
 */
function capacity(left, right) {
  const leftTypes = [...new Set(left)], rightTypes = [...new Set(right)];
  let trials = 0, feasible = 0;
  let minEndX = Infinity, minStartX = Infinity, minMax = Infinity;
  /** @type {{e2:number[],s2:number[],e1:number,s1:number}|null} */
  let closest = null;
  for (const e2 of upToTwo(leftTypes)) {
    for (const s2 of upToTwo(rightTypes)) {
      const endX = new Set(e2), startX = new Set(s2);
      for (let i = 0; i < left.length; i++) {
        if (e2.has(left[i]) || s2.has(right[i])) continue;
        endX.add(left[i]);
        startX.add(right[i]);
      }
      trials++;
      if (endX.size < minEndX) minEndX = endX.size;
      if (startX.size < minStartX) minStartX = startX.size;
      if (Math.max(endX.size, startX.size) < minMax) {
        minMax = Math.max(endX.size, startX.size);
        closest = {e2: [...e2], s2: [...s2], e1: endX.size, s1: startX.size};
      }
      if (endX.size <= 8 && startX.size <= 8) feasible++;
    }
  }
  return {trials, feasible, minEndX, minStartX, minMax, closest};
}
const result = capacity(ends, starts);
assert.equal(result.trials, 9752);
assert.equal(result.feasible, 0);
assert.equal(result.minEndX, 10);
assert.equal(result.minStartX, 10);
assert.equal(result.minMax, 10);
console.log("ORIGINAL", JSON.stringify({
  physicalPage: 55,
  runeLength: canonical.length, printedWords: words.length,
  printedWordLengths: words.map((w) => w.length),
  boundaryCount: ends.length, distinctBoundaryEnds: endTypes.length,
  distinctBoundaryStarts: startTypes.length,
  result,
}, null, 2));
// Structural positive: create a 76-codeword 17-word book with the exact
// original length profile but real x|x delimiters at all 16 word joins.
// Every FM triple is a standard permitted code; one secret injective GP
// assignment is shared everywhere. Source-shaped word-length positives must
// survive the necessary condition.
const Morse = [];
for (const a of ".-x") for (const b of ".-x") for (const c of ".-x") {
  const triple = a + b + c;
  if (triple !== "xxx") Morse.push(triple);
}
assert.equal(Morse.length, 26);
const code = new Map(Morse.map((x, i) => [x, i]));
const plantWords = words.map((word, wordIndex) => {
  const output = Array.from({length: word.length}, () => "...");
  if (wordIndex > 0) output[0] = "x..";
  if (wordIndex < words.length - 1) output[output.length - 1] = "..x";
  return output;
});
for (let i = 0; i < plantWords.length - 1; i++)
  assert.equal(plantWords[i].at(-1).at(-1) + plantWords[i + 1][0][0], "xx");
const privateKey = Array.from({length: 26}, (_, i) => (i * 7) % 29);
assert.equal(new Set(privateKey).size, 26);
const plant = plantWords.map((word) => word.map((s) => privateKey[code.get(s)]));
assert.equal(plant.flat().length, 76);
const plantLeft = plant.slice(0, -1).map((w) => w.at(-1));
const plantRight = plant.slice(1).map((w) => w[0]);
const plantGate = capacity(plantLeft, plantRight);
assert.ok(plantGate.feasible > 0, "Constructed exact-key word delimiters must pass");
console.log("STRUCTURAL POSITIVE", JSON.stringify({
  recoveredTokens: plant.flat().length,
  wordCount: plant.length,
  passingCapacityAssignments: plantGate.feasible,
  earliestFixedMapping: privateKey,
}));
console.log("DECISION: Zero of 9,752 relaxed all-secret standard-FM word-edge allocations can put all 16 double-x delimiters at the original printed p55 word boundaries. This excludes only the stated word-aligned 26-code model.");
