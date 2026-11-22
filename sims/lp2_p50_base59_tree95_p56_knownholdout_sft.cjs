'use strict';

/**
 * Original LP2 p50 numerical table: base59 rooted-tree 95-leaf p57
 * proposed reconstruction, tested against the independently solved
 * 85-rune plaintext of physical p56.
 *
 * Node.js 22, CommonJS. No dependencies or file writes.
 * All inputs are the repository's unchanged original LP2 resources.
 * The graph/leaf operation is hypothetical, not an authenticated decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
}

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
const grid = load('base60-grid.json');
const corpus = load('lp2-corpus.json');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
const tokens = grid.rows.flat();
assert.equal(alphabet.length, 59);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every((row) => row.length === 8));
assert.equal(tokens.length, 256);

const next = tokens.map((token) => {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  const v = 59 * a + b;
  assert(v >= 0 && v < 256);
  return v;
});
assert.equal(new Set(next).size, 161);
const children = Array.from({length: 256}, () => []);
const indegree = Array(256).fill(0);
next.forEach((target, source) => {
  indegree[target]++;
  if (source !== target) children[target].push(source);
});
const roots = next.flatMap((target, i) => target === i ? [i] : []);
assert.deepEqual(roots, [189]);
for (let i = 0; i < 256; i++) {
  let node = i;
  for (let j = 0; j < 256 && node !== 189; j++) node = next[node];
  assert.equal(node, 189, 'Each address must converge to the one root.');
}
const addresses = Array.from({length: 256}, (_, i) => i);
const sortedLeaves = addresses.filter((i) => indegree[i] === 0);
const sortedInternals = addresses.filter((i) => indegree[i] > 0);
assert.equal(sortedLeaves.length, 95);
assert.equal(sortedInternals.length, 161);

const preorder = [];
const postorder = [];
/** @param {number} i */
function visit(i) {
  preorder.push(i);
  for (const child of children[i]) visit(child);
  postorder.push(i);
}
visit(189);
assert.equal(new Set(preorder).size, 256);
assert.equal(preorder.length, 256);
const leafOrders = {
  address: sortedLeaves,
  dfs: preorder.filter((i) => indegree[i] === 0)
};
const internalOrders = {
  address: sortedInternals,
  dfs: preorder.filter((i) => indegree[i] > 0),
  post: postorder.filter((i) => indegree[i] > 0)
};
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const originalP56 = corpus.pages.find((page) => page.page === 56).indices;
assert.equal(p57.length, 95);
assert.equal(originalP56.length, 85);
assert.equal(corpus.pages.find((page) => page.page === 55).indices.length, 76);

const p56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const spellings = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const result = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const entry = spellings.find(({token}) => word.startsWith(token, i));
      assert(entry, 'Unknown GP token in ' + word.slice(i));
      result.push(entry.index);
      i += entry.token.length;
    }
  }
  return result;
}
const knownP56 = encodeGP(p56Words);
assert.equal(knownP56.length, 85);
const primeClock = [];
for (let value = 2; primeClock.length < 85; value++) {
  let isPrime = true;
  for (let j = 2; j * j <= value; j++) {
    if (value % j === 0) { isPrime = false; break; }
  }
  if (isPrime) primeClock.push(value - 1);
}
let consumed = 0;
const authenticP56Cipher = knownP56.map((p) =>
  p === 0 ? 0 : mod(p + primeClock[consumed++]));
assert.equal(consumed, 84);
assert.deepEqual(authenticP56Cipher, originalP56,
  'Known p56 plaintext must reproduce every source cipher rune.');

const results = [];
for (const [leafOrder, leaves] of Object.entries(leafOrders)) {
  for (const [internalOrder, internals] of Object.entries(internalOrders)) {
    for (const primeWeight of [false, true]) {
      for (const reverseClear of [false, true]) {
        const values = Array(256).fill(-1);
        for (let i = 0; i < 95; i++) {
          const p = p57[reverseClear ? 94 - i : i];
          values[leaves[i]] = primeWeight ? corpus.prime[p] % 29 : p;
        }
        /** @param {number} node @returns {number} */
        function derive(node) {
          if (values[node] >= 0) return values[node];
          values[node] = mod(children[node]
            .reduce((sum, child) => sum + derive(child), 0));
          return values[node];
        }
        for (const i of addresses) derive(i);
        assert(values.every((v) => Number.isInteger(v) && v >= 0 && v < 29));
        // p55's 76 unknown plaintext symbols occupy the first 76 internal
        // slots, while the independently *known* p56 occupies the last 85.
        const predictedP56 = internals.slice(76).map((i) => values[i]);
        const hits = predictedP56.filter((v, i) => v === knownP56[i]).length;
        assert.equal(predictedP56.length, 85);
        results.push({leafOrder, internalOrder, primeWeight,
          reverseClear, hits, of: 85});
      }
    }
  }
}
assert.equal(results.length, 24);
const best = [...results].sort((a, b) => b.hits - a.hits)[0];
assert.equal(best.hits, 7);
const histogram = {};
for (const result of results) histogram[result.hits] =
  (histogram[result.hits] || 0) + 1;
