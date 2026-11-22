'use strict';

/**
 * LP2 terminal [256,180] F(X)^19 erasure-completion SFT.
 * Reads the original source table and unchanged GP29 rune corpus.
 * Solves for all 76 withheld p55 runes, in either the physical terminal
 * concatenation or the table's 76-perimeter / 180-interior geometry.
 * Every result is an exact GF29 decoding of a *hypothetical* code family.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const P = 29;
const mod = (n) => ((n % P) + P) % P;

/** @param {number} n @returns {number} */
function inverse(n) {
  for (let k = 1; k < P; k++) if (n * k % P === 1) return k;
  throw new Error('No inverse in GF29 for ' + n);
}

/**
 * Multiply ascending-power GF29 polynomials.
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) result[i + j] = mod(result[i + j] + a[i] * b[j]);
  }
  return result;
}
const H = [3, 26, 24]; // Historical signed 2013 BASE29(3301)=3QO
const G = [27, 5, 15]; // Original p39 red GP triad
const F = multiply(H, G);
assert.deepEqual(F, [23, 21, 11, 17, 12]);
let F19 = [1];
for (let i = 0; i < 19; i++) F19 = multiply(F19, F);
assert.deepEqual([F19.length, F19[0], F19[76]], [77, 25, 17]);

/**
 * Remainder of 256 descending coefficients modulo F(X)^19.
 * @param {number[]} descending @returns {number[]}
 */
function syndrome(descending) {
  assert.equal(descending.length, 256);
  const work = descending.map(mod).reverse();
  const invLead = inverse(F19[76]);
  for (let i = work.length - 77; i >= 0; i--) {
    const factor = work[i + 76] * invLead % P;
    for (let j = 0; j < 77; j++) work[i + j] = mod(work[i + j] - factor * F19[j]);
  }
  return work.slice(0, 76);
}

/**
 * GP transliteration preserving source word boundaries.
 * @param {string} phrase @returns {number[]}
 */
function encodeWords(phrase) {
  const tokens = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const values = [];
  for (const word of phrase.split(' ')) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(({s}) => word.startsWith(s, i));
      assert.ok(found, 'Unknown GP spelling in ' + word);
      values.push(found.i);
      i += found.s.length;
    }
  }
  return values;
}
const p55 = corpus.pages[55].indices;
const p56Cipher = corpus.pages[56].indices;
const p57 = corpus.pages[57].indices;
const p56Plain = encodeWords(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
assert.deepEqual([p55.length, p56Cipher.length, p56Plain.length, p57.length],
  [76, 85, 85, 95]);

/**
 * Unique 76-prefix that makes F(X)^19 divide the complete 256-word given
 * its last 180 high-degree-first coefficients. The constant F19[0] is a unit.
 * @param {number[]} suffix180 @returns {number[]}
 */
function completePrefix(suffix180) {
  assert.equal(suffix180.length, 180);
  const low = suffix180.slice().reverse();
  const q = [];
  const invConstant = inverse(F19[0]);
  for (let i = 0; i < 180; i++) {
    let residual = low[i];
    for (let j = 1; j <= Math.min(i, 76); j++) residual -= F19[j] * q[i - j];
    q.push(mod(residual * invConstant));
  }
  const decoded = multiply(q, F19).reverse();
  assert.deepEqual(decoded.slice(76), suffix180);
  assert.deepEqual(syndrome(decoded), Array(76).fill(0));
  return decoded.slice(0, 76);
}

// Physical clockwise outer border from upper-left cell, followed by natural
// 30x6 row-major interior. Positions refer to the original 32x8 table.
const border = [];
for (let x = 0; x < 8; x++) border.push(x);
for (let y = 1; y < 32; y++) border.push(y * 8 + 7);
for (let x = 6; x >= 0; x--) border.push(31 * 8 + x);
for (let y = 30; y >= 1; y--) border.push(y * 8);
const inside = [];
for (let y = 1; y <= 30; y++) {
  for (let x = 1; x <= 6; x++) inside.push(y * 8 + x);
}
assert.deepEqual([border.length, inside.length], [76, 180]);

/**
 * Gaussian elimination over GF29 of every unknown perimeter rune, using
 * all 76 residue constraints and 180 exact known interior symbols.
 * @param {number[]} interior180
 * @returns {{runes:number[], rank:number, residual:number[]}}
 */
function completePerimeter(interior180) {
  assert.equal(interior180.length, 180);
  const known = Array(256).fill(0);
  inside.forEach((position, i) => { known[position] = interior180[i]; });
  const target = syndrome(known).map(n => mod(-n));
  const columns = border.map(position => {
    const basis = Array(256).fill(0);
    basis[position] = 1;
    return syndrome(basis);
  });
  const matrix = Array.from({length: 76}, (_, i) =>
    [...columns.map(col => col[i]), target[i]]);
  let rank = 0;
  const pivots = [];
  for (let col = 0; col < 76; col++) {
    let pivot = rank;
    while (pivot < 76 && matrix[pivot][col] === 0) pivot++;
    if (pivot === 76) continue;
    [matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]];
    const scalar = inverse(matrix[rank][col]);
    for (let j = col; j <= 76; j++) matrix[rank][j] = mod(matrix[rank][j] * scalar);
    for (let row = 0; row < 76; row++) {
      if (row === rank || !matrix[row][col]) continue;
      const factor = matrix[row][col];
      for (let j = col; j <= 76; j++) {
        matrix[row][j] = mod(matrix[row][j] - factor * matrix[rank][j]);
      }
    }
    pivots.push(col);
    rank++;
  }
  assert.equal(rank, 76, 'The source border placements must specify 76 independent equations');
  const runes = Array(76).fill(0);
  pivots.forEach((col, i) => { runes[col] = matrix[i][76]; });
  border.forEach((position, i) => { known[position] = runes[i]; });
  const residual = syndrome(known);
  assert.deepEqual(residual, Array(76).fill(0));
  return {runes, rank, residual};
}

