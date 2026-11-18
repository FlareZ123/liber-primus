'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const grid = require('../resources/liber-primus/lp2-grid-256.json');

const root = path.resolve(__dirname, '..');
const signed2016 = fs.readFileSync(
  path.join(root, 'resources', 'cicada2016-4gq25.md'),
  'utf8'
);

assert.ok(
  signed2016.includes('The path lies empty; epiphany seeks the devoted.')
);
assert.ok(
  signed2016.includes('Beware false paths.')
);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);

/** @type {Map<string, number[]>} */
const positions = new Map();
tokens.forEach((token, index) => {
  const current = positions.get(token);
  if (current) current.push(index);
  else positions.set(token, [index]);
});

assert.deepEqual(positions.get('00'), [192, 229]);

const zeroInterior = tokens.slice(193, 229);
assert.equal(zeroInterior.length, 36);
assert.ok(zeroInterior.every((token) => token !== '00'));

/** @type {Array<{token:string,i:number,j:number,interior:number}>} */
const allEqualPairs = [];
/** @type {Array<{token:string,i:number,j:number,interior:number}>} */
const consecutiveEqualPairs = [];

for (const [token, indices] of positions.entries()) {
  for (let a = 0; a < indices.length; a++) {
    for (let b = a + 1; b < indices.length; b++) {
      allEqualPairs.push({
        token,
        i: indices[a],
        j: indices[b],
        interior: indices[b] - indices[a] - 1
      });
    }
  }

  for (let k = 0; k + 1 < indices.length; k++) {
    consecutiveEqualPairs.push({
      token,
      i: indices[k],
      j: indices[k + 1],
      interior: indices[k + 1] - indices[k] - 1
    });
  }
}

const repeatedTypes = [...positions.values()].filter(
  (indices) => indices.length > 1
);
const exactTwoTypes = [...positions.values()].filter(
  (indices) => indices.length === 2
);

assert.equal(positions.size, 161);
assert.equal(repeatedTypes.length, 69);
assert.equal(exactTwoTypes.length, 49);
assert.equal(allEqualPairs.length, 127);
assert.equal(consecutiveEqualPairs.length, 95);

const gap36All = allEqualPairs.filter((pair) => pair.interior === 36);
const gap36Consecutive = consecutiveEqualPairs.filter(
  (pair) => pair.interior === 36
);

assert.deepEqual(gap36All, [
  { token: '00', i: 192, j: 229, interior: 36 }
]);
assert.deepEqual(gap36Consecutive, gap36All);

// Any consecutive occurrences of the same token delimit an interval that
// contains no further occurrence of that token. This makes "empty of its
// own delimiter" a generic property of all 95 consecutive repeat brackets.
for (const pair of consecutiveEqualPairs) {
  assert.ok(
    tokens
      .slice(pair.i + 1, pair.j)
      .every((token) => token !== pair.token)
  );
}

console.log(JSON.stringify({
  signedSource: {
    pathPhrasePresent: true,
    falsePathsWarningPresent: true
  },
  table: {
    cells: tokens.length,
    distinctTokens: positions.size,
    repeatedTokenTypes: repeatedTypes.length,
    exactTwoOccurrenceTypes: exactTwoTypes.length,
    allEqualTokenPairs: allEqualPairs.length,
    consecutiveSameTokenIntervals: consecutiveEqualPairs.length
  },
  literalZeroPath: {
    endpoints: positions.get('00'),
    interiorCells: zeroInterior.length,
    interiorContainsZero: false,
    uniqueEqualTokenPairWithInterior36: gap36All.length === 1
  },
  semanticControl:
    'All 95 consecutive same-token intervals are empty of their own delimiter; the source phrase does not itself bind empty to token 00 or the pp49-p51 table.',
  conclusion:
    'The 00 bracket is structurally unique once empty=00 and row-major p50 are assumed, but the signed phrase alone does not source-select that interpretation and supplies no typed receiver.'
}, null, 2));