assert.deepEqual(histogram, {'1': 1, '2': 6, '3': 7,
  '4': 5, '5': 1, '6': 3, '7': 1});

// Independent key-free exclusions: even arbitrary shared functions are
// constrained by repeated known child inputs and repeated leaf-set inputs.
// These tests grant *unlimited secret lookup tables*, not just parent sums.
// A unary tree node is one with exactly one child.
const leafSets = Array(256).fill(null);
/** @param {number} node @returns {number[]} */
function descendants(node) {
  if (leafSets[node]) return leafSets[node];
  if (indegree[node] === 0) return (leafSets[node] = [node]);
  const leaves = children[node].flatMap(descendants).sort((a, b) => a - b);
  leafSets[node] = leaves;
  return leaves;
}
for (const node of addresses) descendants(node);

const allSecretUnary = [];
const symmetricLeafSet = [];
for (const [name, naturalOrder] of Object.entries(internalOrders)) {
  for (const reverseInternal of [false, true]) {
    const internals = reverseInternal
      ? [...naturalOrder].reverse() : naturalOrder;
    const knownNodes = internals.slice(76);

    // For ANY unknown deterministic function of the multiset of p57 leaves,
    // two internal nodes with identical descendant-leaf address sets must
    // have identical output symbols. This does not fit any secret function.
    const byLeafSet = new Map();
    for (let i = 0; i < 85; i++) {
      const key = leafSets[knownNodes[i]].join(',');
      if (!byLeafSet.has(key)) byLeafSet.set(key, []);
      byLeafSet.get(key).push(knownP56[i]);
    }
    let inevitableErrors = 0;
    let conflictingLeafSets = 0;
    for (const ys of byLeafSet.values()) {
      const counts = new Map();
      for (const y of ys) counts.set(y, (counts.get(y) || 0) + 1);
      inevitableErrors += ys.length - Math.max(...counts.values());
      if (counts.size > 1) conflictingLeafSets++;
    }
    symmetricLeafSet.push({
      internalOrder: name, reverseInternal,
      uniqueLeafSets: byLeafSet.size, conflictingLeafSets,
      inevitableErrors
    });

    for (const [leafOrder, naturalLeaves] of Object.entries(leafOrders)) {
      for (const reverseClear of [false, true]) {
        const labels = Array(256).fill(-1);
        for (let i = 0; i < 95; i++) {
          const p = p57[reverseClear ? 94 - i : i];
          labels[naturalLeaves[i]] = p;
        }
        for (let i = 0; i < 85; i++)
          labels[knownNodes[i]] = knownP56[i];

        // Let *every* unary node use any one global unknown 29->29
        // function f1, with no injectivity or arithmetic restriction.
        // If f1(x) is required to equal two distinct known rune labels,
        // no possible hidden key/table can rescue the tree fold.
        const byUnaryInput = new Map();
        let knownUnaryPairs = 0;
        for (const node of addresses) {
          if (children[node].length !== 1 || labels[node] < 0) continue;
          const child = children[node][0];
          if (labels[child] < 0) continue;
          knownUnaryPairs++;
          const input = labels[child];
          if (!byUnaryInput.has(input)) byUnaryInput.set(input, new Set());
          byUnaryInput.get(input).add(labels[node]);
        }
        let inconsistentInputs = 0;
        let conflictingOutcomes = 0;
        for (const outputs of byUnaryInput.values()) {
          if (outputs.size > 1) inconsistentInputs++;
          conflictingOutcomes += outputs.size - 1;
        }
        allSecretUnary.push({
          internalOrder: name, reverseInternal,
          leafOrder, reverseClear, knownUnaryPairs,
          distinctUnaryInputs: byUnaryInput.size, inconsistentInputs,
          conflictingOutcomes
        });
      }
    }
  }
}

// Separate original-glyph register control: assume the tree directly
// reconstructs the 256 *visible* source runes on p55/p56/p57, requiring
// no guessed 76-runic plaintext and no p56 decryption as an input.
const visibleTerminal = [
  ...corpus.pages.find((page) => page.page === 55).indices,
  ...originalP56
];
assert.equal(visibleTerminal.length, 161);
const printedUnary = [];
for (const [internalOrder, naturalInternals] of Object.entries(internalOrders)) {
  for (const reverseInternal of [false, true]) {
    const internals = reverseInternal
      ? [...naturalInternals].reverse() : naturalInternals;
    for (const [leafOrder, leaves] of Object.entries(leafOrders)) {
      for (const reverseClear of [false, true]) {
        const labels = Array(256).fill(-1);
        for (let j = 0; j < 161; j++)
          labels[internals[j]] = visibleTerminal[j];
        for (let j = 0; j < 95; j++)
          labels[leaves[j]] = p57[reverseClear ? 94 - j : j];
        const byChildInput = new Map();
        let testedUnary = 0;
        for (const node of addresses) {
          if (children[node].length !== 1) continue;
          testedUnary++;
          const input = labels[children[node][0]];
          if (!byChildInput.has(input)) byChildInput.set(input, new Set());
          byChildInput.get(input).add(labels[node]);
        }
        assert.equal(testedUnary, 92);
        const contradictoryInputs = [...byChildInput.values()]
          .filter((set) => set.size > 1).length;
        printedUnary.push({internalOrder, reverseInternal,
          leafOrder, reverseClear, knownUnary: testedUnary,
          contradictoryInputs});
      }
    }
  }
}

