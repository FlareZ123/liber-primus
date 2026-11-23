'use strict';
/**
 * One-file Node 22 test of a finite BIP32 key-schedule hypothesis for LP2.
 * Read-only; accesses only committed original-source resources.
 * Source: Bitcoin BIP-0032 (2012), https://bips.dev/32/
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ORDER = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
const ABC = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** @param {bigint} n @param {number} len @returns {Buffer} */
function ser(n, len) { return Buffer.from(n.toString(16).padStart(2 * len, '0'), 'hex'); }
/** @param {Buffer} b @returns {bigint} */
function parse(b) { return BigInt('0x' + b.toString('hex')); }
/** @param {Buffer} b @returns {Buffer} */
function sha(b) { return crypto.createHash('sha256').update(b).digest(); }
/** @param {bigint} key @returns {Buffer} */
function pub(key) {
  const e = crypto.createECDH('secp256k1');
  e.setPrivateKey(ser(key, 32));
  return e.getPublicKey(undefined, 'compressed');
}
/** @param {Buffer} data @returns {string} */
function base58Check(data) {
  const full = Buffer.concat([data, sha(sha(data)).subarray(0, 4)]);
  let n = parse(full);
  let out = '';
  while (n > 0n) {
    const digit = Number(n % 58n);
    out = ABC[digit] + out;
    n /= 58n;
  }
  for (const byte of full) {
    if (byte !== 0) break;
    out = '1' + out;
  }
  return out;
}
/** @param {bigint} key @returns {Buffer} */
function hash160(key) {
  return crypto.createHash('ripemd160').update(sha(pub(key))).digest();
}
/** @param {bigint} key @returns {string} */
function address(key) { return base58Check(Buffer.concat([Buffer.alloc(1), hash160(key)])); }
/** @param {bigint} key @param {Buffer} chain @param {number} index @returns {{key: bigint, chain: Buffer}} */
function ckd(key, chain, index) {
  assert(key > 0n && key < ORDER);
  assert.equal(chain.length, 32);
  assert(Number.isInteger(index) && index >= 0 && index < 2 ** 32);
  const input = Buffer.concat([
    index >= 0x80000000 ? Buffer.concat([Buffer.alloc(1), ser(key, 32)]) : pub(key),
    ser(BigInt(index), 4),
  ]);
  const i = crypto.createHmac('sha512', chain).update(input).digest();
  const left = parse(i.subarray(0, 32));
  assert(left < ORDER);
  const child = (left + key) % ORDER;
  assert(child > 0n);
  return { key: child, chain: i.subarray(32) };
}
/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const counts = new Array(29).fill(0);
  for (const i of sequence) { assert(i >= 0 && i < 29); counts[i]++; }
  const n = sequence.length;
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
}
/** @param {number[]} ciphertext @param {Buffer} pad @param {boolean} differential @param {number} sign @returns {number[]} */
function decode(ciphertext, pad, differential, sign) {
  return ciphertext.map((c, i) => {
    const step = differential && i ? (c - ciphertext[i - 1] + 29) % 29 : c;
    return (step + sign * (pad[i % pad.length] % 29) + 29) % 29;
  });
}
/** @param {number[]} plaintext @param {Buffer} pad @param {boolean} differential @param {number} sign @returns {number[]} */
function encrypt(plaintext, pad, differential, sign) {
  const result = [];
  for (let i = 0; i < plaintext.length; i++) {
    const step = (plaintext[i] - sign * (pad[i % pad.length] % 29) + 29) % 29;
    result.push(differential && i ? (result[i - 1] + step) % 29 : step);
  }
  return result;
}

