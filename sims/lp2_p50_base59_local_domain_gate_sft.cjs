'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'
));

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace('f', '');

/** @param {string} token */
function decode59(token) {
  const hi = alphabet59.indexOf(token[0]);
  const lo = alphabet59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * 59 + lo;
}

/** @param {number} start */
function walkToRepeat(start) {
  const seen = new Set();
  const route = [];
  let current = start;
  while (!seen.has(current)) {
    assert.ok(current >= 0 && current < 256);
    seen.add(current);
    route.push(current);
    current = decode59(tokens[current]);
  }
  return { route, repeated: current };
}

const sinks = [];
for (let start = 0; start < 256; start += 1) {
  const result = walkToRepeat(start);
  sinks.push(result.repeated);
}
assert.ok(sinks.every((value) => value === 189));
assert.equal(decode59(tokens[189]), 189);

function fixedHops(start, count) {
  let current = start;
  const route = [current];
  for (let i = 0; i < count; i += 1) {
    current = decode59(tokens[current]);
    route.push(current);
  }
  return route;
}

const p27 = fixedHops(186, 8);
assert.deepEqual(p27, [186,19,33,112,72,161,214,247,189]);

const roadK = fixedHops(42, 5);
assert.deepEqual(roadK, [42,28,148,242,41,83]);

const primitiveState = new Set([2,3,4,5,6,8,15,19,23]);
assert.equal(primitiveState.has(Math.floor(189 / 8)), true);
assert.equal(primitiveState.has(decode59(tokens[83])), false);

assert.equal(186 % 8, 2);
assert.equal(42 % 8, 2);
assert.equal(Math.floor(186 / 8), 23);
assert.equal(Math.floor(42 / 8), 5);

const mirror = (cell) => Math.floor(cell / 8) * 8 + (7 - (cell % 8));
assert.equal(mirror(189), 186);
assert.equal(mirror(186), 189);

console.log(JSON.stringify({
  status: 'PASS',
  allStartDomain: {
    startCount: sinks.length,
    uniqueRepeatedStates: [...new Set(sinks)],
    fixedPoint: 189,
  },
  finiteHopCircuits: {
    p27: { start: 186, count: 8, route: p27 },
    roadK: { start: 42, count: 5, route: roadK },
  },
  mirrorOrbit: [189, 186],
  decision: 'No source-visible local start-domain can exclude cell42 while preserving the prior all-256-start pointer semantics; the mirror-only class has no unused target.',
}, null, 2));
