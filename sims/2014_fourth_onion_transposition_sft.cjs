'use strict';

// Reproduce the archived 2014 fourth-onion OutGuess columnar-transposition
// result. This starts from the eight rows preserved in the participant
// archive; it does not independently extract the 5.1 MB hex/gzip page.

const assert = require('node:assert/strict');

const rows = [
  'TLBEIEO',
  'VUTHTRE',
  'IDTSEOS',
  'TPOSOYR',
  'SLBTIII',
  'YT4DGUQ',
  'IMNU442',
  'I15339M',
];
const key = [0, 6, 2, 5, 1, 4, 3];
const expected =
  'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';

function decodeRow(row, columnOrder) {
  assert.equal(row.length, columnOrder.length);
  return columnOrder.map((column) => row[column]).join('');
}

function encodeRow(plain, columnOrder) {
  assert.equal(plain.length, columnOrder.length);
  const cipher = Array(columnOrder.length);
  columnOrder.forEach((column, i) => {
    cipher[column] = plain[i];
  });
  return cipher.join('');
}

assert.equal(key.length, 7);
assert.deepEqual([...key].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6]);
assert.equal(rows.length, 8);
assert.ok(rows.every((row) => row.length === 7));

const plaintext = rows.map((row) => decodeRow(row, key)).join('');
assert.equal(plaintext, expected);
assert.equal(plaintext.length, 56);

// Independent inverse check: re-encoding each 7-character block must restore
// every source row exactly.
const blocks = plaintext.match(/.{7}/g);
assert.equal(blocks.length, rows.length);
assert.deepEqual(blocks.map((block) => encodeRow(block, key)), rows);

const host = plaintext.slice(35, 51);
const suffix = plaintext.slice(51);
assert.equal(host, 'Q4UTGDI2N4M4UIM5');
assert.equal(suffix, '9133');
assert.equal(host.length, 16);

process.stdout.write(JSON.stringify({
  rows,
  zeroBasedColumnOrder: key,
  plaintext,
  nextOnion: host.toLowerCase() + '.onion',
  unresolvedSuffix: suffix,
  exactRoundTrip: true,
}, null, 2) + '\n');
