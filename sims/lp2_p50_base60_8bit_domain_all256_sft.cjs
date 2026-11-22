"use strict";

/**
 * Exact source-domain discriminator for the 256 printed LP2 p49-p51 tokens.
 *
 * The tokens are readable in two ways: byte values in radix60, or coordinates
 * into five later/earlier numbered textual items (high glyph 0..4 and low
 * glyph 0..59). This test compares the *printed values*, before using any
 * unknown plaintext, to the whole 8-bit byte domain and to an expressly
 * defined uniform-five-item coordinate rival. It never claims a cipher key.
 *
 * Run on Windows 11 with Node.js 22:
 * node sims/lp2_p50_base60_8bit_domain_all256_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "resources", "liber-primus", "lp2-grid-256.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const alphabet = source.alphabet;
assert.equal(alphabet, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
assert.equal(alphabet.length, 60);
assert.equal(new Set(alphabet).size, 60);
assert.deepEqual(source.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.equal(source.byte_count, 256);
assert.deepEqual(source.pages.map(p => [p.page, p.rows, p.cols]), [
  [49, 10, 8], [50, 13, 8], [51, 9, 8]
]);

const tokens = source.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(source.bytes.length, 256);

const highCounts = [0, 0, 0, 0, 0];
const highFourLows = [];
const decoded = [];
for (let i = 0; i < tokens.length; i++) {
  const t = tokens[i];
  assert.match(t, /^[0-4][0-9A-Za-x]$/);
  const high = t.charCodeAt(0) - 48;
  const low = alphabet.indexOf(t[1]);
  assert(low >= 0 && low < 60);
  highCounts[high]++;
  if (high === 4) highFourLows.push(low);
  const value = high * 60 + low;
  assert.equal(value, source.bytes[i], "Original source byte mismatch at cell " + i);
  decoded.push(value);
}
assert.deepEqual(highCounts, [60, 58, 65, 56, 17]);
assert.equal(highFourLows.length, 17);
assert(highFourLows.every(v => v <= 15));
assert.equal(Math.max(...decoded), 255);
assert.equal(Math.min(...decoded), 0);
assert.equal(new Set(decoded).size, 161);

/**
 * A source-domain positive: every byte from 0 to 255 must use high-digit
 * counts [60,60,60,60,16], and high=4 can only use the low digits 0..15.
 * @param {number} value
 * @returns {string}
 */
function encodeByte(value) {
  assert(Number.isInteger(value) && value >= 0 && value < 256);
  return String(Math.floor(value / 60)) + alphabet[value % 60];
}
const fullByteDomain = Array.from({ length: 256 }, (_, v) => encodeByte(v));
assert.equal(new Set(fullByteDomain).size, 256);
const completeHighCounts = Array.from({ length: 5 }, (_, high) =>
  fullByteDomain.filter(t => Number(t[0]) === high).length);
assert.deepEqual(completeHighCounts, [60, 60, 60, 60, 16]);

/**
 * Pearson test, with fixed expected positive cell counts.
 * @param {number[]} observed
 * @param {number[]} expected
 * @returns {number}
 */
function pearson(observed, expected) {
  return observed.reduce((sum, x, i) => sum + (x - expected[i]) ** 2 / expected[i], 0);
}

/** The exact chi-square(df=4) survival function; used only as a guide. */
function chi4Survival(x) {
  return Math.exp(-x / 2) * (1 + x / 2);
}
const byteExpected = [60, 60, 60, 60, 16];
const fiveEqualExpected = [51.2, 51.2, 51.2, 51.2, 51.2];
const chiByte = pearson(highCounts, byteExpected);
const chiFiveEqual = pearson(highCounts, fiveEqualExpected);
const groupedLogLR = highCounts.reduce((sum, n, i) =>
  sum + n * Math.log((byteExpected[i] / 256) / 0.2), 0);

// Under an *explicit* iid uniform 5-by-60 coordinate rival, the seventeen
// high=4 tokens all having low digits <16 costs (16/60)^17; for any high value,
// all 256 tokens lying in the byte subdomain [0,255] costs (256/300)^256.
// They are overlapping manifestations of the same fact, never independent.
const conditionalFifthProbability = (16 / 60) ** highFourLows.length;
const wholeDomainProbability = (256 / 300) ** 256;
const expectedUniqueUniformBytes = 256 * (1 - (255 / 256) ** 256);

const output = {
  source: "Unchanged LP2 printed 32x8 tokens, physical pp49-51",
  glyph_domain: "five high digits (0..4) x 60 low symbols (0..59)",
  rows_by_physical_page: [10, 13, 9],
  high_digit_counts_original: highCounts,
  high_digit_counts_uniform_8bit_byte: byteExpected,
  high_digit_counts_uniform_five_item: fiveEqualExpected,
  actual_high4_low_values: highFourLows,
  high4_low_upper_limit_original: Math.max(...highFourLows),
  decoded_range: [Math.min(...decoded), Math.max(...decoded)],
  decoded_unique: new Set(decoded).size,
  uniform_byte_expected_unique: expectedUniqueUniformBytes,
  pearson_high_digit_byte: chiByte,
  pearson_high_digit_uniform_five: chiFiveEqual,
  chi4_guide_tail_byte: chi4Survival(chiByte),
  chi4_guide_tail_uniform_five: chi4Survival(chiFiveEqual),
  grouped_likelihood_ratio_byte_vs_uniform_five: Math.exp(groupedLogLR),
  uniform_five_null_probability_all_17_high4_low_0to15: conditionalFifthProbability,
  uniform_300_coordinate_null_probability_all_256_in_byte_domain: wholeDomainProbability,
  decision: "The apparent 5x60 address alphabet fits the exact 8-bit radix60 envelope. " +
    "The iid uniform coordinate rival is strongly disfavored; a nonuniform intentional " +
    "five-item book code remains logically possible. No LP2 plaintext or key recovered."
};
assert(Math.abs(chiByte - 0.8125) < 1e-12);
assert(Math.abs(chiFiveEqual - 29.4296875) < 1e-12);
assert(conditionalFifthProbability < 2e-10);
assert(wholeDomainProbability < 3e-18);
console.log(JSON.stringify(output, null, 2));
