"use strict";
/**
 * Full original p50 32x8 inner180 known-plaintext -> p55 perimeter76 recovery
 * gate. Source-selected degree2 H/G and degree9 N recurrences, followed by
 * key-independent rank obstructions to all hidden short recurrences.
 * Node.js 22, CommonJS, no dependencies.
 * Run: node sims/lp2_p50_inner180_to_p55_2d_recurrence_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} rel */
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/base60-grid.json");
const canonical = table.byte_rows.flat();
assert.equal(table.rows.length, 32);
assert.equal(canonical.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(canonical)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const H = [3, 26, 24]; // signed 2013 GP BASE29 3301 -> 3QO
const G = [27, 5, 15]; // LP2 p39 red triad
const N = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]; // table degree9 GF29 factor
const mod = x => (x % 29 + 29) % 29;
/** @param {number} value */
function inverse(value) {
  for (let i = 1; i < 29; i++) if (mod(value * i) === 1) return i;
  throw Error("noninvertible GF29 element");
}
/**
 * Polynomial remainder over GF29; coefficients in low-to-high order.
 * @param {number[]} seq @param {number[]} factor
 */
function remainder(seq, factor) {
  const v = seq.slice();
  const div = inverse(factor.at(-1));
  for (let i = v.length - factor.length; i >= 0; i--) {
    const q = mod(v[i + factor.length - 1] * div);
    for (let j = 0; j < factor.length; j++) {
      v[i + j] = mod(v[i + j] - q * factor[j]);
    }
  }
  return v.slice(0, factor.length - 1).map(mod);
}
const polynomial = canonical.map(mod).reverse();
assert.deepEqual(remainder(polynomial, H), [0, 0]);
assert.deepEqual(remainder(polynomial, G), [0, 0]);
assert.deepEqual(remainder(polynomial, N), Array(9).fill(0));

const gpTokens = corpus.translit.map((text, index) => ({ text, index }))
  .sort((a, b) => b.text.length - a.text.length);
const source56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
/** @param {string} sentence */
function plaintextGP(sentence) {
  const out = [];
  for (let word of sentence.toUpperCase().split(" ")) {
    while (word) {
      const token = gpTokens.find(t => word.startsWith(t.text));
      assert.ok(token, "source GP orthography");
      out.push(token.index);
      word = word.slice(token.text.length);
    }
  }
  return out;
}
const p56Known = plaintextGP(source56);
const p56Cipher = corpus.pages[56].indices;
const p57 = corpus.pages[57].indices;
assert.equal(p56Known.length, 85);
assert.equal(p56Cipher.length, 85);
assert.equal(p57.length, 95);
const known = p56Known.concat(p57);
const printed = p56Cipher.concat(p57);
assert.equal(known.length, 180);

// Physical clockwise outer perimeter, starting from top left.
const border = [];
for (let c = 0; c < 8; c++) border.push([0, c]);
for (let r = 1; r < 32; r++) border.push([r, 7]);
for (let c = 6; c >= 0; c--) border.push([31, c]);
for (let r = 30; r >= 1; r--) border.push([r, 0]);
assert.equal(border.length, 76);
assert.equal(new Set(border.map(([r, c]) => r * 8 + c)).size, 76);

/**
 * Source-shaped 30x6 known key residues. sign=-1 uses key=B-P;
 * sign=+1 uses key=B+P. No fitted clock/phase.
 * @param {number[]} bytes @param {number[]} text @param {number} sign
 */
function interiorResidues(bytes, text, sign) {
  return Array.from({ length: 30 }, (_, r) =>
    Array.from({ length: 6 }, (_, c) =>
      mod(bytes[(r + 1) * 8 + c + 1] + sign * text[r * 6 + c])));
}
/**
 * Test a fixed source-factor recurrence on every independent row or column:
 * s[i+d] = -(f[0]s[i] + ... + f[d-1]s[i+d-1])/f[d].
 * @param {number[][]} sequences @param {number[]} f
 */
