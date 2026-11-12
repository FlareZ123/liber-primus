'use strict';

/** Reproduce the original LP2 JPEG envelope and ICC checks from 58 source files. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

/** @param {Buffer} bytes @returns {{parts: Map<number, Buffer[]>, suffix: number}} */
function parseJpeg(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'Missing JPEG SOI');
  const parts = new Map();
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset++], 0xff, 'Expected JPEG marker');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9) return { parts, suffix: bytes.length - offset };
    assert.ok(marker !== 0xd8 && marker !== 0x00, 'Unexpected JPEG marker');
    const size = bytes.readUInt16BE(offset);
    assert.ok(size >= 2 && offset + size <= bytes.length, 'Invalid marker payload');
    const payload = bytes.subarray(offset + 2, offset + size);
    offset += size;
    if (!parts.has(marker)) parts.set(marker, []);
    parts.get(marker).push(payload);
    if (marker === 0xda) {
      while (offset < bytes.length - 1) {
        const at = bytes.indexOf(0xff, offset);
        assert.ok(at >= 0, 'Unterminated JPEG entropy stream');
        let next = at + 1;
        while (bytes[next] === 0xff) next++;
        const code = bytes[next];
        if (code === 0x00 || (code >= 0xd0 && code <= 0xd7)) {
          offset = next + 1;
        } else {
          offset = at;
          break;
        }
      }
    }
  }
  assert.fail('Missing JPEG EOI');
}

const iccHashes = new Set();
const channels = new Map([[1, []], [3, []]]);
const quantHashes = new Map();
for (let page = 0; page < 58; page++) {
  const image = fs.readFileSync(path.join(root, `${String(page + 17).padStart(2, '0')}.jpg`));
  const { parts, suffix } = parseJpeg(image);
  assert.equal(suffix, 0, `Physical p${page}: JPEG trailer`);
  const metadata = [...parts.keys()].filter((marker) => marker >= 0xe0 || marker === 0xfe).sort();
  assert.deepEqual(metadata, [0xe0, 0xe2], `Physical p${page}: unexpected metadata segment`);
  assert.equal(parts.get(0xe0).length, 1);
  assert.equal(parts.get(0xe2).length, 1);
  const icc = parts.get(0xe2)[0];
  assert.ok(icc.subarray(0, 12).equals(Buffer.from('ICC_PROFILE\u0000', 'ascii')));
  iccHashes.add(sha256(icc));
  const sof = parts.get(0xc0);
  assert.equal(sof.length, 1);
  assert.equal(sof[0].readUInt16BE(1), 3600);
  assert.equal(sof[0].readUInt16BE(3), 2400);
  const count = sof[0][5];
  assert.ok(channels.has(count), `Physical p${page}: unexpected component count ${count}`);
  channels.get(count).push(page);
  const q = sha256(Buffer.concat(parts.get(0xdb)));
  if (!quantHashes.has(q)) quantHashes.set(q, []);
  quantHashes.get(q).push(page);
  console.log(`p${String(page).padStart(2, '0')} scan OK: size=${image.length}, components=${count}, ICC=${sha256(icc).slice(0, 16)}, no trailer`);
}
assert.equal(iccHashes.size, 1, 'ICC payloads differ between pages');
assert.equal(channels.get(1).length, 23);
assert.equal(channels.get(3).length, 35);
assert.equal(quantHashes.size, 2, 'Unexpected quantization-profile count');
for (const pages of quantHashes.values()) {
  const matchesGray = pages.every((page) => channels.get(1).includes(page));
  const matchesColor = pages.every((page) => channels.get(3).includes(page));
  assert.ok(matchesGray || matchesColor, 'Quantization profile crosses color/grayscale groups');
}
console.log('PASS: 58/58 complete JPEGs; 58/58 identical ICC; zero extra APP/COM markers or trailers');
console.log(`Grayscale pages (${channels.get(1).length}): ${channels.get(1).join(', ')}`);
console.log(`RGB pages (${channels.get(3).length}): ${channels.get(3).join(', ')}`);
console.log(`ICC SHA256 ${[...iccHashes][0]}`);
