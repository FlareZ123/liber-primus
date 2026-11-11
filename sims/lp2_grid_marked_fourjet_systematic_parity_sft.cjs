"use strict";

/**
 * Original-source p50 256-byte GF29 four-jet redundancy candidate.
 *
 * The manuscript visibly provides the p39 quadratic with a double root at
 * GP Ac=24, the 13-dot marks, and an eight-column printed 32x8 byte table.
 * Treat its row-major bytes as descending GF29 polynomial coefficients.
 * Four equations then define a conditional (256,252) systematic checksum:
 *     P(24)=0, P'(24)=0, P(13)=8, P'(13)=0.
 *
 * This script checks that any fixed first 252 residues uniquely determine
 * the final four residues, and that the unmodified printed table has exactly
 * those residues. Neither author intent nor a cryptographic key is assumed.
 *
 * Node 22: node sims/lp2_grid_marked_fourjet_systematic_parity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const table = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "base60-grid.json"), "utf8"
));
const archived = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "cicada2014-sexagesimal-source.json"), "utf8"
));

const q = 29;

/** @param {number} value */
function mod(value) {
  return ((value % q) + q) % q;
}

/** @param {number} value */
function inverse(value) {
  for (let i = 1; i < q; i++) if (mod(i * value) === 1) return i;
  throw new Error("Non-invertible pivot in GF29: " + value);
}

/**
 * @param {number[]} coefficients Descending coefficients including leading 0.
 * @param {number} x
 * @returns {[number,number]} P(x),P'(x)
 */
function jet(coefficients, x) {
  let value = 0;
  let derivative = 0;
  for (const coefficient of coefficients) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + coefficient);
  }
  return [value, derivative];
}

/**
 * Solve a 4×4 linear system by exact row reduction over GF29.
 * @param {number[][]} rows Four coefficient rows, each of length four.
 * @param {number[]} rhs Target right-hand side vector of length four.
 * @returns {number[]} Four unique values.
 */
function solve(rows, rhs) {
  const augmented = rows.map((row, i) => [...row.map(mod), mod(rhs[i])]);
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && augmented[pivot][col] === 0) pivot++;
    assert(pivot < 4, "Ambiguous four-parity GF29 source encoding");
    [augmented[pivot], augmented[col]] = [augmented[col], augmented[pivot]];
    const pivotInverse = inverse(augmented[col][col]);
    augmented[col] = augmented[col].map((x) => mod(x * pivotInverse));
    for (let row = 0; row < 4; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      augmented[row] = augmented[row].map(
        (x, j) => mod(x - factor * augmented[col][j])
      );
    }
  }
  return augmented.map((row) => row[4]);
}

/**
 * Return a possible systematic GF29 parity tail for a supplied 252-rune
 * prefix. The degree3 coefficients occupy the four final printed cells.
 *
 * @param {number[]} first252
 * @returns {number[]}
 */
function sourceMarkedParity(first252) {
  assert.equal(first252.length, 252);
  const fixed = [...first252, 0, 0, 0, 0];
  const [v24, d24] = jet(fixed, 24);
  const [v13, d13] = jet(fixed, 13);
  const rows = [
    [20, 25, 24, 1], // 24^3, 24^2, 24, 1 modulo29
    [17, 19, 1, 0],  // 3×24^2, 2×24, 1, 0
    [22, 24, 13, 1],
    [14, 26, 1, 0]
  ];
  const rhs = [mod(-v24), mod(-d24), mod(8 - v13), mod(-d13)];
  return solve(rows, rhs);
}

