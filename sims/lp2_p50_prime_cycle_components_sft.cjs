"use strict";

/**
 * SFT: prime-sized in-tree partition around the original base60 p50 11-cycle.
 *
 * The forward row-major base60 pointer graph has the established cycle
 * 0->203->68->199->47->76->114->197->115->247->192->0.
 * For each cycle node, count that root plus every noncycle node whose first
 * cycle entry is that root.
 *
 * Windows Node 22:
 *   node sims/lp2_p50_prime_cycle_components_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"),
  "utf8"
));
const table = source.byte_rows.flat();
assert.equal(table.length, 256);

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} prime @returns {number|null} */
function primeIndex(prime) {
  if (!isPrime(prime)) return null;
  let index = 0;
  for (let value = 2; value <= prime; value += 1) {
    if (isPrime(value)) index += 1;
  }
  return index;
}

/**
 * Return the cycle reached from zero when zero itself is on a cycle.
 * Otherwise return null.
 * @param {number[]} values
 * @returns {number[]|null}
 */
function zeroCycle(values) {
  const position = new Int16Array(256).fill(-1);
  const route = [];
  let state = 0;
  while (position[state] < 0) {
    position[state] = route.length;
    route.push(state);
    state = values[state];
  }
  if (state !== 0) return null;
  return route;
}

/**
 * Count root plus attached noncycle predecessors for every root in cycle order.
 * @param {number[]} values
 * @param {number[]} cycle
 * @returns {number[]}
 */
function rootedComponentSizes(values, cycle) {
  const cycleSet = new Set(cycle);
  const reverse = Array.from({ length: 256 }, () => []);
  for (let sourceIndex = 0; sourceIndex < 256; sourceIndex += 1) {
    reverse[values[sourceIndex]].push(sourceIndex);
  }

  return cycle.map((rootNode) => {
    let count = 1;
    const queue = reverse[rootNode].filter((node) => !cycleSet.has(node));
    const seen = new Set(queue);
    while (queue.length > 0) {
      const node = queue.shift();
      assert.notEqual(node, undefined);
      count += 1;
      for (const predecessor of reverse[node]) {
        if (cycleSet.has(predecessor) || seen.has(predecessor)) continue;
        seen.add(predecessor);
        queue.push(predecessor);
      }
    }
    return count;
  });
}

const cycle = zeroCycle(table);
assert.deepEqual(cycle, [0,203,68,199,47,76,114,197,115,247,192]);

const sizes = rootedComponentSizes(table, cycle);
assert.deepEqual(sizes, [3,1,2,13,2,59,23,3,131,2,13]);
assert.equal(sizes.reduce((sum, value) => sum + value, 0), 252);
assert(sizes.every((value) => value === 1 || isPrime(value)));

const primeIndices = sizes.map(primeIndex);
assert.deepEqual(primeIndices, [2,null,1,6,1,17,9,2,32,1,6]);
assert.equal(primeIndex(131), 32);

// Fixed conditional multiset-permutation null. Reuse the same deterministic
// shuffle convention as the established p50 11-cycle SFT. We only evaluate
// the prime-partition predicate when shuffled cell0 itself forms an 11-cycle.
let randomState = 0x24a11b7d;
/** @returns {number} */
function random32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}

const samples = 300000;
let cycle11 = 0;
let allPrimeOrOne = 0;
let exactOrderedPartition = 0;
let hasPrimeIndex32Component = 0;

for (let trial = 0; trial < samples; trial += 1) {
  const shuffled = table.slice();
  for (let index = 255; index > 0; index -= 1) {
    const swapIndex = random32() % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const candidateCycle = zeroCycle(shuffled);
  if (!candidateCycle || candidateCycle.length !== 11) continue;
  cycle11 += 1;

  const candidateSizes = rootedComponentSizes(shuffled, candidateCycle);
  if (candidateSizes.every((value) => value === 1 || isPrime(value))) {
    allPrimeOrOne += 1;
  }
  if (candidateSizes.some((value) => primeIndex(value) === 32)) {
    hasPrimeIndex32Component += 1;
  }
  if (candidateSizes.every((value, index) => value === sizes[index])) {
    exactOrderedPartition += 1;
  }
}

assert.equal(cycle11, 1900);

console.log(JSON.stringify({
  status: "PASS",
  original: {
    cycle,
    rootedComponentSizes: sizes,
    primeIndices,
    sum: sizes.reduce((sum, value) => sum + value, 0),
    root115: {
      cycleOffset: cycle.indexOf(115),
      componentSize: sizes[cycle.indexOf(115)],
      primeIndex: primeIndices[cycle.indexOf(115)],
    },
  },
  conditionalMultisetShuffle: {
    seed: "0x24a11b7d",
    samples,
    zeroCycle11: cycle11,
    allPrimeOrOne,
    hasPrimeIndex32Component,
    exactOrderedPartition,
  },
  decision:
    "The original 11-cycle basin partitions into prime-sized rooted components (plus one singleton); the 115 tree has size 131, the 32nd prime. Treat this as a source-selected structural selector, not plaintext.",
}, null, 2));
