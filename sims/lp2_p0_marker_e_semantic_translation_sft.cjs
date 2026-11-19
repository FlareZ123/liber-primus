"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const M = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % M) + M) % M;
}

/** @param {number} start @param {number[]} rises @returns {number[]} */
function cumulative(start, rises) {
  const out = [mod29(start)];
  let value = mod29(start);
  for (const rise of rises) {
    value = mod29(value + rise);
    out.push(value);
  }
  return out;
}

/** @param {number} n @returns {number[]} */
function base29(n) {
  if (n === 0) return [0];
  const out = [];
  let value = n;
  while (value > 0) {
    out.unshift(value % M);
    value = Math.floor(value / M);
  }
  return out;
}

/** @param {string} text @returns {number[][][]} */
function parseSquares(text) {
  return text.trim().split(/\n\s*\n/u).map((block) =>
    block.split("\n").map((line) => line.trim().split(/\s+/u).map(Number))
  );
}

/** @param {number[][]} square @returns {number} */
function center(square) {
  const middle = Math.floor(square.length / 2);
  return square[middle][middle];
}

/** @param {number[][]} square @returns {number} */
function magicSum(square) {
  return square[0].reduce((sum, value) => sum + value, 0);
}

/**
 * @param {number[]} values
 * @returns {number[][]}
 */
function permutations(values) {
  if (values.length === 0) return [[]];
  const out = [];
  for (let index = 0; index < values.length; index += 1) {
    const head = values[index];
    const tail = values.slice(0, index).concat(values.slice(index + 1));
    for (const rest of permutations(tail)) out.push([head, ...rest]);
  }
  return out;
}

const squares = parseSquares(read("resources/cicada2014-openpuff-magic-squares.txt"));
const same1033 = squares
  .filter((square) => magicSum(square) === 1033)
  .sort((left, right) => left.length - right.length);

assert.equal(same1033.length, 2);
const small = same1033[0];
const large = same1033[1];

const g = small.length;
const K = large.length - small.length;
const [e, q] = base29(center(small));
const [large0, large1] = base29(center(large));
assert.equal(large0 - e, large1 - q);
const A = large0 - e;
const [unit, a, aMinusB] = base29(1033);
const B = mod29(A - aMinusB);

assert.deepEqual({g, K, e, q, A, a, B, unit}, {
  g: 5,
  K: 2,
  e: 3,
  q: 4,
  A: 8,
  a: 6,
  B: 19,
  unit: 1,
});

// Reproduce the already frozen state-only 4|5|4 RISE serializer columns.
const u = q - e;
const t = g + K;
const w = A + g;

const left = cumulative(-q, [q - u, w - u, w + u]);
const right = cumulative(t, [t - u, t, t + u]);
assert.deepEqual(left, [25, 28, 11, 25]);
assert.deepEqual(right, [7, 13, 20, 28]);

const physicalRowDifference = left.map((value, index) => mod29(value - right[index]));
assert.deepEqual(physicalRowDifference, [18, 15, 20, 26]);

// Literal RISE fixes increasing order for this four-value post-freeze output.
const risen = [...physicalRowDifference].sort((x, y) => x - y);
assert.deepEqual(risen, [15, 18, 20, 26]);

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clear = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const sourceWords = (clear.match(/[A-Za-z]+/gu) || []).map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.deepEqual(risen.map((index) => sourceWords[index]), [
  "WORDS",
  "MAP",
  "MEANING",
  "NUMBERS",
]);

// The authenticated sentence itself fixes three grammatical source pairs.
const subjects = [15, 20, 26];
const objects = [18, 23, 29];
assert.deepEqual(subjects.map((index) => sourceWords[index]), [
  "WORDS",
  "MEANING",
  "NUMBERS",
]);
assert.deepEqual(objects.map((index) => sourceWords[index]), [
  "MAP",
  "ROAD",
  "DIRECTION",
]);

// Charge every pairing of the three object indices against the fixed subject
// order.  Only the grammatical pairing forms a constant translation.
const pairingTrials = permutations(objects).map((candidate) => {
  const deltas = candidate.map((value, index) => value - subjects[index]);
  return {
    objects: candidate,
    deltas,
    constant: deltas.every((value) => value === deltas[0]),
  };
});
const constantPairings = pairingTrials.filter((trial) => trial.constant);
assert.deepEqual(constantPairings, [{
  objects: [18, 23, 29],
  deltas: [3, 3, 3],
  constant: true,
}]);
assert.equal(constantPairings[0].deltas[0], e);

// The marker output contains every subject plus the first translated object.
assert.deepEqual(risen, [subjects[0], objects[0], subjects[1], subjects[2]]);

// Apply the independently square-derived e to the three subject indices.
const completedObjects = subjects.map((index) => index + e);
assert.deepEqual(completedObjects, objects);
assert.deepEqual(completedObjects.map((index) => sourceWords[index]), [
  "MAP",
  "ROAD",
  "DIRECTION",
]);

console.log(JSON.stringify({
  status: "PASS",
  squareState: {g, K, e, q, A, a, B},
  markerPostFreeze: {
    physicalRowDifference,
    riseOrdered: risen,
    words: risen.map((index) => sourceWords[index]),
  },
  authenticatedSemanticPairs: subjects.map((subject, index) => ({
    subject,
    subjectWord: sourceWords[subject],
    object: objects[index],
    objectWord: sourceWords[objects[index]],
    delta: objects[index] - subject,
  })),
  allObjectPairings: pairingTrials,
  uniqueConstantTranslation: {
    delta: e,
    expression: "source object index = source subject index + e",
  },
  markerCompletion: {
    subjects,
    plusE: completedObjects,
    completedWords: completedObjects.map((index) => sourceWords[index]),
  },
}, null, 2));
