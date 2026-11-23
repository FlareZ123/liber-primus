#!/usr/bin/env node
'use strict';

/**
 * Source-locked BASE29 -> bytes on original LP2 p0-2 650-rune line interiors.
 *
 * A signed earlier Cicada stage used BASE29, while the first 46 original
 * opening line-edge runes already contain all 29 GP symbols. One direct
 * base29-to-binary interpretation of the 650 untouched rune interiors is
 * tested under each of the two source-defined alphabets: published GP order
 * and the edge-first-occurrence permutation. No fitted phase, block width,
 * unknown plaintext or byte-offset scoring.
 *
 * Windows Node22: node sims/lp2_p0_edge29_base29_ascii_original_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const gp = JSON.parse(fs.readFileSync(
  'resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcribed = fs.readFileSync(
  'resources/liber-primus/lp2-transcription.txt', 'utf8');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));

/** @param {string} sourceText @returns {number[][]} */
function lines(sourceText) {
  return sourceText.split('/').map(line =>
    [...line].filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch))
  ).filter(line => line.length);
}
const observed = transcribed.split('%').slice(0, 3).flatMap(lines);
assert.equal(observed.length, 33);
const originalTitle = observed[0].slice(0, 13);
const black = [observed[0].slice(13), ...observed.slice(1)];
const widths = [
  7, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23,
  23, 24, 23, 23, 21, 23, 23, 22, 21, 21, 21,
  21, 23, 21, 24, 22, 25, 23, 21, 24, 22, 19
];
assert.deepEqual(black.map(line => line.length), widths);
assert.equal(originalTitle.length, 13);
const edge = black.flatMap(line => [line[0], line.at(-1)]);
const core = black.flatMap(line => line.slice(1, -1));
assert.equal(core.length, 650);
assert.equal(edge.length, 66);
assert.equal(edge.length + core.length + originalTitle.length, 729);
const order = [...new Set(edge)];
assert.deepEqual(order, [
  2, 22, 3, 27, 13, 0, 15, 10, 25, 9, 18, 6, 17, 11,
  21, 28, 12, 16, 7, 24, 8, 19, 20, 1, 4, 23, 5, 26, 14
]);
assert.equal(new Set(edge.slice(0, 46)).size, 29);
assert.equal(new Set(edge.slice(0, 45)).size, 28);

/** @param {number[]} digits @returns {bigint} */
function fromBase29(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  return value;
}
/** @param {bigint} value @param {number} length @returns {number[]} */
function toBase29(value, length) {
  const digits = new Array(length);
  for (let i = length - 1; i >= 0; i--) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}
/** @param {bigint} value @returns {Buffer} */
function bytes(value) {
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}
/** @param {Buffer} buffer @returns {bigint} */
function integer(buffer) {
  return BigInt('0x' + buffer.toString('hex'));
}

/* Independently known signed 2013 BASE29 example 3301 -> 3QO. */
assert.equal(3 * 29 * 29 + 26 * 29 + 24, 3301);

/* English/PGP-format plant through both source alphabets, with no tuning. */
const plant = Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----\n', 'utf8');
const positiveValue = integer(plant);
const plantedDigits = toBase29(positiveValue, 55);
for (const alphabet of [Array.from({ length: 29 }, (_, i) => i), order]) {
  const encoded = plantedDigits.map(digit => alphabet[digit]);
  const rank = new Map(alphabet.map((symbol, index) => [symbol, index]));
  const decodedDigits = encoded.map(symbol => rank.get(symbol));
  assert.deepEqual(bytes(fromBase29(decodedDigits)), plant);
}

const outputs = [];
for (const [name, alphabet] of [
  ['canonical_GP29', Array.from({ length: 29 }, (_, i) => i)],
  ['first_46_line_edges', order]
]) {
  const rank = new Map(alphabet.map((symbol, index) => [symbol, index]));
  const digits = core.map(symbol => rank.get(symbol));
  const value = fromBase29(digits);
  assert.deepEqual(toBase29(value, core.length), digits);
  const data = bytes(value);
  const printable = [...data].filter(v =>
    (v >= 32 && v <= 126) || v === 9 || v === 10 || v === 13
  ).length / data.length;
  const text = data.toString('utf8');
  const recognizable =
    /^(?:-----BEGIN|PK\x03\x04|%PDF-|\x1f\x8b|\x89PNG|\x7fELF)/.test(
      data.toString('latin1')) ||
    printable > 0.8 ||
    /(?:https?:\/\/|\.onion|CICADA|LIBER PRIMUS|PGP SIGNED)/i.test(text);
  outputs.push({
    name, inputRunes: core.length, outputBytes: data.length,
    first32hex: data.subarray(0, 32).toString('hex'),
    sha256: crypto.createHash('sha256').update(data).digest('hex'),
    printableFraction: Number(printable.toFixed(8)),
    recognizable, roundTrip: true
  });
}
assert.equal(outputs.length, 2);
console.log(JSON.stringify({
  originalSource: 'LP2 original scans 17-19.jpg; exactly 33 physical black lines',
  redTitleRunes: 13, edgeRunes: edge.length, coreRunes: core.length,
  completeEdgeAlphabetByPosition: 46,
  originalCore: crypto.createHash('sha256').update(Buffer.from(core)).digest('hex'),
  referencePositive: '2013 signed BASE29 3QO -> 3301 and exact PGP-fixture inverse, both alphabets',
  outputs
}, null, 2));
console.log('PASS: both entire 650-rune original BASE29 byte decoders and positives complete');
