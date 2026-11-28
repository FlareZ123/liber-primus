"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const MOD = 29;
const root = ((-5 % MOD) + MOD) % MOD;
assert.equal(root, 24);

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const p24 = corpus.pages.find((page) => page.page === 24);
assert.ok(p24);

let rune24Total = 0;
const pagesWith24 = [];
for (const page of corpus.pages) {
  const offsets = page.indices
    .map((value, index) => value === 24 ? index : null)
    .filter((value) => value !== null);
  if (offsets.length > 0) {
    rune24Total += offsets.length;
    pagesWith24.push({ page: page.page, count: offsets.length, offsets });
  }
}
assert.equal(rune24Total, 489);
assert.equal(pagesWith24.length, 57);
assert.equal(pagesWith24.find((entry) => entry.page === 24).count, 9);

const annotations = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-ink-annotations.json", "utf8"));
assert.ok(!annotations.pages.some((entry) => entry.page === 24));
assert.ok(fs.existsSync("resources/liber-primus/41.jpg"));

const signedMd = fs.readFileSync("resources/cicada2016-4gq25.md", "utf8");
const clearMatch = signedMd.match(/```text\s+Hello\.[\s\S]*?OpenPGP 7A35090F\.\s+```/);
assert.ok(clearMatch);
const allWords = clearMatch[0].match(/[A-Za-z]+/g);
const openPgpIndex = allWords.indexOf("OpenPGP");
assert.ok(openPgpIndex >= 0);
const sourceWords = allWords.slice(0, openPgpIndex + 1);
assert.equal(sourceWords.length, 43);

assert.equal(sourceWords[23].toLowerCase(), "road");
assert.equal(sourceWords[24].toLowerCase(), "and");
assert.equal(sourceWords[31].toLowerCase(), "and");
assert.equal(sourceWords[23].toLowerCase(), "road");

const chapterRoute = [0, 8, 27, 54, 40];
assert.equal(chapterRoute.includes(24), false);

console.log(JSON.stringify({
  status: "PASS",
  frozenRoot: { lambda: root, stateName: "-g" },
  naturalAddressFamily: {
    physicalZeroBasedPage: {
      page: 24,
      originalImage: "resources/liber-primus/41.jpg",
      hasInkAnnotationEntry: false,
      rune24OccurrencesOnPage: 9,
    },
    signedSourceIndexing: {
      zeroBased24: sourceWords[24],
      duplicateZeroBasedIndicesForSameWord: sourceWords
        .map((word, index) => word.toLowerCase() === sourceWords[24].toLowerCase() ? index : null)
        .filter((value) => value !== null),
      oneBased24: sourceWords[23],
      matchedOriginControl: "ROAD is zero-based index23 and one-based word24; origin choice alone switches 23<->24",
    },
    gp29Value24: {
      totalOccurrences: rune24Total,
      pagesWithOccurrence: pagesWith24.length,
      page24Occurrences: pagesWith24.find((entry) => entry.page === 24).count,
    },
    establishedChapterRoute: {
      nodes: chapterRoute,
      contains24: chapterRoute.includes(24),
    },
  },
  decision: "NON_IDENTIFYING_ADDRESS: root24 is strong algebraic state metadata but no frozen natural interpretation supplies a unique typed next receiver",
}, null, 2));
