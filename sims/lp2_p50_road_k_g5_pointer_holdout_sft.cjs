'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'),
  'utf8'
));
const preterminal = JSON.parse(fs.readFileSync(
  path.join(root, 'im-results/lp2-p50-road-k-g5-pointer-preterminal.json'),
  'utf8'
));

const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.pages.flatMap((page) => page.bytes);
const alphabet59 = grid.alphabet.replace('f', '');
const primitiveState = new Set([2, 3, 4, 5, 6, 8, 15, 19, 23]);

/** @param {string} token */
function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return 59 * high + low;
}

/** @param {'base59'|'base60'} codec */
function fiveHop(codec) {
  let state = 42;
  const route = [state];
  for (let step = 0; step < 5; step += 1) {
    state = codec === 'base59' ? decode59(tokens[state]) : base60[state];
    assert.ok(state >= 0 && state < 256);
    route.push(state);
  }
  return route;
}

const route59 = fiveHop('base59');
const route60 = fiveHop('base60');
assert.deepEqual(route59, preterminal.base59.path);
assert.deepEqual(route60, preterminal.base60Rival.path);
assert.deepEqual(route59, [42, 28, 148, 242, 41, 83]);
assert.deepEqual(route60, [42, 28, 150, 153, 33, 114]);

const terminals = [83, 114].map((cell) => ({
  cell,
  token: tokens[cell],
  base59: decode59(tokens[cell]),
  base60: base60[cell],
  primitive59: primitiveState.has(decode59(tokens[cell])),
  primitive60: primitiveState.has(base60[cell]),
}));

assert.deepEqual(terminals, [
  {
    cell: 83,
    token: '3D',
    base59: 190,
    base60: 193,
    primitive59: false,
    primitive60: false,
  },
  {
    cell: 114,
    token: '3H',
    base59: 194,
    base60: 197,
    primitive59: false,
    primitive60: false,
  },
]);

console.log(JSON.stringify({
  status: 'PASS',
  selector: 'ROAD row g=5 × K column=2, exactly g=5 forward hops',
  route59,
  route60,
  terminals,
  decision: 'The fresh circuit does not promote ROAD-selected base59 to global pointer semantics.',
}, null, 2));
