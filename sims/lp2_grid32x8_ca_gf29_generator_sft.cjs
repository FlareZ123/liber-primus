'use strict';

/**
 * LP2 physical pp49-51: source-shaped 32x8 generator test.
 * Usage: node sims/lp2_grid32x8_ca_gf29_generator_sft.cjs
 * No file writes; original table bytes are never altered.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-grid-256.json'), 'utf8'));
/** @type {number[]} */
const bytes = source.bytes;
assert.equal(bytes.length, 256);
assert(bytes.every((x) => Number.isInteger(x) && x >= 0 && x < 256));
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

/** @param {number[]} data @param {boolean} reverse @param {boolean} lowBitFirst @returns {number[][]} */
function bitRows(data, reverse, lowBitFirst) {
  return Array.from({length: 32}, (_, row) =>
    Array.from({length: 64}, (_, position) => {
      const value = data[(reverse ? 31 - row : row) * 8 + Math.floor(position / 8)];
      return (value >>> (lowBitFirst ? position % 8 : 7 - position % 8)) & 1;
    })
  );
}

/** @param {number[][]} rows @returns {{rule: number, score: number}} */
function bestElementaryRule(rows) {
  const counts = Array.from({length: 8}, () => [0, 0]);
  for (let t = 0; t < rows.length - 1; t++) {
    for (let j = 0; j < 64; j++) {
      const state = rows[t][(j + 63) % 64] * 4 + rows[t][j] * 2 + rows[t][(j + 1) % 64];
      counts[state][rows[t + 1][j]]++;
    }
  }
  let rule = 0;
  let score = 0;
  for (let k = 0; k < 8; k++) {
    const bit = Number(counts[k][1] > counts[k][0]);
    rule |= bit << k;
    score += counts[k][bit];
  }
  return {rule, score};
}

/** @param {number[]} row @param {number} rule @returns {number[]} */
function elementaryStep(row, rule) {
  return row.map((_, j) => {
    const state = row[(j + 63) % 64] * 4 + row[j] * 2 + row[(j + 1) % 64];
    return (rule >>> state) & 1;
  });
}

/** @param {number} x @returns {number} */
function mod29(x) { return ((x % 29) + 29) % 29; }

/** @param {number} x @returns {number} */
function inverse29(x) {
  for (let a = 1; a < 29; a++) if (mod29(a * x) === 1) return a;
  throw new Error('No inverse in GF29');
}

/** @param {number[]} data @param {boolean} reverse @returns {{coefficients: number[], matches: number, total: number, firstWrong: number}} */
function affineThreeNeighbor(data, reverse) {
  /** @type {number[][]} */
  const equations = [];
  for (let t = 0; t < 31; t++) {
    const prev = (reverse ? 31 - t : t) * 8;
    const next = (reverse ? 30 - t : t + 1) * 8;
    for (let c = 0; c < 8; c++) {
      equations.push([data[prev + (c + 7) % 8], data[prev + c], data[prev + (c + 1) % 8], 1, data[next + c]]);
    }
  }
  /** @type {number[][]} */
  const independent = [];
  /** @type {number[]} */
  const pivots = [];
  for (const eq of equations) {
    if (pivots.length === 4) break;
    let row = eq.map(mod29);
    for (let k = 0; k < independent.length; k++) {
      const multiplier = row[pivots[k]];
      row = row.map((value, col) => mod29(value - multiplier * independent[k][col]));
    }
    const pivot = [0, 1, 2, 3].find((c) => !pivots.includes(c) && row[c] !== 0);
    if (pivot !== undefined) {
      const inv = inverse29(row[pivot]);
      independent.push(row.map((v) => mod29(v * inv)));
      pivots.push(pivot);
    }
  }
  assert.equal(pivots.length, 4, 'The original/pseudo-original row equations must determine all four coefficients');
  const coefficients = [0, 0, 0, 0];
  for (let k = 3; k >= 0; k--) {
    let v = independent[k][4];
    for (let j = k + 1; j < 4; j++) v = mod29(v - independent[k][pivots[j]] * coefficients[pivots[j]]);
    coefficients[pivots[k]] = v;
  }
  const correct = equations.map(([l, m, r, one, target]) =>
    mod29(coefficients[0] * l + coefficients[1] * m + coefficients[2] * r + coefficients[3] * one) === mod29(target)
  );
  return {
    coefficients,
    matches: correct.filter(Boolean).length,
    total: correct.length,
    firstWrong: correct.indexOf(false)
  };
}

