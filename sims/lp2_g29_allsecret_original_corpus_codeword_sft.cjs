"use strict";

/**
 * Key-independent original-LP2 GF29 codeword test.
 *
 * The historical BASE29 3301 example and the LP2 p39 original red triad
 * independently supply a polynomial generator that divides the 256-byte
 * p50 numeric table. Test a sharply defined transfer hypothesis:
 *
 * Under ONE arbitrary unknown stationary 29-symbol substitution f, each
 * original unknown physical page (or each printed illustrated chapter)
 * becomes a polynomial divisible by that same monic degree-4 generator.
 *
 * Every original rune provides a linear coefficient of one of 29 unknown
 * symbol values f(0..28). Four parity equations per independent codeword
 * produce an exact GF29 linear system. There is no guessed alphabet,
 * optimized language fitness, fitted page key, or plaintext crib.
 *
 * Run on Windows 11 / Node.js 22 from the repository:
 *   node sims/lp2_g29_allsecret_original_corpus_codeword_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "base60-grid.json"), "utf8"));

const modulus = 29;
const generator = [1, 28, 13, 9, 14];
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22],
  [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];

/**
 * @param {number} x
 * @returns {number}
 */
function mod(x) {
  return ((x % modulus) + modulus) % modulus;
}

/**
 * @param {number} value
 * @returns {number}
 */
function inverse(value) {
  assert.ok(value > 0 && value < modulus);
  for (let i = 1; i < modulus; i++) {
    if ((value * i) % modulus === 1) return i;
  }
  throw new Error("Not invertible in GF29");
}

/**
 * Divide a descending-coefficient GF29 polynomial by the source monic
 * degree-four generator. Return the four descending remainder digits.
 * @param {number[]} original
 * @returns {number[]}
 */
function remainder(original) {
  assert.ok(original.every(x => Number.isInteger(x)));
  assert.ok(original.length >= generator.length);
  const v = original.map(mod);
  for (let i = 0; i <= v.length - generator.length; i++) {
    const leading = v[i];
    for (let j = 0; j < generator.length; j++) {
      v[i + j] = mod(v[i + j] - leading * generator[j]);
    }
  }
  return v.slice(-4);
}

/**
 * Multiplication by X modulo generator in the ascending coefficient basis.
 * X^4 = 15 + 20X + 16X^2 + X^3 over GF29.
 * @param {number[]} v
 * @returns {number[]}
 */
function step(v) {
  return [
    mod(15 * v[3]),
    mod(v[0] + 20 * v[3]),
    mod(v[1] + 16 * v[3]),
    mod(v[2] + v[3]),
  ];
}

/**
 * Four homogeneous equations in 29 completely unknown GP rune values.
 * @param {number[]} originalSymbols
 * @returns {number[][]}
 */
function symbolCodewordEquations(originalSymbols) {
  const rows = Array.from({length:4}, () => Array(modulus).fill(0));
  let polynomialBasis = [1, 0, 0, 0];
  for (let i = originalSymbols.length - 1; i >= 0; i--) {
    const symbol = originalSymbols[i];
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < modulus);
    for (let k = 0; k < 4; k++) {
      rows[k][symbol] = mod(rows[k][symbol] + polynomialBasis[k]);
    }
    polynomialBasis = step(polynomialBasis);
  }
  return rows;
}

/**
 * Exact reduced row echelon form over GF29.
 * @param {number[][]} originalRows
 * @returns {{rank:number,rows:number[][],pivots:number[]}}
 */
function rref(originalRows) {
  const rows = originalRows.map(row => {
    assert.equal(row.length, modulus);
    return row.map(mod);
  });
  const pivots = [];
  let target = 0;
  for (let column = 0; column < modulus && target < rows.length; column++) {
    let pivot = target;
    while (pivot < rows.length && rows[pivot][column] === 0) pivot++;
    if (pivot === rows.length) continue;
    [rows[target], rows[pivot]] = [rows[pivot], rows[target]];
    const scale = inverse(rows[target][column]);
    for (let k = column; k < modulus; k++) {
      rows[target][k] = mod(rows[target][k] * scale);
    }
    for (let i = 0; i < rows.length; i++) {
      if (i === target || rows[i][column] === 0) continue;
      const multiple = rows[i][column];
      for (let k = column; k < modulus; k++) {
        rows[i][k] = mod(rows[i][k] - multiple * rows[target][k]);
      }
    }
    pivots.push(column);
    target++;
  }
  return {rank:target, rows, pivots};
}

/**
 * Recover one generator for the one-dimensional unknown-symbol nullspace.
 * @param {{rank:number,rows:number[][],pivots:number[]}} reduced
 * @returns {number[]}
 */
function oneDimensionalKernel(reduced) {
  assert.equal(reduced.rank, modulus - 1);
  const free = Array.from({length:modulus}, (_, i) => i)
    .filter(i => !reduced.pivots.includes(i));
  assert.equal(free.length, 1);
  const solution = Array(modulus).fill(0);
  solution[free[0]] = 1;
  for (let i = reduced.rank - 1; i >= 0; i--) {
    const pivot = reduced.pivots[i];
    let sum = 0;
    for (let j = pivot + 1; j < modulus; j++) {
      sum = mod(sum + reduced.rows[i][j] * solution[j]);
    }
    solution[pivot] = mod(-sum);
  }
  assert.ok(reduced.rows.every(row =>
    mod(row.reduce((s, v, j) => s + v * solution[j], 0)) === 0));
  return solution;
}

