#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const transcription = fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"),
  "utf8"
);

const isRunic = /\p{Script=Runic}/u;
const onlyRunes = (s) => Array.from(s).filter((ch) => isRunic.test(ch)).join("");
// Master transcription delimiters: word -, clause ., paragraph &, segment $, chapter §.
// Slash is a line break and does not itself split a word.
const pageFragments = (s) =>
  s.split(/[-.&$§]/u).map(onlyRunes).filter((fragment) => fragment.length > 0);

const sections = transcription.split("%");
assert.equal(sections.length, 57, "expected the 57 rune-bearing transcription sections");
assert.equal(corpus.pages.length, 58, "expected all 58 physical LP2 pages");
assert.equal(corpus.pages[50].runic_count, 0, "physical p50 is the runeless numerical table");

const transcribedPages = sections.map((section, sectionIndex) => {
  const physicalPage = sectionIndex < 50 ? sectionIndex : sectionIndex + 1;
  const runeCount = Array.from(onlyRunes(section)).length;
  assert.equal(
    runeCount,
    corpus.pages[physicalPage].runic_count,
    "transcription/corpus rune-count mismatch on physical p" + physicalPage
  );
  const fragments = pageFragments(section);
  return {
    page: physicalPage,
    runeCount,
    fragments,
    fragmentCount: fragments.length,
    fragmentLengths: fragments.map((fragment) => Array.from(fragment).length)
  };
});

const allPages = transcribedPages.concat([{
  page: 50,
  runeCount: 0,
  fragments: [],
  fragmentCount: 0,
  fragmentLengths: []
}]).sort((a, b) => a.page - b.page);

const seventeenFragmentPages = allPages
  .filter((page) => page.fragmentCount === 17)
  .map((page) => page.page);

assert.deepEqual(seventeenFragmentPages, [55], "p55 must be the unique 17-fragment page");

const p55 = allPages.find((page) => page.page === 55);
const expectedLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(p55.runeCount, 76);
assert.deepEqual(p55.fragmentLengths, expectedLengths);
assert.equal(p55.fragments[0], "ᛝ", "first p55 fragment is the incoming one-rune carry");
assert.equal(p55.fragments.length - 1, 16, "p55 has 16 complete page-local words");

const phi = (n) => {
  let count = 0;
  for (let k = 1; k < n; k += 1) {
    let a = k;
    let b = n;
    while (b !== 0) {
      const r = a % b;
      a = b;
      b = r;
    }
    if (a === 1) count += 1;
  }
  return count;
};
assert.equal(phi(17), 16, "phi(17) must equal the 16 complete p55 words");

const result = {
  physicalPages: allPages.length,
  transcribedSections: sections.length,
  runelessPhysicalPage: 50,
  unique17FragmentPages: seventeenFragmentPages,
  nextSmallest: allPages
    .filter((page) => page.fragmentCount > 0)
    .sort((a, b) => a.fragmentCount - b.fragmentCount || a.page - b.page)
    .slice(0, 2)
    .map((page) => ({ page: page.page, fragments: page.fragmentCount })),
  p55: {
    runes: p55.runeCount,
    fragments: p55.fragmentCount,
    incomingCarry: p55.fragments[0],
    completeWords: p55.fragmentCount - 1,
    fragmentLengths: p55.fragmentLengths
  },
  phi17: phi(17),
  interpretation: "conditional recipient selector only; no plaintext or receiver"
};

console.log(JSON.stringify(result, null, 2));
