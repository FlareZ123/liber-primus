"use strict";

/**
 * SFT: exact five-black-dot constellation screen on original LP2 p56.
 * From repository root: node sims/lp2_p56_fivedot_constellation_sft.cjs
 * This is a source-interpretation gate, not a decryption.
 */
const assert = require("node:assert/strict");
const source = require("../resources/control/d3-celestial-constellation-lines.json");
assert.equal(source.features.length, 89);

/*
 * Five source circle centroids, full 2400x3600 original scan 73.jpg, px.
 * Original extraction: threshold grayscale <130, ROI x700..1900, y2350..2850,
 * cv2.connectedComponentsWithStats with area 150..4000 pixels.
 * Frozen in ascending x; the five circular components have ~3542..3623 px area.
 */
const dots = [
  [873.3457865168539, 2517],
  [921.2267080745341, 2708.0587238848107],
  [1103.9342511941556, 2447.3014891823545],
  [1408.121998343914, 2747.286226883798],
  [1603.8701442841289, 2686.5],
];

/** @type {number[][]} All 120 point assignments for the unlabelled five dots. */
const permutations = [];
/**
 * @param {number[]} p Selected point indices.
 * @param {number[]} rest Remaining point indices.
 * @returns {void}
 */
function enumerate(p, rest) {
  if (!rest.length) {
    permutations.push(p);
    return;
  }
  for (let i = 0; i < rest.length; i++) {
    enumerate([...p, rest[i]], [...rest.slice(0, i), ...rest.slice(i + 1)]);
  }
}
enumerate([], [0, 1, 2, 3, 4]);
assert.equal(permutations.length, 120);

/**
 * Centre and rescale a five-point geometry to total squared radius one.
 * @param {number[][]} points Five 2D points.
 * @returns {number[][]} Normalized centred coordinates.
 */
function normalized(points) {
  const mx = points.reduce((s, p) => s + p[0], 0) / 5;
  const my = points.reduce((s, p) => s + p[1], 0) / 5;
  const q = points.map((p) => [p[0] - mx, p[1] - my]);
  const radius = Math.sqrt(q.reduce((s, p) =>
    s + p[0] * p[0] + p[1] * p[1], 0));
  return q.map((p) => [p[0] / radius, p[1] / radius]);
}

/*
 * Fixed candidate family: each consecutive five-point subpath within one
 * original published constellation polyline. Tangent-plane approximation
 * x = unwrapped right ascension * cos(mean declination), y = declination.
 * This does not include arbitrary five-node subsets or nonlinear distortions.
 */
const templates = [];
for (const feature of source.features) {
  for (const line of feature.geometry.coordinates) {
    for (let start = 0; start + 5 <= line.length; start++) {
      const points = line.slice(start, start + 5).map((p) => p.slice());
      for (let j = 1; j < 5; j++) {
        while (points[j][0] - points[j - 1][0] > 180) points[j][0] -= 360;
        while (points[j][0] - points[j - 1][0] < -180) points[j][0] += 360;
      }
      const meanDec = points.reduce((s, p) => s + p[1], 0) / 5;
      const factor = Math.cos(meanDec * Math.PI / 180);
      for (const p of points) p[0] *= factor;
      templates.push({id: feature.id, offset: start, points: normalized(points)});
    }
  }
}
assert.equal(templates.length, 366);

/**
 * Search every source path, all 120 point permutations, both reflection
 * choices, translation, rotation and uniform scale. The normalized residual
 * is the square root of 1 - squared best complex correlation.
 * @param {number[][]} points Five page-circle centres.
 * @returns {{residual:number,id:string,offset:number}} Best constellation.
 */
function fit(points) {
  const A = normalized(points);
  let bestCorrelationSquared = -1;
  let id = "";
  let offset = -1;
  for (const template of templates) {
    const B = template.points;
    for (const indices of permutations) {
      let dot = 0;
      let cross = 0;
      let reflectedDot = 0;
      let reflectedCross = 0;
      for (let i = 0; i < 5; i++) {
        const [x, y] = A[i];
        const [u, v] = B[indices[i]];
        dot += x * u + y * v;
        cross += x * v - y * u;
        reflectedDot += x * u - y * v;
        reflectedCross += x * v + y * u;
      }
      const correlationSquared = Math.max(
        dot * dot + cross * cross,
        reflectedDot * reflectedDot + reflectedCross * reflectedCross);
      if (correlationSquared > bestCorrelationSquared) {
        bestCorrelationSquared = correlationSquared;
        id = template.id;
        offset = template.offset;
      }
    }
  }
  return {residual: Math.sqrt(Math.max(0, 1 - bestCorrelationSquared)),
    id, offset};
}

const observed = fit(dots);
assert.equal(observed.id, "Ori");
assert.equal(observed.offset, 1);
assert.ok(Math.abs(observed.residual - 0.1689239765) < 0.000001);

/* Exact matched 5! null: retain all measured x and y values but reassociate. */
const nullResiduals = permutations.map((indices) => {
  const rearranged = dots.map((p, i) => [p[0], dots[indices[i]][1]]);
  return fit(rearranged).residual;
});
const sorted = nullResiduals.slice().sort((a, b) => a - b);
const nullAtLeastAsGood = nullResiduals.filter(
  (r) => r <= observed.residual + 1e-12).length;
assert.equal(nullAtLeastAsGood, 109);
assert.ok(Math.abs(sorted[60] - 0.1314353245) < 0.000001);

console.log(JSON.stringify({
  sourceImage: "resources/liber-primus/73.jpg",
  originalPhysicalLP2Page: 56,
  originalCircleCentroids: dots,
  constellationFeatures: source.features.length,
  candidateFivePointPaths: templates.length,
  candidatePointPermutations: permutations.length,
  originalBest: observed,
  matchedNull: {
    configurations: nullResiduals.length,
    bestResidual: sorted[0],
    medianResidual: sorted[60],
    worstResidual: sorted[119],
    nullAtLeastAsGood,
    exactRankFraction: nullAtLeastAsGood / 120,
  },
  claim: "No unique or unusual five-dot constellation fit",
}, null, 2));
