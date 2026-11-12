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


/** Reuse independent established exact p56 wording from authentic φ-prime regression. */
const knownP56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const gpTokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} words @returns {number[]} */
function encodeGpWords(words) {
  const out = [];
  for (const word of words.split(' ')) {
    for (let p = 0; p < word.length;) {
      const glyph = gpTokens.find(({token}) => word.startsWith(token, p));
      assert.ok(glyph, 'Cannot GP-encode original known plaintext');
      out.push(glyph.index);
      p += glyph.token.length;
    }
  }
  return out;
}
const knownSolvableTail = [...encodeGpWords(knownP56Words), ...corpus.pages[57].indices];
const printedTail = [...corpus.pages[56].indices, ...corpus.pages[57].indices];
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
assert.equal(knownSolvableTail.length, 180);
assert.equal(printedTail.length, 180);

// Same 30×6 original source interior, zero fitted shifts and five natural traversals.
const interiorRows = rows.slice(1, -1).map(row => row.slice(1, -1));
const interiorTraversals = {
  'original-row-major': inside,
  'reverse-row-major': [...inside].reverse(),
  'alternating-row-snake': interiorRows.flatMap((row, i) => i % 2 ? [...row].reverse() : row),
  'original-column-major': Array.from({length: 6}, (_, j) => interiorRows.map(row => row[j])).flat(),
  'alternating-column-snake': Array.from({length: 6}, (_, j) =>
    j % 2 ? interiorRows.map(row => row[j]).reverse() : interiorRows.map(row => row[j])).flat(),
};
const solvedTail = {};
for (const [traversal, symbols] of Object.entries(interiorTraversals)) {
  const plainBound = bestStationaryMap(symbols, knownSolvableTail);
  const printedBound = bestStationaryMap(symbols, printedTail);
  assert.equal(plainBound.uniqueInputs, 127);
  assert(plainBound.fit <= 135 && plainBound.fit >= 131);
  assert(printedBound.fit <= 131 && printedBound.fit >= 128);
  assert.equal(bestStationaryMap(symbols, knownMapPlant(symbols)).fit, 180);
  solvedTail[traversal] = {knownPlain: plainBound.fit, printedCipher: printedBound.fit};
}
assert.deepEqual(solvedTail, {
  'original-row-major': {knownPlain: 133, printedCipher: 130},
  'reverse-row-major': {knownPlain: 131, printedCipher: 131},
  'alternating-row-snake': {knownPlain: 131, printedCipher: 130},
  'original-column-major': {knownPlain: 132, printedCipher: 131},
  'alternating-column-snake': {knownPlain: 135, printedCipher: 128},
});
console.log(JSON.stringify({
  receiver: 'fully solved p56 plaintext (85 GP runes) + authentic clear p57 (95 GP runes)',
  innerSource: 'original p49–51 grid 30x6 interior, 127 distinct printed labels',
  naturalAndTraversalFits: solvedTail, exactMapFits: 0,
  minimumMismatches: 45, allKnownPlaintextPlants: '5 of 5 recover all 180 runes'
}, null, 2));
