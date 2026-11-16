'use strict';

/**
 * Exact original-image first-EOI regression for LP1 05.jpg and 10.jpg.
 * Both carry historically known nontrivial post-JPEG data.
 * CommonJS, Node 22, built-ins only. No unknown LP2 plaintext is inferred.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const endMarker = Buffer.from([0xff, 0xd9]);

/** @param {number} page @returns {Buffer} */
function read(page) {
  return fs.readFileSync(path.join(root, String(page).padStart(2, '0') + '.jpg'));
}

/** @param {Buffer} bytes @returns {string} */
function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

/** @param {Buffer} bytes @returns {number} */
function firstEnd(bytes) {
  const offset = bytes.indexOf(endMarker, 2);
  assert.notEqual(offset, -1, 'missing FF D9 JPEG end marker');
  return offset + endMarker.length;
}

const expected05Hash = '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7';
const expected10Hash = '12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376';

let ordinary = 0;
for (let page = 0; page < 75; page += 1) {
  const bytes = read(page);
  const end = firstEnd(bytes);
  if (page === 5) {
    assert.equal(end, 336353);
    assert.equal(bytes.length, 673066);
    assert.equal(sha256(bytes), expected05Hash);
  } else if (page === 10) {
    assert.equal(end, 754662);
    assert.equal(bytes.length, 4240957);
    assert.equal(sha256(bytes), expected10Hash);
  } else {
    assert.equal(end, bytes.length, String(page).padStart(2, '0') + '.jpg unexpectedly has trailing data');
    ordinary++;
  }
}
assert.equal(ordinary, 73);

const file05 = read(5);
const mainLength = firstEnd(file05);
const middle = file05.subarray(mainLength, mainLength + 360);
const reverse = file05.subarray(mainLength + middle.length);

assert.equal(middle.length, 360);
assert.equal(reverse.length, mainLength);
assert.deepEqual(Buffer.from(reverse).reverse(), file05.subarray(0, mainLength));
assert.equal(sha256(file05.subarray(0, mainLength)), 'c517d5d87544a761188cd50c46473898ab9d2c0da108cf13c61234dc1bda635a');

const hex = middle.toString('ascii').trim();
assert.equal(hex.length, 358);
assert.match(hex, /^[0-9a-f]+$/);
const decoded = Buffer.from(Array.from(hex).reverse().join(''), 'hex').toString('ascii');
const matrix = decoded.trim().split(/\r?\n/).map((line) =>
  line.trim().split(/\s+/).map(Number));
assert.deepEqual(matrix, [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
]);

for (let row = 0; row < 5; row += 1) {
  assert.equal(matrix[row].reduce((sum, value) => sum + value, 0), 1033);
  assert.equal(matrix.reduce((sum, values) => sum + values[row], 0), 1033);
}
assert.equal(matrix.reduce((sum, values, i) => sum + values[i], 0), 1033);
assert.equal(matrix.reduce((sum, values, i) => sum + values[4 - i], 0), 1033);
assert.notDeepEqual(Buffer.from(reverse.subarray(1)).reverse(), file05.subarray(0, mainLength - 1),
  'a one-byte offset in the reversed image must not match the original');

const file10 = read(10);
const copies = Buffer.concat([read(11), read(12), read(13)]);
assert.equal(copies.length, 3486295);
assert.deepEqual(file10.subarray(firstEnd(file10)), copies);
assert.equal(firstEnd(file10) + copies.length, file10.length);

console.log('05.jpg: 336353-byte original JPEG + 360 ASCII bytes + reversed complete 336353-byte JPEG');
console.log('05.jpg: recovered exact 5x5 sum-1033 numeric square from reversed ASCII hex; complete mirrored image is redundant');
console.log('10.jpg: original 754662-byte JPEG followed by the complete 11.jpg, 12.jpg and 13.jpg');
console.log('PASS: 75 original images checked at FIRST EOI; 73 ordinary, two historical trailers');
