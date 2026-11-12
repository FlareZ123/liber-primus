'use strict';
/**
 * Source-frozen Cicada OpenPGP RSA-4096 signature gate for two printed
 * 256-symbol objects: LP2's 32x8 table and physical pp55-57 rune stream.
 *
 * Run: node sims/lp2_grid_terminal_rsa4096_signature_sft.cjs
 * Node.js 22 built-ins only; no external network or package dependency.
 *
 * Conditional hypothesis: each GP29 rune is stored as its zero-based
 * one-byte index, then the two source-ordered halves form a 512-byte
 * signature under Cicada's published primary or subkey. Exactly two
 * concatenation orders are tested, with no key guessing or permutations.
 *
 * Negative results concern only these literal byte serializations.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');

/** @param {string} file @returns {any} */
function sourceJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

/**
 * @param {Buffer} packet
 * @param {number} at
 * @returns {{bits: number, value: bigint, next: number}}
 */
function mpi(packet, at) {
  const bits = packet.readUInt16BE(at);
  const size = Math.ceil(bits / 8);
  const bytes = packet.subarray(at + 2, at + 2 + size);
  assert.equal(bytes.length, size);
  return { bits, value: BigInt('0x' + bytes.toString('hex')), next: at + 2 + size };
}

/**
 * @param {Buffer} input
 * @returns {{tag: number, data: Buffer}[]}
 */
function openPgpPackets(input) {
  const packets = [];
  for (let offset = 0; offset < input.length;) {
    const first = input[offset];
    assert(first & 0x80, 'Expected OpenPGP packet header');
    const newer = !!(first & 0x40);
    const tag = newer ? first & 63 : (first >>> 2) & 15;
    const form = first & 3;
    let head, count;
    if (newer) {
      const length0 = input[offset + 1];
      if (length0 < 192) {
        head = 2;
        count = length0;
      } else if (length0 < 224) {
        head = 3;
        count = ((length0 - 192) << 8) + input[offset + 2] + 192;
      } else if (length0 === 255) {
        head = 6;
        count = input.readUInt32BE(offset + 2);
      } else {
        throw new Error('Unsupported partial-length OpenPGP packet');
      }
    } else if (form === 0) {
      head = 2;
      count = input[offset + 1];
    } else if (form === 1) {
      head = 3;
      count = input.readUInt16BE(offset + 1);
    } else if (form === 2) {
      head = 5;
      count = input.readUInt32BE(offset + 1);
    } else {
      throw new Error('Unsupported indeterminate OpenPGP packet');
    }
    const data = input.subarray(offset + head, offset + head + count);
    assert.equal(data.length, count);
    packets.push({ tag, data });
    offset += head + count;
  }
  return packets;
}

/**
 * @param {string} armor
 * @returns {{name: string, bits: number, n: bigint, e: bigint}[]}
 */
function rsaKeys(armor) {
  const payload = armor.split(/\r?\n/)
    .filter(line => line && !line.startsWith('-') && !line.startsWith('='))
    .join('');
  const packets = openPgpPackets(Buffer.from(payload, 'base64'));
  return packets.filter(packet => packet.tag === 6 || packet.tag === 14)
    .map(packet => {
      const data = packet.data;
      assert.equal(data[0], 4, 'Expected OpenPGP v4 public key');
      assert.equal(data[5], 1, 'Expected RSA key algorithm');
      const n = mpi(data, 6);
      const e = mpi(data, n.next);
      return {
        name: packet.tag === 6 ? 'primary' : 'subkey',
        bits: n.bits,
        n: n.value,
        e: e.value
      };
    });
}

/** @param {bigint} value @param {bigint} exponent @param {bigint} modulus */
function modPow(value, exponent, modulus) {
  let result = 1n;
  for (value %= modulus; exponent > 0n; exponent >>= 1n, value = value * value % modulus) {
    if (exponent & 1n) result = result * value % modulus;
  }
  return result;
}

/** @param {Buffer} bytes */
function bigInteger(bytes) {
  return BigInt('0x' + bytes.toString('hex'));
}

