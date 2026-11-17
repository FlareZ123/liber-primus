'use strict';

/**
 * Source-exact OpenPGP v4 packet audit for the signed 2016 Cicada clue.
 * Run from repository root with Node 22, on Windows or Linux.
 * Uses only built-in modules and does not mutate repository files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

// Windows Git checkout may expand LF to CRLF; reconstruct the pinned Git blob bytes.
const checkedOut = fs.readFileSync('resources/historical/cicada2016-4gq25-outguess.asc');
const message = Buffer.from(checkedOut.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
const publicArmor = fs.readFileSync('resources/control/cicada-3301-public-key.asc', 'utf8');
const messageText = message.toString('utf8');
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

assert.equal(message.length, 1136);
assert.equal(sha256(message), 'fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010');

/** @param {string} text @param {string} kind @returns {Buffer} */
function unarmor(text, kind) {
  const match = text.match(new RegExp('-----BEGIN PGP ' + kind + '-----([\\s\\S]*?)-----END PGP ' + kind + '-----'));
  assert.ok(match, 'missing ' + kind + ' armor');
  const base64 = match[1].split(/\r?\n/).filter((line) => (
    /^[A-Za-z0-9+/=]+$/.test(line) && !line.startsWith('=')
  )).join('');
  return Buffer.from(base64, 'base64');
}

/** @param {Buffer} bytes @returns {{tag:number, offset:number, body:Buffer}[]} */
function parsePackets(bytes) {
  const packets = [];
  for (let pos = 0; pos < bytes.length;) {
    const offset = pos;
    const header = bytes[pos++];
    assert.ok((header & 0x80) !== 0, 'invalid packet header');
    let tag, length;
    if (header & 0x40) {
      tag = header & 63;
      const first = bytes[pos++];
      if (first < 192) length = first;
      else if (first < 224) length = ((first - 192) << 8) + bytes[pos++] + 192;
      else if (first === 255) { length = bytes.readUInt32BE(pos); pos += 4; }
      else throw new Error('partial length unsupported by preserved source');
    } else {
      tag = (header >> 2) & 15;
      const mode = header & 3;
      if (mode === 0) length = bytes[pos++];
      else if (mode === 1) { length = bytes.readUInt16BE(pos); pos += 2; }
      else if (mode === 2) { length = bytes.readUInt32BE(pos); pos += 4; }
      else throw new Error('indeterminate length unsupported by preserved source');
    }
    assert.ok(pos + length <= bytes.length, 'packet length exceeds armor');
    packets.push({ tag, offset, body: bytes.subarray(pos, pos + length) });
    pos += length;
  }
  return packets;
}

/** @param {Buffer} bytes @returns {{type:number, critical:boolean, value:string}[]} */
function parseSubpackets(bytes) {
  const fields = [];
  for (let pos = 0; pos < bytes.length;) {
    const first = bytes[pos++];
    let length = first;
    if (first >= 192 && first < 255) {
      length = ((first - 192) << 8) + bytes[pos++] + 192;
    } else if (first === 255) {
      length = bytes.readUInt32BE(pos); pos += 4;
    }
    assert.ok(length > 0 && pos + length <= bytes.length, 'bad subpacket');
    const type = bytes[pos] & 127;
    const critical = Boolean(bytes[pos] & 128);
    fields.push({ type, critical, value: bytes.subarray(pos + 1, pos + length).toString('hex') });
    pos += length;
  }
  return fields;
}

const signaturePackets = parsePackets(unarmor(messageText, 'SIGNATURE'));
assert.equal(signaturePackets.length, 1);
assert.equal(signaturePackets[0].tag, 2);
assert.equal(signaturePackets[0].offset, 0);
const sig = signaturePackets[0].body;
assert.equal(sig.length, 540);
assert.deepEqual([...sig.subarray(0, 4)], [4, 1, 1, 2]); // v4, canonical text, RSA, SHA1
const hashedLength = sig.readUInt16BE(4);
assert.equal(hashedLength, 6);
const hashed = parseSubpackets(sig.subarray(6, 6 + hashedLength));
const unhashedOffset = 6 + hashedLength;
const unhashedLength = sig.readUInt16BE(unhashedOffset);
const unhashed = parseSubpackets(sig.subarray(unhashedOffset + 2, unhashedOffset + 2 + unhashedLength));
assert.deepEqual(hashed, [{ type: 2, critical: false, value: '5685c1c3' }]); // signature creation time
assert.deepEqual(unhashed, [{ type: 16, critical: false, value: '181f01e57a35090f' }]); // issuer key ID
const signatureValueOffset = unhashedOffset + 2 + unhashedLength;
assert.equal(sig.subarray(signatureValueOffset, signatureValueOffset + 2).toString('hex'), 'f065');
assert.equal(sig.readUInt16BE(signatureValueOffset + 2), 4094); // MPI encoded bit length
assert.equal(sig.subarray(signatureValueOffset + 4).length, 512);

