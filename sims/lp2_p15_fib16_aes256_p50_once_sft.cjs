'use strict';

/**
 * One frozen source-dimensional cross-page hypothesis:
 * 16 visible p15 unsigned decimal numbers, serialized as 16-bit unsigned
 * big-endian to 32-byte AES-256 key, directly decrypt 256 p50 table bytes
 * as 16 AES blocks in ECB (no invented IV). Little-endian is the one
 * byte-order control; no key search, no extra transforms, no fitted language.
 *
 * These source dimensions alone do NOT select AES/ECB historically.
 * This is a literal, cheap, falsifiable decoder check, not claimed evidence.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const bytes = Buffer.from(data.pages.flatMap((p) => p.bytes));
assert.equal(bytes.length, 256);
const sourceMatrix = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206,  708, 1820
];
const modes = ['BE', 'LE'];
const results = [];
for (const endian of modes) {
  const key = Buffer.alloc(32);
  sourceMatrix.forEach((v, i) => key[endian === 'BE' ? 'writeUInt16BE' : 'writeUInt16LE'](v, 2 * i));
  const decryptor = crypto.createDecipheriv('aes-256-ecb', key, null);
  decryptor.setAutoPadding(false);
  const clear = Buffer.concat([decryptor.update(bytes), decryptor.final()]);
  assert.equal(clear.length, 256);
  const encryptor = crypto.createCipheriv('aes-256-ecb', key, null);
  encryptor.setAutoPadding(false);
  assert.deepEqual(Buffer.concat([encryptor.update(clear), encryptor.final()]), bytes);
  const printable = [...clear].filter((v) => v >= 32 && v <= 126 || v === 9 || v === 10 || v === 13).length;
  const nul = [...clear].filter((v) => v === 0).length;
  const ascii = [...clear.subarray(0, 80)].map((v) =>
    v >= 32 && v <= 126 ? String.fromCharCode(v) : '.').join('');
  results.push({
    endianness: endian, keyHex: key.toString('hex'),
    decryptedSha256: crypto.createHash('sha256').update(clear).digest('hex'),
    printableBytes: printable, totalBytes: clear.length, nulBytes: nul,
    first32Hex: clear.subarray(0, 32).toString('hex'),
    first80Ascii: ascii,
    aesRoundtripExact: true
  });
}
console.log(JSON.stringify({
  source: 'original p15 4x4 printed numbers and original pp49-51 256 base60-coded bytes',
  hypothesis: 'AES-256 ECB, all 16 original numbers as 16-bit source-order key words',
  sourceNotice: 'Neither original page nor first-party clue selects AES, key serialization, or ECB.',
  results,
  decision: 'Retain only a clearly typed decrypted payload; arbitrary bytes or a wrong-key roundtrip do not establish a key.'
}, null, 2));
