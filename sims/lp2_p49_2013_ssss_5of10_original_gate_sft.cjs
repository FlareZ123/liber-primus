'use strict';

/**
 * Exact original-source LP2 p49 ten-row / 2013 historical SSSS five-of-ten gate.
 *
 * Historical fact: the 2013 poster stage used threshold five out of ten shares.
 * Original LP2 p49 (scan66.jpg) prints exactly ten rows of eight radix-60 bytes,
 * the first ten rows of the 32x8 table extending through pp50-51.
 *
 * Model: each printed row is one decimal-ID 1..10 Shamir share carrying eight
 * independent GF256 symbols. Five rows determine every column's quartic;
 * rows six through ten are 40 predeclared predictions, independent of plaintext.
 *
 * Tests original top-down and reversed ten-row ordering with both common
 * GF256 irreducible polynomials. No per-byte x permutations, secret fitting
 * or key hunting. Node 22, CommonJS.
 */
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/base60-grid.json');
const {gf256, interpolate} = require('./grid_shamir_rs_inverse.cjs');

assert.equal(grid.byte_rows.length, 32);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
const first = grid.byte_rows.slice(0, 10);
assert.ok(first.every(row => row.length === 8
  && row.every(n => Number.isInteger(n) && n >= 0 && n < 256)));
const xs = [1,2,3,4,5];

/** @param {number[][]} rows @param {ReturnType<typeof gf256>} field */
function testRows(rows, field) {
  assert.equal(rows.length, 10);
  let correct = 0;
  const matched = [];
  const predicted = [];
  for (let x = 6; x <= 10; x++) {
    const values = [];
    for (let column = 0; column < 8; column++) {
      const known = rows.slice(0, 5).map(row => row[column]);
      const result = interpolate(xs, known, x, field);
      values.push(result);
      if (result === rows[x-1][column]) {
        correct++;
        matched.push({shareId:x,column,value:result});
      }
    }
    predicted.push(values);
  }
  return {correct,predicted,matched,checks:40};
}

/** @param {ReturnType<typeof gf256>} field @returns {number[][]} */
function plantedShares(field) {
  // Five independent coefficients per byte-column. Their values are fixed
  // before reading any observed share values.
  const polynomialCoefficients = Array.from({length:8}, (_, c) =>
    Array.from({length:5}, (_, j) => ((29*c + 43*j + 1033) % 256)));
  const rows = Array.from({length:10}, (_, ix) => {
    const x = ix + 1;
    return polynomialCoefficients.map(coeff =>
      coeff.slice().reverse().reduce((sum, a) =>
        field.add(field.mul(sum, x), a), 0));
  });
  for (let c=0;c<8;c++)
    assert.equal(interpolate(xs, rows.slice(0,5).map(row => row[c]), 0, field),
      polynomialCoefficients[c][0]);
  return rows;
}

const cases = [];
for (const fieldPolynomial of [0x11b,0x11d]) {
  const field = gf256(fieldPolynomial);
  const control = testRows(plantedShares(field), field);
  assert.equal(control.correct, 40, 'planted 5-of-10 source must recover all 40 predictions');
  for (const order of ['top-down','bottom-up']) {
    const rows = order === 'top-down' ? first : first.slice().reverse();
    const observed = testRows(rows,field);
    assert.equal(observed.correct,0,
      'original ten printed rows cannot be eight aligned quartic shares');
    cases.push({field:field.id,order,correct:observed.correct,
      checks:observed.checks,firstPredictedHoldoutRow:observed.predicted[0],
      firstActualHoldoutRow:rows[5],plantedControlMatches:control.correct});
  }
}
const output = {
  source:'Original LP2 p49 ten rows (image66) and historical 2013 threshold-5/10 SSSS stage',
  rows:10,columns:8,
  shareIds:'decimal 1..10',
  threshold:5,
  totalHeldOutPredictions:40,
  cases,
  exactOriginal5of10ShareCodewords:0,
  interpretation:'This exact fixed-coordinate, columnwise 5-of-10 GF256 mapping is excluded; no LP2 plaintext/key recovered.'
};
if (require.main === module) console.log(JSON.stringify(output,null,2));
module.exports = {testRows,plantedShares};