// A stronger hypothetical nonstationary tree fold permits an entirely
// arbitrary 29->29 unary lookup *at each geometric level*. Two level
// clocks are pinned by the source tree: distance from the root, and
// maximum descendant distance from any original leaf. The latter is
// the natural literal "shed a circumference / move inward" peeling index.
const rootDepth = Array(256).fill(-1);
const leafHeight = Array(256).fill(-1);
/** @param {number} node @param {number} depth */
function assignDepth(node, depth) {
  rootDepth[node] = depth;
  let h = 0;
  for (const child of children[node]) {
    assignDepth(child, depth + 1);
    h = Math.max(h, leafHeight[child] + 1);
  }
  leafHeight[node] = h;
}
assignDepth(189, 0);
assert(Math.max(...rootDepth) === 38);
assert(Math.max(...leafHeight) === 38);
assert(rootDepth.every((x) => x >= 0 && x <= 38));
assert(leafHeight.every((x) => x >= 0 && x <= 38));
const printedPerLevel = [];
for (const [internalOrder, naturalInternals] of Object.entries(internalOrders)) {
  for (const reverseInternal of [false, true]) {
    const internals = reverseInternal
      ? [...naturalInternals].reverse() : naturalInternals;
    for (const [leafOrder, leaves] of Object.entries(leafOrders)) {
      for (const reverseClear of [false, true]) {
        const labels = Array(256).fill(-1);
        for (let j = 0; j < 161; j++)
          labels[internals[j]] = visibleTerminal[j];
        for (let j = 0; j < 95; j++)
          labels[leaves[j]] = p57[reverseClear ? 94 - j : j];

        const counts = {};
        for (const [levelClock, levels] of Object.entries({
          rootDepth, leafHeight
        })) {
          const byLevelAndInput = new Map();
          for (const node of addresses) {
            if (children[node].length !== 1) continue;
            const child = children[node][0];
            const key = levels[node] + '/' + labels[child];
            if (!byLevelAndInput.has(key))
              byLevelAndInput.set(key, new Set());
            byLevelAndInput.get(key).add(labels[node]);
          }
          const inconsistent = [...byLevelAndInput.values()]
            .filter((set) => set.size > 1).length;
          counts[levelClock] = {
            uniqueInputs: byLevelAndInput.size,
            contradictoryInputs: inconsistent
          };
        }
        printedPerLevel.push({internalOrder, reverseInternal,
          leafOrder, reverseClear, ...counts});
      }
    }
  }
}
assert.equal(printedPerLevel.length, 24);
const depthConflicts = printedPerLevel
  .map((x) => x.rootDepth.contradictoryInputs);
const heightConflicts = printedPerLevel
  .map((x) => x.leafHeight.contradictoryInputs);
assert.equal(Math.min(...depthConflicts), 4);
assert.equal(Math.max(...depthConflicts), 12);
assert.equal(Math.min(...heightConflicts), 8);
assert.equal(Math.max(...heightConflicts), 16);

assert.equal(printedUnary.length, 24);
assert.equal(Math.min(...printedUnary.map((x) => x.contradictoryInputs)), 20);
assert.equal(Math.max(...printedUnary.map((x) => x.contradictoryInputs)), 25);

assert.equal(symmetricLeafSet.length, 6);
assert.equal(allSecretUnary.length, 24);
assert(allSecretUnary.every((x) => x.inconsistentInputs >= 6));
assert.equal(Math.min(...allSecretUnary.map((x) => x.inconsistentInputs)), 6);
assert.equal(Math.max(...allSecretUnary.map((x) => x.inconsistentInputs)), 14);
assert.deepEqual(
  symmetricLeafSet.map((x) => x.inevitableErrors),
  [26, 19, 33, 29, 32, 30]
);

console.log(JSON.stringify({
  source: {cells: 256, root: 189, leaves: 95, internals: 161,
    p55Unknown: 76, p56Known: 85, p57Clear: 95},
  originalSolvedP56Forward: {runes: 85, recovered: true, keyConsumed: consumed},
  test: {leafOrders: Object.keys(leafOrders),
    internalOrders: Object.keys(internalOrders),
    primeWeights: 2, sourceDirections: 2, models: results.length,
    best, histogram, results},
  allSecret: {unary: allSecretUnary, symmetricLeafSet,
    printedUnary, printedPerLevel},
  decision: 'All 24 fixed parent-sum readers fail; all 24 unrestricted unary function folds are contradictory, and all six invariant leaf-set readers conflict with known p56. No unknown plaintext.'
}, null, 2));
