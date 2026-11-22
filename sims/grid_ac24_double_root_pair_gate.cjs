"use strict";
/**
 * LP2 source-conditioned Ac=24 double-root GP29 polynomial and 127-pair gate.
 *
 * The 256 printed bytes have first coefficient 203=0 mod29, so the
 * formal 256-position polynomial has degree254. Oversized Ac on p54
 * supplies root24. Two divisions yield 253 canonical F29 coefficients,
 * with a leading zero retained in the 254-slot fixed-width array. Compare two
 * natural pair layouts with 51 p53 highlighted runes plus 76 p55 runes.
 *
 * Does a secret but stationary 29^2 -> 29 map explain the source?
 * A single pair with two distinct target values rigorously excludes it.
 *
 * Node 22: node sims/grid_ac24_double_root_pair_gate.cjs
 * Classification: source-level finite exclusion; no unknown LP2 plaintext.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const grid = load("resources/liber-primus/base60-grid.json");
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const MODULUS = 29;
const normalized = x => ((x % MODULUS) + MODULUS) % MODULUS;

/**
 * Synthetic division of a descending-coefficient polynomial by (X - root).
 * @param {number[]} coefficients
 * @param {number} root
 * @returns {{quotient:number[],remainder:number}}
 */
function divide(coefficients, root) {
  assert(coefficients.length >= 2);
  const quotient = [normalized(coefficients[0])];
  for (let i = 1; i < coefficients.length - 1; i++)
    quotient.push(normalized(coefficients[i] + root * quotient[i-1]));
  const remainder = normalized(coefficients.at(-1) + root * quotient.at(-1));
  return { quotient, remainder };
}

/**
 * Multiply a polynomial by (X-root), keeping descending coefficients.
 * @param {number[]} coefficients
 * @param {number} root
 * @returns {number[]}
 */
function multiplyByLinear(coefficients, root) {
  const output = Array(coefficients.length + 1).fill(0);
  for (let i = 0; i < coefficients.length; i++) {
    output[i] = normalized(output[i] + coefficients[i]);
    output[i+1] = normalized(output[i+1] - root * coefficients[i]);
  }
  return output;
}

/** @param {number[]} coefficients @param {number} root @returns {number} */
function evaluate(coefficients, root) {
  return coefficients.reduce((value, coefficient) =>
    normalized(value * root + coefficient), 0);
}

/**
 * @param {number[]} quotient 254 original GP29 coefficients
 * @param {"adjacent"|"halves"} layout
 * @returns {Array<[number,number]>}
 */
function pairsOf(quotient, layout) {
  assert.equal(quotient.length, 254);
  return Array.from({ length: 127 }, (_, i) =>
    layout === "adjacent"
      ? [quotient[i*2], quotient[i*2+1]]
      : [quotient[i], quotient[i+127]]);
}

/**
 * Test a completely unrestricted stationary pair->GP mapping, including
 * mappings unknown to the investigator.
 * @param {Array<[number,number]>} pairs
 * @param {number[]} target
 */
function mapConsistency(pairs, target) {
  const first = new Map();
  const conflicts = [];
  let duplicates = 0;
  for (let i = 0; i < pairs.length; i++) {
    const key = pairs[i][0] + "," + pairs[i][1];
    const earlier = first.get(key);
    if (earlier) {
      duplicates++;
      if (earlier.value !== target[i])
        conflicts.push({
          pair: pairs[i], firstAt: earlier.position, secondAt: i,
          firstRuneIndex: earlier.value, secondRuneIndex: target[i]
        });
    } else first.set(key, { position: i, value: target[i] });
  }
  return { uniquePairs: first.size, duplicates, conflicts: conflicts.length,
    firstConflict: conflicts[0] || null };
}

/** @param {Array<[number,number]>} pairs @param {number[]} target */
function maxAffineHits(pairs, target) {
  let best = {hits: -1, a: 0, b: 0, c: 0};
  for (let a = 0; a < 29; a++)
    for (let b = 0; b < 29; b++)
      for (let c = 0; c < 29; c++) {
        let hits = 0;
        for (let i = 0; i < pairs.length; i++)
          if (normalized(a*pairs[i][0] + b*pairs[i][1] + c) === target[i])
            hits++;
        if (hits > best.hits) best = { hits, a, b, c };
      }
  return best;
}

/**
 * Lift a field residue to a nearby legal byte while preserving the original
 * byte's broad 29-value band.
 * @param {number} residue
 * @param {number} original
 * @returns {number}
 */
function lift(residue, original) {
  let value = original - original % 29 + residue;
  if (value > 255) value -= 29;
  assert(value >= 0 && value <= 255 && value % 29 === residue);
  return value;
}


/**
 * Canonical polynomial quotient has 253 coefficients: the published 254-slot
 * quotient retains its leading zero from byte 203. Exhaust every one-symbol
 * reinsertion and both source reading orientations, with no fitted key.
 * @param {number[]} paddedQuotient
 * @param {number[]} target
 */
