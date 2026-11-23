#!/usr/bin/env node
'use strict';

/**
 * Source-exact p49-51 table column4 -> Bitcoin P2PKH address, reproducible test.
 *
 * The original 32x8 numbered table (66-68.jpg) has a spatial 48-4B /
 * 4D-4F gap at 4C. Conditional ASCII HIJK[L]MNO selects column 4 ("L")
 * without consulting the derived Bitcoin address. That whole printed column
 * is 32 bytes, the length of one secp256k1 private scalar. Historical use
 * of Bitcoin and this public-key serialization remains a hypothesis.
 *
 * Windows Node22: node sims/lp2_p50_missingl_bitcoin_vanity_source_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createECDH, createHash } = require('node:crypto');

const source = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const gp = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
assert.equal(source.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(source.rows.length, 32);
assert.ok(source.rows.every(row => row.length === 8));
assert.equal(source.rows.flat().length, 256);
assert.equal(gp.pages.find(page => page.page === 55).runic_count, 76);
assert.equal(gp.pages.find(page => page.page === 56).runic_count
  + gp.pages.find(page => page.page === 57).runic_count, 180);

/** @param {Buffer} bytes @returns {Buffer} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest();
}

/**
 * Bitcoin Base58Check, including leading-zero bytes as '1' digits.
 * @param {Buffer} bytes
 * @returns {string}
 */
function base58(bytes) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let number = BigInt('0x' + bytes.toString('hex'));
  let encoded = '';
  while (number > 0n) {
    encoded = alphabet[Number(number % 58n)] + encoded;
    number /= 58n;
  }
  let leadingZeros = 0;
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) leadingZeros++;
  return '1'.repeat(leadingZeros) + encoded;
}

/**
 * Bitcoin mainnet version-zero P2PKH from exactly one private scalar.
 * @param {Buffer} privateKey 32-byte secp256k1 scalar.
 * @param {'compressed'|'uncompressed'} encoding
 * @returns {{publicKeyHex:string,address:string}}
 */
function p2pkh(privateKey, encoding) {
  assert.equal(privateKey.length, 32);
  const ecdh = createECDH('secp256k1');
  ecdh.setPrivateKey(privateKey);
  const publicKey = ecdh.getPublicKey(undefined, encoding);
  const hash160 = createHash('ripemd160').update(sha256(publicKey)).digest();
  const payload = Buffer.concat([Buffer.from([0]), hash160]);
  const checksum = sha256(sha256(payload)).subarray(0, 4);
  return { publicKeyHex: publicKey.toString('hex'),
    address: base58(Buffer.concat([payload, checksum])) };
}

/** @param {string} alphabet @returns {number[][]} */
function decode(alphabet) {
  const rows = source.rows.map(row => row.map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]), lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0);
    const value = hi * alphabet.length + lo;
    assert.ok(value >= 0 && value <= 255);
    return value;
  }));
  return rows;
}

const original = decode(source.alphabet);
assert.deepEqual(original, source.byte_rows);
const alternative = decode(source.alphabet.replace('f', ''));

// Independent standard positive: secp256k1 scalar 1 -> first standard
// compressed P2PKH address. A wholly invalid hash/public encoding fails here.
const keyOne = Buffer.alloc(32);
keyOne[31] = 1;
assert.equal(p2pkh(keyOne, 'compressed').address, '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH');

// Original exact 32-byte, 0-based fifth (L) printed column.
const columnIndex = 4;
const key = Buffer.from(original.map(row => row[columnIndex]));
const keyHex = '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4';
assert.equal(key.toString('hex'), keyHex);
assert.deepEqual(source.rows.map(row => row[columnIndex]), [
  '1b','47','1g','2U','0s','3o','1Q','1k','3J','1s','2r','3u','1N','0E','0s','0D',
  '2n','45','46','0q','1j','2S','2O','0c','2u','3E','1A','0w','2O','3w','0M','30'
]);
/**
 * Mean of ASCII character codes, rounded to a whole-number code.
 * @param {string} word A known nonempty ASCII word
 * @returns {number}
 */
function roundedAsciiMean(word) {
  const values = [...word].map(letter => letter.charCodeAt(0));
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

const result = p2pkh(key, 'compressed');
assert.equal(result.publicKeyHex,
  '03ac234dba2f6b2891c4c6032e1378f2e29ed22ce18e34737fa94e34c8f1963a64');
assert.equal(result.address, '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');
const meanCue = result.address.match(/^1(Mean)(png)/);
assert.ok(meanCue);
assert.equal(meanCue[1], 'Mean');
assert.equal(roundedAsciiMean(meanCue[2].toUpperCase()), 0x4c);
assert.equal(roundedAsciiMean(meanCue[2]), 0x6c);
assert.equal(source.rows.flat().includes('4C'), false);

assert.equal(p2pkh(key, 'uncompressed').address, '1ATpEDYVi7WF72jntLq85Y5R2vtDjkZrUv');
assert.equal(p2pkh(Buffer.from(alternative.map(row => row[4])), 'compressed').address,
  '1EXiPou2VcwCp93WgmLyia11Ybp98zFebh');

const comparisons = [];
for (const [radix, rows] of [['60', original], ['59', alternative]]) {
  for (let col = 0; col < 8; col++) {
    const bytes = Buffer.from(rows.map(row => row[col]));
    for (const encoding of ['compressed', 'uncompressed']) {
      const address = p2pkh(bytes, encoding).address;
      comparisons.push({ radix, col, encoding, address });
    }
  }
}
assert.equal(comparisons.length, 32);
assert.equal(comparisons.filter(x => x.address.startsWith('1Meanpng')).length, 1);
assert.deepEqual(comparisons.find(x => x.address.startsWith('1Meanpng')),
  { radix: '60', col: 4, encoding: 'compressed', address: result.address });

console.log(JSON.stringify({
  source: 'LP2 physical pp49-51 32x8 numeric table, canonical base60 column index4',
  sourceTokens: source.rows.map(row => row[columnIndex]),
  scalarHex: keyHex,
  compressedPublicKeyHex: result.publicKeyHex,
  p2pkh: result.address,
  independentPositive: 'Bitcoin compressed secp256k1 private key 1 PASS',
  alternative: {
    base60Uncompressed: p2pkh(key, 'uncompressed').address,
    base59Compressed: p2pkh(Buffer.from(alternative.map(row => row[4])), 'compressed').address
  },
  comparedNaturalConventions: comparisons.length,
  addressesWithSameInitialEightCharacters: 1,
  asciiMeanReturn: { PNG: '0x4C=L', png: '0x6C=l', caveat: 'post-recognition only' },
  known: 'Exact reproducible source transformation only; no unknown LP2 rune recovered'
}, null, 2));
console.log('PASS: original p50 printed column selects a reproducible 1Meanpng... address.');
