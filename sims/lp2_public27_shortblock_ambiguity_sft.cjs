'use strict';

/**
 * Original-source SFT for the public November-2026 LP2 27x27 route.
 * Enumerates all geometrically eligible source-key nodes and every possible
 * two-rune plaintext against the 729 authentic original ciphertext cells.
 * Only finite geometry and two-rune ambiguity are evaluated. This does not
 * assert an unknown-page plaintext or a historical encryption key.
 *
 * Run: node sims/lp2_public27_shortblock_ambiguity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = data.pages.filter((page) => page.page <= 2);
assert.deepEqual(pages.map((page) => page.indices.length), [262, 266, 201]);
const matrix = pages.flatMap((page) => page.indices);
assert.equal(matrix.length, 729);

/** @param {number} r Zero-based row @param {number} c Zero-based column */
function at(r, c) { return matrix[r * 27 + c]; }

/** @param {number} n Positive integer @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n, factor = 2, rest = n;
  while (factor * factor <= rest) {
    if (rest % factor === 0) {
      result -= result / factor;
      while (rest % factor === 0) rest /= factor;
    }
    factor++;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} n Positive integer @returns {-1|0|1} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let factors = 0, rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    rest /= p;
    factors++;
    if (rest % p === 0) return 0;
    while (rest % p === 0) rest /= p;
  }
  if (rest > 1) factors++;
  return factors % 2 === 0 ? 1 : -1;
}

/**
 * This study begins after the independently committed original-cell coverage
 * audit in sims/lp2_public27_original_cell_conflicts_sft.cjs. The published
 * 38-block manifest is intentionally not duplicated here. The test below asks
 * a different question: what does the proposed three-rune rule constrain when
 * both the source node and the two-rune ciphertext position are unselected?
 */

/** Count keys by their first two aligned GP29 indices. */
const prefixCounts = new Int32Array(29 * 29);
let geometricNodes = 0, nodeModes = 0;
const axes = [[0, 1], [1, 0], [1, 1], [1, -1]];
for (let r = 0; r < 27; r++) for (let c = 0; c < 27; c++) {
  for (const [dr, dc] of axes) for (let h = 1; h <= 13; h++) {
    const r1 = r - dr * h, c1 = c - dc * h;
    const r3 = r + dr * h, c3 = c + dc * h;
    if (Math.min(r1, c1, r3, c3) < 0 ||
        Math.max(r1, c1, r3, c3) >= 27) continue;
    const original = [at(r1, c1), at(r, c), at(r3, c3)];
    if (original.includes(0)) continue; // documented phi/Mobius demands 1..28
    geometricNodes++;
    for (const centerTransformed of [false, true]) {
      const key = original.slice();
      if (centerTransformed) key[1] = phi(key[1]);
      const phase = ((key.reduce((sum, v) => sum + mu(phi(v)), 0) % 3) + 3) % 3;
      const aligned = key.slice(phase).concat(key.slice(0, phase));
      prefixCounts[29 * aligned[0] + aligned[1]]++;
      nodeModes++;
    }
  }
}
assert.equal(geometricNodes, 13012);
assert.equal(nodeModes, 26024);
assert.equal(prefixCounts.filter((v) => v !== 0).length, 784);
for (let a = 1; a < 29; a++) for (let b = 1; b < 29; b++) {
  assert.ok(prefixCounts[a * 29 + b] > 0);
}

/** All 8 directed immediate-neighbor readings in the 27x27 source matrix. */
const neighborPairs = [];
for (let r = 0; r < 27; r++) for (let c = 0; c < 27; c++) {
  for (const [dr, dc] of [...axes, ...axes.map(([x, y]) => [-x, -y])]) {
    const rr = r + dr, cc = c + dc;
    if (rr < 0 || rr >= 27 || cc < 0 || cc >= 27) continue;
    neighborPairs.push([at(r, c), at(rr, cc)]);
  }
}
assert.equal(neighborPairs.length, 5512);

/**
 * @param {number} first Hypothetical plaintext GP29 index
 * @param {number} second Hypothetical plaintext GP29 index
 */
function candidates(first, second) {
  let paths = 0, keyNodePaths = 0;
  for (const [c0, c1] of neighborPairs) {
    const a = (c0 - first + 29) % 29, b = (c1 - second + 29) % 29;
    const ways = prefixCounts[a * 29 + b];
    if (ways) { paths++; keyNodePaths += ways; }
  }
  return {paths, keyNodePaths};
}
let min = Infinity, max = -Infinity;
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
  const {paths} = candidates(a, b);
  min = Math.min(min, paths);
  max = Math.max(max, paths);
}
assert.deepEqual([min, max], [5004, 5248]);
assert.deepEqual(candidates(2, 18), {paths: 5114, keyNodePaths: 168109});
assert.deepEqual(candidates(3, 0), {paths: 5108, keyNodePaths: 173058});
assert.deepEqual(candidates(16, 3), {paths: 5190, keyNodePaths: 170723});

const claimedThe = [at(18, 16), at(18, 15)];
const k0 = (claimedThe[0] - 2 + 29) % 29;
const k1 = (claimedThe[1] - 18 + 29) % 29;
assert.deepEqual([k0, k1], [22, 22]);
assert.equal(prefixCounts[22 * 29 + 22], 40);

console.log(JSON.stringify({
  sourceGrid: 'LP2 p0-2: 27x27, 729 original indices',
  threeRuneNodes: {geometricNodes, centerModeVariants: nodeModes,
    reachablePositiveKeyPrefixes: 784, totalPositiveKeyPrefixes: 784},
  twoRuneInverse: {directedNeighborPaths: neighborPairs.length,
    testedPlaintextPairs: 841, minMatchingPaths: min, maxMatchingPaths: max,
    exampleTHE: candidates(2, 18), publishedTHEAlternativeNodes: 22}
}, null, 2));
console.log('PASS: exhaustive original-source short-block ambiguity, all GP29 target pairs.');
