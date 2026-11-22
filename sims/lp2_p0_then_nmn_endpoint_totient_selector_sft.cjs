'use strict';

/**
 * SFT: source-only next-key selector at the post-DEATH continuation's THEN
 * endpoint W(25,27).
 *
 * Frozen upstream state from Agent29's post-DEATH continuation:
 *   THEN endpoint W(25,27)
 *   THEN key mirror IA-IA-IA has radius 1
 *
 * This test does not inspect the next block's ciphertext or plaintext.
 *
 * Source observations:
 * 1. The endpoint has three equal-outer mirror incidences, radii 10, 9 and 1.
 *    Carrying the current key radius 1 uniquely selects W-NG-W.
 * 2. The endpoint coordinates independently self-check the source rune:
 *      25 - phi(27) = 7 = W
 *      27 - phi(25) = 7 = W
 * 3. The two coordinate totients are 20 and 18. Their arithmetic mean is
 *    19=M. Their two natural half-values are 10=I and 9=N.
 * 4. Exhaust the bounded symmetric-node family I-M-I versus N-M-N in the
 *    untouched 479-node equal-outer graph. I-M-I occurs zero times; N-M-N
 *    occurs exactly once.
 *
 * Only graph existence selects between the two half-totient candidates.
 *
 * Run:
 *   node sims/lp2_p0_then_nmn_endpoint_totient_selector_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const grid = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(grid.length, 729);

const at = cell => grid[(cell[0] - 1) * 27 + cell[1] - 1];
const same = (first, second) =>
  first[0] === second[0] && first[1] === second[1];
const inBounds = cell =>
  cell[0] >= 1 && cell[0] <= 27 && cell[1] >= 1 && cell[1] <= 27;
const mod = value => ((value % 29) + 29) % 29;

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let remaining = n;

  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    result -= result / factor;
    while (remaining % factor === 0) remaining /= factor;
  }

  if (remaining > 1) result -= result / remaining;
  return result;
}

/** @param {number} n @returns {number} */
function mu(n) {
  let sign = 1;
  let remaining = n;

  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    remaining /= factor;
    sign = -sign;
    if (remaining % factor === 0) return 0;
    while (remaining % factor === 0) remaining /= factor;
  }

  return remaining > 1 ? -sign : sign;
}

const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mirrors = [];

for (let row = 1; row <= 27; row += 1) {
  for (let column = 1; column <= 27; column += 1) {
    for (const axis of axes) {
      for (let radius = 1; radius <= 13; radius += 1) {
        const first = [
          row - axis[0] * radius,
          column - axis[1] * radius,
        ];
        const second = [
          row + axis[0] * radius,
          column + axis[1] * radius,
        ];

        if (!inBounds(first) || !inBounds(second)) break;

        const center = [row, column];
        if (at(first) === at(second) && at(center) !== 0) {
          mirrors.push({
            center,
            first,
            second,
            radius,
            axis,
            raw: [at(first), at(center), at(second)],
          });
        }
      }
    }
  }
}

assert.equal(mirrors.length, 479);

/** @param {number[]} cell @returns {object[]} */
function touching(cell) {
  return mirrors.filter(node =>
    same(cell, node.center) ||
    same(cell, node.first) ||
    same(cell, node.second)
  );
}

/**
 * @param {number} outer
 * @param {number} center
 * @returns {object[]}
 */
function mirrorsByRaw(outer, center) {
  return mirrors.filter(node =>
    node.raw[0] === outer &&
    node.raw[1] === center &&
    node.raw[2] === outer
  );
}

