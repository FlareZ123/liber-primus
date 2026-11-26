#!/usr/bin/env node
"use strict";

// Test the natural GP29-radix representation of RFC 5242's 23-bit codepoints.
// Five base-29 digits are sufficient because 29^4 < 2^23 < 29^5.
// This is a direct representation test only: no substitution, key search,
// page-specific reset, or arbitrary transformation is fitted.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const pages = corpus.pages.filter(page => page.page <= 55);
const tape = pages.flatMap(page => page.indices);
const RADIX = 29;
const MAX = (1 << 23) - 1;
assert.equal(pages.length, 56);
assert.equal(tape.length, 12956);

function decode(group, endian) {
  let value = 0;
  if (endian === "big") {
    for (const digit of group) value = value * RADIX + digit;
  } else {
    for (let i = group.length - 1; i >= 0; i--) value = value * RADIX + group[i];
  }
  return value;
}

function summarize(endian, offset) {
  const values = [];
  for (let i = offset; i + 5 <= tape.length; i += 5) {
    values.push(decode(tape.slice(i, i + 5), endian));
  }
  const valid = values.filter(value => value > 0 && value <= MAX).length;
  const ranges = { special: 0, mark: 0, reserved: 0, character: 0, invalid: 0 };
  for (const value of values) {
    if (value === 0 || value > MAX) ranges.invalid++;
    else if (value <= 255) ranges.special++;
    else if (value <= 511) ranges.mark++;
    else if (value <= 1023) ranges.reserved++;
    else ranges.character++;
  }
  return {
    endian, offset, groups: values.length, valid,
    invalid: values.length - valid,
    validPct: Number((100 * valid / values.length).toFixed(2)),
    ranges
  };
}

function toBase29Fixed5(value) {
  const digits = Array(5).fill(0);
  for (let i = 4; i >= 0; i--) {
    digits[i] = value % RADIX;
    value = Math.floor(value / RADIX);
  }
  assert.equal(value, 0);
  return digits;
}

function findSequence(source, sequence) {
  const hits = [];
  for (let i = 0; i + sequence.length <= source.length; i++) {
    if (sequence.every((value, j) => source[i + j] === value)) hits.push(i);
  }
  return hits;
}

const results = [];
for (const endian of ["big", "little"]) {
  for (let offset = 0; offset < 5; offset++) results.push(summarize(endian, offset));
}

const aeCodepoints = [0x40a, 0x006, 0x40c, 0x007, 0x108, 0x031];
const aeDigits = aeCodepoints.flatMap(toBase29Fixed5);
for (let i = 0; i < aeCodepoints.length; i++) {
  assert.equal(decode(aeDigits.slice(i * 5, i * 5 + 5), "big"), aeCodepoints[i]);
}
assert.equal(decode(toBase29Fixed5(0x800000), "big"), 0x800000);
assert.ok(0x800000 > MAX);

const pageLengthMod5 = {};
for (const page of pages) {
  const remainder = page.indices.length % 5;
  pageLengthMod5[remainder] = (pageLengthMod5[remainder] || 0) + 1;
}
const runeBearingPages = pages.filter(page => page.indices.length > 0);
const output = {
  schema: "lp2-rfc5242-gp29-base29-gate-v1",
  source: "resources/liber-primus/lp2-corpus.json",
  method: "Concatenate original GP29 indices for LP2 pages 0-55; decode non-overlapping groups of five indices as base-29 integers, all offsets 0-4 and both digit orders; accept values 1..2^23-1.",
  totals: {
    pages: pages.length, rune_bearing_pages: runeBearingPages.length,
    runes: tape.length, groups: Math.floor(tape.length / 5),
    remainder: tape.length % 5, page_length_mod5: pageLengthMod5,
    rune_bearing_pages_divisible_by5: runeBearingPages
      .filter(page => page.indices.length % 5 === 0)
      .map(page => ({ page: page.page, n: page.indices.length }))
  },
  radix: {
    base: RADIX, digits: 5, space: RADIX ** 5,
    valid_codepoints: MAX,
    expected_uniform_valid_pct: Number((100 * MAX / (RADIX ** 5)).toFixed(4))
  },
  results,
  ae_composite: {
    rfc_codepoints: aeCodepoints.map(value => "0x" + value.toString(16)),
    five_digit_base29: aeDigits,
    forward_hits: findSequence(tape, aeDigits),
    reverse_hits: findSequence(tape, aeDigits.slice().reverse())
  }
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
