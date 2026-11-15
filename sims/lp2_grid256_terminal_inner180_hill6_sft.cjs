"use strict";
/**
 * Exact all-secret GF29 Hill-6/affine rank obstruction for the printed
 * 30x6 interior of the 32x8 grid and the 180 solved p56+p57 GP29 runes.
 * Run: node sims/lp2_grid256_terminal_inner180_hill6_sft.cjs
 *
 * This tests a source-geometric hypothesis, not a known historical cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")).bytes;
const MOD = 29;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let y = 1; y < MOD; y++) if (mod(x * y) === 1) return y;
  throw new Error("GF29 inverse undefined for zero");
}

/**
 * Exact Gaussian-elimination rank over GF29.
 * @param {number[][]} source
 * @returns {number}
 */
function rank(source) {
  const a = source.map(row => row.map(mod));
  const m = a.length;
  const n = a[0].length;
  let r = 0;
  for (let col = 0; col < n && r < m; col++) {
    let pivot = r;
    while (pivot < m && a[pivot][col] === 0) pivot++;
    if (pivot === m) continue;
    [a[r], a[pivot]] = [a[pivot], a[r]];
    const scale = inverse(a[r][col]);
    for (let j = col; j < n; j++) a[r][j] = mod(a[r][j] * scale);
    for (let i = r + 1; i < m; i++) {
      const factor = a[i][col];
      if (!factor) continue;
      for (let j = col; j < n; j++) {
        a[i][j] = mod(a[i][j] - factor * a[r][j]);
      }
    }
    r++;
  }
  return r;
}

/**
 * @param {number} count
 * @returns {number[]}
 */
function primes(count) {
  const values = [];
  for (let n = 2; values.length < count; n++) {
    if (values.every(p => n % p !== 0)) values.push(n);
  }
  return values;
}

/** @param {number[]} a @returns {number[][]} */
function rows6(a) {
  assert.equal(a.length, 180);
  return Array.from({length: 30}, (_, j) => a.slice(6 * j, 6 * j + 6));
}

/**
 * A known invertible, upper-triangular affine Hill transform, retained as
 * an independently recoverable positive control on authentic p56+p57 GP29.
 * @param {number[][]} x
 * @returns {number[][]}
 */
function plant(x) {
  return x.map(row => Array.from({length: 6}, (_, col) => {
    let v = 3 * col + 4;
    for (let i = 0; i <= col; i++) {
      const coeff = i === col ? 1 : i + col + 1;
      v += row[i] * coeff;
    }
    return mod(v);
  }));
}

/**
 * Exact source-native inverse of the positive affine Hill plant.
 * @param {number[][]} y
 * @returns {number[][]}
 */
function recoverPlant(y) {
  return y.map(row => {
    const x = [];
    for (let col = 0; col < 6; col++) {
      let value = row[col] - (3 * col + 4);
      for (let i = 0; i < col; i++) value -= x[i] * (i + col + 1);
      x.push(mod(value));
    }
    return x;
  });
}

assert.equal(grid.length, 256);
const physicalInterior = Array.from({length: 30}, (_, row) =>
  grid.slice(8 * (row + 1) + 1, 8 * (row + 1) + 7).map(mod));
assert(physicalInterior.every(row => row.length === 6));
assert.equal(physicalInterior.flat().length, 180);
const ciphertext56 = corpus.pages.find(p => p.page === 56).indices;
const clear57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(ciphertext56.length, 85);
assert.equal(clear57.length, 95);

// Reproduce p56's authenticated prime-totient/F-bypass plaintext, including
// its only clear literal F at local offset 56. p57 is already clear.
const primeList = primes(85);
let clock = 0;
const plain56 = ciphertext56.map((rune, i) => i === 56
  ? 0 : mod(rune - (primeList[clock++] - 1)));
assert.equal(plain56.slice(0, 12)
  .map(i => corpus.translit[i]).join(""), "ANENDWITHINTHE");
assert.equal(clock, 84);
const streams = [
  ["known-plaintext", rows6(plain56.concat(clear57))],
  ["printed-terminal", rows6(ciphertext56.concat(clear57))]
];
const checks = {};
for (const [name, X] of streams) {
  const joint = X.map((row, i) => row.concat(physicalInterior[i]));
  const withOne = X.map(row => row.concat([1]));
  const affineJoint = X.map((row, i) =>
    row.concat([1], physicalInterior[i]));
  const sourceRank = rank(X);
  const tableRank = rank(physicalInterior);
  const fullRank = rank(joint);
  const augmentedSourceRank = rank(withOne);
  const augmentedFullRank = rank(affineJoint);
  assert.deepEqual([sourceRank, tableRank, fullRank,
    augmentedSourceRank, augmentedFullRank], [6, 6, 12, 7, 13]);
  checks[name] = {
    knownRows: 30,
    sourceRank, tableRank, fullRank,
    augmentedSourceRank, augmentedFullRank,
    anyGlobalHill6Possible: fullRank === sourceRank,
    anyGlobalAffineHill6Possible:
      augmentedFullRank === augmentedSourceRank
  };
}
const native = streams[0][1];
const planted = plant(native);
assert.deepEqual(recoverPlant(planted), native);
assert.equal(rank(native.map((row, i) => row.concat(planted[i]))), 7);
assert.equal(rank(native.map((row, i) =>
  row.concat([1], planted[i]))), 7);
console.log(JSON.stringify({
  source: {
    originalGrid: "32x8 bytes",
    geometricallySelectedOuterRimCells: 76,
    interiorRows: 30,
    interiorColumns: 6,
    interiorCells: 180,
    knownSourcePlainRunes: 85 + 95,
    sourceField: "GF(29)"
  },
  originalRankGates: checks,
  positiveControl: {
    gp29RunesRecovered: planted.length * 6,
    exactAffineHill6RoundTrip: true,
    nativePlaintextSource: "p56 prime-totient decrypt + p57 clear"
  },
  decision: "No single global invertible 6x6 Hill or affine Hill map can relate the printed natural-row-major 30x6 interior table to the 180 authentic terminal GP29 symbols, either in original ciphertext or solved-plaintext register. Independent source-selection would be needed for another orientation or evolving key."
}, null, 2));
