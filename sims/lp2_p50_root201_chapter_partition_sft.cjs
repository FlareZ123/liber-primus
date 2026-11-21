"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const grid = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert(bytes.every(n => Number.isInteger(n) && n >= 0 && n < 256));
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

/**
 * Build the reverse functional graph. A cell x is a child of cell bytes[x].
 * @param {number[]} table
 * @returns {number[][]}
 */
function reverseEdges(table) {
  const children = Array.from({ length: table.length }, () => []);
  table.forEach((parent, child) => children[parent].push(child));
  return children;
}

/**
 * Enumerate one reverse subtree rooted outside its functional-graph cycle.
 * @param {number[][]} children
 * @param {number} root
 * @returns {number[]}
 */
function descendants(children, root) {
  const nodes = [];
  const visited = new Set();
  function walk(node) {
    assert(!visited.has(node), "reverse closure must be a tree");
    visited.add(node);
    nodes.push(node);
    for (const child of children[node]) walk(child);
  }
  walk(root);
  return nodes;
}

/**
 * Exact bottom-up tree DP. A state (mask, size) represents completed components
 * assigned distinct requested chapter slots plus the sole open component
 * containing the current subtree root. Cutting an edge closes the child's
 * component; joining an edge merges the open components. No node can be reused.
 * @param {number[][]} children
 * @param {number} root
 * @param {number[]} chapterSizes
 * @param {number} rootChapter
 * @param {number} [requiredCut] Child vertex whose incoming edge must be cut.
 * @returns {number}
 */
function countPartitions(children, root, chapterSizes, rootChapter, requiredCut = -1) {
  const stride = Math.max(...chapterSizes) + 1;
  const fullMask = (1 << chapterSizes.length) - 1;
  function solve(node) {
    /** @type {Map<number, number>} */
    let states = new Map([[1, 1]]); // mask=0, open size=1
    for (const child of children[node]) {
      const childStates = solve(child);
      /** @type {Map<number, number>} */
      const merged = new Map();
      for (const [a, waysA] of states) {
        const sizeA = a % stride;
        const maskA = (a - sizeA) / stride;
        for (const [b, waysB] of childStates) {
          const sizeB = b % stride;
          const maskB = (b - sizeB) / stride;
          if (maskA & maskB) continue;
          const mergedMask = maskA | maskB;
          const product = waysA * waysB;
          function add(mask, size) {
            const key = mask * stride + size;
            merged.set(key, (merged.get(key) || 0) + product);
          }
          // Join the child to the open component of this subtree.
          if (child !== requiredCut && sizeA + sizeB < stride) {
            add(mergedMask, sizeA + sizeB);
          }
          // Cut the child edge; assign its now-closed component a chapter.
          for (let chapter = 0; chapter < chapterSizes.length; chapter++) {
            if (chapter === rootChapter ||
                chapterSizes[chapter] !== sizeB ||
                (mergedMask & (1 << chapter))) continue;
            add(mergedMask | (1 << chapter), sizeA);
          }
        }
      }
      states = merged;
    }
    return states;
  }
  const needMask = fullMask ^ (1 << rootChapter);
  return solve(root).get(needMask * stride + chapterSizes[rootChapter]) || 0;
}

// Deterministic artificial controls: a four-node path can be cut 2|2 once;
// a four-node star cannot be split into two connected size-two components.
assert.equal(countPartitions([[1], [2], [3], []], 0, [2, 2], 0), 1);
assert.equal(countPartitions([[1, 2, 3], [], [], []], 0, [2, 2], 0), 0);

const children = reverseEdges(bytes);
const closure = descendants(children, 201);
assert.equal(closure.length, 56);
assert.deepEqual(children[201], [82, 128]);
assert.equal(descendants(children, 82).length, 50);
assert.equal(descendants(children, 128).length, 5);

// Visible chapters are pp0-2,3-7,8-14,15-22,23-26,27-32,
// 33-39,40-53,54-55. The rune-free p50 lies in the length-14 chapter.
const chapterSizes = [3, 5, 7, 8, 4, 6, 7, 14, 2];
const rootChapter = 7;
assert.equal(chapterSizes.reduce((a, b) => a + b, 0), closure.length);
const labeledCount = countPartitions(children, 201, chapterSizes, rootChapter);
assert.equal(labeledCount, 610);

// Both seven-page chapters are the same size. Swapping their distinct
// labels represents the identical cut set, so every partition is counted twice.
const uniqueEdgeCutSets = labeledCount / 2;
assert.equal(uniqueEdgeCutSets, 305);

const cutCounts = new Map();
for (const vertex of closure) {
  if (vertex === 201) continue;
  cutCounts.set(vertex, countPartitions(children, 201, chapterSizes, rootChapter, vertex));
}
const totalCutsOverLabeledSolutions =
  [...cutCounts.values()].reduce((a, b) => a + b, 0);
assert.equal(totalCutsOverLabeledSolutions, labeledCount * (chapterSizes.length - 1));
const forcedJoinVertices = [...cutCounts]
  .filter(([, cutWays]) => cutWays === 0)
  .map(([vertex]) => vertex).sort((a, b) => a - b);
const forcedCutVertices = [...cutCounts]
  .filter(([, cutWays]) => cutWays === labeledCount)
  .map(([vertex]) => vertex).sort((a, b) => a - b);
assert.equal(forcedJoinVertices.length, 21);
assert.deepEqual(forcedCutVertices, []);

// Every edge in this six-vertex source core is joined in all 305 cut sets.
const rootCore = [];
function addForcedCore(node) {
  rootCore.push(node);
  for (const next of children[node]) {
    if (cutCounts.get(next) === 0) addForcedCore(next);
  }
}
addForcedCore(201);
rootCore.sort((a, b) => a - b);
assert.deepEqual(rootCore, [43, 73, 79, 82, 201, 226]);

// Separately published largest-child-first inorder ranks node73 as physical
// p32. That page assignment conflicts with the optional "chapter connected"
// hypothesis, because node73 is necessarily in p50's chapter under that model.
function inorder(node) {
  const successors = children[node].slice().sort((a, b) => {
    const diff = descendants(children, b).length - descendants(children, a).length;
    return diff || a - b;
  });
  if (!successors.length) return [node];
  return [...inorder(successors[0]), node,
    ...successors.slice(1).flatMap(inorder)];
}
const pageOrder = inorder(201);
assert.equal(pageOrder[32], 73);
assert.equal(pageOrder[50], 201);

console.log(JSON.stringify({
  status: "PASS",
  source: "original p49-p51 base60 256-byte transcription, physical nine chapter sizes",
  branchAssumption: "Every printed chapter is a connected induced subtree component",
  rootCell: 201,
  rootChapter: "physical pp40-53, including rune-free p50",
  rootClosureSize: closure.length,
  rootChildren: children[201].map(node => ({
    node, reverseSubtreeSize: descendants(children, node).length
  })),
  chapterSizes,
  labeledAssignments: labeledCount,
  distinctEightEdgeCutSets: uniqueEdgeCutSets,
  forcedJoinedEdges: forcedJoinVertices.length,
  forcedCutEdges: forcedCutVertices.length,
  forcedRootComponentNodes: rootCore,
  inorderNode73PhysicalPage: pageOrder.indexOf(73),
  conditionalConflict: "Connected chapter reading forces node73 into pp40-53; inorder gives p32",
  recoveredUnknownPlaintext: false
}, null, 2));
