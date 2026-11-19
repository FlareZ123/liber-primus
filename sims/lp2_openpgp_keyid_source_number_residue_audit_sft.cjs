"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} x @param {number} y @returns {[number, number]} */
function H(x, y) {
  return [mod29(x - y), mod29(x + y)];
}

/** @param {number[]} values @returns {number[]} */
function outsideInH(values) {
  const output = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    output.push(...H(values[left], values[right]));
  }
  return output;
}

const keyIdMatch = signed.match(/7A35090F/u);
assert.ok(keyIdMatch);
const nibbles = [...keyIdMatch[0]].map((character) => Number.parseInt(character, 16));
const hShell = outsideInH(nibbles);
assert.deepEqual(hShell, [21,22,10,10,23,12,5,5]);

const p = 23;
const sourceNumbers = {
  src1033: 1033 % p,
  src3299: 3299 % p,
  src3301: 3301 % p,
};
assert.deepEqual(sourceNumbers, {src1033:21, src3299:10, src3301:12});

const state = {p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const fields = Object.entries(state);
const expressions = [];

for (const [name, value] of fields) {
  expressions.push({name, value, complexity:0, kind:"field"});
}
for (const value of [0,1,28,7,10,3,5,9,15]) {
  expressions.push({name:`const(${value})`, value, complexity:0, kind:"constant"});
}
for (const [name, value] of fields) {
  expressions.push({name:`${name}+1`, value:mod29(value + 1), complexity:1, kind:"offset"});
  expressions.push({name:`${name}-1`, value:mod29(value - 1), complexity:1, kind:"offset"});
}
for (let i = 0; i < fields.length; i += 1) {
  const [leftName, leftValue] = fields[i];
  for (let j = 0; j < fields.length; j += 1) {
    const [rightName, rightValue] = fields[j];
    if (i < j) {
      expressions.push({
        name:`${leftName}+${rightName}`,
        value:mod29(leftValue + rightValue),
        complexity:2,
        kind:"pair",
      });
      expressions.push({
        name:`${leftName}*${rightName}`,
        value:mod29(leftValue * rightValue),
        complexity:2,
        kind:"pair",
      });
    }
    if (i !== j) {
      expressions.push({
        name:`${leftName}-${rightName}`,
        value:mod29(leftValue - rightValue),
        complexity:2,
        kind:"pair",
      });
    }
  }
}
assert.equal(expressions.length, 114);

for (const [name, value] of Object.entries(sourceNumbers)) {
  expressions.push({name, value, complexity:0, kind:"historical-source"});
}
assert.equal(expressions.length, 117);

const byValue = new Map();
for (const expression of expressions) {
  if (!byValue.has(expression.value)) byValue.set(expression.value, []);
  byValue.get(expression.value).push(expression);
}

const shellValues = [21,22,10,23,12,5];
const counts = shellValues.map((value) => {
  const matches = byValue.get(value);
  const minComplexity = Math.min(...matches.map((entry) => entry.complexity));
  const minimal = matches.filter((entry) => entry.complexity === minComplexity);
  return {
    value,
    count:matches.length,
    minComplexity,
    minimalCount:minimal.length,
    minimal:minimal.map((entry) => entry.name),
  };
});

assert.deepEqual(
  counts.map((entry) => [entry.value, entry.count, entry.minComplexity, entry.minimalCount]),
  [
    [21,5,0,1],
    [22,3,1,1],
    [10,6,0,2],
    [23,3,0,1],
    [12,4,0,1],
    [5,4,0,2],
  ]
);

const multiply = (values) => values.reduce((product, value) => product * value, 1);
const completeTemplates = multiply(counts.map((entry) => entry.count));
const minimumTemplates = multiply(counts.map((entry) => entry.minimalCount));
assert.equal(completeTemplates, 4320);
assert.equal(minimumTemplates, 4);

// Favor the source-number interpretation maximally by forcing all three
// historical residues. The remaining minimum-complexity ambiguity is exactly
// the shell value5 choice: direct state g versus literal key-ID constant 5.
const forcedSource = {
  21:"src1033",
  10:"src3299",
  12:"src3301",
};
for (const [valueText, name] of Object.entries(forcedSource)) {
  const value = Number(valueText);
  assert.ok(byValue.get(value).some((entry) => entry.name === name));
}
const five = counts.find((entry) => entry.value === 5);
assert.ok(five);
assert.deepEqual(new Set(five.minimal), new Set(["g", "const(5)"]));

const forcedSourceMinimumTemplates = 2;
assert.equal(forcedSourceMinimumTemplates, five.minimalCount);

// Exact order-free random-key-ID control.  A 32-bit key ID consists of four
// independent hexadecimal nibble pairs.  Count pair-output subsets inside the
// six-value source set, then compose four pairs by bitmask dynamic programming.
const sourceSet = [5,10,12,21,22,23];
const sourceBit = new Map(sourceSet.map((value, index) => [value, 1 << index]));
const pairMaskCounts = new Map();

for (let left = 0; left < 16; left += 1) {
  for (let right = 0; right < 16; right += 1) {
    const output = H(left, right);
    if (!output.every((value) => sourceBit.has(value))) continue;
    const mask = sourceBit.get(output[0]) | sourceBit.get(output[1]);
    pairMaskCounts.set(mask, (pairMaskCounts.get(mask) || 0) + 1);
  }
}

let states = new Map([[0, 1]]);
for (let pair = 0; pair < 4; pair += 1) {
  const next = new Map();
  for (const [mask, count] of states) {
    for (const [pairMask, pairCount] of pairMaskCounts) {
      const merged = mask | pairMask;
      next.set(merged, (next.get(merged) || 0) + count * pairCount);
    }
  }
  states = next;
}

const fullMask = (1 << sourceSet.length) - 1;
const orderFreeCoveringIds = states.get(fullMask) || 0;
const totalKeyIds = 16 ** 8;
assert.equal(orderFreeCoveringIds, 3456);
assert.equal(totalKeyIds, 4294967296);
assert.deepEqual(new Set(hShell), new Set(sourceSet));

console.log(JSON.stringify({
  status:"PASS",
  keyId:keyIdMatch[0],
  hShell,
  sourceNumbers,
  expandedGrammar:{
    expressions:expressions.length,
    completeTemplates,
    minimumTemplates,
    counts,
  },
  forcedHistoricalResidues:{
    mapping:forcedSource,
    minimumWholeTemplates:forcedSourceMinimumTemplates,
    remainingValue5Choices:five.minimal,
  },
  orderFreeRandomKeyIdControl:{
    sourceSet,
    matchingIds:orderFreeCoveringIds,
    totalIds:totalKeyIds,
    probability:orderFreeCoveringIds / totalKeyIds,
  },
  decision:"Historical residues compress the minimum family and give a rare order-free six-value closure under a uniform random-key-ID control, but they do not identify one whole OpenPGP shell template. Keep the receiver sealed.",
}, null, 2));