/**
 * Strict RFC 8017 RSASSA-PKCS1-v1_5 encoded-message prefix gate.
 * @param {Buffer} encoded
 * @returns {boolean}
 */
function hasRsaSignaturePadding(encoded) {
  if (encoded[0] !== 0 || encoded[1] !== 1) return false;
  let i = 2;
  while (i < encoded.length && encoded[i] === 255) i++;
  return i >= 10 && i < encoded.length && encoded[i] === 0;
}

/**
 * @param {bigint} input
 * @param {{n: bigint, e: bigint, bits: number}} publicKey
 * @returns {Buffer}
 */
function rsaPublicDecode(input, publicKey) {
  const bytes = publicKey.bits / 8;
  assert(Number.isInteger(bytes));
  const decoded = modPow(input, publicKey.e, publicKey.n);
  return Buffer.from(decoded.toString(16).padStart(bytes * 2, '0'), 'hex');
}

// Self-test the independent RSA public exponent path with an ordinary
// Node-generated PKCS1-v1_5 signature before testing original source.
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 1024 });
const jwk = publicKey.export({ format: 'jwk' });
const fromB64Url = value => BigInt('0x' + Buffer.from(value, 'base64url').toString('hex'));
const testKey = {
  n: fromB64Url(jwk.n),
  e: fromB64Url(jwk.e),
  bits: 1024
};
const message = Buffer.from('GP29-RSA test plant', 'ascii');
const signed = crypto.sign('sha256', message, privateKey);
const decodedPlant = rsaPublicDecode(bigInteger(signed), testKey);
assert(hasRsaSignaturePadding(decodedPlant));
assert(crypto.verify('sha256', message, publicKey, signed));

const grid = sourceJson('resources/liber-primus/lp2-grid-256.json').bytes;
const corpus = sourceJson('resources/liber-primus/lp2-corpus.json');
const terminal = corpus.pages.slice(55, 58).flatMap(page => page.indices);
assert.deepEqual(corpus.pages.slice(55, 58).map(page => page.indices.length), [76, 85, 95]);
assert.equal(grid.length, 256);
assert.equal(terminal.length, 256);
assert(grid.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
assert(terminal.every(v => Number.isInteger(v) && v >= 0 && v < 29));

const keyText = fs.readFileSync(
  path.join(ROOT, 'resources/external/cicada3301-rsa-public-4096.asc'), 'utf8');
const keys = rsaKeys(keyText);
assert.deepEqual(keys.map(key => [key.name, key.bits, String(key.e)]),
  [['primary', 4096, '65537'], ['subkey', 4096, '65537']]);

const expectedPrefixes = new Map([
  ['grid+terminal:primary', '5d9bf7d2059764e6c6dadd99f2aaafda'],
  ['grid+terminal:subkey', '554e71a0626e5cf2db98a8c666139f93'],
  ['terminal+grid:primary', '9c9f235b81601adfdde1284876d9bf35'],
  ['terminal+grid:subkey', '70740b5b7374e080ab3df16f0640212']
]);

const results = [];
for (const [order, bytes] of [
  ['grid+terminal', Buffer.from(grid.concat(terminal))],
  ['terminal+grid', Buffer.from(terminal.concat(grid))]
]) {
  assert.equal(bytes.length, 512);
  const raw = bigInteger(bytes);
  for (const key of keys) {
    const decoded = rsaPublicDecode(raw, key);
    const name = order + ':' + key.name;
    assert.equal(decoded.subarray(0, 16).toString('hex'), expectedPrefixes.get(name));
    const validPadding = hasRsaSignaturePadding(decoded);
    assert.equal(validPadding, false, 'Unexpected valid authentic-source RSA padding');
    results.push({
      order,
      key: key.name,
      inputBytes: bytes.length,
      inputInRsaRange: raw < key.n,
      decodedPrefixHex: decoded.subarray(0, 16).toString('hex'),
      validPkcs1v15SignaturePadding: validPadding
    });
  }
}
console.log(JSON.stringify({ rsaPlantPassed: true, sourceResults: results }, null, 2));
