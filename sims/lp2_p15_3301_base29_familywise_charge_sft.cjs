"use strict";

const assert = require("node:assert/strict");

const RADIX = 29;
const TARGET = 3301;
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";

const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];

const spiralPrefix = [3299, 3298, 3296, 3294, 3288, 3278];
const primeOffsets = [2, 3, 5, 7, 13, 23];
assert.deepEqual(
  spiralPrefix.map((value, index) => value + primeOffsets[index]),
  Array(primeOffsets.length).fill(TARGET),
);

const rawObservables = [
  ["top_word_count", 2],
  ["lower_word_count", 3],
  ["total_red_words", 5],
  ["grid_side", 4],
  ["red_dot_count", 13],
  ["page_index", 15],
  ["top_w1_L", 4],
  ["top_w1_S", 11],
  ["top_w1_P", 0],
  ["top_w2_L", 5],
  ["top_w2_S", 8],
  ["top_w2_P", 26],
  ["lower_w1_L", 4],
  ["lower_w1_S", 22],
  ["lower_w1_P", 10],
  ["lower_w2_L", 2],
  ["lower_w2_S", 6],
  ["lower_w2_P", 5],
  ["lower_w3_L", 5],
  ["lower_w3_S", 5],
  ["lower_w3_P", 0],
];

const structuralLabels = new Set([
  "top_word_count",
  "lower_word_count",
  "total_red_words",
  "grid_side",
  "red_dot_count",
  "page_index",
]);

const hits = [];
for (let row = 0; row < grid.length; row += 1) {
  for (let col = 0; col < grid[row].length; col += 1) {
    const value = grid[row][col];
    for (const [label, magnitude] of rawObservables) {
      for (const sign of [1, -1]) {
        if (value + sign * magnitude === TARGET) {
          hits.push({ row: row + 1, col: col + 1, value, sign, magnitude, label });
        }
      }
    }
  }
}

assert.equal(hits.length, 9);
assert.deepEqual(
  [...new Set(hits.map((hit) => hit.value))].sort((a, b) => a - b),
  [3288, 3296, 3298, 3299],
);
const structuralHits = hits.filter((hit) => structuralLabels.has(hit.label));
assert.deepEqual(
  structuralHits.map(({ value, magnitude, label }) => ({ value, magnitude, label })),
  [
    { value: 3299, magnitude: 2, label: "top_word_count" },
    { value: 3298, magnitude: 3, label: "lower_word_count" },
    { value: 3288, magnitude: 13, label: "red_dot_count" },
    { value: 3296, magnitude: 5, label: "total_red_words" },
  ],
);

const redCellHits = hits.filter((hit) => hit.value === 3299);
assert.deepEqual(
  redCellHits.map((hit) => hit.label).sort(),
  ["lower_w2_L", "top_word_count"],
);

function base29Digits(value) {
  assert.ok(Number.isInteger(value) && value >= 0);
  if (value === 0) return [0];
  const out = [];
  let x = value;
  while (x > 0) {
    out.push(x % RADIX);
    x = Math.floor(x / RADIX);
  }
  return out.reverse();
}

function base29Text(value) {
  return base29Digits(value).map((digit) => alphabet[digit]).join("");
}

assert.deepEqual(base29Digits(3299), [3, 26, 22]);
assert.equal(base29Text(3299), "3QM");
assert.deepEqual(base29Digits(3301), [3, 26, 24]);
assert.equal(base29Text(3301), "3QO");

console.log(JSON.stringify({
  status: "PASS",
  evidenceBoundary: "original p15 grid; established 3301/Fibonacci-prime generator; raw p15 word counts/L/S/P/page/dot/grid constants only; no DH role labels used for selection",
  establishedGenerator: {
    target: TARGET,
    spiralPrefix,
    primeOffsets,
    reconstructions: spiralPrefix.map((value, index) => ({
      value,
      offset: primeOffsets[index],
      recoveredAnchor: value + primeOffsets[index],
    })),
  },
  familywiseRawOffsetCharge: {
    rawObservableLabels: rawObservables.length,
    signedCandidates: grid.flat().length * rawObservables.length * 2,
    labeledHits: hits.length,
    distinctGridCellsHitting3301: [...new Set(hits.map((hit) => hit.value))].length,
    hits,
    structuralOnlyHits: structuralHits,
  },
  redOrigin: {
    value: 3299,
    rawObservableOriginsForPlus2: redCellHits.map((hit) => hit.label),
    generatorOriginForPlus2: "first selected prime p1=2",
  },
  base29: {
    3299: { digits: base29Digits(3299), text: base29Text(3299) },
    3301: { digits: base29Digits(3301), text: base29Text(3301) },
  },
  decision: "3301_ANCHOR_IS_SOURCE_INDEPENDENT_VIA_ESTABLISHED_GENERATOR; K_LABEL_AND_BASE29_SERIALIZER_ARE_NOT_ADDITIONAL_INDEPENDENT_EVIDENCE",
}, null, 2));
