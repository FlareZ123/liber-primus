'use strict';

/**
 * SFT: original p50 numeric table as 32 DES ciphertext blocks, using the
 * first-party eight-character DIVINITY key from the solved PARABLE page.
 *
 * Run: node sims/lp2_p50_divinity_des_ciphertext_sft.cjs
 * Node.js 22+, Windows-compatible, no third-party dependencies.
 *
 * The original table's 32 x 8 byte geometry is exactly a DES block layout.
 * Hypothesis only: the manuscript never explicitly names DES or a mode.
 */
const assert = require('node:assert/strict');
const { createDecipheriv, createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

/**
 * One-key DES using equivalent 3DES EDE with K1=K2=K3, since Node's
 * OpenSSL 3 may disable the deprecated single-DES algorithm name.
 * @param {Buffer} data multiple of 8 bytes
 * @param {Buffer} key 8-byte DES key
 * @param {'ECB'|'CBC'} mode
 * @returns {Buffer}
 */
function decryptDes(data, key, mode) {
  assert.equal(data.length % 8, 0);
  assert.equal(key.length, 8);
  const key24 = Buffer.concat([key, key, key]);
  const iv = mode === 'CBC' ? Buffer.alloc(8) : null;
  const decryptor = createDecipheriv(mode === 'CBC' ? 'des-ede3-cbc' : 'des-ede3', key24, iv);
  decryptor.setAutoPadding(false);
  return Buffer.concat([decryptor.update(data), decryptor.final()]);
}

// Independent NIST DES known-answer vector: key, ciphertext, plaintext.
assert.equal(
  decryptDes(Buffer.from('85e813540f0ab405', 'hex'), Buffer.from('133457799bbcdff1', 'hex'), 'ECB').toString('hex'),
  '0123456789abcdef'
);

const root = join(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(readFileSync(join(root, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(readFileSync(join(root, 'lp2-corpus.json'), 'utf8'));
assert.equal(grid.byte_rows.length, 32);
for (const row of grid.byte_rows) {
  assert.equal(row.length, 8);
  for (const byte of row) assert.ok(Number.isInteger(byte) && byte >= 0 && byte < 256);
}
const ciphertext = Buffer.from(grid.byte_rows.flat());
assert.equal(ciphertext.length, 256);
const sha = createHash('sha256').update(ciphertext).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p57.length, 95);

// The 32 x 8 original rectangle has 76 exterior and 180 interior cells.
// A literal “shed circumferences / find DIVINITY within” hypothesis places
// the already clear p57 at the end of the interior 180-runic receiver.
const interiorIndices = [];
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) interiorIndices.push(row * 8 + col);
}
assert.equal(interiorIndices.length, 180);
const firstP57InteriorOffset = 180 - p57.length;
const key = Buffer.from('DIVINITY', 'ascii');

for (const mode of /** @type {const} */ (['ECB', 'CBC'])) {
  const plain = decryptDes(ciphertext, key, mode);
  assert.equal(plain.length, 256);
  const interior = interiorIndices.map((index) => plain[index]);
  const p57Bytes = interior.slice(firstP57InteriorOffset);
  let exact = 0;
  let modular29 = 0;
  for (let i = 0; i < p57.length; i++) {
    if (p57Bytes[i] === p57[i]) exact++;
    if (p57Bytes[i] % 29 === p57[i]) modular29++;
  }
  const asciiPrintable = Array.from(plain).filter((byte) => byte >= 32 && byte < 127).length;
  const gpRange = interior.filter((byte) => byte < 29).length;
  console.log(JSON.stringify({
    mode,
    tableBytes: ciphertext.length,
    key: key.toString('ascii'),
    sourceSha256: sha,
    outputSha256: createHash('sha256').update(plain).digest('hex'),
    first24OutputHex: plain.subarray(0, 24).toString('hex'),
    printableBytesOutOf256: asciiPrintable,
    exactGpRangeInteriorOutOf180: gpRange,
    p57ExactKnownRunesOutOf95: exact,
    p57Modulo29KnownRunesOutOf95: modular29,
  }));
}
