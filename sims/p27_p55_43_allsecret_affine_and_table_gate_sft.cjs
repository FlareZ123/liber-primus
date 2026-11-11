"use strict";
/**
 * Source-bounded p27/p55 43-column transfer gate.
 * Tests every unknown fixed affine GF(29) combination of p27's five
 * hypothetical rows against the exact p55 word-interior channel.
 * Also evaluates the single p50-byte mod-5 row-selector interpretation,
 * and a fixed 256-symbol concatenation against p50's H/G check factors.
 *
 * Read-only, self-contained test file. Run: node sims/p27_p55_43_allsecret_affine_and_table_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", file), "utf8"));
const corpus = load("lp2-corpus.json");
const table = load("base60-grid.json");
const MOD = 29;
/** @param {number} n @returns {number} */
const mod = n => ((n % MOD) + MOD) % MOD;
/** @param {number} x @returns {number} */
function inv(x) {
  for (let k = 1; k < MOD; k++) if (mod(x * k) === 1) return k;
  throw Error("no nonzero field inverse");
}
/**
 * Row-reduced echelon form over GF(29).
 * @param {number[][]} rows
 * @param {number} width
 */
function rref(rows, width) {
  const A = rows.map(row => row.map(mod));
  const pivots = [];
  let row = 0;
  for (let col = 0; col < width; col++) {
    let selected = -1;
    for (let i = row; i < A.length; i++) if (A[i][col] !== 0) { selected = i; break; }
    if (selected < 0) continue;
    [A[row], A[selected]] = [A[selected], A[row]];
    const multiplier = inv(A[row][col]);
    A[row] = A[row].map(n => mod(n * multiplier));
    for (let i = 0; i < A.length; i++) {
      if (i === row) continue;
      const factor = A[i][col];
      if (factor !== 0) A[i] = A[i].map((n, j) => mod(n - factor * A[row][j]));
    }
    pivots.push(col);
    row++;
    if (row === A.length) break;
  }
  return {rank: row, pivots, matrix: A};
}
/** @param {number[]} values @param {number[]} divisor */
function polynomialRemainder(values, divisor) {
  const a = values.map(mod);
  const leadingInverse = inv(divisor[divisor.length - 1]);
  for (let i = a.length - 1; i >= divisor.length - 1; i--) {
    const factor = mod(a[i] * leadingInverse);
    for (let j = 0; j < divisor.length; j++) {
      a[i - divisor.length + 1 + j] =
        mod(a[i - divisor.length + 1 + j] - factor * divisor[j]);
    }
  }
  return a.slice(0, divisor.length - 1);
}
/** All 21 GF(29) monomials in five input symbols, total degree at most two. */
function quadraticFeatures(values) {
  const result = [1, ...values];
  for (let i = 0; i < 5; i++) {
    for (let j = i; j < 5; j++) result.push(mod(values[i] * values[j]));
  }
  assert.equal(result.length, 21);
  return result;
}
const translit = indices => indices.map(i => corpus.translit[i]).join("");
const p27 = corpus.pages[27].indices;
const p55 = corpus.pages[55].indices;
const body = p27.slice(19);
const segments = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const offsets = [];
let offset = 0;
for (const length of segments) {
  for (let j = 1; j < length - 1; j++) offsets.push(offset + j);
  offset += length;
}
const target = offsets.map(i => p55[i]);
assert.equal(corpus.pages.filter(p => p.page < 56).reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(p27.length, 234);
assert.equal(body.length, 215);
assert.equal(p55.length, 76);
assert.equal(offset, 76);
assert.equal(target.length, 43);
assert.equal(table.byte_rows.flat().length, 256);
const byte43 = table.byte_rows.flat().slice(84, 127);
assert.equal(byte43.length, 43);

const tests = [];
const quadratics = [];
const selectors = [];
for (const layout of ["rows-of-43", "five-tuples"]) {
  for (const encoding of ["ordinal", "prime-residue"]) {
    const cv = i => encoding === "ordinal" ? i : mod(corpus.prime[i]);
    const sample = (col, row) => cv(body[
      layout === "rows-of-43" ? row * 43 + col : col * 5 + row
    ]);
    const X = Array.from({length: 43}, (_, col) =>
      Array.from({length: 5}, (_, row) => sample(col, row)));
    const Y = target.map(cv);
    for (const affine of [false, true]) {
      const A = X.map(row => affine ? [...row, 1] : row);
      const n = A[0].length;
      const augmented = A.map((row, i) => [...row, Y[i]]);
      const left = rref(A, n);
      const both = rref(augmented, n + 1);
      assert.equal(left.rank, n);
      assert.equal(both.rank, n + 1);
      const fit = rref(augmented.slice(0, n), n + 1);
      assert.equal(fit.rank, n);
      const coefficients = Array(n).fill(0);
      fit.pivots.forEach((col, i) => { coefficients[col] = fit.matrix[i][n]; });
      const predictions = A.map(row =>
        mod(row.reduce((sum, val, j) => sum + val * coefficients[j], 0)));
      const firstMismatch = predictions.findIndex((v, i) => v !== Y[i]);
      assert.ok(firstMismatch >= n);
      const matches = predictions.filter((v, i) => v === Y[i]).length;
      // Independent positive control: known arbitrary hidden coefficients.
      const plantedCoefficients = Array.from({length: n}, (_, j) => mod(7 * j + 3));
      const planted = A.map(row => mod(row.reduce((s, val, j) =>
        s + val * plantedCoefficients[j], 0)));
      assert.equal(rref(A.map((row, i) => [...row, planted[i]]), n + 1).rank, n);
      tests.push({layout, encoding, affine, dataRank: left.rank,
        augmentedRank: both.rank, firstFitCoefficients: coefficients,
        matchesOf43: matches,
        firstMismatch: {columnOneBased: firstMismatch + 1,
          predicted: predictions[firstMismatch], observed: Y[firstMismatch]}});
    }
    // Every possible secret degree<=2 polynomial, including cross-products.
    const Q = X.map(quadraticFeatures);
    const nQuadratic = Q[0].length;
    const plainRank = rref(Q, nQuadratic);
    const complete = rref(Q.map((row, i) => [...row, Y[i]]), nQuadratic + 1);
    assert.equal(plainRank.rank, 21);
    assert.equal(complete.rank, 22);
    // A full-rank initial 21-column fit must already fail at column 22.
    const fitQ = rref(Q.slice(0, 21).map((row, i) => [...row, Y[i]]), 22);
    assert.equal(fitQ.rank, 21);
    const coefficientsQ = Array(21).fill(0);
    fitQ.pivots.forEach((col, i) => { coefficientsQ[col] = fitQ.matrix[i][21]; });
    const predictionsQ = Q.map(row => mod(row.reduce((sum, x, i) =>
      sum + x * coefficientsQ[i], 0)));
    const firstQuadraticMismatch = predictionsQ.findIndex((value, i) => value !== Y[i]);
    assert.equal(firstQuadraticMismatch, 21);
    const plantedCoefficientsQ = Array.from({length: 21}, (_, i) => mod(7 * i + 3));
    const plantedQ = Q.map(row => mod(row.reduce((sum, x, i) =>
      sum + x * plantedCoefficientsQ[i], 0)));
    assert.equal(rref(Q.map((row, i) => [...row, plantedQ[i]]), 22).rank, 21);
    quadratics.push({layout, encoding, numberOfSecretCoefficients: 21,
      dataRank: plainRank.rank, augmentedRank: complete.rank,
      firstMismatch: {columnOneBased: 22, predicted: predictionsQ[21],
        observed: Y[21]},
      matchesOf43: predictionsQ.filter((value, i) => value === Y[i]).length});
    const key = byte43.map((value, col) => sample(col, value % 5));
    const candidates = [-1, 1].map(sign => {
      const candidate = target.map((symbol, i) => mod(symbol + sign * key[i]));
      const counts = Array(MOD).fill(0);
      candidate.forEach(v => { counts[v]++; });
      return {sign, transliteration: translit(candidate),
        indexOfCoincidence: counts.reduce((s, n) => s + n * (n - 1), 0) / (43 * 42)};
    });
    selectors.push({layout, encoding, key: translit(key), candidates});
  }
}

const joined = [...body, ...target.slice(1, -1)];
assert.equal(joined.length, 256);
const H = [11, 18, 1];
const G = [mod(24 * 24), mod(-48), 1];
const polynomialChecks = {
  forwardH: polynomialRemainder(joined, H),
  forwardG: polynomialRemainder(joined, G),
  reversedH: polynomialRemainder([...joined].reverse(), H),
  reversedG: polynomialRemainder([...joined].reverse(), G)
};
assert.deepEqual(polynomialChecks, {
  forwardH: [21, 24], forwardG: [13, 1],
  reversedH: [13, 0], reversedG: [0, 4]
});
assert.equal(tests.length, 8);
assert.equal(quadratics.length, 4);
assert.equal(selectors.length, 4);
process.stdout.write(JSON.stringify({source: {
  p27RedTitle: 19, p27BlackBody: 215, p55WordInteriors: 43,
  p50TableBracket: [84, 126], p55DoubleShavedPlusP27Length: 256
}, allSecretAffineRelation: tests, allSecretQuadraticRelation: quadratics,
  tableMod5Selector: selectors,
  speculative256HGCheck: polynomialChecks,
  conclusion: "No exact fixed degree<=2 GF29 polynomial source relation, no intelligible table-selected 43-rune candidate, and no H/G codeword under the frozen 256 concatenation; no LP2 plaintext recovered."}, null, 2) + "\n");
