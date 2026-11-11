"use strict";
/**
 * Direct historical three-share XOR transfer from hypothetical p27 5x43 body
 * to the source-derived p55 43-rune shed interior.
 *
 * Execute from repository root:
 *   node sims/p27_p55_three_share_xor_gate.cjs
 *
 * This tests only 5-bit zero-based GP ordinal XOR, the p55 01101 filled
 * positions (2,3,5), and the two contiguous 5x43 packings. It does not
 * normalize invalid 5-bit outputs 29..31 or search alternate encodings.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));

const p27 = corpus.pages.find(p => p.page === 27);
const p55 = corpus.pages.find(p => p.page === 55);
assert.equal(corpus.pages.length, 58);
assert.equal(p27.indices.length, 234);
assert.equal(p55.indices.length, 76);
const body = p27.indices.slice(19); // original red title is exactly 19 runes
assert.equal(body.length, 215);
assert.equal(body.length, 5 * 43);

// Original p55 segment lengths, including its one-rune carry-in from p54.
const segmentLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const interiorPositions = [];
let offset = 0;
for (const length of segmentLengths) {
  for (let j = 1; j < length - 1; j++) interiorPositions.push(offset + j);
  offset += length;
}
assert.equal(offset, 76);
assert.equal(interiorPositions.length, 43);
const target = interiorPositions.map(i => p55.indices[i]);
assert.deepEqual(target, [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,
  23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18
]);

// Five-position original ornament 01101; filled positions 2,3,5 (1-based).
const mask = "01101";
const selectedRows = [1, 2, 4]; // zero-based rows 2,3,5
assert.equal(mask.split("").filter(x => x === "1").length, selectedRows.length);

function derive(layout) {
  const sourceAt = (row, col) => body[
    layout === "rows-of-43" ? row * 43 + col : col * 5 + row
  ];
  const key = Array.from({length: 43}, (_, col) =>
    sourceAt(selectedRows[0], col) ^
    sourceAt(selectedRows[1], col) ^
    sourceAt(selectedRows[2], col)
  );
  const plaintext = target.map((c, i) => c ^ key[i]);
  return {key, plaintext};
}
function translit(values) {
  return values.map(n => n < 29 ? corpus.translit[n] : "[" + n + "]").join("");
}
function validCount(values) {
  return values.filter(n => Number.isInteger(n) && n >= 0 && n < 29).length;
}

// The two ordinary contiguous packings are fixed; no further arrangements.
const actual = [
  {layout: "rows-of-43", ...derive("rows-of-43")},
  {layout: "five-tuples", ...derive("five-tuples")}
];
const expected = {
  "rows-of-43": {
    key: [4,10,27,4,9,9,6,1,31,23,22,0,24,1,0,15,5,20,4,25,22,20,7,5,1,30,24,5,16,17,24,8,0,10,7,15,18,20,4,28,9,15,31],
    plaintext: [23,0,23,2,30,11,29,25,14,18,10,0,22,11,19,14,0,25,12,12,2,27,16,30,12,22,20,23,26,23,22,14,15,6,5,13,0,8,14,15,12,4,13]
  },
  "five-tuples": {
    key: [21,7,26,0,18,0,3,22,18,14,19,14,14,7,3,1,26,29,4,17,7,9,18,28,9,2,26,1,29,10,28,6,18,23,7,11,30,29,24,9,19,26,25],
    plaintext: [6,13,22,6,5,2,24,14,3,11,15,14,0,13,16,0,31,16,12,4,19,6,5,7,4,10,22,19,23,12,18,0,29,27,5,9,12,1,18,26,22,17,11]
  }
};
for (const result of actual) {
  assert.deepEqual(result.key, expected[result.layout].key);
  assert.deepEqual(result.plaintext, expected[result.layout].plaintext);
  assert.equal(result.key.length, 43);
  assert.equal(result.plaintext.length, 43);
}

// Positive control: 43 independent, varied 5-bit XOR share triplets, all
// share symbols and recovered secrets constrained to valid GP indices 0..28.
for (let i = 0; i < 43; i++) {
  const secret = (7 * i + 3) % 29;
  const a = (11 * i + 5) % 29;
  let b = (13 * i + 1) % 29;
  let c = secret ^ a ^ b;
  let attempts = 0;
  while (c >= 29 && attempts < 29) {
    b = (b + 1) % 29;
    c = secret ^ a ^ b;
    attempts++;
  }
  assert(c < 29, "could not construct valid synthetic shares");
  assert.equal(a ^ b ^ c, secret);
}
const report = actual.map(({layout, key, plaintext}) => ({
  layout,
  keyValidGP29: validCount(key),
  plaintextValidGP29: validCount(plaintext),
  exactInteriorMatches: key.filter((v, i) => v === target[i]).length,
  key,
  plaintext,
  plaintextText: translit(plaintext)
}));
assert.equal(report[0].keyValidGP29, 40);
assert.equal(report[0].plaintextValidGP29, 40);
assert.equal(report[1].keyValidGP29, 39);
assert.equal(report[1].plaintextValidGP29, 41);
process.stdout.write(JSON.stringify({
  selectedRows: [2, 3, 5],
  p27BlackRunes: body.length,
  p55InteriorRunes: target.length,
  syntheticPositiveControlColumns: 43,
  results: report,
  decision: "Direct 5-bit GP-index three-share XOR fails under both contiguous 5x43 packings; no GP29 plaintext."
}, null, 2) + "\n");