function allSinglePads(paddedQuotient, target) {
  assert.equal(paddedQuotient.length, 254);
  assert.equal(paddedQuotient[0], 0);
  const canonical = paddedQuotient.slice(1);
  assert.equal(canonical.length, 253);
  assert.notEqual(canonical[0], 0);
  const results = [];
  for (const reverseQuotient of [false, true]) {
    const q = reverseQuotient ? [...canonical].reverse() : canonical;
    for (const reverseTarget of [false, true]) {
      const t = reverseTarget ? [...target].reverse() : target;
      for (const layout of ["adjacent", "halves"]) {
        let minConflicts = Infinity, fits = 0;
        for (let insert = 0; insert <= 253; insert++)
          for (let pad = 0; pad < 29; pad++) {
            const candidate = q.slice(0, insert).concat([pad], q.slice(insert));
            const n = mapConsistency(pairsOf(candidate, layout), t).conflicts;
            if (n < minConflicts) minConflicts = n;
            if (n === 0) fits++;
          }
        results.push({reverseQuotient,reverseTarget,layout,
          paddingTrials:254*29,minConflicts,consistentPads:fits});
      }
    }
  }
  assert.deepEqual(results.map(x => x.minConflicts),[1,6,0,7,0,7,1,6]);
  assert.deepEqual(results.map(x => x.consistentPads),[0,0,790,0,790,0,0,0]);
  return results;
}

function main() {
  const tokenAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
  assert.equal(grid.alphabet, tokenAlphabet);
  assert.equal(grid.rows.length, 32);
  assert(grid.rows.every(row => row.length === 8));
  const tokens = grid.rows.flat();
  const bytes = grid.byte_rows.flat();
  assert.deepEqual(tokens.map(token => tokenAlphabet.indexOf(token[0]) * 60
    + tokenAlphabet.indexOf(token[1])), bytes);
  const sha256 = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(sha256, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const page53 = corpus.pages.find(page => page.page === 53);
  const page54 = corpus.pages.find(page => page.page === 54);
  const page55 = corpus.pages.find(page => page.page === 55);
  const marked = ink.pages.find(page => page.page === 53).red_spans[0];
  assert.equal(page53.indices.length, 179);
  assert.equal(page54.indices[0], 24); // Oversized Ac initial.
  assert.deepEqual({start:marked.start,length:marked.length},{start:128,length:51});
  assert.equal(page55.indices.length, 76);
  const red = page53.indices.slice(128);
  assert.deepEqual([...marked.runes].map(rune => corpus.runes.indexOf(rune)), red);
  const target = red.concat(page55.indices);
  assert.equal(target.length, 127);
  assert.equal(target.length * 2 + 2, bytes.length);
  const root = page54.indices[0];

  const originalPolynomial = bytes.map(b => b % 29);
  const first = divide(originalPolynomial, root);
  const second = divide(first.quotient, root);
  assert.equal(first.remainder, 0);
  assert.equal(second.remainder, 0);
  assert.notEqual(evaluate(second.quotient, root), 0); // Exactly a double root.
  assert.deepEqual(
    multiplyByLinear(multiplyByLinear(second.quotient, root), root),
    originalPolynomial
  );
  assert.equal(second.quotient.length, 254);
  assert.equal(bytes[0], 203);
  assert.equal(originalPolynomial[0], 0);
  assert.equal(second.quotient[0], 0);
  const paddedGate = allSinglePads(second.quotient, target);
  const originalTests = {};
  for (const layout of ["adjacent", "halves"]) {
    const pairs = pairsOf(second.quotient, layout);
    const consistency = mapConsistency(pairs, target);
    assert(consistency.conflicts > 0, "A stationary mapping should fail here");
    const bestAffine = maxAffineHits(pairs, target);
    assert(bestAffine.hits < target.length);
    originalTests[layout] = { consistency, bestAffine };
  }
  assert.deepEqual(
    [originalTests.adjacent.consistency.duplicates,
      originalTests.adjacent.consistency.conflicts,
      originalTests.halves.consistency.duplicates,
      originalTests.halves.consistency.conflicts],
    [6,6,9,8]
  );
  assert.equal(originalTests.adjacent.bestAffine.hits, 15);
  assert.equal(originalTests.halves.bestAffine.hits, 15);

  // Fully source-shaped synthetic encoding of all 127 authentic runes into
  // adjacent pairs; no plaintext model is inferred from this synthetic plant.
  const plantedQuotient = target.flatMap(symbol => [symbol, normalized(symbol+13)]);
  const plantedField = multiplyByLinear(
    multiplyByLinear(plantedQuotient, root), root);
  const plantedBytes = plantedField.map((x, i) => lift(x, bytes[i]));
  const plantedFirst = divide(plantedBytes.map(x => x%29), root);
  const plantedSecond = divide(plantedFirst.quotient, root);
  assert.equal(plantedFirst.remainder, 0);
  assert.equal(plantedSecond.remainder, 0);
  assert.deepEqual(plantedSecond.quotient, plantedQuotient);
  assert.deepEqual(pairsOf(plantedSecond.quotient, "adjacent")
    .map(pair => pair[0]), target);
  assert.equal(mapConsistency(pairsOf(plantedSecond.quotient, "adjacent"),
    target).conflicts, 0);

  console.log(JSON.stringify({
    classification: "source-root candidate, finite pair-map exclusion; no recovered plaintext",
    gridSha256: sha256, markedAcGPIndex: root,
    page53Highlighted: red.length, page55: page55.indices.length,
    pairedOriginalTarget: target.length, gridCoefficients: bytes.length,
    divisionRemainders: [first.remainder, second.remainder],
    twiceDividedFieldCoefficients: second.quotient.length,
    doubleRootExact: true,
    originalTests,
    paddedGate,
    plantedPositiveControl: "127/127 source-rune targets exactly recovered"
  }, null, 2));
}

if (require.main === module) main();
module.exports = { divide, multiplyByLinear, evaluate, pairsOf, mapConsistency };
