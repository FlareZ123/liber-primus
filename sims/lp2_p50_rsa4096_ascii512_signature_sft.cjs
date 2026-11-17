'use strict';
/**
 * Source-selected original-table test: can the 256 printed two-glyph
 * LP2 numerical cells supply the exact 512-byte RSA signature of Cicada's
 * genuine 4096-bit OpenPGP key? Validate against the key's historical
 * self-certification, which is a positive real-world signature.
 *
 * SFT from the repository root: node sims/lp2_p50_rsa4096_ascii512_signature_sft.cjs
 * @module lp2_p50_rsa4096_ascii512_signature_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const armored = fs.readFileSync(path.join(root,
  'resources', 'historical', 'cicada-3301-2012-public-key.asc'), 'utf8');

/** @param {string} text @returns {Buffer} */
function unarmor(text) {
  const lines = text.split(/\r?\n/);
  const body = lines.filter(line => line.length > 0 &&
    !line.startsWith('-----') && !line.startsWith('=')).join('');
  return Buffer.from(body, 'base64');
}

/**
 * Parse only definite-length public-key source packets.
 * @param {Buffer} input
 * @returns {Array<{tag:number,body:Buffer}>}
 */
function readPackets(input) {
  const packets = [];
  for (let cursor = 0; cursor < input.length;) {
    const lead = input[cursor++];
    assert.ok((lead & 128) !== 0);
    let tag, length;
    if ((lead & 64) !== 0) {
      tag = lead & 63;
      const next = input[cursor++];
      if (next < 192) length = next;
      else if (next < 224) length = ((next - 192) << 8) + input[cursor++] + 192;
      else {
        assert.equal(next, 255, 'no partial-length packets in authentic public key');
        length = input.readUInt32BE(cursor);
        cursor += 4;
      }
    } else {
      tag = (lead >> 2) & 15;
      const mode = lead & 3;
      if (mode === 0) length = input[cursor++];
      else if (mode === 1) {
        length = input.readUInt16BE(cursor);
        cursor += 2;
      } else if (mode === 2) {
        length = input.readUInt32BE(cursor);
        cursor += 4;
      } else length = input.length - cursor;
    }
    assert.ok(cursor + length <= input.length);
    packets.push({ tag, body: input.subarray(cursor, cursor + length) });
    cursor += length;
  }
  return packets;
}

/** @param {Buffer} bytes @returns {bigint} */
function asInt(bytes) { return BigInt('0x' + bytes.toString('hex')); }
/**
 * @param {Buffer} data
 * @param {number} offset
 * @returns {{bits:number,value:bigint,next:number}}
 */
function readMPI(data, offset) {
  const bits = data.readUInt16BE(offset);
  const end = offset + 2 + Math.ceil(bits / 8);
  return { bits, value: asInt(data.subarray(offset + 2, end)), next: end };
}
/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus */
function modPow(base, exponent, modulus) {
  let result = 1n;
  for (base %= modulus; exponent > 0n;
       exponent >>= 1n, base = base * base % modulus) {
    if (exponent & 1n) result = result * base % modulus;
  }
  return result;
}
/** @param {bigint} number @returns {Buffer} */
function em512(number) {
  return Buffer.from(number.toString(16).padStart(1024, '0'), 'hex');
}
/**
 * Classical RFC 4880 v4 RSA PKCS#1-v1.5 signature representative.
 * @param {Buffer} message
 * @returns {Buffer|null}
 */
function signatureDigestInfo(message) {
  if (message.length !== 512 || message[0] !== 0 || message[1] !== 1) return null;
  let p = 2;
  while (p < message.length && message[p] === 255) p++;
  return p >= 10 && p < message.length && message[p] === 0 ?
    message.subarray(p + 1) : null;
}
/** @param {Buffer} signaturePacket @returns {bigint} */
function signatureMPI(signaturePacket) {
  assert.equal(signaturePacket[0], 4);
  assert.equal(signaturePacket[2], 1);
  const hashedLength = signaturePacket.readUInt16BE(4);
  const unhashedAt = 6 + hashedLength;
  const unhashedLength = signaturePacket.readUInt16BE(unhashedAt);
  const mpiAt = unhashedAt + 2 + unhashedLength + 2;
  const signature = readMPI(signaturePacket, mpiAt);
  assert.equal(signature.next, signaturePacket.length);
  return signature.value;
}

