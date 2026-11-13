'use strict';

/**
 * Agent 38, 13 November 2026.
 * Five historical Sun 6x6 matrices in the authentic 30x6 table interior:
 * exact known-plaintext invertibility gate on solved p56 (85) + p57 (95).
 * The speculative geometric correspondence recovers no original LP2 text.
 * Read-only Node.js 22 SFT using original checked-in datasets.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
const gp = read('resources/liber-primus/lp2-corpus.json');
const table = read('resources/liber-primus/lp2-grid-256.json');
const mod = n => ((n % 29) + 29) % 29;
assert.equal(table.bytes.length, 256);
assert.deepEqual([gp.pages[55].indices.length, gp.pages[56].indices.length,
  gp.pages[57].indices.length], [76, 85, 95]);

/**
 * True solved p56 words, encoded with historically attested GP orthography.
 * @param {string} words
 * @returns {number[]}
 */
function encodeGp(words) {
  const tokens = gp.translit.map((word, index) => ({word, index}))
    .sort((a, b) => b.word.length - a.word.length);
  const output = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(token => word.startsWith(token.word, i));
      assert(match, 'Failed to encode canonical GP source word');
      output.push(match.index);
      i += match.word.length;
    }
  }
  return output;
}
const solvedP56 = encodeGp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(solvedP56.length, 85);

/** @param {number} len @returns {number[]} */
function primesUpToCount(len) {
  const p = [];
  for (let n = 2; p.length < len; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) {prime = false;break;}
    if (prime) p.push(n);
  }
  return p;
}
const primes = primesUpToCount(85);
let clock = 0;
const p56Decoded = gp.pages[56].indices.map((c, i) => {
  if (i === 56) {assert.equal(c, 0);return 0;}
  return mod(c - (primes[clock++] - 1));
});
assert.deepEqual(p56Decoded, solvedP56);
assert.equal(clock, 84);
const known = [...solvedP56, ...gp.pages[57].indices];
assert.equal(known.length, 180);

// Shedding the literal outermost 32x8 perimeter leaves exactly 30x6.
const interior = [];
for (let row = 1; row <= 30; row++) {
  for (let col = 1; col <= 6; col++) {
    interior.push(table.bytes[8 * row + col]);
  }
}
assert.equal(interior.length, 180);
const sun = [
   6, 32,  3, 34, 35,  1,
   7, 11, 27, 28,  8, 30,
  19, 14, 16, 15, 23, 24,
  18, 20, 22, 21, 17, 13,
  25, 29, 10,  9, 26, 12,
  36,  5, 33,  4,  2, 31,
].map(n => n - 1);
assert.deepEqual([...sun].sort((a, b) => a - b), Array.from({length:36}, (_, i) => i));
for (let row = 0; row < 6; row++) {
  assert.equal(sun.slice(6 * row, 6 * row + 6)
    .reduce((s, x) => s + x + 1, 0), 111);
}
const orders = new Map();
for (let flip = 0; flip < 2; flip++) {
  for (let turn = 0; turn < 4; turn++) {
    const order = Array(36);
    for (let i = 0; i < 36; i++) {
      let x = i % 6;
      let y = Math.floor(i / 6);
      if (flip) x = 5 - x;
      for (let j = 0; j < turn; j++) {
        const xx = 5 - y;
        y = x;
        x = xx;
      }
      order[6 * y + x] = sun[i];
    }
    for (let inverse = 0; inverse < 2; inverse++) {
      const k = inverse
        ? Array.from({length:36}, (_, i) => order.indexOf(i))
        : order;
      if (!orders.has(k.join(','))) orders.set(k.join(','), {flip, turn, inverse, k});
    }
  }
}
assert.equal(orders.size, 14);

/**
 * Necessary mismatches for any deterministic byte or GP29-token lookup.
 * @param {number[]} inValues
 * @param {number[]} output
 * @returns {number}
 */
function lookupErrors(inValues, output) {
  const groups = new Map();
  for (let i = 0; i < inValues.length; i++) {
    if (!groups.has(inValues[i])) groups.set(inValues[i], new Map());
    const group = groups.get(inValues[i]);
    group.set(output[i], (group.get(output[i]) || 0) + 1);
  }
  let matches = 0;
  for (const choices of groups.values()) matches += Math.max(...choices.values());
  return inValues.length - matches;
}

/** @param {number[][]} source @returns {number} */
function rank6(source) {
  const rows = source.map(row => row.slice());
  let pivots = 0;
  for (let col = 0; col < 6 && pivots < rows.length; col++) {
    const found = rows.findIndex((row, i) => i >= pivots && row[col] !== 0);
    if (found < 0) continue;
    [rows[pivots], rows[found]] = [rows[found], rows[pivots]];
    const reciprocal = Array.from({length:29}, (_, i) => i)
      .find(i => mod(i * rows[pivots][col]) === 1);
    assert.notEqual(reciprocal, undefined);
    rows[pivots] = rows[pivots].map(v => mod(v * reciprocal));
    for (let i = pivots + 1; i < rows.length; i++) {
      const factor = rows[i][col];
      for (let j = col; j < 6; j++) rows[i][j] = mod(rows[i][j] - factor * rows[pivots][j]);
    }
    pivots++;
  }
  return pivots;
}

