"use strict";

const assert = require("node:assert/strict");

const MOD = 29;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function inv(x) {
  for (let y = 1; y < MOD; y += 1) {
    if (mod(x * y) === 1) return y;
  }
  throw new Error(`noninvertible value ${x}`);
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return mod(values.reduce((acc, value) => acc + value, 0));
}

const lanes = [
  { page: 32, start: 30, Q: 1, R: 1, n: 3, T: 24, D: 9, sigma: 4, Csum: 5, slot: 0 },
  { page: 33, start: 132, Q: 4, R: 16, n: 4, T: 16, D: 13, sigma: 0, Csum: 28, slot: 1 },
  { page: 34, start: 4, Q: 0, R: 4, n: 2, T: 14, D: 15, sigma: 0, Csum: 6, slot: 2 },
  { page: 35, start: 25, Q: 0, R: 25, n: 5, T: 17, D: 8, sigma: 25, Csum: 3, slot: 3 },
];

for (const lane of lanes) {
  assert.equal(lane.start, MOD * lane.Q + lane.R);
  assert.equal(mod(lane.T + lane.D), lane.sigma);
}

const anchorRoles = {
  Q: (lane) => lane.Q,
  R: (lane) => lane.R,
  n: (lane) => lane.n,
  T: (lane) => lane.T,
  D: (lane) => lane.D,
  Csum: (lane) => lane.Csum,
  slot: (lane) => lane.slot,
  "Q+R": (lane) => mod(lane.Q + lane.R),
  "Q-R": (lane) => mod(lane.Q - lane.R),
  "R-Q": (lane) => mod(lane.R - lane.Q),
  "T+D": (lane) => mod(lane.T + lane.D),
  "T-D": (lane) => mod(lane.T - lane.D),
  "D-T": (lane) => mod(lane.D - lane.T),
};

const anchoredSurvivors = [];
for (const [role, anchor] of Object.entries(anchorRoles)) {
  for (let slope = 0; slope < MOD; slope += 1) {
    const keys = lanes.map((lane) =>
      Array.from({ length: lane.n }, (_, j) => mod(anchor(lane) + slope * j)),
    );
    if (keys.every((key, index) => sum(key) === lanes[index].sigma)) {
      anchoredSurvivors.push({ role, slope, keys });
    }
  }
}
assert.equal(anchoredSurvivors.length, 0);

/**
 * The minimal checksum-normalized progression. The page intercept is not fitted
 * to plaintext: for a globally fixed slope, it is the unique value forced by
 * the already frozen page checksum and source-visible receiver arity.
 * @param {number} slope
 * @param {{n:number,sigma:number}} lane
 * @returns {number[]}
 */
function normalizedProgression(slope, lane) {
  const triangle = (lane.n * (lane.n - 1)) / 2;
  const intercept = mod((lane.sigma - slope * triangle) * inv(lane.n));
  return Array.from({ length: lane.n }, (_, j) => mod(intercept + slope * j));
}

const allSlopes = [];
for (let slope = 0; slope < MOD; slope += 1) {
  const keys = lanes.map((lane) => normalizedProgression(slope, lane));
  assert.ok(keys.every((key, index) => sum(key) === lanes[index].sigma));
  allSlopes.push({ slope, keys });
}
assert.equal(new Set(allSlopes.map((entry) => JSON.stringify(entry.keys))).size, MOD);

const p6VisibleAtoms = [
  0, // adjacent Fehu
  24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12, // title runes
  4, 1, 4, 2, // title word lengths
  2, 26, 5, 6, // H4(title lengths)
  13, // closing red marker
  4, 5, 4, // 13-dot stencil column populations
  20, // balanced black-line width used by the checksum scheduler
];
const p6Slopes = [...new Set(p6VisibleAtoms.map(mod))].sort((a, b) => a - b);
assert.deepEqual(p6Slopes, [0, 1, 2, 4, 5, 6, 12, 13, 14, 15, 16, 17, 19, 20, 24, 26, 27]);

const p6Candidates = p6Slopes.map((slope) => ({
  slope,
  keys: lanes.map((lane) => normalizedProgression(slope, lane)),
}));
assert.equal(new Set(p6Candidates.map((entry) => JSON.stringify(entry.keys))).size, p6Slopes.length);

console.log(JSON.stringify({
  status: "PASS",
  evidenceBoundary: "q1 source-visible receiver geometry + frozen p6 page-key sums only; no target rune values and no p37-p40 data",
  lanes,
  anchoredFamily: {
    anchorRoles: Object.keys(anchorRoles),
    labeledCandidates: Object.keys(anchorRoles).length * MOD,
    completeFourLaneSurvivors: anchoredSurvivors.length,
  },
  checksumNormalizedProgression: {
    allGF29Slopes: allSlopes.length,
    distinctCompleteKeyStreams: MOD,
    p6VisibleNumericSlopes: p6Slopes,
    p6VisibleDistinctStreams: p6Candidates.length,
    sample: p6Candidates.slice(0, 6),
  },
  decision: "NON_IDENTIFYING",
}, null, 2));
