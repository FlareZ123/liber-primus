"use strict";

/**
 * SFT: source-selected p32 reverse-tree receiver in the original base60 p50 graph.
 *
 * The authenticated 2016 clause EPIPHANY SEEKS THE DEVOTED fixes the upstream
 * values 121,71,20,102. Existing source work fixes the unique base60 p=23 walk
 * SEEKS -> ... -> THE -> DEVOTED -> physical p32. This test begins only after
 * that receiver is selected and asks whether the next p50 pointer plus the
 * visible tree motif determine a finite graph object of exactly p32's size.
 *
 * Node.js 22:
 *   node sims/lp2_p32_p50_reverse_tree_depth20_sft.cjs
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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/lp2-transcription.txt");

const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert(table.every((value) => Number.isInteger(value) && value >= 0 && value < 256));

const p32 = corpus.pages.find((page) => page.page === 32);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p32);
assert.ok(p57);
assert.equal(p32.indices.length, 121);

const reverse = Array.from({ length: 256 }, () => []);
for (let source = 0; source < 256; source += 1) {
  reverse[table[source]].push(source);
}

/**
 * Find the cycle reached by every node.
 * @returns {{cycles:number[][], cycleByNode:number[][]}}
 */
function findCycles() {
  /** @type {number[][]} */
  const cycles = [];
  /** @type {Array<number[]|undefined>} */
  const cycleByNode = Array(256);

  for (let start = 0; start < 256; start += 1) {
    if (cycleByNode[start]) continue;

    const positions = new Map();
    const walk = [];
    let current = start;

    while (!cycleByNode[current] && !positions.has(current)) {
      positions.set(current, walk.length);
      walk.push(current);
      current = table[current];
    }

    /** @type {number[]} */
    let cycle;
    if (positions.has(current)) {
      cycle = walk.slice(positions.get(current));
      cycles.push(cycle);
    } else {
      cycle = cycleByNode[current];
    }

    for (const node of walk) cycleByNode[node] = cycle;
  }

  return { cycles, cycleByNode };
}

const graph = findCycles();
const mainCycle = graph.cycles.find((cycle) => cycle.includes(115));
assert.deepEqual(mainCycle, [0,203,68,199,47,76,114,197,115,247,192]);

/**
 * Return non-root reverse-tree nodes within the given shortest reverse depth.
 * If root lies on a cycle, incoming edges from cycle nodes are excluded so the
 * object is the rooted in-tree attached to that attractor node.
 *
 * @param {number} rootNode
 * @param {number} maxDepth
 * @returns {{nodes:number[], depth:Map<number,number>}}
 */
function reverseTree(rootNode, maxDepth) {
  const rootCycle = new Set(graph.cycleByNode[rootNode]);
  const rootIsCycle = rootCycle.has(rootNode);
  const queue = [{ node: rootNode, depth: 0 }];
  const seen = new Set([rootNode]);
  const nodes = [];
  const depth = new Map([[rootNode, 0]]);

  while (queue.length > 0) {
    const current = queue.shift();
    assert.ok(current);
    if (current.depth > 0) nodes.push(current.node);
    if (current.depth === maxDepth) continue;

    for (const predecessor of reverse[current.node]) {
      if (rootIsCycle && rootCycle.has(predecessor)) continue;
      if (seen.has(predecessor)) continue;
      seen.add(predecessor);
      depth.set(predecessor, current.depth + 1);
      queue.push({ node: predecessor, depth: current.depth + 1 });
    }
  }

  return { nodes, depth };
}

const selected = reverseTree(115, 20);
assert.equal(table[32], 115);
assert.equal(selected.nodes.length, 121);

const depthCounts = Array.from({ length: 20 }, (_, index) =>
  selected.nodes.filter((node) => selected.depth.get(node) === index + 1).length
);
assert.deepEqual(depthCounts, [2,4,7,9,7,13,10,8,10,7,4,6,5,6,6,3,3,4,4,3]);
assert.equal(depthCounts.reduce((sum, value) => sum + value, 0), 121);

const fullTree = reverseTree(115, 255);
assert.equal(fullTree.nodes.length, 130);
assert.equal(fullTree.nodes.length + 1, 131);

// All 256 possible graph roots x all source-relevant depths 1..23.
const rootDepthHits = [];
for (let rootNode = 0; rootNode < 256; rootNode += 1) {
  for (let depth = 1; depth <= 23; depth += 1) {
    if (reverseTree(rootNode, depth).nodes.length === 121) {
      rootDepthHits.push({ root: rootNode, depth });
    }
  }
}
assert.equal(256 * 23, 5888);
assert.deepEqual(rootDepthHits, [{ root: 115, depth: 20 }]);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let offset = 0;
  let sum = 0;
  while (offset < normalized.length) {
    if (normalized.startsWith("ING", offset)) {
      sum += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      sum += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP word " + word + " at " + offset);
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const signedWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word, index) => ({ index, word: word.toUpperCase(), gp0: gp0(word) }));
assert.equal(signedWords.length, 43);

const epiphany = signedWords.find((row) => row.word === "EPIPHANY");
const seeks = signedWords.find((row) => row.word === "SEEKS");
const devoted = signedWords.find((row) => row.word === "DEVOTED");
assert.equal(epiphany.gp0, 121);
assert.equal(seeks.gp0, 71);
assert.equal(devoted.gp0, 102);
assert(signedWords.filter((row) => row.word === "THE").every((row) => row.gp0 === 20));

/**
 * Existing source-selected pointer route, repeated here only as the upstream
 * receiver assertion needed by this SFT.
 * @param {number} start
 * @param {number} steps
 * @returns {number[]}
 */
