'use strict';

/**
 * Reproduce the fixed p57 prime-ordinal201 p50 functional-graph ancestry,
 * its 50|root|5 branch split, and a seeded original-token-multiset null.
 *
 * SFT: node sims/lp2_parable_root201_page50_split_sft.cjs
 * All inputs are canonical repository resources; no network access is used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'
));
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const tokens = grid.pages.flatMap((page) => page.tokens);
const radixAlphabet = grid.alphabet;
const original = tokens.map((token) =>
  60 * radixAlphabet.indexOf(token[0]) + radixAlphabet.indexOf(token[1])
);
assert.equal(original.length, 256);
assert.ok(original.every((value) => Number.isInteger(value) && value >= 0 && value < 256));

/**
 * @param {number[]} successors - Complete 256-node next-address table.
 * @param {number} root - Fixed, first-party-clause-selected address.
 * @returns {{total:number,children:number[],sizes:number[],members:number[]}}
 */
function ancestry(successors, root) {
  /** @type {number[][]} */
  const prior = Array.from({ length: 256 }, () => []);
  for (let i = 0; i < 256; i += 1) prior[successors[i]].push(i);

  /**
   * @param {number} start
   * @param {boolean} blockRoot
   * @returns {number[]}
   */
  function closure(start, blockRoot) {
    const seen = new Uint8Array(256);
    if (blockRoot) seen[root] = 1;
    seen[start] = 1;
    const queue = [start];
    for (let head = 0; head < queue.length; head += 1) {
      for (const predecessor of prior[queue[head]]) {
        if (!seen[predecessor]) {
          seen[predecessor] = 1;
          queue.push(predecessor);
        }
      }
    }
    return queue;
  }

  const members = closure(root, false).sort((a, b) => a - b);
  const children = prior[root].filter((node) => node !== root);
  const sizes = children.map((node) => closure(node, true).length);
  return { total: members.length, children, sizes, members };
}

const root = ancestry(original, 201);
const rival = ancestry(original, 20);
assert.deepEqual(root.children, [82, 128]);
assert.deepEqual(root.sizes, [50, 5]);
assert.equal(root.total, 56);
assert.equal(tokens[82], '3L');
assert.equal(tokens[128], '3L');
assert.equal(tokens[201], '1E');
assert.equal(original[82], 201);
assert.equal(original[128], 201);
assert.equal(original[201], 74);
assert.equal(original[74], 205);
assert.equal(rival.total, 56);
assert.deepEqual(rival.sizes, [55]);
assert.equal(rival.members.filter((node) => root.members.includes(node)).length, 0);
const secondBranch = ancestry(original, 128).members.filter((node) => root.members.includes(node));
assert.deepEqual(secondBranch, [24, 109, 119, 128, 184]);
assert.equal(corpus.pages.find((page) => page.page === 50).runic_count, 0);
assert.equal(corpus.pages.filter((page) => page.page >= 0 && page.page < 50).length, 50);
assert.equal(corpus.pages.filter((page) => page.page > 50 && page.page <= 55).length, 5);

/** Deterministic xorshift32; seed fixed before this report. */
let seed = 0x33012014;
/** @returns {number} Uniform 32-bit fraction generated from local seed. */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const shuffled = original.slice();
const counts = { size56: 0, splitUnordered: 0, splitOrdered: 0 };
const trials = 100000;
for (let trial = 0; trial < trials; trial += 1) {
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const snapshot = ancestry(shuffled, 201);
  if (snapshot.total !== 56) continue;
  counts.size56 += 1;
  if (snapshot.sizes.length !== 2) continue;
  if (snapshot.sizes[0] === 50 && snapshot.sizes[1] === 5) {
    counts.splitOrdered += 1;
    counts.splitUnordered += 1;
  } else if (snapshot.sizes[0] === 5 && snapshot.sizes[1] === 50) {
    counts.splitUnordered += 1;
  }
}
assert.deepEqual(counts, { size56: 232, splitUnordered: 9, splitOrdered: 6 });
console.log(JSON.stringify({
  root: 201,
  observed: { total: root.total, children: root.children, sizes: root.sizes },
  rival20: { total: rival.total, sizes: rival.sizes },
  trials, seedStart: '0x33012014', counts
}, null, 2));
console.log('PASS: exact source partition, rival closure, and deterministic fixed-multiset control');
