"use strict";

/**
 * Source-constrained all-secret H/G block-code exclusion on original LP2.
 *
 * Test the conditional hypothesis that each 256-rune block belongs to the
 * exact source H(X)G(X) code, after applying one shared but unknown arbitrary
 * GP29 symbol permutation f. Instead of searching 29! keys, construct four
 * parity equations per block in the 29 unknown values f(0),...,f(28).
 * Full rank 29 makes every nonzero f impossible, including every bijection.
 *
 * Only the original p50 codeword, its authenticated H/G polynomials, and
 * 12,956 unchanged ciphertext runes enter the hypothesis.
 * Run: node sims/lp2_hg256_allsecret_substitution_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = filename => JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");

const MODULUS = 29;
const BLOCK_SIZE = 256;
const GENERATOR = [14, 9, 13, 28, 1]; // monic H(X)*G(X), ascending powers
const ciphertext = corpus.pages.filter(page => page.page < 56)
  .flatMap(page => page.indices);
assert.equal(ciphertext.length, 12956);
assert.equal(grid.bytes.length, BLOCK_SIZE);
assert.deepEqual(corpus.pages.find(page => page.page === 50).indices, []);

/** @param {number} value @returns {number} */
function mod(value) {
  return (value % MODULUS + MODULUS) % MODULUS;
}

/**
 * A fixed-width, high-degree-first polynomial's remainder modulo H*G.
 * @param {number[]} highCoefficients
 * @returns {number[]} Four low-degree-first residues.
 */
function remainder(highCoefficients) {
  const coefficients = highCoefficients.map(mod).reverse();
  for (let power = coefficients.length - 1; power >= 4; power--) {
    const top = coefficients[power];
    for (let j = 0; j <= 4; j++) {
      coefficients[power - 4 + j] =
        mod(coefficients[power - 4 + j] - top * GENERATOR[j]);
    }
  }
  return coefficients.slice(0, 4);
}

assert.deepEqual(remainder(grid.bytes), [0, 0, 0, 0]);
assert.deepEqual(grid.bytes.slice(252).map(mod), [6, 7, 15, 22]);

/**
 * Compute x * p(x) mod generator in the 1,x,x²,x³ basis.
 * @param {number[]} coefficients
 * @returns {number[]}
 */
function multiplyByX(coefficients) {
  const next = [0, ...coefficients];
  const top = next[4];
  for (let j = 0; j <= 4; j++) {
    next[j] = mod((next[j] ?? 0) - top * GENERATOR[j]);
  }
  return next.slice(0, 4);
}

// columns[i] = x^(255-i) modulo H*G, as four GF29 coefficients.
const columns = Array(BLOCK_SIZE);
let power = [1, 0, 0, 0];
for (let i = BLOCK_SIZE - 1; i >= 0; i--) {
  columns[i] = power;
  power = multiplyByX(power);
}

/**
 * Each 256-rune block gives four homogeneous equations in f(0)..f(28).
 * @param {number[]} symbols
 * @returns {number[][]}
 */
function equations(symbols) {
  assert.equal(symbols.length, BLOCK_SIZE);
  const rows = Array.from({length: 4}, () => Array(MODULUS).fill(0));
  for (let i = 0; i < BLOCK_SIZE; i++) {
    const symbol = symbols[i];
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < MODULUS);
    for (let j = 0; j < 4; j++) {
      rows[j][symbol] = mod(rows[j][symbol] + columns[i][j]);
    }
  }
  return rows;
}

const inverses = Array(MODULUS).fill(0);
for (let i = 1; i < MODULUS; i++) {
  for (let j = 1; j < MODULUS; j++) {
    if (mod(i * j) === 1) {
      inverses[i] = j;
      break;
    }
  }
  assert(inverses[i] > 0);
}

/**
 * Exact Gaussian rank over GF(29).
 * @param {number[][]} sourceRows
 * @returns {number}
 */
function rank(sourceRows) {
  const a = sourceRows.map(row => row.slice());
  let current = 0;
  for (let col = 0; col < MODULUS && current < a.length; col++) {
    let pivot = current;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot >= a.length) continue;
    [a[current], a[pivot]] = [a[pivot], a[current]];
    const inv = inverses[a[current][col]];
    for (let j = col; j < MODULUS; j++)
      a[current][j] = mod(a[current][j] * inv);
    for (let i = current + 1; i < a.length; i++) {
      const factor = a[i][col];
      if (factor === 0) continue;
      for (let j = col; j < MODULUS; j++) {
        a[i][j] = mod(a[i][j] - factor * a[current][j]);
      }
    }
    current++;
  }
  return current;
}

