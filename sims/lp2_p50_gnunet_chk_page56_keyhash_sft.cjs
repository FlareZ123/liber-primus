'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const gridPath = path.resolve(__dirname, '../resources/liber-primus/base60-grid.json');
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const alphabet = grid.alphabet;
const tokens = grid.rows.flat();
const canonical = Buffer.from(grid.byte_rows.flat());
const target = Buffer.from(
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4',
  'hex'
);

assert.equal(canonical.length, 256, 'p50 table must contain 256 bytes');
assert.equal(target.length, 64, 'p56 target must be a 512-bit digest');
assert.equal(tokens.length, 256);

const ambiguities = [];
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  if (!/[Il]/.test(token)) continue;
  const altToken = [...token].map(ch => ch === 'I' ? 'l' : ch === 'l' ? 'I' : ch).join('');
  const altValue = alphabet.indexOf(altToken[0]) * 60 + alphabet.indexOf(altToken[1]);
  assert.notEqual(altValue, canonical[i]);
  ambiguities.push({ index: i, altValue, token, altToken });
}
assert.equal(ambiguities.length, 10, 'expected the ten I/l-ambiguous table cells');

function sha512(data) {
  return crypto.createHash('sha512').update(data).digest();
}

function cryptCfb128(data, hash64, decrypt) {
  assert.equal(hash64.length, 64);
  const key = hash64.subarray(0, 32);
  const iv = hash64.subarray(32, 48);
  const cipher = decrypt
    ? crypto.createDecipheriv('aes-256-cfb', key, iv)
    : crypto.createCipheriv('aes-256-cfb', key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data), cipher.final()]);
}

// Positive control: verifies the SHA-512-derived AES-256-CFB128 key/IV layout.
const probe = Buffer.concat([Buffer.from('GNUnet-CHK-positive-control\0'), Buffer.from(Array.from({ length: 32 }, (_, i) => i))]);
const probeKeyhash = sha512(probe);
const probeCiphertext = cryptCfb128(probe, probeKeyhash, false);
assert.deepEqual(cryptCfb128(probeCiphertext, probeKeyhash, true), probe);
assert.deepEqual(sha512(cryptCfb128(probeCiphertext, probeKeyhash, true)), probeKeyhash);

const keyhashHits = [];
const queryhashHits = [];
for (let mask = 0; mask < (1 << ambiguities.length); mask++) {
  const block = Buffer.from(canonical);
  for (let bit = 0; bit < ambiguities.length; bit++) {
    if ((mask & (1 << bit)) !== 0) {
      const cell = ambiguities[bit];
      block[cell.index] = cell.altValue;
    }
  }

  // Orientation A: p50 is the encrypted block; p56 is its plaintext KEYHASH.
  const plaintext = cryptCfb128(block, target, true);
  if (sha512(plaintext).equals(target)) {
    keyhashHits.push({ mask, plaintextHex: plaintext.toString('hex') });
  }

  // Orientation B: p50 is the plaintext block; p56 is its encrypted QUERYHASH.
  const keyhash = sha512(block);
  const ciphertext = cryptCfb128(block, keyhash, false);
  if (sha512(ciphertext).equals(target)) {
    queryhashHits.push({ mask, keyhash: keyhash.toString('hex') });
  }
}

const canonicalKeyhash = sha512(canonical);
const canonicalQueryhash = sha512(cryptCfb128(canonical, canonicalKeyhash, false));
const result = {
  p50Bytes: canonical.length,
  p56HashBytes: target.length,
  ambiguousCells: ambiguities.length,
  readingsTested: 1 << ambiguities.length,
  keyhashOrientationHits: keyhashHits,
  queryhashOrientationHits: queryhashHits,
  canonicalP50Sha512: canonicalKeyhash.toString('hex'),
  canonicalP50AsPlaintextQueryhash: canonicalQueryhash.toString('hex')
};

assert.equal(keyhashHits.length, 0);
assert.equal(queryhashHits.length, 0);
console.log(JSON.stringify(result, null, 2));