/**
 * Build a synthetic fixed-secret substitution that is deliberately not
 * restricted to a Caesar shift. Same alphabet used for all nine chapters.
 * @returns {number[]}
 */
function plantedPermutation() {
  const permutation = Array.from({length:modulus},
    (_, i) => mod(13 * i + 17));
  for (let i = modulus - 1; i > 0; i--) {
    const j = (i * i + 3 * i + 4) % (i + 1);
    [permutation[i], permutation[j]] =
      [permutation[j], permutation[i]];
  }
  assert.equal(new Set(permutation).size, modulus);
  return permutation;
}

/**
 * Systematic encoder preserves the source block's length and all but its
 * last four rune positions. Parity is determined by the same p50 divisor.
 * @param {number[]} observed
 * @returns {number[]}
 */
function makeCodeword(observed) {
  const original = observed.slice(0, -4);
  const required = remainder([...original, 0, 0, 0, 0])
    .map(x => mod(-x));
  const codeword = [...original, ...required];
  assert.equal(codeword.length, observed.length);
  assert.deepEqual(remainder(codeword), [0, 0, 0, 0]);
  return codeword;
}

/**
 * @param {number[][]} groups
 * @returns {{rank:number,rows:number[][],pivots:number[]}}
 */
function equationsRank(groups) {
  return rref(groups.flatMap(symbolCodewordEquations));
}

function main() {
  assert.equal(corpus.pages.length, 58);
  const sourcePages = corpus.pages.slice(0, 56)
    .filter(p => p.indices.length > 0);
  assert.equal(sourcePages.length, 55);
  assert.equal(sourcePages.reduce((s, p) => s + p.indices.length, 0), 12956);
  assert.equal(corpus.pages[50].runic_count, 0);

  const sourceChapters = chapters.map(([first, last]) =>
    corpus.pages.slice(first, last + 1).flatMap(p => p.indices));
  assert.equal(sourceChapters.length, 9);
  assert.equal(sourceChapters.reduce((s, p) => s + p.length, 0), 12956);
  assert.ok(sourceChapters.every(chapter => chapter.length >= 4));

  const originalGrid = table.byte_rows.flat();
  assert.equal(originalGrid.length, 256);
  assert.deepEqual(remainder(originalGrid), [0, 0, 0, 0],
    "Original 2013/p39-linked generator must divide unmodified p50 bytes");

  const originalPages = equationsRank(sourcePages.map(p => p.indices));
  const originalChapters = equationsRank(sourceChapters);
  const oneWholeBook = equationsRank([sourceChapters.flat()]);
  const twoSolvedPages = equationsRank(
    [corpus.pages[56].indices, corpus.pages[57].indices]);
  assert.equal(originalPages.rank, 29);
  assert.equal(originalChapters.rank, 29);
  assert.equal(oneWholeBook.rank, 4);
  assert.equal(twoSolvedPages.rank, 8);

  // A genuine source-length-shaped coded text encrypted under one completely
  // unknown stationary nonlinear alphabet must be recoverable by this solver.
  const secret = plantedPermutation();
  const plantedCodewords = sourceChapters.map(makeCodeword);
  const encrypted = plantedCodewords.map(word => word.map(x => secret[x]));
  const found = equationsRank(encrypted);
  assert.equal(found.rank, 28, "Synthetic fixed-key code is identifiable");
  const recovered = oneDimensionalKernel(found);
  assert.equal(new Set(recovered).size, 29);
  const expectedInverse = Array(29).fill(0);
  for (let i = 0; i < modulus; i++) expectedInverse[secret[i]] = i;
  const free = Array.from({length:modulus}, (_, i) => i)
    .find(i => !found.pivots.includes(i));
  assert.ok(recovered.every((v, i) =>
    mod(v * expectedInverse[free]) ===
      mod(expectedInverse[i] * recovered[free])),
  "All 29 secret symbol values recovered up to unavoidable common GF29 scale");

  console.log(JSON.stringify({
    decision:"NO SINGLE UNKNOWN STATIONARY GP29 ALPHABET MAKES EVERY PAGE OR EACH OF NINE CHAPTERS A G-CODEWORD",
    originalPolynomial:"x^4+28x^3+13x^2+9x+14 over GF29",
    independentTableRemainder:remainder(originalGrid),
    originalRuneCount:12956,
    sourcePageModel:{
      independentBlocks:sourcePages.length,
      equations:sourcePages.length * 4,
      exactRank:originalPages.rank,
      availableNonzeroAlphabetValues:29 - originalPages.rank,
    },
    sourceChapterModel:{
      independentBlocks:sourceChapters.length,
      equations:sourceChapters.length * 4,
      exactRank:originalChapters.rank,
      availableNonzeroAlphabetValues:29 - originalChapters.rank,
    },
    singleWholeBookCounterexample:{
      independentBlocks:1,
      equations:4,
      exactRank:oneWholeBook.rank,
      unspecifiedDimensions:29 - oneWholeBook.rank,
    },
    authenticSolvedTwoPageControlRank:twoSolvedPages.rank,
    positivePlantedSecret:{
      sourceLengthMatchedChapters:plantedCodewords.length,
      exactRank:found.rank,
      nullity:29 - found.rank,
      inverseRecoveredAll29UpToScalar:true,
      allNineOriginalLengthCodewordsPass:true,
    },
    scope:"Static common unknown rune permutation only; page/chapter g-parity; no unknown plaintext inferred",
  }, null, 2));
}

if (require.main === module) main();
module.exports = {
  main, mod, inverse, remainder, step, symbolCodewordEquations,
  rref, oneDimensionalKernel, plantedPermutation, makeCodeword,
};
