"use strict";

/**
 * SFT: physical LP2 p54 enlarged A (GP index24) plus exactly 232
 * original runes equals the 256 original page49-51 printed numeric cells.
 *
 * One literal, non-fitted interpretation: use the 232 last cells of the
 * original 32×8 table as an additive GP29 key for the entire p54 page.
 * Both documented numeral alphabets, signs and p56-inspired literal-F
 * conventions are reported separately; zero original models are selected.
 *
 * Run from repository root: node sims/p54_ac24_grid256_tail_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} f @returns {any} */
const json = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const printed = json("resources/liber-primus/lp2-grid-256.json");
const mod = (n) => (n % 29 + 29) % 29;
const page = corpus.pages.find((p) => p.page === 54);
const solved = corpus.pages.find((p) => p.page === 57).indices;
const original = page.indices;
const firstIndex = original[0];
assert.equal(firstIndex, 24);
assert.equal(corpus.translit[firstIndex], "A");
assert.equal(original.length, 232);
assert.equal(printed.bytes.length, 256);
assert.equal(firstIndex + original.length, printed.bytes.length);
assert.equal(solved.length, 95);

const allPages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(allPages.length, 55);
const sourceMatches = allPages
  .filter((p) => p.indices.length + p.indices[0] === printed.bytes.length)
  .map((p) => p.page);
assert.deepEqual(sourceMatches, [54]);

const tokens = printed.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59 = alphabet60.replace("f", "");
/** @param {string} alphabet @returns {number[]} */
function readNumbers(alphabet) {
  return tokens.map((pair) => {
    assert.equal(pair.length, 2);
    const a = alphabet.indexOf(pair[0]);
    const b = alphabet.indexOf(pair[1]);
    assert(a >= 0 && b >= 0);
    return alphabet.length * a + b;
  });
}
const num60 = readNumbers(alphabet60);
const num59 = readNumbers(alphabet59);
assert.deepEqual(num60, printed.bytes);

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const count = new Array(29).fill(0);
  for (const x of xs) count[x]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}
/** @param {number[]} xs @returns {string} */
function display(xs) {
  return xs.map((n) => corpus.translit[n]).join(" ");
}
/**
 * @param {number[]} cipher @param {number[]} key
 * @param {-1|1} sign @param {boolean} literalF
 * @returns {number[]}
 */
function invert(cipher, key, sign, literalF) {
  return cipher.map((c, i) => c === 0 && literalF ? 0 :
    mod(c + sign * key[firstIndex + i]));
}
/** @param {number[]} plain @param {number[]} key */
function encrypt(plain, key) {
  return plain.map((p, i) => mod(p + key[firstIndex + i]));
}

const synthetic = Array.from({length:original.length}, (_, i) => solved[i % solved.length]);
assert.equal(synthetic.length, original.length);
assert.deepEqual(invert(encrypt(synthetic, num60), num60, -1, false), synthetic);

const models = [];
for (const [readout, key] of [["printed-base60", num60], ["proposed-base59", num59]]) {
  for (const sign of [-1, 1]) {
    for (const literalF of [false, true]) {
      const decoded = invert(original, key, sign, literalF);
      const forward = decoded.map((p, i) => p === 0 && literalF && original[i] === 0 ?
        0 : mod(p - sign * key[firstIndex + i]));
      assert.deepEqual(forward, original, "Original pair must remain invertible");
      models.push({
        readout, sign, literalF, ioc: ioc(decoded),
        originalFirst40: display(decoded.slice(0, 40))
      });
    }
  }
}
assert.equal(models.length, 8);
const best = Math.max(...models.map((x) => x.ioc));
assert(best < 0.045, "A new original-input clue above the conservative screen should be reviewed");
console.log(JSON.stringify({
  source_page: 54,
  original_runes: original.length,
  enlarged_initial: {rune: "A", gpIndex: firstIndex},
  source_numeric_grid: printed.bytes.length,
  other_original_pages_meeting_232_plus_24: sourceMatches,
  original_ioc: ioc(original),
  models,
  max_ioc: best,
  positive_plant: "232/232 original GP source runes recovered by fixed sign/key",
  conclusion: "Finite direct additive p54 tail-alignment negative. No plaintext/key.",
  caution: "The initial offset interpretation is postselected from source counts; no author instruction connects it to the 256-byte table."
}, null, 2));
