'use strict';

/**
 * Original LP2 p50 H*G quotient -> 153-byte BASE29 -> three 51-byte XOR gate.
 * Agent43, 23 Nov 2026. Read-only: no generated keys, offsets or output files.
 *
 * Execute with Node.js 22 in the repository root or from any working directory.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const mod29 = (x) => ((x % 29) + 29) % 29;
const hex = (bytes) => Buffer.from(bytes).toString('hex');
const sha512 = (bytes) => crypto.createHash('sha512').update(bytes).digest('hex');
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';

assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const polynomial = grid.bytes.map((v) => v % 29);
const factor = [12, 17, 11, 21, 23]; // descending H(3QO) * G(p39) in GF(29)
const quotient = [];
for (let i = 0; i < 252; i += 1) {
  const coefficient = mod29(polynomial[i] * 17); // 17 = 12^(-1) mod29
  quotient.push(coefficient);
  for (let j = 0; j < factor.length; j += 1) {
    polynomial[i + j] = mod29(polynomial[i + j] - coefficient * factor[j]);
  }
}
assert.deepEqual(polynomial.slice(252), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 16), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21]);

let number = 0n;
for (const digit of quotient) number = 29n * number + BigInt(digit);
const serialized = [];
while (number > 0n) {
  serialized.unshift(Number(number & 255n));
  number >>= 8n;
}
const bytes = Buffer.from(serialized);
assert.equal(bytes.length, 153);
assert.equal(hex(bytes).slice(0, 32), '04598e588f3e70d4100f40d7489f9855');

const lanes = [bytes.subarray(0, 51), bytes.subarray(51, 102), bytes.subarray(102, 153)];
const combined = Buffer.alloc(51);
for (let i = 0; i < 51; i += 1) combined[i] = lanes[0][i] ^ lanes[1][i] ^ lanes[2][i];
assert.equal(hex(combined),
  'bff060162efa7d58ef5847e9c291f117f2cc14cfb00a17d8f75f979c9e6cb8466cf41028b3cd301a344100f686a0599d489a70');
for (let i = 0; i < 51; i += 1) {
  assert.equal((combined[i] ^ lanes[0][i] ^ lanes[1][i]), lanes[2][i]);
}
const printable = [...combined].filter((v) => v >= 32 && v <= 126).length;
assert.equal(printable, 17);
const tested = [bytes, combined, ...lanes];
for (const candidate of tested) assert.notEqual(sha512(candidate), target);

console.log('PASS: original 256 cells, exact zero remainder, 252 GF29 quotient');
console.log('Q as unsigned BASE29 integer -> ' + bytes.length + ' bytes');
console.log('Historic three-way XOR, contiguous 51-byte shares = ' + hex(combined));
console.log('Printable ASCII bytes = ' + printable + '/51');
console.log('SHA512 target matches (full Q, XOR, each of 3 shares): 0/5');
console.log('SHA512(full Q): ' + sha512(bytes));
console.log('SHA512(XOR):    ' + sha512(combined));
