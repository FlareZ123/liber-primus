'use strict';
/** Exact original LP2 p49–51 RSA-4096 factor gate. Windows 11 Node 22 CJS SFT. */
const ARMOR = "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n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\n=Dq+3\n-----END PGP PUBLIC KEY BLOCK-----\n";

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/** @param {Buffer} bytes @returns {bigint} */
function toBigInt(bytes) {
  let n = 0n;
  for (const byte of bytes) n = (n << 8n) + BigInt(byte);
  return n;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {Buffer} bytes @returns {{tag:number, body:Buffer}[]} */
function decodePackets(bytes) {
  const packets = [];
  let offset = 0;
  while (offset < bytes.length) {
    const first = bytes[offset++];
    assert.ok((first & 128) !== 0, 'OpenPGP packet header');
    let tag;
    let length;
    if ((first & 64) !== 0) {
      tag = first & 63;
      const firstLen = bytes[offset++];
      if (firstLen < 192) length = firstLen;
      else if (firstLen < 224) length = ((firstLen - 192) << 8) + bytes[offset++] + 192;
      else if (firstLen === 255) {
        length = bytes.readUInt32BE(offset);
        offset += 4;
      } else throw Error('Unsupported partial-length packet');
    } else {
      tag = (first >>> 2) & 15;
      const kind = first & 3;
      if (kind === 0) length = bytes[offset++];
      else if (kind === 1) { length = bytes.readUInt16BE(offset); offset += 2; }
      else if (kind === 2) { length = bytes.readUInt32BE(offset); offset += 4; }
      else throw Error('Unsupported indeterminate packet length');
    }
    assert.ok(offset + length <= bytes.length, 'OpenPGP packet payload bounds');
    packets.push({tag, body: bytes.subarray(offset, offset + length)});
    offset += length;
  }
  return packets;
}

/** @param {Buffer} body @returns {{bits:number, modulus:bigint, exponent:bigint}} */
function readRsaKey(body) {
  assert.equal(body[0], 4);
  assert.equal(body[5], 1);
  let offset = 6;
  const fields = [];
  for (let k = 0; k < 2; k++) {
    const bits = body.readUInt16BE(offset);
    offset += 2;
    const count = Math.ceil(bits / 8);
    const value = toBigInt(body.subarray(offset, offset + count));
    offset += count;
    fields.push({bits, value});
  }
  return {bits: fields[0].bits, modulus: fields[0].value, exponent: fields[1].value};
}
const b64 = ARMOR.split(/\r?\n/).filter(line =>
  line.length > 0 && !line.startsWith('-') && !line.startsWith('=')).join('');
const packets = decodePackets(Buffer.from(b64, 'base64'));
const primary = packets.find(packet => packet.tag === 6);
assert.ok(primary);
const fingerprintInput = Buffer.concat([
  Buffer.from([0x99, primary.body.length >>> 8, primary.body.length & 255]),
  primary.body
]);
assert.equal(
  crypto.createHash('sha1').update(fingerprintInput).digest('hex'),
  '6d854cd7933322a601c3286d181f01e57a35090f',
  'authenticated historical Cicada 3301 primary RSA key fingerprint'
);
const keys = packets.filter(packet => packet.tag === 6 || packet.tag === 14)
  .map(packet => ({tag: packet.tag, ...readRsaKey(packet.body)}));
assert.deepEqual(keys.map(key => key.tag), [6, 14]);
for (const key of keys) {
  assert.equal(key.bits, 4096);
  assert.equal(key.exponent, 65537n);
}
const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-grid-256.json'), 'utf8'
));
const alphabet = grid.alphabet;
const tokens = grid.pages.flatMap(page => page.tokens);
const canonical = grid.pages.flatMap(page => page.bytes);
assert.equal(canonical.length, 256);
assert.equal(tokens.length, 256);
assert.deepEqual(canonical, tokens.map(token =>
  60 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1])
));
const ambiguous = tokens.flatMap((token, index) =>
  token.endsWith('I') || token.endsWith('l') ? [index] : []);
assert.deepEqual(ambiguous, [2, 25, 45, 50, 90, 165, 175, 182, 199, 246]);

/** @param {number[]} b @param {number} orientation @returns {bigint} */
function panelInteger(b, orientation) {
  const reordered = [];
  for (let index = 0; index < 256; index++) {
    const z = orientation === 0 ? index
      : orientation === 1 ? 255 - index
      : orientation === 2 ? (index % 32) * 8 + Math.floor(index / 32)
      : ((255 - index) % 32) * 8 + Math.floor((255 - index) / 32);
    reordered.push(b[z]);
  }
  return toBigInt(reordered);
}
const controlP = 32416190071n, controlQ = 32416187567n;
assert.equal(gcd(controlP * controlQ, controlP), controlP);
assert.equal(gcd(controlP * controlQ, controlQ), controlQ);
let cases = 0;
let nontrivial = 0;
for (let mask = 0; mask < 1 << ambiguous.length; mask++) {
  const data = canonical.slice();
  for (let b = 0; b < ambiguous.length; b++) {
    if ((mask & (1 << b)) !== 0) {
      const index = ambiguous[b];
      const token = tokens[index];
      const flip = token[1] === 'I' ? 'l' : 'I';
      data[index] = 60 * alphabet.indexOf(token[0]) + alphabet.indexOf(flip);
    }
  }
  for (let order = 0; order < 4; order++) {
    const candidate = panelInteger(data, order);
    for (const key of keys) {
      const d = gcd(candidate, key.modulus);
      cases++;
      if (d > 1n) nontrivial++;
      assert.equal(d, 1n,
        'unexpected source-panel factor mask=' + mask + ', order=' + order + ', key=' + key.tag);
    }
  }
}
assert.equal(cases, 8192);
assert.equal(nontrivial, 0);
console.log('PASS authentic PGP key fingerprint; RSA primary + encryption subkey 4096/65537');
console.log('PASS original 256 base60 bytes; 10 I/l alternatives across full 1024 masks');
console.log('PASS four source-natural row/column orientations (including reversal)');
console.log('PASS 8192/8192 original RSA factor GCD=1; planted composite controls reveal both factors');
console.log('No actual new unknown LP2 plaintext or private RSA factor is recovered.');
