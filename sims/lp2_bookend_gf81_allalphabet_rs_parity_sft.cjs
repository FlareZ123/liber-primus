/**
 * LP2 80x80 GF(81) Reed-Solomon parity gate on original bookend register.
 * SFT: node sims/lp2_bookend_gf81_allalphabet_rs_parity_sft.cjs
 *
 * Tests EVERY 29-rune-to-GF81 global mapping (including noninjective mappings)
 * algebraically, without enumerating 81^29 functions or fitting plaintext.
 * Source geometry and GF3 quartic from prior original-source analyses:
 * f(X)=X^4+X^2+X+1; primitive generator g=X+1, field code 4.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

/** @param {number} a @param {number} b @returns {number} */
function addRaw(a, b) {
  let result = 0;
  let place = 1;
  for (let i = 0; i < 4; i++, place *= 3) {
    result += ((a % 3 + b % 3) % 3) * place;
    a = Math.floor(a / 3);
    b = Math.floor(b / 3);
  }
  return result;
}

/** @param {number} a @param {number} b @returns {number} */
function multiplyRaw(a, b) {
  const digits = Array(7).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      digits[i + j] = (digits[i + j] +
        (Math.floor(a / 3 ** i) % 3) * (Math.floor(b / 3 ** j) % 3)) % 3;
    }
  }
  // f=X^4+X^2+X+1: X^4=2X^2+2X+2 over GF(3).
  for (let k = 6; k >= 4; k--) {
    const v = digits[k];
    digits[k] = 0;
    digits[k - 2] = (digits[k - 2] + 2 * v) % 3;
    digits[k - 3] = (digits[k - 3] + 2 * v) % 3;
    digits[k - 4] = (digits[k - 4] + 2 * v) % 3;
  }
  return digits.slice(0, 4).reduce((sum, v, i) => sum + v * 3 ** i, 0);
}

const ADD = Array.from({ length: 81 }, (_, a) =>
  Array.from({ length: 81 }, (_, b) => addRaw(a, b)));
const MUL = Array.from({ length: 81 }, (_, a) =>
  Array.from({ length: 81 }, (_, b) => multiplyRaw(a, b)));

/** @param {number} value @param {number} exponent @returns {number} */
function power(value, exponent) {
  let out = 1;
  while (exponent > 0) {
    if (exponent % 2) out = MUL[out][value];
    value = MUL[value][value];
    exponent = Math.floor(exponent / 2);
  }
  return out;
}

const INV = Array.from({ length: 81 }, (_, value) => value === 0 ? 0 : power(value, 79));
const NEG = Array.from({ length: 81 }, (_, value) => ADD[value][value]);

/**
 * GF81 rank of a constraint matrix. Rows are linear equations whose
 * columns represent the unknown 29 GP rune-to-field images.
 * @param {number[][]} input
 * @returns {number}
 */
function rank(input) {
  const matrix = input.map(row => [...row]);
  let row = 0;
  for (let column = 0; column < 29 && row < matrix.length; column++) {
    let pivot = row;
    while (pivot < matrix.length && matrix[pivot][column] === 0) pivot++;
    if (pivot === matrix.length) continue;
    [matrix[row], matrix[pivot]] = [matrix[pivot], matrix[row]];
    const inverse = INV[matrix[row][column]];
    for (let c = column; c < 29; c++) {
      matrix[row][c] = MUL[matrix[row][c]][inverse];
    }
    for (let r = row + 1; r < matrix.length; r++) {
      const multiplier = matrix[r][column];
      if (multiplier === 0) continue;
      for (let c = column; c < 29; c++) {
        matrix[r][c] = ADD[matrix[r][c]][NEG[MUL[multiplier][matrix[row][c]]]];
      }
    }
    row++;
  }
  return row;
}

/** @param {number[]} grid @param {'row'|'column'} axis @param {number[]} weights @returns {number[][]} */
function parityEquations(grid, axis, weights) {
  const output = [];
  for (let i = 0; i < 80; i++) {
    const coefficients = Array(29).fill(0);
    let complete = true;
    for (let j = 0; j < 80; j++) {
      const symbol = grid[axis === 'row' ? i * 80 + j : j * 80 + i];
      if (symbol < 0) {
        complete = false;
        break;
      }
      coefficients[symbol] = ADD[coefficients[symbol]][weights[j]];
    }
    if (complete) output.push(coefficients);
  }
  return output;
}

/**
 * Full-field RS(81,80) one-parity equations. In characteristic three,
 * the sum of an 81-point degree<=79 evaluation is zero. Its only
 * coefficients are 0, 1, 2 in the GF3 subfield of GF81.
 * @param {number[]} first
 * @param {'row'|'column'} axis
 * @returns {number[][]}
 */
function fullFieldEquations(first, axis) {
  const out = [];
  for (let i = 0; i < 81; i++) {
    const coefficient = Array(29).fill(0);
    for (let j = 0; j < 81; j++) {
      const symbol = first[axis === 'row' ? i * 81 + j : j * 81 + i];
      coefficient[symbol] = ADD[coefficient[symbol]][1];
    }
    out.push(coefficient);
  }
  return out;
}

/** @param {number[]} coefficients @returns {number} */
function originalIntegerEmbeddingSyndrome(coefficients) {
  return coefficients.reduce((sum, coeff, index) => ADD[sum][MUL[coeff][index]], 0);
}

/** @param {number[]} xs @returns {number} */
function sumGF(xs) {
  return xs.reduce((sum, value) => ADD[sum][value], 0);
}

