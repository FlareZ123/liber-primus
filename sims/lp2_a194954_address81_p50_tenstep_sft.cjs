"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.map((page) => page.tokens.length), [80, 104, 72]);
const WIDTH = 8;
const START_ADDRESS = 81;
const RED_DOT_STEPS = 10;
const TARGET_ADDRESS = 249;
const TARGET_VALUE = 113;
const alpha60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alpha59 = alpha60.replace("f", "");

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

const base60 = tokens.map((token) => decodeToken(token, alpha60));
const base59 = tokens.map((token) => decodeToken(token, alpha59));
assert.deepEqual(base60, grid.pages.flatMap((page) => page.bytes));

/**
 * Follow one-based cell addresses. The printed value is the next address.
 * @param {number[]} values
 * @param {number} start
 * @param {number} steps
 * @returns {number[]}
 */
function walkOneBased(values, start, steps) {
  const out = [start];
  let address = start;
  for (let step = 0; step < steps; step++) {
    assert.ok(address >= 1 && address <= 256);
    address = values[address - 1];
    out.push(address);
  }
  return out;
}

/**
 * Comparator for the older zero-based byte-pointer convention.
 * @param {number[]} values
 * @param {number} start
 * @param {number} steps
 * @returns {number[]}
 */
function walkZeroBased(values, start, steps) {
  const out = [start];
  let index = start;
  for (let step = 0; step < steps; step++) {
    assert.ok(index >= 0 && index <= 255);
    index = values[index];
    out.push(index);
  }
  return out;
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} value @returns {number} */
function popcount(value) {
  let count = 0;
  for (let x = value; x > 0; x = Math.floor(x / 2)) count += x & 1;
  return count;
}

/** @param {number} count @returns {number[]} */
function a194954(count) {
  const values = [2];
  for (let n = 2; n <= count; n++) {
    const step = popcount(n - 1);
    let candidate = values.at(-1) + step;
    while (!isPrime(candidate)) candidate += step;
    values.push(candidate);
  }
  return values;
}

const sequence = a194954(40);
assert.equal(sequence[7], 23);
assert.equal(sequence[22], 113);
const inverse113 = sequence.indexOf(TARGET_VALUE) + 1;
const inferredUpStride = sequence.indexOf(inverse113) + 1;
assert.equal(inverse113, 23);
assert.equal(inferredUpStride, WIDTH);
const UP_ADDRESS = TARGET_ADDRESS - inferredUpStride;
assert.equal(UP_ADDRESS, 241);

const sourcePath = walkOneBased(base60, START_ADDRESS, RED_DOT_STEPS);
assert.deepEqual(sourcePath, [81, 142, 46, 107, 31, 141, 245, 22, 137, 10, 249]);
assert.equal(sourcePath.at(-1), TARGET_ADDRESS);
assert.equal(Math.floor((START_ADDRESS - 1) / WIDTH), 10);
assert.equal((START_ADDRESS - 1) % WIDTH, 0);
assert.equal(Math.floor((TARGET_ADDRESS - 1) / WIDTH), 31);
assert.equal((TARGET_ADDRESS - 1) % WIDTH, 0);

assert.equal(tokens[TARGET_ADDRESS - 1], "1r");
assert.equal(base60[TARGET_ADDRESS - 1], TARGET_VALUE);
assert.equal(sequence.indexOf(TARGET_VALUE) + 1, 23);
assert.equal(sequence.indexOf(23) + 1, WIDTH);

const base59Path = walkOneBased(base59, START_ADDRESS, RED_DOT_STEPS);
assert.deepEqual(base59Path, [81, 140, 13, 243, 41, 79, 45, 226, 51, 46, 105]);
assert.notEqual(base59Path.at(-1), TARGET_ADDRESS);
assert.equal(base59[TARGET_ADDRESS - 1], 111);
assert.equal(sequence.includes(111), false);

const zeroBasedFromAddress81 = walkZeroBased(base60, 80, RED_DOT_STEPS);
assert.deepEqual(zeroBasedFromAddress81, [80, 142, 160, 233, 234, 196, 176, 235, 121, 237, 32]);
assert.notEqual(zeroBasedFromAddress81.at(-1), TARGET_ADDRESS - 1);

const exactOriginalStarts = [];
for (let start = 1; start <= 256; start++) {
  const route = walkOneBased(base60, start, RED_DOT_STEPS);
  if (route.at(-1) === TARGET_ADDRESS) exactOriginalStarts.push(start);
}
assert.deepEqual(exactOriginalStarts, [74, 81, 217]);

// Descriptive secondary closure: continuing the source walk reaches the only
// nontrivial one-based cycle 173 <-> 148. A194954(28)=173 and phi(29)=28.
// This was observed after the primary 81 ->10 steps->249 closure and is not
// included in the matched-control event.
function walkToCycle(values, start) {
  const order = [];
  const seen = new Map();
  let address = start;
  while (address >= 1 && address <= 256 && !seen.has(address)) {
    seen.set(address, order.length);
    order.push(address);
    address = values[address - 1];
  }
  return {order, cycle: seen.has(address) ? order.slice(seen.get(address)) : []};
}
const continued = walkToCycle(base60, START_ADDRESS);
assert.deepEqual(continued.cycle, [173, 148]);
assert.equal(sequence[27], 173);
assert.equal(29 - 1, 28);

