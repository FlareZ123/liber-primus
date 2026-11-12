'use strict';

/**
 * Source-exact bounded test of the two red p3/p39 SCY/UDP clues against the
 * 76-cell outer border of the original 32x8 pp49-51 base60 grid.
 * Reads four corners in both directions with no fitted offsets or bytes.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(readFileSync(path.join(base, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';

/** @param {number[]} data */
function udpHeader(data) {
  assert.ok(data.length >= 8);
  return {
    sourcePort: data[0] * 256 + data[1],
    destinationPort: data[2] * 256 + data[3],
    length: data[4] * 256 + data[5],
    checksum: data[6] * 256 + data[7],
  };
}

const planted = [0, 1, 0, 2, 0, 76, 0, 0, ...Array(68).fill(0)];
assert.equal(planted.length, 76);
assert.deepEqual(udpHeader(planted), {
  sourcePort: 1, destinationPort: 2, length: 76, checksum: 0,
});
assert.equal(udpHeader(planted.map((x, i) => i === 5 ? x + 1 : x)).length, 77);

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(grid.alphabet, alphabet);
const matrix = grid.rows.map(row => row.map(token => {
  assert.equal(token.length, 2);
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}));
assert.deepEqual(matrix, grid.byte_rows);
const bytes = matrix.flat();
assert.equal(bytes.length, 256);
const hash = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(hash, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const red3 = ink.pages.flatMap(page => (page.red_spans || [])
  .filter(span => span.length === 3)
  .map(span => ({
    page: page.page,
    start: span.start,
    indices: Array.from(span.runes, rune => corpus.runes.indexOf(rune)),
  })));
assert.deepEqual(red3, [
  { page: 3, start: 119, indices: [13, 23, 2] },
  { page: 39, start: 119, indices: [27, 5, 15] },
]);
assert.deepEqual(red3.map(span => span.indices.map(n => corpus.translit[28-n]).join('')),
  ['SCY', 'UDP']);

/** @type {Array<[number,number]>} */
const border = [];
for (let j = 0; j < 8; j++) border.push([0, j]);
for (let i = 1; i < 32; i++) border.push([i, 7]);
for (let j = 6; j >= 0; j--) border.push([31, j]);
for (let i = 30; i >= 1; i--) border.push([i, 0]);
assert.equal(border.length, 76);
assert.equal(new Set(border.map(pair => pair.join(','))).size, 76);

const corners = [[0,0],[0,7],[31,7],[31,0]];
const lengths = [[25069,29520],[1356,47783],[59052,38740],[36409,46116]];
const outcome = [];
for (let k = 0; k < 4; k++) {
  const [row, column] = corners[k];
  const start = border.findIndex(([i,j]) => i === row && j === column);
  assert.ok(start >= 0);
  for (const [step, direction] of [[1,'clockwise'],[-1,'counterclockwise']]) {
    const datagram = border.map((_, index) => {
      const [i,j] = border[(start + step * index + 76 * 76) % 76];
      return matrix[i][j];
    });
    const parsed = udpHeader(datagram);
    assert.equal(parsed.length, lengths[k][step === 1 ? 0 : 1]);
    assert.notEqual(parsed.length, datagram.length);
    outcome.push({ corner: [row,column], direction,
      sourcePort: parsed.sourcePort,
      destinationPort: parsed.destinationPort,
      udpLength: parsed.length });
  }
}
assert.equal(outcome.length, 8);
console.log(JSON.stringify({ gridSha256: hash, sourceRedAtbash: ['SCY', 'UDP'],
  perimeterCells: border.length, examined: outcome.length,
  validLiteralDatagrams: 0, outcome }, null, 2));
