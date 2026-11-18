'use strict';

/**
 * Source-exact p57 EMERGE to p50 pointer-graph closure.
 * Run: node sims/lp2_p27_dh23_emerge_pointer_closure_sft.cjs
 *
 * This tests one frozen continuation of the already established p27/DH23
 * navigation candidate. It does not search keys and does not score plaintext.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name */
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));
}

/** @param {string[]} tokens @param {string} alphabet */
function decode(tokens, alphabet) {
  return tokens.map((token) =>
    alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]));
}

/** @param {number[]} map @param {number} start @param {number} root */
function pathToRoot(map, start, root) {
  const nodes = [start];
  const seen = new Set([start]);
  let at = start;
  while (at !== root) {
    at = map[at];
    assert(!seen.has(at), `cycle before root from ${start}: repeated ${at}`);
    seen.add(at);
    nodes.push(at);
    assert(nodes.length <= map.length + 1);
  }
  return nodes;
}

/** @param {number[]} map @param {number} start */
function orbit(map, start) {
  const nodes = [];
  const seen = new Map();
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, nodes.length);
    nodes.push(at);
    at = map[at];
    assert(nodes.length <= map.length + 1);
  }
  return {
    nodes,
    repeated: at,
    prefix: seen.get(at),
    period: nodes.length - seen.get(at),
  };
}

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/base60-grid.json');
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert(tokens.every((token) =>
  token.length === 2 && [...token].every((ch) => alphabet59.includes(ch))));

const map59 = decode(tokens, alphabet59);
const map60 = decode(tokens, alphabet60);
assert(map59.every((value) => value >= 0 && value < 256));
assert(map60.every((value) => value >= 0 && value < 256));

const root = 189;
assert.equal(map59[root], root);
for (let start = 0; start < 256; start++) {
  pathToRoot(map59, start, root);
}

// The signed 2013 worked DH example, already used by the upstream route.
const dh = {
  modulus: 23,
  generator: 5,
  serverPublic: 8,
  clientPublic: 19,
  shared: 2,
  serverSecret: 6,
};
assert.deepEqual([Math.floor(root / 8), root % 8], [dh.modulus, dh.generator]);

// Reproduce the pre-existing base59 path from MUST=186 to the root.
// Its first hop is the signed client public 19 and its total distance is
// the signed server public 8.
const mustPath = pathToRoot(map59, 186, root);
assert.deepEqual(mustPath, [186, 19, 33, 112, 72, 161, 214, 247, 189]);
assert.equal(mustPath[1], dh.clientPublic);
assert.equal(mustPath.length - 1, dh.serverPublic);

// Parse the exact solved p57 words from the canonical 95-rune source page.
const names = [
  'PARABLE', 'LIKE', 'THE', 'INSTAR', 'TUNNELING', 'TO', 'THE',
  'SURFACE', 'WE', 'MUST', 'SHED', 'OUR', 'OWN', 'CIRCUMFERENCES',
  'FIND', 'THE', 'DIVINITY', 'WITHIN', 'AND', 'EMERGE',
];
const runeLengths = [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6];
assert.equal(runeLengths.reduce((sum, n) => sum + n, 0), 95);

const page57 = corpus.pages.find((page) => page.page === 57);
assert(page57);
assert.equal(page57.runic_count, 95);

let offset = 0;
const words = names.map((name, i) => {
  const runes = page57.indices.slice(offset, offset + runeLengths[i]);
  offset += runeLengths[i];
  const primeSum = runes.reduce((sum, rune) => sum + corpus.prime[rune], 0);
  return {position: i + 1, name, primeSum, address: primeSum % 256};
});
assert.equal(offset, 95);

const byName = Object.fromEntries(words.map((word) => [word.name + ':' + word.position, word]));
assert.equal(byName['THE:16'].primeSum, 72);
assert.equal(byName['MUST:10'].primeSum, 186);
assert.equal(byName['EMERGE:20'].primeSum, 300);

// New frozen closure: the already selected EMERGE sum 300 is addressed into
// the literal 256-cell table by its unique residue 44.
const emerge = byName['EMERGE:20'];
assert.equal(emerge.address, 44);
const emergePath = pathToRoot(map59, emerge.address, root);
assert.deepEqual(emergePath, [44, 226, 72, 161, 214, 247, 189]);

// The total path length is the independent server secret 6.
assert.equal(emergePath.length - 1, dh.serverSecret);

// The EMERGE branch joins the established MUST path after the independent
// shared value 2 pointer steps, at address72, which is GP-prime(THE).
const merge = emergePath.find((node) => mustPath.includes(node));
assert.equal(merge, 72);
assert.equal(emergePath.indexOf(merge), dh.shared);
assert.equal(merge, byName['THE:16'].primeSum);

// The merge leaves the exact common tail already present in the MUST path.
assert.deepEqual(
  emergePath.slice(emergePath.indexOf(merge)),
  mustPath.slice(mustPath.indexOf(merge)),
);

// Fixed-graph discrimination. Exactly 11 of the 256 source addresses lie six
// edges from the root, and among the 20 printed p57 words EMERGE is the only
// word whose prime-sum residue selects one of those depth-six addresses.
const depths = Array.from({length: 256}, (_, start) =>
  pathToRoot(map59, start, root).length - 1);
const depthSixAddresses = depths.flatMap((depth, address) =>
  depth === dh.serverSecret ? [address] : []);
assert.deepEqual(depthSixAddresses, [26, 33, 44, 76, 84, 100, 147, 208, 212, 239, 251]);
const p57DepthSix = words.filter((word) => depths[word.address] === dh.serverSecret);
assert.deepEqual(p57DepthSix.map((word) => [word.position, word.name, word.primeSum, word.address]),
  [[20, 'EMERGE', 300, 44]]);

// Conventional base60 does not reproduce the closure. Address44 enters an
// 11-cycle and never reaches the base59 DH root.
const base60Orbit = orbit(map60, emerge.address);
assert.equal(base60Orbit.repeated, 115);
assert.equal(base60Orbit.prefix, 9);
assert.equal(base60Orbit.period, 11);
assert(!base60Orbit.nodes.includes(root));

process.stdout.write(JSON.stringify({
  status: 'source-constrained navigation closure; NO UNKNOWN PLAINTEXT',
  emerge: {
    primeSum: emerge.primeSum,
    tableAddressModulo256: emerge.address,
    path: emergePath,
    edgesToDhRoot: emergePath.length - 1,
  },
  merge: {
    afterEdges: emergePath.indexOf(merge),
    address: merge,
    p57Word: 'THE',
    gpPrimeSum: byName['THE:16'].primeSum,
  },
  dhRoot: {
    address: root,
    row: Math.floor(root / 8),
    column: root % 8,
    signedTuple: dh,
  },
  mustPath,
  fixedGraphControl: {
    depthSixAddresses,
    p57WordsAtDepthSix: p57DepthSix.map((word) => word.name),
    fixedAddressFraction: depthSixAddresses.length / 256,
  },
  base60Control: {
    start: emerge.address,
    prefix: base60Orbit.prefix,
    period: base60Orbit.period,
    repeated: base60Orbit.repeated,
  },
}, null, 2) + '\n');
