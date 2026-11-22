"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);

const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const expectedLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const romanSteps = [1000, 50, 100, 500];

/**
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
function chapterRunes(start, end) {
  return corpus.pages
    .filter((page) => page.page >= start && page.page <= end)
    .flatMap((page) => page.indices);
}

/**
 * @param {number[]} values
 * @returns {string}
 */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const chapterRows = chapters.map(([start, end], index) => {
  const runes = chapterRunes(start, end);
  assert.equal(runes.length, expectedLengths[index]);
  return { start, end, runes };
});

const cumulative = [];
for (const step of romanSteps) {
  cumulative.push(step + (cumulative.at(-1) || 0));
}
assert.deepEqual(cumulative, [1000, 1050, 1150, 1650]);

const eligible = chapterRows.filter((row) => row.runes.length > cumulative.at(-1));
assert.deepEqual(
  eligible.map((row) => [row.start, row.end]),
  [[8, 14], [15, 22], [33, 39], [40, 53]]
);

const exactReadouts = eligible.map((row) => ({
  chapter: [row.start, row.end],
  length: row.runes.length,
  text: translit(cumulative.map((position) => row.runes[position])),
}));
assert.deepEqual(exactReadouts, [
  { chapter: [8, 14], length: 1729, text: "DCXT" },
  { chapter: [15, 22], length: 1903, text: "DBNGEA" },
  { chapter: [33, 39], length: 1680, text: "PADA" },
  { chapter: [40, 53], length: 3008, text: "OEEAIA" },
]);

const family = [];
for (const row of eligible) {
  for (const order of ["original", "reverse"]) {
    const steps = order === "original" ? romanSteps : romanSteps.slice().reverse();
    for (const mode of ["absolute", "cumulative"]) {
      const positions = [];
      for (const step of steps) {
        positions.push(
          mode === "absolute" ? step : step + (positions.at(-1) || 0)
        );
      }
      for (const direction of ["forward", "backward"]) {
        for (const origin of [0, 1]) {
          const indices = positions.map((position) =>
            direction === "forward"
              ? position - origin
              : row.runes.length - 1 - (position - origin)
          );
          if (indices.some((index) => index < 0 || index >= row.runes.length)) {
            continue;
          }
          family.push({
            chapter: [row.start, row.end],
            order,
            mode,
            direction,
            origin,
            text: translit(indices.map((index) => row.runes[index])),
          });
        }
      }
    }
  }
}

assert.equal(family.length, 64);
assert.deepEqual(
  family.filter((row) => row.text === "PADA"),
  [{
    chapter: [33, 39],
    order: "original",
    mode: "cumulative",
    direction: "forward",
    origin: 0,
    text: "PADA",
  }]
);

console.log(JSON.stringify({
  status: "PASS",
  sourceChapterMap: chapterRows.map((row) => ({
    chapter: [row.start, row.end],
    length: row.runes.length,
  })),
  roman: {
    values: romanSteps,
    cumulative,
  },
  eligibleChapters: exactReadouts,
  finiteFamily: {
    tested: family.length,
    dimensions: {
      eligibleTopLevelChapters: eligible.length,
      romanOrder: 2,
      absoluteVsCumulative: 2,
      direction: 2,
      origin: 2,
    },
    exactPADAHits: family.filter((row) => row.text === "PADA"),
  },
  classification:
    "source-map control for Agent8's MLCD Roman route; semantic interpretation of PADA remains post-readout",
}, null, 2));