function fixedCount(sequences, f) {
  const d = f.length - 1;
  const lead = inverse(f[d]);
  let matches = 0, total = 0;
  for (const s of sequences) for (let i = d; i < s.length; i++) {
    let v = 0;
    for (let j = 0; j < d; j++) v += f[j] * s[i - d + j];
    matches += Number(mod(-v * lead) === s[i]);
    total++;
  }
  return { matches, total };
}
/**
 * Rank of an GF29 matrix via exact row reduction.
 * @param {number[][]} matrix
 */
function rank(matrix) {
  const a = matrix.map(row => row.map(mod));
  let pivotRow = 0;
  const width = a[0].length;
  for (let col = 0; col < width && pivotRow < a.length; col++) {
    let k = pivotRow;
    while (k < a.length && a[k][col] === 0) k++;
    if (k === a.length) continue;
    [a[k], a[pivotRow]] = [a[pivotRow], a[k]];
    const inv = inverse(a[pivotRow][col]);
    for (let j = col; j < width; j++) a[pivotRow][j] = mod(a[pivotRow][j] * inv);
    for (let i = pivotRow + 1; i < a.length; i++) {
      const scalar = a[i][col];
      if (!scalar) continue;
      for (let j = col; j < width; j++)
        a[i][j] = mod(a[i][j] - scalar * a[pivotRow][j]);
    }
    pivotRow++;
  }
  return pivotRow;
}
/**
 * For rows of six known symbols, every globally shared homogeneous recurrence
 * of order <=5 satisfies the *last* position equation, whose five unknown
 * coefficients must solve the 30x5 matrix. Lower orders nest in this family.
 * For columns of 30 symbols, a globally shared order <=9 recurrence likewise
 * must solve the 126x9 matrix, including all 21 checks per column.
 * @param {number[][]} sequences @param {number} order
 */
function allSecretRankGate(sequences, order) {
  const equations = [];
  for (const seq of sequences) for (let i = order; i < seq.length; i++)
    equations.push(seq.slice(i - order, i + 1));
  assert.ok(equations.length > order);
  const coefficientRank = rank(equations.map(row => row.slice(0, order)));
  const augmentedRank = rank(equations);
  return {
    equations: equations.length,
    unknownCoefficients: order,
    coefficientRank,
    augmentedRank,
    compatible: coefficientRank === augmentedRank
  };
}
const alphabet59 = table.alphabet.replace("f", "");
const base59 = table.rows.flat().map(token =>
  alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1]));
assert.equal(base59.length, 256);
const results = [];
for (const [radix, bytes] of [["base60", canonical], ["base59", base59]]) {
  for (const [register, text] of [["solved-p56", known], ["printed-p56", printed]]) {
    for (const sign of [-1, 1]) {
      const rows = interiorResidues(bytes, text, sign);
      const columns = Array.from({ length: 6 }, (_, j) => rows.map(row => row[j]));
      const rowSecret = allSecretRankGate(rows, 5);
      const colSecret = allSecretRankGate(columns, 9);
      assert.deepEqual(
        [rowSecret.coefficientRank, rowSecret.augmentedRank,
          colSecret.coefficientRank, colSecret.augmentedRank],
        [5, 6, 9, 10]
      );
      results.push({
        radix, register, sign,
        horizontalH: fixedCount(rows, H),
        horizontalG: fixedCount(rows, G),
        verticalN: fixedCount(columns, N),
        allSecretHorizontalOrderAtMost5: rowSecret,
        allSecretVerticalOrderAtMost9: colSecret
      });
    }
  }
}
assert.deepEqual(results.map(r => [
  r.horizontalH.matches, r.horizontalG.matches, r.verticalN.matches
]), [
  [2, 5, 1], [5, 5, 6],
  [7, 7, 2], [2, 3, 4],
  [4, 5, 2], [4, 5, 9],
  [2, 4, 6], [2, 3, 5]
]);

