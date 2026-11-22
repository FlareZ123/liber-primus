"use strict";

/**
 * Source-native necessary-condition test for a GP29 nonzero-multiplier
 * ciphertext-feedback cipher with literal F=0 and intact printed words.
 *
 * A proposed rule C[i] = C[i-1] + K[i]*P[i] (mod 29), K[i] != 0,
 * forces C[i] === C[i-1] exactly when the plaintext rune is F (index 0).
 * This cannot be changed by tuning K, state, or starting offset.
 *
 * Run from the repository root with Node.js 22 or later.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = corpus.runes.join("");
const runeSet = new Set(corpus.runes);

const blocks = read("resources/liber-primus/lp2-transcription.txt")
  .split("%")
  .filter((block) => [...block].some((ch) => runeSet.has(ch)));
assert.equal(blocks.length, 57, "57 rune-bearing physical LP2 pages");

/* Physical p50 is the runeless number table, absent from this 57-block list.
 * Preserve printed word carries over all other physical page boundaries. */
const source = blocks.slice(0, 55).join("").replace(/[\/\r\n]/g, "");
const words = source.split(new RegExp(`[^${alphabet}]+`, "u")).filter(Boolean);
assert.equal(words.length, 2896, "exact original unknown printed words");
assert.equal(words.reduce((n, word) => n + [...word].length, 0), 12956);

const twos = words.filter((word) => [...word].length === 2);
const adjacentEquals = twos.filter((word) => word[0] === word[1]);
assert.equal(twos.length, 448);
assert.equal(adjacentEquals.length, 1);

/* A conservative source-native reference from solved LP1 prose: once for
 * each known continuous spread; exclude repeated continuation summaries. */
const sections = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/^### (\d+)\s*$/m);
const chosen = new Set([1, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15]);
const roman = corpus.translit;
const gpWord = (word) => {
  const text = word.toUpperCase()
    .replaceAll("K", "C").replaceAll("Q", "C")
    .replaceAll("V", "U").replaceAll("Z", "S");
  const result = [];
  for (let i = 0; i < text.length;) {
    let best = -1;
    let length = 0;
    for (let j = 0; j < roman.length; j++) {
      if (roman[j].length > length && text.startsWith(roman[j], i)) {
        best = j;
        length = roman[j].length;
      }
    }
    assert.notEqual(best, -1, `unrepresentable source word: ${word}`);
    result.push(best);
    i += length;
  }
  return result;
};

const knownTwo = [];
for (let i = 1; i + 1 < sections.length; i += 2) {
  if (!chosen.has(Number(sections[i]))) continue;
  const body = sections[i + 1]
    .replace(/^\[[^\n]*\]$/gm, "")
    .replace(/^\([^\n]*\)$/gm, "");
  for (const token of body.match(/[A-Za-z]+/g) || []) {
    const parsed = gpWord(token);
    if (parsed.length === 2) knownTwo.push({ token, indices: parsed });
  }
}
const solvedF = knownTwo.filter((x) => x.indices[1] === 0);
assert.equal(knownTwo.length, 165);
assert.equal(solvedF.length, 9);

/* Proof by exhaustive nonzero multipliers over the source-native OF word. */
const of = gpWord("OF");
assert.deepEqual(of, [3, 0]);
for (let k1 = 1; k1 < 29; k1++) {
  for (let k2 = 1; k2 < 29; k2++) {
    const first = (7 + k1 * of[0]) % 29;
    const second = (first + k2 * of[1]) % 29;
    assert.equal(first, second);
  }
}

const observed = adjacentEquals.length;
const expectedFromSolved = twos.length * solvedF.length / knownTwo.length;
console.log(JSON.stringify({
  original_runes: 12956,
  original_words: words.length,
  original_two_rune_words: twos.length,
  original_two_rune_adjacent_equal: observed,
  native_solved_two_gp_words: knownTwo.length,
  native_solved_end_F: solvedF.length,
  expected_original_under_native_rate: expectedFromSolved,
  fixed_english_wordlength_mismatch: true,
  positive_control: "all 28x28 nonzero multiplier pairs force GP OF to produce an adjacent equality",
  scope: "GP29-English printed words preserved; zero-step iff plaintext F; no unknown-page key or plaintext"
}, null, 2));
