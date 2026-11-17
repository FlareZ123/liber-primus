"use strict";

/**
 * LP2 original 225 red runes + 31 physical thirteen-dot marks form
 * 15*15 + (15+15+1) = 16*16 objects, matching the 256-cell p50 table.
 * A concrete, falsifiable interpretation is a 15x15 data grid
 * extended by byte/parity check rows and columns.
 *
 * This source-input test checks two natural 32x8 -> 16x16 folds, the
 * two surviving source-compatible base60/base59 token interpretations,
 * and both XOR-byte and GP29-sum checksum operations.
 * It excludes only the exact unweighted two-dimensional parity code.
 *
 * Run (Windows Node.js 22): node sims/lp2_red225_mark31_p50_product_parity_sft.cjs
 */
const assert = require("node:assert/strict");
const grid = require("../resources/liber-primus/base60-grid.json");

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
assert.ok(tokens.every(token => token.length === 2));

/** @param {string} alphabet @returns {number[]} */
function parse(alphabet) {
  return tokens.map(token => {
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0);
    const value = high * alphabet.length + low;
    assert.ok(value >= 0 && value <= 255);
    return value;
  });
}

/**
 * Both folds preserve the original printed order inside each
 * eight-cell printed row. The second fold places the lower 16
 * printed rows beside the upper 16 printed rows.
 * @param {number[]} bytes
 * @param {"paired-rows"|"parallel-halves"} fold
 * @returns {number[][]}
 */
function reshape(bytes, fold) {
  const result = [];
  for (let r = 0; r < 16; r++) {
    const first = bytes.slice(r * (fold === "paired-rows" ? 16 : 8),
      r * (fold === "paired-rows" ? 16 : 8) + (fold === "paired-rows" ? 16 : 8));
    const row = fold === "paired-rows" ? first :
      first.concat(bytes.slice((r + 16) * 8, (r + 17) * 8));
    assert.equal(row.length, 16);
    result.push(row);
  }
  return result;
}

/**
 * @param {number[][]} table
 * @param {"xor"|"gp29"} op
 * @returns {{rows:number[],columns:number[]}}
 */
function checks(table, op) {
  const sum = op === "xor"
    ? values => values.reduce((acc, value) => acc ^ value, 0)
    : values => values.reduce((acc, value) => (acc + value) % 29, 0);
  return {
    rows: table.map(sum),
    columns: Array.from({length:16},
      (_, c) => sum(table.map(row => row[c])))
  };
}

/**
 * A positive-control encoder for the 16x16 direct product parity code.
 * The 15x15 data are placed in the upper-left; right/bottom edges carry
 * XOR or mod29 checks. For mod29, each input is necessarily in [0,28].
 * @param {number[][]} data
 * @param {"xor"|"gp29"} op
 * @returns {number[][]}
 */
function extend(data, op) {
  assert.equal(data.length, 15);
  assert.ok(data.every(row => row.length === 15));
  const negate = op === "xor" ? value => value :
    value => (29 - (value % 29)) % 29;
  const inner = data.map(row => row.concat(
    negate(checks([row], op).rows[0])));
  const bottom = Array.from({length:15}, (_, c) =>
    negate(checks(data.map(row => [row[c]]), op).rows[0]));
  bottom.push(negate(checks([bottom], op).rows[0]));
  inner.push(bottom);
  return inner;
}

const inputAlphabet = grid.alphabet;
assert.equal(inputAlphabet.replace("f", "").length, 59);
assert.ok(tokens.every(token => !token.includes("f")));
assert.equal(new Set(parse(inputAlphabet)).size, 161);
for (const op of ["xor", "gp29"]) {
  const plant = Array.from({length:15}, (_, r) =>
    Array.from({length:15}, (_, c) =>
      op === "xor" ? (r * 43 + c * 17 + 51) % 256
        : (r * 13 + c * 7 + 3) % 29));
  const enc = extend(plant, op);
  assert.ok(checks(enc, op).rows.every(x => x === 0));
  assert.ok(checks(enc, op).columns.every(x => x === 0));
  assert.deepEqual(enc.slice(0,15).map(row => row.slice(0,15)),plant);
  console.log("Positive 15x15->16x16 product-check code:", op, "PASS");
}

const observations = [];
for (const [radix, alphabet] of [[60,inputAlphabet],
  [59,inputAlphabet.replace("f","")]]) {
  const bytes = parse(alphabet);
  for (const fold of ["paired-rows", "parallel-halves"]) {
    const table = reshape(bytes, fold);
    for (const op of ["xor","gp29"]) {
      const measured = checks(table, op);
      const rowsZero = measured.rows.filter(x => x === 0).length;
      const columnsZero = measured.columns.filter(x => x === 0).length;
      assert.ok(rowsZero < 16 && columnsZero < 16);
      const result = {radix,fold,check:op,rowsZero,columnsZero,
        firstFourRowChecks:measured.rows.slice(0,4),
        firstFourColumnChecks:measured.columns.slice(0,4)};
      observations.push(result);
      console.log(JSON.stringify(result));
    }
  }
}
assert.equal(observations.length,8);
assert.ok(observations.every(item =>
  item.rowsZero < 16 && item.columnsZero < 16));
console.log("Original 256-cell p50 table: 0 of 8 source-natural" +
  " fold/radix/check models is a direct 15x15 product parity code.");
console.log("This rules out only direct XOR/mod29 row-column parity;" +
  " it does not identify original red-event ordering, a key or plaintext.");
