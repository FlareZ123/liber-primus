"use strict";
/**
 * Narrow historical book-coordinate gate on the authentic LP2 p49–51 panel.
 *
 * The 2014 Emerson source selected paragraph:sentence:word:character
 * coordinates. The archived 2014 Self-Reliance text has longest
 * alphabetic word length 16; this test asks only if the panel's raw
 * 256 printed base60-byte values are themselves 64 four-field tuples.
 * No moduli, offsets, hidden books, or unknown-page language scores.
 *
 * Run: node sims/lp2_historical_bookcode_p50_literal_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @type {{pages: Array<{bytes: number[], tokens: string[]}>}} */
const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-grid-256.json"),
  "utf8"
));
const bytes = data.pages.flatMap(page => page.bytes);
const tokens = data.pages.flatMap(page => page.tokens);
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
assert.ok(bytes.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
assert.ok(tokens.every(t => /^[0-4][0-9A-Za-x]$/.test(t)));
const MAX_EMERSON_WORD = 16;
const result = [];
for (let phase = 0; phase < 4; phase++) {
  // A raw quartet is [paragraph, sentence, word, character].
  const chars = Array.from({length: 64},
    (_, i) => bytes[(4 * i + phase + 3) % bytes.length]);
  const valid = chars.filter(n => n >= 1 && n <= MAX_EMERSON_WORD).length;
  result.push({phase, valid, impossible: 64 - valid});
}
assert.deepEqual(result.map(x => x.valid), [2, 3, 2, 3]);
console.log(JSON.stringify({
  source: "original p49–51 32x8 panel",
  assumed_operator: "unchanged 2014 four-field book-code semantics",
  max_archived_emerson_word: MAX_EMERSON_WORD,
  result
}, null, 2));
