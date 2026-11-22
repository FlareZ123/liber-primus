"use strict";

/**
 * SFT: finite parent-child graph-difference / graph-integration consumers for
 * the source-selected 121-node p32 reverse-tree scaffold.
 *
 * Six canonical node assignments x six canonical read orders x three
 * source-native root seeds x two inverse tree operations = 216 models.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = grid.byte_rows.flat();
const p32 = corpus.pages.find((page) => page.page === 32);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p32);
assert.ok(p57);
assert.equal(p32.indices.length, 121);
assert.equal(table[32], 115);

const reverse = Array.from({ length: 256 }, () => []);
for (let source = 0; source < 256; source += 1) reverse[table[source]].push(source);

const cycle = new Set([0,203,68,199,47,76,114,197,115,247,192]);

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
      const children = reverse[current.node].filter((node) => !cycle.has(node)).sort(compare);
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
      const children = reverse[node].filter((child) => !cycle.has(child)).sort(compare);
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
    orders.set(kind + (descending ? "-desc" : "-asc"), traversal(kind, descending));
  }
}
assert.equal(orders.size, 6);

const selectedNodes = new Set(orders.get("bfs-asc"));
assert.equal(selectedNodes.size, 121);
for (const node of selectedNodes) {
  const parent = table[node];
  assert(parent === 115 || selectedNodes.has(parent));
}

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const tokens = corpus.translit
    .map((symbol, value) => ({ symbol, value }))
    .sort((left, right) => right.symbol.length - left.symbol.length);

  /** @param {string} word @returns {number[]} */
  function gpWord(word) {
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
      const token = tokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
      if (!token) return [];
      values.push(token.value);
      offset += token.symbol.length;
    }
    return values;
  }

  return (text.match(/[A-Za-z]+/gu) || []).flatMap(gpWord);
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
function score(values) {
  let total = 0;
  for (let index = 2; index < values.length; index += 1) {
    const key = values[index - 2] * 841 + values[index - 1] * 29 + values[index];
    total += Math.log(((trigramCounts.get(key) || 0) + 0.25) / denominator);
  }
  return total / (values.length - 2);
}

/** @param {number[]} values @returns {string} */
function preview(values) {
  return values.slice(0, 90).map((value) => corpus.translit[value]).join("");
}

/**
 * @param {number[]} assignOrder
 * @returns {Map<number,number>}
 */
function assignCipher(assignOrder) {
  const labels = new Map([[115, 0]]);
  assignOrder.forEach((node, index) => labels.set(node, p32.indices[index]));
  return labels;
}

/**
 * Treat node labels as a potential: output child-parent differences.
 * @param {Map<number,number>} cipher
 * @param {number} seed
 * @returns {Map<number,number>}
 */
function differentiate(cipher, seed) {
  const out = new Map();
  for (const node of selectedNodes) {
    const parent = table[node];
    const parentValue = parent === 115 ? seed : cipher.get(parent);
    assert.notEqual(parentValue, undefined);
    out.set(node, mod29(cipher.get(node) - parentValue));
  }
  return out;
}

/**
 * Treat node labels as edge differences and integrate away from root.
 * @param {Map<number,number>} cipher
 * @param {number} seed
 * @returns {Map<number,number>}
 */
function integrate(cipher, seed) {
  const out = new Map([[115, seed]]);
  const bfs = orders.get("bfs-asc");
  for (const node of bfs) {
    const parent = table[node];
    const parentValue = out.get(parent);
    assert.notEqual(parentValue, undefined);
    out.set(node, mod29(cipher.get(node) + parentValue));
  }
  out.delete(115);
  return out;
}

const seeds = {
  zero: 0,
  rootAddress: 115 % 29,
  rootSuccessor: table[115] % 29,
};
assert.deepEqual(seeds, { zero: 0, rootAddress: 28, rootSuccessor: 15 });

const results = [];
for (const [assignName, assignOrder] of orders) {
  const cipher = assignCipher(assignOrder);
  for (const [seedName, seed] of Object.entries(seeds)) {
    for (const operation of ["differentiate", "integrate"]) {
      const transformed = operation === "differentiate"
        ? differentiate(cipher, seed)
        : integrate(cipher, seed);
      for (const [readName, readOrder] of orders) {
        const plain = readOrder.map((node) => {
          const value = transformed.get(node);
          assert.notEqual(value, undefined);
          return value;
        });
        results.push({
          assign: assignName,
          read: readName,
          seed: seedName,
          operation,
          score: score(plain),
          preview: preview(plain),
        });
      }
    }
  }
}
assert.equal(results.length, 216);
results.sort((left, right) => right.score - left.score);

const heldWindows = [];
for (let offset = 0; offset + 121 <= held.length; offset += 121) {
  heldWindows.push(score(held.slice(offset, offset + 121)));
}
heldWindows.sort((left, right) => left - right);
assert(heldWindows.length > 50);

// Positive algebraic control for both inverse directions on one fixed tree
// labeling. A known 121-rune native source is mapped under BFS ascending.
const plant = held.slice(0, 121);
const plantLabels = new Map([[115, seeds.rootAddress]]);
orders.get("bfs-asc").forEach((node, index) => plantLabels.set(node, plant[index]));
const plantDiff = differentiate(plantLabels, seeds.rootAddress);
const recovered = new Map([[115, seeds.rootAddress]]);
for (const node of orders.get("bfs-asc")) {
  recovered.set(node, mod29(plantDiff.get(node) + recovered.get(table[node])));
}
assert.deepEqual(
  orders.get("bfs-asc").map((node) => recovered.get(node)),
  plant
);

console.log(JSON.stringify({
  status: "PASS",
  family: {
    assignments: orders.size,
    readOrders: orders.size,
    rootSeeds: seeds,
    operations: 2,
    models: results.length,
  },
  benchmarks: {
    p32Identity: score(p32.indices),
    clearP57: score(p57.indices),
    heldNative121Median: heldWindows[Math.floor(heldWindows.length / 2)],
    heldNative121Minimum: heldWindows[0],
    heldNative121Maximum: heldWindows[heldWindows.length - 1],
  },
  best: results[0],
  top12: results.slice(0, 12),
  decision:
    "Parent-child graph differentiation/integration over the fixed p32 reverse-tree scaffold is tested as a finite source-native family. Promotion requires a native-language result comparable to held clear controls.",
}, null, 2));
