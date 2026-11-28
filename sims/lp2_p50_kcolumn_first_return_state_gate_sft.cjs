'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'),
  'utf8'
));

const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.pages.flatMap((page) => page.bytes);
const alphabet59 = grid.alphabet.replace('f', '');

assert.equal(tokens.length, 256);
assert.equal(base60.length, 256);

/** @param {string} token */
function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return 59 * high + low;
}

const K = 2;
const starts = [18, 210, 186];
const stateRows = new Set([0, 2, 3, 4, 5, 6, 8, 15, 19, 23, 26]);

/**
 * @param {number} start
 * @param {(cell:number)=>number} decode
 */
function firstKReturn(start, decode) {
  let state = start;
  const seen = new Set([state]);
  const pathCells = [state];

  for (let step = 1; step <= 300; step += 1) {
    const next = decode(state);
    if (next < 0 || next > 255) {
      return { kind: 'out-of-range', terminal: next, pathCells };
    }
    state = next;
    pathCells.push(state);

    if (state % 8 === K) {
      return {
        kind: 'return-K',
        terminal: state,
        row: Math.floor(state / 8),
        hops: step,
        pathCells,
      };
    }
    if (seen.has(state)) {
      return {
        kind: 'cycle',
        terminal: state,
        row: Math.floor(state / 8),
        hops: step,
        pathCells,
      };
    }
    seen.add(state);
  }
  throw new Error('unexpected pointer limit');
}

const decoders = {
  base60: (cell) => base60[cell],
  base59: (cell) => decode59(tokens[cell]),
};

const results = Object.fromEntries(
  Object.entries(decoders).map(([name, decode]) => [
    name,
    starts.map((start) => firstKReturn(start, decode)),
  ])
);

assert.deepEqual(
  results.base60.map((item) => [item.kind, item.terminal, item.row, item.hops]),
  [
    ['return-K', 114, 14, 20],
    ['return-K', 82, 10, 4],
    ['return-K', 114, 14, 3],
  ]
);

assert.deepEqual(
  results.base59.slice(0, 2).map((item) => [item.kind, item.terminal, item.row, item.hops]),
  [
    ['return-K', 146, 18, 4],
    ['return-K', 218, 27, 6],
  ]
);
assert.deepEqual(
  results.base59[2].pathCells,
  [186, 19, 33, 112, 72, 161, 214, 247, 189, 189]
);
assert.equal(results.base59[2].kind, 'cycle');

const typed = {
  base60: results.base60.map((item) => stateRows.has(item.row)),
  base59: results.base59.map((item) =>
    item.kind === 'return-K' ? stateRows.has(item.row) : false
  ),
};
assert.deepEqual(typed.base60, [false, false, false]);
assert.deepEqual(typed.base59, [false, false, false]);

console.log(JSON.stringify({
  status: 'PASS',
  starts,
  stateRows: [...stateRows],
  results,
  typed,
  decision: 'Neither live radix closes the three source-defined K-column register cells under first-K-return absolute-pointer traversal.',
}, null, 2));