// Native-source positive plant: a fully 2D separable key generated from the
// same degree2 and degree9 source polynomials. The 180 known plaintext runes
// recover the entire hidden 76-rune perimeter with no supplied key seeds.
/** @param {number[]} prefix @param {number[]} factor @param {number} length */
function extend(prefix, factor, length) {
  const d = factor.length - 1;
  assert.equal(prefix.length, d);
  const out = prefix.slice();
  for (let i = d; i < length; i++) {
    let v = 0;
    for (let j = 0; j < d; j++) v += factor[j] * out[i - d + j];
    out.push(mod(-v * inverse(factor[d])));
  }
  return out;
}
const key = Array.from({ length: 32 }, () => Array(8).fill(0));
for (let r = 0; r < 9; r++) {
  const generated = extend([mod(7 * r + 3), mod(11 * r + 9)], H, 8);
  for (let c = 0; c < 8; c++) key[r][c] = generated[c];
}
for (let c = 0; c < 8; c++) {
  const generated = extend(key.slice(0, 9).map(row => row[c]), N, 32);
  for (let r = 0; r < 32; r++) key[r][c] = generated[r];
}
const plantUnknown = Array.from({ length: 76 }, (_, i) => p57[i % 95]);
const plantBytes = key.map(row => row.slice());
for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++)
  plantBytes[r][c] = mod(key[r][c] + known[(r - 1) * 6 + (c - 1)]);
for (let i = 0; i < 76; i++) {
  const [r, c] = border[i];
  plantBytes[r][c] = mod(key[r][c] + plantUnknown[i]);
}
const plantRows = interiorResidues(plantBytes.flat(), known, -1);
const plantColumns = Array.from({ length: 6 }, (_, j) => plantRows.map(row => row[j]));
assert.deepEqual(fixedCount(plantRows, H), { matches: 120, total: 120 });
assert.deepEqual(fixedCount(plantColumns, N), { matches: 126, total: 126 });
assert.deepEqual(allSecretRankGate(plantRows, 5).compatible, true);
assert.deepEqual(allSecretRankGate(plantColumns, 9).compatible, true);

/** @param {number[][]} inner exactly 30x6 */
function recoverKey(inner) {
  const k = Array.from({ length: 32 }, () => Array(8).fill(null));
  for (let r = 1; r <= 30; r++) {
    for (let c = 1; c <= 6; c++) k[r][c] = inner[r - 1][c - 1];
    k[r][0] = mod(-(H[1] * k[r][1] + H[2] * k[r][2]) * inverse(H[0]));
    k[r][7] = mod(-(H[0] * k[r][5] + H[1] * k[r][6]) * inverse(H[2]));
  }
  for (let c = 0; c < 8; c++) {
    let backward = 0;
    for (let j = 1; j <= 9; j++) backward += N[j] * k[j][c];
    k[0][c] = mod(-backward * inverse(N[0]));
    let forward = 0;
    for (let j = 0; j < 9; j++) forward += N[j] * k[22 + j][c];
    k[31][c] = mod(-forward * inverse(N[9]));
  }
  return k;
}
const recoveredPlantKey = recoverKey(plantRows);
assert.deepEqual(recoveredPlantKey, key);
const recoveredUnknown = border.map(([r, c]) => mod(plantBytes[r][c] - recoveredPlantKey[r][c]));
assert.deepEqual(recoveredUnknown, plantUnknown);

console.log(JSON.stringify({
  originalByteSHA256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  originalGeometry: "32x8 table = 30x6 inner180 known solved p56+p57 + 76-cell outer p55",
  sourcePolynomials: { H, G, N },
  original: results,
  syntheticKnown180Predictions: { horizontal: "120/120", vertical: "126/126" },
  syntheticNativeGPPerimeterRecovery: "76/76",
  result: "No source-factor or ANY shared linear recurrence of horizontal order <=5 and vertical order <=9 fits the original interior known-plaintext residuals. No original p55 plaintext or key."
}, null, 2));