assert.equal(ABC.length, 58);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.runes.length, 29);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
const raw = Buffer.from(grid.byte_rows.flat());
assert.equal(raw.length, 256);
assert.equal(sha(raw).toString('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const col = (x) => Buffer.from(grid.byte_rows.map((row) => row[x]));
const parentKey = parse(col(4));
assert.equal(col(4).toString('hex'), '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
assert.equal(address(parentKey), '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');

// Standard BIP32 test vector 1, both hardened and nonhardened child derivations.
const vector = crypto.createHmac('sha512', Buffer.from('Bitcoin seed'))
  .update(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex')).digest();
const master = { key: parse(vector.subarray(0, 32)), chain: vector.subarray(32) };
const ch0 = ckd(master.key, master.chain, 0x80000000);
const xprv0 = base58Check(Buffer.concat([
  Buffer.from('0488ade401', 'hex'), hash160(master.key).subarray(0, 4),
  Buffer.from('80000000', 'hex'), ch0.chain, Buffer.alloc(1), ser(ch0.key, 32)
]));
assert.equal(xprv0,
  'xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7');
const ch01 = ckd(ch0.key, ch0.chain, 1);
const xprv01 = base58Check(Buffer.concat([
  Buffer.from('0488ade402', 'hex'), hash160(ch0.key).subarray(0, 4),
  Buffer.from('00000001', 'hex'), ch01.chain, Buffer.alloc(1), ser(ch01.key, 32)
]));
assert.equal(xprv01,
  'xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs');

const pages = corpus.pages;
assert.equal(pages.filter((p) => p.page <= 55).reduce((n, p) => n + p.indices.length, 0), 12956);
const original = pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const native = pages.find((p) => p.page === 57).indices;
const sourceOpening = pages.filter((p) => p.page <= 2).flatMap((p) => p.indices);
console.log(JSON.stringify({ source: 'LP2 canonical original', totalRunes: original.length,
  originalIoC: ioc(original), nativeSolvedP57IoC: ioc(native),
  rootAddress: address(parentKey), bip32Vector: 'm/0H and m/0H/1 passed' }));

const output = [];
for (const chainCol of [3, 5]) {
  for (const hardened of [false, true]) {
    const chain = col(chainCol);
    const childKeys = pages.filter((p) => p.page <= 55).map((p) =>
      ser(ckd(parentKey, chain, p.page + (hardened ? 0x80000000 : 0)).key, 32));
    const childAddresses = [0, 1, 2].map((page) => address(
      ckd(parentKey, chain, page + (hardened ? 0x80000000 : 0)).key));
    for (const differential of [false, true]) {
      for (const sign of [-1, 1]) {
        const decoded = pages.filter((p) => p.page <= 55).map((p, idx) =>
          decode(p.indices, childKeys[idx], differential, sign));
        const flat = decoded.flat();
        const start = decoded.slice(0, 3).flat();
        const tail = decoded.filter((_, idx) => {
          const page = pages.filter((p) => p.page <= 55)[idx].page;
          return page === 54 || page === 55;
        }).flat();
        assert.deepEqual(start.length, sourceOpening.length);
        assert.deepEqual(decoded.map((plain, idx) =>
          encrypt(plain, childKeys[idx], differential, sign)),
          pages.filter((p) => p.page <= 55).map((p) => p.indices));
        assert.deepEqual(decode(encrypt(native, childKeys[0], differential, sign),
          childKeys[0], differential, sign), native);
        output.push({
          chainCol, hardened, differential, sign, fullIoC: ioc(flat),
          firstThreeIoC: ioc(start), lastTwoIoC: ioc(tail),
          openingGPIndices: start.slice(0, 40),
          childAddresses
        });
      }
    }
  }
}
output.sort((a, b) => b.fullIoC - a.fullIoC);
console.log(JSON.stringify({ candidates: output.length,
  bestFull: output.slice(0, 3),
  worstFull: output.slice(-1),
  firstThreeIoCRange: [Math.min(...output.map(x => x.firstThreeIoC)), Math.max(...output.map(x => x.firstThreeIoC))],
  lastTwoIoCRange: [Math.min(...output.map(x => x.lastTwoIoC)), Math.max(...output.map(x => x.lastTwoIoC))] }, null, 2));
assert(output.every(x => x.fullIoC < 0.05));
assert(output.every(x => x.firstThreeIoC < 0.05));
console.log('PASS: 16 source-fixed complete original decodes, exact inversions, two published BIP32 vectors, solved-native controls.');