const packets = readPackets(unarmor(armored));
assert.deepEqual(packets.map(packet => packet.tag), [6, 13, 2, 14, 2]);
const publicKey = packets[0].body;
assert.equal(publicKey[0], 4);
assert.equal(publicKey[5], 1);
const modulus = readMPI(publicKey, 6);
const publicExponent = readMPI(publicKey, modulus.next);
assert.equal(modulus.bits, 4096);
assert.equal(publicExponent.value, 65537n);
const fingerprintFraming = Buffer.alloc(3);
fingerprintFraming[0] = 0x99;
fingerprintFraming.writeUInt16BE(publicKey.length, 1);
const fingerprint = createHash('sha1')
  .update(fingerprintFraming).update(publicKey).digest('hex');
assert.equal(fingerprint, '6d854cd7933322a601c3286d181f01e57a35090f');

// Independent historical positive: a genuine certification issued by
// the same Cicada RSA private key, embedded in this already-signed key block.
const control = em512(modPow(signatureMPI(packets[2].body),
  publicExponent.value, modulus.value));
const controlPayload = signatureDigestInfo(control);
assert.ok(controlPayload, 'genuine Cicada key self-signature must pass');
assert.ok(controlPayload.subarray(0, 15).equals(Buffer.from(
  '3021300906052b0e03021a05000414', 'hex')), 'signed SHA1 DigestInfo');
assert.equal(controlPayload.length, 35);

const rows = grid.pages.flatMap(page => page.tokens);
assert.equal(rows.length, 256);
assert.ok(rows.every(token => /^[0-9A-Za-x]{2}$/.test(token)));
const table = Array.from({ length: 32 }, (_, row) => rows.slice(row * 8, row * 8 + 8));
assert.ok(table.every(row => row.length === 8));
const layouts = [
  ['printed-characters', rows.join('')],
  ['backward-characters', rows.join('').split('').reverse().join('')],
  ['reverse-token-order', rows.slice().reverse().join('')],
  ['swap-within-token', rows.map(token => token[1] + token[0]).join('')],
  ['column-major', Array.from({length:8}, (_,c) => table.map(row => row[c])).flat().join('')],
  ['alternating-row-order', table.flatMap((row,i) => i%2 ? row.slice().reverse() : row).join('')]
];
const findings = [];
for (const [layout, glyphs] of layouts) {
  assert.equal(glyphs.length, 512);
  const signatureBytes = Buffer.from(glyphs, 'ascii');
  assert.ok(signatureBytes.every(value => value < 128));
  const signatureInteger = asInt(signatureBytes);
  assert.ok(signatureInteger < modulus.value);
  const recovered = em512(modPow(signatureInteger, publicExponent.value, modulus.value));
  const digestInfo = signatureDigestInfo(recovered);
  findings.push({ layout, recoveredFirst16: recovered.subarray(0, 16).toString('hex'),
    acceptedPkcs1: digestInfo !== null });
}
assert.equal(findings[0].recoveredFirst16,
  '5a6427970c7a23ba87d632da6ce6e682');
assert.equal(findings[1].recoveredFirst16,
  '12e44aad1d1aaaeae5c32fb697927ad7');
assert.ok(findings.every(finding => !finding.acceptedPkcs1));
console.log(JSON.stringify({
  source: 'original LP2 pp49-51 256 printed two-character tokens',
  authenticCicadaFingerprint: fingerprint,
  rsaBits: modulus.bits,
  exponent: publicExponent.value.toString(),
  actualHistoricalPositive: { selfCertificationPkcs1: true,
    sha1DigestInfo: controlPayload.toString('hex') },
  findings, conclusion: 'No tested ASCII-512 source layout is a signed Cicada PGP RSA block.'
}, null, 2));
