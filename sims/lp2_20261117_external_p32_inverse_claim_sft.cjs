"use strict";

/**
 * Independent original-input check of the Nov-17-2026 public "five pages solved"
 * claim's precisely reported determinant 8 for LP2 p32 / claimed "page47".
 * Invertibility of an arbitrarily reflowed 11x11 ciphertext grid does not
 * supply a decrypting key, plaintext or a source-visible instruction.
 *
 * Source: resources/liber-primus/lp2-corpus.json and lp2-transcription.txt.
 * Windows Node.js 22 compatible; no network, mutable data or external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");

const mod = (n) => ((n % 29) + 29) % 29;
function inv(n) {
  for (let x = 1; x < 29; x++) if ((n * x) % 29 === 1) return x;
  throw new Error("singular pivot");
}

const p32 = corpus.pages[32].indices;
assert.equal(p32.length, 121);
const originalLines = transcription.split("%").slice(0, 55)[32]
  .trim().split("/").map((s) => [...s].filter((c) => corpus.runes.includes(c)).length)
  .filter((n) => n > 0);
assert.deepEqual(originalLines, [25, 23, 23, 21, 22, 7]);

/** @param {number[]} flat 121 GP29 indices @returns {{det:number,inverse:number[][]}} */
function matrixInverse(flat) {
  const n = 11;
  const m = Array.from({length:n}, (_, r) => [
    ...flat.slice(r * n, (r + 1) * n).map(mod),
    ...Array.from({length:n}, (_, c) => +(r === c))
  ]);
  let determinant = 1;
  for (let c = 0; c < n; c++) {
    let pivot = c;
    while (pivot < n && m[pivot][c] === 0) pivot++;
    assert.ok(pivot < n, "matrix is singular");
    if (pivot !== c) {
      [m[pivot], m[c]] = [m[c], m[pivot]];
      determinant = mod(-determinant);
    }
    const value = m[c][c];
    determinant = mod(determinant * value);
    const reciprocal = inv(value);
    m[c] = m[c].map((v) => mod(v * reciprocal));
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const factor = m[r][c];
      m[r] = m[r].map((v, k) => mod(v - factor * m[c][k]));
    }
  }
  for (let r = 0; r < n; r++) {
    assert.deepEqual(m[r].slice(0, n),
      Array.from({length:n}, (_, c) => +(r === c)));
  }
  return {det:determinant, inverse:m.map((r) => r.slice(n))};
}

const original = matrixInverse(p32);
assert.equal(original.det, 8);
const inverseFlat = original.inverse.flat();
assert.equal(inverseFlat.length, 121);
const primeRegister = matrixInverse(p32.map((x) => corpus.prime[x] % 29));
assert.equal(primeRegister.det, 21);

// The post also links generator 11 and Fibonacci period 14, so check the
// smallest plausible direct matrix period predictions without tuning a key.
const matrix = Array.from({length:11}, (_, r) => p32.slice(r * 11, r * 11 + 11));
const identity = Array.from({length:11}, (_, r) =>
  Array.from({length:11}, (_, c) => +(r === c)));
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
const multiply = (a, b) => Array.from({length:11}, (_, r) =>
  Array.from({length:11}, (_, c) =>
    mod(a[r].reduce((sum, value, k) => sum + value * b[k][c], 0))));
/** @param {number[][]} a @param {number[][]} b @returns {number} */
const differingCells = (a, b) => a.reduce((sum, row, r) =>
  sum + row.filter((value, c) => value !== b[r][c]).length, 0);
let power = identity;
let order14Difference = 0;
let order28Difference = 0;
for (let i = 1; i <= 28; i++) {
  power = multiply(power, matrix);
  if (i === 14) order14Difference = differingCells(power, identity);
  if (i === 28) order28Difference = differingCells(power, identity);
}
assert.equal(order14Difference, 120);
assert.equal(order28Difference, 114);

const inverseTranslit = inverseFlat.map((x) => corpus.translit[x]).join("");
assert.equal(inverseTranslit.slice(0, 19), "NGTHOILPEONWPEOEAFF");
assert.equal(inverseTranslit.slice(-26), "WITHSTOIAENYHAEOXSUOOEFNUJ"); // output lock

// For uniformly random 11x11 GF(29) matrices, nonzero determinant is the rule.
const invertibleNullProbability = Array.from({length:11}, (_, k) =>
  1 - 29 ** -(k + 1)).reduce((p, x) => p * x, 1);
assert.ok(Math.abs(invertibleNullProbability - 0.9643282295491619) < 1e-12);

// Two arithmetic facts named in the claim are authentic identities but
// independent of the source ciphertext.
assert.equal(new Set(Array.from({length:28}, (_, k) => {
  let product = 1;
  for (let j = 0; j <= k; j++) product = product * 11 % 29;
  return product;
})).size, 28);
let a = 0, b = 1, period = 0;
do {
  [a, b] = [b, (a + b) % 29];
  period++;
} while (a !== 0 || b !== 1);
assert.equal(period, 14);

console.log(JSON.stringify({
  originalPage:32,
  originalPhysicalScan:"49.jpg",
  originalPrintedLineLengths:originalLines,
  literalPrintedElevenByEleven:false,
  assignedElevenByElevenDet:original.det,
  primeValueElevenByElevenDet:primeRegister.det,
  inverseLinearAlgebraValid:true,
  inverseGP29Transliteration:inverseTranslit,
  randomMatrixProbabilityOfInvertibility:invertibleNullProbability,
  assertedMod29PrimitiveRoot:11,
  assertedMod29FibonacciPeriod:period,
  matrix14PowerDifferentFromIdentityCells:order14Difference,
  matrix28PowerDifferentFromIdentityCells:order28Difference,
  authenticUnknownPagePlaintextRecovered:false
}, null, 2));
