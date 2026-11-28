"use strict";

/**
 * Source-directed p50 pointer-graph / reflection gate.
 * SFT: node sims/lp2_p50_pointer_sink_reflection_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"),
  "utf8"
));

const a60 = grid.alphabet;
assert.equal(a60.length, 60);
const a59 = a60.replace("f", "");
assert.equal(a59.length, 59);
assert.equal(grid.bytes.length, 256);

/** @param {number} value */
function tokenFromBase60(value) {
  return a60[Math.floor(value / 60)] + a60[value % 60];
}

const tokens = grid.bytes.map(tokenFromBase60);
assert.ok(tokens.every((token) => !token.includes("f")));
const lowCounts = new Map(a60.split("").map((ch) => [ch, 0]));
for (const token of tokens) lowCounts.set(token[1], lowCounts.get(token[1]) + 1);
assert.deepEqual(
  [...lowCounts].filter(([, count]) => count === 0).map(([ch]) => ch),
  ["f"]
);

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

const values60 = tokens.map((token) => decode(token, a60));
const values59 = tokens.map((token) => decode(token, a59));
assert.deepEqual(values60, grid.bytes);
assert.ok(values59.every((value) => value >= 0 && value < 256));

/** @param {number} cell */
function reflectCell(cell) {
  const row = Math.floor(cell / 8);
  const column = cell % 8;
  return row * 8 + (7 - column);
}

/** @param {number[]} next */
function graphSummary(next) {
  const state = new Uint8Array(next.length);
  const cycles = [];
  for (let start = 0; start < next.length; start += 1) {
    if (state[start] === 2) continue;
    const pathNodes = [];
    const position = new Map();
    let cell = start;
    while (state[cell] !== 2 && !position.has(cell)) {
      position.set(cell, pathNodes.length);
      pathNodes.push(cell);
      cell = next[cell];
    }
    if (position.has(cell)) {
      let cycle = pathNodes.slice(position.get(cell));
      const minimum = Math.min(...cycle);
      const rotate = cycle.indexOf(minimum);
      cycle = cycle.slice(rotate).concat(cycle.slice(0, rotate));
      cycles.push(cycle);
    }
    for (const node of pathNodes) state[node] = 2;
  }

  const cycleIndex = new Int16Array(next.length).fill(-1);
  for (let index = 0; index < cycles.length; index += 1) {
    for (const node of cycles[index]) cycleIndex[node] = index;
  }
  const basins = new Array(cycles.length).fill(0);
  for (let start = 0; start < next.length; start += 1) {
    let cell = start;
    while (cycleIndex[cell] < 0) cell = next[cell];
    basins[cycleIndex[cell]] += 1;
  }
  return {cycles, basins};
}

const graph60 = graphSummary(values60);
const graph59 = graphSummary(values59);
assert.deepEqual(graph60, {
  cycles: [
    [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192],
    [158, 249]
  ],
  basins: [252, 4]
});
assert.deepEqual(graph59, {cycles: [[189]], basins: [256]});

assert.equal(tokens[189], "3C");
assert.equal(values60[189], 192);
assert.equal(values59[189], 189);
assert.equal(reflectCell(189), 186);
assert.equal(tokens[186], "0J");
assert.equal(values60[186], 19);
assert.equal(values59[186], 19);

/** @param {number[]} next @param {number} sink */
function depthToSink(next, sink) {
  const depth = new Array(next.length);
  for (let start = 0; start < next.length; start += 1) {
    let cell = start;
    let count = 0;
    while (cell !== sink) {
      cell = next[cell];
      count += 1;
      assert.ok(count <= next.length);
    }
    depth[start] = count;
  }
  return depth;
}
const depths59 = depthToSink(values59, 189);
assert.equal(Math.max(...depths59), 38);

/** @param {number} seed */
function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6D2B79F5) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Return whether a 256-node functional graph has exactly one recurrent class,
 * that class is the requested fixed point, and therefore every node reaches it.
 * @param {number[]} next
 * @param {number} sink
 */
function allFlowToFixedPoint(next, sink) {
  if (next[sink] !== sink) return false;
  const done = new Uint8Array(next.length);
  done[sink] = 1;
  for (let start = 0; start < next.length; start += 1) {
    if (done[start]) continue;
    let cell = start;
    const pathNodes = [];
    const local = new Set();
    while (!done[cell]) {
      if (local.has(cell)) return false;
      local.add(cell);
      pathNodes.push(cell);
      cell = next[cell];
    }
    for (const node of pathNodes) done[node] = 1;
  }
  return true;
}