function main() {
  assert.deepEqual(table.page_row_counts, [10, 13, 9]);
  assert.equal(table.rows.length, 32);
  assert(table.rows.every((row) => row.length === 8));
  const alpha = table.alphabet;
  const byteValues = table.rows.flat().map((token) => {
    const hi = alpha.indexOf(token[0]);
    const lo = alpha.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    return hi * 60 + lo;
  });
  assert.equal(byteValues.length, 256);
  const official = byteValues.map(mod);
  const first252 = official.slice(0, 252);
  const expected = official.slice(-4);
  const predicted = sourceMarkedParity(first252);
  assert.deepEqual(byteValues.slice(-4), [180, 36, 189, 80]);
  assert.deepEqual(expected, [6, 7, 15, 22]);
  assert.deepEqual(predicted, expected);
  assert.deepEqual(jet(official, 24), [0, 0]);
  assert.deepEqual(jet(official, 13), [8, 0]);

  // Older variant has transcription errors and fails all source checks.
  assert.deepEqual(jet(archived.decimal_values, 24), [23, 26]);
  assert.deepEqual(jet(archived.decimal_values, 13), [4, 24]);

  // Two native positive controls: a changed data prefix fails unchanged
  // parity and regains all checks when the four digits are re-encoded.
  for (const [index, increment] of [[0, 1], [122, 17]]) {
    const altered = [...first252];
    altered[index] = mod(altered[index] + increment);
    const invalid = [...altered, ...expected];
    const [n24, d24] = jet(invalid, 24);
    const [n13, d13] = jet(invalid, 13);
    assert(
      n24 !== 0 || d24 !== 0 || n13 !== 8 || d13 !== 0,
      "Modified prefix unexpectedly matches all four checks"
    );
    const repaired = [...altered, ...sourceMarkedParity(altered)];
    assert.deepEqual(jet(repaired, 24), [0, 0]);
    assert.deepEqual(jet(repaired, 13), [8, 0]);
  }

  // No byte-exact recovery: replacing one byte b by b±29 preserves all
  // GF29 polynomial computations. The source scan is still needed.
  const alternate = [...byteValues];
  alternate[165] = 47;
  assert.equal(byteValues[165], 18);
  assert.deepEqual(alternate.map(mod), official);

  // First-class original-cipher follow-through: if 252 systematic
  // information residues were intended as a period252 additive GP29 pad,
  // its first phase would reveal an ordinary nonuniform native-GP register.
  // Test only the source page and book origins, each with both signs.
  const corpus = JSON.parse(fs.readFileSync(
    path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
  ));
  const pages = corpus.pages.filter(
    (page) => page.status === "unsolved" && page.indices.length
  );
  const ciphertext = pages.flatMap((page) => page.indices);
  assert.equal(ciphertext.length, 12956);

  /** @param {number[]} symbols */
  function coincidence(symbols) {
    const h = Array(29).fill(0);
    for (const symbol of symbols) h[symbol]++;
    return h.reduce((sum, n) => sum + n * (n - 1), 0) /
      (symbols.length * (symbols.length - 1));
  }

  /**
   * @param {"book"|"page"} scope
   * @param {number} sign
   */
  function decodeDirectPad(scope, sign) {
    if (scope === "book") return ciphertext.map(
      (c, i) => mod(c + sign * first252[i % 252])
    );
    return pages.flatMap((page) => page.indices.map(
      (c, i) => mod(c + sign * first252[i % 252])
    ));
  }
  const directPadIoC = {
    bookSubtract: coincidence(decodeDirectPad("book", -1)),
    bookAdd: coincidence(decodeDirectPad("book", 1)),
    pageSubtract: coincidence(decodeDirectPad("page", -1)),
    pageAdd: coincidence(decodeDirectPad("page", 1))
  };
  assert(Math.abs(directPadIoC.bookSubtract - 0.03449591402733641) < 1e-12);
  assert(Math.abs(directPadIoC.bookAdd - 0.03451093979694835) < 1e-12);
  assert(Math.abs(directPadIoC.pageSubtract - 0.03449438881043687) < 1e-12);
  assert(Math.abs(directPadIoC.pageAdd - 0.034472142092066144) < 1e-12);

  // A real source-native plant exactly re-encrypts under the chosen 252 key.
  const solvedPage = corpus.pages.find((page) => page.page === 57);
  assert(solvedPage && solvedPage.indices.length === 95);
  const planted = ciphertext.map((_, i) => solvedPage.indices[i % 95]);
  const encrypted = planted.map((p, i) => mod(p + first252[i % 252]));
  assert.deepEqual(
    encrypted.map((c, i) => mod(c - first252[i % 252])),
    planted
  );

  /** @type {number[]} */
  const frequency = Array(29).fill(0);
  for (const rune of first252) frequency[rune]++;
  const ioc = frequency.reduce((sum, n) => sum + n * (n - 1), 0) /
    (first252.length * (first252.length - 1));

  console.log(JSON.stringify({
    originalSourceBytes: byteValues.length,
    informationSymbols: first252.length,
    sourceMarkedParityCells: byteValues.slice(-4),
    expectedParityResidues: expected,
    independentlyPredictedParityResidues: predicted,
    originalAtAc24: jet(official, 24),
    originalAtDot13: jet(official, 13),
    archivedVariantAtAc24: jet(archived.decimal_values, 24),
    archivedVariantAtDot13: jet(archived.decimal_values, 13),
    dataPrefixIoC: ioc,
    originalCiphertextIoC: coincidence(ciphertext),
    directPadIoC,
    plantedGP29Recovered: true,
    gf29CannotDistinguishByte165: true
  }, null, 2));
  console.log("PASS: four-jet parity and bounded original source-derived direct pad exclusion.");
}

main();
