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
console.log(JSON.stringify({
  source: {cells: 256, root: 189, leaves: 95, internals: 161,
    p55Unknown: 76, p56Known: 85, p57Clear: 95},
  originalSolvedP56Forward: {runes: 85, recovered: true, keyConsumed: consumed},
  test: {leafOrders: Object.keys(leafOrders),
    internalOrders: Object.keys(internalOrders),
    primeWeights: 2, sourceDirections: 2, models: results.length,
    best, histogram, results},
  decision: '0/24 source-natural reconstructions match authentic p56; no p55 plaintext can be claimed.'
}, null, 2));
