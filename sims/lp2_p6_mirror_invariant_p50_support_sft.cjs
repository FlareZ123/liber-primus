"use strict";

const assert = require("node:assert/strict");

/** @param {number[]} widths */
function mirrorInvariant(widths) {
  assert.equal(widths.length, 4);
  const pairs = [[widths[0], widths[3]], [widths[1], widths[2]]];
  const blocks = pairs.map(([a,b]) => [Math.abs(a-b), a+b].sort((x,y)=>x-y));
  return blocks.sort((a,b)=>a[0]-b[0] || a[1]-b[1]);
}

/** @param {number[][]} blocks */
function flatSet(blocks) { return blocks.flat().slice().sort((a,b)=>a-b); }

const controls = [
  { page: 6, start: 71, widths: [4,1,4,2] },
  { page: 23, start: 0, widths: [2,6,3,5] },
  { page: 54, start: 0, widths: [1,4,2,2] },
].map((x)=>({...x,invariant:mirrorInvariant(x.widths)}));
assert.deepEqual(controls.map((x)=>[x.page,x.invariant]), [
  [6, [[2,6],[3,5]]], [23, [[3,7],[3,9]]], [54, [[1,3],[2,6]]],
]);
const p50Supports = [3,5,6,2];
const p50Blocks = [p50Supports.slice(0,2), p50Supports.slice(2,4)]
  .map((b)=>b.slice().sort((a,c)=>a-c))
  .sort((a,b)=>a[0]-b[0] || a[1]-b[1]);
assert.deepEqual(p50Blocks, [[2,6],[3,5]]);
const matches = controls.filter((x)=>JSON.stringify(x.invariant) === JSON.stringify(p50Blocks));
assert.deepEqual(matches.map((x)=>x.page), [6]);
assert.deepEqual(flatSet(controls[0].invariant), [2,3,5,6]);
assert.deepEqual(p50Supports.slice().sort((a,b)=>a-b), [2,3,5,6]);
console.log(JSON.stringify({
  status:"PASS",
  invariant:"for each visible mirror pair, unordered {absolute difference, sum}; pair blocks unordered",
  p6:{widths:[4,1,4,2],invariant:controls[0].invariant},
  heldOutP50:{supportCoordinatesByPrimeRank:p50Supports,normalizedBlocks:p50Blocks},
  matchedExactFourWordRedSpanControls:controls,
  exactControlMatches:matches.map((x)=>({page:x.page,start:x.start})),
  conclusion:"The p6 mirror-pair invariant reproduces the independently selected p50 support-coordinate blocks without canonical H serialization; among all exact four-word red spans, p6 is the sole match."
},null,2));
