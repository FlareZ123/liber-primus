"use strict";

/**
 * A key-free capacity gate for a hypothetical LP2 cipher that deletes
 * adjacent equal runes and stores arbitrary restoration counts in the
 * 256-byte p49-p51 table.
 *
 * The test is a necessary information bound on that precise sidecar model.
 * It does not require the historical source to use de-duplication.
 *
 * Run: node sims/lp2_p50_duplicate_restoration_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} name @returns {unknown} */
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}

/**
 * Count all independently distinguishable ways to add k copies of the
 * existing rune into R original same-rune runs. Their lengths form a
 * nonnegative composition of k into R parts: choose(R+k-1,k).
 *
 * @param {number} runs
 * @param {number} insertions
 * @returns {number} Number of bits required for an arbitrary assignment.
 */
function log2Restorations(runs, insertions) {
  assert(Number.isSafeInteger(runs) && runs > 0);
  assert(Number.isSafeInteger(insertions) && insertions >= 0);
  let bits = 0;
  for (let i = 1; i <= insertions; i++) {
    bits += Math.log2((runs + i - 1) / i);
  }
  return bits;
}

/**
 * Minimum copies required to bring an observed equal-neighbor rate to
 * targetRate when each copy increases both the numerator and denominator.
 *
 * @param {number} equal
 * @param {number} opportunities
 * @param {number} targetRate
 */
function requiredRestorations(equal, opportunities, targetRate) {
  assert(targetRate > 0 && targetRate < 1);
  const needed = (targetRate * opportunities - equal) / (1 - targetRate);
  return Math.max(0, Math.ceil(needed - 1e-12));
}

/**
 * Exact log2 number of restored books under the stronger rule: each
 * original printed word may receive at most ONE missing adjacent copy.
 * A word with r maximal same-rune runs has r distinct one-copy outcomes.
 * Therefore the coefficient of x^k in product_w(1+r_w*x) counts all
 * distinct exactly-k restored, word-delimited books.
 *
 * @param {number[]} wordRunCounts
 * @param {number} maximumCopies
 * @returns {number[]} Log2 coefficients, indexed by inserted copies.
 */
