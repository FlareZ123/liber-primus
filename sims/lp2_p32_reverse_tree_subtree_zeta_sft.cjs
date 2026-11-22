"use strict";

/**
 * SFT: exact, reversible subtree-sum zeta inverse on the fixed physical p32
 * reverse tree selected by the original p50 table and signed 2016 20-step
 * THE/EPIPHANY route. Six canonical traversal assignments times six reads.
 * Cipher node C(v) = plain node P(v) + sum(C(child)) (mod 29).
 * No fitted key, score-selected root, ciphertext edit, or plaintext claim.
 * Reproduction: node sims/lp2_p32_reverse_tree_subtree_zeta_sft.cjs
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

const mod29 = value => ((value % 29) + 29) % 29;

/**
 * Recover the original 121 source rune labels from subtree-aggregated
 * ciphertext labels under the fixed depth-20 p50 reverse tree.
 * Children outside the selected 121 nodes have zero boundary contribution.
 * @param {number[]} assignOrder
 * @param {number[]} readOrder
 * @param {number[]} [cipherValues]
 * @returns {number[]}
 */
function subtreeInverse(assignOrder, readOrder, cipherValues = p32.indices) {
  assert.equal(cipherValues.length, 121);
  const selected = new Set(assignOrder);
  assert.equal(selected.size, 121);
  const labels = new Map(assignOrder.map((node, i) => [node, cipherValues[i]]));
  const plain = new Map();
  for (const node of assignOrder) {
    const childTotal = reverse[node]
      .filter(child => selected.has(child))
      .reduce((sum, child) => sum + labels.get(child), 0);
    plain.set(node, mod29(labels.get(node) - childTotal));
  }
  return readOrder.map(node => plain.get(node));
}

// Positive control: encode an independently clear, GP-native original p57
// plaintext extended to 121 runes with the exact same inverse operation.
const plant = p57.indices.concat(p57.indices.slice(0, 26));
assert.equal(plant.length, 121);
const positiveOrder = orders.get("bfs-asc");
const positiveNodes = new Set(positiveOrder);
const knownPlain = new Map(positiveOrder.map((node, i) => [node, plant[i]]));
const knownCipher = new Map();
/** @param {number} node @returns {number} */
function encodeSubtree(node) {
  if (knownCipher.has(node)) return knownCipher.get(node);
  const total = reverse[node].filter(child => positiveNodes.has(child))
    .reduce((sum, child) => sum + encodeSubtree(child), knownPlain.get(node));
  const encoded = mod29(total);
  knownCipher.set(node, encoded);
  return encoded;
}
const encryptedPlant = positiveOrder.map(encodeSubtree);
assert.deepEqual(subtreeInverse(positiveOrder, positiveOrder, encryptedPlant),
  plant, "Source-native planted 121-rune input must invert exactly");

const results = [];
for (const [assignName, assignOrder] of orders) {
  for (const [readName, readOrder] of orders) {
    const plain = subtreeInverse(assignOrder, readOrder);
    assert.equal(plain.length, 121);
    assert(plain.every(value => Number.isInteger(value) && value >= 0 && value < 29));
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
assert.equal(best.assign, "pre-desc");
assert.equal(best.read, "pre-desc");
assert(Math.abs(best.score - (-11.26549172556508)) < 1e-10);
assert(best.score < heldWindows[0],
  "No source-tree subtree inverse can pass worst held native prose");

console.log(JSON.stringify({
  status: "PASS",
  family: {
    assignmentOrders: [...orders.keys()],
    models: results.length,
    reversiblePositivePlantRecovered: plant.length,
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
    "The source-selected 121-node reverse-tree subtree-sum inverse is reversible and recovers 121/121 planted clear GP runes, but all 36 original ciphertext outputs remain below the worst independent native-English control. No source-selected cipher or plaintext recovered.",
}, null, 2));
