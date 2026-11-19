"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

const marks = [];
for (const page of ink.pages) {
  for (const [start, count, color] of page.large_punctuation || []) {
    marks.push({page: page.page, start, count, color});
  }
}
assert.equal(marks.length, 36);
assert.equal(signedWords[marks.length], "GOOD");

const bySize = new Map();
for (const mark of marks) {
  if (!bySize.has(mark.count)) bySize.set(mark.count, []);
  bySize.get(mark.count).push(mark);
}
assert.deepEqual([...bySize.keys()].sort((a, b) => a - b), [10, 13, 23]);
assert.deepEqual(
  [...bySize.entries()]
    .map(([count, rows]) => [count, rows.length])
    .sort((a, b) => a[0] - b[0]),
  [[10, 4], [13, 31], [23, 1]]
);

// The complete source-visible large-punctuation size alphabet is itself a
// valid set of authenticated 2016 source indices.
const sizeWords = [...bySize.keys()]
  .sort((a, b) => a - b)
  .map((count) => [count, signedWords[count]]);
assert.deepEqual(sizeWords, [
  [10, "PRIMUS"],
  [13, "WAY"],
  [23, "ROAD"],
]);

// The four 10-dot marks form a complete class. Their total dot count is also a
// valid authenticated source index, PATHS.
const tenMarks = bySize.get(10);
assert.deepEqual(
  tenMarks.map((mark) => [mark.page, mark.start, mark.color]),
  [
    [36, 99, "red"],
    [38, 186, "red"],
    [49, 66, "red"],
    [56, 45, "red"],
  ]
);
const tenClassTotal = tenMarks.reduce((total, mark) => total + mark.count, 0);
assert.equal(tenClassTotal, 40);
assert.equal(signedWords[tenClassTotal], "PATHS");

// The two global punctuation counts bookend the authenticated warning corridor.
assert.deepEqual(
  signedWords.slice(marks.length, tenClassTotal + 1),
  ["GOOD", "LUCK", "BEWARE", "FALSE", "PATHS"]
);

// The p36/p38 pair visibly brackets the five numbered sections. Their total
// independently freezes the local p36 target used by the MEANING recovery.
const numberedBracketMarks = tenMarks.filter(
  (mark) => mark.page === 36 || mark.page === 38
);
assert.equal(numberedBracketMarks.length, 2);
const numberedBracketTotal = numberedBracketMarks.reduce(
  (total, mark) => total + mark.count,
  0
);
assert.equal(numberedBracketTotal, 20);
assert.equal(signedWords[numberedBracketTotal], "MEANING");

// One bracket already has an independently established readout as index10
// PRIMUS, with visible section numbers 1..5 producing IS THE WAY ITS WORDS.
assert.equal(signedWords[10], "PRIMUS");
assert.deepEqual(
  Array.from({length: 5}, (_, index) => signedWords[10 + index + 1]),
  ["IS", "THE", "WAY", "ITS", "WORDS"]
);

// Route-semantic source words recovered directly from visible punctuation
// counts. This is an index/readout result, not a body-cipher claim.
const readouts = {
  oneTenDotBracket: [10, signedWords[10]],
  oneThirteenDotGlyph: [13, signedWords[13]],
  bothNumberedBrackets: [20, signedWords[20]],
  oneTwentyThreeDotGlyph: [23, signedWords[23]],
  allTenDotGlyphs: [40, signedWords[40]],
};
assert.deepEqual(readouts, {
  oneTenDotBracket: [10, "PRIMUS"],
  oneThirteenDotGlyph: [13, "WAY"],
  bothNumberedBrackets: [20, "MEANING"],
  oneTwentyThreeDotGlyph: [23, "ROAD"],
  allTenDotGlyphs: [40, "PATHS"],
});

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "source-index punctuation dictionary; total large-mark count36 and 10-dot class total40 bracket the authenticated GOOD LUCK BEWARE FALSE PATHS corridor, while visible class sizes select PRIMUS WAY ROAD",
  largePunctuation: {
    totalMarks: marks.length,
    classes: [...bySize.entries()]
      .map(([count, rows]) => ({
        count,
        occurrences: rows.length,
        totalDots: count * rows.length,
        sourceWordAtCount:
          count < signedWords.length ? signedWords[count] : null,
      }))
      .sort((a, b) => a.count - b.count),
  },
  warningCorridor: {
    totalLargeMarks: marks.length,
    startIndex: marks.length,
    startWord: signedWords[marks.length],
    tenDotClassTotal: tenClassTotal,
    endIndex: tenClassTotal,
    endWord: signedWords[tenClassTotal],
    sourceWords: signedWords.slice(marks.length, tenClassTotal + 1),
  },
  readouts,
  numberedBlock: {
    bracketPages: numberedBracketMarks.map((mark) => mark.page),
    bracketTotal: numberedBracketTotal,
    target: signedWords[numberedBracketTotal],
    oneBracketAnchor: signedWords[10],
    sectionReadout: Array.from(
      {length: 5},
      (_, index) => signedWords[11 + index]
    ),
  },
}, null, 2));
