"use strict";

/**
 * Original LP2 729 = 56*13 + 1 source-anchored page-key SFT.
 * The first 13 runes of p0 are the original red heading, followed by
 * a 13-dot punctuation mark. Physical p0-p55 comprise 56 unknown pages.
 * This tests the most direct period-13 and 13-seed autokey receivers,
 * with both possible positions for the leftover rune, both 56-page\n * and 55-rune-bearing-page source groupings.
 *
 * Run with Node.js 22; reads only the canonical repository dataset.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

/** @param {number} x */
function mod29(x) {
  return (x % 29 + 29) % 29;
}

/** @param {number[]} runes */
function ioc(runes) {
  assert(runes.length > 1);
  const counts = Array(29).fill(0);
  for (const symbol of runes) counts[symbol]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} sign
 * @param {"repeat"|"cipher-auto"|"plain-auto"} mode
 */
function decode(input, key, sign, mode) {
  const output = [];
  for (let i = 0; i < input.length; i++) {
    const operand = mode === "repeat" ? key[i % 13] :
      i < 13 ? key[i] :
      mode === "cipher-auto" ? input[i - 13] : output[i - 13];
    output.push(mod29(input[i] + sign * operand));
  }
  return output;
}

/**
 * Construct a synthetic original-language ciphertext for one of the
 * genuine inverse families. This positive control does NOT validate
 * application of the family to authentic unknown LP2 ciphertext.
 *
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 * @param {"repeat"|"cipher-auto"|"plain-auto"} mode
 */
function encode(plaintext, key, sign, mode) {
  const ciphertext = [];
  for (let i = 0; i < plaintext.length; i++) {
    const operand = mode === "repeat" ? key[i % 13] :
      i < 13 ? key[i] :
      mode === "cipher-auto" ? ciphertext[i - 13] : plaintext[i - 13];
    ciphertext.push(mod29(plaintext[i] - sign * operand));
  }
  return ciphertext;
}

const opening = corpus.pages.filter((p) => p.page <= 2)
  .flatMap((p) => p.indices);
assert.equal(opening.length, 729);
assert.equal(56 * 13 + 1, opening.length);
const firstTitle = opening.slice(0, 13);
assert.equal(firstTitle.length, 13);
const originalPages = corpus.pages.filter((p) =>
  p.page >= 3 && p.page <= 55 && p.indices.length > 0);
assert.equal(originalPages.length, 52);
assert.equal(originalPages.reduce((sum, p) => sum + p.indices.length, 0), 12227);
const length100 = originalPages.filter((p) => p.indices.length >= 100);
assert.equal(length100.length, 49);

const solvedP57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solvedP57.length, 95);
const controlIoC = ioc(solvedP57);
assert(controlIoC >= 0.05);


/*
 * The two red 13-dot section delimiters bound a 716-rune black span:
 * one follows p0 rune13 and the other follows p2 rune201.
 * In addition to the full 729=56*13+1 arrangement, the enclosed
 * 716=55*13+1 admits one row per actual rune-bearing unsolved page,
 * skipping physical rune-free p50.
 */
// Separate source-motivated TWO-LAYER interpretation: assume (hypothetically)
// that the red13 title means EPIPHANY SEECS under additive GP29, obtaining its
// fixed 13-rune difference key. Apply this as an established Cicada-type
// Vigenère to the 716 black chapter runes before forming 55 potential page
// key rows. Key material is then high-entropy, so only the independent
// page-receiver outputs are scored for language. The title remains a crib,
// not an authenticated plaintext.
const epiphanySeecs = [18,13,10,13,8,24,9,26,15,18,18,5,15];
const candidateTitleKey = firstTitle.map((v, i) => mod29(v - epiphanySeecs[i]));
assert.deepEqual(candidateTitleKey,
  [26,24,8,19,27,24,18,3,0,8,0,16,19]);
const decodedBlack = opening.slice(13).map((v, i) =>
  mod29(v - candidateTitleKey[i % 13]));
assert.equal(decodedBlack.length, 716);
const runeBearingKeyPage = (page) => page >= 51 ? page - 1 : page;

const alignments = [
  {name: "full-729-final-residual", offset: 0, rows: 56,
    keyPage: (page) => page},
  {name: "full-729-initial-residual", offset: 1, rows: 56,
    keyPage: (page) => page},
  {name: "black-716-final-residual", offset: 13, rows: 55,
    keyPage: (page) => page >= 51 ? page - 1 : page},
  {name: "black-716-initial-residual", offset: 14, rows: 55,
    keyPage: runeBearingKeyPage},
  {name: "title-crib-sub-black-716-final-residual", offset: 0, rows: 55,
    stream: decodedBlack, keyPage: runeBearingKeyPage},
  {name: "title-crib-sub-black-716-initial-residual", offset: 1, rows: 55,
    stream: decodedBlack, keyPage: runeBearingKeyPage}
];
const experiments = [];
for (const alignment of alignments) {
  const {name, offset, rows, keyPage} = alignment;
  const stream = alignment.stream || opening;
  const keys = Array.from({length: rows}, (_, p) =>
    stream.slice(offset + p * 13, offset + p * 13 + 13));
  assert(keys.every((k) => k.length === 13));
  if (name === "full-729-final-residual") assert.deepEqual(keys[0], firstTitle);

  for (const reverseKey of [false, true]) {
    for (const sign of [-1, 1]) {
      for (const mode of ["repeat", "cipher-auto", "plain-auto"]) {
        const getKey = (page) => {
          const k = keys[keyPage(page)];
          return reverseKey ? [...k].reverse() : k;
        };
        const decoded = originalPages.map((p) => ({
          page: p.page, inputLength: p.indices.length,
          plaintext: decode(p.indices, getKey(p.page), sign, mode)
        }));
        const all = decoded.flatMap((p) => p.plaintext);
        assert.equal(all.length, 12227);
        const kept = decoded.filter((p) => p.inputLength >= 100);
        const pageScores = kept.map((p) => ({page: p.page, ioc: ioc(p.plaintext)}));
        const maxPage = pageScores.reduce((a, b) => a.ioc > b.ioc ? a : b);
        const key = getKey(3);
        assert.deepEqual(decode(encode(solvedP57, key, sign, mode), key, sign, mode), solvedP57);
        experiments.push({
          alignment: name, reverseKey, sign, mode,
          originalRunes: all.length,
          wholeBookIoC: ioc(all),
          meanLongPageIoC: pageScores.reduce((n, p) => n + p.ioc, 0) / pageScores.length,
          longPagesAbove0_05: pageScores.filter((p) => p.ioc >= 0.05).length,
          maxLongPage: maxPage,
          positiveControl: "95/95 P57 runes recovered from reversible synthetic encryption"
        });
      }
    }
  }
}
assert.equal(experiments.length, 72);
assert(experiments.every((p) => p.longPagesAbove0_05 === 0));
assert(experiments.every((p) => p.maxLongPage.ioc < 0.04));

console.log(JSON.stringify({
  hypothesis: "p0-p2 full 56x13+1; body 55x13+1; or title-crib Vigenere-decoded body 55x13+1",
  source: {physicalPages: "p0-p2", runes: 729, redHeadingRunes: 13,
    fullSourceKeyGroups: 56, blackBodyRunes: 716, blackBodyKeyGroups: 55, candidateTitleKey, groupSize: 13},
  authenticUnknown: {pages: 52, runes: 12227, longPages: 49},
  authenticNativeSolvedControl: {page: 57, runes: 95, ioc: controlIoC},
  experiments
}, null, 2));
