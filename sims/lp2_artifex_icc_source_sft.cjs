'use strict';
/** Exact original LP2 JPEG ICC profile source-only positive control. Node.js >= 20. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = process.env.LP_JPEG_DIR || path.join(__dirname, '..', 'resources', 'liber-primus');
const expectedSha = '942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
/** @param {Buffer} jpg */
function profile(jpg) {
  assert.equal(jpg.readUInt16BE(0), 0xffd8);
  let pos = 2;
  const found = [];
  while (pos + 4 <= jpg.length) {
    assert.equal(jpg[pos], 0xff, `Invalid marker at ${pos}`);
    while (jpg[pos] === 0xff) pos++;
    const code = jpg[pos++];
    if (code === 0xda || code === 0xd9) break;
    const size = jpg.readUInt16BE(pos);
    assert.ok(size >= 2 && pos + size <= jpg.length);
    const payload = jpg.subarray(pos + 2, pos + size);
    if (code === 0xe2 && payload.subarray(0, 12).toString('ascii') === 'ICC_PROFILE\0') {
      assert.equal(payload[12], 1);
      assert.equal(payload[13], 1);
      found.push(payload.subarray(14));
    }
    pos += size;
  }
  assert.ok(found.length <= 1);
  return found[0];
}
/** @param {Buffer} p */
function tags(p) {
  assert.equal(p.readUInt32BE(0), p.length);
  assert.equal(p.subarray(36, 40).toString('ascii'), 'acsp');
  const n = p.readUInt32BE(128);
  const records = [];
  for (let i = 0; i < n; i++) {
    const at = 132 + 12 * i;
    const type = p.subarray(at, at + 4).toString('ascii');
    const offset = p.readUInt32BE(at + 4), length = p.readUInt32BE(at + 8);
    assert.ok(offset + length <= p.length);
    records.push([type, offset, length]);
  }
  return records;
}
let ref;
for (let i = 0; i < 75; i++) {
  const original = fs.readFileSync(path.join(root, `${String(i).padStart(2, '0')}.jpg`));
  const p = profile(original);
  if (i < 17) assert.equal(p, undefined);
  else {
    assert.equal(original.subarray(6, 11).toString('ascii'), 'JFIF\0');
    assert.equal(original[13], 1); // JFIF densities are dots per inch.
    assert.equal(original.readUInt16BE(14), 400);
    assert.equal(original.readUInt16BE(16), 400);
    assert.ok(p);
    assert.equal(p.length, 2576);
    assert.equal(sha(p), expectedSha);
    if (ref) assert.ok(p.equals(ref));
    else ref = p;
  }
}
const records = tags(ref);
assert.deepEqual(records.map(r => r[0]), ['desc','cprt','wtpt','bkpt','rXYZ','gXYZ','bXYZ','rTRC','gTRC','bTRC']);
assert.deepEqual(records.slice(-3).map(r => r.slice(1)), [[516,2060],[516,2060],[516,2060]]);
assert.equal(ref.readUInt32BE(68), 0x0000f6d5);
assert.equal(ref.readUInt32BE(76), 0x0000d32c);
assert.ok(ref.includes(Buffer.from('Artifex Software sRGB ICC Profile')));
assert.ok(ref.includes(Buffer.from('Copyright Artifex Software 2011')));
console.log('SFT PASS: 17 LP1 absent; 58 LP2 identical Artifex profiles; standard 10 ICC tags; SHA256', sha(ref));
const reference = process.env.GHOSTSCRIPT_RGB_ICC;
if (reference) {
  const current = fs.readFileSync(reference);
  assert.equal(current.length, ref.length);
  const diff = [...ref.keys()].filter(i => ref[i] !== current[i]);
  console.log('External comparison: different byte offsets', diff, 'reference SHA256', sha(current));
  assert.deepEqual(diff, [71,79]);
}
