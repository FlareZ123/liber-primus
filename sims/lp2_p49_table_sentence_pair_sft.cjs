"use strict";

/**
 * Exact punctuation-delimited GP29 windows immediately before and after the
 * 256-cell table on physical LP2 pages 49–51.
 *
 * Source transcription marks physical page breaks with %, but omits the
 * rune-free p50. A printed word continues across both p48→49 and p51→52.
 * This is a source-window extractor and one frozen, falsifiable key test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const transcription = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8"
);
const segments = transcription.split(/^%$/m);
assert.equal(segments.length, 57, "Rune-free physical page 50 is omitted");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} text @returns {number[]} */
function numbers(text) {
  return [...text].flatMap(char => runeIndex.has(char) ? [runeIndex.get(char)] : []);
}

/** @param {number} page @returns {string} */
function pageText(page) {
  if (page === 50) return "";
  return segments[page < 50 ? page : page - 1].replace(/[\/\r\n]/g, "");
}

/** @param {string} text @returns {number[][]} */
function words(text) {
  return text.split(/[-.&$§]/).map(numbers).filter(word => word.length > 0);
}

/** @param {number[]} input @returns {number} */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const rune of input) counts[rune]++;
  return counts.reduce((total, n) => total + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}

/** @param {number[]} input @returns {string} */
function translit(input) {
  return input.map(rune => corpus.translit[rune]).join("");
}

for (const page of corpus.pages) {
  if (page.page === 50) {
    assert.equal(page.indices.length, 0);
  } else {
    assert.deepEqual(numbers(pageText(page.page)), page.indices,
      `Transcription/corpus mismatch on physical p${page.page}`);
  }
}

const p48 = pageText(48);
const p49 = pageText(49);
const p51 = pageText(51);
const p52 = pageText(52);
const lastPeriod48 = p48.lastIndexOf(".");
const lastPeriod49 = p49.lastIndexOf(".");
const firstPeriod52 = p52.indexOf(".");
assert.ok(lastPeriod48 >= 0 && lastPeriod49 >= 0 && firstPeriod52 >= 0);
assert.ok(!p51.includes("."), "Post-table p51 has no printed full stop");

const pre48 = p48.slice(lastPeriod48 + 1);
const pre49 = p49.slice(0, lastPeriod49 + 1);
const post52 = p52.slice(0, firstPeriod52 + 1);
const before = pre48 + pre49;
const after = p51 + post52;
const beforeRunes = numbers(before);
const afterRunes = numbers(after);
const pair = beforeRunes.concat(afterRunes);
const terminal = corpus.pages[54].indices.concat(corpus.pages[55].indices);

assert.deepEqual([numbers(pre48).length, numbers(pre49).length], [72, 66]);
assert.deepEqual([numbers(p51).length, numbers(post52).length], [92, 78]);
assert.deepEqual([beforeRunes.length, afterRunes.length], [138, 170]);
assert.deepEqual([words(before).length, words(after).length], [33, 40]);
assert.equal(pair.length, 308);
assert.equal(terminal.length, 308);
assert.equal(numbers(pre48.split("-").at(-1) + pre49.split("-")[0]).length, 9);
assert.equal(numbers(p51.split("-").at(-1) + post52.split("-")[0]).length, 4);

// Only physical rune-bearing p51 begins with two identical GP29 runes.
// This rare event is at the immediate return from the numeric table.
const doubleStarts = corpus.pages.filter(page =>
  page.page < 56 && page.indices.length > 1 &&
  page.indices[0] === page.indices[1]
).map(page => page.page);
assert.deepEqual(doubleStarts, [51]);

// One frozen exploratory bridge: the 308-rune terminal chapter as a
// native GP29 additive key on the two sentences of combined length 308.
// This is an illustrative rejection, never a recovered creator-selected key.
const candidate = {};
for (const sign of [1, -1]) {
  const plaintext = pair.map((cipher, i) =>
    ((cipher + sign * terminal[i]) % 29 + 29) % 29
  );
  assert.deepEqual(plaintext.map((plain, i) =>
    ((plain - sign * terminal[i]) % 29 + 29) % 29
  ), pair, "Additive inverse failed");
  candidate[sign === 1 ? "plus" : "minus"] = {
    ioc: ioc(plaintext),
    first100: translit(plaintext.slice(0, 100))
  };
}

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-transcription.txt",
  punctuation_windows: {
    before: {
      physical_pages: [48, 49],
      parts: [72, 66],
      runes: beforeRunes.length,
      words: words(before).length,
      lengths: words(before).map(word => word.length),
      transliteration: translit(beforeRunes),
      ioc: ioc(beforeRunes)
    },
    after: {
      physical_pages: [51, 52],
      parts: [92, 78],
      runes: afterRunes.length,
      words: words(after).length,
      lengths: words(after).map(word => word.length),
      transliteration: translit(afterRunes),
      ioc: ioc(afterRunes)
    }
  },
  unique_double_first_pair_page: doubleStarts,
  additive_terminal_key: candidate,
  solved_clear_p57_ioc: ioc(corpus.pages[57].indices)
}, null, 2));