function walk(start, steps) {
  const route = [start];
  let state = start;
  for (let index = 0; index < steps; index += 1) {
    state = table[state];
    route.push(state);
  }
  return route;
}

const route = walk(seeks.gp0, 23);
assert.deepEqual(route, [
  71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,70,169,
  228,144,125,20,102,32,
]);
assert.equal(route[21], 20);
assert.equal(route[22], devoted.gp0);
assert.equal(route[23], 32);

// Stronger family: every rune-bearing unknown physical page chooses its own
// next pointer root T[page], while every authenticated source word supplies
// the reverse depth. Only p32 with THE reproduces its complete rune count.
const pageWordHits = [];
let pageWordTests = 0;
for (const page of corpus.pages.filter((row) =>
  row.page <= 55 && row.indices.length > 0
)) {
  const receiverRoot = table[page.page];
  for (const word of signedWords) {
    pageWordTests += 1;
    const count = reverseTree(receiverRoot, word.gp0).nodes.length;
    if (count === page.indices.length) {
      pageWordHits.push({
        page: page.page,
        runeCount: page.indices.length,
        root: receiverRoot,
        word: word.word,
        wordIndex: word.index,
        depth: word.gp0,
      });
    }
  }
}
assert.equal(pageWordTests, 2365);
assert.equal(pageWordHits.length, 6);
assert(pageWordHits.every((hit) =>
  hit.page === 32 &&
  hit.runeCount === 121 &&
  hit.root === 115 &&
  hit.word === "THE" &&
  hit.depth === 20
));

// The six physical p32 source lines do not register directly to the twenty
// reverse-tree layers, which prevents promoting the scaffold to a traversal.
const p32Text = transcription.split("%")[32];
const lineCounts = p32Text
  .split("\n")
  .filter((line) => /[\u16A0-\u16FF]/u.test(line))
  .map((line) => [...line].filter((char) => /[\u16A0-\u16FF]/u.test(char)).length);
assert.deepEqual(lineCounts, [25,23,23,21,22,7]);

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

/**
 * Deterministic BFS/DFS traversal of the selected reverse tree.
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
        .filter((node) => !new Set(mainCycle).has(node))
        .sort(compare);
      for (const child of children) {
        if (seen.has(child)) continue;
        seen.add(child);
        queue.push({ node: child, depth: current.depth + 1 });
      }
    }
    return out;
  }

  const seen = new Set([115]);
  const cycleSet = new Set(mainCycle);
  /** @param {number} node @param {number} depth */
  function visit(node, depth) {
    if (depth > 0 && kind === "pre") out.push(node);
    if (depth < 20) {
      const children = reverse[node]
        .filter((child) => !cycleSet.has(child))
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
  return out;
}

const directModels = [];
for (const kind of ["bfs", "pre", "post"]) {
  for (const descending of [false, true]) {
    const nodes = traversal(kind, descending);
    assert.equal(nodes.length, 121);

    const keys = {
      address: nodes.map((node) => node % 29),
      successor: nodes.map((node) => table[node] % 29),
      depth: nodes.map((node) => selected.depth.get(node) % 29),
      edge: nodes.map((node) => ((node - table[node]) % 29 + 29) % 29),
      edgeRow: nodes.map((node) =>
        ((Math.floor(node / 8) - Math.floor(table[node] / 8)) % 29 + 29) % 29
      ),
      edgeColumn: nodes.map((node) =>
        (((node % 8) - (table[node] % 8)) % 29 + 29) % 29
      ),
    };

    for (const [keyName, key] of Object.entries(keys)) {
      for (const sign of [-1, 1]) {
        const plain = p32.indices.map((value, index) =>
          ((value + sign * key[index]) % 29 + 29) % 29
        );
        directModels.push({
          kind,
          descending,
          key: keyName,
          sign,
          ioc: ioc(plain),
          prefix: plain.slice(0, 24).map((value) => corpus.translit[value]).join(" "),
        });
      }
    }
  }
}

assert.equal(directModels.length, 72);
directModels.sort((left, right) => right.ioc - left.ioc);
const best = directModels[0];
assert.deepEqual(
  { kind: best.kind, descending: best.descending, key: best.key, sign: best.sign },
  { kind: "post", descending: true, key: "depth", sign: -1 }
);
assert(Math.abs(best.ioc - 0.04022038567493113) < 1e-15);
assert(ioc(p32.indices) < 0.035);
assert(ioc(p57.indices) > 0.06);

console.log(JSON.stringify({
  status: "PASS",
  upstreamRoute: route,
  selectedReverseTree: {
    root: 115,
    nextAfterPhysicalPage32: table[32],
    depth: 20,
    nonRootNodes: selected.nodes.length,
    depthCounts,
    fullTreeIncludingRoot: fullTree.nodes.length + 1,
  },
  familyAudits: {
    rootDepthTests: 5888,
    rootDepthHits,
    pageWordTests,
    pageWordHits,
  },
  sourceLayout: {
    p32LineRuneCounts: lineCounts,
    reverseLayerCounts: depthCounts,
  },
  directConsumerGate: {
    models: directModels.length,
    p32CipherIoC: ioc(p32.indices),
    clearP57IoC: ioc(p57.indices),
    best,
  },
  decision:
    "The p50 reverse tree at 115, truncated by authenticated THE=20, uniquely contains EPIPHANY=121 non-root nodes and matches p32's rune count. It is a source-selected receiver scaffold, while the bounded direct additive/edge consumers remain nonlinguistic.",
}, null, 2));
