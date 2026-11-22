"use strict";

/**
 * Source-selected candidate password from the original p55->p27 seven-rune bridge.
 * Read-only single-file test. It deliberately makes no assumption about a hidden
 * JPEG payload; the native OpenPuff workflow performs that independent test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const page = (number) => {
  const record = corpus.pages.find((entry) => entry.page === number);
  assert.ok(record, `Missing original physical page ${number}`);
  return record.indices;
};
const spell = (indices) => indices.map((index) => corpus.translit[index]).join("");

const p27 = page(27);
const p55 = page(55);
const p56 = page(56);
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);

const six = p55.slice(-6);
assert.deepEqual(six, p27.slice(28, 34));
assert.deepEqual(six, [23, 11, 1, 17, 18, 10]);
assert.equal(spell(six), "DJUBEI");
assert.equal(p56[0], p27[34]);
assert.equal(corpus.translit[p56[0]], "AE");
assert.equal(p27[35], 0);
assert.equal(corpus.translit[p27[35]], "F");

// The exact cross-page seven-rune match itself is already eight ASCII characters
// because GP AE transliterates to the two-character sequence "AE".
// This is the shortest source-selected historical OpenPuff password.
const seven = p27.slice(28, 35);
assert.equal(seven.length, 7);
assert.deepEqual(seven.slice(0,6), six);
assert.equal(seven[6], p56[0]);
assert.equal(spell(seven), "DJUBEIAE");
assert.equal(spell(seven).length, 8);
console.log("SOURCE_P55_P56_P27_EXACT_7RUNE_8ASCII_PASSWORD_VERIFIED");

const eight = p27.slice(28, 36);
assert.equal(eight.length, 8);
assert.equal(spell(eight), "DJUBEIAEF");
assert.equal(spell(eight.slice(0, 7)), spell(six) + corpus.translit[p56[0]]);
assert.ok(spell(eight).length >= 8 && spell(eight).length <= 32);

console.log("SOURCE_P55_P27_8RUNE_PASSWORD_VERIFIED");
console.log(JSON.stringify({
  source: "original p55 last6 + original p56 first AE = p27 offsets28..34; p27 following F",
  source_glyphs: eight.length,
  exact_cross_page_seven_rune_eight_ascii: spell(seven),
  source_ascii_characters: spell(eight).length,
  password: spell(eight),
  original_scans: [44, 72],
  interpretation: "source-motivated candidate, unverified by the authors"
}, null, 2));
