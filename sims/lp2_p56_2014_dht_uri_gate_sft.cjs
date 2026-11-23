'use strict';

/**
 * A source-format gate for the literal 512-bit LP2 p56 target.
 * Read-only SFT: node sims/lp2_p56_2014_dht_uri_gate_sft.cjs
 *
 * Source-fixed protocol controls:
 * GNUnet 0.10.1 (2014-04-08):
 *   src/fs/fs_uri.c, src/util/strings.c, src/include/gnunet_crypto_lib.h
 *   commit 4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2
 * Freenet fred (2014-12-23):
 *   src/freenet/keys/ClientCHK.java, FreenetURI.java, Base64.java
 *   commit e9deac5502dc447f4ac00e6c5cd0d4474622feaf
 */
const assert = require('node:assert/strict');

const HEX = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const HISTORICAL_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
const CURRENT_CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const GNUNET_PREFIX = 'gnunet://fs/chk/';

// An original GNUnet v0.10.1 test_fs_uri.c positive parse fixture.
const GNUNET_CHK_FIXTURE = 'gnunet://fs/chk/C282GG70GKK41O4551011DO413KFBVTVMQG1OG30I0K4045N0G41HAPB82G680A02JRVVFO8URVRU2F159011DO41000000022RG820.RNVVVVOOLCLK065B5D04HTNVNSIB2AI022RG8200HSLK1CO1000ATQ98824DMA2032LIMG50CG0K057NVUVG200000H000004400000.42';

/**
 * 2014 GNUnet binary-to-text: append zero bits at the right, then encode
 * 5-bit groups most-significant first, using Base32hex.
 * @param {Buffer} bytes
 * @param {string} alphabet
 * @returns {string}
 */
function base32(bytes, alphabet = HISTORICAL_ALPHABET) {
  let bits = 0;
  let accumulator = 0;
  let result = '';
  for (const b of bytes) {
    accumulator = (accumulator << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(accumulator >>> bits) & 31];
      accumulator &= (1 << bits) - 1;
    }
  }
  if (bits > 0) result += alphabet[(accumulator << (5 - bits)) & 31];
  return result;
}

/**
 * Strict original-GNUnet Base32hex round-trip.
 * @param {string} encoded
 * @param {number} byteLength
 * @returns {Buffer}
 */
function decodeBase32Hex(encoded, byteLength) {
  let bits = 0;
  let accumulator = 0;
  const result = [];
  for (const ch of encoded) {
    const value = HISTORICAL_ALPHABET.indexOf(ch);
    assert(value >= 0, 'Not valid 2014 GNUnet Base32hex');
    accumulator = (accumulator << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      result.push((accumulator >>> bits) & 255);
      accumulator &= (1 << bits) - 1;
    }
  }
  assert.equal(result.length, byteLength, 'Unexpected decoded byte count');
  assert.equal(accumulator, 0, 'Nonzero pad bits');
  return Buffer.from(result);
}

/**
 * Reflects the 2014 GNUnet fs_uri.c CHK field requirements.
 * This format check is not a network retrieval or proof of file existence.
 * @param {string} uri
 * @returns {boolean}
 */
function isComplete2014GnunetChk(uri) {
  if (!uri.startsWith(GNUNET_PREFIX)) return false;
  const parts = uri.slice(GNUNET_PREFIX.length).split('.');
  return parts.length === 3 &&
    parts[0].length === 103 && parts[1].length === 103 &&
    parts[0].split('').every(ch => HISTORICAL_ALPHABET.includes(ch)) &&
    parts[1].split('').every(ch => HISTORICAL_ALPHABET.includes(ch)) &&
    /^\d+$/.test(parts[2]) &&
    decodeBase32Hex(parts[0], 64).length === 64 &&
    decodeBase32Hex(parts[1], 64).length === 64;
}

/**
 * Freenet's 2014 URL-safe Base64 uses '~' and '-' rather than '+' and '/'.
 * @param {Buffer} bytes
 * @returns {string}
 */
function freenetBase64(bytes) {
  return bytes.toString('base64').replace(/\+/g, '~').replace(/\//g, '-').replace(/=+$/g, '');
}

function main() {
  assert.match(HEX, /^[0-9a-f]{128}$/);
  const bytes = Buffer.from(HEX, 'hex');
  assert.equal(bytes.length, 64);
  const historical = base32(bytes);
  const modern = base32(bytes, CURRENT_CROCKFORD_ALPHABET);
  assert.equal(historical.length, 103);
  assert.notEqual(historical, modern, 'Modern GNUnet must not silently replace the 2014 format');
  assert.equal(decodeBase32Hex(historical, 64).toString('hex'), HEX);

  // The 2014 GNUnet source fixture has two separately encoded 512-bit values and an explicit size.
  assert(isComplete2014GnunetChk(GNUNET_CHK_FIXTURE));
  assert(!isComplete2014GnunetChk(GNUNET_PREFIX + historical));
  assert(!isComplete2014GnunetChk(GNUNET_PREFIX + historical + '.42'));
  assert(!isComplete2014GnunetChk(GNUNET_PREFIX + historical + '.' + historical));
  // A contrived second hash and file size is syntactically valid, but has no source authorization.
  assert(isComplete2014GnunetChk(GNUNET_PREFIX + historical + '.' + historical + '.42'));

  // Freenet 2014 ClientCHK requires a 32-byte routing key, 32-byte
  // encryption key and a further >=5-byte typed 'extra' field.
  const routing = bytes.subarray(0, 32);
  const crypto = bytes.subarray(32, 64);
  assert.equal(routing.length, 32);
  assert.equal(crypto.length, 32);
  const routing64 = freenetBase64(routing);
  const crypto64 = freenetBase64(crypto);
  assert.equal(routing64.length, 43);
  assert.equal(crypto64.length, 43);

  console.log('LP2 p56: 128 hex characters, 64 binary bytes, 512 bits.');
  console.log('GNUnet 2014 base32hex (103 chars):', historical);
  console.log('GNUnet newer Crockford alternative (not historically selected):', modern);
  console.log('GNUnet CHK requires HASH1.HASH2.SIZE; source only supplies at most one hash.');
  console.log('Freenet 2014 optional 32+32 byte split:');
  console.log('  CHK@' + routing64 + ',' + crypto64 + ',<5-byte-extra-required>');
  console.log('Freenet 2014 CHK requires a third 5-byte typed extra field absent from p56.');
  console.log('GNUnet historical fixture: PASS. Conversion/round trips: PASS.');
  console.log('No complete authenticated URI, object retrieval, or plaintext established.');
  console.log('SFT PASS');
}

main();
