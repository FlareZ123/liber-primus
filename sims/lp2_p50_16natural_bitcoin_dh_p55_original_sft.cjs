'use strict';

/**
 * Original p50 numerical table: two natural 32-byte serialization families,
 * Bitcoin P2PKH first-word test, and one fixed DH-to-p55 receiver.
 *
 * Exploratory source hypothesis: 32x8 bytes form eight adjacent row-major
 * 32-byte scalars or eight vertical 32-byte column scalars. The very first
 * row-major block addresses 1DH...; the independently missing-L-selected
 * column 4 addresses 1Meanpng..., suggesting an EC-DH combination.
 * This is not an authenticated creator instruction, and recognition of
 * "DH" happened after computing addresses.
 *
 * Entire p55 ciphertext is consumed once in printed GP29 order.
 * No passwords, phase sweeps, fitted key derivation, or added skips.
 * This SFT is read-only and works with Node.js 22 on Windows.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createECDH, createHash } = require('node:crypto');

const table = JSON.parse(fs.readFileSync(
  'resources/liber-primus/base60-grid.json', 'utf8'));
const corpus = JSON.parse(fs.readFileSync(
  'resources/liber-primus/lp2-corpus.json', 'utf8'));
const SHA256 = b => createHash('sha256').update(b).digest();
const bytes = Buffer.from(table.byte_rows.flat());
assert.equal(bytes.length, 256);
assert.equal(SHA256(bytes).toString('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[57].indices.length, 95);

/** @param {Buffer} data @returns {string} */
function base58(data) {
  const digits = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let value = BigInt('0x' + data.toString('hex'));
  let out = '';
  while (value > 0n) {
    out = digits[Number(value % 58n)] + out;
    value /= 58n;
  }
  for (const b of data) {
    if (b !== 0) break;
    out = '1' + out;
  }
  return out;
}

/** @param {Buffer} privateKey @returns {{ecdh:import('node:crypto').ECDH, address:string}} */
function bitcoin(privateKey) {
  assert.equal(privateKey.length, 32);
  const ecdh = createECDH('secp256k1');
  ecdh.setPrivateKey(privateKey);
  const pub = ecdh.getPublicKey(undefined, 'compressed');
  const h160 = createHash('ripemd160').update(SHA256(pub)).digest();
  const data = Buffer.concat([Buffer.from([0]), h160]);
  const address = base58(Buffer.concat([
    data, SHA256(SHA256(data)).subarray(0, 4)
  ]));
  return { ecdh, address };
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** @param {number[]} a @returns {string} */
function spell(a) {
  const gp = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
    'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IO','EA'];
  return a.map(x => gp[x]).join('');
}

/** @param {number[]} cipher @param {Buffer} key @returns {number[]} */
function subtract(cipher, key) {
  return cipher.map((c, i) => (c - key[i % 32] % 29 + 29) % 29);
}

/** @param {number[]} plain @param {Buffer} key @returns {number[]} */
function encrypt(plain, key) {
  return plain.map((p, i) => (p + key[i % 32]) % 29);
}

const rowKeys = Array.from({ length: 8 }, (_, i) =>
  bytes.subarray(32 * i, 32 * (i + 1)));
const colKeys = Array.from({ length: 8 }, (_, i) =>
  Buffer.from(Array.from({ length: 32 }, (_, j) => bytes[8 * j + i])));
const rows = rowKeys.map(bitcoin);
const cols = colKeys.map(bitcoin);
assert.equal(rows[0].address, '1DHLCi9sjH6mPv1BLseSUiitzr6SQPK1gW');
assert.equal(cols[4].address, '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');
assert.equal(rows.length + cols.length, 16);
const shared = rows[0].ecdh.computeSecret(cols[4].ecdh.getPublicKey());
assert.deepEqual(shared, cols[4].ecdh.computeSecret(rows[0].ecdh.getPublicKey()));
assert.equal(shared.toString('hex'),
  '3601bfb835efb6d19432d3a5b18f26d0192182b18923558ae29ccf8ecab27750');

const cipher = corpus.pages[55].indices;
const decoded = subtract(cipher, shared);
assert.deepEqual(encrypt(decoded, shared), cipher);
assert.ok(Math.abs(ioc(cipher) - 0.037894736842105266) < 1e-12);
assert.ok(Math.abs(ioc(decoded) - 0.03192982456140351) < 1e-12);

const solved = corpus.pages[57].indices;
const planted = encrypt(solved, shared);
assert.deepEqual(subtract(planted, shared), solved);

console.log('First eight row-major 32-byte Bitcoin addresses:');
for (const x of rows) console.log(x.address);
console.log('Eight full 32-byte column Bitcoin addresses:');
for (const x of cols) console.log(x.address);
console.log('Two original-source private-key ECDH x-coordinate:', shared.toString('hex'));
console.log('Original p55 76-rune IoC:', ioc(cipher));
console.log('Fixed raw ECDH inverse 76-rune IoC:', ioc(decoded));
console.log('Fixed raw ECDH transcript:', spell(decoded));
console.log('Solved p57 95-rune planted control exact: YES');
console.log('Original p55 forward replay exact: YES');
console.log('VERDICT: NO NATIVE GP29 PLAINTEXT UNDER THIS CONDITIONAL RECEIVER');
