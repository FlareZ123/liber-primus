'use strict';

// Original-image floral five-dot 13/31 -> exact p50 32x8 numeric receiver.
// This reproducer deliberately does not infer an unknown LP2 decryption key.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
const { bytes } = JSON.parse(fs.readFileSync(source, 'utf8'));
assert.equal(bytes.length, 256);
assert.ok(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const left = parseInt('01101', 2), right = parseInt('11111', 2);
assert.deepEqual([left, right], [13, 31]);
/** @param {number} row @returns {number[]} */
function rowBytes(row) { return bytes.slice(row * 8, row * 8 + 8); }
/** @param {number[]} arr @returns {string} */
function rawAscii(arr) { return arr.map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : '.').join(''); }
/** @param {number} n @returns {string} */
function base29(n) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
  let out = '';
  do { out = alphabet[n % 29] + out; n = Math.floor(n / 29); } while (n);
  return out;
}
assert.equal(base29(3301), '3QO'); // signed 2013 TCP example
/** @param {number[]} arr @returns {string} */
function low5Base32(arr) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  return arr.map(x => alphabet[x & 31]).join('');
}
/** @param {number} seed @returns {{path:number[], cycleStart:number, cycleLength:number}} */
function tableWalk(seed) {
  const seen = new Map(), chain = [];
  let state = seed;
  while (!seen.has(state)) {
    assert.ok(chain.length < 257);
    seen.set(state, chain.length);
    chain.push(state);
    state = bytes[state];
  }
  return {path:chain, cycleStart:seen.get(state), cycleLength:chain.length - seen.get(state)};
}
for (const [name, indices] of [['zero-based', [13, 31]], ['one-based', [12, 30]]]) {
  const pair = indices.flatMap(rowBytes);
  console.log(name, 'selected_hex=', Buffer.from(pair).toString('hex'),
    'raw_ASCII=', rawAscii(pair), 'printable=', pair.filter(x=>x>=32&&x<=126).length);
  console.log('2013_BASE29_each=', pair.map(base29).join(' '));
  console.log('nonvalidating_low5_base32=', low5Base32(pair));
}
for (const seed of [13, 31, 13 * 8 + (31 & 7), 31 * 8 + (13 & 7)]) {
  const w = tableWalk(seed);
  console.log('seed=',seed,'path=',w.path.join(','),'cycle_start=',w.cycleStart,'cycle_len=',w.cycleLength);
  assert.equal(w.cycleLength,11);
}
assert.deepEqual(rowBytes(13), [122,63,31,218,14,184,32,115]);
assert.deepEqual(rowBytes(31), [113,158,172,230,180,36,189,80]);
console.log('PASS: original-table, row, BASE29 and self-map assertions');
