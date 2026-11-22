"use strict";

/**
 * Source-frozen 4x4 Hill byte consumer for the original LP2 256-token table.
 * The historical page-15 square gives prime ordinals and Fibonacci indices;
 * these are the only two original numeric matrices with odd mod-256 determinant.
 * Node 22, CommonJS, read-only. Prints original results and held-out controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const TABLE_PATH = path.join(ROOT, "resources", "liber-primus", "lp2-grid-256.json");
const CONTENT = fs.readFileSync(TABLE_PATH, "utf8");
const TABLE = JSON.parse(CONTENT).bytes;
const MATRICES = [
  ["prime-ordinal", [
    [14, 22, 35, 56],
    [9, 1, 2, 90],
    [6, 4, 3, 145],
    [988, 611, 378, 234]
  ]],
  ["fibonacci-index", [
    [13, 21, 34, 55],
    [8, 0, 1, 89],
    [5, 3, 2, 144],
    [987, 610, 377, 233]
  ]]
];

const mod = x => ((x % 256) + 256) % 256;
const transpose = m => m[0].map((_, j) => m.map(row => row[j]));
const rotate = m => transpose(m).map(row => row.reverse());

/** Exact integer determinant on the small 1..4 dimensional byte matrix. */
function determinant(m) {
  if (m.length === 1) return m[0][0];
  return m[0].reduce((sum, value, j) => {
    const minor = m.slice(1).map(row => row.filter((_, k) => j !== k));
    return sum + (j % 2 ? -1 : 1) * value * determinant(minor);
  }, 0);
}

/** An odd byte is a unit modulo 256; enumerate the unique inverse. */
function inverseScalar(x) {
  for (let i = 1; i < 256; i += 2) if (mod(x * i) === 1) return i;
  throw new RangeError("Matrix is singular modulo 256");
}

/** Adjugate inverse over Z/256Z, valid if and only if determinant is odd. */
function inverseMatrix(m) {
  const n = m.length;
  const detInverse = inverseScalar(determinant(m));
  const cofactors = m.map((row, i) => row.map((_, j) => {
    const minor = m.filter((_, k) => k !== i)
      .map(r => r.filter((_, k) => k !== j));
    return mod((i + j) % 2 ? -determinant(minor) * detInverse :
      determinant(minor) * detInverse);
  }));
  return transpose(cofactors);
}

/** Conventional four-byte Hill transform, source table order unchanged. */
function transform(bytes, matrix) {
  assert.equal(bytes.length % 4, 0);
  const output = [];
  for (let i = 0; i < bytes.length; i += 4) {
    for (let r = 0; r < 4; r++) {
      let x = 0;
      for (let c = 0; c < 4; c++) x += matrix[r][c] * bytes[i + c];
      output.push(mod(x));
    }
  }
  return output;
}

function printableCount(bytes) {
  return bytes.reduce((n, c) => n + (
    c >= 32 && c <= 126 || c === 9 || c === 10 || c === 13 ? 1 : 0), 0);
}

function longestPrintableRun(bytes) {
  let run = 0;
  let max = 0;
  for (const c of bytes) {
    run = c >= 32 && c <= 126 || c === 9 || c === 10 || c === 13 ?
      run + 1 : 0;
    max = Math.max(max, run);
  }
  return max;
}

function sourceMatrices() {
  const out = [];
  for (const [family, base] of MATRICES) {
    let current = base;
    for (let turn = 0; turn < 4; turn++) {
      for (let flip = 0; flip < 2; flip++) {
        const key = (flip ? current.map(row => row.slice().reverse()) :
          current).map(row => row.map(mod));
        const inverse = inverseMatrix(key);
        const operations = [
          ["K", key], ["Kinv", inverse],
          ["Kt", transpose(key)], ["KinvT", transpose(inverse)]
        ];
        for (const [operation, matrix] of operations) {
          const roundTrip = transform(transform([0, 1, 128, 255], matrix),
            inverseMatrix(matrix));
          assert.deepEqual(roundTrip, [0, 1, 128, 255]);
          out.push({family, turn, flip, operation, matrix});
        }
      }
      current = rotate(current);
    }
  }
  assert.equal(out.length, 64);
  return out;
}

function run() {
  assert.equal(TABLE.length, 256);
  assert(TABLE.every(Number.isInteger));
  assert(TABLE.every(v => v >= 0 && v <= 255));
  const matrices = sourceMatrices();
  const observations = matrices.map(({family, turn, flip, operation, matrix}) => {
    const bytes = transform(TABLE, matrix);
    return {
      family, turn, flip, operation,
      printable: printableCount(bytes),
      printableRun: longestPrintableRun(bytes),
      first16hex: Buffer.from(bytes.slice(0, 16)).toString("hex")
    };
  }).sort((a, b) => b.printable - a.printable ||
    b.printableRun - a.printableRun);
  assert.equal(observations[0].printable, 115);
  assert.equal(observations[0].printableRun, 4);

  const control = [...Buffer.from("THE WORDS ARE THE MAP AND THEIR NUMBERS ARE THE DIRECTION. "
    .repeat(5).slice(0, 256), "ascii")];
  assert.equal(control.length, 256);
  const controlCipher = transform(control, matrices[0].matrix);
  assert.deepEqual(transform(controlCipher, inverseMatrix(matrices[0].matrix)),
    control);
  assert.equal(printableCount(control), 256);

  // Entire 64-operator selection is repeated after each deterministic
  // original-byte-marginal-preserving shuffle.
  let state = 0x3301f15b;
  function rand() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const trials = 1000;
  let exceed = 0;
  const maxima = [];
  for (let trial = 0; trial < trials; trial++) {
    const shuffled = TABLE.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const score = Math.max(...matrices.map(({matrix}) =>
      printableCount(transform(shuffled, matrix))));
    maxima.push(score);
    if (score >= observations[0].printable) exceed++;
  }
  maxima.sort((a, b) => a - b);
  return {
    originalTableFileSha256: crypto.createHash("sha256")
      .update(CONTENT).digest("hex"),
    originalTableBytes: TABLE.length,
    sourceDeterminantsModulo256: [
      ["printed distance", 192, "not invertible"],
      ["underlying prime", 224, "not invertible"],
      ["prime ordinal", 243, "invertible"],
      ["fibonacci index", 133, "invertible"]
    ],
    exactOperations: 64,
    originalBest: observations.slice(0, 4),
    originalPrintableRange: [
      observations.at(-1).printable, observations[0].printable
    ],
    matchedShuffle: {
      trials,
      maximaMedian: maxima[Math.floor(trials / 2)],
      maximaQ95: maxima[Math.floor(0.95 * trials)],
      atLeastOriginalBest: exceed,
      empiricalUpperTail: (exceed + 1) / (trials + 1)
    },
    exactPositiveRecovery: {bytes: control.length, matched: true},
    interpretation: "No original p50 binary plaintext or file framing recovered."
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, determinant, inverseMatrix, transform, sourceMatrices};
