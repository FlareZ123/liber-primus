'use strict';

// Original LP2 p8 binary expansion source gate. Run: node sims/lp2_p8_binary_tree_expansion_gate_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {any} */
function resource(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
}

/** @param {number[]} values @returns {number[][]} */
function adjacentPairs(values) {
  return Array.from({ length: values.length / 2 }, (_, i) => [values[2 * i], values[2 * i + 1]]);
}

/** @param {number[]} values @returns {number[][]} */
function levelPairs(values) {
  const half = values.length / 2;
  return Array.from({ length: half }, (_, i) => [values[i], values[i + half]]);
}

/**
 * Every equal parent rune must emit an equal two-rune child pair,
 * independently of the unknown expansion lookup table.
 * @param {number[]} parents
 * @param {number[][]} pairs
 * @returns {boolean}
 */
function canBeStatelessExpansion(parents, pairs) {
  assert.equal(parents.length, pairs.length);
  const mapping = new Map();
  for (let i = 0; i < parents.length; i += 1) {
    const prior = mapping.get(parents[i]);
    const pair = pairs[i];
    if (prior && (prior[0] !== pair[0] || prior[1] !== pair[1])) return false;
    mapping.set(parents[i], pair);
  }
  return true;
}

const corpus = resource('lp2-corpus.json');
const ink = resource('lp2-ink-annotations.json');
const page = corpus.pages.find((record) => record.page === 8);
const annotation = ink.pages.find((record) => record.page === 8);
assert.ok(page && annotation, 'Original physical p8 must be present');
assert.equal(annotation.red_spans.length, 1);
const redSpan = annotation.red_spans[0];
assert.equal(redSpan.start, 0);
assert.equal(redSpan.length, 12);
const red = page.indices.slice(redSpan.start, redSpan.start + redSpan.length);
assert.equal(red.map((index) => corpus.runes[index]).join(''), redSpan.runes);
assert.equal(page.indices.length, 255);

const parents = red.slice(0, 4);
const children = red.slice(4, 12);
assert.deepEqual(parents, [14, 10, 14, 19]);
assert.deepEqual(children, [1, 14, 19, 5, 2, 13, 3, 17]);

for (const [name, pairs] of [['adjacent-sibling', adjacentPairs(children)], ['levelwise', levelPairs(children)]]) {
  const possible = canBeStatelessExpansion(parents, pairs);
  assert.equal(possible, false, `${name}: repeated X must have unequal observed descendants`);
  console.log(name, JSON.stringify(pairs), 'fixed stateless two-child expansion:', possible);
}

/**
 * Count any two distinct printed leaves with the desired parent-square
 * product, independent of their traversal order.
 * @param {number[]} leaves
 * @param {number} target
 * @param {number} modulus
 * @returns {number}
 */
function leafPairCount(leaves, target, modulus) {
  let count = 0;
  for (let i = 0; i < leaves.length; i += 1) {
    for (let j = i + 1; j < leaves.length; j += 1) {
      if ((leaves[i] * leaves[j]) % modulus === target) count += 1;
    }
  }
  return count;
}

// GF23 printed p7 DH modulus and p8 red aggregate product-square:
const gf23 = 23;
const productMod23 = (values) => values.reduce((n, v) => (n * v) % gf23, 1);
assert.equal(productMod23(parents), 3);
assert.equal(productMod23(children), 9);
assert.equal(productMod23(children), productMod23(parents) ** 2 % gf23);

// Stronger tree-gate: an arbitrary rearrangement of the eight leaves cannot
// make each parent branch into two child factors whose product is parent^2.
const targets = parents.map((parent) => parent ** 2 % gf23);
assert.deepEqual(targets, [12, 8, 12, 16]);
const feasibleLeafPairs = targets.map((target) => leafPairCount(children, target, gf23));
assert.deepEqual(feasibleLeafPairs, [0, 1, 0, 2]);
assert.equal(leafPairCount([1, 12], 12, gf23), 1, 'planted local-square positive control');
console.log('printed GF23 aggregate squared products:', [3, 9]);
console.log('per-parent square targets:', JSON.stringify(targets));
console.log('matching leaf pairs in ANY order:', JSON.stringify(feasibleLeafPairs));
console.log('all-order local multiplicative square expansion: IMPOSSIBLE, two parents have zero candidates');

// Positive control: a true fixed expansion must be accepted despite repeated parents.
const positive = parents.flatMap((value) => [(value + 1) % 29, (value + 2) % 29]);
assert.ok(canBeStatelessExpansion(parents, adjacentPairs(positive)));
console.log('positive stateless planted expansion: PASS');
console.log('p8 source 4=>8 stateless binary tree: REJECTED for both conventional source orders');
console.log('body cipher/key/state/traversal: NOT IDENTIFIED; no plaintext claim');