const sourceGrid = grid.rows.flat().map(token =>
  60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]));
assert.equal(sourceGrid.length, 256);
const sourceQuotient = sourceGrid.slice(0, 180).map(n => n % P);
const plantedCodeword = multiply(sourceQuotient.slice().reverse(), F19).reverse();
assert.equal(plantedCodeword.length, 256);
// Positive control: a nontrivial known valid codeword is recovered completely
// from its untouched suffix, independently of how it was constructed.
assert.deepEqual(completePrefix(plantedCodeword.slice(76)),
  plantedCodeword.slice(0, 76));
// Separate geometric control, with the same codeword but border masked.
const plantedInterior = inside.map(position => plantedCodeword[position]);
const plantedBorder = border.map(position => plantedCodeword[position]);
assert.deepEqual(completePerimeter(plantedInterior).runes, plantedBorder);

/**
 * @param {number[]} predicted @returns {number}
 */
function exactMatches(predicted) {
  return predicted.filter((n, i) => n === p55[i]).length;
}
const results = {};
for (const [register, p56] of [['known-plaintext', p56Plain], ['visible-cipher', p56Cipher]]) {
  const known180 = [...p56, ...p57];
  const direct = completePrefix(known180);
  const rim = completePerimeter(known180);
  results[register] = {
    contiguous: {
      matchesToOriginalP55: exactMatches(direct),
      predictedRunes: direct.map(n => corpus.translit[n]).join('-')
    },
    perimeterInterior: {
      uniqueRank: rim.rank,
      matchesToOriginalP55: exactMatches(rim.runes),
      predictedRunes: rim.runes.map(n => corpus.translit[n]).join('-')
    }
  };
}
assert.equal(results['known-plaintext'].contiguous.matchesToOriginalP55, 2);
assert.equal(results['visible-cipher'].contiguous.matchesToOriginalP55, 5);
assert.equal(results['known-plaintext'].perimeterInterior.matchesToOriginalP55, 3);
assert.equal(results['visible-cipher'].perimeterInterior.matchesToOriginalP55, 5);
console.log(JSON.stringify({
  source: 'Original GP29 terminal pages 55-57 and 2013/p39 quartic',
  generator: 'F(X)^19 with degree 76 and 180 input degrees of freedom',
  sourcePlant: 'All 76/76 unknown symbols recovered in two independent geometries',
  results,
  decision: 'No authentic p55 ciphertext or readable plaintext recovered'
}, null, 2));
