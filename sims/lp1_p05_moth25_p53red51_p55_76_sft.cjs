"use strict";
/**
 * Original LP1 hidden 25-cell square against the 2014 moth-linked
 * p53 red51 and p55 whole76 source runs, with conditional plaintext-F skips.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const color = JSON.parse(fs.readFileSync(path.join(
  root, "resources/liber-primus/lp2-page53-red-span.json"), "utf8"));
const source = fs.readFileSync(path.join(
  root, "resources/cicada2014-openpuff-magic-squares.txt"), "utf8");
const squares = source.trim().split(/\r?\n\s*\r?\n/).map(block =>
  block.trim().split(/\r?\n/).map(row =>
    row.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(x => x.length), [5, 7, 5]);
const hidden25 = squares[2].flat();
assert.equal(hidden25.length, 25);

/** @param {number} n Natural positive number. @returns {number} */
function totient(n) {
  let remaining = n;
  let count = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      count = (count / p) * (p - 1);
      while (remaining % p === 0) remaining /= p;
    }
  }
  if (remaining > 1) count = (count / remaining) * (remaining - 1);
  return count;
}
const key = hidden25.map(n => totient(n) % 29);
const p53 = corpus.pages.find(page => page.page === 53).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p53.length, color.page_rune_count);
assert.equal(color.red_text.start_rune_inclusive, 128);
assert.equal(color.red_text.rune_count, 51);
const red = p53.slice(color.red_text.start_rune_inclusive,
  color.red_text.end_rune_exclusive);
assert.equal(red.length, 51);
assert.equal(p55.length, 76);
assert.deepEqual(red.flatMap((r, i) => r === 0 ? [i] : []), [38]);
assert.deepEqual(p55.flatMap((r, i) => r === 0 ? [i] : []), [25]);

/**
 * @param {number[]} cipher Exact original GP29 symbol vector.
 * @param {number} skip Known ciphertext-F position treated provisionally as
 *   literal plaintext-F bypass.
 * @returns {number[]}
 */
function decrypt(cipher, skip) {
  let clock = 0;
  return cipher.map((value, i) => {
    if (i === skip) {
      assert.equal(value, 0);
      return 0;
    }
    const plaintext = (value - key[clock % 25] + 29) % 29;
    clock++;
    return plaintext;
  });
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const bins = Array(29).fill(0);
  input.forEach(value => bins[value]++);
  return bins.reduce((sum, n) => sum + n * (n - 1), 0)
    / (input.length * (input.length - 1));
}
const redPlain = decrypt(red, 38);
const page55Plain = decrypt(p55, 25);
const combined = redPlain.concat(page55Plain);
assert.equal(redPlain.length - 1, 50);
assert.equal(page55Plain.length - 1, 75);
assert.equal(combined.length - 2, 125);
assert.equal(ioc(redPlain), 0.03529411764705882);
assert.ok(Math.abs(ioc(page55Plain) - 0.03333333333333) < 1e-10);
for (const [cipher, skip] of [[red, 38], [p55, 25]]) {
  const plaintext = decrypt(cipher, skip);
  let k = 0;
  const replay = plaintext.map((v, i) => i === skip ? 0
    : (v + key[(k++) % 25]) % 29);
  assert.deepEqual(replay, cipher);
}
console.log(JSON.stringify({
  selected_latin_square_side: 5,
  matched_lengths: {p53_red: 51, p55_full: 76, concatenated: 127},
  source_F_indices: {p53_red: 38, p55: 25},
  hypothetical_key_consumption: {p53_red: 50, p55: 75, total: 125},
  exact_hidden_square_cycles: 5,
  phi_minus_p53_red_ioc: ioc(redPlain),
  phi_minus_p55_ioc: ioc(page55Plain),
  phi_minus_combined_ioc: ioc(combined),
  p53_red_candidate: redPlain.map(x => corpus.translit[x]).join(" "),
  result: "exact source-linked geometry, but no authenticated plaintext"
}, null, 2));
