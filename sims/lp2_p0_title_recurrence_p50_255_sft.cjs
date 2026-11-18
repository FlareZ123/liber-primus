'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const gp = corpus.translit;

/** @param {string[]} names */
function indices(names) {
  return names.map((name) => {
    const index = gp.indexOf(name);
    assert.notEqual(index, -1, `unknown GP symbol ${name}`);
    return index;
  });
}

/** @param {number[]} values */
function sum(values) {
  return values.reduce((a, b) => a + b, 0);
}

const k2 = indices(['J', 'TH', 'TH']);
const k1 = indices(['X', 'N', 'X', 'C']);
const p2 = indices(['R', 'A', 'T', 'I', 'O']);
const p1 = indices(['S', 'E', 'C', 'U', 'E', 'N', 'D', 'I']);

const fixed = [sum(k2), sum(k1), sum(p2), sum(p1), sum([...p1, ...p2])];
assert.deepEqual(fixed, [15, 42, 57, 99, 156]);
assert.equal(fixed[0] + fixed[1], fixed[2]);
assert.equal(fixed[1] + fixed[2], fixed[3]);
assert.equal(fixed[2] + fixed[3], fixed[4]);

const next = fixed[3] + fixed[4];
assert.equal(next, 255);
assert.equal(grid.byte_count, 256);
assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(next, grid.byte_count - 1);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);

const addresses = [...fixed, next];
const octalAddresses = addresses.map((address) => address.toString(8).padStart(3, '0'));
assert.deepEqual(octalAddresses, ['017', '052', '071', '143', '234', '377']);
const rowMajorCoordinates = addresses.map((address) => [
  Math.floor(address / 8),
  address % 8,
]);
assert.deepEqual(rowMajorCoordinates, [[1,7],[5,2],[7,1],[12,3],[19,4],[31,7]]);
assert.equal(next, 255);
assert.equal(next, grid.byte_count - 1);
assert.notEqual(next, grid.byte_count);

const readout = addresses.map((address) => ({
  address,
  token: tokens[address],
  byte: grid.bytes[address],
  gp: gp[grid.bytes[address] % 29],
}));

const valuePositions = Object.fromEntries(addresses.map((value) => [
  value,
  grid.bytes.map((cell, index) => cell === value ? index : -1).filter((index) => index >= 0),
]));
assert.deepEqual(valuePositions, {
  15: [18],
  42: [120, 242],
  57: [208],
  99: [],
  156: [10, 54, 185],
  255: [65],
});

assert.deepEqual(readout, [
  {address: 15, token: '3W', byte: 212, gp: 'N'},
  {address: 42, token: '0S', byte: 28, gp: 'EA'},
  {address: 57, token: '1w', byte: 118, gp: 'TH'},
  {address: 99, token: '0Y', byte: 34, gp: 'C'},
  {address: 156, token: '0q', byte: 52, gp: 'D'},
  {address: 255, token: '1K', byte: 80, gp: 'OE'},
]);

console.log(JSON.stringify({
  status: 'PASS',
  fixedTitleSums: fixed,
  recurrenceExtension: next,
  gridCells: grid.byte_count,
  terminalZeroBasedIndex: grid.byte_count - 1,
  oneBasedTerminalIndex: grid.byte_count,
  octalAddresses,
  rowMajorCoordinates,
  directRowMajorReadout: readout,
  directGpResidues: readout.map((x) => x.gp).join('-'),
  recurrenceValuesLocatedAsTableBytes: valuePositions,
  decision: 'conditional p0 title recurrence predicts p50 terminal zero-based index; direct indexed table readout is nonlinguistic',
}, null, 2));
