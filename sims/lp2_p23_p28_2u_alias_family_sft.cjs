"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8")
);
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);

const cells = grid.rows.flat();
assert.equal(cells.length, 256);

/** @type {Map<string, number[]>} */
const classes = new Map();
for (let address = 0; address < cells.length; address += 1) {
  const token = cells[address];
  if (!classes.has(token)) classes.set(token, []);
  classes.get(token).push(address);
}

const duplicateClasses = [...classes.entries()]
  .filter(([, addresses]) => addresses.length > 1)
  .sort((left, right) => left[1][0] - right[1][0]);

assert.equal(duplicateClasses.length, 69);
assert.equal(
  duplicateClasses.reduce((sum, [, addresses]) => sum + addresses.length, 0),
  164
);
assert.equal(Math.max(...duplicateClasses.map(([, a]) => a.length)), 4);
assert.deepEqual(classes.get("2U"), [28, 97, 213]);

const pageNumbers = Array.from({ length: 58 }, (_, index) => index);
const runeCountValues = [...new Set(
  corpus.pages
    .map((page) => page.runic_count)
    .filter((count) => count >= 0 && count < 256)
)].sort((a, b) => a - b);

assert.deepEqual(runeCountValues, [
  0, 66, 76, 85, 92, 95, 121, 131, 137, 159, 179, 196,
  201, 208, 213, 214, 217, 228, 231, 232, 234, 238, 240, 255,
]);

// Primary source/layout phrase values frozen for this audit before the holdout:
// THE ORIGINAL = 97 from Director #1800, and THEIR RISE = 81 from the
// independently established p33 serializer.
const strictPhraseValues = [81, 97];

// Conservative post-selector family control: every distinct in-range GP0 value
// explicitly named in the authoritative synthesis at audit time, plus the two
// source/layout values above. This is deliberately broader than the strict
// hidden-layout catalog and can only add competitors.
const broadPhraseValues = [
  20, 25, 30, 34, 35, 36, 39, 42, 48, 51, 54, 56, 57,
  59, 62, 71, 75, 81, 83, 92, 96, 97, 98, 102, 112,
];

/**
 * @param {number[]} phraseValues
 * @returns {{page:number,runes:number,phrase:number,token:string}[]}
 */
function typedHits(phraseValues) {
  const hits = [];
  for (const page of pageNumbers) {
    for (const runes of runeCountValues) {
      for (const phrase of phraseValues) {
        const token = cells[page];
        if (token === cells[runes] && token === cells[phrase]) {
          hits.push({ page, runes, phrase, token });
        }
      }
    }
  }
  return hits;
}

const strictHits = typedHits(strictPhraseValues);
const broadHits = typedHits(broadPhraseValues);

assert.deepEqual(strictHits, [
  { page: 28, runes: 213, phrase: 97, token: "2U" },
]);
assert.deepEqual(broadHits, [
  { page: 28, runes: 213, phrase: 97, token: "2U" },
  { page: 42, runes: 85, phrase: 42, token: "0S" },
]);

const p23 = corpus.pages.find((page) => page.page === 23);
const p33 = corpus.pages.find((page) => page.page === 33);
const p56 = corpus.pages.find((page) => page.page === 56);
assert.equal(p23.runic_count, 213);
assert.equal(p33.runic_count, 214);
assert.equal(p56.runic_count, 85);

// Prospectively frozen transfer:
// p33 THEIR RISE -> +2 -> p35, with source page rune count 214.
const holdout = [35, 81, 214].map((address) => ({
  address,
  token: cells[address],
  duplicateClass: classes.get(cells[address]),
}));

assert.deepEqual(holdout, [
  { address: 35, token: "0d", duplicateClass: [35] },
  { address: 81, token: "0w", duplicateClass: [81, 220] },
  { address: 214, token: "4B", duplicateClass: [157, 214] },
]);
assert.equal(new Set(holdout.map((entry) => entry.token)).size, 3);

console.log(JSON.stringify({
  duplicateClassCount: duplicateClasses.length,
  duplicateAddressCount: duplicateClasses
    .reduce((sum, [, addresses]) => sum + addresses.length, 0),
  maxMultiplicity: Math.max(...duplicateClasses.map(([, a]) => a.length)),
  original2U: classes.get("2U"),
  typedFamily: {
    pageNumbers: pageNumbers.length,
    runeCountValues: runeCountValues.length,
    strictPhraseValues,
    strictHits,
    broadPhraseValues,
    broadHits,
  },
  prospectiveHoldout: holdout,
  duplicateClasses: duplicateClasses
    .map(([token, addresses]) => ({ token, addresses })),
}, null, 2));
