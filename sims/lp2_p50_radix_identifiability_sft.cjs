'use strict';

/**
 * Original LP2 pp49–51 two-character numeral decision.
 * Uses the source-transcribed 32×8 table; byte_rows is a *derived*
 * base-60 witness, never an independent source of known plaintext.
 * Run from repository root with Node.js.
 */
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/base60-grid.json');

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
const tokens = grid.rows.flat();

/**
 * Decode a two-glyph token under a fixed positional alphabet.
 * @param {string} token
 * @param {string} alphabet
 * @returns {number}
 */
function decode(token, alphabet) {
  assert.equal(token.length, 2);
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, 'Token must use supplied digit alphabet');
  return high * alphabet.length + low;
}

/**
 * Count a vector's values without coercing keys into a different alphabet.
 * @param {number[]} values
 * @returns {Record<string, number>}
 */
function histogram(values) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const value of values) {
    out[value] = (out[value] || 0) + 1;
  }
  return out;
}

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(tokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(new Set(tokens.map((token) => token[1])).size, 59);
assert.deepEqual([...alphabet60].filter((char) =>
  !tokens.some((token) => token[1] === char)), ['f']);

const values60 = tokens.map((token) => decode(token, alphabet60));
const values59 = tokens.map((token) => decode(token, alphabet59));
assert.deepEqual(values60, grid.byte_rows.flat(), 'Repository byte rows encode the base-60 interpretation');
assert.ok(values60.every((x) => x >= 0 && x <= 255));
assert.ok(values59.every((x) => x >= 0 && x <= 255));
assert.equal(Math.max(...values60), 255);
assert.equal(Math.max(...values59), 251);
assert.equal(new Set(values60).size, 161);
assert.equal(new Set(values59).size, 161);

const markers = tokens.flatMap((token, index) => token === '3D' ? [index] : []);
assert.deepEqual(markers, [83, 127]);
assert.ok(markers.every((i) => values60[i] === 193 && values59[i] === 190));

const differences = values60.map((n, i) => n - values59[i]);
assert.deepEqual(histogram(differences), {0: 36, 1: 62, 2: 62, 3: 63, 4: 33});

// Both hypotheses encode the entire observed token sequence as a
// particular length-256 stream of 8-bit values. Under an *unconstrained*
// independent uniform-byte model, each has the identical likelihood (1/256)^256;
// neither the absence of 'f' nor absence of 252..255 picks one radix.
const missingFBytes = [41, 101, 161, 221];
const missingHigh59 = [252, 253, 254, 255];
assert.ok(missingFBytes.every((x) => !values60.includes(x)));
assert.ok(missingHigh59.every((x) => !values59.includes(x)));

console.log(JSON.stringify({
  source_tokens: 256,
  units_used: 59,
  unused_base60_digit: 'f',
  distinct_values_each: 161,
  max_base60: 255,
  max_base59: 251,
  markers_3D: markers.map((offset) => ({
    table_offset: offset,
    p50_offset: offset - 80,
    base60: values60[offset],
    base59: values59[offset],
  })),
  differences: histogram(differences),
  uniform_byte_likelihood_ratio_60_over_59: 1,
  four_preselected_values_absent_probability: (252 / 256) ** 256,
  decision: 'Neither radix is selected by printed tokens and 8-bit range alone.',
}, null, 2));
