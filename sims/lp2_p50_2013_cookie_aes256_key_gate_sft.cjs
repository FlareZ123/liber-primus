#!/usr/bin/env node
'use strict';

// Test the two community-reported 2013 onion cookies as direct AES-256
// material for the original LP2 256-byte pp49-51 table. No KDF or key search.
// Run from repository root:
//   node sims/lp2_p50_2013_cookie_aes256_key_gate_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const COOKIES = {
  '167': Buffer.from('6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6', 'hex'),
  '761': Buffer.from('7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5', 'hex')
};
for (const value of Object.values(COOKIES)) assert.equal(value.length, 32);

function aesDecrypt(data, key, mode, iv = null) {
  const decipher = crypto.createDecipheriv('aes-256-' + mode, key, iv);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}
function aesEncrypt(data, key, mode, iv = null) {
  const cipher = crypto.createCipheriv('aes-256-' + mode, key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data), cipher.final()]);
}

// FIPS-197 AES-256 ECB known-answer test.
const fipsKey = Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex');
const fipsPlain = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
const fipsCipher = Buffer.from('8ea2b7ca516745bfeafc49904b496089', 'hex');
assert.deepEqual(aesEncrypt(fipsPlain, fipsKey, 'ecb'), fipsCipher);
assert.deepEqual(aesDecrypt(fipsCipher, fipsKey, 'ecb'), fipsPlain);

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
function decode(tokens, alphabet, radix) {
  return Buffer.from(tokens.map(token => {
    const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
    assert.ok(a >= 0 && b >= 0);
    const value = radix * a + b;
    assert.ok(value >= 0 && value <= 255);
    return value;
  }));
}
const byteStreams = [
  { name: 'base60', data: decode(tokens, alphabet60, 60),
    sha256: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290' },
  { name: 'base59-no-lowercase-f', data: decode(tokens, alphabet59, 59),
    sha256: '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79' }
];
for (const stream of byteStreams) {
  assert.equal(stream.data.length, 256);
  assert.equal(crypto.createHash('sha256').update(stream.data).digest('hex'), stream.sha256);
}
assert.deepEqual(byteStreams[0].data, Buffer.from(grid.bytes));

const signatures = {
  PNG: '89504e470d0a1a0a', PDF: '255044462d', ZIP: '504b0304',
  GZIP: '1f8b08', ELF: '7f454c46', GIF: '47494638',
  RIFF: '52494646', SQLite: '53514c697465', HTML: '3c68746d6c',
  XML: '3c3f786d6c', JPEG: 'ffd8ff'
};
function summarize(output) {
  const printable = [...output].filter(b => b >= 32 && b <= 126).length;
  const matchedMagic = Object.entries(signatures)
    .filter(([, hex]) => output.subarray(0, Buffer.from(hex, 'hex').length)
      .equals(Buffer.from(hex, 'hex')))
    .map(([name]) => name);
  return {
    printable,
    printableRatio: Number((printable / output.length).toFixed(4)),
    uniqueBytes: new Set(output).size,
    prefixHex: output.subarray(0, 32).toString('hex'),
    asciiPreview: [...output].map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join(''),
    matchedMagic
  };
}

const zeroIv = Buffer.alloc(16, 0);
const results = [];

// Direct 256-bit cookie as AES key; standard zero-IV ECB/CBC/CTR baselines.
for (const stream of byteStreams) {
  for (const [cookieName, key] of Object.entries(COOKIES)) {
    for (const mode of ['ecb', 'cbc', 'ctr']) {
      const iv = mode === 'ecb' ? null : zeroIv;
      const output = aesDecrypt(stream.data, key, mode, iv);
      assert.deepEqual(aesEncrypt(output, key, mode, iv), stream.data);
      results.push({
        interpretation: 'cookie-is-key-zero-iv',
        codec: stream.name, keyCookie: cookieName, mode,
        ...summarize(output)
      });
    }
  }
}

// Two-cookie interpretation: one 32-byte cookie is the AES key, and the
// other contributes a 16-byte IV/nonce. Only its literal first/last halves
// are tested; no hashing, truncation search, or fitted counter is used.
for (const stream of byteStreams) {
  for (const [keyName, key] of Object.entries(COOKIES)) {
    const otherName = keyName === '167' ? '761' : '167';
    const other = COOKIES[otherName];
    for (const [ivPart, iv] of [
      ['other-first16', other.subarray(0, 16)],
      ['other-last16', other.subarray(16, 32)]
    ]) {
      for (const mode of ['cbc', 'ctr']) {
        const output = aesDecrypt(stream.data, key, mode, iv);
        assert.deepEqual(aesEncrypt(output, key, mode, iv), stream.data);
        results.push({
          interpretation: 'one-cookie-key-other-cookie-iv',
          codec: stream.name, keyCookie: keyName, ivCookie: otherName,
          ivPart, mode, ...summarize(output)
        });
      }
    }
  }
}

console.log(JSON.stringify({
  source: {
    cookieOrigin: 'community-reported 2013 p7amjopgric7dfdi.onion cookies; not an authenticated Cicada key instruction',
    cookies: Object.fromEntries(Object.entries(COOKIES).map(([k, v]) => [k, v.toString('hex')])),
    tableTokens: tokens.length,
    base60Sha256: byteStreams[0].sha256,
    base59Sha256: byteStreams[1].sha256
  },
  fips197Aes256EcbKnownAnswer: true,
  testedCandidates: results.length,
  results
}, null, 2));
