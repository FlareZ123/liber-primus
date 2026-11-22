"use strict";

/**
 * Source-frozen, reversible-invariant gate for a 19-word PARABLE perimeter
 * candidate against the original 76-rune LP2 p55.
 * Run from any directory with: node sims/lp2_p57_one_boundary_76_sft.cjs
 * No files are written.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const raw = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const glyphs = new Set(corpus.runes);
const gp = new Map(corpus.runes.map((rune, i) => [rune, i]));
const indices = runes => runes.map(rune => gp.get(rune));

const lastPage = raw.split("%").at(-1);
const printedWords = lastPage
  .replace(/[\r\n/]/g, "")
  .split(/[.\-§]/)
  .map(segment => Array.from(segment).filter(rune => glyphs.has(rune)))
  .filter(word => word.length);
const p57 = corpus.pages.find(page => page.page === 57).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;

assert.equal(printedWords.length, 20, "PARABLE rubric plus 19 body words");
assert.deepEqual(printedWords.map(word => word.length),
  [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6]);
assert.deepEqual(indices(printedWords.flat()), p57, "all 95 glyphs match the canonical original");
assert.equal(p57.length, 95);
assert.equal(p55.length, 76);

const histogram = sequence => {
  const h = Array(29).fill(0);
  for (const value of sequence) h[value]++;
  return h;
};
const ioc = sequence => histogram(sequence)
  .reduce((sum, n) => sum + n * (n - 1), 0) / (sequence.length * (sequence.length - 1));
const fPositions = sequence => sequence.flatMap((value, index) => value === 0 ? [index] : []);
const p55Histogram = histogram(p55);

// A single natural visible 76-byte perimeter of the original 32×8 table.
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
assert.equal(grid.bytes.length, 256);
const rows = Array.from({length: 32}, (_, row) => grid.bytes.slice(row * 8, row * 8 + 8));
const ring = [
  ...rows[0],
  ...rows.slice(1, 31).map(row => row[7]),
  ...rows[31].slice().reverse(),
  ...rows.slice(1, 31).reverse().map(row => row[0])
];
assert.equal(ring.length, 76);
const report = {
  claim: "Deleting exactly one boundary rune from each of the 19 PARABLE body words yields the same 76-rune length as original p55. A direct original-p55 transposition with any global GP29 symbol permutation is nevertheless impossible.",
  source: {p57Runes: 95, p57RubricRunes: 7, p57BodyWords: 19, p55Runes: 76},
  p55: {ioc: ioc(p55), fPositions: fPositions(p55)},
  candidates: []
};
for (const side of ["first", "last"]) {
  const body = printedWords.slice(1).flatMap(word => side === "first" ? word.slice(1) : word.slice(0, -1));
  const potential = indices([...printedWords[0], ...body]);
  assert.equal(potential.length, 76);
  const h = histogram(potential);
  const sortedCountsEqual = h.slice().sort((a, b) => a - b)
    .every((n, index) => n === p55Histogram.slice().sort((a, b) => a - b)[index]);
  assert.equal(sortedCountsEqual, false, "secret global relabel and arbitrary rearrangement cannot rescue count inventory");
  const mismatchesIfRearrangedWithSameAlphabet = h.reduce((sum, n, index) =>
    sum + Math.max(n - p55Histogram[index], 0), 0);
  const violatesPlaintextFTransparency = fPositions(potential)
    .filter(index => p55[index] !== 0);
  assert.ok(violatesPlaintextFTransparency.length >= 1,
    "genuine solved p56 F-transparent mode cannot encode this proposed plaintext at these positions");
  // A possible candidate plaintext fixes each additive key digit uniquely.
  // The natural 19-word key period and the natural p50 outer 76-byte ring
  // can then be checked without fitting any key, phase, or rotation.
  const additiveKey = potential.map((plain, index) => (p55[index] - plain + 29) % 29);
  const matchingPeriod19 = additiveKey.slice(19)
    .filter((value, index) => value === additiveKey[index]).length;
  const matchingRingModulo29 = additiveKey
    .filter((value, index) => value === ring[index] % 29).length;
  const matchingRingByteBinning = additiveKey
    .filter((value, index) => value === Math.floor(29 * ring[index] / 256)).length;
  assert.equal(matchingPeriod19, 2);
  assert.equal(matchingRingModulo29, side === "first" ? 1 : 5);
  assert.equal(matchingRingByteBinning, side === "first" ? 3 : 0);
  report.candidates.push({
    matchingPeriod19Of57: matchingPeriod19,
    matchingTableRingModulo29Of76: matchingRingModulo29,
    matchingTableRingBinningOf76: matchingRingByteBinning,
    boundaryDeleted: side,
    length: potential.length,
    ioc: ioc(potential),
    exactSamePositionMatches: potential.filter((value, index) => value === p55[index]).length,
    minimumSymbolChangesForOriginalAlphabetTransposition: mismatchesIfRearrangedWithSameAlphabet,
    sameHistogramAfterAnyGlobalRuneBijection: sortedCountsEqual,
    plaintextFPositions: fPositions(potential),
    p56TransparentFContradictionPositions: violatesPlaintextFTransparency
  });
}
assert.ok(report.candidates.every(candidate => candidate.ioc !== report.p55.ioc));
console.log(JSON.stringify(report, null, 2));
