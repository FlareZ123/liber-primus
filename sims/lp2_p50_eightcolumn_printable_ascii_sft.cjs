/**
 * Source-fixed, all-256-key-byte exclusion of eight-column readable-ASCII
 * XOR and mod-256 additive ciphers for the LP2 pp49-51 numeric table.
 * Run from a repository checkout with Node.js 22:
 *   node sims/lp2_p50_eightcolumn_printable_ascii_sft.cjs
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
assert.equal(source.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(source.byte_rows.length, 32);
assert.ok(source.byte_rows.every(row => row.length === 8 && row.every(b => Number.isInteger(b) && b >= 0 && b < 256)));
const bytes = Buffer.from(source.byte_rows.flat());
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

/** @param {number} b */
function readable(b) {
  return b === 10 || b === 13 || (b >= 32 && b <= 126);
}

/** @param {number} b @param {number} key @param {'xor'|'subtract'} mode */
function decode(b, key, mode) {
  return mode === 'xor' ? (b ^ key) : ((b - key + 256) & 255);
}

/**
 * Test all 256 values for each of eight independent secret column keys.
 * Every key-vector's total readable count is bounded by the sum of column maxima.
 * @param {number[][]} rows
 * @param {'xor'|'subtract'} mode
 */
function bound(rows, mode) {
  const maxima = [];
  const witnesses = [];
  for (let col = 0; col < 8; col++) {
    let best = -1;
    let winner = -1;
    for (let key = 0; key < 256; key++) {
      let count = 0;
      for (let row = 0; row < 32; row++) {
        count += Number(readable(decode(rows[row][col], key, mode)));
      }
      if (count > best) {
        best = count;
        winner = key;
      }
    }
    maxima.push(best);
    witnesses.push(winner);
  }
  return { maxima, witnesses, maximum: maxima.reduce((a, b) => a + b, 0) };
}

const expected = {
  xor: [16, 21, 17, 19, 15, 17, 16, 16],
  subtract: [18, 18, 17, 19, 16, 18, 20, 17]
};
for (const mode of /** @type {Array<'xor'|'subtract'>} */ (['xor','subtract'])) {
  const actual = bound(source.byte_rows, mode);
  assert.deepEqual(actual.maxima, expected[mode]);
  assert.ok(actual.maximum < 256);

  const known = Buffer.from(('AN ORIGINAL ASCII PLAINTEXT PLANT FOR A BOUNDED SOURCE SELECTED CIPHER. ').repeat(4).slice(0, 256), 'ascii');
  assert.equal(known.length, 256);
  const keys = [13, 113, 8, 91, 0, 239, 52, 166];
  const synthetic = Array.from({length:32}, (_,row) =>
    Array.from({length:8}, (_,col) => {
      const b = known[row*8+col];
      return mode === 'xor' ? (b ^ keys[col]) : ((b + keys[col]) & 255);
    })
  );
  const control = bound(synthetic, mode);
  assert.equal(control.maximum, 256);
  for(let row=0;row<32;row++) for(let col=0;col<8;col++) {
    assert.equal(decode(synthetic[row][col],keys[col],mode),known[row*8+col]);
  }
  console.log(JSON.stringify({
    mode, testedKeysPerColumn: 256, columnMaxima: actual.maxima,
    maximumReadableOf256: actual.maximum, exampleMaximizingKeys: actual.witnesses,
    plantedReadableOf256: control.maximum, plantedRoundtrip: '256/256'
  }));
}

console.log('PASS: full original source never becomes entirely printable under any one-byte-per-column XOR or modulo-256 addition key.');