/** @param {{raw:number[]}} node @returns {number[]} */
function deriveKey(node) {
  const derived = [node.raw[0], phi(node.raw[1]), node.raw[2]];
  const rotation = mod(
    derived.reduce((sum, value) => sum + mu(phi(value)), 0)
  ) % 3;

  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

// Frozen upstream state.
const thenEndpoint = [25, 27];
const thenKeyRadius = 1;
const thenRune = at(thenEndpoint);

assert.equal(corpus.translit[thenRune], 'W');
assert.equal(thenRune, 7);

// The local equal-outer ambiguity reported upstream is reproduced exactly.
const endpointIncidences = touching(thenEndpoint);
assert.equal(endpointIncidences.length, 3);
assert.deepEqual(
  endpointIncidences.map(node => ({
    runes: node.raw.map(value => corpus.translit[value]),
    radius: node.radius,
  })).sort((first, second) => first.radius - second.radius),
  [
    { runes: ['W', 'NG', 'W'], radius: 1 },
    { runes: ['W', 'W', 'W'], radius: 9 },
    { runes: ['W', 'EA', 'W'], radius: 10 },
  ]
);

// Carry the previous key radius. This removes the immediate three-way ambiguity.
const carriedRadius = endpointIncidences.filter(
  node => node.radius === thenKeyRadius
);
assert.equal(carriedRadius.length, 1);
assert.deepEqual(
  carriedRadius[0].raw.map(value => corpus.translit[value]),
  ['W', 'NG', 'W']
);
assert.deepEqual(carriedRadius[0].center, [26, 27]);

// The endpoint coordinates independently reconstruct the endpoint rune index.
const rowPhi = phi(thenEndpoint[0]);
const columnPhi = phi(thenEndpoint[1]);
assert.equal(rowPhi, 20);
assert.equal(columnPhi, 18);
assert.equal(thenEndpoint[0] - columnPhi, thenRune);
assert.equal(thenEndpoint[1] - rowPhi, thenRune);

// Build the smallest symmetric next-node family from those two source values.
// Their mean supplies the center; either half-value can supply the equal outer.
assert.equal(rowPhi % 2, 0);
assert.equal(columnPhi % 2, 0);
assert.equal((rowPhi + columnPhi) % 2, 0);

const candidateCenter = (rowPhi + columnPhi) / 2;
const candidateOuters = [rowPhi / 2, columnPhi / 2];

assert.equal(candidateCenter, 19);
assert.equal(corpus.translit[candidateCenter], 'M');
assert.deepEqual(
  candidateOuters.map(value => corpus.translit[value]),
  ['I', 'N']
);

// Exhaust exactly those two source-derived symmetric-node candidates.
const candidateMatches = candidateOuters.map(outer => ({
  outer,
  outerRune: corpus.translit[outer],
  center: candidateCenter,
  centerRune: corpus.translit[candidateCenter],
  matches: mirrorsByRaw(outer, candidateCenter),
}));

assert.deepEqual(
  candidateMatches.map(candidate => ({
    outer: candidate.outerRune,
    center: candidate.centerRune,
    count: candidate.matches.length,
  })),
  [
    { outer: 'I', center: 'M', count: 0 },
    { outer: 'N', center: 'M', count: 1 },
  ]
);

const selected = candidateMatches[1].matches[0];
assert.deepEqual(
  selected.raw.map(value => corpus.translit[value]),
  ['N', 'M', 'N']
);
assert.deepEqual(selected.center, [20, 17]);
assert.deepEqual(selected.first, [17, 17]);
assert.deepEqual(selected.second, [23, 17]);
assert.equal(selected.radius, 3);
assert.deepEqual(selected.axis, [1, 0]);

// Global uniqueness is a held-out graph property. No other N-M-N exists.
assert.equal(mirrorsByRaw(candidateOuters[1], candidateCenter).length, 1);

// Derive the ordinary route key after the node has been source-selected.
const selectedKey = deriveKey(selected);
assert.deepEqual(
  selectedKey.map(value => corpus.translit[value]),
  ['N', 'E', 'N']
);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original LP2 p0-p2 27x27 equal-outer mirror graph',
  frozenThenState: {
    endpoint: thenEndpoint,
    endpointRune: corpus.translit[thenRune],
    endpointIndex: thenRune,
    previousKeyRadius: thenKeyRadius,
    endpointMirrorIncidences: endpointIncidences.map(node => ({
      runes: node.raw.map(value => corpus.translit[value]),
      radius: node.radius,
      center: node.center,
    })),
    carriedRadiusSelection: carriedRadius[0].raw.map(
      value => corpus.translit[value]
    ),
  },
  coordinateSelfCheck: {
    rowPhi,
    columnPhi,
    rowMinusColumnPhi: thenEndpoint[0] - columnPhi,
    columnMinusRowPhi: thenEndpoint[1] - rowPhi,
    bothEqualEndpointRuneIndex: thenRune,
  },
  boundedNextNodeFamily: {
    centerIndex: candidateCenter,
    centerRune: corpus.translit[candidateCenter],
    candidates: candidateMatches.map(candidate => ({
      outerIndex: candidate.outer,
      outerRune: candidate.outerRune,
      graphMatches: candidate.matches.length,
    })),
  },
  selectedNextKeySource: {
    runes: selected.raw.map(value => corpus.translit[value]),
    center: selected.center,
    first: selected.first,
    second: selected.second,
    radius: selected.radius,
    axis: selected.axis,
    globallyUnique: true,
    derivedKey: selectedKey.map(value => corpus.translit[value]),
  },
  decision:
    'The THEN endpoint source values reduce the next equal-outer key-source family to I-M-I versus N-M-N; the untouched graph contains zero I-M-I nodes and exactly one N-M-N node. This closes the next-key-source ambiguity at the reported THEN break, while ciphertext placement for the following block remains to be derived independently.',
}, null, 2));
