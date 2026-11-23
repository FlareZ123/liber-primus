'use strict';

/**
 * Original LP2 32x8 numeric panel as a 240-byte FIPS AES-256 round-key
 * schedule plus 16-byte IV: all physical read orders and I/l case controls.
 * Single-file Windows 11 / Node.js 22 CommonJS read-only SFT.
 *
 * Spec: NIST FIPS 197-upd1, Section 5.2 KEYEXPANSION() (2023).
 * A necessary key-schedule identity independent of AES S-box/Rcon:
 *   w[i] = w[i-8] XOR w[i-1] for i>=8, i mod 8 not in {0,4}.
 * This gives 39 four-byte word equations (156 byte equations) for every
 * valid AES-256 round-key schedule, regardless of the original key.
 */
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

/** @param {number} a @param {number} b @returns {number} */
function gfMul(a, b) {
  let out = 0;
  while (b) {
    if (b & 1) out ^= a;
    a = ((a << 1) & 255) ^ ((a & 128) ? 0x1b : 0);
    b >>>= 1;
  }
  return out;
}

/** @param {number} a @returns {number} */
function gfInv(a) {
  if (a === 0) return 0;
  let x = 1;
  for (let i = 0; i < 254; i++) x = gfMul(x, a);
  return x;
}

/** @param {number} value @param {number} bits @returns {number} */
function rotl8(value, bits) {
  return ((value << bits) | (value >>> (8 - bits))) & 255;
}
const sbox = Uint8Array.from({length:256}, (_, x) => {
  const a = gfInv(x);
  return a ^ rotl8(a, 1) ^ rotl8(a, 2) ^ rotl8(a, 3) ^ rotl8(a, 4) ^ 0x63;
});
assert.deepEqual(Array.from(sbox.slice(0, 4)), [0x63, 0x7c, 0x77, 0x7b]);

/** Actual FIPS-197 AES-256 expansion for genuine positive controls.
 * @param {Buffer} key 32 bytes
 * @returns {Buffer} All 240 expanded key bytes
 */
function aes256KeyExpansion(key) {
  assert.equal(key.length, 32);
  const schedule = Buffer.alloc(240);
  key.copy(schedule, 0);
  let rcon = 1;
  for (let i = 8; i < 60; i++) {
    const temp = Array.from(schedule.subarray((i - 1) * 4, i * 4));
    if (i % 8 === 0) {
      const first = temp.shift();
      temp.push(first);
      for (let k = 0; k < 4; k++) temp[k] = sbox[temp[k]];
      temp[0] ^= rcon;
      rcon = gfMul(rcon, 2);
    } else if (i % 8 === 4) {
      for (let k = 0; k < 4; k++) temp[k] = sbox[temp[k]];
    }
    for (let k = 0; k < 4; k++)
      schedule[4 * i + k] = schedule[4 * (i - 8) + k] ^ temp[k];
  }
  return schedule;
}

/** Test the key-independent 39-word, 156-byte necessary recurrence.
 * @param {ArrayLike<number>} bytes Exactly 240 schedule bytes.
 * @returns {{byteMatches:number,wordMatches:number}}
 */
function necessaryLinearMatches(bytes) {
  assert.equal(bytes.length, 240);
  let byteMatches = 0;
  let wordMatches = 0;
  for (let i = 8; i < 60; i++) {
    if (i % 8 === 0 || i % 8 === 4) continue;
    let currentWordMatches = 0;
    for (let k = 0; k < 4; k++) {
      const n = 4 * i + k;
      if ((bytes[n] ^ bytes[n - 32] ^ bytes[n - 4]) === 0) {
        byteMatches++;
        currentWordMatches++;
      }
    }
    if (currentWordMatches === 4) wordMatches++;
  }
  return {byteMatches, wordMatches};
}
const fipsKey = Buffer.from(
  '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4', 'hex'
);
const fipsSchedule = aes256KeyExpansion(fipsKey);
assert.equal(fipsSchedule.subarray(32, 64).toString('hex'),
  '9ba354118e6925afa51a8b5f2067fcdea8b09c1a93d194cdbe49846eb75d5b9a');
assert.deepEqual(necessaryLinearMatches(fipsSchedule),
  {byteMatches:156, wordMatches:39});
const iv = Buffer.alloc(16, 0xa5);
assert.deepEqual(necessaryLinearMatches(Buffer.concat([iv, fipsSchedule]).subarray(16)),
  {byteMatches:156, wordMatches:39});
assert.deepEqual(necessaryLinearMatches(Buffer.concat([fipsSchedule, iv]).subarray(0, 240)),
  {byteMatches:156, wordMatches:39});

const tokens = grid.pages.flatMap(page => page.tokens);
const original = grid.pages.flatMap(page => page.bytes);
const alphabet = grid.alphabet;
assert.equal(tokens.length, 256);
assert.equal(original.length, 256);
assert.deepEqual(original, tokens.map(token =>
  alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1])));
const uncertain = tokens.flatMap((token, index) =>
  token.endsWith('I') || token.endsWith('l') ? [index] : []);
assert.deepEqual(uncertain, [2,25,45,50,90,165,175,182,199,246]);

/** The four source-natural whole-panel read directions.
 * @param {number[]} bytes 256 original numeric cells.
 * @param {number} orientation 0..3.
 * @returns {number[]}
 */
function readPanel(bytes, orientation) {
  if (orientation === 0) return bytes.slice();
  if (orientation === 1) return bytes.slice().reverse();
  if (orientation === 2)
    return Array.from({length:256}, (_, i) =>
      bytes[(i % 32) * 8 + Math.floor(i / 32)]);
  assert.equal(orientation, 3);
  return Array.from({length:256}, (_, i) =>
    bytes[((255 - i) % 32) * 8 + Math.floor((255 - i) / 32)]);
}

let tested = 0;
let maximumByteMatches = 0;
let maximumWordMatches = 0;
let validSchedules = 0;
for (let mask = 0; mask < (1 << uncertain.length); mask++) {
  const bytes = original.slice();
  for (let bit = 0; bit < uncertain.length; bit++) {
    if ((mask & (1 << bit)) === 0) continue;
    const index = uncertain[bit];
    const token = tokens[index];
    const flipped = token[1] === 'I' ? 'l' : 'I';
    bytes[index] = alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(flipped);
  }
  for (let order = 0; order < 4; order++) {
    const oriented = readPanel(bytes, order);
    for (const ivPosition of [0, 1]) {
      const schedule = ivPosition === 0
        ? oriented.slice(16, 256) : oriented.slice(0, 240);
      const {byteMatches, wordMatches} = necessaryLinearMatches(schedule);
      maximumByteMatches = Math.max(maximumByteMatches, byteMatches);
      maximumWordMatches = Math.max(maximumWordMatches, wordMatches);
      if (byteMatches === 156) validSchedules++;
      tested++;
    }
  }
}
assert.equal(tested, 8192);
assert.equal(maximumByteMatches, 0);
assert.equal(maximumWordMatches, 0);
assert.equal(validSchedules, 0);
console.log('PASS NIST FIPS AES-256 Appendix A.3 actual 240-byte round-key expansion');
console.log('PASS independently planted genuine FIPS schedule with 16-byte IV before/after');
console.log('PASS source 256 bytes and 10 original I/l character positions');
console.log('PASS 1024 glyph interpretations x 4 physical orders x 2 IV positions = 8192');
console.log('PASS all 8192 original cases have 0 / 156 necessary AES schedule byte matches');
console.log('No original AES-256 expanded round-key schedule, new LP2 key or plaintext recovered.');
