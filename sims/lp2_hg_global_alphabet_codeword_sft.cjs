'use strict';

/**
 * Original LP2 H/G dual-quadratic chapter-codeword hidden-alphabet test.
 * Run with Node.js 22 from any working directory. Reads source JSON only.
 *
 * A single unknown permutation g of 29 rune labels is allowed, without
 * enumerating the 29! permutations. If every chapter's g-labeled polynomial
 * has zero syndrome modulo the source-specified quartic F, then A*g=0.
 * Full rank(A)=29 makes every bijection impossible, independent of language.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const MOD = 29;
const FACTOR = [1, 28, 13, 9, 14]; // descending: H*G, monic
const CHAPTERS = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];

/** @param {number} n @returns {number} */
function mod(n) { return ((n % MOD) + MOD) % MOD; }

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let i = 1; i < MOD; i++) if (mod(a * i) === 1) return i;
  throw Error('Noninvertible pivot: ' + a);
}

/**
 * Exact syndrome of a high-to-low GF29 polynomial divided by monic H*G.
 * @param {number[]} coeffs
 * @returns {number[]}
 */
function remainder(coeffs) {
  const a = coeffs.map(mod);
  for (let i = 0; i < a.length - 4; i++) {
    const leading = a[i];
    for (let j = 0; j < 5; j++) a[i + j] = mod(a[i + j] - leading * FACTOR[j]);
  }
  return a.slice(-4);
}

/**
 * Four linear equations for each chapter, with 29 unknown decoded rune values.
 * @param {number[][]} streams
 * @returns {number[][]}
 */
function syndromeRows(streams) {
  return streams.flatMap((stream) => {
    const rows = Array.from({ length: 4 }, () => Array(29).fill(0));
    for (let glyph = 0; glyph < 29; glyph++) {
      const r = remainder(stream.map((x) => Number(x === glyph)));
      for (let j = 0; j < 4; j++) rows[j][glyph] = r[j];
    }
    return rows;
  });
}

/**
 * Full finite-field RREF, rank and a basis of the nullspace.
 * @param {number[][]} rows
 * @returns {{rank:number,free:number[],basis:number[][]}}
 */
function nullspace(rows) {
  const a = rows.map((row) => row.slice());
  const pivots = [];
  let h = 0;
  for (let col = 0; col < 29 && h < a.length; col++) {
    let k = h;
    while (k < a.length && a[k][col] === 0) k++;
    if (k === a.length) continue;
    [a[h], a[k]] = [a[k], a[h]];
    const scale = inverse(a[h][col]);
    for (let j = col; j < 29; j++) a[h][j] = mod(a[h][j] * scale);
    for (let i = 0; i < a.length; i++) {
      if (i === h || a[i][col] === 0) continue;
      const factor = a[i][col];
      for (let j = col; j < 29; j++) a[i][j] = mod(a[i][j] - factor * a[h][j]);
    }
    pivots.push(col);
    h++;
  }
  const free = Array.from({ length: 29 }, (_, i) => i).filter((i) => !pivots.includes(i));
  const basis = free.map((f) => {
    const v = Array(29).fill(0);
    v[f] = 1;
    for (let i = 0; i < pivots.length; i++) v[pivots[i]] = mod(-a[i][f]);
    return v;
  });
  return { rank: h, free, basis };
}

/** @param {number[]} sequence @returns {number[]} */
function multiplyFactor(sequence) {
  const out = Array(sequence.length + 4).fill(0);
  for (let i = 0; i < sequence.length; i++) {
    for (let j = 0; j < FACTOR.length; j++) {
      out[i + j] = mod(out[i + j] + sequence[i] * FACTOR[j]);
    }
  }
  return out;
}

const table = grid.pages.flatMap((page) => page.bytes);
assert.equal(table.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(table)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(remainder(table), [0, 0, 0, 0],
  'Both independently sourced H and G must divide the original table.');

const pages = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const original = CHAPTERS.map(([start, stop]) => {
  const a = [];
  for (let i = start; i <= stop; i++) a.push(...pages.get(i));
  return a;
});
assert.deepEqual(original.map((a) => a.length), LENGTHS);
const originalRows = syndromeRows(original);
const prefixRanks = CHAPTERS.map((_, i) => nullspace(originalRows.slice(0, (i + 1) * 4)).rank);
assert.deepEqual(prefixRanks, [4, 8, 12, 16, 20, 24, 28, 29, 29]);

const firstSeven = nullspace(originalRows.slice(0, 28));
assert.equal(firstSeven.rank, 28);
assert.equal(firstSeven.basis.length, 1);
const firstSevenDistinct = new Set(firstSeven.basis[0]).size;
assert.equal(firstSevenDistinct, 20);
const entire = nullspace(originalRows);
assert.equal(entire.rank, 29);
assert.equal(entire.basis.length, 0);
const reverseRank = nullspace(syndromeRows(original.map((a) => a.slice().reverse()))).rank;
assert.equal(reverseRank, 29);

// Authentic clear p57 as the known-plaintext source, not a claim about LP2.
// Encode a synthetically valid H/G chapter code, hide all 29 output glyph
// values through an unknown affine permutation, and recover its decoder.
const clear = pages.get(57);
assert.equal(clear.length, 95);
const synthetic = LENGTHS.map((n) => {
  const plaintext = Array.from({ length: n - 4 }, (_, i) => clear[i % clear.length]);
  const codeword = multiplyFactor(plaintext);
  assert.deepEqual(remainder(codeword), [0, 0, 0, 0]);
  return codeword.map((value) => mod(25 * (value - 3))); // inverse of g(c)=7c+3
});
const plantRows = syndromeRows(synthetic);
const plant = nullspace(plantRows);
assert.equal(plant.rank, 28);
assert.deepEqual(plant.free, [28]);
assert.equal(plant.basis.length, 1);
const trueDecoder = Array.from({ length: 29 }, (_, c) => mod(7 * c + 3));
assert.equal(new Set(plant.basis[0]).size, 29);
assert(plantRows.every((row) =>
  mod(row.reduce((sum, val, i) => sum + val * trueDecoder[i], 0)) === 0));
const normalization = inverse(trueDecoder[28]);
assert.deepEqual(plant.basis[0], trueDecoder.map((x) => mod(x * normalization)));

console.log(JSON.stringify({
  source: 'original LP2 p0-p55, unchanged GP29 indices; H*G factor checked against table',
  spans: CHAPTERS,
  lengths: LENGTHS,
  syndrome_constraints: originalRows.length,
  unknown_alphabet_values: 29,
  prefix_ranks: prefixRanks,
  seven_chapter_candidate_distinct_values: firstSevenDistinct,
  all_nine_rank: entire.rank,
  all_nine_reversed_rank: reverseRank,
  admissible_global_bijections: 0,
  known_plaintext_plant_rank: plant.rank,
  known_plaintext_plant_decoder_recovered_up_to_scalar: true,
  authentic_unknown_plaintext_recovered: false
}, null, 2));
