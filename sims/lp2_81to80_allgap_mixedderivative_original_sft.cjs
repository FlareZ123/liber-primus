"use strict";
/**
 * All-gap 81x81 -> 80x80 mixed-finite-difference inverse gate.
 *
 * A genuine original-source clue is the repeated six-rune phrase immediately
 * before 6561=81^2 and at the end of the 12956-rune unsolved stream. A direct
 * one-layer source square / target square of 80^2-5 runes is conjectural.
 *
 * For every orientation and all five-missing-cell gap placements, allow an
 * entirely arbitrary, NON-INJECTIVE secret 29->29 output substitution after
 * the mixed finite difference. The best lookup is an upper bound for all
 * permutations, modular-affine layers, or named static S-boxes.
 *
 * Run: node sims/lp2_81to80_allgap_mixedderivative_original_sft.cjs
 * Read-only Node22 CommonJS, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
assert.equal(pages.length, 55);
const source = pages.flatMap(page => page.indices);
assert.equal(source.length, 12956);
const side = 80;
const modulus = 29;
const square = source.slice(0, 81 * 81);
const printedTarget = source.slice(81 * 81);
assert.equal(printedTarget.length, side * side - 5);
const six = [23, 11, 1, 17, 18, 10];
assert.deepEqual(source.slice(6555, 6561), six);
assert.deepEqual(source.slice(-6), six);

/**
 * Map 81x81 adjacent squares to their 80x80 mixed differences.
 * @param {number[]} input Array of 6561 GP29 residues.
 * @returns {Int32Array}
 */
function mixedDifference(input) {
  const result = new Int32Array(side * side);
  for (let row = 0; row < side; row++) {
    for (let col = 0; col < side; col++) {
      const top = 81 * row + col;
      const bottom = top + 81;
      const value = input[top] - input[top + 1] -
        input[bottom] + input[bottom + 1];
      result[side * row + col] = (value % modulus + modulus) % modulus;
    }
  }
  return result;
}

/**
 * @param {Int32Array} src
 * @param {number} orientation Dihedral D4 matrix operation index 0..7.
 * @returns {Int32Array}
 */
function oriented(src, orientation) {
  const result = new Int32Array(src.length);
  for (let row = 0; row < side; row++) {
    for (let col = 0; col < side; col++) {
      let r = row, c = col;
      if (orientation === 1) c = side - 1 - col;
      else if (orientation === 2) r = side - 1 - row;
      else if (orientation === 3) { r = side - 1 - row; c = side - 1 - col; }
      else if (orientation === 4) { r = col; c = row; }
      else if (orientation === 5) { r = col; c = side - 1 - row; }
      else if (orientation === 6) { r = side - 1 - col; c = row; }
      else if (orientation === 7) {
        r = side - 1 - col; c = side - 1 - row;
      }
      result[side * row + col] = src[side * r + c];
    }
  }
  return result;
}

/**
 * Exact optimum across every placement of a CONTIGUOUS gap of five cells.
 * For any placement, choose an independent best target for EACH of the 29
 * derivative residues (the secret lookup may collide). Thus observed
 * mismatches are a rigorous lower bound for even an unrestricted output S-box.
 *
 * @param {Int32Array} predicted full length 6400
 * @param {number[]} observed length 6395
 * @returns {{edits:number,matches:number,gap:number}}
 */
function bestArbitraryLookupAndGap(predicted, observed) {
  const n = observed.length;
  assert.equal(predicted.length, n + 5);
  const table = new Int32Array(modulus * modulus);
  for (let i = 0; i < n; i++) {
    table[modulus * predicted[i + 5] + observed[i]]++;
  }
  function maxMatches() {
    let hits = 0;
    for (let x = 0; x < modulus; x++) {
      let most = 0;
      for (let y = 0; y < modulus; y++) {
        const count = table[modulus * x + y];
        if (count > most) most = count;
      }
      hits += most;
    }
    return hits;
  }
  let best = {edits: n + 1, matches: 0, gap: -1};
  for (let gap = 0; gap <= n; gap++) {
    const matches = maxMatches();
    if (n - matches < best.edits) {
      best = {edits: n - matches, matches, gap};
    }
    if (gap < n) {
      const y = observed[gap];
      table[modulus * predicted[gap + 5] + y]--;
      table[modulus * predicted[gap] + y]++;
    }
  }
  return best;
}

const fieldInputs = [
  {name: "gpIndex", values: square},
  {name: "gpPrime", values: square.map(rune => corpus.prime[rune] % 29)}
];
const results = [];
for (const field of fieldInputs) {
  const derivative = mixedDifference(field.values);
  for (let orientation = 0; orientation < 8; orientation++) {
    results.push({
      field: field.name,
      orientation,
      ...bestArbitraryLookupAndGap(
        oriented(derivative, orientation), printedTarget)
    });
  }
}
results.sort((a, b) => a.edits - b.edits);
assert.equal(results.length, 16);
assert.deepEqual(results[0], {
  field: "gpPrime", orientation: 0, edits: 5975, matches: 420, gap: 1968
});
assert.ok(results.every(result => result.edits >= 5975));

// Exact synthetic planted-positive with a nontrivial secret invertible output
// relabelling and missing five-cell block at unknown true insertion index.
const syntheticMatrix = oriented(
  mixedDifference(fieldInputs[1].values), 3);
const plantedGap = 1234;
const synthetic = Array.from({length: printedTarget.length}, (_, i) =>
  (7 * syntheticMatrix[i < plantedGap ? i : i + 5] + 11) % 29);
const recovered = bestArbitraryLookupAndGap(syntheticMatrix, synthetic);
assert.deepEqual(recovered,
  {edits: 0, matches: 6395, gap: plantedGap});

process.stdout.write(JSON.stringify({
  hypothesis: "mixed finite difference of 81x81 into 80x80 minus five cells",
  originalUnknownRunes: source.length,
  exactSourceSixRuneBoundary: six,
  originalTargetRunes: printedTarget.length,
  candidateOrientations: 8,
  inputRepresentations: fieldInputs.map(field => field.name),
  gapPlacementsPerCandidate: printedTarget.length + 1,
  unconstrainedOutputRelabelling: true,
  bestOriginal: results.slice(0, 4),
  worstOriginal: results[results.length - 1],
  plantedControl: recovered,
  verdict: "minimum 5975 original output changes even with arbitrary output map"
}, null, 2) + "\n");