const publicPackets = parsePackets(unarmor(publicArmor, 'PUBLIC KEY BLOCK'));
assert.deepEqual(publicPackets.map((packet) => packet.tag), [6, 13, 2, 14, 2]);
const primary = publicPackets[0].body;
assert.equal(primary[0], 4);
assert.equal(primary[5], 1); // RSA
assert.equal(primary.readUInt16BE(6), 4096);
const prefix = Buffer.alloc(3);
prefix[0] = 0x99;
prefix.writeUInt16BE(primary.length, 1);
const fingerprint = crypto.createHash('sha1').update(prefix).update(primary).digest('hex');
assert.equal(fingerprint, '6d854cd7933322a601c3286d181f01e57a35090f');
assert.equal(publicPackets[1].body.toString('utf8'), 'Cicada 3301 (845145127)');

// Decode RSA signature using public key to inspect its encoded-message block.
// OpenPGP RSA v4 signatures use the deterministic EMSA-PKCS1-v1_5 format.
const modulusBytes = Math.ceil(primary.readUInt16BE(6) / 8);
const modulus = primary.subarray(8, 8 + modulusBytes);
const exponentOffset = 8 + modulusBytes;
const exponentBytes = Math.ceil(primary.readUInt16BE(exponentOffset) / 8);
const exponent = primary.subarray(exponentOffset + 2, exponentOffset + 2 + exponentBytes);
assert.equal(exponent.toString('hex'), '010001');
const key = crypto.createPublicKey({
  key: { kty: 'RSA', n: modulus.toString('base64url'), e: exponent.toString('base64url') },
  format: 'jwk'
});
const rsaSignature = sig.subarray(signatureValueOffset + 4);
const encodedMessage = crypto.publicDecrypt({
  key, padding: crypto.constants.RSA_NO_PADDING
}, rsaSignature);
assert.equal(encodedMessage.length, 512);
assert.equal(encodedMessage.subarray(0, 2).toString('hex'), '0001');
const digestInfoPrefix = Buffer.from('3021300906052b0e03021a05000414', 'hex'); // DER SHA-1
const digestInfoOffset = encodedMessage.length - digestInfoPrefix.length - 20;
assert.equal(encodedMessage[digestInfoOffset - 1], 0);
assert.ok(encodedMessage.subarray(2, digestInfoOffset - 1).every((byte) => byte === 0xff));
assert.ok(encodedMessage.subarray(digestInfoOffset, digestInfoOffset + 15).equals(digestInfoPrefix));
const signedDigest = encodedMessage.subarray(-20);
assert.equal(signedDigest.subarray(0, 2).toString('hex'), 'f065');
const deterministicPadBytes = digestInfoOffset - 3;
assert.equal(deterministicPadBytes, 474);

const time = new Date(Number.parseInt(hashed[0].value, 16) * 1000).toISOString();
assert.equal(time, '2016-01-01T00:01:07.000Z');
const keyCreation = new Date(primary.readUInt32BE(1) * 1000).toISOString();
assert.equal(keyCreation, '2012-01-05T03:39:43.000Z');

console.log(JSON.stringify({
  input_sha256: sha256(message),
  signature_packet: { tag: 2, body_bytes: sig.length, version: 4,
    signature_class: 'canonical-text(0x01)', public_algorithm: 'RSA(1)', hash: 'SHA1(2)',
    hashed, unhashed, digest_prefix_hex: 'f065', rsa_signature_mpi_bits: 4094 },
  signer: { fingerprint, key_id: fingerprint.slice(-16), key_created_utc: keyCreation,
    user_id: publicPackets[1].body.toString('utf8'),
    public_key_packet_tags: publicPackets.map((packet) => packet.tag) },
  signature_created_utc: time,
  rsa_pkcs1_v1_5: { deterministic_ff_padding_bytes: deterministicPadBytes,
    digest_info_prefix: digestInfoPrefix.toString('hex'),
    signed_sha1_digest_hex: signedDigest.toString('hex'),
    free_bytes_in_encoded_rsa_signature: 0 },
  decision: 'Packet contains only a creation-time hashed subpacket and issuer-ID unhashed subpacket; no LP2 key/operation mapping'
}, null, 2));