// Source-selected continuation: the nested inverse gives the table width,
// so literal UP from bottom-left address249 means one row upward to241.
const upContinuation = walkToCycle(base60, UP_ADDRESS);
assert.deepEqual(upContinuation.order, [
  241, 144, 152, 189, 38, 80, 82, 58, 118, 171, 254,
  36, 39, 133, 169, 240, 173, 148,
]);
assert.deepEqual(upContinuation.cycle, [173, 148]);
const base59UpContinuation = walkToCycle(base59, UP_ADDRESS);
assert.deepEqual(base59UpContinuation.cycle, [142, 45, 226, 51, 46, 105, 120, 181]);

/** @param {number} seed @returns {()=>number} */
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {number[][]} groups
 * @param {number} seed
 * @param {number} rounds
 * @returns {{rounds:number,land249At10:number,fullClosure:number,upExactCycle:number}}
 */
function shuffleControl(groups, seed, rounds) {
  const random = makeRandom(seed);
  let land249At10 = 0;
  let fullClosure = 0;
  let upExactCycle = 0;

  for (let trial = 0; trial < rounds; trial++) {
    const values = base60.slice();
    for (const indices of groups) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const left = indices[i];
        const right = indices[j];
        [values[left], values[right]] = [values[right], values[left]];
      }
    }

    const route = walkOneBased(values, START_ADDRESS, RED_DOT_STEPS);
    if (route.at(-1) === TARGET_ADDRESS) {
      land249At10++;
      if (values[TARGET_ADDRESS - 1] === TARGET_VALUE) {
        fullClosure++;
        const upCycle = walkToCycle(values, UP_ADDRESS).cycle;
        if (upCycle.length === 2 && upCycle[0] === 173 && upCycle[1] === 148) {
          upExactCycle++;
        }
      }
    }
  }
  return {rounds, land249At10, fullClosure, upExactCycle};
}

const globalGroups = [Array.from({length: 256}, (_, index) => index)];
const rowGroups = Array.from({length: 32}, (_, row) =>
  Array.from({length: 8}, (_, column) => row * 8 + column));
const columnGroups = Array.from({length: 8}, (_, column) =>
  Array.from({length: 32}, (_, row) => row * 8 + column));

const controls = {
  global: shuffleControl(globalGroups, 0x813301, 100000),
  rowPreserving: shuffleControl(rowGroups, 0x813302, 100000),
  columnPreserving: shuffleControl(columnGroups, 0x813303, 100000),
};
assert.deepEqual(controls, {
  global: {rounds: 100000, land249At10: 1103, fullClosure: 5, upExactCycle: 0},
  rowPreserving: {rounds: 100000, land249At10: 1148, fullClosure: 125, upExactCycle: 0},
  columnPreserving: {rounds: 100000, land249At10: 943, fullClosure: 32, upExactCycle: 0},
});

const planted = base60.slice();
const plantedPath = [81, 142, 46, 107, 31, 141, 245, 22, 137, 10, 249];
for (let i = 0; i + 1 < plantedPath.length; i++) {
  planted[plantedPath[i] - 1] = plantedPath[i + 1];
}
planted[TARGET_ADDRESS - 1] = TARGET_VALUE;
assert.deepEqual(walkOneBased(planted, START_ADDRESS, RED_DOT_STEPS), plantedPath);
assert.equal(planted[TARGET_ADDRESS - 1], TARGET_VALUE);

console.log(JSON.stringify({
  source: {
    tableShape: "32x8",
    printedPageCellCounts: [80, 104, 72],
    startAddress: START_ADDRESS,
    redDotStepCount: RED_DOT_STEPS,
    bottomLeftAddress: TARGET_ADDRESS,
  },
  base60: {
    path: sourcePath,
    endpointToken: tokens[TARGET_ADDRESS - 1],
    endpointValue: TARGET_VALUE,
    nestedA194954Inverse: [TARGET_VALUE, 23, 8],
    originalStartsLanding249AtStep10: exactOriginalStarts,
    continuedCycleFrom81: continued.cycle,
    upContinuation: {
      from: TARGET_ADDRESS,
      inferredStride: inferredUpStride,
      to: UP_ADDRESS,
      pointerOrder: upContinuation.order,
      cycle: upContinuation.cycle,
    },
    secondaryCycleA194954Inverse: [173, 28],
  },
  wrongConventions: {
    dropFBase59Path: base59Path,
    dropFCell249Value: base59[TARGET_ADDRESS - 1],
    dropFBase59UpCycle: base59UpContinuation.cycle,
    zeroBasedPathFromOneBased81: zeroBasedFromAddress81,
  },
  controls,
  decision: "Source-fixed address81 plus ten pointer steps selects cell249; 113 -> A194954^-1 23 -> A194954^-1 8 gives the table width, so UP moves to241 and the base60 pointer reaches cycle173<->148, with173=A194954(28)=A194954(phi(29)).",
}, null, 2));