/** @param {number[]} powers @returns {number[]} */
function generatePlant(powers) {
  let seed = 0x47d2ab19;
  /** @returns {number} */
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const plant = [];
  for (let r = 0; r < 80; r++) {
    let found = false;
    let attempts = 0;
    while (!found) {
      assert(++attempts <= 30, 'Planted RS row construction failed');
      const row = Array.from({ length: 78 }, () => random() % 29);
      const partial = sumGF(row.map((v, j) => MUL[v][powers[j]]));
      for (let a = 0; a < 29 && !found; a++) {
        for (let b = 0; b < 29 && !found; b++) {
          const syndrome = ADD[ADD[partial][MUL[a][powers[78]]]][MUL[b][powers[79]]];
          if (syndrome === 0) {
            row.push(a, b);
            plant.push(...row);
            found = true;
          }
        }
      }
    }
  }
  assert.equal(plant.length, 6400);
  return plant;
}

function main() {
  const source = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const tape = source.pages.filter(p => p.page >= 0 && p.page <= 55).flatMap(p => p.indices || []);
  assert.equal(tape.length, 12956);
  assert.deepEqual(tape.slice(6555, 6561), [23, 11, 1, 17, 18, 10]);
  assert.deepEqual(tape.slice(12950), [23, 11, 1, 17, 18, 10]);
  const first = tape.slice(0, 6561);
  assert.equal(first.length, 6561);
  const fullFirstCases = [];
  for (const axis of ['row', 'column']) {
    const equations = fullFieldEquations(first, axis);
    assert.equal(equations.length, 81);
    for (const equation of equations) assert.equal(sumGF(equation), 0);
    assert.equal(rank(equations), 28);
    fullFirstCases.push({
      axis, rows: equations.length, rank: rank(equations),
      nonzeroNativeSyndromes: equations.filter(eq =>
        originalIntegerEmbeddingSyndrome(eq) !== 0).length
    });
  }
  assert.deepEqual(fullFirstCases.map(x => x.nonzeroNativeSyndromes), [80, 77]);
  const visible = tape.slice(6561);
  assert.equal(visible.length, 6395);
  const holeOffsets = [2244, 2384, 2476, 2575, 2672];
  const holes = new Set(holeOffsets);
  let cursor = 0;
  const grid = Array.from({ length: 6400 }, (_, index) =>
    holes.has(index) ? -1 : visible[cursor++]);
  assert.equal(cursor, 6395);
  assert.equal(grid.filter(x => x < 0).length, 5);

  const gp = Array.from({ length: 80 }, (_, i) => power(4, i));
  assert.equal(new Set(gp).size, 80);
  assert.equal(power(4, 80), 1);
  assert.equal(MUL[4][INV[4]], 1);
  const tested = [];
  // All 32 possible generators of order 80; exponent phase scales every
  // equation by a nonzero constant and cannot alter matrix rank.
  for (let a = 1; a < 80; a++) {
    const weights = Array.from({ length: 80 }, (_, j) => gp[(a * j) % 80]);
    if (new Set(weights).size !== 80) continue;
    for (const axis of ['row', 'column']) {
      const equations = parityEquations(grid, axis, weights);
      assert.equal(equations.length, 75);
      // A constant GP rune-to-GF81 embedding is always in the nullspace:
      // sum over the complete multiplicative orbit is zero.
      for (const equation of equations) assert.equal(sumGF(equation), 0);
      const actualRank = rank(equations);
      assert.equal(actualRank, 28, 'Original source unexpectedly has a nonconstant RS palette');
      tested.push({ generatorExponent: a, axis, equations: equations.length, rank: actualRank });
    }
  }
  assert.equal(tested.length, 64);
  // Source-selected generator g=4, both orientations and reading directions.
  const sourceCases = [];
  for (const [axis, exponent] of [
    ['row', 1], ['row', 79], ['column', 1], ['column', 79]
  ]) {
    const weights = Array.from({ length: 80 }, (_, i) => gp[(exponent * i) % 80]);
    const equations = parityEquations(grid, axis, weights);
    sourceCases.push({
      axis, exponent: exponent === 79 ? -1 : 1,
      completeLines: equations.length,
      exactRank: rank(equations),
      nonzeroSyndromeCountWithNativeIndexEmbedding:
        equations.filter(eq => originalIntegerEmbeddingSyndrome(eq) !== 0).length
    });
  }
  assert.deepEqual(sourceCases.map(x => x.nonzeroSyndromeCountWithNativeIndexEmbedding),
    [75, 75, 75, 74]);

  // Fully native 29-glyph positive plant: 80 genuine GF81 RS(80,79) rows,
  // with exactly the five original numeral-hole positions erased.
  const planted = generatePlant(gp);
  const plantedMasked = planted.map((v, i) => holes.has(i) ? -1 : v);
  const plantEquations = parityEquations(plantedMasked, 'row', gp);
  assert.equal(plantEquations.length, 75);
  assert(plantEquations.every(eq => originalIntegerEmbeddingSyndrome(eq) === 0));
  assert.equal(rank(plantEquations), 27);
  assert.equal(new Set(planted).size, 29);

  console.log(JSON.stringify({
    test: 'LP2 source-bookend GF81 cyclic RS(80,79) one-parity original alphabet gate',
    actual_gp_tape_sha256: createHash('sha256').update(Buffer.from(tape)).digest('hex'),
    source_field: 'GF3[x] / (x^4 + x^2 + x + 1)',
    primitive_original_source_element: 4,
    original_square_81x81: 6561,
    original_81point_RS_single_parity: fullFirstCases,
    original_square_80x80_visible: visible.length,
    hole_positions: holeOffsets,
    independent_complete_rows_and_columns: 75,
    all_primitive_generator_axis_cases: tested.length,
    every_original_case_exact_rank: 28,
    constant_maps_only: true,
    original_four_D4_source_cases: sourceCases,
    planted_native_29symbol_RS_row_rank: rank(plantEquations),
    planted_positive: 'PASS'
  }, null, 2));
}

main();
