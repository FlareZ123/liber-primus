"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"
));
const tokens = grid.rows.flat();
const alpha = grid.alphabet;
const mod = (x, m) => ((x % m) + m) % m;

/** @param {string} token @returns {number} */
function base60(token) {
  assert.equal(token.length, 2);
  const a = alpha.indexOf(token[0]);
  const b = alpha.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  return 60 * a + b;
}

const W3 = [6, 27, 15, 17]; // [a,-K,b,K+b]
const centralCells = [43, 44];
const central = centralCells.map((i) => mod(base60(tokens[i]), 29));
assert.deepEqual(tokens.slice(43, 45), ["1D", "3o"]);
assert.deepEqual(central, [15, 27]);
assert.deepEqual(central, [W3[2], W3[1]]); // reverse inner W3 pair

// Pretarget commit cf19014f317d76c73c4fd052af7ba1e4a1eaed97
// froze the immediately outer mirror-shell prediction before cells42/45 were read.
const predictedOuter = [W3[3], W3[0]]; // [K+b,a] = [17,6]
assert.deepEqual(predictedOuter, [17, 6]);

const outerCells = [42, 45];
const actualOuter = outerCells.map((i) => mod(base60(tokens[i]), 29));
assert.deepEqual([tokens[42], tokens[45]], ["0S", "1l"]);
assert.deepEqual(actualOuter, [28, 20]);
assert.notDeepEqual(actualOuter, predictedOuter);

console.log(JSON.stringify({
  status: "PASS",
  pretargetCommit: "cf19014f317d76c73c4fd052af7ba1e4a1eaed97",
  sourceW3: W3,
  central: {
    cells: centralCells,
    tokens: centralCells.map((i) => tokens[i]),
    residuesMod29: central,
    relation: "reverse(W3 inner pair)",
  },
  frozenOuterPrediction: {
    cells: outerCells,
    residuesMod29: predictedOuter,
  },
  revealedOuter: {
    tokens: outerCells.map((i) => tokens[i]),
    valuesBase60: outerCells.map((i) => base60(tokens[i])),
    residuesMod29: actualOuter,
  },
  exactPredictionMatches: actualOuter.filter((v, i) => v === predictedOuter[i]).length,
  conclusion: "0/2 outer-shell prediction. Retire the p40->cell43 central W3 mirror-shell serializer; do not rescue by reorientation/radix/shift.",
}, null, 2));
