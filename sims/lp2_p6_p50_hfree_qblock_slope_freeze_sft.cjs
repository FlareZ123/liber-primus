"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {number} n @returns {number} */
function inv29(n) {
  for (let x = 1; x < MOD; x += 1) if ((n * x) % MOD === 1) return x;
  throw new Error("noninvertible arity");
}

/**
 * Lift a scalar page checksum into an arithmetic-progression key.
 * The page slope is supplied by the H-free p6/p50 state packet.
 * @param {number} n
 * @param {number} sigma
 * @param {number} slope
 * @returns {{intercept:number,key:number[]}}
 */
function progression(n, sigma, slope) {
  const triangle = n * (n - 1) / 2;
  const intercept = mod((sigma - slope * triangle) * inv29(n));
  const key = Array.from({ length: n }, (_, j) => mod(intercept + slope * j));
  assert.equal(mod(key.reduce((a, b) => a + b, 0)), sigma);
  return { intercept, key };
}

// H-free packet established from:
// p6 mirror-pair magnitude blocks {{2,6},{3,5}}
// + independently ordered/directed p50 support edges
// + independently selected p50 physical column2/K cyclic start.
const slopes = [2, 26, 5, 6]; // [K,-e,g,a]

// All receiver starts, arities and scalar key sums below were established
// independently before this coordinate rule. No authenticated source words or
// target plaintext vectors occur in this file.
const blocks = [
  {
    name: "q1",
    pages: [32, 33, 34, 35],
    starts: [30, 132, 4, 25],
    arities: [3, 4, 2, 5],
    sigmas: [4, 0, 0, 25],
  },
  {
    name: "q3",
    pages: [37, 38, 39, 40],
    starts: [146, 57, 132, 71],
    arities: [4, 6, 5, 4],
    sigmas: [7, 0, 28, 0],
  },
];

const output = {
  classification: "pretarget H-free p6/p50 page-slope coordinate serializer",
  slopes,
  blocks: [],
};

for (const block of blocks) {
  const rows = [];
  for (let i = 0; i < block.pages.length; i += 1) {
    const page = block.pages[i];
    const start = block.starts[i];
    const n = block.arities[i];
    const sigma = block.sigmas[i];
    const slope = slopes[i];
    const { intercept, key } = progression(n, sigma, slope);
    const cipher = corpus.pages[page].indices.slice(start, start + n);
    assert.equal(cipher.length, n);
    const plain = cipher.map((c, j) => mod(c - key[j]));
    const replay = plain.map((p, j) => mod(p + key[j]));
    assert.deepEqual(replay, cipher);
    rows.push({
      page, start, n, sigma, slope, intercept, key, cipher, plain,
      plain_translit: plain.map((v) => corpus.translit[v]).join(""),
    });
  }
  output.blocks.push({ name: block.name, rows });
}

assert.deepEqual(output.blocks[0].rows.map((x) => x.key), [
  [9, 11, 13],
  [19, 16, 13, 10],
  [12, 17],
  [22, 28, 5, 11, 17],
]);
assert.deepEqual(output.blocks[1].rows.map((x) => x.key), [
  [6, 8, 10, 12],
  [22, 19, 16, 13, 10, 7],
  [13, 18, 23, 28, 4],
  [20, 26, 3, 9],
]);

console.log(JSON.stringify(output, null, 2));
