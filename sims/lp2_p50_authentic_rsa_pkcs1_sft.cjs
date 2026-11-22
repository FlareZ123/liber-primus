'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const armor = fs.readFileSync(
  path.join(root, 'resources', 'cicada-3301-authentic-public-key.asc'),
  'utf8'
);
const grid = require('../resources/liber-primus/lp2-grid-256.json');

function dearmor(text) {
  return Buffer.from(
    text.split(/\r?\n/u)
      .filter((line) =>
        line &&
        !line.startsWith('-----') &&
        !line.startsWith('='))
      .join(''),
    'base64'
  );
}

function readPacket(buffer, start) {
  let offset = start;
  const first = buffer[offset++];
  assert.ok(first & 0x80);
  let tag;
  let length;

  if (first & 0x40) {
    tag = first & 0x3f;
    const b = buffer[offset++];
    if (b < 192) {
      length = b;
    } else if (b < 224) {
      length = ((b - 192) << 8) + buffer[offset++] + 192;
    } else if (b === 255) {
      length = buffer.readUInt32BE(offset);
      offset += 4;
    } else {
      throw new Error('partial packet lengths are not expected');
    }
  } else {
    tag = (first >> 2) & 0x0f;
    const type = first & 3;
    if (type === 0) {
      length = buffer[offset++];
    } else if (type === 1) {
      length = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (type === 2) {
      length = buffer.readUInt32BE(offset);
      offset += 4;
    } else {
      length = buffer.length - offset;
    }
  }

  return {
    tag,
    body: buffer.subarray(offset, offset + length),
    next: offset + length
  };
}

function bytesToBigInt(buffer) {
  let value = 0n;
  for (const byte of buffer) value = (value << 8n) | BigInt(byte);
  return value;
}

function parseRSA(body) {
  let offset = 0;
  assert.equal(body[offset++], 4);
  offset += 4;
  assert.equal(body[offset++], 1);

  const modulusBits = body.readUInt16BE(offset);
  offset += 2;
  const modulusBytes = Math.ceil(modulusBits / 8);
  const modulus = bytesToBigInt(
    body.subarray(offset, offset + modulusBytes)
  );
  offset += modulusBytes;

  const exponentBits = body.readUInt16BE(offset);
  offset += 2;
  const exponentBytes = Math.ceil(exponentBits / 8);
  const exponent = bytesToBigInt(
    body.subarray(offset, offset + exponentBytes)
  );

  return { modulusBits, modulus, exponent };
}

function fingerprintV4(body) {
  const header = Buffer.from([0x99, body.length >> 8, body.length & 255]);
  return crypto.createHash('sha1')
    .update(header)
    .update(body)
    .digest('hex')
    .toUpperCase();
}

function modPow(base, exponent, modulus) {
  let out = 1n;
  let b = base % modulus;
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1n;
  }
  return out;
}

function toFixedBytes(value, length) {
  const out = Buffer.alloc(length);
  let x = value;
  for (let index = length - 1; index >= 0; index--) {
    out[index] = Number(x & 255n);
    x >>= 8n;
  }
  assert.equal(x, 0n);
  return out;
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
}

function isPkcs1v15SignatureBlock(encoded) {
  if (encoded[0] !== 0 || encoded[1] !== 1) return false;
  let index = 2;
  while (index < encoded.length && encoded[index] === 0xff) index++;
  if (index < 10 || index >= encoded.length || encoded[index] !== 0) {
    return false;
  }
  return true;
}

const decoded = dearmor(armor);
const publicKeys = [];
let offset = 0;
while (offset < decoded.length) {
  const packet = readPacket(decoded, offset);
  if (packet.tag === 6 || packet.tag === 14) {
    publicKeys.push({
      tag: packet.tag,
      body: packet.body,
      ...parseRSA(packet.body)
    });
  }
  offset = packet.next;
}

assert.equal(publicKeys.length, 2);
assert.equal(publicKeys[0].tag, 6);
assert.equal(publicKeys[1].tag, 14);
assert.equal(
  fingerprintV4(publicKeys[0].body),
  '6D854CD7933322A601C3286D181F01E57A35090F'
);

const payload = Buffer.from(grid.bytes);
assert.equal(payload.length, 256);
const payloadInteger = bytesToBigInt(payload);
const transformed = publicKeys.map((key) => {
  assert.equal(key.modulusBits, 4096);
  assert.equal(key.exponent, 65537n);
  assert.ok(payloadInteger < key.modulus);
  assert.equal(gcd(payloadInteger, key.modulus), 1n);

  const encoded = toFixedBytes(
    modPow(payloadInteger, key.exponent, key.modulus),
    key.modulusBits / 8
  );
  return {
    tag: key.tag,
    modulusBits: key.modulusBits,
    exponent: key.exponent.toString(),
    headHex: encoded.subarray(0, 32).toString('hex'),
    pkcs1v15Signature: isPkcs1v15SignatureBlock(encoded)
  };
});

assert.deepEqual(
  transformed.map((item) => item.headHex),
  [
    '38f13391b19e450a017f901a10c80937b214f0d4aa60bbf6d2a05c537c044673',
    '311f728a92cf99c07fcf84504e5603aeb8c6e28237de4e5d5d9b8101a032e6bf'
  ]
);
assert.ok(transformed.every((item) => !item.pkcs1v15Signature));

console.log(JSON.stringify({
  fingerprint:
    '6D854CD7933322A601C3286D181F01E57A35090F',
  payloadBytes: payload.length,
  rsaPackets: transformed,
  decision:
    'negative: canonical p50 payload is not a raw PKCS#1 v1.5 signature under either authentic Cicada RSA-4096 public key packet'
}, null, 2));
