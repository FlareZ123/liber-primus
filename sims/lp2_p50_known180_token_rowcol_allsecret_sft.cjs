'use strict';

/**
 * Source-constrained known-interior inverse for the 32×8 original LP2 table.
 * Exact 180 p56+p57 known GP29 plaintext symbols occupy its 30×6 interior;
 * the complementary 76 border cells are the candidate unknown p55 receiver.
 *
 * Challenge a generous source-local stateful function:
 *   P(row,col) = F(original printed table token) + R(row) + C(col) mod29.
 * F, R and C are all secret, free, unrelated GP29 values, not fitted
 * against any unknown LP2 ciphertext. This includes affine-byte models.
 *
 * Use exact modular Gaussian elimination. If the 180 known equations are
 * inconsistent, no full 76-symbol p55 decoder of this form can exist.
 * Synthetic plants must recover a consistent original-layout system.
 *
 * Replay: node sims/lp2_p50_known180_token_rowcol_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/base60-grid.json');
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
/** @param {number} x @returns {number} */
function inverse(x) {
  for (let k = 1; k < MOD; k++) if ((x * k) % MOD === 1) return k;
  throw new Error('No inverse for zero');
}
const p56 = corpus.pages.find(p => p.page === 56).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(p56[56], 0);
const primes = [];
for (let candidate = 2; primes.length < 85; candidate++) {
  let good = true;
  for (let j = 2; j*j <= candidate; j++) {
    if (candidate % j === 0) { good = false; break; }
  }
  if (good) primes.push(candidate);
}
let shiftIndex = 0;
const p56Plain = p56.map((v, index) =>
  index === 56 ? 0 : mod(v - (primes[shiftIndex++] - 1)));
assert.equal(shiftIndex, 84);
assert.equal(p56Plain.slice(0, 9).map(v => corpus.translit[v]).join(''),
  'ANENDWITH');
const known = p56Plain.concat(p57);
assert.equal(known.length, 180);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));
const inner = [], border = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) {
    const d = { row, col, byte: grid.byte_rows[row][col] };
    if (row > 0 && row < 31 && col > 0 && col < 7) inner.push(d);
    else border.push(d);
  }
}
assert.equal(inner.length, 180);
assert.equal(border.length, 76);
const tokens = [...new Set(inner.map(d => d.byte))];
const tokenIndex = new Map(tokens.map((token,i) => [token,i]));
assert.equal(tokens.length, 127);

/**
 * @param {number[][]} input Original known-source design matrix over F29.
 * @param {number[]} target Original known-GP plaintext or synthetic plant.
 * @param {number} nvars
 */
function solve(input, target, nvars) {
  assert.equal(input.length, target.length);
  const a = input.map((coeffs,i) => {
    assert.equal(coeffs.length, nvars);
    return coeffs.map(mod).concat(mod(target[i]));
  });
  let rank = 0;
  const pivots = [];
  for (let col = 0; col < nvars; col++) {
    let selected = -1;
    for (let i = rank; i < a.length; i++) {
      if (a[i][col] !== 0) { selected = i; break; }
    }
    if (selected < 0) continue;
    [a[selected], a[rank]] = [a[rank], a[selected]];
    const scale = inverse(a[rank][col]);
    for (let j = col; j <= nvars; j++) a[rank][j] = mod(a[rank][j] * scale);
    for (let i = 0; i < a.length; i++) {
      if (i === rank) continue;
      const factor = a[i][col];
      if (factor !== 0) {
        for (let j = col; j <= nvars; j++)
          a[i][j] = mod(a[i][j] - factor * a[rank][j]);
      }
    }
    pivots.push(col);
    rank++;
  }
  let contradictions = 0;
  for (let i = rank; i < a.length; i++) {
    assert(a[i].slice(0,nvars).every(v => v === 0));
    if (a[i][nvars] !== 0) contradictions++;
  }
  return {rank, variables:nvars, equations:a.length, contradictions,
    exact_solution_exists:contradictions===0};
}

/** @param {{row:number,col:number,byte:number}} cell */
function features(cell) {
  const out = Array(tokens.length + 40).fill(0);
  const j = tokenIndex.get(cell.byte);
  if (j !== undefined) out[j] = 1;
  out[tokens.length + cell.row] = 1;
  out[tokens.length + 32 + cell.col] = 1;
  return out;
}
const design = inner.map(features);
const candidate = solve(design, known, tokens.length + 40);
assert.deepEqual(candidate, {
  rank:161, variables:167, equations:180,
  contradictions:19, exact_solution_exists:false
});
/** Strongest all-secret additive class: 127 free token values, 32 row,
 * 8 column values, including independent registers for each printed row. */
const coefficients = Array.from({length:tokens.length+40}, (_,j) =>
  (17*j*j + 23*j + 11) % MOD);
const planted = design.map(row =>
  mod(row.reduce((sum,value,j) => sum + value*coefficients[j],0)));
const nativePositive = solve(design, planted, tokens.length+40);
assert.deepEqual(nativePositive,{
  rank:161,variables:167,equations:180,
  contradictions:0,exact_solution_exists:true
});
/** Exact smaller subfamily: affine numeric token, row and column. */
const affine = solve(inner.map(d => [1, d.byte % MOD, d.row, d.col]),known,4);
assert.equal(affine.rank,4);
assert.equal(affine.contradictions,168);
assert.equal(affine.exact_solution_exists,false);
const results = {
  status:'FINITE ORIGINAL-INPUT NEGATIVE',
  input:'Original LP2 p49–51 32×8 table; solved p56 85 GP and clear p57 95 GP',
  printed_bytes:256, known_interior_runes:180, unknown_border_candidate:76,
  distinct_interior_table_tokens:tokens.length,
  source_geometry:'30×6 interior, source-ordered row-major',
  all_secret_token_plus_row_plus_column_additive_mod29:candidate,
  affine_byte_row_column_mod29:affine,
  exact_known_source_positive:nativePositive,
  conclusion:'The 180 known p56+p57 runes contradict every additive separable GP29 mapping with independent hidden values per source token, printed row and printed column; no p55 plaintext or historical cipher follows.'
};
if (require.main === module) console.log(JSON.stringify(results,null,2));
module.exports={solve,features,results};
