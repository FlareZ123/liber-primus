"use strict";

/**
 * Original-byte Prüfer-tree decoder for LP2's 256 table tokens.
 *
 * A 256-item Prüfer code defines a labeled tree on 258 vertices. Original
 * source bytes are all 0..255, so labels 256 and 257 are leaves.
 * There are 97 leaves and 161 non-leaves; literal p57 has 95 runes and
 * 13-/23-dot marks, while p55+p56 have 76+85 runes.
 *
 * This tests the source-selected *geometry* with one explicit conjectural
 * inward consumer: an internal label equals its rooted children's GP-index
 * sum modulo 29. Root = one of the two unused source labels. Five source
 * orderings, output directions, two punctuation assignments and p56
 * ciphertext/independently solved plaintext are retained without fitting.
 *
 * Run: node sims/lp2_p50_prufer258_p57_97events_p56_holdout_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
function readJson(name) {
  return JSON.parse(fs.readFileSync(
    path.join(ROOT, "resources", "liber-primus", name), "utf8"
  ));
}
const gp = readJson("lp2-corpus.json");
const table = readJson("base60-grid.json");
const bytes = table.byte_rows.flat();
const N = bytes.length + 2;
assert.equal(bytes.length, 256);
assert.equal(N, 258);
assert(bytes.every(value => Number.isInteger(value) && value >= 0 && value <= 255));
assert.equal(new Set(bytes).size, 161);

const originalDegree = Array(N).fill(1);
for (const n of bytes) originalDegree[n]++;
const leaves = originalDegree.flatMap((d, i) => d === 1 ? [i] : []);
const internal = originalDegree.flatMap((d, i) => d > 1 ? [i] : []);
assert.deepEqual([leaves.length, internal.length], [97, 161]);
assert(leaves.includes(256) && leaves.includes(257));

/** Construct the exact unique labeled tree with the conventional smallest-leaf Prüfer algorithm. */
function decodePrufer(code) {
  const degree = Array(code.length + 2).fill(1);
  for (const v of code) degree[v]++;
  const edges = [];
  const removed = [];
  for (const v of code) {
    const u = degree.findIndex(x => x === 1);
    assert(u >= 0);
    edges.push([u, v]);
    removed.push(u);
    degree[u]--;
    degree[v]--;
  }
  const terminal = degree.flatMap((d, i) => d === 1 ? [i] : []);
  assert.equal(terminal.length, 2);
  edges.push(terminal);
  return {edges, removed, terminal};
}
const {edges, removed, terminal} = decodePrufer(bytes);
assert.equal(edges.length, 257);
const neighbors = Array.from({length:N}, () => []);
for (const [u, v] of edges) {
  assert.notEqual(u, v);
  neighbors[u].push(v);
  neighbors[v].push(u);
}
const edgeCount = neighbors.reduce((s, row) => s + row.length, 0);
assert.equal(edgeCount, 514);

/** Derive deterministic breadth-/depth-first orders and rooted child sets. */
function rooted(root) {
  const parent = Array(N).fill(-1);
  parent[root] = root;
  const bfs = [root];
  const children = Array.from({length:N}, () => []);
  for (let i = 0; i < bfs.length; i++) {
    const u = bfs[i];
    for (const v of neighbors[u]) {
      if (parent[v] >= 0) continue;
      parent[v] = u;
      children[u].push(v);
      bfs.push(v);
    }
  }
  assert.equal(bfs.length, N);
  const pre = [], post = [];
  /** @param {number} n */
  function visit(n) {
    pre.push(n);
    for (const c of children[n]) visit(c);
    post.push(n);
  }
  visit(root);
  return {bfs, pre, post, children};
}

const clearP57 = gp.pages[57].indices;
const cipherP56 = gp.pages[56].indices;
assert.deepEqual([gp.pages[55].indices.length, cipherP56.length, clearP57.length], [76, 85, 95]);
const p57Events = [...clearP57.slice(0, 7), 13, ...clearP57.slice(7), 23];
assert.equal(p57Events.length, 97);
const rawP56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const gpTokens = gp.translit.map((name, i) => ({name, i})).sort(
  (a, b) => b.name.length - a.name.length
);
function encodeGP(phrase) {
  const symbols = [];
  for (const word of phrase.split(" ")) {
    for (let p = 0; p < word.length;) {
      const t = gpTokens.find(t => word.startsWith(t.name, p));
      assert(t, `Unknown GP spelling in ${word}`);
      symbols.push(t.i);
      p += t.name.length;
    }
  }
  return symbols;
}
const plainP56 = encodeGP(rawP56);
assert.equal(plainP56.length, 85);
const mod = n => (n % 29 + 29) % 29;

