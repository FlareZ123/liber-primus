'use strict';

/**
 * Reversible Prüfer encoding of the 256-cell LP2 table under its provisional
 * f-omitting base-59 alphabet.
 *
 * Original source: resources/liber-primus/lp2-grid-256.json.
 * This is an exploratory tree-code and p55 key test, not a claimed decryption.
 *
 * Run: node sims/lp2_base59_rooted_tree_prufer_sft.cjs
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(dir, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(dir, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

const SIZE = 256;
const ROOT = 189;
const MOD = 29;
const RADIX59 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.replace('f', '');

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** @param {readonly string[]} tokens @returns {number[]} */
function readBase59(tokens) {
  assert.equal(tokens.length, SIZE);
  assert.equal(RADIX59.length, 59);
  return tokens.map((token) => {
    assert.equal(token.length, 2);
    const a = RADIX59.indexOf(token[0]);
    const b = RADIX59.indexOf(token[1]);
    assert.ok(a >= 0 && b >= 0, 'unexpected printed numeral');
    const value = 59 * a + b;
    assert.ok(value >= 0 && value < SIZE, 'table value is not a byte address');
    return value;
  });
}

/** @param {readonly number[]} parent @returns {number[][]} */
function originalEdges(parent) {
  assert.equal(parent.length, SIZE);
  assert.equal(parent[ROOT], ROOT);
  const edges = [];
  for (let i = 0; i < SIZE; i++) {
    const visited = new Set();
    let node = i;
    while (node !== ROOT) {
      assert.ok(!visited.has(node), 'non-root directed cycle');
      visited.add(node);
      node = parent[node];
    }
    if (i !== ROOT) edges.push([i, parent[i]]);
  }
  assert.equal(edges.length, SIZE - 1);
  return edges;
}

/**
 * Smallest-leaf-first canonical Prüfer code of a labeled undirected tree.
 * @param {readonly number[][]} edges
 * @param {number} n
 * @returns {number[]}
 */
function encodePrufer(edges, n) {
  const neighbors = Array.from({ length: n }, () => []);
  const degrees = Array(n).fill(0);
  for (const [u, v] of edges) {
    neighbors[u].push(v);
    neighbors[v].push(u);
    degrees[u]++;
    degrees[v]++;
  }
  const code = [];
  for (let step = 0; step < n - 2; step++) {
    const leaf = degrees.indexOf(1);
    assert.ok(leaf >= 0);
    const next = neighbors[leaf].find((v) => degrees[v] > 0);
    assert.ok(next !== undefined);
    code.push(next);
    degrees[leaf] = 0;
    degrees[next]--;
  }
  assert.equal(degrees.filter((degree) => degree === 1).length, 2);
  return code;
}

/**
 * Standard canonical inverse; outputs the complete undirected tree.
 * @param {readonly number[]} code
 * @returns {number[][]}
 */
function decodePrufer(code) {
  const n = code.length + 2;
  const degree = Array(n).fill(1);
  for (const v of code) {
    assert.ok(Number.isInteger(v) && v >= 0 && v < n);
    degree[v]++;
  }
  const edges = [];
  for (const v of code) {
    const leaf = degree.indexOf(1);
    assert.ok(leaf >= 0);
    edges.push([leaf, v]);
    degree[leaf]--;
    degree[v]--;
  }
  const remain = degree.flatMap((d, i) => d === 1 ? [i] : []);
  assert.equal(remain.length, 2);
  edges.push(remain);
  return edges;
}

/**
 * Orient the undirected tree outward from the unique source root.
 * @param {readonly number[][]} edges
 * @param {number} n
 * @param {number} root
 * @returns {number[]}
 */
function orientParent(edges, n, root) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const parent = Array(n).fill(-1);
  parent[root] = root;
  const queue = [root];
  for (let j = 0; j < queue.length; j++) {
    const u = queue[j];
    for (const v of adj[u]) {
      if (parent[v] >= 0) continue;
      parent[v] = u;
      queue.push(v);
    }
  }
  assert.equal(queue.length, n);
  return parent;
}

/** @param {readonly number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(MOD).fill(0);
  for (const v of values) {
    assert.ok(Number.isInteger(v) && v >= 0 && v < MOD);
    counts[v]++;
  }
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {readonly number[]} values @returns {string} */
function romanize(values) {
  return values.map((v) => corpus.translit[v]).join('');
}

const tokens = grid.pages.flatMap((page) => page.tokens);
const parent = readBase59(tokens);
const edges = originalEdges(parent);
const code = encodePrufer(edges, SIZE);
assert.equal(code.length, SIZE - 2);
const recoveredParent = orientParent(decodePrufer(code), SIZE, ROOT);
assert.deepEqual(recoveredParent, parent, 'all 256 original base59 pointers must reconstruct');
assert.deepEqual(encodePrufer(decodePrufer(code), SIZE), code, 'Prüfer inverse');

const keys = code.map((value) => value % MOD);
const cipher55 = corpus.pages[55].indices;
assert.equal(cipher55.length, 76);
const solved57 = corpus.pages[57].indices;
assert.equal(solved57.length, 95);

// Independently known, original clear text: plant a reversible key model.
const positivePlain = solved57.slice(0, 76);
const planted = positivePlain.map((value, i) => mod(value + keys[i]));
const recoveredPlant = planted.map((value, i) => mod(value - keys[i]));
assert.deepEqual(recoveredPlant, positivePlain);

const direct = [-1, 1].map((sign) => {
  const output = cipher55.map((value, i) => mod(value + sign * keys[i]));
  const restored = output.map((value, i) => mod(value - sign * keys[i]));
  assert.deepEqual(restored, cipher55);
  return { sign, ioc: ioc(output), latin: romanize(output) };
});

const bytes = Buffer.from(code);
const digest = crypto.createHash('sha256').update(bytes).digest('hex');
const printable = code.filter((value) => value >= 32 && value < 127).length;
let maxPrintableRun = 0;
let currentRun = 0;
for (const value of code) {
  if (value >= 32 && value < 127) {
    currentRun++;
    maxPrintableRun = Math.max(maxPrintableRun, currentRun);
  } else {
    currentRun = 0;
  }
}

console.log(JSON.stringify({
  source: 'original LP2 32x8 printed table, provisional base59 without lowercase f',
  root: ROOT,
  vertices: SIZE,
  edgeCount: edges.length,
  pruferLength: code.length,
  pruferSha256: digest,
  first32Hex: bytes.subarray(0, 32).toString('hex'),
  printableBytes: printable,
  maxPrintableRun,
  p55CipherIoc: ioc(cipher55),
  p55PrueferKeyOutputs: direct,
  solvedP57Positive: '76/76 recovered exactly',
  reconstructedOriginalParentEntries: recoveredParent.length,
}, null, 2));
