'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'),
  'utf8'
));
const reference = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'),
  'utf8'
).replace(/\r\n/g, '\n');

const p57 = reference.split('### 57\n')[1].trim();
assert.equal(
  p57,
  'PARABLE\n\nLIKE THE INSTAR TUNNELING TO THE SURFACE\n' +
  'WE MUST SHED OUR OWN CIRCUMFERENCES\n' +
  'FIND THE DIVINITY WITHIN AND EMERGE'
);

const innerAddress = 184;
const outerAddress = 192;
const cols = grid.shape === '32 rows by 8 columns across LP2 pages 49, 50, 51'
  ? 8
  : null;
assert.equal(cols, 8);

const inner = {
  address: innerAddress,
  row: Math.floor(innerAddress / cols),
  col: innerAddress % cols,
  token: grid.pages.flatMap(page => page.tokens)[innerAddress]
};
const outer = {
  address: outerAddress,
  row: Math.floor(outerAddress / cols),
  col: outerAddress % cols,
  token: grid.pages.flatMap(page => page.tokens)[outerAddress]
};

assert.deepEqual(inner, {address: 184, row: 23, col: 0, token: '28'});
assert.deepEqual(outer, {address: 192, row: 24, col: 0, token: '00'});
assert.equal(outer.row, inner.row + 1);
assert.equal(outer.col, inner.col);

// Global row 23 is the first printed row of original image 68.jpg and row24
// is the second. Therefore ordinary top-to-bottom table reading fixes 184
// before 192 without inspecting the token values or the historical DH target.
const page51 = grid.pages[2];
assert.equal(page51.image, '68.jpg');
assert.deepEqual(page51.tokens.slice(0, 8),
  ['28','2a','0J','1L','0c','3C','2o','0X']);
assert.deepEqual(page51.tokens.slice(8, 16),
  ['00','2Z','2d','1T','2u','1t','1j','0l']);

const graphicalReadout = inner.token + outer.token;
const reverseReadout = outer.token + inner.token;
assert.equal(graphicalReadout, '2800');
assert.equal(reverseReadout, '0028');

console.log(JSON.stringify({
  status: 'PASS',
  sourceOnly: true,
  p57Instruction: p57.split('\n').slice(-2),
  selectedCells: {inner, outer},
  originalImage: '68.jpg',
  geometry: 'same first column, consecutive printed rows',
  sourceNaturalReadout: 'top-to-bottom',
  graphicalReadout,
  reverseReadout,
  historicalTargetUsedToChooseOrder: false,
  semanticCaveat:
    'p57 action order says shed circumference before finding divinity; that operation order does not explicitly prescribe numeric concatenation. The independent p50 graphical readout fixes the cell order.'
}, null, 2));
