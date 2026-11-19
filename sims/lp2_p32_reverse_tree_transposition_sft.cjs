"use strict";

/**
 * SFT: finite tree-order transposition family on the fixed 121-node p32
 * reverse-tree scaffold.
 *
 * Assign the 121 source-order p32 runes to the selected tree under one of six
 * canonical BFS/DFS child-address traversals, then read the same node labels
 * under another canonical traversal. This is a 6x6 = 36 permutation family.
 * No additive key, phase, language-selected orientation, or symbol substitution
 * is introduced.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = grid.byte_rows.flat();
const p32 = corpus.pages.find((page) => page.page === 32);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p32);
assert.ok(p57);
assert.equal(p32.indices.length, 121);

const reverse = Array.from({ length: 256 }, () => []);
for (let source = 0; source < 256; source += 1) reverse[table[source]].push(source);

const mainCycle = new Set([0,203,68,199,47,76,114,197,115,247,192]);
assert.equal(table[32], 115);

/**
 * @param {"bfs"|"pre"|"post"} kind
 * @param {boolean} descending
 * @returns {number[]}
 */
function traversal(kind, descending) {
  const compare = descending ? (left, right) => right - left : (left, right) => left - right;
  const out = [];

  if (kind === "bfs") {
    const queue = [{ node: 115, depth: 0 }];
    const seen = new Set([115]);
    while (queue.length > 0) {
      const current = queue.shift();
      assert.ok(current);
      if (current.depth > 0) out.push(current.node);
      if (current.depth === 20) continue;
      const children = reverse[current.node]
        .filter((node) => !mainCycle.has(node))
        .sort(compare);
      for (const child of children) {
        if (seen.has(child)) continue;
        seen.add(child);
        queue.push({ node: child, depth: current.depth + 1 });
      }
    }
    assert.equal(out.length, 121);
    return out;
  }

  const seen = new Set([115]);
  /** @param {number} node @param {number} depth */
  function visit(node, depth) {
    if (depth > 0 && kind === "pre") out.push(node);
    if (depth < 20) {
      const children = reverse[node]
        .filter((child) => !mainCycle.has(child))
        .sort(compare);
      for (const child of children) {
        if (seen.has(child)) continue;
        seen.add(child);
        visit(child, depth + 1);
      }
    }
    if (depth > 0 && kind === "post") out.push(node);
  }
  visit(115, 0);
  assert.equal(out.length, 121);
  return out;
}

const orders = new Map();
for (const kind of ["bfs", "pre", "post"]) {
  for (const descending of [false, true]) {
    const name = kind + (descending ? "-desc" : "-asc");
    orders.set(name, traversal(kind, descending));
  }
}
assert.equal(orders.size, 6);

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const tokens = corpus.translit
    .map((symbol, value) => ({ symbol, value }))
    .sort((left, right) => right.symbol.length - left.symbol.length);

  /** @param {string} word @returns {number[]} */
  function wordValues(word) {
    const normalized = word
      .toUpperCase()
      .replace(/QU/g, "CW")
      .replace(/V/g, "U")
      .replace(/[KQ]/g, "C")
      .replace(/Z/g, "S")
      .replace(/ING/g, "NG")
      .replace(/IO/g, "IA");

    const values = [];
    for (let offset = 0; offset < normalized.length;) {
      const token = tokens.find((candidate) =>
        normalized.startsWith(candidate.symbol, offset)
      );
      if (!token) return [];
      values.push(token.value);
      offset += token.symbol.length;
    }
    return values;
  }

  return (text.match(/[A-Za-z]+/gu) || []).flatMap(wordValues);
}

const native = gpText(read("resources/control/gibran_prophet_58585.txt"));
assert(native.length > 20000);
const split = Math.floor(native.length * 2 / 3);
const train = native.slice(0, split);
const held = native.slice(split);
const trigramCounts = new Map();
for (let index = 2; index < train.length; index += 1) {
  const key = train[index - 2] * 841 + train[index - 1] * 29 + train[index];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
}
const denominator = train.length - 2 + 0.25 * 29 ** 3;

/** @param {number[]} values @returns {number} */
function trigramScore(values) {
  let total = 0;
  for (let index = 2; index < values.length; index += 1) {
    const key = values[index - 2] * 841 + values[index - 1] * 29 + values[index];
    total += Math.log(((trigramCounts.get(key) || 0) + 0.25) / denominator);
  }
  return total / (values.length - 2);
}

/** @param {number[]} values @returns {string} */
function preview(values) {
  return values.slice(0, 80).map((value) => corpus.translit[value]).join("");
}

/**
 * Assign source-order ciphertext values to nodes under assignOrder and read
 * those labels under readOrder.
 * @param {number[]} assignOrder
 * @param {number[]} readOrder
 * @returns {number[]}
 */
function transpose(assignOrder, readOrder) {
  const labels = new Map();
  assignOrder.forEach((node, index) => labels.set(node, p32.indices[index]));
  return readOrder.map((node) => {
    const value = labels.get(node);
    assert.notEqual(value, undefined);
    return value;
  });
}

const results = [];
for (const [assignName, assignOrder] of orders) {
  for (const [readName, readOrder] of orders) {
    const plain = transpose(assignOrder, readOrder);
    assert.deepEqual(
      [...plain].sort((left, right) => left - right),
      [...p32.indices].sort((left, right) => left - right)
    );
    results.push({
      assign: assignName,
      read: readName,
      score: trigramScore(plain),
      preview: preview(plain),
    });
  }
}
assert.equal(results.length, 36);

const identityScore = trigramScore(p32.indices);
assert(results.filter((row) => row.assign === row.read)
  .every((row) => Math.abs(row.score - identityScore) < 1e-15));

results.sort((left, right) => right.score - left.score);

const heldWindows = [];
for (let offset = 0; offset + 121 <= held.length; offset += 121) {
  heldWindows.push(trigramScore(held.slice(offset, offset + 121)));
}
assert(heldWindows.length > 50);
heldWindows.sort((left, right) => left - right);
const heldMedian = heldWindows[Math.floor(heldWindows.length / 2)];

const clearP57Score = trigramScore(p57.indices);
const best = results[0];

console.log(JSON.stringify({
  status: "PASS",
  family: {
    assignmentOrders: [...orders.keys()],
    models: results.length,
  },
  benchmarks: {
    p32Identity: identityScore,
    clearP57: clearP57Score,
    heldNative121Median: heldMedian,
    heldNative121Minimum: heldWindows[0],
    heldNative121Maximum: heldWindows[heldWindows.length - 1],
  },
  best,
  top10: results.slice(0, 10),
  decision:
    "Finite BFS/DFS reverse-tree transpositions are reported for source-selected p32. Promotion requires native-language evidence comparable to held clear controls plus an independent traversal selector.",
}, null, 2));
