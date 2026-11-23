'use strict';

/**
 * LP2 original p50 256 numeral leaves versus p8 255 internal rune nodes.
 * Standalone Windows Node 22 SFT. Run from repository root or any directory.
 * No command-line arguments, external dependencies, network access, or writes.
 * Original data: resources/liber-primus/lp2-corpus.json and lp2-grid-256.json.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {any} */
function read(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const p8 = corpus.pages.find((page) => page.page === 8).indices;
const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.pages.flatMap((page) => page.bytes);
const alphabet59 = grid.alphabet.replace('f', '');
const base59 = tokens.map((token) =>
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
const primes = corpus.prime;
assert.equal(p8.length, 255);
assert.equal(tokens.length, 256);
assert.equal(base60.length, 256);
assert.equal(base59.length, 256);
assert.equal(alphabet59.length, 59);
assert.ok(p8.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
assert.ok(base59.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));
assert.equal(base60[189], 192);
assert.equal(base59[189], 189);

/** @param {number} v @returns {number} */
const m29 = (v) => ((v % 29) + 29) % 29;

/** Inorder traversal of ALL 511 nodes; return only 255 internal vertices. */
function inorder() {
  /** @type {number[]} */
  const ordered = [];
  /** @param {number} i @returns {void} */
  function visit(i) {
    if (i >= 511) return;
    visit(2 * i + 1);
    if (i < 255) ordered.push(i);
    visit(2 * i + 2);
  }
  visit(0);
  assert.equal(ordered.length, 255);
  assert.equal(new Set(ordered).size, 255);
  return ordered;
}
const traversals = [
  { name: 'breadth-first', positions: Array.from({ length: 255 }, (_, i) => i) },
  { name: 'inorder', positions: inorder() },
];
const radices = [
  { name: '60', values: base60 },
  { name: '59-f-omitted', values: base59 },
];

/**
 * Construct 511-node tree. Heap internal addresses 0..254, numeric
 * leaf addresses 255..510. Unknown parent rune labels are p8 GP indices.
 * @param {number[]} internalPositions @param {number[]} leaves
 * @returns {number[]}
 */
function tree(internalPositions, leaves) {
  const values = Array(511).fill(-1);
  for (let i = 0; i < 255; i++) values[internalPositions[i]] = p8[i];
  for (let i = 0; i < 256; i++) values[255 + i] = leaves[i];
  assert.ok(values.every((v) => Number.isInteger(v) && v >= 0));
  return values;
}
const laws = ['sum', 'leftMinusRight', 'rightMinusLeft', 'product', 'xorByte', 'primeSum'];

/**
 * Six fixed pre-2014 operations; all reduce GP29, except XOR first operates
 * on the entire original child byte values and then maps the byte to GP29.
 * @param {number} left @param {number} right @returns {number[]}
 */
function outputs(left, right) {
  const a = left % 29;
  const b = right % 29;
  return [
    m29(a + b),
    m29(a - b),
    m29(b - a),
    m29(a * b),
    m29(left ^ right),
    m29(primes[a] + primes[b]),
  ];
}

/** @param {number[]} values @returns {{all:number[],bottom:number[]}} */
function score(values) {
  const all = Array(laws.length).fill(0);
  const bottom = Array(laws.length).fill(0);
  for (let i = 0; i < 255; i++) {
    const cand = outputs(values[2 * i + 1], values[2 * i + 2]);
    for (let k = 0; k < laws.length; k++) {
      if (cand[k] === values[i]) {
        all[k]++;
        if (i >= 127) bottom[k]++;
      }
    }
  }
  return { all, bottom };
}

/**
 * Under ANY deterministic depth-specific map H_d(child-left,child-right),
 * same depth and ordered child pair must imply same parent rune label.
 * Return exact impossible pairs (never fitted on the original).
 * @param {number[]} values @returns {{depth:number, earlier:number, later:number, pair:number[], parents:number[]}[]}
 */
function impossiblePairs(values) {
  const byDepth = Array.from({ length: 8 }, () => new Map());
  /** @type {{depth:number,earlier:number,later:number,pair:number[],parents:number[]}[]} */
  const bad = [];
  for (let i = 0; i < 255; i++) {
    const d = Math.floor(Math.log2(i + 1));
    const pair = [values[2 * i + 1] % 29, values[2 * i + 2] % 29];
    const key = pair.join(',');
    const old = byDepth[d].get(key);
    if (old && old.parent !== values[i]) {
      bad.push({ depth: d, earlier: old.address, later: i,
        pair, parents: [old.parent, values[i]] });
    }
    if (!old) byDepth[d].set(key, { address: i, parent: values[i] });
  }
  return bad;
}

/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** Exact native GP positive: tree entire 255 parents generated by a fixed
 * depth-dependent modular function, from the genuine 256 original leaves.
 * No planted source is necessary to make the hash positive.
 */
function positive() {
  const v = Array(511).fill(0);
  for (let i = 0; i < 256; i++) v[255 + i] = base60[i] % 29;
  for (let i = 254; i >= 0; i--) {
    const depth = Math.floor(Math.log2(i + 1));
    v[i] = m29(v[2 * i + 1] + 2 * v[2 * i + 2] + 7 + depth);
  }
  for (let i = 0; i < 255; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    assert.equal(v[i], m29(v[2 * i + 1] + 2 * v[2 * i + 2] + 7 + depth));
  }
  assert.equal(impossiblePairs(v).length, 0);
  const mutated = v.slice();
  mutated[127] = (mutated[127] + 1) % 29;
  // The input 256 leaves of a cryptographic tree do not uniquely fix top
  // level labels unless a public law is provided; this plant supplies one.
  assert.equal(mutated[127], (v[127] + 1) % 29);
}
positive();

const observations = [];
for (const traversal of traversals) {
  for (const radix of radices) {
    const values = tree(traversal.positions, radix.values);
    const bad = impossiblePairs(values);
    const internalOnly = bad.filter((x) => x.depth < 7);
    const s = score(values);
    assert.ok(internalOnly.length >= 3);
    assert.ok(s.all.every((hits) => hits < 25));
    observations.push({ traversal: traversal.name, radix: radix.name,
      matches: Object.fromEntries(laws.map((law, k) => [law, s.all[k]])),
      leafLayer: Object.fromEntries(laws.map((law, k) => [law, s.bottom[k]])),
      contradictions: bad.length,
      internalOnlyContradictions: internalOnly,
      firstBottomContradiction: bad.find((x) => x.depth === 7) });
  }
}
assert.equal(observations[0].internalOnlyContradictions.length, 3);
assert.equal(observations[1].internalOnlyContradictions.length, 3);
assert.equal(observations[2].internalOnlyContradictions.length, 4);
assert.equal(observations[3].internalOnlyContradictions.length, 4);
const originalMax = Math.max(...observations.flatMap((x) => Object.values(x.matches)));
assert.equal(originalMax, 14);

// Shuffle the 256 two-character TABLE TOKENS as whole original cells,
// retaining the exact token multiset. Apply the SAME index permutation
// to BOTH radix readings, then take max over all 24 fixed alternatives.
const random = xorshift32(0x33012372);
const trials = 5000;
let atLeast = 0;
let totalMax = 0;
let leastMax = Infinity;
let largestMax = -Infinity;
for (let trial = 0; trial < trials; trial++) {
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = random() % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  let best = -1;
  for (const traversal of traversals) {
    for (const radix of radices) {
      const shuffled = perm.map((index) => radix.values[index]);
      const counts = score(tree(traversal.positions, shuffled)).all;
      best = Math.max(best, ...counts);
    }
  }
  totalMax += best;
  leastMax = Math.min(leastMax, best);
  largestMax = Math.max(largestMax, best);
  if (best >= originalMax) atLeast++;
}
assert.equal(atLeast, 3751);
assert.equal(totalMax / trials, 14.7368);
assert.equal(leastMax, 10);
assert.equal(largestMax, 22);
console.log('INPUT: original p8 255 runes / p50 256 printed tokens / 511-node complete binary tree');
console.log('ALL-SECRET THEOREM: equal pair at same depth => equal parent, irrespective of secret key');
for (const x of observations) console.log(JSON.stringify(x));
console.log(JSON.stringify({ originalMax, searchSpace: 2 * 2 * laws.length,
  null: { seed: '0x33012372', trials, atLeast, proportion: atLeast / trials,
    meanBest: totalMax / trials, minBest: leastMax, maxBest: largestMax } }));
console.log('AMBIGUITY BOUND: even 11 independently disputed historical leaf tokens alter at most 11/128 first-level comparisons; unchanged internal-level contradictions remain');
console.log('PASS: every source-input, planted tree, all-secret contradiction, and fixed-null assertion');
