'use strict';

/**
 * p27 red13 -> DH/base59 -> EMERGE -> p55/p56 dual-coordinate closure.
 *
 * Source-fixed inputs:
 * - p27 red heading length19 and red13 select I/31, leaving6 runes;
 * - (31,6) is therefore the marker-derived coordinate pair;
 * - the signed 2013 worked DH tuple is p=23,g=5,serverPublic=8,
 *   clientPublic=19,shared=2;
 * - p50 is the original 32x8 printed numeral table;
 * - the p27 shedding route independently supplies the clear instruction EMERGE.
 *
 * The already-established zero-based coordinate (31,6) = 254 selects token39,
 * which transduces base59 186=(23,2) to base60 189=(23,5). This test checks the
 * newly observed continuation: after the 8-hop base59 DH walk reaches the
 * base59 fixed point189, switch that same token to base60 ("emerge" from the
 * fixed point), then reuse the signed server-public count8 under base59.
 * The endpoint must be the one-based coordinate control245, whose token0u
 * transduces directly to LP2 pages55/56.
 *
 * Run: node sims/lp2_p27_dh_emerge_dual_coordinate_cycle_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'
));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const A60 = grid.alphabet;
const A59 = A60.replace('f', '');
assert.equal(A60.length, 60);
assert.equal(A59.length, 59);

/**
 * @param {string} alphabet
 * @param {string} token
 */
function value(alphabet, token) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

/**
 * @param {number} start
 * @param {string} alphabet
 * @param {number} steps
 */
function walk(start, alphabet, steps) {
  const path = [start];
  let at = start;
  for (let i = 0; i < steps; i++) {
    at = value(alphabet, tokens[at]);
    assert.ok(at >= 0 && at < 256);
    path.push(at);
  }
  return path;
}

const markerPrime = 31;
const residualRunes = 6;
const serverPublic = 8;

const zeroBasedCoordinate = markerPrime * 8 + residualRunes;
const oneBasedCoordinate = (markerPrime - 1) * 8 + (residualRunes - 1);
assert.equal(zeroBasedCoordinate, 254);
assert.equal(oneBasedCoordinate, 245);

// Zero-based coordinate: DH coordinate transducer.
assert.equal(tokens[zeroBasedCoordinate], '39');
assert.equal(value(A59, tokens[zeroBasedCoordinate]), 186);
assert.equal(value(A60, tokens[zeroBasedCoordinate]), 189);
assert.equal(186, 23 * 8 + 2);
assert.equal(189, 23 * 8 + 5);

const firstLeg = walk(186, A59, serverPublic);
assert.deepEqual(firstLeg, [186, 19, 33, 112, 72, 161, 214, 247, 189]);
assert.equal(value(A59, tokens[189]), 189);
const base59FixedPoints = tokens
  .map((token, cell) => value(A59, token) === cell ? cell : null)
  .filter((cell) => cell !== null);
assert.deepEqual(base59FixedPoints, [189]);

// EMERGE from the base59 fixed point by reading the same printed token
// in the other already-frozen radix.
assert.equal(tokens[189], '3C');
const emerged = value(A60, tokens[189]);
assert.equal(emerged, 192);
assert.equal(tokens[emerged], '00');

// Reuse the signed server-public hop count8 after the radix switch.
const secondLeg = walk(emerged, A59, serverPublic);
assert.deepEqual(secondLeg, [192, 0, 200, 108, 14, 180, 142, 158, 245]);
assert.equal(secondLeg.at(-1), oneBasedCoordinate);

// Control: keeping base60 after the switch misses the paired coordinate.
const secondLegBase60 = walk(emerged, A60, serverPublic);
assert.equal(secondLegBase60.at(-1), 197);
assert.notEqual(secondLegBase60.at(-1), oneBasedCoordinate);

// One-based coordinate: page-number transducer.
assert.equal(tokens[oneBasedCoordinate], '0u');
assert.equal(value(A59, tokens[oneBasedCoordinate]), 55);
assert.equal(value(A60, tokens[oneBasedCoordinate]), 56);
const pagePairCells = tokens
  .map((token, cell) => (
    value(A59, token) === 55 && value(A60, token) === 56 ? cell : null
  ))
  .filter((cell) => cell !== null);
assert.deepEqual(pagePairCells, [94, 245]);
assert.ok(corpus.pages.some((page) => page.page === 55));
assert.ok(corpus.pages.some((page) => page.page === 56));

console.log(JSON.stringify({
  classification:
    'source-constrained closed routing mechanism; no unknown plaintext recovered',
  marker: {
    selectedPrime: markerPrime,
    residualRunes,
    zeroBasedCoordinate,
    oneBasedCoordinate
  },
  zeroBasedTransducer: {
    token: tokens[zeroBasedCoordinate],
    base59: value(A59, tokens[zeroBasedCoordinate]),
    base60: value(A60, tokens[zeroBasedCoordinate]),
    meanings: ['(23,2) signed DH modulus/shared', '(23,5) signed DH modulus/base']
  },
  dhWalk: {
    hops: serverPublic,
    base59: firstLeg,
    fixedPoint: firstLeg.at(-1),
    allBase59FixedPoints: base59FixedPoints
  },
  emerge: {
    fixedPointToken: tokens[189],
    switchedBase60Value: emerged,
    switchedToken: tokens[emerged],
    base59EightHopPath: secondLeg,
    base60ControlEightHopPath: secondLegBase60
  },
  oneBasedTransducer: {
    token: tokens[oneBasedCoordinate],
    base59: value(A59, tokens[oneBasedCoordinate]),
    base60: value(A60, tokens[oneBasedCoordinate]),
    meanings: ['LP2 p55', 'solved LP2 p56'],
    allCellsWith55to56RadixPair: pagePairCells
  },
  decision:
    'The marker-derived coordinate pair closes twice: zero-based form enters the signed-DH table route; after the p27-derived EMERGE radix switch and the same eight-hop count, the walk lands on the one-based form, whose two radix readings are pages55/56.'
}, null, 2));
