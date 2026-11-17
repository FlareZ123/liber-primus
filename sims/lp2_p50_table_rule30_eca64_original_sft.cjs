"use strict";
/**
 * Exhaust all 256 elementary 1D cellular automaton rules as literal
 * consecutive 64-bit binary rows of the original 32x8 base60-byte table.
 * CJS / Node.js 22, read-only, strict source and synthetic-positive checks.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
assert.equal(source.byte_count, 256);
assert.deepEqual(source.pages.map(p => p.rows), [10, 13, 9]);
assert.deepEqual(source.pages.map(p => p.cols), [8, 8, 8]);
assert.deepEqual(source.pages.flatMap(p => p.bytes), source.bytes);
assert.equal(source.bytes.length, 256);
for (const byte of source.bytes) assert.ok(Number.isInteger(byte) && byte >= 0 && byte <= 255);

/** @param {number[]} bytes @param {"MSB"|"LSB"} order @returns {number[][]} */
function bitRows(bytes, order) {
  return Array.from({length: 32}, (_, y) => Array.from({length: 64}, (_, x) =>
    (bytes[8 * y + (x >>> 3)] >>> (order === "MSB" ? 7 - x % 8 : x % 8)) & 1));
}
/**
 * Wolfram elementary rule with conventional bit positions LCR=000..111.
 * @param {number[]} row @param {number} rule @param {"wrap"|"zero"} edge
 * @returns {number[]}
 */
function nextRow(row, rule, edge) {
  assert.equal(row.length, 64);
  return row.map((center, x) => {
    const left = x ? row[x - 1] : edge === "wrap" ? row[63] : 0;
    const right = x < 63 ? row[x + 1] : edge === "wrap" ? row[0] : 0;
    return (rule >>> ((left << 2) | (center << 1) | right)) & 1;
  });
}
/** @param {number[][]} rows @param {number} rule @param {"wrap"|"zero"} edge */
function countErrors(rows, rule, edge) {
  let count = 0;
  for (let y = 0; y < 31; y++) {
    const predicted = nextRow(rows[y], rule, edge);
    for (let i = 0; i < 64; i++) count += +(predicted[i] !== rows[y + 1][i]);
  }
  return count;
}
const predicted = [];
for (const order of ["MSB", "LSB"]) {
  for (const edge of ["wrap", "zero"]) {
    const rows = bitRows(source.bytes, order);
    const errors = Array.from({length: 256}, (_, rule) =>
      ({rule, errors: countErrors(rows, rule, edge)}))
      .sort((a, b) => a.errors - b.errors || a.rule - b.rule);
    assert.ok(errors[0].errors > 0);
    predicted.push({order, edge, best: errors[0],
      sourceRule30: countErrors(rows, 30, edge),
      sourceRules: Object.fromEntries([9, 30, 75, 90, 110, 133, 227, 229]
        .map(rule => [rule, countErrors(rows, rule, edge)]))});
  }
}
assert.deepEqual(predicted.map(x => x.best),
  [{rule: 194, errors: 939}, {rule: 192, errors: 938},
   {rule: 136, errors: 945}, {rule: 136, errors: 948}]);
assert.deepEqual(predicted.map(x => x.sourceRule30), [1007, 1008, 994, 997]);

// Independent 64-bit source-shaped positive: exact 31 transitions of Rule 30.
const first = Array.from({length: 64}, (_, i) =>
  ((i * 0x45d9f3b + 0x3301) >>> (i % 17)) & 1);
const planted = [first];
for (let t = 0; t < 31; t++) planted.push(nextRow(planted.at(-1), 30, "wrap"));
assert.equal(countErrors(planted, 30, "wrap"), 0);
assert.ok(countErrors(planted, 110, "wrap") > 0);
const altered = planted.map(row => row.slice());
altered[17][29] ^= 1;
assert.ok(countErrors(altered, 30, "wrap") > 0);
console.log(JSON.stringify({
  status: "Literal source-byte row automata rejected; no original plaintext/key",
  source: "Original p49–51 table: 32 physical rows × 8 bytes",
  tested: "256 Wolfram elementary rules, 2 within-byte orders, 2 edge conditions",
  observedTransitions: 31,
  transitionBits: 31 * 64,
  results: predicted,
  trueRule30Plant: "31/31 original-shaped transitions, zero errors",
}, null, 2));
