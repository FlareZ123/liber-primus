'use strict';

/**
 * Original-LP2 authenticated-capsule test with a p32 source-derived key.
 * p32's 11x11 prime-figure axes are independent 2016 image checksums:
 * sum(top row)=563; sum(left col)=569. The untouched 10x10 interior
 * is consequently a natural, explicitly hypothetical key capsule.
 * No original ciphertext is fitted to choose key bytes or AEAD settings.
 * This tests one reproducible, narrow cryptographic use of that capsule.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const p32 = corpus.pages.find(p => p.page === 32);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(p32.indices.length, 121);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, page) => n + page.indices.length, 0), 12956);

/** @param {number[]} digits @returns {Buffer} */
function packGP29(digits) {
  let integer = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    integer = integer * 29n + BigInt(digit);
  }
  const bytes = Buffer.alloc(Math.ceil(digits.length * Math.log2(29) / 8));
  for (let i = bytes.length - 1; i >= 0; i--) {
    bytes[i] = Number(integer & 255n);
    integer >>= 8n;
  }
  assert.equal(integer, 0n);
  return bytes;
}
const primes = p32.indices.map(i => corpus.prime[i]);
const top = primes.slice(0, 11).reduce((a, b) => a + b, 0);
const left = Array.from({length: 11}, (_, r) => primes[r * 11])
  .reduce((a, b) => a + b, 0);
assert.equal(top, 563);
assert.equal(left, 569);
const interior = p32.indices.filter((_, i) => i >= 11 && i % 11 > 0);
assert.equal(interior.length, 100);
const keySource = packGP29(interior);
assert.equal(keySource.length, 61);
assert.equal(keySource.toString('hex'),
  '0e99a28c62bc9bb093471412e0970eba33f0662c81a4aaf207b4ac04178ef89006e188f06951e39370ee83c08c67ac8c0e3652e0a6b1d5acd85ff4d2c6');
const key = crypto.createHash('sha256').update(keySource).digest();
const algorithms = ['aes-256-gcm', 'chacha20-poly1305'];
/**
 * @param {string} algorithm
 * @param {Buffer} input
 * @returns {Buffer | null}
 */
function open(algorithm, input) {
  assert(input.length >= 28);
  const iv = input.subarray(0, 12);
  const ciphertext = input.subarray(12, input.length - 16);
  const tag = input.subarray(input.length - 16);
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv, {authTagLength: 16});
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (error) {
    if (error instanceof Error &&
      /authenticate|authenticity|bad decrypt|unsupported state/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}
/** @param {string} algorithm */
function positive(algorithm) {
  const iv = Buffer.alloc(12);
  const plain = Buffer.from('A separately encrypted native source-plaintext control', 'utf8');
  const cipher = crypto.createCipheriv(algorithm, key, iv, {authTagLength: 16});
  const encoded = Buffer.concat([cipher.update(plain), cipher.final()]);
  const sourceEnvelope = Buffer.concat([iv, encoded, cipher.getAuthTag()]);
  const decoded = open(algorithm, sourceEnvelope);
  assert(decoded && decoded.equals(plain));
  const tampered = Buffer.from(sourceEnvelope);
  tampered[tampered.length - 1] ^= 1;
  assert.equal(open(algorithm, tampered), null);
}
for (const algorithm of algorithms) positive(algorithm);

const datasets = [
  {name: 'all55', digits: pages.flatMap(page => page.indices), selfKeyOverlap: true},
  {name: 'exclude-source-p32', digits: pages.filter(page => page.page !== 32)
    .flatMap(page => page.indices), selfKeyOverlap: false}
];
const results = [];
for (const data of datasets) {
  const original = packGP29(data.digits);
  assert.equal(original.length, data.name === 'all55' ? 7868 : 7795);
  for (const algorithm of algorithms) {
    const decoded = open(algorithm, original);
    results.push({
      framing: data.name, algorithm, digits: data.digits.length,
      packedBytes: original.length, ciphertextBytes: original.length - 28,
      selfKeyOverlap: data.selfKeyOverlap,
      authenticated: decoded !== null,
      plaintextUTF8: decoded === null ? null : decoded.toString('utf8'),
      plaintextSHA256: decoded === null ? null :
        crypto.createHash('sha256').update(decoded).digest('hex')
    });
  }
}
console.log(JSON.stringify({
  classification: 'original-input source-fixed AEAD test; absence of authentication is only finite exclusion',
  source: {page:32, imageDimensions:[top,left], interiorDigits:100,
    keySourceLength:keySource.length,
    keySourceSHA256:key.toString('hex')},
  positiveControls: {bothAlgorithms: true, corruptTagRejected: true},
  results
}, null, 2));
