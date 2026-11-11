"use strict";

/**
 * Source-only test for the unique six-rune two-word repeat linking p27 and p55.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_p27_p55_terminal_repeat_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const transcription = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"),
  "utf8",
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"),
  "utf8",
));

const isRune = (c) => c >= "\u16a0" && c <= "\u16ff";
const parts = transcription.split("%");
const unknownPages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const pageByNumber = new Map(corpus.pages.map((p) => [p.page, p]));
assert.equal(unknownPages.length, 55);

/** @type {Map<string, Array<{page:number, offset:number, length:number}>>} */
const wordPairs = new Map();
/** @type {Map<string, number>} */
const wordFrequency = new Map();
/** @type {Map<string, number>} */
const lengthPatterns = new Map();

for (const page of unknownPages) {
  // The numeric-only p50 has no rune page in the percent-delimited transcript.
  const rawPartIndex = page.page <= 49 ? page.page : page.page - 1;
  const raw = parts[rawPartIndex];
  const visibleRunes = [...raw].filter(isRune).join("");
  assert.equal(
    visibleRunes,
    page.indices.map((index) => corpus.runes[index]).join(""),
    `p${page.page} source transcript/canonical-index disagreement`,
  );
  const runePrefix = new Uint32Array(raw.length + 1);
  for (let i = 0; i < raw.length; i += 1) {
    runePrefix[i + 1] = runePrefix[i] + Number(isRune(raw[i]));
  }

  let lineStart = 0;
  for (const line of raw.split("\n")) {
    // Only within-line, explicitly '-' separated words are considered.
    // This intentionally never invents a word boundary at a line wrap.
    for (const match of line.matchAll(/[\u16a0-\u16ff]+(?:-[\u16a0-\u16ff]+)*/gu)) {
      const words = match[0].split("-");
      let charOffset = lineStart + match.index;
      for (let i = 0; i < words.length; i += 1) {
        wordFrequency.set(words[i], (wordFrequency.get(words[i]) ?? 0) + 1);
        if (i + 1 < words.length) {
          const next = words[i + 1];
          const key = `${words[i]}-${next}`;
          const occurrences = wordPairs.get(key) ?? [];
          occurrences.push({
            page: page.page,
            offset: runePrefix[charOffset],
            length: words[i].length + next.length,
          });
          wordPairs.set(key, occurrences);
          const pattern = `${words[i].length},${next.length}`;
          lengthPatterns.set(pattern, (lengthPatterns.get(pattern) ?? 0) + 1);
        }
        charOffset += words[i].length + 1;
      }
    }
    lineStart += line.length + 1;
  }
}

const phrase = "ᛞᛄᚢ-ᛒᛖᛁ";
const occurrence = wordPairs.get(phrase);
assert.deepEqual(occurrence, [
  { page: 27, offset: 28, length: 6 },
  { page: 55, offset: 70, length: 6 },
]);
assert.equal(wordFrequency.get("ᛞᛄᚢ"), 2);
assert.equal(wordFrequency.get("ᛒᛖᛁ"), 2);

const repeatPairs = [...wordPairs.entries()]
  .filter(([key, occurrences]) => occurrences.length > 1 && key.replace("-", "").length >= 6);
assert.equal(repeatPairs.length, 1);
assert.equal(repeatPairs[0][0], phrase);
const totalExplicitPairs = [...lengthPatterns.values()].reduce((a, b) => a + b, 0);
assert.equal(totalExplicitPairs, 2584);
assert.equal(lengthPatterns.get("3,3"), 164);

/**
 * Enumerate exact source n-grams. Each page is kept separate, so no page
 * boundary is silently treated as an internal cipher adjacency.
 * @param {number} length
 * @returns {Array<{runes:string, positions:Array<{page:number,offset:number}>}>}
 */
function repeatedRunes(length) {
  /** @type {Map<string, Array<{page:number,offset:number}>>} */
  const seen = new Map();
  for (const page of unknownPages) {
    const symbols = page.indices.map((index) => corpus.runes[index]);
    for (let i = 0; i + length <= symbols.length; i += 1) {
      const key = symbols.slice(i, i + length).join("");
      const locations = seen.get(key) ?? [];
      locations.push({ page: page.page, offset: i });
      seen.set(key, locations);
    }
  }
  return [...seen.entries()]
    .filter(([, positions]) => positions.length >= 2)
    .map(([runes, positions]) => ({ runes, positions }));
}

const repeatSix = repeatedRunes(6);
assert.deepEqual(repeatSix, [{
  runes: phrase.replace("-", ""),
  positions: [{ page: 27, offset: 28 }, { page: 55, offset: 70 }],
}]);
assert.deepEqual(repeatedRunes(7), []);

const toRunes = (page) => page.indices.map((index) => corpus.runes[index]).join("");
const p27 = toRunes(pageByNumber.get(27));
const p55 = toRunes(pageByNumber.get(55));
const p56 = toRunes(pageByNumber.get(56));
const seam = p55.slice(-6) + p56.slice(0, 1);
assert.equal(seam, p27.slice(28, 35));
assert.equal(seam, "ᛞᛄᚢᛒᛖᛁᚫ");
assert.equal(p27[35], "ᚠ");
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);

// A descriptive toy baseline only, conditional on observed two-word lengths.
// The true source has nonstationary structure; this is not a discovery p-value.
let expectedUniform = 0;
let expectedNoAdjacentEqual = 0;
for (const [pattern, count] of lengthPatterns) {
  const [first, second] = pattern.split(",").map(Number);
  const length = first + second;
  if (length < 6) continue;
  const possiblePairs = (count * (count - 1)) / 2;
  expectedUniform += possiblePairs / (29 ** length);
  expectedNoAdjacentEqual += possiblePairs / (29 * (28 ** (length - 1)));
}
assert.ok(expectedNoAdjacentEqual > 0.00004 && expectedNoAdjacentEqual < 0.00005);

console.log(JSON.stringify({
  source_pages: unknownPages.length,
  explicit_intraline_word_pairs: totalExplicitPairs,
  three_plus_three_pairs: lengthPatterns.get("3,3"),
  repeated_two_word_pairs_of_six_or_more_runes: repeatPairs.map(
    ([text, positions]) => ({ text, positions }),
  ),
  repeated_six_rune_ngrams: repeatSix,
  repeated_seven_rune_ngrams_within_pages: 0,
  p55_p56_seam_seven_runes: seam,
  p27_seventh_rune: p27[34],
  p27_eighth_rune: p27[35],
  toy_expected_repeated_word_pairs_length_six_or_more_uniform: expectedUniform,
  toy_expected_repeated_word_pairs_length_six_or_more_no_adjacent_equal: expectedNoAdjacentEqual,
}, null, 2));
