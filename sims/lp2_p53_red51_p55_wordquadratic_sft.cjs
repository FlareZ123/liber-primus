"use strict";

/**
 * Source-constrained p53 red-triplet quadratic inverse on the terminal p55 words.
 *
 * The p53 51 red runes are assigned as ordered (a,b,c) triples to the
 * 17 complete printed words ending on p55 (the first word starts on p54).
 * Each triple defines the GP(29) position polynomial
 * K_j(t) = a_j + b_j*t + c_j*t*t, t=0 at the beginning of the full word.
 *
 * No target-trained coefficients, phase searches, crib guesses or output writes.
 * Run from any directory: node sims/lp2_p53_red51_p55_wordquadratic_sft.cjs
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));

/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {number[]} xs @returns {string} */
const transliterate = (xs) => xs.map((x) => corpus.translit[x]).join("");

const spans53 = ink.pages.find((p) => p.page === 53).red_spans;
assert.equal(spans53.length, 1);
const span = spans53[0];
assert.deepEqual([span.start, span.length], [128, 51]);
const source = corpus.pages[53].indices.slice(span.start, span.start + span.length);
assert.equal(source.map((x) => corpus.runes[x]).join(""), span.runes);
assert.equal(source.length, 51);
assert.equal(source.reduce((n, x) => n + corpus.prime[x], 0), 2262);

const carried = corpus.pages[54].indices.slice(-10);
const terminal = corpus.pages[55].indices;
const cipher = carried.concat(terminal);
assert.deepEqual([carried.length, terminal.length, cipher.length], [10, 76, 86]);

// The first complete 11-rune word crosses the p54/p55 physical page break.
const wordLengths = [11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(wordLengths.reduce((a, b) => a + b, 0), cipher.length);
assert.equal(wordLengths.length * 3, source.length);

/**
 * @param {number[]} input Complete 17-word rune sequence.
 * @param {number[]} red Three coefficients per word.
 * @param {-1|1} sign Plus or minus GP29 key during inverse.
 * @returns {{plain: number[], stream: number[], words: number[][]}}
 */
function decode(input, red, sign) {
  const plain = [];
  const stream = [];
  const words = [];
  let offset = 0;

  for (let j = 0; j < wordLengths.length; j++) {
    const [a, b, c] = red.slice(3 * j, 3 * j + 3);
    const word = [];
    for (let t = 0; t < wordLengths[j]; t++) {
      const k = mod29(a + b * t + c * t * t);
      const p = mod29(input[offset + t] + sign * k);
      stream.push(k);
      plain.push(p);
      word.push(p);
    }
    words.push(word);
    offset += wordLengths[j];
  }
  assert.equal(offset, input.length);
  return { plain, stream, words };
}

const solvedPlant = corpus.pages[57].indices.slice(0, 86);
assert.equal(solvedPlant.length, cipher.length);

console.log("Original 86-rune p54 carry + p55 IoC:", ioc(cipher).toFixed(12));
console.log("Original terminal 75-rune complete-word IoC:", ioc(cipher.slice(11)).toFixed(12));

for (const representation of ["ordinal", "prime-residue"]) {
  const red = source.map((r) => representation === "ordinal" ? r : corpus.prime[r] % 29);
  for (const sign of [-1, 1]) {
    const decoded = decode(cipher, red, /** @type {-1|1} */ (sign));

    // Test the full inverse, including the incoming cross-page word.
    assert.deepEqual(decoded.plain.map((p, i) => mod29(p - sign * decoded.stream[i])), cipher);

    // Independent authentic solved-GP plaintext as an 86-rune planted control.
    const encryptedPlant = solvedPlant.map((p, i) => mod29(p - sign * decoded.stream[i]));
    assert.deepEqual(decode(encryptedPlant, red, /** @type {-1|1} */ (sign)).plain, solvedPlant);

    console.log(JSON.stringify({
      representation,
      sign,
      original_86_ioc: ioc(decoded.plain),
      terminal_75_ioc: ioc(decoded.plain.slice(11)),
      words: decoded.words.map(transliterate),
      planted_recovery: "86/86",
      original_reencryption: "86/86"
    }));
  }
}
