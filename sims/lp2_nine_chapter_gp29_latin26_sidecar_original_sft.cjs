"use strict";

/**
 * Original LP2 nine-chapter BASE29-to-Latin26 quotient sidecar test.
 *
 * Run in the repository with Node.js 22 or newer. No CLI parameters, downloads,
 * dependencies or file writes. The input page order and physical grid are fixed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repo = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(repo, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const panel = JSON.parse(fs.readFileSync(path.join(repo, "resources/liber-primus/base60-grid.json"), "utf8"));
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const expectedLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const expectedBitWidths = [115, 181, 273, 300, 161, 226, 265, 474, 49];
const expectedMismatchCounts = [1003, 1003, 1025, 995, 999, 1045, 1025, 1073];
const caseAmbiguous = [2, 25, 45, 50, 90, 165, 175, 182, 199, 246];

/** @param {number[]} digits @returns {bigint} */
function fromBase29(digits) {
  let result = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    result = result * 29n + BigInt(digit);
  }
  return result;
}

/** @param {bigint} value @param {number} length @returns {number[]} */
function toBase29(value, length) {
  const digits = new Array(length);
  for (let i = length - 1; i >= 0; i -= 1) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}

/** @param {bigint} value @param {number} length @returns {string} */
function toBase26Letters(value, length) {
  const output = new Array(length);
  for (let i = length - 1; i >= 0; i -= 1) {
    output[i] = String.fromCharCode(65 + Number(value % 26n));
    value /= 26n;
  }
  assert.equal(value, 0n);
  return output.join("");
}

/** @param {string} text @returns {bigint} */
function latinToNumber(text) {
  let value = 0n;
  for (const char of text) {
    const digit = char.charCodeAt(0) - 65;
    assert(digit >= 0 && digit < 26);
    value = value * 26n + BigInt(digit);
  }
  return value;
}

/** @param {string} value @returns {number} */
function latinIoC(value) {
  const n = value.length;
  const counts = new Array(26).fill(0);
  for (const char of value) counts[char.charCodeAt(0) - 65] += 1;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}

/** @param {string} a @param {string} b @returns {number} */
function hamming(a, b) {
  assert.equal(a.length, b.length);
  let changed = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) changed += 1;
  return changed;
}

/** @param {number[]} numbers @returns {string} */
function bytesToBits(numbers) {
  return numbers.map((v) => {
    assert(Number.isInteger(v) && v >= 0 && v < 256);
    return v.toString(2).padStart(8, "0");
  }).join("");
}

/** @returns {void} */
function main() {
  assert.equal(corpus.pages.filter((p) => p.page <= 55).reduce((s, p) => s + p.indices.length, 0), 12956);
  assert.equal(panel.byte_rows.length, 32);
  for (const row of panel.byte_rows) assert.equal(row.length, 8);
  assert.equal(panel.rows.length, 32);
  const tokens = panel.rows.flat();
  assert.deepEqual(tokens.flatMap((t, i) => "Il".includes(t[1]) ? [i] : []), caseAmbiguous);

  const rows = [];
  const parts = [];
  chapters.forEach(([first, last], index) => {
    const original = corpus.pages.filter((p) => p.page >= first && p.page <= last).flatMap((p) => p.indices);
    const n = original.length;
    assert.equal(n, expectedLengths[index]);
    const x = fromBase29(original);
    const power26 = 26n ** BigInt(n);
    const quotient = x / power26;
    const remainder = x % power26;
    const maxQuotient = ((29n ** BigInt(n)) - 1n) / power26;
    const width = maxQuotient.toString(2).length;
    assert.equal(width, expectedBitWidths[index]);
    const bits = quotient.toString(2).padStart(width, "0");
    const latin = toBase26Letters(remainder, n);
    assert.equal(latinToNumber(latin), remainder);
    assert.equal(quotient * power26 + remainder, x);
    parts.push(bits);
    rows.push({
      pages: [first, last], runes: n, quotient_bits: width,
      latin_ioc: Number(latinIoC(latin).toFixed(7)),
      latin_first_30: latin.slice(0, 30)
    });
  });

  const sourceBits = parts.join("");
  assert.equal(sourceBits.length, 2044);
  const tableRow = panel.byte_rows.flat();
  const tableColumn = Array.from({ length: 8 }, (_, col) => panel.byte_rows.map((row) => row[col])).flat();
  const cases = [];
  for (const [order, table] of [["row-major", tableRow], ["column-major", tableColumn]]) {
    const printedBits = bytesToBits(table);
    for (const [padding, proposed] of [["front", "0000" + sourceBits], ["back", sourceBits + "0000"]]) {
      for (const [direction, candidate] of [["forward", proposed], ["reverse-bits", proposed.split("").reverse().join("")]]) {
        cases.push({ order, padding, direction, differing_bits: hamming(printedBits, candidate) });
      }
    }
  }
  assert.deepEqual(cases.map((x) => x.differing_bits), expectedMismatchCounts);
  const smallest = Math.min(...cases.map((x) => x.differing_bits));
  const maxPossibleRepairByCaseAmbiguity = caseAmbiguous.length * 8;
  assert(smallest > maxPossibleRepairByCaseAmbiguity);

  // Positive control: a known English register hidden by a nonzero source-independent quotient.
  // This checks the integer round-trip, not whether actual LP2 used this scheme.
  const plant = "THEPLAINTEXTISKNOWNFORTHISINDEPENDENTARITHMETICPOSITIVE";
  const n = plant.length;
  const encoded = (26n ** BigInt(n)) + latinToNumber(plant);
  assert(encoded < 29n ** BigInt(n));
  const plantCipher = toBase29(encoded, n);
  assert.equal(toBase26Letters(fromBase29(plantCipher) % (26n ** BigInt(n)), n), plant);

  console.log(JSON.stringify({
    interpretation: "nine source-visible rune chapter registers, positional base29 to Latin26",
    chapters: rows,
    expected_quotient_bits_total: sourceBits.length,
    printed_grid_bits: 2048,
    spare_bits: 2048 - sourceBits.length,
    source_table_comparisons: cases,
    minimum_differing_bits: smallest,
    maximum_difference_from_10_I_l_case_flips: maxPossibleRepairByCaseAmbiguity,
    no_direct_source_table_match: true,
    no_native_language_output: rows.every((x) => x.latin_ioc < 0.04),
    positive_english_roundtrip: true
  }, null, 2));
}

if (require.main === module) main();
