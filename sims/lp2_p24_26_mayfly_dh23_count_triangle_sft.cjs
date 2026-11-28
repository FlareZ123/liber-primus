/**
 * Source-only SFT for the p24-p26 mayfly count triangle.
 *
 * The three contiguous mayfly pages have source rune counts 270,273,265.
 * Their pairwise absolute differences are 3,5,8, equal to the independently
 * reconstructed p28 DH23 derived/primary state values e=3,g=5,A=8.
 *
 * Run from repository root:
 *   node sims/lp2_p24_26_mayfly_dh23_count_triangle_sft.cjs
 */
"use strict";

const fs = require("fs");
const assert = require("assert");

const corpus = JSON.parse(
  fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8")
);
const pages = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
assert.strictEqual(pages.length, 56);

const count = (page) => {
  const row = pages.find((p) => p.page === page);
  assert.ok(row, `missing page ${page}`);
  return row.runic_count;
};

const c24 = count(24);
const c25 = count(25);
const c26 = count(26);
assert.deepStrictEqual([c24, c25, c26], [270, 273, 265]);

const edge = {
  "24-25": Math.abs(c24 - c25),
  "24-26": Math.abs(c24 - c26),
  "25-26": Math.abs(c25 - c26),
};
assert.deepStrictEqual(edge, { "24-25": 3, "24-26": 5, "25-26": 8 });

// Independently established p28 DH23 state labels.
const p = 23;
const g = 5;
const a = 6;
const b = 15;
const A = 8;
const B = 19;
const K = 2;
const e = g - K;
assert.strictEqual(e, 3);
assert.strictEqual((g ** a) % p, A);
assert.strictEqual((g ** b) % p, B);
assert.strictEqual((B ** a) % p, K);
assert.deepStrictEqual(
  [edge["24-25"], edge["24-26"], edge["25-26"]],
  [e, g, A]
);

// Charge every contiguous three-page window under the same order-free test.
const target = [e, g, A].slice().sort((x, y) => x - y);
const hits = [];
for (let start = 0; start <= 53; start += 1) {
  const v = [count(start), count(start + 1), count(start + 2)];
  const diffs = [
    Math.abs(v[0] - v[1]),
    Math.abs(v[0] - v[2]),
    Math.abs(v[1] - v[2]),
  ].sort((x, y) => x - y);
  if (diffs.every((x, i) => x === target[i])) {
    hits.push({ start, pages: [start, start + 1, start + 2], counts: v, diffs });
  }
}
assert.deepStrictEqual(hits, [
  { start: 24, pages: [24, 25, 26], counts: [270, 273, 265], diffs: [3, 5, 8] },
]);

console.log("PASS lp2_p24_26_mayfly_dh23_count_triangle_sft");
console.log("mayfly counts:", [c24, c25, c26]);
console.log("edge labels:", edge, "=", { e, g, A });
console.log("contiguous triple hits:", JSON.stringify(hits));
