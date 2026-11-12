'use strict';

// Original-input SFT: printed 32x8 table ring and interior against the terminal LP2 receiver.
const assert = require('node:assert/strict');
const table = require('../resources/liber-primus/base60-grid.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/**
 * @param {readonly (string|number)[]} source
 * @param {readonly number[]} target
 * @returns {{fit: number, uniqueInputs: number, conflictingInputs: number}}
 */
function bestStationaryMap(source, target) {
  assert.equal(source.length, target.length);
  const hist = new Map();
  for (let i = 0; i < source.length; i++) {
    const counts = hist.get(source[i]) || new Map();
    counts.set(target[i], (counts.get(target[i]) || 0) + 1);
    hist.set(source[i], counts);
  }
  const groups = [...hist.values()];
  return {
    fit: groups.reduce((sum, counts) => sum + Math.max(...counts.values()), 0),
    uniqueInputs: groups.length,
    conflictingInputs: groups.filter((counts) => counts.size > 1).length,
  };
}

/**
 * @param {readonly string[]} symbols
 * @returns {number[]}
 */
function knownMapPlant(symbols) {
  const labelMap = new Map([...new Set(symbols)].map((name, i) => [name, (i * 7 + 3) % 29]));
  return symbols.map((name) => labelMap.get(name));
}

const rows = table.rows;
assert.equal(rows.length, 32);
assert(rows.every((row) => row.length === 8));
const ring = [
  ...rows[0],
  ...rows.slice(1, -1).map((row) => row[7]),
  ...[...rows[31]].reverse(),
  ...rows.slice(1, -1).reverse().map((row) => row[0]),
];
const inside = rows.slice(1, -1).flatMap((row) => row.slice(1, -1));
const external = corpus.pages[55].indices;
const internal = [...corpus.pages[53].indices, corpus.pages[54].indices[0]];
assert.equal(ring.length, 76);
assert.equal(inside.length, 180);
assert.equal(external.length, 76);
assert.equal(internal.length, 180);
assert.equal(corpus.pages[53].indices.length, 179);
assert.equal(corpus.pages[54].indices[0], 24);

const outerClockwise = bestStationaryMap(ring, external);
const innerForward = bestStationaryMap(inside, internal);
const innerReverse = bestStationaryMap([...inside].reverse(), internal);
assert.deepEqual(
  { outerClockwise, innerForward, innerReverse },
  {
    outerClockwise: { fit: 69, uniqueInputs: 68, conflictingInputs: 6 },
    innerForward: { fit: 130, uniqueInputs: 127, conflictingInputs: 36 },
    innerReverse: { fit: 133, uniqueInputs: 127, conflictingInputs: 37 },
  },
);

let bestRing = { fit: -1, orientation: '', phase: -1 };
for (const [orientation, base] of [
  ['clockwise', ring],
  ['counterclockwise', [...ring].reverse()],
]) {
  for (let phase = 0; phase < 76; phase++) {
    const candidate = [...base.slice(phase), ...base.slice(0, phase)];
    const score = bestStationaryMap(candidate, external);
    if (score.fit > bestRing.fit) bestRing = { fit: score.fit, orientation, phase };
  }
}
assert.deepEqual(bestRing, { fit: 71, orientation: 'clockwise', phase: 45 });

const maxMatches = bestRing.fit + Math.max(innerForward.fit, innerReverse.fit);
assert.equal(maxMatches, 204);
assert.equal(256 - maxMatches, 52);

for (const source of [ring, inside, [...inside].reverse()]) {
  const plant = knownMapPlant(source);
  assert.equal(bestStationaryMap(source, plant).fit, source.length);
}
console.log(JSON.stringify({
  geometry: { originalTable: '32x8', ring: ring.length, interior: inside.length, target: 'p55(76)+p53(179)+p54first(1)' },
  sourceTokenCounts: { ring: outerClockwise.uniqueInputs, interior: innerForward.uniqueInputs },
  naturalFits: { perimeter: outerClockwise.fit, interior: innerForward.fit },
  independentlyBestFits: { perimeter: bestRing, interior: innerReverse.fit, total: maxMatches, forcedEdits: 256 - maxMatches },
  plantControls: 'three source-alphabet plants exactly 76/76, 180/180, 180/180',
}, null, 2));
