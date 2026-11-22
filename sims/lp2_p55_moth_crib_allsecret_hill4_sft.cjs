"use strict";

/**
 * Source-matched p55 moth crib versus *every* stationary affine 4x4 GP29
 * Hill transformation, all four source-alignment phases.
 *
 * Possible human lead: LP1 p5 and LP2 p55 reuse the original moth; p15
 * literally prints a 4x4 number matrix. The p55 suffix's seven exact GP
 * word-length matches nominate a candidate but do not authenticate it.
 *
 * For each phase, complete blocks inside the untouched 30-rune suffix
 * supply linear equations Y = X*M + b over GF(29). Rank(X|Y_j)>rank(X)
 * for any output j proves the *nonexistence* of every secret key M,b
 * under the fixed block cipher regardless of matrix invertibility.
 *
 * SFT: node sims/lp2_p55_moth_crib_allsecret_hill4_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const c = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const cipher = c.pages.find(p => p.page === 55).indices.slice(46);
const phrase = [
  ["TH", "E"], ["T", "O", "T", "I", "E", "N", "T"],
  ["F", "U", "N", "C", "T", "IA", "N"], ["I", "S"],
  ["S", "A", "C", "R", "E", "D"], ["A", "L", "L"],
  ["TH", "NG", "S"]
];
assert.deepEqual(phrase.map(w => w.length), [2, 7, 7, 2, 6, 3, 3]);
const plain = phrase.flat().map(token => c.translit.indexOf(token));
assert.equal(plain.length, 30);
assert.equal(cipher.length, 30);
assert(plain.every(x => x >= 0 && x < 29));
assert.deepEqual(cipher,
  [12, 18, 28, 18, 10, 6, 14, 6, 15, 18,
    15, 12, 2, 2, 18, 15, 2, 22, 5, 28,
    10, 19, 5, 14, 23, 11, 1, 17, 18, 10]);
const mod = x => (x % 29 + 29) % 29;

/** @param {number} x @returns {number} */
function inverse(x) {
  assert.notEqual(mod(x), 0);
  for (let v = 1; v < 29; v++) if (mod(x * v) === 1) return v;
  throw Error("GF29 inverse does not exist");
}

/**
 * Gauss-Jordan over GF29.
 * @param {number[][]} matrix
 * @returns {{rank:number,rows:number[][],pivots:number[]}}
 */
function echelon(matrix) {
  assert(matrix.length > 0);
  const rows = matrix.map(r => r.map(mod)), pivots = [];
  let rank = 0;
  for (let j = 0; j < rows[0].length && rank < rows.length; j++) {
    let at = rank;
    while (at < rows.length && rows[at][j] === 0) at++;
    if (at === rows.length) continue;
    [rows[rank], rows[at]] = [rows[at], rows[rank]];
    const d = inverse(rows[rank][j]);
    for (let k = j; k < rows[0].length; k++)
      rows[rank][k] = mod(rows[rank][k] * d);
    for (let i = 0; i < rows.length; i++) {
      if (i === rank) continue;
      const a = rows[i][j];
      for (let k = j; k < rows[0].length; k++)
        rows[i][k] = mod(rows[i][k] - a * rows[rank][k]);
    }
    pivots.push(j);
    rank++;
  }
  return { rank, rows, pivots };
}

/**
 * All complete four-symbol blocks inside suffix for one global phase.
 * @param {number[]} inRune
 * @param {number[]} outRune
 * @param {number} phase
 * @param {boolean} affine
 */
function system(inRune, outRune, phase, affine) {
  const inBlocks = [], outBlocks = [], starts = [];
  for (let i = phase; i + 4 <= inRune.length; i += 4) {
    starts.push(i);
    inBlocks.push([
      ...inRune.slice(i, i + 4), ...(affine ? [1] : [])
    ]);
    outBlocks.push(outRune.slice(i, i + 4));
  }
  const r = echelon(inBlocks).rank;
  return { starts, inBlocks, outBlocks, rank: r,
    augmentedRanks: Array.from({ length: 4 }, (_, j) =>
      echelon(inBlocks.map((line, i) =>
        [...line, outBlocks[i][j]])).rank)
  };
}

const fixedMatrix = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
assert.equal(echelon(fixedMatrix).rank, 4, "original p15 matrix invertible");

/**
 * Apply source p15 4x4 matrix to a planted native plaintext and
 * independent fixed per-output affine constant, phase-aligned.
 * The untouched suffix partial blocks are outside the asserted inverse.
 * @param {number[]} input
 * @param {number} phase
 * @param {boolean} affine
 */
function plant(input, phase, affine) {
  const out = input.slice(), b = [7, 5, 2, 11];
  for (let k = phase; k + 4 <= input.length; k += 4) {
    for (let j = 0; j < 4; j++)
      out[k + j] = mod(fixedMatrix[j].reduce(
        (n, row, i) => n + row * input[k + i], affine ? b[j] : 0));
  }
  return out;
}
const cases = [];
for (const affine of [false, true]) {
  for (let phase = 0; phase < 4; phase++) {
    const original = system(plain, cipher, phase, affine);
    const expectedRank = affine ? 5 : 4;
    assert.equal(original.rank, expectedRank);
    assert.deepEqual(original.augmentedRanks,
      [expectedRank + 1, expectedRank + 1,
        expectedRank + 1, expectedRank + 1]);
    const positive = system(plain, plant(plain, phase, affine),
      phase, affine);
    assert.equal(positive.rank, expectedRank);
    assert.deepEqual(positive.augmentedRanks,
      [expectedRank, expectedRank, expectedRank, expectedRank],
      "actual p15 source 4x4 key must survive all-secret consistency");
    cases.push({
      affine, phase, completeBlocks: original.inBlocks.length,
      originalRank: original.rank,
      originalRankPerOutput: original.augmentedRanks,
      originalCompatible: false,
      genuineP15MatrixPositive: true
    });
  }
}
assert.equal(cases.length, 8);
console.log(JSON.stringify({
  source: "original p55[46..75] versus LP1-p5 terminal-seven-word crib",
  exactGP29Runes: 30,
  allSecretFixedAndAffineHill4: cases,
  conclusion: "conditional crib rejects all stationary affine 4x4 GP29 block ciphers; no unknown plaintext"
}, null, 2));