// Full authentic p56 forward replay, including its ONE plaintext F bypass.
const phiPrime = [];
for (let p = 2; phiPrime.length < 84; p++) {
  let prime = true;
  for (let d = 2; d * d <= p; d++) if (p % d === 0) { prime = false; break; }
  if (prime) phiPrime.push(p - 1);
}
let keyClock = 0;
const replay = plainP56.map(p => p === 0 ? 0 : mod(p + phiPrime[keyClock++]));
assert.equal(keyClock, 84);
assert.deepEqual(replay, cipherP56);

const cases = [];
const innerSet = new Set(internal);
for (const root of [256, 257]) {
  const {bfs, pre, post, children} = rooted(root);
  const orders = {
    address: internal,
    prufer: [...removed, ...terminal].filter(x => innerSet.has(x)),
    bfs: bfs.filter(x => innerSet.has(x)),
    pre: pre.filter(x => innerSet.has(x)),
    post: post.filter(x => innerSet.has(x)),
  };
  assert(Object.values(orders).every(order => order.length === 161));
  for (const assignment of ["p57-event-order", "fixed-dot-sentinels"]) {
    for (const reverseLeaves of [false, true]) {
      const values = Array(N).fill(-1);
      if (assignment === "p57-event-order") {
        const sequence = reverseLeaves ? [...p57Events].reverse() : p57Events;
        leaves.forEach((node, i) => { values[node] = sequence[i]; });
      } else {
        const sequence = reverseLeaves ? [...clearP57].reverse() : clearP57;
        let i = 0;
        leaves.forEach(node => {
          values[node] = node === 256 ? 13 : node === 257 ? 23 : sequence[i++];
        });
        assert.equal(i, 95);
      }
      const plantedLeaves = values.slice();

      /** @param {number} node @returns {number} */
      function fold(node) {
        if (values[node] >= 0) return values[node];
        values[node] = mod(children[node].reduce((s, child) => s + fold(child), 0));
        return values[node];
      }
      for (const child of children[root]) fold(child);
      assert(internal.every(i => values[i] >= 0 && values[i] < 29));

      // Positive: inject the same source-native 97 GP/dot values into a
      // fresh accumulator, independently replay each rooted tree recurrence.
      const positive = plantedLeaves.slice();
      /** @param {number} n @returns {number} */
      function replayFold(n) {
        if (positive[n] >= 0) return positive[n];
        positive[n] = mod(children[n].reduce((s, c) => s + replayFold(c), 0));
        return positive[n];
      }
      for (const child of children[root]) replayFold(child);
      assert(internal.every(i => positive[i] === values[i]));

      for (const [readOrder, order] of Object.entries(orders)) {
        for (const reverseOutput of [false, true]) {
          const nodes = reverseOutput ? [...order].reverse() : order;
          const predicted = nodes.slice(76).map(i => values[i]);
          assert.equal(predicted.length, 85);
          for (const [receiver, known] of [["p56-plaintext", plainP56], ["p56-ciphertext", cipherP56]]) {
            const matches = predicted.reduce((s, p, i) => s + (p === known[i] ? 1 : 0), 0);
            cases.push({matches, root, assignment, reverseLeaves, readOrder, reverseOutput, receiver});
          }
        }
      }
    }
  }
}
assert.equal(cases.length, 160);
const best = cases.reduce((a, b) => b.matches > a.matches ? b : a);
assert.equal(best.matches, 8);
assert(cases.every(c => c.matches < 85));
console.log("Source: 256 original grid bytes, 161 distinct labels; exact Prüfer tree 258 vertices and 257 edges.");
console.log("Source: 97 leaves = 95 genuine clear p57 GP runes + 13/23-dot marks; 161 internal nodes = p55 76 + p56 85.");
console.log("Two extra leaf labels 256/257, original p56 cipher fully replayed 85/85 with one F skip.");
console.log("Source-natural rooted-inward fold candidates: " + cases.length + "; best p56 match " + best.matches + "/85.");
console.log("Best case: " + JSON.stringify(best));
console.log("Native-geometry folded positive: all 161 non-leaf values exactly reproduced.");
console.log("No unknown LP2 plaintext/key; source does not authorize inward sum, leaf order or tree reader.");
