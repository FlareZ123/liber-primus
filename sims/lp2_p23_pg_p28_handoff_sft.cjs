"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const state = { p: 23, g: 5, a: 6, e: 3, K: 2, q: 4 };
const motifPages = [7, 23, 56];

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {{line:number,lens:number[],total:number,fragments:number}[]} */
function pageLines(page) {
  return physicalPart(page)
    .split(/\n/u)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line))
    .map((line, index) => {
      const lens = (line.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => [...word].length);
      return {
        line: index + 1,
        lens,
        total: lens.reduce((sum, value) => sum + value, 0),
        fragments: lens.length
      };
    });
}

const p23First = pageLines(23)[0];
assert.equal(23, state.p);
assert.deepEqual(p23First.lens, [state.K, state.a, state.e, state.g, state.q]);
assert.equal(p23First.fragments, state.g);

const destinationVector = [state.K, state.g, state.g + state.K, state.g, state.q];
const destinationGeometry = [state.p, state.g, state.K, state.g];
const p28First = pageLines(state.p + state.g)[0];
assert.deepEqual(p28First.lens, destinationVector);
assert.deepEqual(
  [p28First.total, p28First.fragments, p28First.lens[0], p28First.lens[1]],
  destinationGeometry
);

const motifDisplacements = [];
for (const sourcePage of motifPages) {
  for (const sign of [-1, 1]) {
    const destination = sourcePage + sign * state.g;
    if (destination < 0 || destination > 57 || destination === 50) continue;
    const first = pageLines(destination)[0];
    motifDisplacements.push({
      sourcePage,
      sign,
      destination,
      firstLens: first.lens,
      firstGeometry: [first.total, first.fragments, first.lens[0], first.lens[1]],
      exactGeometry:
        JSON.stringify([first.total, first.fragments, first.lens[0], first.lens[1]]) ===
        JSON.stringify(destinationGeometry)
    });
  }
}
assert.deepEqual(
  motifDisplacements.filter((row) => row.exactGeometry).map((row) => [row.sourcePage, row.sign, row.destination]),
  [[23, 1, 28]]
);

const pageStartGeometryHits = [];
const fullVectorHits = [];
let runeBearingLines = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = pageLines(page);
  for (const row of lines) {
    runeBearingLines += 1;
    if (JSON.stringify(row.lens) === JSON.stringify(destinationVector)) {
      fullVectorHits.push({ page, line: row.line, lens: row.lens });
    }
  }
  const first = lines[0];
  if (
    first &&
    JSON.stringify([first.total, first.fragments, first.lens[0], first.lens[1]]) ===
      JSON.stringify(destinationGeometry)
  ) {
    pageStartGeometryHits.push({
      page,
      line: 1,
      lens: first.lens,
      geometry: destinationGeometry
    });
  }
}

assert.equal(runeBearingLines, 594);
assert.deepEqual(pageStartGeometryHits.map((row) => row.page), [28]);
assert.deepEqual(fullVectorHits, [{ page: 28, line: 1, lens: destinationVector }]);

console.log(JSON.stringify({
  status: "PASS",
  state,
  source: {
    motifPages,
    p23PhysicalPageEqualsP: true,
    p23Line1: p23First,
    p23StateLabels: ["K", "a", "e", "g", "q"]
  },
  handoff: {
    rule: "physical page p + visible g/dot count",
    arithmetic: [state.p, state.g, state.p + state.g],
    destination: 28,
    destinationLine1: p28First,
    destinationLabels: ["K", "g", "g+K", "g", "q"]
  },
  controls: {
    motifPlusMinusG: motifDisplacements,
    exactDestinationGeometry: destinationGeometry,
    pageStartGeometryHits,
    fullVectorHits,
    runeBearingLines
  },
  classification:
    "Post-discovery source-route compression. The p23 p+g handoff uniquely lands on p28, whose first line independently carries the unique full DH-cardinal vector [K,g,g+K,g,q]. It does not by itself authenticate READ OUT plaintext or a general page-jump opcode."
}, null, 2));
