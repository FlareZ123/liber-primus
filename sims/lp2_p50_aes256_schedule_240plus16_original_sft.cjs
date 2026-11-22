'use strict';

/**
 * Source-shaped standalone p49-p51 256-byte candidate: AES-256 key schedule
 * (240 bytes) plus an adjacent 16-byte IV, in either physical order.
 *
 * Only key-independent mandatory AES-256 schedule recurrences are used
 * to reject the original; FIPS 197 Appendix A.3 confirms the positive.
 * Node 22 / CommonJS / dependency-free.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const original = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'),
  'utf8'
));
const HEX60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const HASH60 = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';

function decode(radix) {
  const abc = radix === 60 ? HEX60 : HEX60.replace('f', '');
  assert.equal(abc.length, radix);
  return original.rows.flat().map(token => {
    assert.equal(token.length, 2);
    const hi = abc.indexOf(token[0]), lo = abc.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    const value = hi * radix + lo;
    assert(value >= 0 && value <= 255);
    return value;
  });
}

/**
 * AES-256 w[0]..w[59]: 8 seed words, then w[i] = w[i-8] XOR
 * transformed(w[i-1]). For i%8 != 0,4, transform is the identity.
 * Every such full 4-byte XOR relation must hold, whatever the AES key.
 * Endianness is immaterial to the byte-by-byte test.
 */
function linearScheduleGate(bytes, offset) {
  assert(offset === 0 || offset === 16);
  const words = Array.from({ length: 60 }, (_, i) =>
    bytes.slice(offset + 4 * i, offset + 4 * i + 4)
  );
  const failures = [];
  for (let i = 8; i < 60; i++) {
    if (i % 8 === 0 || i % 8 === 4) continue;
    const residual = words[i].map((v, j) =>
      v ^ words[i - 8][j] ^ words[i - 1][j]
    );
    if (residual.some(x => x !== 0)) failures.push({ word: i, residual });
  }
  return { valid: failures.length === 0, checkedWords: 39, failures };
}

// FIPS 197 AES S-box and key schedule, implemented solely for positive controls.
function xtime(x) { return ((x << 1) ^ (x & 128 ? 0x11b : 0)) & 255; }
function gfMul(a, b) {
  let z = 0;
  while (b) {
    if (b & 1) z ^= a;
    a = xtime(a);
    b >>= 1;
  }
  return z;
}
function sbox(x) {
  let inv = 0;
  if (x !== 0) {
    inv = 1;
    for (let i = 0; i < 254; i++) inv = gfMul(inv, x);
  }
  const rot = n => ((inv << n) | (inv >>> (8 - n))) & 255;
  return inv ^ rot(1) ^ rot(2) ^ rot(3) ^ rot(4) ^ 0x63;
}
function aes256KeyExpansion(keyBytes) {
  assert.equal(keyBytes.length, 32);
  const words = Array.from({ length: 8 }, (_, i) => keyBytes.slice(i * 4, i * 4 + 4));
  let rcon = 1;
  for (let i = 8; i < 60; i++) {
    let prev = words[i - 1].slice();
    if (i % 8 === 0) {
      prev = [...prev.slice(1), prev[0]].map(sbox);
      prev[0] ^= rcon;
      rcon = xtime(rcon);
    } else if (i % 8 === 4) {
      prev = prev.map(sbox);
    }
    words.push(words[i - 8].map((b, j) => b ^ prev[j]));
  }
  return words.flat();
}

function main() {
  assert.equal(original.rows.length, 32);
  assert(original.rows.every(row => row.length === 8));
  const b60 = decode(60);
  assert.equal(b60.length, 256);
  assert.deepEqual(b60, original.byte_rows.flat());
  assert.equal(
    crypto.createHash('sha256').update(Buffer.from(b60)).digest('hex'),
    HASH60
  );

  // Official FIPS 197 Appendix A.3 256-bit worked example.
  const fipsKey = Buffer.from(
    '603deb1015ca71be2b73aef0857d7781' +
    '1f352c073b6108d72d9810a30914dff4', 'hex'
  );
  assert.equal(sbox(0x53), 0xed);
  const schedule = aes256KeyExpansion([...fipsKey]);
  assert.equal(schedule.length, 240);
  assert.equal(Buffer.from(schedule.slice(32, 36)).toString('hex'), '9ba35411');
  const iv = Array.from({ length: 16 }, (_, i) => i);
  for (const pair of [
    { off: 0, bytes: [...schedule, ...iv] },
    { off: 16, bytes: [...iv, ...schedule] }
  ]) {
    assert(linearScheduleGate(pair.bytes, pair.off).valid, 'FIPS positive schedule must pass');
    const altered = pair.bytes.slice();
    altered[pair.off + 36] ^= 1;
    assert(!linearScheduleGate(altered, pair.off).valid, 'one-byte negative control must fail');
  }

  const results = [];
  for (const radix of [60, 59]) {
    for (const offset of [0, 16]) {
      const gate = linearScheduleGate(decode(radix), offset);
      results.push({
        radix, offset,
        checkedWords: gate.checkedWords,
        failedWords: gate.failures.length,
        firstFailure: gate.failures[0] ?? null,
        compatible: gate.valid
      });
      assert(!gate.valid, 'Original AES schedule survived mandatory XOR gate');
    }
  }
  assert(results.every(r => r.failedWords === 39));
  console.log(JSON.stringify({
    source: 'original 32x8, sha256=' + HASH60,
    interpretation: '240-byte AES-256 key expansion + adjacent 16-byte IV',
    originalCompatible: 0,
    originalCandidates: results.length,
    officialFipsAppendixA3Positive: 'PASS',
    deliberateOneByteCorruptionControls: 'PASS',
    results
  }, null, 2));
}

if (require.main === module) main();
