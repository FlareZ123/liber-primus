'use strict';

/**
 * Source-exact Tor v2 descriptor IDs for the signed 2014 Cicada onion.
 * Run: node sims/lp2_2014_onion7_hsdesc_id_sft.cjs
 * The v2 onion hostname contains only the first 80 bits of SHA-1 over
 * its RSA PKCS#1 public key. Descriptors can recover that complete key.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const B32 = 'abcdefghijklmnopqrstuvwxyz234567';

/** @param {Buffer} bytes @returns {string} */
function toBase32(bytes) {
  let accumulator = 0;
  let bits = 0;
  let encoded = '';
  for (const byte of bytes) {
    accumulator = (accumulator << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      encoded += B32[(accumulator >>> bits) & 31];
    }
    accumulator &= (1 << bits) - 1;
  }
  if (bits) encoded += B32[(accumulator << (5 - bits)) & 31];
  return encoded;
}

/** @param {string} name @returns {Buffer} */
function decodeV2OnionName(name) {
  const label = name.toLowerCase().replace(/\.onion$/, '');
  assert.match(label, /^[a-z2-7]{16}$/, 'expected 16-character v2 onion label');
  let accumulator = 0;
  let bits = 0;
  const out = [];
  for (const glyph of label) {
    const ordinal = B32.indexOf(glyph);
    assert.ok(ordinal >= 0);
    accumulator = (accumulator << 5) | ordinal;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((accumulator >>> bits) & 255);
      accumulator &= (1 << bits) - 1;
    }
  }
  const permanentId = Buffer.from(out);
  assert.equal(permanentId.length, 10);
  assert.equal(toBase32(permanentId), label);
  return permanentId;
}

/**
 * Compute the historical Tor v2 descriptor ID for a date and a replica.
 * Assumes the ordinary public, unprotected descriptor (empty cookie).
 * @param {string} onion Signed Cicada v2 hidden-service hostname
 * @param {string} when ISO-8601 timestamp in UTC
 * @param {0|1} replica Exact Tor v2 descriptor replica
 * @returns {{timePeriod:number,id:string,secretIdPart:string}}
 */
function descriptorFor(onion, when, replica) {
  assert.ok(replica === 0 || replica === 1);
  const permanentId = decodeV2OnionName(onion);
  const parsed = Date.parse(when);
  assert.ok(Number.isFinite(parsed), 'valid ISO-8601 date');
  const epoch = Math.floor(parsed / 1000);
  const timePeriod = Math.floor((epoch + permanentId[0] * 86400 / 256) / 86400);
  assert.ok(Number.isInteger(timePeriod) && timePeriod >= 0 && timePeriod <= 0xffffffff);
  const seed = Buffer.alloc(5);
  seed.writeUInt32BE(timePeriod, 0);
  seed[4] = replica;
  const secret = crypto.createHash('sha1').update(seed).digest();
  const descriptor = crypto.createHash('sha1')
    .update(Buffer.concat([permanentId, secret])).digest();
  return {timePeriod, id:toBase32(descriptor), secretIdPart:toBase32(secret)};
}

const onion = 'ky2khlqdf7qdznac.onion';
assert.equal(decodeV2OnionName(onion).toString('hex'), '5634a3ae032fe03cb402');
assert.equal(toBase32(Buffer.from('5634a3ae032fe03cb402','hex')), 'ky2khlqdf7qdznac');
assert.equal(Math.floor((1188241957 + 143 * 86400 / 256) / 86400), 13753,
  'Tor historical rend-spec v2 time-period example');

const cases = [
  ['2014-05-02T00:00:00Z',16192,'o3g5wrrasejrb67fvifzzpvq272cuesp','4tdhvu7jubznbwactqr6ocp3ji2hw5f4'],
  ['2014-05-02T20:00:00Z',16193,'jxg7zaqawlnko4cqirbmxxvik4fovevj','i5igk3rv7hmbrsk6hqoccsczejkuhpn5'],
  ['2014-05-11T00:00:00Z',16201,'lz7nudkvxt7nfrjogtheunjyvmqqrpr3','rtzrhcqyyzwhgf3wimrxteiuxr3srh3l'],
  ['2014-05-11T20:00:00Z',16202,'epyxr4qiy5sshxxkzsesuavvysp3hrwd','ou4lvuwwa7tyqtbdiwzjhkowq2oqzvbb'],
];
for (const [when, period, zero, one] of cases) {
  const first = descriptorFor(onion, when, 0);
  const second = descriptorFor(onion, when, 1);
  assert.equal(first.timePeriod, period);
  assert.equal(second.timePeriod, period);
  assert.equal(first.id, zero);
  assert.equal(second.id, one);
  assert.equal(first.id.length, 32);
  assert.equal(second.id.length, 32);
  assert.notEqual(first.id, second.id);
  console.log(JSON.stringify({when, period, replica0:first.id, replica1:second.id}));
}
assert.equal(descriptorFor(onion,'2014-05-11T15:56:14Z',0).timePeriod,16201);
assert.equal(descriptorFor(onion,'2014-05-11T15:56:15Z',0).timePeriod,16202);

// Independent protocol control: a 1024-bit RSA PKCS#1 identity key yields a
// 16-character onion name from the first 80 bits of its SHA-1 digest.
const {publicKey} = crypto.generateKeyPairSync('rsa', {
  modulusLength:1024, publicExponent:0x10001,
});
const pkcs1 = publicKey.export({format:'der', type:'pkcs1'});
const fullHash = crypto.createHash('sha1').update(pkcs1).digest();
const generatedOnion = toBase32(fullHash.subarray(0,10));
assert.equal(decodeV2OnionName(generatedOnion).toString('hex'),
  fullHash.subarray(0,10).toString('hex'));
assert.equal(descriptorFor(generatedOnion,'2014-05-11T20:00:00Z',0).id.length,32);
console.log('PASS: dated descriptor replicas, v2 transition and RSA PKCS#1 identity control.');
console.log('These IDs do not reveal the private key, full public key or LP2 plaintext.');

module.exports = {decodeV2OnionName, descriptorFor};
