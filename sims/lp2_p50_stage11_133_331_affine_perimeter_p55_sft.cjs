#!/usr/bin/env node
"use strict";

// Frozen candidate: Stage11 title=133 as perimeter start, div id=331 as stride.
// "All around you" selects the p50 perimeter; the p55 ciphertext has 76 runes.
// Use the existing base60 byte transcription, reduce bytes mod29, and apply the
// already-established p56-style additive GP29 rule once, with no phase or F skip.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const grid = JSON.parse(fs.readFileSync("resources/liber-primus/base60-grid.json", "utf8"));
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const html = fs.readFileSync("resources/external/cicada2014-stage11-onion7-original-index.html", "utf8");

assert.match(html, /<title>133<\/title>/i);
assert.match(html, /<div id=["']331["']>/i);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));

const rows = grid.byte_rows;
const perimeter = [];
for (let c = 0; c < 8; c++) perimeter.push(rows[0][c]);
for (let r = 1; r < 31; r++) perimeter.push(rows[r][7]);
for (let c = 7; c >= 0; c--) perimeter.push(rows[31][c]);
for (let r = 30; r >= 1; r--) perimeter.push(rows[r][0]);
assert.equal(perimeter.length, 76);

const start = 133 % 76; // 57
const step = 331 % 76;  // 27
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}
assert.equal(gcd(step, 76), 1);
const order = Array.from({ length: 76 }, (_, n) => (start + step * n) % 76);
assert.equal(new Set(order).size, 76);

const page55 = corpus.pages.find(page => page.page === 55);
assert.ok(page55);
const ciphertext = page55.indices;
assert.equal(ciphertext.length, 76);
const translit = corpus.translit;
const key = order.map(position => perimeter[position] % 29);
const subtract = ciphertext.map((value, i) => (value - key[i] + 29) % 29);
const addControl = ciphertext.map((value, i) => (value + key[i]) % 29);

// The source-visible 76/180 split also invites a fixed known-plaintext check:
// compare the remaining 180 affine-ordered bytes with solved p56 plaintext
// followed by the clear p57 text. p56 wording is independently pinned in
// sims/authentic_lp2_p56_totient_regression.cjs.
const expectedP56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
function toGpRunes(words) {
  const sorted = translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(" ")) {
    for (let i = 0; i < word.length;) {
      const match = sorted.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, "No GP spelling for " + word.slice(i));
      out.push(match.index);
      i += match.token.length;
    }
  }
  return out;
}
const known180 = toGpRunes(expectedP56).concat(corpus.pages.find(page => page.page === 57).indices);
assert.equal(known180.length, 180);
const affineTail = perm.slice(76).map(value => value % 29);
const tailMatches = affineTail.reduce((count, value, i) => count + (value === known180[i] ? 1 : 0), 0);
const tailReverseMatches = affineTail.reduce((count, value, i) => count + (value === known180[179 - i] ? 1 : 0), 0);

function render(indices) {
  return indices.map(index => translit[index]).join(" ");
}
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  const n = indices.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

console.log(JSON.stringify({
  hypothesis: "p50 perimeter affine traversal, start=133, stride=331, mod76; p55 decrypt by subtracting key mod29",
  source_values: { title: 133, div_id: 331 },
  perimeter: perimeter.length,
  start,
  step,
  gcd: gcd(step, 76),
  unique_positions: new Set(order).size,
  key_gp29: render(key),
  p55_subtract: render(subtract),
  p55_subtract_ioc: ioc(subtract),
  p55_add_control: render(addControl),
  p55_add_ioc: ioc(addControl),
  p55_raw_ioc: ioc(ciphertext),
  affine_tail_length: affineTail.length,
  affine_tail_mod29_first40: render(affineTail.slice(0, 40)),
  p56_plaintext_plus_p57_clear_length: known180.length,
  affine_tail_exact_matches_to_p56p57: tailMatches,
  affine_tail_reverse_matches_to_p56p57: tailReverseMatches
}, null, 2));
