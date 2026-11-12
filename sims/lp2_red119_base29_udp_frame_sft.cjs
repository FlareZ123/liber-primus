'use strict';

/** Original-source 119-rune BASE29 -> fixed UDP+64-byte packet gate. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const A = '0123456789ABCDEFGHIJKLMNOPQRS';
const SOURCE = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const pages = JSON.parse(fs.readFileSync(SOURCE, 'utf8')).pages;

/** @param {readonly number[]} digits @returns {bigint} */
function fromBase29(digits) {
  let n = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit <= 28);
    n = n * 29n + BigInt(digit);
  }
  return n;
}

/** @param {bigint} n @returns {Buffer} */
function toMinimalBytes(n) {
  let h = n.toString(16);
  if (h.length % 2) h = '0' + h;
  return Buffer.from(h, 'hex');
}

/** @param {Buffer} bytes @param {number} length @returns {number[]} */
function toFixedBase29(bytes, length) {
  let n = BigInt('0x' + bytes.toString('hex'));
  const out = Array(length).fill(0);
  for (let i = length - 1; i >= 0; --i) {
    out[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n, 'fixed-width radix cannot hold supplied packet');
  return out;
}

for (const [p, pinned] of [
  [3, 'KBC8L52GPBGE8G1MFD46Q9O6CL970Q9HSRD9QOFJHRSRA3H49KS4KKIH798J0MHL4OR6MCGJENCJQ8SAKF9750DJDKSF20MR2IQ5BK5RJHN5CBAGMNSIR9G'],
  [39, 'F729FA8HESLH1KM19123JO9NPCPQOFQLRJ6C9DS58LK06RARO0HD5F2S2P46NKM64ACQ3M1L46JG6HD6JGJQ7HGH6QD692CH56ICMKD79864CGD6H7JF7M8'],
]) {
  const digits = pages[p].indices.slice(0, 119);
  assert.equal(digits.length, 119);
  assert.equal(digits.map(i => A[i]).join(''), pinned, 'source prefix changed');
  const n = fromBase29(digits);
  const bytes = toMinimalBytes(n);
  const bits = n.toString(2).length;
  const headerLength = bytes.readUInt16BE(4);
  const expected = p === 3 ? { head: '0303a98d2c66cbcc', length: 11366 }
                           : { head: '0240ce33c8df0384', length: 51423 };
  assert.equal(bits, 578);
  assert.equal(bytes.length, 73);
  assert.equal(bytes.subarray(0, 8).toString('hex'), expected.head);
  assert.equal(headerLength, expected.length);
  assert.ok(n >= (1n << 576n));
  console.log(`p${p}: ${digits.length} runes, ${bits} bits / ${bytes.length} bytes; first8=${bytes.subarray(0,8).toString('hex')}; UDP length field=${headerLength}; cannot be exact 72-byte header+64 payload`);
}

// Positive plant: full 8-byte UDP header with 64 bytes of reproducible data.
const plant = Buffer.alloc(72);
plant.writeUInt16BE(3301, 0);
plant.writeUInt16BE(3301, 2);
plant.writeUInt16BE(72, 4);
createHash('sha512').update('LP2 119-rune packet positive control').digest().copy(plant, 8);
const plantDigits = toFixedBase29(plant, 119);
const recovered = toMinimalBytes(fromBase29(plantDigits));
assert.deepEqual(recovered, plant);
assert.equal(recovered.readUInt16BE(4), 72);
console.log('Positive plant: 119 BASE29 digits recover all 72 bytes and UDP length 72 exactly.');