const ca = [];
for (const reverse of [false, true]) {
  for (const lowBitFirst of [false, true]) {
    ca.push({reverse, lowBitFirst, ...bestElementaryRule(bitRows(bytes, reverse, lowBitFirst))});
  }
}
assert.deepEqual(ca.map((x) => x.score), [1045, 1039, 1049, 1050]);
assert.deepEqual(ca.map((x) => x.rule), [194, 136, 152, 198]);

const gf = [];
for (const [register, data] of [
  ['byteModulo29', bytes.map((value) => value % 29)],
  ['byteHighBase29Digit', bytes.map((value) => Math.floor(value / 29))]
]) {
  for (const reverse of [false, true]) {
    gf.push({register, reverse, ...affineThreeNeighbor(data, reverse)});
  }
}
assert.deepEqual(gf.map((x) => x.matches), [14, 13, 10, 11]);
assert(gf.every((x) => x.total === 248 && x.firstWrong < 5));

// The planted 64-bit Rule-30 row generates all 31 later rows and all eight
// local neighborhoods occur, so an exact positive must identify the rule.
const plantedBitRows = [bitRows(bytes, false, false)[0]];
while (plantedBitRows.length < 32) plantedBitRows.push(elementaryStep(plantedBitRows.at(-1), 30));
const elementaryPlant = bestElementaryRule(plantedBitRows);
assert.deepEqual(elementaryPlant, {rule: 30, score: 1984});

// Independently plant the exact same 32x8 original-shaped GF29 geometry under
// a genuine unknown affine three-neighbor recurrence; first row is source-derived.
const plantCoefficients = [3, 26, 24, 11];
const plantedGF = bytes.slice(0, 8).map((x) => x % 29);
for (let t = 0; t < 31; t++) {
  const row = plantedGF.slice(t * 8, (t + 1) * 8);
  for (let c = 0; c < 8; c++) {
    const next = mod29(plantCoefficients[0] * row[(c + 7) % 8] +
      plantCoefficients[1] * row[c] + plantCoefficients[2] * row[(c + 1) % 8] + plantCoefficients[3]);
    plantedGF.push(next);
  }
}
const affinePlant = affineThreeNeighbor(plantedGF, false);
assert.equal(affinePlant.matches, 248);
assert.deepEqual(affinePlant.coefficients, plantCoefficients);

// Repeated Fisher-Yates order permutations preserve the authentic 32 source
// rows and every one of their 2048 source bits. Deterministic xorshift32.
let seed = 123456789;
/** @returns {number} */
function randomUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const originalRows = bitRows(bytes, false, false);
const permutation = Array.from({length: 32}, (_, i) => i);
const scores = [];
for (let i = 0; i < 10000; i++) {
  for (let j = 31; j > 0; j--) {
    const k = randomUint32() % (j + 1);
    [permutation[j], permutation[k]] = [permutation[k], permutation[j]];
  }
  scores.push(bestElementaryRule(permutation.map((k) => originalRows[k])).score);
}
const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
const upperTail = scores.filter((score) => score >= ca[0].score).length;
assert.equal(upperTail, 3425);
assert(Math.abs(mean - 1039.8001) < 1e-10);

console.log(JSON.stringify({
  originalCA: ca,
  originalGF29: gf,
  positiveControls: {rule30: elementaryPlant, affineGF29: affinePlant},
  rowPermutationNull: {permutations: scores.length, seed: 123456789, mean, upperTailAt1045: upperTail}
}, null, 2));
