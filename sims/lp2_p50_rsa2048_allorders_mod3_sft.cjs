'use strict';

/**
 * Entire-256-byte RSA-2048-modulus exclusion for the original LP2 p49–p51
 * numerical table, invariant under every permutation of the table bytes.
 * Run from repository root: node sims/lp2_p50_rsa2048_allorders_mod3_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {'base60'|'base59-without-f'} Reading */
/** @param {Buffer} bytes @returns {bigint} */
function moduloThree(bytes) {
  let n = 0n;
  for (const byte of bytes) n = (256n * n + BigInt(byte)) % 3n;
  return n;
}

/** @param {Buffer} bytes @returns {Buffer} */
function columnMajor(bytes) {
  const out = Buffer.alloc(256);
  for (let column = 0; column < 8; column++) {
    for (let row = 0; row < 32; row++) out[column * 32 + row] = bytes[row * 8 + column];
  }
  return out;
}

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-grid-256.json'), 'utf8'));
assert.equal(source.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
const tokens = source.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(alphabet60.length, 60);
const variants = [
  {name: 'base60', symbols: alphabet60, expectedSum: 33006},
  {name: 'base59-without-f', symbols: alphabet60.replace('f', ''), expectedSum: 32499},
];
for (const {name, symbols, expectedSum} of variants) {
  const radix = symbols.length;
  const values = tokens.map(token => {
    assert.equal(token.length, 2);
    const high = symbols.indexOf(token[0]);
    const low = symbols.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0, 'unrecognized original table glyph');
    const value = high * radix + low;
    assert.ok(value >= 0 && value < 256, 'not an unsigned byte');
    return value;
  });
  const bytes = Buffer.from(values);
  const sum = values.reduce((total, value) => total + value, 0);
  assert.equal(sum, expectedSum);
  if (name === 'base60') assert.deepEqual(values, source.bytes);
  assert.equal(sum % 3, 0);
  const orders = [bytes, columnMajor(bytes), Buffer.from(bytes).reverse()];
  for (const order of orders) assert.equal(moduloThree(order), 0n);
  const nestedBlocks = [64, 128, 256].map(blockSize => {
    const residues = [];
    for (let offset = 0; offset < 256; offset += blockSize) {
      const block = bytes.subarray(offset, offset + blockSize);
      const blockSum = [...block].reduce((a, b) => a + b, 0);
      residues.push({sum: blockSum, mod3: blockSum % 3});
      assert.equal(moduloThree(block), BigInt(blockSum % 3));
    }
    return {byteBlockSize: blockSize, blocks: residues};
  });
  if (name === 'base59-without-f') {
    assert.ok(nestedBlocks.every(row => row.blocks.every(b => b.mod3 === 0)));
  }
  console.log(JSON.stringify({
    source: 'original LP2 physical pages 49–51 / 256 printed cells',
    reading: name,
    byteCount: bytes.length,
    byteSum: sum,
    byteSumMod3: sum % 3,
    nestedBlocks,
    observedWholeIntegerMod3: String(moduloThree(bytes)),
    allBytePermutations: 'N mod 3 = byteSum mod 3 = 0 (256 ≡ 1 mod 3)',
    rsa2048Modulus: 'impossible as a product of two large primes',
  }));
}

// Independently generated genuine RSA-2048 modulus, using Node's native
// cryptography, demonstrates the criterion rejects no valid RSA modulus.
const {publicKey} = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048, publicExponent: 65537,
});
const jwk = publicKey.export({format: 'jwk'});
const trueModulus = Buffer.from(jwk.n, 'base64url');
assert.equal(trueModulus.length, 256);
assert.notEqual(moduloThree(trueModulus), 0n);
console.log('CONTROL PASS: genuine RSA-2048 modulus is not divisible by 3.');
