"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const M = 29;
/** @param {number} value */
const mod = (value) => ((value % M) + M) % M;

/** @param {number[]} coefficients @param {number} x */
function evaluate(coefficients, x) {
  let value = 0;
  for (const coefficient of coefficients) value = mod(value * x + coefficient);
  return value;
}

/** @param {number[]} coefficients @param {number} x */
function evaluateDerivative(coefficients, x) {
  const degree = coefficients.length - 1;
  let value = 0;
  for (let i = 0; i < degree; i += 1) {
    value = mod(value * x + coefficients[i] * (degree - i));
  }
  return value;
}

/** @param {number[]} coefficients */
function repeatedRoots(coefficients) {
  const roots = [];
  for (let x = 0; x < M; x += 1) {
    if (evaluate(coefficients, x) === 0 &&
        evaluateDerivative(coefficients, x) === 0) roots.push(x);
  }
  return roots;
}

const p29 = corpus.pages.find((page) => page.page === 29);
assert.ok(p29);
const table = grid.bytes.map((value) => value % M);

const p39 = corpus.pages.find((page) => page.page === 39);
const redSpan = ink.pages
  .find((page) => page.page === 39)
  .red_spans.find((span) => span.start === 119 && span.length === 3);
assert.ok(p39 && redSpan);
const triad = p39.indices.slice(redSpan.start, redSpan.start + redSpan.length);
assert.deepEqual(triad, [27, 5, 15]);

const variants = {
  p29Forward: repeatedRoots(p29.indices),
  p29Reverse: repeatedRoots([...p29.indices].reverse()),
  tableForward: repeatedRoots(table),
  tableReverse: repeatedRoots([...table].reverse()),
  triadPrintedHighFirst: repeatedRoots(triad),
  triadReversedHighFirst: repeatedRoots([...triad].reverse()),
};

assert.deepEqual(variants, {
  p29Forward: [24],
  p29Reverse: [23],
  tableForward: [24],
  tableReverse: [23],
  triadPrintedHighFirst: [23],
  triadReversedHighFirst: [24],
});
assert.equal((24 * 23) % 29, 1);

const compatible = [];
for (const [pageDirection, pageRoots] of [
  ["forward", variants.p29Forward],
  ["reverse", variants.p29Reverse],
]) {
  for (const [tableDirection, tableRoots] of [
    ["forward", variants.tableForward],
    ["reverse", variants.tableReverse],
  ]) {
    for (const [triadDirection, triadRoots] of [
      ["printed-high-first", variants.triadPrintedHighFirst],
      ["reversed-high-first", variants.triadReversedHighFirst],
    ]) {
      const shared = pageRoots.filter((rootValue) =>
        tableRoots.includes(rootValue) && triadRoots.includes(rootValue)
      );
      if (shared.length) {
        compatible.push({
          pageDirection,
          tableDirection,
          triadDirection,
          shared,
        });
      }
    }
  }
}

assert.deepEqual(compatible, [
  {
    pageDirection: "forward",
    tableDirection: "forward",
    triadDirection: "reversed-high-first",
    shared: [24],
  },
  {
    pageDirection: "reverse",
    tableDirection: "reverse",
    triadDirection: "printed-high-first",
    shared: [23],
  },
]);

console.log(JSON.stringify({
  status: "PASS",
  triad,
  variants,
  reciprocalRoots: {forward: 24, reverse: 23},
  compatible,
  classification:
    "The p29/p50/p39 repeated-root relation is globally reversal-covariant: reversing p29 and p50 while reading the red triad in printed high-first order preserves the exact relation and swaps root 24 to inverse root 23. Therefore the signed word DIRECTION can select p29 but does not by itself select polynomial coefficient orientation.",
}, null, 2));
