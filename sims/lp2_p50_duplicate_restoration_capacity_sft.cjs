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
module.exports = {log2Restorations, requiredRestorations, run};
