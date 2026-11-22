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
    negate(checks([data.map(row => row[c])], op).rows[0]));
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
/** @param {number} left @param {number} right @returns {number} */
function gf256Multiply(left, right) {
  let product = 0;
  for (let bit = 0; bit < 8; bit++) {
    if (right & 1) product ^= left;
    const carry = left & 128;
    left = (left << 1) & 255;
    if (carry) left ^= 0x1b; // AES GF(256), x^8+x^4+x^3+x+1.
    right >>= 1;
  }
  return product;
}

/** @param {number} base @param {number} exp @param {29|256} field */
function fieldPower(base, exp, field) {
  let product = 1;
  while (exp) {
    if (exp & 1) product = field === 256 ?
      gf256Multiply(product, base) : (product * base) % 29;
    base = field === 256 ? gf256Multiply(base, base) :
      (base * base) % 29;
    exp >>= 1;
  }
  return product;
}

/** @param {number[][]} input @param {29|256} field @returns {number} */
function rank(input, field) {
  const a = input.map(row => row.map(x => x % field));
  const n = a.length, width = a[0].length;
  assert.ok(a.every(row => row.length === width));
  const multiply = field === 256 ? gf256Multiply :
    (x, y) => (x * y) % 29;
  const subtract = field === 256 ? (x, y) => x ^ y :
    (x, y) => (x - y + 29) % 29;
  let pivotRow = 0;
  for (let col = 0; col < width && pivotRow < n; col++) {
    let nonzero = pivotRow;
    while (nonzero < n && a[nonzero][col] === 0) nonzero++;
    if (nonzero === n) continue;
    [a[pivotRow], a[nonzero]] = [a[nonzero], a[pivotRow]];
    const inverse = fieldPower(a[pivotRow][col],
      field === 256 ? 254 : 27, field);
    assert.equal(multiply(inverse, a[pivotRow][col]), 1);
    for (let j = col; j < width; j++)
      a[pivotRow][j] = multiply(a[pivotRow][j], inverse);
    for (let row = 0; row < n; row++) {
      if (row === pivotRow) continue;
      const factor = a[row][col];
      if (factor === 0) continue;
      for (let j = col; j < width; j++)
        a[row][j] = subtract(a[row][j],
          multiply(factor, a[pivotRow][j]));
    }
    pivotRow++;
  }
  return pivotRow;
}

/**
 * A general secret-coefficient 15x15->16x16 linear product code.
 * Output has exact rank 15 regardless of the 30 nonzero source-blind
 * parity weights. This plant is intentionally stronger than the simple
 * uniform parity control above.
 * @param {29|256} field
 * @returns {number[][]}
 */
function weightedControl(field) {
  const multiply = field === 256 ? gf256Multiply :
    (x, y) => (x * y) % 29;
  const add = field === 256 ? (x, y) => x ^ y :
    (x, y) => (x + y) % 29;
  const a = Array.from({length:15}, (_, j) => j + 2);
  const b = Array.from({length:15}, (_, j) => j + 3);
  const source = Array.from({length:15}, (_, row) =>
    Array.from({length:15}, (_, col) => Number(row === col)));
  const built = source.map(row => row.concat(row.reduce((sum, value, j) =>
    add(sum, multiply(a[j], value)), 0)));
  built.push(Array.from({length:16}, (_, col) =>
    built.reduce((sum, row, i) =>
      add(sum, multiply(b[i], row[col])), 0)));
  return built;
}
for (const field of [29, 256]) {
  assert.equal(rank(weightedControl(field), field), 15);
  console.log("Positive secret-weighted linear 15x15->16x16 code:",
    "GF(" + field + ")", "rank 15 PASS");
}
for (const [radix, alphabet] of [[60,inputAlphabet],
  [59,inputAlphabet.replace("f","")]]) {
  for (const fold of ["paired-rows","parallel-halves"]) {
    const original = reshape(parse(alphabet),fold);
    for (const field of [29,256]) {
      const actual = rank(original,field);
      assert.equal(actual,16);
      console.log(JSON.stringify({radix,fold,field:"GF(" + field + ")",
        actualRank:actual,maximumLinearProductRank:15,possible:false}));
    }
  }
}
console.log("All 8 original rank tests are full rank 16. This rejects" +
  " even arbitrary hidden-weight linear 15x15 product checks over GF29" +
  " or GF256 for these folds; nonlinear and different layouts remain open.");
console.log("No unknown ciphertext plaintext or authentic key is inferred.");
