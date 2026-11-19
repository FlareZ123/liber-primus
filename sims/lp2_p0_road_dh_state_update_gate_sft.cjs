"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"
));

const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;
const p0 = corpus.pages[0].indices;

assert.deepEqual(p0.slice(103, 109), [8, 12, 16, 8, 25, 27]);
assert.deepEqual([2, 18].map((v) => corpus.translit[v]), ["TH", "E"]);
assert.deepEqual([4, 3, 24, 23].map((v) => corpus.translit[v]), ["R", "O", "A", "D"]);

const roadCipher = p0.slice(105, 109);
const roadPlain = [4, 3, 24, 23];
const roadKey = roadCipher.map((value, i) => mod(value - roadPlain[i]));
assert.deepEqual(roadKey, [12, 5, 1, 4]);

const ray = grid.bytes.slice(104, 108).map((value) => value % MOD);
assert.deepEqual(ray, [6, 5, 2, 15]);

function H(a, b) {
  return [mod(a - b), mod(a + b)];
}

function Hinv(a, b) {
  return [mod(15 * (a + b)), mod(15 * (-a + b))];
}

function pairwise(vector, pairs, fn) {
  const out = vector.slice();
  for (const [i, j] of pairs) {
    const [a, b] = fn(vector[i], vector[j]);
    out[i] = a;
    out[j] = b;
  }
  return out;
}

function cube(vector) {
  return vector.map((value) => mod(value ** 3));
}

function powMod(base, exponent) {
  let result = 1;
  let factor = mod(base);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = mod(result * factor);
    factor = mod(factor * factor);
    e >>= 1;
  }
  return result;
}

function uncube(vector) {
  return vector.map((value) => powMod(value, 19));
}

const matchings = {
  adjacent: [[0, 1], [2, 3]],
  nested: [[0, 3], [1, 2]],
  alternating: [[0, 2], [1, 3]],
};

const wholeRayOps = [
  ["cube", cube],
  ["uncube", uncube],
];
for (const [name, pairs] of Object.entries(matchings)) {
  wholeRayOps.push(["H-" + name, (vector) => pairwise(vector, pairs, H)]);
  wholeRayOps.push(["Hinv-" + name, (vector) => pairwise(vector, pairs, Hinv)]);
}

const keyOf = (vector) => vector.join(",");

function closure(start, operations) {
  const seen = new Map([[keyOf(start), start]]);
  let frontier = [start];
  while (frontier.length) {
    const next = [];
    for (const vector of frontier) {
      for (const [, fn] of operations) {
        const output = fn(vector);
        const key = keyOf(output);
        if (!seen.has(key)) {
          seen.set(key, output);
          next.push(output);
        }
      }
    }
    frontier = next;
  }
  return seen;
}

const forwardClosure = closure(ray, wholeRayOps);
const reverseClosure = closure(ray.slice().reverse(), wholeRayOps);
assert.equal(forwardClosure.size, 2688);
assert.equal(reverseClosure.size, 2688);
assert.equal(forwardClosure.has(keyOf(roadKey)), false);
assert.equal(reverseClosure.has(keyOf(roadKey)), false);

const freePairOps = [];
for (let i = 0; i < 4; i += 1) {
  for (let j = i + 1; j < 4; j += 1) {
    freePairOps.push(["H" + i + j, (vector) => {
      const out = vector.slice();
      [out[i], out[j]] = H(vector[i], vector[j]);
      return out;
    }]);
    freePairOps.push(["Hinv" + i + j, (vector) => {
      const out = vector.slice();
      [out[i], out[j]] = Hinv(vector[i], vector[j]);
      return out;
    }]);
  }
}
freePairOps.push(["cube", cube], ["uncube", uncube]);

function shortestPath(start, target, operations) {
  const targetKey = keyOf(target);
  const seen = new Map([[keyOf(start), {vector: start, parent: null, op: null, depth: 0}]]);
  let frontier = [start];
  while (frontier.length) {
    const next = [];
    for (const vector of frontier) {
      const node = seen.get(keyOf(vector));
      for (const [name, fn] of operations) {
        const output = fn(vector);
        const outputKey = keyOf(output);
        if (seen.has(outputKey)) continue;
        seen.set(outputKey, {
          vector: output,
          parent: keyOf(vector),
          op: name,
          depth: node.depth + 1,
        });
        if (outputKey === targetKey) {
          const path = [];
          let cursor = seen.get(outputKey);
          while (cursor.parent !== null) {
            path.push({op: cursor.op, vector: cursor.vector});
            cursor = seen.get(cursor.parent);
          }
          path.reverse();
          return {depth: node.depth + 1, path, visited: seen.size};
        }
        next.push(output);
      }
    }
    frontier = next;
  }
  return null;
}

const freeFit = shortestPath(ray, roadKey, freePairOps);
assert.ok(freeFit);
assert.equal(freeFit.depth, 6);
assert.deepEqual(freeFit.path.map((step) => step.op), [
  "H02", "Hinv13", "H01", "Hinv12", "H01", "Hinv23",
]);
assert.deepEqual(freeFit.path[freeFit.path.length - 1].vector, roadKey);

console.log(JSON.stringify({
  status: "PASS: no low-description ROAD update from selected H/cube whole-ray operations",
  source: {
    roadCipher,
    roadPlain,
    requiredRoadKey: roadKey,
    p50RoadRay: ray,
    typedRay: "[a,g,K,b]",
  },
  constrainedWholeRayGrammar: {
    operations: wholeRayOps.map(([name]) => name),
    forwardOrbitStates: forwardClosure.size,
    reverseOrbitStates: reverseClosure.size,
    targetReachableForward: false,
    targetReachableReverse: false,
  },
  deliberatelyFreePairControl: {
    operationCount: freePairOps.length,
    shortestTargetDepth: freeFit.depth,
    shortestPath: freeFit.path,
    interpretation:
      "The target can be forced only after six freely changing coordinate-pair/inverse choices. This is a fit, not a source-selected state update.",
  },
  decision:
    "The manuscript-selected H and cube operations do not supply a natural whole-ray update from [a,g,K,b] to ROAD's [12,5,1,4]. Retain THE's exact [a,p] inverse and the ROAD DH ray, but require a new source-visible update before extending plaintext.",
}, null, 2));
