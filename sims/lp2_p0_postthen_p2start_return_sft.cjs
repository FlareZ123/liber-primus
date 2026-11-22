"use strict";

/**
 * SFT: p0-p2 post-THEN physical-page-start return gate.
 * Run: node sims/lp2_p0_postthen_p2start_return_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const pages = corpus.pages.filter(page => page.page <= 2);
const grid = pages.flatMap(page => page.indices);
const T = corpus.translit;
assert.deepEqual(pages.map(page => page.indices.length), [262, 266, 201]);
assert.equal(grid.length, 729);

/** @param {number} n */
function phi(n) {
  let value = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    value -= value / p;
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {number} n */
function mu(n) {
  let rest = n;
  let sign = 1;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
    while (rest % p === 0) rest /= p;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} n @param {number} count */
function phiIterate(n, count) {
  for (let i = 0; i < count; i++) n = phi(n);
  return n;
}

/** @param {number} value */
const mod29 = value => (value % 29 + 29) % 29;

/** @param {[number, number]} q */
const inBounds = q => q[0] >= 1 && q[0] <= 27 && q[1] >= 1 && q[1] <= 27;

/** @param {[number, number]} q */
const at = q => grid[(q[0] - 1) * 27 + q[1] - 1];

/** @param {number[]} raw */
function deriveKey(raw) {
  const derived = [raw[0], phi(raw[1]), raw[2]];
  const rotation = mod29(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;
  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

/**
 * @param {Array<[number, number]>} cells
 * @param {number[]} key
 */
function decrypt(cells, key) {
  return cells.map((q, i) => mod29(at(q) - key[i % key.length]));
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
let offset = 0;
const pageStartIndices = pages.map(page => {
  const start = offset;
  offset += page.indices.length;
  return start;
});
const coordinate = index => [Math.floor(index / 27) + 1, index % 27 + 1];
const pageStarts = pageStartIndices.map(coordinate);
assert.deepEqual(pageStarts, [[1, 1], [10, 20], [20, 16]]);

/**
 * @param {number} priorCenterRune
 * @param {[number, number]} endpoint
 * @param {-1|1} horizontalDirection
 */
function pageStartReturn(priorCenterRune, endpoint, horizontalDirection) {
  const innerScale = phi(phi(priorCenterRune));
  if (innerScale < 2 || innerScale % 2 !== 0) {
    return {innerScale, radius: null, nodes: [], starts: []};
  }
  const radius = innerScale / 2;
  const nodes = [];

  for (let page = 0; page < pageStarts.length; page++) {
    const center = [
      pageStarts[page][0],
      pageStarts[page][1] + horizontalDirection,
    ];
    if (!inBounds(center)) continue;
    for (const axis of axes) {
      const p1 = [
        center[0] - axis[0] * radius,
        center[1] - axis[1] * radius,
      ];
      const p2 = [
        center[0] + axis[0] * radius,
        center[1] + axis[1] * radius,
      ];
      if (!inBounds(p1) || !inBounds(p2)) continue;
      const raw = [at(p1), at(center), at(p2)];
      if (raw[0] === raw[2] && raw[1] !== 0) {
        nodes.push({page, center, axis, p1, p2, raw});
      }
    }
  }

  const starts = [];
  for (const tangentSign of [-1, 1]) {
    const start = [
      endpoint[0] + tangentSign * radius,
      endpoint[1] - horizontalDirection * innerScale,
    ];
    if (!inBounds(start)) continue;
    starts.push({
      tangentSign,
      start,
      read: [tangentSign, -horizontalDirection],
    });
  }
  return {innerScale, radius, nodes, starts};
}

const thenPrior = {center: [26, 22], raw: [27, 27, 27]};
const thenEndpoint = [25, 27];
assert.deepEqual(thenPrior.raw.map(value => T[value]), ["IA", "IA", "IA"]);

const thenReturn = pageStartReturn(thenPrior.raw[1], thenEndpoint, 1);
assert.equal(thenReturn.innerScale, 6);
assert.equal(thenReturn.radius, 3);
assert.equal(thenReturn.nodes.length, 1);
assert.equal(thenReturn.starts.length, 1);

const node18 = thenReturn.nodes[0];
assert.equal(node18.page, 2);
assert.deepEqual(node18.center, [20, 17]);
assert.deepEqual(node18.axis, [1, 0]);
assert.deepEqual(node18.raw.map(value => T[value]), ["N", "M", "N"]);
assert.equal(
  (node18.center[0] - 1) * 27 + node18.center[1] - 1,
  pageStartIndices[2] + 1
);

const selectedStart = thenReturn.starts[0];
assert.equal(selectedStart.tangentSign, -1);
assert.deepEqual(selectedStart.start, [22, 21]);
assert.deepEqual(selectedStart.read, [-1, -1]);

const length18 = phi(thenReturn.innerScale);
assert.equal(length18, 2);
const cells18 = [];
let q = selectedStart.start.slice();
for (let i = 0; i < length18; i++) {
  cells18.push(q.slice());
  q = [q[0] + selectedStart.read[0], q[1] + selectedStart.read[1]];
}
assert.deepEqual(cells18, [[22, 21], [21, 20]]);
assert.deepEqual(cells18.map(at).map(value => T[value]), ["J", "W"]);

const key18 = deriveKey(node18.raw);
const plain18 = decrypt(cells18, key18);
assert.deepEqual(key18.map(value => T[value]), ["N", "E", "N"]);
assert.deepEqual(plain18.map(value => T[value]), ["TH", "E"]);

const deathReturn = pageStartReturn(T.indexOf("B"), [26, 1], -1);
assert.equal(deathReturn.innerScale, 8);
assert.equal(deathReturn.radius, 4);
assert.equal(deathReturn.nodes.length, 0);

const verticalRadius1 = [];
for (let row = 2; row <= 26; row++) {
  for (let column = 1; column <= 27; column++) {
    const raw = [
      at([row - 1, column]),
      at([row, column]),
      at([row + 1, column]),
    ];
    if (raw[0] === raw[2] && raw[1] !== 0) {
      verticalRadius1.push({center: [row, column], raw});
    }
  }
}
assert.equal(verticalRadius1.length, 22);

const matched = [];
for (const prior of verticalRadius1) {
  for (const outerSign of [-1, 1]) {
    const endpoint = [prior.center[0] + outerSign, 27];
    if (!inBounds(endpoint)) continue;
    const result = pageStartReturn(prior.raw[1], endpoint, 1);
    if (result.nodes.length === 1 && result.starts.length === 1) {
      matched.push({prior, outerSign, endpoint, result});
    }
  }
}
assert.equal(verticalRadius1.length * 2, 44);
assert.equal(matched.length, 2);
assert.ok(matched.every(row =>
  row.prior.center[0] === 26 &&
  row.prior.center[1] === 22 &&
  row.prior.raw.every(value => value === 27) &&
  row.result.nodes[0].page === 2 &&
  row.result.nodes[0].center[0] === 20 &&
  row.result.nodes[0].center[1] === 17
));
assert.deepEqual(matched.map(row => row.endpoint), [[25, 27], [27, 27]]);

const frames = [
  ["I", (r, c) => [r, c]],
  ["R90", (r, c) => [c, 28 - r]],
  ["R180", (r, c) => [28 - r, 28 - c]],
  ["R270", (r, c) => [28 - c, r]],
  ["M", (r, c) => [r, 28 - c]],
  ["MR90", (r, c) => [28 - c, 28 - r]],
  ["MR180", (r, c) => [28 - r, c]],
  ["MR270", (r, c) => [c, r]],
];

/**
 * @param {(q:[number,number])=>number} sourceAt
 * @param {[number,number]} priorCenter
 * @param {[number,number]} endpoint
 */
function frozenEdgeSelection(sourceAt, priorCenter, endpoint) {
  const mirrors = [];
  for (let outerDepth = 1; outerDepth <= 5; outerDepth++) {
    for (let innerDepth = 1; innerDepth <= 5; innerDepth++) {
      const outerScale = phiIterate(priorCenter[1], outerDepth);
      const innerScale = phiIterate(sourceAt(priorCenter), innerDepth);
      if (outerScale % 2 || innerScale % 2 || innerScale < 2) continue;
      for (const shape of [0, 1]) {
        for (const rowSign of [-1, 1]) {
          for (const colSign of [-1, 1]) {
            const center = shape === 0
              ? [
                endpoint[0] + rowSign * outerScale / 2,
                endpoint[1] + colSign * outerScale,
              ]
              : [
                endpoint[0] + rowSign * outerScale,
                endpoint[1] + colSign * outerScale / 2,
              ];
            const start = shape === 0
              ? [
                endpoint[0] + rowSign * innerScale / 2,
                endpoint[1] + colSign * innerScale,
              ]
              : [
                endpoint[0] + rowSign * innerScale,
                endpoint[1] + colSign * innerScale / 2,
              ];
            if (!inBounds(center) || !inBounds(start)) continue;
            const radius = innerScale / 2;
            for (const axis of axes) {
              const p1 = [
                center[0] - axis[0] * radius,
                center[1] - axis[1] * radius,
              ];
              const p2 = [
                center[0] + axis[0] * radius,
                center[1] + axis[1] * radius,
              ];
              if (!inBounds(p1) || !inBounds(p2)) continue;
              const raw = [sourceAt(p1), sourceAt(center), sourceAt(p2)];
              if (raw[0] === raw[2] && raw[1] !== 0) mirrors.push({center});
            }
          }
        }
      }
    }
  }
  return mirrors.length === 1 ? mirrors[0] : null;
}

const broad = [];
for (const [frameName, transform] of frames) {
  const sourceAt = local => {
    const source = transform(local[0], local[1]);
    return grid[(source[0] - 1) * 27 + source[1] - 1];
  };
  for (let row = 2; row <= 26; row++) {
    for (let column = 1; column <= 27; column++) {
      const priorRaw = [
        sourceAt([row - 1, column]),
        sourceAt([row, column]),
        sourceAt([row + 1, column]),
      ];
      if (priorRaw[0] !== priorRaw[2] || priorRaw[1] === 0) continue;
      for (let endpointRow = 1; endpointRow <= 27; endpointRow++) {
        const selected = frozenEdgeSelection(
          sourceAt, [row, column], [endpointRow, 27]
        );
        if (!selected) continue;
        const sourceCenter = transform(selected.center[0], selected.center[1]);
        const sourcePrior = transform(row, column);
        const sourceEndpoint = transform(endpointRow, 27);
        const sourceIndex =
          (sourceCenter[0] - 1) * 27 + sourceCenter[1] - 1;
        const manhattan = pageStarts.map(start =>
          Math.abs(start[0] - sourceCenter[0]) +
          Math.abs(start[1] - sourceCenter[1])
        );
        const deltas = pageStartIndices.map(start => sourceIndex - start);
        broad.push({
          frameName, sourceCenter, sourcePrior, sourceEndpoint,
          manhattan, deltas,
        });
      }
    }
  }
}
assert.equal(broad.length, 996);

const adjacent = broad.filter(row => Math.min(...row.manhattan) === 1);
const plusOne = broad.filter(row => row.deltas.includes(1));
assert.equal(adjacent.length, 4);
assert.equal(plusOne.length, 2);

const physicalKey = row => JSON.stringify([
  row.sourcePrior, row.sourceEndpoint, row.sourceCenter,
]);
const uniqueAdjacent = new Map(adjacent.map(row => [physicalKey(row), row]));
const uniquePlusOne = new Map(plusOne.map(row => [physicalKey(row), row]));
assert.equal(uniqueAdjacent.size, 2);
assert.equal(uniquePlusOne.size, 1);

const actual = [...uniquePlusOne.values()][0];
assert.deepEqual(actual.sourcePrior, [26, 22]);
assert.deepEqual(actual.sourceEndpoint, [25, 27]);
assert.deepEqual(actual.sourceCenter, [20, 17]);

console.log(JSON.stringify({
  status: "PASS: p2 physical-start return compresses conditional post-THEN selector",
  pageStarts,
  then: {
    priorKey: thenPrior.raw.map(value => T[value]),
    endpoint: thenEndpoint,
    innerScale: thenReturn.innerScale,
    radius: thenReturn.radius,
    selectedCenter: node18.center,
    node: node18.raw.map(value => T[value]),
    ciphertext: cells18.map(at).map(value => T[value]),
    key: key18.map(value => T[value]),
    output: plain18.map(value => T[value]),
  },
  matchedControl: {
    verticalRadius1Mirrors: verticalRadius1.length,
    outerAlignedStates: verticalRadius1.length * 2,
    executableReturns: matched.length,
    endpoints: matched.map(row => row.endpoint),
  },
  broadFrozenEdgeCharge: {
    uniqueMirrorStates: broad.length,
    pageStartAdjacentFramed: adjacent.length,
    pageStartAdjacentPhysical: uniqueAdjacent.size,
    carriedPlusOneFramed: plusOne.length,
    carriedPlusOnePhysical: uniquePlusOne.size,
  },
  deathControl: {
    innerScale: deathReturn.innerScale,
    radius: deathReturn.radius,
    qualifyingNodes: deathReturn.nodes.length,
  },
  caveat: "Recognized after public THE; source compression only.",
}, null, 2));
