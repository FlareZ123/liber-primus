#!/usr/bin/env node
"use strict";

/**
 * Original-source spatial-successor test for the 256 LP2 p49-p51 base60 bytes.
 * Node.js 22; no dependencies, network access, file writes, or parameter search.
 *
 * A directed edge i->j exists iff j is a printed-grid neighbor of i and
 * byte[j] === byte[i]+1. All eight queen-grid neighbors are counted.
 * The randomized nulls retain the exact source byte multiset, plus their
 * named geometric or numeric strata. Counts are exploratory after an
 * interesting upper-tail triplet was visually selected.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const grid = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "base60-grid.json"), "utf8"));
const source = grid.byte_rows.flat();
assert.equal(grid.rows.length, 32);
assert.equal(grid.rows.every(row => row.length === 8), true);
assert.equal(source.length, 256);
assert.equal(grid.page_row_counts.join(","), "10,13,9");
assert.equal(crypto.createHash("sha256").update(Buffer.from(source)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const neighbors = Array.from({length: 256}, (_, i) => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  const n = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = row + dr, cc = col + dc;
      if (rr >= 0 && rr < 32 && cc >= 0 && cc < 8) n.push(rr * 8 + cc);
    }
  }
  return n;
});

/**
 * @param {number[]} bytes
 * @returns {{edges:number, triplets:number, longest:number, paths4:number[][], paths3:number[][]}}
 */
function metrics(bytes) {
  let edges = 0, triplets = 0, longest = 1;
  const paths3 = [], paths4 = [];
  for (let i = 0; i < 256; i++) {
    for (const j of neighbors[i]) {
      if (bytes[j] !== bytes[i] + 1) continue;
      edges++;
      for (const k of neighbors[j]) {
        if (bytes[k] !== bytes[j] + 1) continue;
        triplets++;
        paths3.push([i + 1, j + 1, k + 1]);
        for (const l of neighbors[k]) {
          if (bytes[l] === bytes[k] + 1) paths4.push([i + 1, j + 1, k + 1, l + 1]);
        }
      }
    }
  }
  const indices = Array.from({length: 256}, (_, i) => i).sort((i, j) => bytes[j] - bytes[i]);
  const length = new Uint8Array(256);
  for (const i of indices) {
    let best = 1;
    for (const j of neighbors[i]) {
      if (bytes[j] === bytes[i] + 1) best = Math.max(best, 1 + length[j]);
    }
    length[i] = best;
    longest = Math.max(longest, best);
  }
  return {edges, triplets, longest, paths3, paths4};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {(value:number,index:number)=>string|number} classifier
 * @returns {number[][]}
 */
function partition(classifier) {
  const map = new Map();
  source.forEach((value, index) => {
    const key = classifier(value, index);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(index);
  });
  return [...map.values()];
}

/**
 * @param {number[][]} groups
 * @param {number} count
 * @param {number} seed
 */
function test(groups, count, seed) {
  const random = rng(seed), observed = metrics(source);
  const names = ["edges", "triplets", "longest"];
  const means = [0, 0, 0], exceed = [0, 0, 0];
  for (let trial = 0; trial < count; trial++) {
    const bytes = source.slice();
    for (const indices of groups) {
      for (let k = indices.length - 1; k > 0; k--) {
        const j = random() % (k + 1);
        const a = indices[k], b = indices[j];
        [bytes[a], bytes[b]] = [bytes[b], bytes[a]];
      }
    }
    const m = metrics(bytes);
    for (let k = 0; k < 3; k++) {
      means[k] += m[names[k]];
      if (m[names[k]] >= observed[names[k]]) exceed[k]++;
    }
  }
  return {
    samples: count,
    means: Object.fromEntries(names.map((name, i) => [name, means[i] / count])),
    exceedances: Object.fromEntries(names.map((name, i) => [name, exceed[i]])),
    upper_tail_add_one: Object.fromEntries(names.map((name, i) =>
      [name, (exceed[i] + 1) / (count + 1)]))
  };
}

const actual = metrics(source);
assert.deepEqual([actual.edges, actual.triplets, actual.longest], [14, 4, 4]);
assert.deepEqual(actual.paths4, [[160,159,167,158], [168,159,167,158]]);
assert.ok(actual.paths3.some(p => p.join(",") === "49,57,66"));
const plant = source.slice();
for (let k = 0; k < 6; k++) {
  const sourceIndex = plant.indexOf(245 + k);
  assert.ok(sourceIndex >= 0);
  [plant[k], plant[sourceIndex]] = [plant[sourceIndex], plant[k]];
}
assert.ok(metrics(plant).longest >= 6, "planted ordered six-cell path is detectable");

const count = 10000;
const regimes = {
  global: partition(() => 0),
  physical_page: partition((v, i) => i < 80 ? 49 : i < 184 ? 50 : 51),
  printed_row: partition((v, i) => Math.floor(i / 8)),
  printed_column: partition((v, i) => i % 8),
  base60_high_digit: partition(v => Math.floor(v / 60)),
  base29_quotient: partition(v => Math.floor(v / 29)),
  high_nibble: partition(v => v >>> 4),
  printed_row_and_base60_high_digit: partition((v, i) =>
    `${Math.floor(i / 8)}:${Math.floor(v / 60)}`)
};
const controls = {};
let idx = 0;
for (const [name, groups] of Object.entries(regimes)) {
  controls[name] = test(groups, count, (0x33012560 + idx++ * 0x9e3779b9) >>> 0);
}
console.log(JSON.stringify({
  source: "LP2 original JPEG scans 66-68 / resource base60-grid.json",
  byte_sha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  observation: actual,
  native_positive: {planted_path_at_least_six: metrics(plant).longest},
  nulls: controls,
  interpretation: "exploratory spatial ordering, no cipher or unknown plaintext"
}, null, 2));
