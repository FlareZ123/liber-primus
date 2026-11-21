/**
 * Original LP2 PARABLE-addressed functional graph: p50-centered 58-page ordering.
 * This is a structural and source-selection gate, not an original-cipher decoder.
 * Single-file test: node sims/lp2_parable_graph_p50_inorder_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const tokens = grid.pages.flatMap((p) => p.tokens);
const digits60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const digits59 = digits60.replace('f', '');
assert.equal(tokens.length, 256);
assert.equal(digits60.length, 60);
assert.equal(digits59.length, 59);

/** @param {string[]} words @param {string} digits @returns {number[]} */
function parseTokens(words, digits) {
  return words.map((token) => {
    assert.equal(token.length, 2);
    const hi = digits.indexOf(token[0]);
    const lo = digits.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, 'unrecognized token ' + token);
    return digits.length * hi + lo;
  });
}

/** @param {number[]} values @returns {number[][]} */
function reverseEdges(values) {
  const result = Array.from({ length: 256 }, () => []);
  values.forEach((value, source) => {
    assert.ok(value >= 0 && value < 256);
    result[value].push(source);
  });
  return result;
}

/** @param {number[][]} rev @param {number} start @returns {number[]} */
function closure(rev, start) {
  const seen = new Set([start]);
  const order = [start];
  for (let i = 0; i < order.length; i++) {
    for (const child of rev[order[i]]) {
      if (seen.has(child)) continue;
      seen.add(child);
      order.push(child);
    }
  }
  return order;
}

/**
 * A deliberately fixed, candidate n-ary inorder rule: visit the lowest-numbered
 * predecessor's subtree, visit the current node, then visit other predecessor
 * subtrees in ascending address order. Unary children are visited before parent.
 * @param {number[][]} rev @param {number} rootNode @returns {number[]}
 */
function firstChildInorder(rev, rootNode) {
  const visited = new Set();
  const output = [];
  /** @param {number} node */
  function visit(node) {
    if (visited.has(node)) return;
    visited.add(node);
    const children = rev[node].slice().sort((a, b) => a - b);
    if (children.length) visit(children[0]);
    output.push(node);
    for (const child of children.slice(1)) visit(child);
  }
  visit(rootNode);
  return output;
}

const values60 = parseTokens(tokens, digits60);
const values59 = parseTokens(tokens, digits59);
assert.deepEqual(values60, grid.bytes);
const rev60 = reverseEdges(values60);
const rev59 = reverseEdges(values59);
assert.deepEqual([205, 173, 201].map((n) => closure(rev60, n).length), [58, 8, 56]);
assert.deepEqual([205, 173, 201].map((n) => closure(rev59, n).length), [1, 10, 1]);

// Under the source-selected base60 graph, the 56-node root's two immediate
// predecessor branches have precisely 50 and five nodes.
assert.deepEqual(rev60[201], [82, 128]);
const branches = rev60[201].map((node) => ({ node, size: closure(rev60, node).length }));
assert.deepEqual(branches, [{ node: 82, size: 50 }, { node: 128, size: 5 }]);
assert.equal(1 + branches.reduce((sum, x) => sum + x.size, 0), 56);

// The two other nodes of the 58-node source-rooted closure are 74 and 205.
const interior = new Set(closure(rev60, 201));
const outer = closure(rev60, 205).filter((node) => !interior.has(node)).sort((a, b) => a - b);
assert.deepEqual(outer, [74, 205]);
assert.deepEqual([values60[201], values60[74]], [74, 205]);
assert.deepEqual([rev60[74], rev60[205]], [[201], [74]]);
assert.deepEqual(rev60[20], [125]);
assert.equal(closure(rev60, 20).length, 56);

// With a fixed *provisional* n-ary inorder convention, the 58 source nodes
// occupy the original 58 physical-page slots and put the table node at p50.
const pageNodes = firstChildInorder(rev60, 205);
assert.equal(new Set(pageNodes).size, 58);
assert.equal(pageNodes.length, corpus.pages.length);
assert.deepEqual(pageNodes.slice(50), [201, 24, 109, 184, 119, 128, 74, 205]);
assert.deepEqual(pageNodes.slice(0, 3), [43, 73, 244]);
assert.equal(pageNodes[49], 163);
assert.equal(pageNodes[50], 201);
assert.equal(pageNodes[55], 128);
assert.equal(pageNodes[56], 74);
assert.equal(pageNodes[57], 205);
assert.equal(corpus.pages[50].runic_count, 0);
assert.deepEqual(corpus.pages.slice(56).map((p) => p.runic_count), [85, 95]);

// A direct GP29 readout of the nine printed visual-section terminal pages is
// nonlinguistic. It does not validate the proposed node-to-page assignment.
const visualTerminals = [2, 7, 14, 22, 26, 32, 39, 53, 55];
const terminalNodes = visualTerminals.map((i) => pageNodes[i]);
const terminalBytes = terminalNodes.map((n) => values60[n]);
const asGp = (numbers) => numbers.map((n) => corpus.translit[n % 29]).join('');
assert.equal(asGp(terminalNodes), 'EOEALOETJIEO');
assert.equal(asGp(terminalBytes), 'OEXESUUMEOIA');

console.log(JSON.stringify({
  status: 'PASS: source graph structure, NOT a decrypted page',
  source: 'original LP2 grid256 and solved PARABLE prime ordinals [205,173,201]',
  base60Closure: [58,8,56],
  base59Closure: [1,10,1],
  page50BranchSizes: [50,1,5],
  remainingSolvedNodes: [74,205],
  fixedTraversal: 'first/lowest-numbered predecessor subtree, node, remaining predecessor subtrees ascending',
  candidatePageToCell: pageNodes,
  visualTerminalDirectReadout: {
    pages: visualTerminals,
    nodes: terminalNodes,
    nodeGP29: asGp(terminalNodes),
    outgoingByteGP29: asGp(terminalBytes)
  },
  scientificStatus: 'Post-discovery structural fit; no sourced traversal opcode, page key, cipher, or plaintext.'
}, null, 2));
