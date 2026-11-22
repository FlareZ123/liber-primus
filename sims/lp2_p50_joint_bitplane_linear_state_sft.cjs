"use strict";

/**
 * LP2 p49–51 original 32×8 byte panel as an unknown small GF(2)-linear
 * generator: exact all-secret shared-recurrence obstruction.
 *
 * For a d-bit linear state s_(t+1)=A*s_t and byte y_t=L*s_t, each of its
 * eight output bitplanes satisfies the SAME monic binary recurrence of
 * degree <=d, by the characteristic polynomial of A (Cayley-Hamilton).
 * The polynomial/taps, initial state and output matrix need not be known.
 * An affine update/output embeds into d+1 homogeneous state bits.
 *
 * A printed byte is one successive generator output in original row-major
 * order. Other traversals, hidden postprocessing or generating several
 * output bytes per state update are outside this exact model.
 *
 * SFT: node sims/lp2_p50_joint_bitplane_linear_state_sft.cjs
 * Node.js 22, CommonJS, built-ins only.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const bytes = source.byte_rows.flat();
assert.equal(source.byte_rows.length, 32);
assert(source.byte_rows.every(row => row.length === 8));
assert.equal(bytes.length, 256);
assert(bytes.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
const digest = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
assert.equal(digest,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {bigint} value @returns {number} */
function parity(value) {
  let result = 0;
  for (let n = value; n; n &= n - 1n) result ^= 1;
  return result;
}

/**
 * Solve for a single common q-lag recurrence on all 8 independent bitplanes:
 * output[t,k] = XOR(j=1..q, tap[j-1] & output[t-j,k]).
 *
 * All output bits are untouched. Gaussian elimination uses the highest
 * coefficient as pivot and preserves the exact first impossible equation.
 *
 * @param {number[]} data Original/plant byte outputs in time order
 * @param {number} order The putative maximum state degree
 * @returns {{consistent:boolean, order:number, rank:number,
 *   firstContradiction: null|{byte:number,bit:number}, taps:null|bigint,
 *   equationsProcessed:number}}
 */
function solveCommonRecurrence(data, order) {
  assert(Number.isInteger(order) && order > 0 && order < data.length);
  const basis = new Map();
  let processed = 0;
  for (let t = order; t < data.length; t++) {
    for (let bit = 0; bit < 8; bit++) {
      let coefficients = 0n;
      for (let lag = 1; lag <= order; lag++) {
        if ((data[t - lag] >>> bit) & 1) {
          coefficients |= 1n << BigInt(lag - 1);
        }
      }
      let rhs = (data[t] >>> bit) & 1;
      processed++;
      while (coefficients) {
        const pivot = coefficients.toString(2).length - 1;
        const existing = basis.get(pivot);
        if (!existing) {
          basis.set(pivot, {coefficients, rhs});
          break;
        }
        coefficients ^= existing.coefficients;
        rhs ^= existing.rhs;
      }
      if (!coefficients && rhs) {
        return {consistent: false, order, rank: basis.size,
          firstContradiction: {byte: t, bit}, taps: null,
          equationsProcessed: processed};
      }
    }
  }

  // Rows have a highest pivot and only lower-order other unknowns. Solve
  // ascending pivots; leave any free taps zero deterministically.
  let taps = 0n;
  for (let pivot = 0; pivot < order; pivot++) {
    const row = basis.get(pivot);
    if (!row) continue;
    const rhs = row.rhs ^ parity(row.coefficients & taps);
    if (rhs) taps |= 1n << BigInt(pivot);
  }
  for (let t = order; t < data.length; t++) {
    assert.equal(predictedByte(data, t, order, taps), data[t],
      "exhaustive original/plant byte reconstruction");
  }
  return {consistent: true, order, rank: basis.size,
    firstContradiction: null, taps, equationsProcessed: processed};
}

/**
 * @param {number[]} data
 * @param {number} at
 * @param {number} order
 * @param {bigint} taps
 * @returns {number}
 */
function predictedByte(data, at, order, taps) {
  let out = 0;
  for (let bit = 0; bit < 8; bit++) {
    let value = 0;
    for (let lag = 1; lag <= order; lag++) {
      if ((taps >> BigInt(lag - 1)) & 1n) {
        value ^= (data[at - lag] >>> bit) & 1;
      }
    }
    out |= value << bit;
  }
  return out;
}

// The order-226 model contains every smaller-degree binary linear recurrence
// (left-padding coefficients with zero), so its inconsistency excludes all
// byte-tick GF(2)-linear generators of <=226 state bits for this source order.
const order128 = solveCommonRecurrence(bytes, 128);
const order129 = solveCommonRecurrence(bytes, 129);
const order226 = solveCommonRecurrence(bytes, 226);
const order227 = solveCommonRecurrence(bytes, 227);
assert.deepEqual([order128.consistent, order128.rank,
  order128.firstContradiction], [false, 128, {byte: 144, bit: 1}]);
assert.deepEqual([order129.consistent, order129.rank,
  order129.firstContradiction], [false, 125, {byte: 144, bit: 5}]);
assert.deepEqual([order226.consistent, order226.rank,
  order226.firstContradiction], [false, 225, {byte: 254, bit: 2}]);
assert.deepEqual([order227.consistent, order227.rank], [true, 227]);
const nextByte227 = predictedByte(bytes, 256, 227, order227.taps);

// Fully sourced-shape positive plant: a deterministic homogeneous 128-bit
// GF(2)-linear update, arbitrary nonzero initial state and byte projection.
const mask128 = (1n << 128n) - 1n;
let state = 0x8f9136a03c4e527db6cf019ab27d3561n;
const plant = [];
for (let i = 0; i < 256; i++) {
  plant.push(Number(state & 255n));
  const carry = (state >> 127n) & 1n;
  state = ((state << 1n) & mask128) ^ (carry ? 0x87n : 0n);
}
const planted = solveCommonRecurrence(plant, 128);
assert(planted.consistent, "true linear byte stream must admit <=128 taps");
assert.equal(planted.firstContradiction, null);
const tampered = plant.slice();
tampered[200] ^= 1;
const tamperedResult = solveCommonRecurrence(tampered, 128);
assert(!tamperedResult.consistent, "one original-layout planted tamper should be rejected");

if (require.main === module) {
  console.log(JSON.stringify({
    status: "PASS; original p50 byte stream excludes all stationary linear states <=226 bits",
    sourceBytes: bytes.length, originalSHA256: digest,
    sourceRowMajor: true, sourceRadixInterpretation: "conditional base60",
    observedOrder128: {...order128, taps: undefined},
    observedOrder129: {...order129, taps: undefined},
    observedOrder226: {...order226, taps: undefined},
    observedOrder227: {...order227, taps: undefined},
    untestedByte256PredictionFromHighOrderFit: nextByte227,
    positive128: {consistent: planted.consistent, rank: planted.rank,
      tamperRejected: !tamperedResult.consistent}
  }, null, 2));
}
module.exports = {solveCommonRecurrence, predictedByte};
