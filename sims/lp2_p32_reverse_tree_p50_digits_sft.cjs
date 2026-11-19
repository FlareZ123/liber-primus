"use strict";

/**
 * SFT: p32 reverse-tree scaffold -> p50 token-digit key.
 *
 * Upstream source work selects p32 and a 121-node reverse p50 tree rooted at
 * p50[32]=115, truncated at authenticated THE=20. A separate source bridge
 * independently selects the native base60 low component of p50 tokens.
 *
 * This test assigns the 121 original p32 runes to that fixed tree under six
 * canonical address-ordered traversals, uses each node's own p50 token digit
 * as a stationary GP29 key, and reads under the same six canonical orders.
 * Base59 and the high component are charged as finite controls.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const nativeText = read("resources/control/gibran_prophet_58585.txt");

const table = grid.byte_rows.flat();
const tokens = grid.rows.flat();
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const p32 = corpus.pages.find((page) => page.page === 32);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p32);
assert.ok(p57);
assert.equal(p32.indices.length, 121);
assert.equal(table[32], 115);

const reverse = Array.from({ length: 256 }, () => []);
for (let source = 0; source < 256; source += 1) {
  reverse[table[source]].push(source);
}
const mainCycle = new Set([0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192]);

/**
 * @param {"bfs"|"pre"|"post"} kind
 * @param {boolean} descending
 * @returns {number[]}
 */
function traversal(kind, descending) {
  const compare = descending
    ? (left, right) => right - left
    : (left, right) => left - right;
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
    orders.set(kind + (descending ? "-desc" : "-asc"), traversal(kind, descending));
  }
}
assert.equal(orders.size, 6);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

function gpText(text) {
  const words = text.match(/[A-Za-z]+/gu) || [];
  const out = [];
  for (const word of words) {
    const normalized = word
      .toUpperCase()
      .replace(/QU/g, "CW")
      .replace(/V/g, "U")
      .replace(/[KQ]/g, "C")
      .replace(/Z/g, "S")
      .replace(/ING/g, "NG")
      .replace(/IO/g, "IA");
    let offset = 0;
    while (offset < normalized.length) {
      const token = gpTokens.find((candidate) =>
        normalized.startsWith(candidate.symbol, offset)
      );
      if (!token) break;
      out.push(token.value);
      offset += token.symbol.length;
    }
  }
  return out;
}

const native = gpText(nativeText);
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

function score(values) {
  let total = 0;
  for (let index = 2; index < values.length; index += 1) {
    const key = values[index - 2] * 841 + values[index - 1] * 29 + values[index];
    total += Math.log(((trigramCounts.get(key) || 0) + 0.25) / denominator);
  }
  return total / (values.length - 2);
}

function digit(node, radix, component) {
  const alphabet = radix === "base60" ? alpha60 : alpha59;
  const token = tokens[node];
  const char = component === "low" ? token[1] : token[0];
  const value = alphabet.indexOf(char);
  return value < 0 ? null : value % 29;
}

function preview(values) {
  return values.slice(0, 90).map((value) => corpus.translit[value]).join("");
}

const results = [];
for (const [assignName, assignOrder] of orders) {
  const cipherByNode = new Map();
  assignOrder.forEach((node, index) => cipherByNode.set(node, p32.indices[index]));

  for (const radix of ["base60", "base59"]) {
    for (const component of ["low", "high"]) {
      const keyByNode = new Map();
      let valid = true;
      for (const node of assignOrder) {
        const value = digit(node, radix, component);
        if (value === null) {
          valid = false;
          break;
        }
        keyByNode.set(node, value);
      }
      if (!valid) continue;

      for (const sign of [-1, 1]) {
        const plainByNode = new Map();
        for (const node of assignOrder) {
          plainByNode.set(
            node,
            ((cipherByNode.get(node) + sign * keyByNode.get(node)) % 29 + 29) % 29
          );
        }

        for (const [readName, readOrder] of orders) {
          const plain = readOrder.map((node) => plainByNode.get(node));
          results.push({
            assign: assignName,
            read: readName,
            radix,
            component,
            sign,
            score: score(plain),
            preview: preview(plain),
          });
        }
      }
    }
  }
}
assert.equal(results.length, 288);
results.sort((left, right) => right.score - left.score);

const heldWindows = [];
for (let offset = 0; offset + 121 <= held.length; offset += 121) {
  heldWindows.push(score(held.slice(offset, offset + 121)));
}
heldWindows.sort((left, right) => left - right);

// Algebraic positive: one fixed native 121-rune plant under the canonical
// low60/subtract/BFS-ascending model recovers exactly.
const plant = held.slice(0, 121);
const canonical = orders.get("bfs-asc");
const encrypted = canonical.map((node, index) =>
  (plant[index] + digit(node, "base60", "low")) % 29
);
const recovered = encrypted.map((value, index) =>
  ((value - digit(canonical[index], "base60", "low")) % 29 + 29) % 29
);
assert.deepEqual(recovered, plant);

console.log(JSON.stringify({
  status: "PASS",
  family: {
    assignmentOrders: orders.size,
    readOrders: orders.size,
    radices: ["base60", "base59"],
    components: ["low", "high"],
    signs: [-1, 1],
    models: results.length,
  },
  benchmarks: {
    p32Identity: score(p32.indices),
    clearP57: score(p57.indices),
    heldNative121Median: heldWindows[Math.floor(heldWindows.length / 2)],
    heldNative121Minimum: heldWindows[0],
    heldNative121Maximum: heldWindows.at(-1),
  },
  best: results[0],
  top12: results.slice(0, 12),
  sourcePreferred: results.filter((row) =>
    row.radix === "base60" && row.component === "low"
  ).slice(0, 12),
  decision:
    "The fixed p32 reverse-tree scaffold does not by itself authenticate a p50-digit additive consumer; compare the finite outputs against held native GP before promoting.",
}, null, 2));