/**
 * Grant any globally secret 6x6 Hill transform under the supplied source order.
 * Fit exactly 6 independent input rows, predict remaining 24 independent rows.
 * @param {number[][]} x
 * @param {number[][]} y
 * @returns {{fitted:number[],matches:number,holdoutMatches:number}}
 */
function fitHill6(x, y) {
  const fitted = [];
  for (let i = 0; i < x.length; i++) {
    if (rank6([...fitted.map(j => x[j]), x[i]]) > fitted.length) fitted.push(i);
    if (fitted.length === 6) break;
  }
  assert.equal(fitted.length, 6);
  const mat = fitted.map(i => [...x[i], ...y[i]]);
  for (let col = 0; col < 6; col++) {
    let row = col;
    while (mat[row][col] === 0) row++;
    [mat[row], mat[col]] = [mat[col], mat[row]];
    const inv = Array.from({length:29}, (_, i) => i)
      .find(i => mod(i * mat[col][col]) === 1);
    assert.notEqual(inv, undefined);
    for (let j = 0; j < 12; j++) mat[col][j] = mod(mat[col][j] * inv);
    for (let i = 0; i < 6; i++) if (i !== col) {
      const m = mat[i][col];
      for (let j = 0; j < 12; j++) mat[i][j] = mod(mat[i][j] - m * mat[col][j]);
    }
  }
  const coef = mat.map(row => row.slice(6));
  let matches = 0;
  for (let r = 0; r < x.length; r++) {
    for (let c = 0; c < 6; c++) {
      const result = mod(x[r].reduce((sum, z, i) => sum + z * coef[i][c], 0));
      if (result === y[r][c]) matches++;
    }
  }
  return {fitted, matches, holdoutMatches: matches - 36};
}
const target = Array.from({length:30}, (_, r) => known.slice(6 * r, 6 * r + 6));
const results = [];
const perBlock = Array.from({length:5}, () => ({
  full: 36, residue: 36, affine: 36, fullPerfect: 0,
}));
for (const {flip, turn, inverse, k} of orders.values()) {
  const rearranged = [];
  for (let block = 0; block < 5; block++) {
    const values = interior.slice(36 * block, 36 * (block + 1));
    const lookup = k.map(i => values[i]);
    const source = lookup.map(v => v % 29);
    const expected = known.slice(36 * block, 36 * (block + 1));
    const m = perBlock[block];
    const full = lookupErrors(lookup, expected);
    m.full = Math.min(m.full, full);
    if (full === 0) m.fullPerfect++;
    m.residue = Math.min(m.residue, lookupErrors(source, expected));
    let minAffine = 36;
    for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
      const actual = source.reduce((n, z, i) => n + (mod(a * z + b) === expected[i]), 0);
      minAffine = Math.min(minAffine, 36 - actual);
    }
    m.affine = Math.min(m.affine, minAffine);
    for (let row = 0; row < 6; row++) {
      rearranged.push(source.slice(6 * row, 6 * row + 6));
    }
  }
  const fit = fitHill6(rearranged, target);
  // An exact planted whole-interior Hill transform must always fit.
  const planted = rearranged.map(row => row.map((_, col) =>
    mod(row.reduce((n, z, i) => n + z * (i === col ? 7 : (i + col + 1)), 0))));
  const plantFit = fitHill6(rearranged, planted);
  assert.equal(plantFit.matches, 180);
  assert.equal(plantFit.holdoutMatches, 144);
  results.push({flip, turn, inverse, ...fit});
}
assert.deepEqual(perBlock.map(x => x.full), [1, 0, 2, 1, 0]);
assert.deepEqual(perBlock.map(x => x.residue), [11, 11, 11, 14, 10]);
assert.deepEqual(perBlock.map(x => x.affine), [27, 29, 27, 29, 29]);
assert.deepEqual(perBlock.map(x => x.fullPerfect), [0, 14, 0, 0, 2]);
assert.equal(results.length, 14);
assert(results.every(x => x.matches < 180));
const maxFit = results.reduce((a, b) => a.matches > b.matches ? a : b);
assert.equal(maxFit.matches, 44);
assert.equal(maxFit.holdoutMatches, 8);
console.log(JSON.stringify({
  source: 'original LP2 p49-51 32x8 outer/inner geometry; authentic p56+p57 180 GP plaintext',
  hypothesis: 'five 6x6 Sun squares as original interior receivers, each with source kamea orientations',
  candidates: 14, perBlockExactMinimumLookupMismatches: perBlock,
  globalAnySecretHill6Best: maxFit,
  independentPositiveHill6Plants: '14/14 recovered all 180 symbols and 144 heldout positions',
  recoveredUnknownP55Plaintext: false,
}, null, 2));
