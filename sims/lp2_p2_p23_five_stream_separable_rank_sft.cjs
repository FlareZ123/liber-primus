/**
 * LP2 p2 versus p23-26: all-secret separable-additive five-stream obstruction.
 *
 * Reproduction: node sims/lp2_p2_p23_five_stream_separable_rank_sft.cjs
 * Requires only Node.js builtins and the repository's canonical LP2 corpus.
 *
 * The hypothesis is Y_j = pi(sum_{k=0}^4 f_k(X_{j,k}) mod 29),
 * where all five f_k are arbitrary secret GP29 lookup tables and pi
 * is an arbitrary unknown output-symbol permutation.
 * Same printed Y-rune at two positions forces a homogeneous linear
 * equality in the 145 unknown table values; no key search is needed.
 *
 * Source-motivated layouts: 201 consecutive quintets or five 201-rune
 * strands from the exact p23 post-red16 through p26 input (1005 runes),
 * paired with the only 201-rune unknown physical page p2.
 *
 * @see ../im-results/lp2-p2-p23-five-stream-separable-rank-obstruction.md
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const file = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const original = fs.readFileSync(file);
const blobSha = crypto.createHash('sha1')
  .update(Buffer.from('blob ' + original.length + '\0'))
  .update(original).digest('hex');
assert.equal(blobSha, '054f2a0f780b7d46901acbe3d9bf4f0ac1801165', 'Pinned canonical corpus Git blob');
const corpus = JSON.parse(original.toString('utf8'));
const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));
const p2 = pages.get(2);
const src = [...pages.get(23).slice(16), ...pages.get(24), ...pages.get(25), ...pages.get(26)];
assert.deepEqual([p2.length, pages.get(23).length, pages.get(24).length,
  pages.get(25).length, pages.get(26).length], [201, 213, 270, 273, 265]);
assert.equal(src.length, 1005);
assert.equal(new Set(p2).size, 29);
assert(src.concat(p2).every(x => Number.isInteger(x) && x >= 0 && x < 29));

const inverse = Array(29).fill(0);
for (let x = 1; x < 29; x++) {
  for (let y = 1; y < 29; y++) {
    if (x * y % 29 === 1) inverse[x] = y;
  }
}

/**
 * @param {number[]} stream 1005 original symbols
 * @param {'quintet'|'strand'} layout
 * @returns {number[][]} rows of five original symbols
 */
function layoutRows(stream, layout) {
  return Array.from({ length: 201 }, (_, j) =>
    Array.from({ length: 5 }, (_, k) =>
      stream[layout === 'quintet' ? 5 * j + k : 201 * k + j]));
}

/**
 * Construct only necessary equal-output linear constraints.
 * One row is needed for each repetition of an output symbol.
 *
 * @param {number[][]} inputs
 * @param {number[]} outputs
 * @returns {Uint8Array[]} GF29 rows, 145 columns each
 */
function constraints(inputs, outputs) {
  const first = new Map();
  const rows = [];
  for (let j = 0; j < outputs.length; j++) {
    const symbol = outputs[j];
    if (!first.has(symbol)) {
      first.set(symbol, j);
      continue;
    }
    const i = first.get(symbol);
    const v = new Uint8Array(145);
    for (let k = 0; k < 5; k++) {
      const a = 29 * k + inputs[j][k];
      const b = 29 * k + inputs[i][k];
      v[a] = (v[a] + 1) % 29;
      v[b] = (v[b] + 28) % 29;
    }
    rows.push(v);
  }
  return rows;
}

/**
 * Gaussian rank over GF(29), leaving the caller's rows unchanged.
 * @param {Uint8Array[]} rows
 * @returns {number}
 */
function rank29(rows) {
  const a = rows.map(row => Uint8Array.from(row));
  let r = 0;
  for (let col = 0; col < 145 && r < a.length; col++) {
    let pivot = r;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[pivot], a[r]] = [a[r], a[pivot]];
    const inv = inverse[a[r][col]];
    for (let j = col; j < 145; j++) a[r][j] = a[r][j] * inv % 29;
    for (let i = r + 1; i < a.length; i++) {
      const factor = a[i][col];
      if (factor === 0) continue;
      for (let j = col; j < 145; j++) {
        a[i][j] = (a[i][j] - factor * a[r][j] + 29 * 29) % 29;
      }
    }
    r++;
  }
  return r;
}

/**
 * Each coordinate's constant table gives one independent null vector.
 * Each unobserved input rune contributes another null vector.
 * The observed rank reaching this maximum proves there are no others.
 *
 * @param {number[][]} inputs
 * @returns {number}
 */
function maximumConstantRank(inputs) {
  let absent = 0;
  for (let k = 0; k < 5; k++) {
    const seen = new Set(inputs.map(row => row[k]));
    absent += 29 - seen.size;
  }
  return 145 - 5 - absent;
}

/** @param {number[][]} inputs */
function positivePlant(inputs) {
  // Five fixed nonlinear independent symbol functions and a bijective
  // output alphabet. The recovered result uses exactly the native layout.
  const values = inputs.map(row => row.reduce((sum, v, k) =>
    (sum + v * v + (k + 1) * v + k * 7) % 29, 0));
  const encoded = values.map(v => (7 * v + 11) % 29);
  assert.equal(new Set(encoded).size, 29, 'Native plant visits all 29 symbols');
  const decoded = encoded.map(v => ((v - 11 + 29) * inverse[7]) % 29);
  assert.deepEqual(decoded, values, 'Planted secret output permutation is reversible');
  return encoded;
}

console.log('[source] canonical corpus blob', blobSha);
console.log('[source] p2', p2.length, 'p23-26 post-red16', src.length, 'p2 distinct symbols', new Set(p2).size);

let tests = 0;
for (const layout of ['quintet', 'strand']) {
  const nativeInput = layoutRows(src, layout);
  const maxRank = maximumConstantRank(nativeInput);
  assert.equal(maxRank, layout === 'quintet' ? 139 : 140);
  const planted = positivePlant(nativeInput);
  const plantRank = rank29(constraints(nativeInput, planted));
  assert.equal(plantRank, maxRank - 1, 'Nonconstant source-native plant must remain feasible');
  console.log('[positive-control]', layout, 'rank', plantRank, 'max-constant', maxRank, 'PASS');

  for (const reverseSource of [false, true]) {
    for (const reverseTarget of [false, true]) {
      const input = layoutRows(reverseSource ? src.slice().reverse() : src, layout);
      const target = reverseTarget ? p2.slice().reverse() : p2;
      const equations = constraints(input, target);
      const constantRank = maximumConstantRank(input);
      const actualRank = rank29(equations);
      assert.equal(equations.length, 172);
      assert.equal(actualRank, constantRank);
      console.log('[original]', JSON.stringify({
        layout, reverseSource, reverseTarget, equations: equations.length,
        rank: actualRank, nullity: 145 - actualRank,
        missingRuneEntries: 140 - constantRank, targetDistinct: new Set(target).size
      }));
      tests++;
    }
  }
}

assert.equal(tests, 8);
console.log('[PASS] All eight original alignments force constant outputs from every stationary separable-additive five-input GP29 decoder.');
console.log('[scope] Nonseparable cross-input operations, evolving tables, alternate framing and external keys remain untested.');
