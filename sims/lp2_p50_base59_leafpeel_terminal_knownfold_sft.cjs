'use strict';

/** 
 * Source-locked single-file test for breadth-first leaf-peel of LP2's 256-cell base59 tree.
 * Reads only canonical resources and never writes research files.
 * Run with Node.js 22 on Windows 11 from the repository root.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const grid = read('resources/liber-primus/lp2-grid-256.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const digits = grid.alphabet.replace('f', '');
const tokens = grid.pages.flatMap((p) => p.tokens);
const parent = tokens.map((s) => digits.indexOf(s[0]) * 59 + digits.indexOf(s[1]));
assert.equal(digits.length, 59);
assert.equal(tokens.length, 256);
assert(parent.every((x) => x >= 0 && x < 256));

const children = Array.from({ length: 256 }, () => []);
parent.forEach((p, i) => { if (p !== i) children[p].push(i); });
const remainder = new Set(parent.map((_, i) => i));
const layers = [];
while (remainder.size > 0) {
  const leaf = [...remainder].filter((i) => children[i].every((k) => !remainder.has(k))).sort((a, b) => a - b);
  assert(leaf.length > 0, 'This map has a cycle outside its unique fixed point');
  layers.push(leaf);
  leaf.forEach((i) => remainder.delete(i));
}
assert.deepEqual(layers.slice(0, 5).map((x) => x.length), [95, 38, 21, 14, 10]);
assert.equal(layers.length, 39);
assert.deepEqual(layers.at(-1), [189]);
assert.equal(layers[0].length + layers[1].length, 133);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
const prime = corpus.prime;
assert.equal(prime.length, 29);

/**
 * Exhaustively check all previous child-sum -> parent-label observations.
 * Per-depth hidden functions are unrestricted 29-to-29 maps.
 * @param {number[][]} layersByOrder
 * @param {number[]} suppliedLeafText
 * @param {number[]} suppliedMiddleText
 * @param {(index:number)=>number} convert
 * @returns {{pairs:number, conflicts:number, firstConflict:object|null, distinctKeys:number}}
 */
function testKnown(layersByOrder, suppliedLeafText, suppliedMiddleText, convert) {
  const order = layersByOrder.flat();
  const value = new Array(256).fill(null);
  for (let i = 0; i < 95; i++) value[order[i]] = convert(suppliedLeafText[i]);
  for (let i = 0; i < 85; i++) value[order[i + 95]] = convert(suppliedMiddleText[i]);

  const lookup = new Map();
  let pairs = 0, conflicts = 0, firstConflict = null;
  for (let d = 1; d < layers.length; d++) {
    for (const node of layers[d]) {
      const observed = value[node];
      if (observed === null || children[node].some((k) => value[k] === null)) continue;
      const input = children[node].reduce((sum, k) => sum + value[k], 0) % 29;
      const key = d + ':' + input;
      const old = lookup.get(key);
      pairs++;
      if (old === undefined) lookup.set(key, observed);
      else if (old !== observed) {
        conflicts++;
        if (firstConflict === null) firstConflict = { depth: d, input, expected: old, actual: observed, node };
      }
    }
  }
  return { pairs, conflicts, firstConflict, distinctKeys: lookup.size };
}

const physical = (p) => corpus.pages[p].indices;
const orientations = [];
for (const reverseLayer of [false, true]) {
  const oriented = layers.map((layer) => reverseLayer ? [...layer].reverse() : [...layer]);
  for (const reverseLeafText of [false, true]) {
    const leaf = reverseLeafText ? [...physical(57)].reverse() : physical(57);
    for (const reverseMiddleText of [false, true]) {
      const middle = reverseMiddleText ? [...physical(56)].reverse() : physical(56);
      for (const asPrime of [false, true]) {
        const result = testKnown(oriented, leaf, middle, (x) => asPrime ? prime[x] % 29 : x);
        orientations.push({ reverseLayer, reverseLeafText, reverseMiddleText, asPrime, ...result });
      }
    }
  }
}
assert.equal(orientations.length, 16);
assert(orientations.every((x) => x.pairs === 85));
const counts = orientations.map((x) => x.conflicts).sort((a, b) => a - b);
assert.equal(counts[0], 23);
assert.equal(counts.at(-1), 37);
console.log('Original table: 256 cells; base59 unique rooted tree; 39 leaf-removal layers.');
console.log('Leaf-peel layers:', layers.map((x) => x.length).join(','));
console.log('HTML-title-sized first two layers:', layers[0].length, '+', layers[1].length, '= 133');
console.log('Original p57/p56 known-only all-secret per-depth necessary condition:');
for (const candidate of orientations) console.log(JSON.stringify(candidate));
console.log('Conflicting observations per 85 independently solved p56 runes: min', counts[0], 'max', counts.at(-1));

/** Independently generated reversible positive with actual solved p57 runes as leaves. */
const generated = new Array(256).fill(null);
for (let i = 0; i < 95; i++) generated[layers[0][i]] = physical(57)[i];
for (let d = 1; d < layers.length; d++) {
  for (const node of layers[d]) {
    const sum = children[node].reduce((total, k) => total + generated[k], 0) % 29;
    generated[node] = (17 * sum + 3 * d + 2) % 29;
  }
}
assert(generated.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
const ordered = layers.flat();
const positive = testKnown(layers, physical(57), ordered.slice(95, 180).map((v) => generated[v]), (x) => x);
assert.equal(positive.conflicts, 0);
assert.equal(positive.pairs, 85);
for (let d = 1; d < layers.length; d++) {
  for (const node of layers[d]) {
    const sum = children[node].reduce((total, k) => total + generated[k], 0) % 29;
    assert.equal(generated[node], (17 * sum + 3 * d + 2) % 29);
  }
}
console.log('Positive source-leaf plant: 256 / 256 full source-tree forward checks; 85 / 85 known-middle lookup constraints PASS.');
console.log('DECISION: all 16 frozen source-natural source-end breadth-first leaf-peel fold hypotheses fail; no unknown plaintext or key recovered.');
