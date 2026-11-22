'use strict';
/**
 * One original-source key-factor hypothesis. In 2014, Cicada served a
 * 256-byte growing Onion-2 string. Its length equals half the 4096-bit
 * public modulus size of the authenticated Cicada OpenPGP key, so test
 * whether the original 2048-bit register is exactly a private RSA factor.
 * This hypothesis is NOT attested as a puzzle instruction.
 *
 * Only the source-native and reversed-octet integer representations are
 * admitted; neither English nor LP2 ciphertext participates in selection.
 * Node.js 22; zero third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { dearmor, parseKeys } = require('./grid_rsa_pgp_signature.cjs');

const root = path.resolve(__dirname, '..');
const onion = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/cicada2014-onion2-timing.json'), 'utf8'
));
const source = Buffer.from(onion.final_hex, 'hex');
assert.equal(onion.final_hex.length, 512);
assert.equal(source.length, 256);
assert.equal(
  require('node:crypto').createHash('sha256').update(source).digest('hex'),
  onion.final_bytes_sha256
);

const keys = parseKeys(dearmor(fs.readFileSync(
  path.join(root, 'resources/control/cicada-3301-public-key.asc'), 'utf8'
)));
assert.equal(keys.length, 2);
assert(keys.every(key => key.bits === 4096 && key.exponent === 65537n));

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** @param {Buffer} bytes @returns {bigint} */
function asInteger(bytes) {
  return BigInt('0x' + bytes.toString('hex'));
}
const tests = [];
for (const [orientation, bytes] of [
  ['published-byte-order', source],
  ['reversed-byte-order', Buffer.from(source).reverse()]
]) {
  const candidate = asInteger(bytes);
  assert(candidate > 1n);
  for (const [index, key] of keys.entries()) {
    const common = gcd(candidate, key.modulus);
    tests.push({
      orientation,
      publicKey: index === 0 ? 'primary' : 'subkey',
      candidateBits: candidate.toString(2).length,
      candidateParity: Number(candidate & 1n),
      gcd: common.toString(),
      exactFactor: key.modulus % candidate === 0n
    });
  }
}
assert.equal(tests.length, 4);
assert(tests.every(x => x.gcd === '1' && !x.exactFactor));

const witness = asInteger(source);
assert.equal(gcd(witness * 65537n, witness), witness);
console.log(JSON.stringify({
  hypothesis: '2014 growing Onion-2 256-byte string equals a 2048-bit RSA prime factor',
  sourceSha256: onion.final_bytes_sha256,
  primaryFingerprint: keys[0].fingerprint,
  publicKeyBits: keys.map(key => key.bits),
  tests,
  syntheticPositive: 'gcd(source_integer * 65537, source_integer) = source_integer',
  verdict: 'Neither byte orientation divides or shares a factor with either Cicada RSA-4096 public modulus; private-factor interpretation rejected.',
  scope: 'Cannot exclude a transformed source string, another cryptographic key, or independent role for Onion-2 timing.'
}, null, 2));
