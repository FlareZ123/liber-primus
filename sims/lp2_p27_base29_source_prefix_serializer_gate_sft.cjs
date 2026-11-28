#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'),
  'utf8',
));

const tokens = grid.rows.flat();
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(tokens.length, 256);
assert.equal(alphabet59.length, 59);

/** @param {string} token @returns {number} */
function value59(token) {
  const hi = alphabet59.indexOf(token[0]);
  const lo = alphabet59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return 59 * hi + lo;
}

const d59 = tokens.map(value59);

// Frozen p27-selected A=8 pointer walk.
const fullPath = [186, 19, 33, 112, 72, 161, 214, 247, 189];
for (let i = 0; i < fullPath.length - 1; i += 1) {
  assert.equal(d59[fullPath[i]], fullPath[i + 1]);
}
assert.equal(d59[189], 189);

const preterminal = fullPath.slice(0, -1);
assert.equal(preterminal.length, 8);

const q29 = (value) => Math.floor(value / 29);
const r29 = (value) => value % 29;
const q8 = (value) => Math.floor(value / 8);
const r8 = (value) => value % 8;
const tokenHigh59 = (cell) => alphabet59.indexOf(tokens[cell][0]);
const tokenLow59 = (cell) => alphabet59.indexOf(tokens[cell][1]);

/** @param {number[]} values @param {number} modulus @returns {number[]} */
function differences(values, modulus) {
  return values.slice(1).map((value, i) =>
    ((value - values[i]) % modulus + modulus) % modulus
  );
}

const views = {
  raw: preterminal,
  address_q29: preterminal.map(q29),
  address_r29: preterminal.map(r29),
  address_row8: preterminal.map(q8),
  address_col8: preterminal.map(r8),
  token_high59: preterminal.map(tokenHigh59),
  token_low59: preterminal.map(tokenLow59),
  q29_edge_diffs: differences(fullPath.map(q29), 29),
  r29_edge_diffs: differences(fullPath.map(r29), 29),
};

const target = [0, 1, 2, 3, 5, 6, 7, 8];
const sorted = (values) => [...values].sort((a, b) => a - b);
const matches = Object.entries(views)
  .filter(([, values]) =>
    JSON.stringify(sorted(values)) === JSON.stringify(target)
  )
  .map(([name]) => name);

assert.deepEqual(views.address_q29, [6, 0, 1, 3, 2, 5, 7, 8]);
assert.deepEqual(matches, ['address_q29']);

// Fresh #3464 holdout: BASE29 quotient4 (EMPTY) direct predecessors.
const pathSet = new Set(fullPath);
const row4Hits = [];
for (let low = 0; low < 29; low += 1) {
  const cell = 4 * 29 + low;
  assert.ok(cell < 256);
  if (pathSet.has(d59[cell])) {
    row4Hits.push({
      cell,
      base29: [4, low],
      token: tokens[cell],
      next: d59[cell],
      pathIndex: fullPath.indexOf(d59[cell]),
    });
  }
}
assert.deepEqual(row4Hits, []);

console.log(JSON.stringify({
  status: 'PASS',
  directorIssue: 3464,
  fixedPath: fullPath,
  preterminal,
  sourceOpeningTarget: target,
  views,
  matchingLicensedScalarViews: matches,
  freshEmptyRowHoldout: {
    preregisteredRule:
      'charge all 29 BASE29-quotient-4 cells for a one-edge base59 predecessor into the fixed p27 path',
    testedCells: [116, 144],
    hits: row4Hits,
    result: 'NEGATIVE',
  },
  decision:
    'Historical BASE29 address quotient is the only charged serializer exposing source indices 0..8 with EMPTY=4 omitted, but the fresh direct EMPTY-row predecessor consequence fails 0/29. Keep the p27 tape as structural compression without an executable consumer.',
}, null, 2));
