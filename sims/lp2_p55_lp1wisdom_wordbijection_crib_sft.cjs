"use strict";

/**
 * LP2 p55 terminal seven-word LP1 wisdom crib:
 * exact all-secret per-word alphabet-substitution obstruction.
 *
 * Positive plant proves the equality-pattern test recognizes true substitutions.
 * Run on Node.js 22: node sims/lp2_p55_lp1wisdom_wordbijection_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceLP1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
assert.match(sourceLP1,
  /THE TOTIENT FUNCTION IS SACRED\s+ALL THINGS SHOULD BE ENCRYPTED/u);

const source = corpus.pages.find((page) => page.page === 55);
assert(source && source.indices.length === 76);
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(lengths.reduce((sum, n) => sum + n, 0), 75);
let offset = 1; // p55's initial glyph is the real p54 NG carry.
const cipherWords = lengths.map((length) => {
  const word = source.indices.slice(offset, offset + length);
  offset += length;
  return word;
});
assert.equal(offset, 76);
const cribNames = ["THE", "TOTIENT", "FUNCTION", "IS",
  "SACRED", "ALL", "THINGS"];
const cribWords = cribNames.map((word) => encodeSourceNativeGP(word));
assert.deepEqual(cribWords.map((word) => word.length),
  lengths.slice(-7));

/** @param {number[]} values @returns {string} */
function equalityPattern(values) {
  const first = new Map();
  return values.map((value) => {
    if (!first.has(value)) first.set(value, first.size);
    return first.get(value);
  }).join("-");
}

/**
 * Minimal position mismatches after any single secret GP29 alphabet bijection
 * applied independently to the whole source word. This is an exact maximum
 * weight bipartite assignment, with a subset DP over the at-most-seven distinct
 * target symbols. Unmatched source labels can map to unused GP29 labels.
 *
 * @param {number[]} cipher - Original source word
 * @param {number[]} plain - Proposed plaintext word
 * @returns {number}
 */
function minimumChanges(cipher, plain) {
  assert.equal(cipher.length, plain.length);
  const from = [...new Set(cipher)];
  const to = [...new Set(plain)];
  assert(from.length + to.length <= 29);
  let dp = new Map([[0, 0]]);
  for (const symbol of from) {
    const next = new Map();
    for (const [mask, hits] of dp) {
      next.set(mask, Math.max(next.get(mask) ?? 0, hits));
      for (let j = 0; j < to.length; j++) {
        if (mask & (1 << j)) continue;
        let weight = 0;
        for (let k = 0; k < cipher.length; k++)
          if (cipher[k] === symbol && plain[k] === to[j]) weight++;
        const extended = mask | (1 << j);
        next.set(extended,
          Math.max(next.get(extended) ?? 0, hits + weight));
      }
    }
    dp = next;
  }
  return cipher.length - Math.max(...dp.values());
}

const rows = cribNames.map((word, i) => {
  const original = cipherWords[i + 9];
  const proposed = cribWords[i];
  return {
    originalWord: i + 10,
    crib: word,
    sourceGp: original.map((v) => corpus.translit[v]).join(""),
    cribGp: proposed.map((v) => corpus.translit[v]).join(""),
    sourceEquality: equalityPattern(original),
    cribEquality: equalityPattern(proposed),
    unavoidableRuneChanges: minimumChanges(original, proposed)
  };
});
assert.deepEqual(rows.map((row) => row.unavoidableRuneChanges),
  [0, 3, 3, 0, 1, 1, 0]);
assert.equal(rows.reduce((sum, row) =>
  sum + row.unavoidableRuneChanges, 0), 8);

// Independently secret word-level Caesar maps are bona fide GP29 bijections.
// A positive known-plaintext plant must incur zero minimum changes.
for (let i = 0; i < cribWords.length; i++) {
  const shift = (3 + 5 * i) % 29;
  const planted = cribWords[i].map((v) => (v + shift) % 29);
  assert.equal(minimumChanges(planted, cribWords[i]), 0);
  assert.deepEqual(planted.map((v) => (v - shift + 29) % 29),
    cribWords[i]);
}

if (require.main === module) {
  console.log(JSON.stringify({
    source: "LP2 physical p55, original 76 runes including NG carry",
    cribSource: "Solved LP1 physical p5 SOME WISDOM, seven consecutive words across a line break",
    scope: "all secret independent 29-symbol word-local bijections; original positions/boundaries retained",
    wordLengths: lengths.slice(-7),
    mismatchWords: rows.filter((row) =>
      row.unavoidableRuneChanges > 0).length,
    minimumOriginalRuneIdentityChanges: 8,
    exactPositivePlants: cribWords.length,
    recoveredUnknownPlaintext: false,
    rows
  }, null, 2));
}
module.exports = {minimumChanges, equalityPattern};
