"use strict";
/**
 * Source-gated, key-independent test of the LP2 terminal 19x4 ↔ 19x5
 * affine reading over GF(29). Requires Node.js 20+.
 *
 * Input: physical p55 (76 original ciphertext runes), solved physical
 * p57 (95 clear runes). Both are preserved as printed; p56 is not
 * silently omitted from the manuscript. The proposed direct connection
 * across p56 is an exploratory hypothesis, not a documented operation.
 *
 * Run: node sims/terminal_p55_p57_19block_affine_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"
));
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(corpus.pages.find(p => p.page === 55).status, "unsolved");
assert.equal(corpus.pages.find(p => p.page === 57).status, "solved");
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
const M = 29;
/** @param {number} x @returns {number} */
const mod = x => ((x % M) + M) % M;
/** @param {number} a @returns {number} */
function inverseScalar(a) {
  for (let x = 1; x < M; x++) if (mod(a * x) === 1) return x;
  throw new Error("Singular pivot");
}
/**
 * Invert a square matrix over GF(29), returning null on singular input.
 * @param {number[][]} input
 * @returns {number[][] | null}
 */
function invert(input) {
  const n = input.length;
  assert(input.every(row => row.length === n));
  const a = input.map((row, i) =>
    row.concat(Array.from({length:n}, (_, j) => Number(i === j))));
  for (let j = 0; j < n; j++) {
    let k = j;
    while (k < n && a[k][j] === 0) k++;
    if (k === n) return null;
    [a[j], a[k]] = [a[k], a[j]];
    const scale = inverseScalar(a[j][j]);
    a[j] = a[j].map(v => mod(v * scale));
    for (let i = 0; i < n; i++) {
      if (i === j) continue;
      const factor = a[i][j];
      a[i] = a[i].map((v, col) => mod(v - factor * a[j][col]));
    }
  }
  return a.map(row => row.slice(n));
}
/**
 * Row-vector times matrix over GF(29).
 * @param {number[]} row
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function multiply(row, matrix) {
  assert.equal(row.length, matrix.length);
  const width = matrix[0].length;
  return Array.from({length:width}, (_, col) =>
    mod(row.reduce((sum, value, i) => sum + value * matrix[i][col], 0)));
}
/**
 * Fit the first five affine-independent 4-rune source blocks (the
 * coefficient of the constant feature is unrestricted), then freeze
 * the complete secret affine map and test the other 14 blocks.
 * @param {number[][]} inputs
 * @param {number[][]} outputs
 * @returns {{firstFailure:any, mismatches:number, matched:number, total:number}}
 */
function gate(inputs, outputs) {
  assert.equal(inputs.length, 19);
  assert.equal(outputs.length, 19);
  const augmented = inputs.map(row => [1, ...row]);
  const inv = invert(augmented.slice(0, 5));
  assert(inv, "First five input blocks must be affine-independent");
  const frozen = inv.map(row => Array.from({length:outputs[0].length}, (_, col) =>
    mod(row.reduce((sum, x, i) => sum + x * outputs[i][col], 0))));
  let mismatches = 0;
  let firstFailure = null;
  for (let i = 0; i < 19; i++) {
    const predicted = multiply(augmented[i], frozen);
    const actual = outputs[i];
    const mismatched = predicted.filter((v,j) => v !== actual[j]).length;
    if (i >= 5) mismatches += mismatched;
    if (i >= 5 && mismatched && !firstFailure) {
      const weights = multiply(augmented[i], inv);
      firstFailure = {block1: i + 1, weights, predicted, actual, mismatched};
    }
    if (i < 5) assert.deepEqual(predicted, actual);
  }
  const total = (19 - 5) * outputs[0].length;
  return {firstFailure, mismatches, matched:total-mismatches, total};
}
/** @param {number[]} runes @param {number} width @returns {number[][]} */
function blocks(runes, width) {
  assert.equal(runes.length, 19 * width);
  return Array.from({length:19}, (_, i) => runes.slice(i*width, (i+1)*width));
}
const a4 = blocks(p55, 4);
const b5 = blocks(p57, 5);
const forward = gate(a4, b5);
assert.equal(forward.mismatches, 68);
assert.deepEqual(forward.firstFailure, {
  block1:6, weights:[27,8,4,5,15],
  predicted:[6,0,15,14,16], actual:[21,16,3,2,18], mismatched:5
});
const reverse = Array.from({length:5}, (_, drop) => gate(
  b5.map(row => row.filter((_, i) => i !== drop)), a4
));
assert.deepEqual(reverse.map(x => x.mismatches), [54,55,54,54,55]);
/**
 * End-to-end positive: a secret 5x5 affine coefficient map fixed
 * independently of the 19 original source blocks. All withheld
 * predictions must agree exactly, demonstrating full-key recovery.
 * @param {number[][]} input
 * @param {number} width
 */
function syntheticPositive(input, width) {
  const map = Array.from({length:5}, (_,i) =>
    Array.from({length:width}, (_,j) => mod(1+7*i+11*j+3*i*j)));
  const generated = input.map(row => multiply([1,...row],map));
  const recovered = gate(input,generated);
  assert.equal(recovered.mismatches,0);
  assert.equal(recovered.matched,recovered.total);
  return recovered.total;
}
assert.equal(syntheticPositive(a4,5),70);
assert.equal(syntheticPositive(b5.map(row => row.slice(0,4)),4),56);

const report = {
  scope:"Stationary affine 4-to-5 or deleted-position 5-to-4 GF29 block code",
  source:{p55:76,p57:95,blocks:19},
  frozenTrainingBlocks:5,
  heldoutBlocks:14,
  forward, reverse:reverse.map((v,drop) => ({drop,...v})),
  syntheticHeldoutPositive:{forward:70,reverse:56},
  verdict:"All six natural stationary-affine variants contradicted by original rune data; no unknown plaintext decoded"
};
console.log(JSON.stringify(report,null,2));
