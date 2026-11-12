"use strict";
/**
 * Source-linked 30×6 post-perimeter original table as six possible Shamir
 * shares of 30 bytes. This is a **conditional** mapping, not an authenticated
 * LP2 key. Original 2013 puzzle used 5-of-10 threshold shares; the direct
 * 30×6 interpretation asks whether five original table columns predict a sixth.
 *
 * Run: node sims/p50_inner180_sixshare_sft.cjs (Node 22, CommonJS).
 */
const assert = require("node:assert/strict");
const grid = require("../resources/liber-primus/base60-grid.json");
const {gf256, interpolate} = require("./grid_shamir_rs_inverse.cjs");
const rows = grid.byte_rows.slice(1, 31).map((row) => row.slice(1, 7));
assert.equal(rows.length, 30);
assert(rows.every((r) => r.length === 6));
assert.equal(grid.byte_rows.length, 32);

/** @param {ReturnType<typeof gf256>} field @param {number} x */
function fifthPower(field, x) {
  let v = 1;
  for (let i = 0; i < 5; i++) v = field.mul(v, x);
  return v;
}
/**
 * Standard threshold5 uses degree4; historical SSSS also motivates the
 * monic degree5 convention, whose leading coefficient is known as one.
 * @param {ReturnType<typeof gf256>} field
 * @param {number[]} data
 * @param {boolean} monic
 */
function predictSixth(field, data, monic) {
  const corrected = data.slice(0, 5)
    .map((v, i) => monic ? field.sub(v, fifthPower(field, i + 1)) : v);
  const calculated = interpolate([1,2,3,4,5], corrected, 6, field);
  return monic ? field.add(calculated, fifthPower(field, 6)) : calculated;
}
/** @param {ReturnType<typeof gf256>} field @param {number[]} coeff @param {number} x @param {boolean} monic */
function polynomial(field, coeff, x, monic) {
  let total = monic ? 1 : 0;
  for (let i = coeff.length - 1; i >= 0; i--)
    total = field.add(field.mul(total, x), coeff[i]);
  return total;
}
/**
 * @param {number[][]} sixRows
 * @param {ReturnType<typeof gf256>} field
 * @param {boolean} monic
 * @returns {{predictions:number[],matches:number,matchedRows:number[]}}
 */
function check(sixRows, field, monic) {
  const predictions = [], matchedRows = [];
  for (let i = 0; i < sixRows.length; i++) {
    const candidate = predictSixth(field, sixRows[i], monic);
    predictions.push(candidate);
    if (candidate === sixRows[i][5]) matchedRows.push(i);
  }
  return {predictions, matches:matchedRows.length, matchedRows};
}
const results = [];
for (const poly of [0x11b, 0x11d]) {
  const field = gf256(poly);
  for (const monic of [false, true]) {
    const plant = rows.map((_, i) => {
      const coeff = Array.from({length:5},
        (_, j) => (i * 37 + j * 43 + 1033) % 256);
      return Array.from({length:6},
        (_, j) => polynomial(field, coeff, j + 1, monic));
    });
    assert.equal(check(plant, field, monic).matches, 30);
    for (const orientation of ["forward", "reverse"]) {
      const input = orientation === "forward" ? rows :
        rows.map((r) => r.slice().reverse());
      const outcome = check(input, field, monic);
      assert.equal(outcome.matches, 0);
      results.push({
        field:"GF256/0x"+poly.toString(16), monic, orientation,
        matchedOriginalRows:outcome.matches,
        originalRows:rows.length,
        firstPredicted:outcome.predictions.slice(0, 5),
        firstActual:input.slice(0, 5).map((r) => r[5]),
        plantedMatched:30
      });
    }
  }
}
assert.equal(results.length, 8);
console.log(JSON.stringify({
  source:{grid:"32×8 across physical pp49–51",
    circumferenceRemoved:true,innerShape:[30,6],bytes:180,
    source2013Threshold:"5 of 10 (secondary mapping to 6 columns)"},
  models:results,
  exactOriginalSixShareCodewords:0,
  recoveredOriginalKey:false,
  interpretation:"Neither tested GF256 field, leading-coefficient convention nor orientation supplies even one original degree4/monic5 row prediction. A source-authenticated six-share model with different identities or field remains open."
},null,2));