function log2OneCopyPerWord(wordRunCounts, maximumCopies) {
  const dp = Array(maximumCopies + 1).fill(-Infinity);
  dp[0] = 0;
  let processed = 0;
  for (const runs of wordRunCounts) {
    assert(Number.isSafeInteger(runs) && runs > 0);
    const weight = Math.log2(runs);
    for (let k = Math.min(maximumCopies, processed + 1); k >= 1; k--) {
      const a = dp[k], b = dp[k - 1] + weight;
      if (a === -Infinity) dp[k] = b;
      else if (b !== -Infinity) {
        const higher = Math.max(a, b);
        dp[k] = higher + Math.log2(1 + 2 ** (Math.min(a, b) - higher));
      }
    }
    processed++;
  }
  return dp;
}
/** Original-corpus self-test and finite source-specific result. */
function run() {
  const corpus = /** @type {{pages:Array<{page:number,indices:number[]}>}} */ (
    readJson("resources/liber-primus/lp2-corpus.json")
  );
  const grid = /** @type {{bytes:number[]}} */ (
    readJson("resources/liber-primus/lp2-grid-256.json")
  );

  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
  const runeCount = pages.reduce((n, p) => n + p.indices.length, 0);
  const opportunities = pages.reduce((n, p) => n + p.indices.length - 1, 0);
  const equal = pages.reduce((n, p) => n + p.indices.reduce(
    (s, x, i, arr) => s + Number(i > 0 && x === arr[i - 1]), 0), 0);
  const sameRuneRuns = runeCount - equal;
  assert.deepEqual([pages.length, runeCount, opportunities, equal, sameRuneRuns],
    [55, 12956, 12901, 86, 12870]);

  assert.equal(grid.bytes.length, 256);
  assert(grid.bytes.every(x => Number.isInteger(x) && x >= 0 && x < 256));
  const sidecarBits = 8 * grid.bytes.length;
  let maxArbitraryRestorations = 0;
  while (log2Restorations(sameRuneRuns, maxArbitraryRestorations + 1)
    <= sidecarBits) maxArbitraryRestorations++;

  const uniformRate = 1 / 29;
  const uniformNeeded = requiredRestorations(equal, opportunities, uniformRate);
  const maxRate = (equal + maxArbitraryRestorations) /
    (opportunities + maxArbitraryRestorations);

  assert.equal(maxArbitraryRestorations, 297);
  assert.equal(uniformNeeded, 372);
  assert(Math.abs(log2Restorations(12870, 297) - 2042.84644191025) < 1e-7);
  assert(Math.abs(log2Restorations(12870, 298) - 2048.31191244537) < 1e-7);
  assert(Math.abs(log2Restorations(12870, 372) - 2440.62334419927) < 1e-7);
  assert(Math.abs(maxRate - 0.0290195484164267) < 1e-12);
  // Independent toy positive: 3 original runs, two inserted copies =>
  // [2,0,0],[1,1,0],[1,0,1],[0,2,0],[0,1,1],[0,0,2].
  assert.equal(2 ** log2Restorations(3, 2), 6);

  // Independently parse the exact 2,896 original printed words, including
  // the 32 words carried across image/page line wraps.
  const canonical = fs.readFileSync(
    path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
  const runes = new Map(corpus.runes.map((r, i) => [r, i]));
  const runeRegex = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
  const words = (canonical.split('%').slice(0, 55).join('%')
    .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '')
    .match(runeRegex) || []).map(s => Array.from(s, x => runes.get(x)));
  const wordRuns = words.map(w => w.length - w.reduce(
    (n, v, i) => n + Number(i > 0 && v === w[i - 1]), 0));
  assert.deepEqual([words.length, words.flat().length,
    wordRuns.reduce((a, b) => a + b, 0)], [2896, 12956, 12893]);
  const singleWordBits = log2OneCopyPerWord(wordRuns, uniformNeeded);
  let wordCapacity = 0;
  while (singleWordBits[wordCapacity + 1] <= sidecarBits) wordCapacity++;
  assert.equal(wordCapacity, 304);
  assert(Math.abs(singleWordBits[304] - 2046.7585129304) < 1e-7);
  assert(Math.abs(singleWordBits[305] - 2051.9599111292) < 1e-7);
  assert(Math.abs(singleWordBits[372] - 2388.8181902847) < 1e-7);
  const toy = log2OneCopyPerWord([2, 3], 2);
  assert(Math.abs(2 ** toy[1] - 5) < 1e-12);
  assert(Math.abs(2 ** toy[2] - 6) < 1e-12);
  const result = {
    kind: "Necessary capacity bound; no original plaintext or key",
    hypothesis: "Delete adjacent equal symbols; p50 bytes are the sole arbitrary restoration sidecar",
    physicalPages: pages.length,
    visibleRunes: runeCount,
    originalSamePageAdjacencies: opportunities,
    visibleAdjacentEqualities: equal,
    visibleSameRuneRuns: sameRuneRuns,
    gridBytes: grid.bytes.length,
    availableSidecarBits: sidecarBits,
    maximumArbitraryCopyRestorations: maxArbitraryRestorations,
    bitsAtMaximum: log2Restorations(sameRuneRuns, maxArbitraryRestorations),
    bitsForOneAdditional: log2Restorations(sameRuneRuns, maxArbitraryRestorations + 1),
    highestUniversalRestoredEqualityRate: maxRate,
    oneOmittedCopyPerPrintedWord: {
      originalWordCount: words.length,
      originalWordRuns: wordRuns.reduce((a, b) => a + b, 0),
      maxArbitraryCopyRestorations: wordCapacity,
      bitsAtMaximum: singleWordBits[wordCapacity],
      bitsForOneAdditional: singleWordBits[wordCapacity + 1],
      bitsForUniformGP29Copies: singleWordBits[uniformNeeded],
      deficitBits: singleWordBits[uniformNeeded] - sidecarBits
    },
    uniformGP29: {
      expectedEqualityRate: uniformRate,
      copiesNeeded: uniformNeeded,
      arbitraryPositionBitsNeeded: log2Restorations(sameRuneRuns, uniformNeeded),
      deficitBits: log2Restorations(sameRuneRuns, uniformNeeded) - sidecarBits
    },
    caveat: "Does not exclude patterned missing locations, side information elsewhere, or a nonuniform plaintext/cipher register"
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {log2Restorations, log2OneCopyPerWord, requiredRestorations, run};
