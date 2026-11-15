'use strict';

/** Reproduce the exact column-spacing audit of the period-original OpenPuff square file. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const path = 'resources/cicada2014-openpuff-magic-squares.txt';
const data = fs.readFileSync(path);
assert.equal(data.length, 745);
assert.equal(crypto.createHash('sha256').update(data).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
assert.equal(data.includes(0x09), false, 'source contains literal tabs');
const source = data.toString('ascii');
assert.equal((source.match(/\r\n/g) || []).length, 22);
assert.equal(source.replace(/\r\n/g, '').includes('\n'), false);

const lines = source.split('\r\n');
const rows = lines.filter((line) => /\d/.test(line));
const widths = [...Array(5).fill(5), ...Array(7).fill(7), ...Array(5).fill(5)];
assert.equal(rows.length, widths.length);
const squares = [];
let cursor = 0;
for (const width of [5, 7, 5]) {
  const square = [];
  for (let row = 0; row < width; row += 1) {
    const line = rows[cursor];
    const matches = [...line.matchAll(/\d+/g)];
    assert.equal(matches.length, width, `square ${width} row ${row} cell count`);
    const numbers = matches.map((m, column) => {
      assert.equal(m.index, column * 8, `square ${width} row ${row} column ${column}`);
      return Number(m[0]);
    });
    const expectedLine = numbers.map((n, i) =>
      i === width - 1 ? String(n) : String(n).padEnd(8, ' ')).join('');
    assert.equal(line, expectedLine, 'ordinary fixed-width printing completely determines spaces');
    square.push(numbers);
    cursor += 1;
  }
  squares.push(square);
}
assert.equal(cursor, 17);
for (const [i, square] of squares.entries()) {
  const n = square.length;
  const target = [3301, 1033, 1033][i];
  for (let j = 0; j < n; j += 1) {
    assert.equal(square[j].reduce((a, b) => a + b, 0), target);
    assert.equal(square.reduce((a, row) => a + row[j], 0), target);
  }
  assert.equal(square.reduce((a, row, j) => a + row[j], 0), target);
  assert.equal(square.reduce((a, row, j) => a + row[n - 1 - j], 0), target);
}
console.log(JSON.stringify({
  sourceBytes: data.length, crlf: 22, squareOrders: [5, 7, 5],
  numeralRows: 17, numericCells: 99, intercolumnGaps: 82,
  distinctGapDegreesOfFreedom: 0, starts: '0,8,16,24,...',
  magicTotals: [3301, 1033, 1033], originalSourceSpacingExact: true
}, null, 2));
