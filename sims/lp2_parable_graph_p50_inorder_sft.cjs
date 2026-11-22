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


/**
 * Independently visible alternative: use the table's literal printed-order
 * addresses within the 50 and five node branches rather than n-ary inorder.
 * Test the simplest page-entry/exit rune anchors against node and byte mod29.
 * Multiple interpretations must be charged together: no claim from one hit.
 */
const sortedBranch50 = closure(rev60, 82).sort((a, b) => a - b);
const sortedBranch5 = closure(rev60, 128).sort((a, b) => a - b);
const sortedPageNodes = [...sortedBranch50, 201, ...sortedBranch5, 74, 205];
assert.equal(sortedPageNodes.length, 58);
assert.deepEqual(sortedPageNodes.slice(50), [201, 24, 109, 119, 128, 184, 74, 205]);
/** @param {number[]} nodes @returns {number[]} */
function matchChannels(nodes) {
  const count = [0, 0, 0, 0];
  for (let p = 0; p < nodes.length; p++) {
    const runes = corpus.pages[p].indices;
    if (!runes.length) continue;
    const raw = nodes[p] % 29;
    const byte = values60[nodes[p]] % 29;
    if (runes[0] === raw) count[0]++;
    if (runes[0] === byte) count[1]++;
    if (runes[runes.length - 1] === raw) count[2]++;
    if (runes[runes.length - 1] === byte) count[3]++;
  }
  return count;
}
const observedAnchorMatches = matchChannels(sortedPageNodes);
assert.deepEqual(observedAnchorMatches, [6, 2, 1, 2]);
let seed = 0x33012014;
/** @returns {number} */
function prng() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {number[]} v */
function shuffle(v) {
  for (let i = v.length - 1; i > 0; i--) {
    const j = prng() % (i + 1);
    const saved = v[i];
    v[i] = v[j];
    v[j] = saved;
  }
}
const nullTrials = 100000;
let familyExceeds = 0, singleExceeds = 0;
for (let t = 0; t < nullTrials; t++) {
  const l = sortedBranch50.slice();
  const r = sortedBranch5.slice();
  shuffle(l);
  shuffle(r);
  const trial = matchChannels([...l, 201, ...r, 74, 205]);
  if (trial[0] >= observedAnchorMatches[0]) singleExceeds++;
  if (Math.max(...trial) >= Math.max(...observedAnchorMatches)) familyExceeds++;
}
assert.equal(singleExceeds, 693);
assert.equal(familyExceeds, 9091);

console.log(JSON.stringify({
  status: 'PASS: source graph structure, NOT a decrypted page',
  source: 'original LP2 grid256 and solved PARABLE prime ordinals [205,173,201]',
  base60Closure: [58,8,56],
  base59Closure: [1,10,1],
  page50BranchSizes: [50,1,5],
  remainingSolvedNodes: [74,205],
  fixedTraversal: 'first/lowest-numbered predecessor subtree, node, remaining predecessor subtrees ascending',
  candidatePageToCell: pageNodes,
  printedSortedCandidate: {lastEight: sortedPageNodes.slice(50), originalFirstLastRuneMatches: observedAnchorMatches, nullTrials, unadjustedFirstRuneExceed: singleExceeds, fourChannelFamilyMaxExceed: familyExceeds},
  visualTerminalDirectReadout: {
    pages: visualTerminals,
    nodes: terminalNodes,
    nodeGP29: asGp(terminalNodes),
    outgoingByteGP29: asGp(terminalBytes)
  },
  scientificStatus: 'Post-discovery structural fit; no sourced traversal opcode, page key, cipher, or plaintext.'
}, null, 2));
