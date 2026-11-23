'use strict';
/** @file Single-file original-source X25519 / ChaCha20 receiver gate, Node 22 CJS. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/base60-grid.json');
const book = require('../resources/liber-primus/lp2-corpus.json');

const sourcePrime = 63755441409934721069036418908763882578170591536653256311514221n;
const sourceShared = 40058585108914257367732574161222353642573409865793191134873737n;
const scopes = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 55]];
const privateHeader = Buffer.from('302e020100300506032b656e04220420', 'hex');
const publicHeader = Buffer.from('302a300506032b656e032100', 'hex');

/** @param {bigint} n */
function littleEndian32(n) {
  const b = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) { b[i] = Number(n & 255n); n >>= 8n; }
  assert.equal(n, 0n);
  return b;
}
/** @param {Buffer} scalar @param {Buffer} encodedU */
function x25519(scalar, encodedU) {
  assert.equal(scalar.length, 32);
  assert.equal(encodedU.length, 32);
  const privateKey = crypto.createPrivateKey({
    key: Buffer.concat([privateHeader, scalar]), format: 'der', type: 'pkcs8',
  });
  const publicKey = crypto.createPublicKey({
    key: Buffer.concat([publicHeader, encodedU]), format: 'der', type: 'spki',
  });
  return crypto.diffieHellman({privateKey, publicKey});
}
/** @param {Buffer} key @param {number} length */
function chacha20Zero(key, length) {
  const cipher = crypto.createCipheriv('chacha20', key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(length)), cipher.final()]);
}
/** @param {number[]} symbols */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((n, c) => n + c * (c - 1), 0) / (symbols.length * (symbols.length - 1));
}
/** @param {number[]} original @param {Buffer} stream @param {boolean} chain */
function decrypt(original, stream, chain) {
  let prev = 0;
  return original.map((current, i) => {
    const step = (current - prev + 29) % 29;
    prev = current;
    if (chain) return step === 0 ? 28 : (step - 1 - (stream[i] % 28) + 28) % 28;
    return (current - (stream[i] % 29) + 29) % 29;
  });
}
/** @param {number[]} decoded @param {Buffer} stream @param {boolean} chain */
function encrypt(decoded, stream, chain) {
  let prev = 0;
  return decoded.map((plain, i) => {
    if (chain) {
      const step = plain === 28 ? 0 : 1 + (plain + stream[i] % 28) % 28;
      prev = (prev + step) % 29;
      return prev;
    }
    return (plain + stream[i] % 29) % 29;
  });
}

assert.equal(book.pages.length, 58);
assert.equal(book.pages[55].indices.length, 76);
assert.equal(book.pages[57].indices.length, 95);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(r => r.length === 8));
const columnKeys = Array.from({length: 8}, (_, col) => Buffer.from(grid.byte_rows.map(row => row[col])));
const noncanonical = columnKeys.map((v, i) => v[31] >= 128 ? i : -1).filter(i => i >= 0);
assert.deepEqual(noncanonical, [1, 2, 3, 4, 6]);
assert.equal(crypto.getCiphers().includes('chacha20'), true);

const alicePrivate = Buffer.from('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a', 'hex');
const bobPublic = Buffer.from('de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f', 'hex');
assert.equal(x25519(alicePrivate, bobPublic).toString('hex'),
  '4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742');

const original = scopes.map(([lo, hi]) => book.pages.slice(lo, hi + 1).flatMap(p => p.indices));
assert.equal(original.reduce((n, a) => n + a.length, 0), 12956);
const table = [];
for (const [label, source] of [['P', sourcePrime], ['S', sourceShared]]) {
  const scalar = littleEndian32(source);
  for (let section = 0; section < 8; section++) {
    const secret = x25519(scalar, columnKeys[section]);
    assert.equal(secret.length, 32);
    const keyStream = chacha20Zero(secret, original[section].length);
    const baseline = ioc(original[section]);
    for (const chain of [false, true]) {
      const plant = book.pages[57].indices;
      const plantStream = keyStream.subarray(0, plant.length);
      assert.deepEqual(decrypt(encrypt(plant, plantStream, chain), plantStream, chain), plant);
      const decoded = decrypt(original[section], keyStream, chain);
      assert.deepEqual(encrypt(decoded, keyStream, chain), original[section]);
      const digest = crypto.createHash('sha256').update(Buffer.from(decoded)).digest('hex');
      table.push({source: label, section, pages: scopes[section].join('-'), length: decoded.length,
        mode: chain ? 'step28' : 'direct29', baseline: +baseline.toFixed(8),
        ioc: +ioc(decoded).toFixed(8), prefix: decoded.slice(0, 32).join(','), digest});
    }
  }
}
const selected = table.filter(x => x.ioc >= 0.05);
console.log(JSON.stringify({status: 'PASS', matchedOriginalRunes: 12956,
  noncanonicalX25519PublicColumns: noncanonical, samples: table,
  nativeLikeThreshold: 0.05, aboveThreshold: selected}, null, 2));
