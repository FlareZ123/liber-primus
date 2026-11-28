"use strict";

const assert = require("node:assert/strict");

const pairOrders = [
  { name: "outer-in", pairs: [[0, 3], [1, 2]] },
  { name: "inner-out", pairs: [[1, 2], [0, 3]] },
];
const diffSigns = ["left-minus-right", "right-minus-left"];
const channelOrders = ["difference-first", "sum-first"];
const returnModes = ["bounce", "parallel"];

/** @param {[number,number]} pair @param {string} sign */
function diffLabel(pair, sign) {
  const [a, b] = pair;
  return sign === "left-minus-right" ? `d${a}${b}` : `d${b}${a}`;
}

/** @param {[number,number]} pair */
function sumLabel(pair) {
  const [a, b] = pair;
  return `s${a}${b}`;
}

/** @param {{pairs: [number,number][], name:string}} traversal @param {string} diffSign @param {string} channelOrder @param {string} returnMode */
function signature(traversal, diffSign, channelOrder, returnMode) {
  const firstPairs = traversal.pairs;
  const secondPairs = returnMode === "bounce" ? firstPairs.slice().reverse() : firstPairs.slice();
  const diffFirst = firstPairs.map((p) => diffLabel(p, diffSign));
  const diffSecond = secondPairs.map((p) => diffLabel(p, diffSign));
  const sumFirst = firstPairs.map(sumLabel);
  const sumSecond = secondPairs.map(sumLabel);
  return channelOrder === "difference-first"
    ? diffFirst.concat(sumSecond)
    : sumFirst.concat(diffSecond);
}

const family = [];
for (const traversal of pairOrders) {
  for (const diffSign of diffSigns) {
    for (const channelOrder of channelOrders) {
      for (const returnMode of returnModes) {
        family.push({
          traversal: traversal.name,
          diffSign,
          channelOrder,
          returnMode,
          signature: signature(traversal, diffSign, channelOrder, returnMode),
        });
      }
    }
  }
}
assert.equal(family.length, 16);
assert.equal(new Set(family.map((x) => x.signature.join(","))).size, 16);

const canonical = ["d03", "d12", "s12", "s03"];
const hits = family.filter((x) => x.signature.join(",") === canonical.join(","));
assert.equal(hits.length, 1);
assert.deepEqual(hits[0], {
  traversal: "outer-in",
  diffSign: "left-minus-right",
  channelOrder: "difference-first",
  returnMode: "bounce",
  signature: canonical,
});

const allPerfectMatchings = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];
assert.equal(allPerfectMatchings.length, 3);
assert.deepEqual(allPerfectMatchings[2], [[0, 3], [1, 2]]);

console.log(JSON.stringify({
  status: "PASS",
  sourceObject: "p6 four-word red title in a bilaterally symmetric frame",
  bestCaseGeometrySelectedPairing: [[0, 3], [1, 2]],
  chargedPresentationFamily: {
    pairTraversal: pairOrders.map((x) => x.name),
    differenceSign: diffSigns,
    channelOrder: channelOrders,
    secondChannelTraversal: returnModes,
    survivors: family.length,
  },
  canonicalH: {
    symbolic: canonical,
    familyHits: hits.length,
    requiredChoices: hits[0],
  },
  conclusion: "Even granting mirror pairing from p6 bilateral geometry, 16 equally source-compatible H-like presentations remain. Canonical H is one member and is not locally identified; no prospective transfer should be opened.",
}, null, 2));