/** @param {number[]} codeword @param {(value:number)=>number} map */
function isCodewordAfterMap(codeword, map) {
  return remainder(codeword.map(map)).every(value => value === 0);
}

// The all-secret result is phase-independent, and only the first 8 complete
// blocks are necessary. Later unknown pages remain untouched by this gate.
const rankByBlocks = Array.from({length: 8}, () => ({}));
let firstPhaseRank = 0;
let directCodewordHits = 0;
for (let phase = 0; phase < BLOCK_SIZE; phase++) {
  const rows = [];
  for (let block = 0; block < 8; block++) {
    const offset = phase + BLOCK_SIZE * block;
    const glyphs = ciphertext.slice(offset, offset + BLOCK_SIZE);
    if (isCodewordAfterMap(glyphs, value => value))
      directCodewordHits++;
    rows.push(...equations(glyphs));
    const k = rank(rows);
    const hist = rankByBlocks[block];
    hist[k] = (hist[k] ?? 0) + 1;
    if (phase === 0 && block === 7) firstPhaseRank = k;
  }
}
assert.deepEqual(rankByBlocks.slice(0, 6).map(hist => Object.keys(hist)), [
  ["4"], ["8"], ["12"], ["16"], ["20"], ["24"]
]);
assert.deepEqual(rankByBlocks[6], {"27": 1, "28": 255});
assert.deepEqual(rankByBlocks[7], {"29": 256});
assert.equal(firstPhaseRank, 29);
assert.equal(directCodewordHits, 0);

// Exact positive: construct eight valid codewords with arbitrary randomized
// 252-symbol bodies, calculate their four parity residues, and hide the code
// alphabet under an unknown affine GP29 bijection. This validates that the
// equations detect genuine codewords without knowing their substitution.
let seed = 0x3301;
/** @returns {number} */
function rng() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plantedCiphertext = [];
const plantedRows = [];
const trueMap = value => mod(5 * value + 11);
for (let block = 0; block < 8; block++) {
  const coded = Array.from({length: 252}, () => rng() % MODULUS);
  const padding = coded.concat([0, 0, 0, 0]);
  const suffix = remainder(padding).reverse().map(value => mod(-value));
  const message = coded.concat(suffix);
  assert.deepEqual(remainder(message), [0, 0, 0, 0]);
  const disguised = message.map(value => mod(6 * (value - 11)));
  assert.deepEqual(disguised.map(trueMap), message);
  assert(isCodewordAfterMap(disguised, trueMap));
  plantedCiphertext.push(...disguised);
  plantedRows.push(...equations(disguised));
}
assert.equal(plantedCiphertext.length, 8 * BLOCK_SIZE);
assert.equal(rank(plantedRows), 28);
assert(plantedRows.every(row => row.reduce(
  (sum, value, index) => mod(sum + value * trueMap(index)), 0) === 0));

const result = {
  classification: "Exact conditional original-cipher exclusion; no plaintext recovered",
  sourceInputs: {
    corpus: "resources/liber-primus/lp2-corpus.json",
    sourceCode: "resources/liber-primus/lp2-grid-256.json",
    codeGeneratorLowFirst: GENERATOR,
    printedGridRemainder: remainder(grid.bytes),
    unchangedUnknownRunes: ciphertext.length
  },
  hypothesis: "Shared arbitrary GP29 alphabet relabeling f, then every consecutive 256-rune ciphertext block belongs to the source H/G code",
  original: {
    phaseCount: BLOCK_SIZE,
    blocksPerPhaseTested: 8,
    runesPerPhaseTested: 8 * BLOCK_SIZE,
    rankByFirstBlockCount: rankByBlocks,
    firstPhaseRank,
    directCodewordHits,
    all256PhasesFullRank29: rankByBlocks[7]["29"] === BLOCK_SIZE,
    nonzeroSharedSubstitutionPossible: false
  },
  plantedControl: {
    codewords: 8,
    unknownAffinePermutation: "f(c)=5*c+11 mod29",
    allEightExactlyValid: true,
    parityMatrixRank: rank(plantedRows),
    trueSecretMapSatisfiesAllEquations: true
  },
  interpretation: "The first eight original blocks suffice to exclude every fixed GP29 bijection for each of the 256 rune phases. No constraint is established on per-block changing substitutions, nonlinear inter-block encodings, or an independently source-selected clock."
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