const monteCarloTrials = Number(process.env.LP_POINTER_TRIALS || 500000);
assert.ok(Number.isInteger(monteCarloTrials) && monteCarloTrials >= 1);
const monteCarloSeed = 20261128;
const random = mulberry32(monteCarloSeed);
const permutation = Array.from({length: 256}, (_, index) => index);
const shuffled59 = new Array(256);
const shuffled60 = new Array(256);
let hit59 = 0;
let hit60 = 0;
let hitEither = 0;
let candidate59 = 0;
let candidate60 = 0;

for (let trial = 0; trial < monteCarloTrials; trial += 1) {
  for (let index = 0; index < 256; index += 1) permutation[index] = index;
  for (let index = 255; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const temp = permutation[index];
    permutation[index] = permutation[swap];
    permutation[swap] = temp;
  }

  let pass59 = false;
  let pass60 = false;
  if (values59[permutation[189]] === 189) {
    candidate59 += 1;
    for (let cell = 0; cell < 256; cell += 1) shuffled59[cell] = values59[permutation[cell]];
    pass59 = allFlowToFixedPoint(shuffled59, 189);
    if (pass59) hit59 += 1;
  }
  if (values60[permutation[189]] === 189) {
    candidate60 += 1;
    for (let cell = 0; cell < 256; cell += 1) shuffled60[cell] = values60[permutation[cell]];
    pass60 = allFlowToFixedPoint(shuffled60, 189);
    if (pass60) hit60 += 1;
  }
  if (pass59 || pass60) hitEither += 1;
}

const rowTrials = Number(process.env.LP_POINTER_ROW_TRIALS || 200000);
assert.ok(Number.isInteger(rowTrials) && rowTrials >= 1);
const rowRandom = mulberry32(monteCarloSeed ^ 0x9E3779B9);
let rowHit59 = 0;
let rowHit60 = 0;
let rowHitEither = 0;
for (let trial = 0; trial < rowTrials; trial += 1) {
  for (let index = 0; index < 256; index += 1) permutation[index] = index;
  for (let row = 0; row < 32; row += 1) {
    const base = row * 8;
    for (let offset = 7; offset > 0; offset -= 1) {
      const swapOffset = Math.floor(rowRandom() * (offset + 1));
      const left = base + offset;
      const right = base + swapOffset;
      const temp = permutation[left];
      permutation[left] = permutation[right];
      permutation[right] = temp;
    }
  }
  let pass59 = false;
  let pass60 = false;
  if (values59[permutation[189]] === 189) {
    for (let cell = 0; cell < 256; cell += 1) shuffled59[cell] = values59[permutation[cell]];
    pass59 = allFlowToFixedPoint(shuffled59, 189);
    if (pass59) rowHit59 += 1;
  }
  if (values60[permutation[189]] === 189) {
    for (let cell = 0; cell < 256; cell += 1) shuffled60[cell] = values60[permutation[cell]];
    pass60 = allFlowToFixedPoint(shuffled60, 189);
    if (pass60) rowHit60 += 1;
  }
  if (pass59 || pass60) rowHitEither += 1;
}

const result = {
  source: {
    missingLowDigit: "f",
    base60: graph60,
    base59: graph59,
    sink: {
      cell: 189,
      row: Math.floor(189 / 8),
      column: 189 % 8,
      token: tokens[189],
      base59Value: values59[189],
      base60Value: values60[189],
      maxBase59Depth: Math.max(...depths59)
    },
    reflectedSink: {
      cell: reflectCell(189),
      token: tokens[reflectCell(189)],
      value59: values59[reflectCell(189)],
      value60: values60[reflectCell(189)]
    }
  },
  monteCarlo: {
    trials: monteCarloTrials,
    seed: monteCarloSeed,
    targetCell: 189,
    candidate59,
    candidate60,
    hit59,
    hit60,
    hitEither,
    rateEither: hitEither / monteCarloTrials
  },
  rowMatchedMonteCarlo: {
    trials: rowTrials,
    seed: (monteCarloSeed ^ 0x9E3779B9) >>> 0,
    hit59: rowHit59,
    hit60: rowHit60,
    hitEither: rowHitEither,
    rateEither: rowHitEither / rowTrials
  }
};

console.log(JSON.stringify(result, null, 2));
