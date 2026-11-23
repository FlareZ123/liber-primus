'use strict';
/**
 * Source-JPEG wrapper audit for the 75 original Cicada Liber Primus JPGs.
 * Examines marker structure and bytes after JPEG EOI. Read-only, no OCR.
 * Node 22 / CommonJS, runnable from sims/ with original resources/ tree.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/** @param {Buffer} bytes */
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
/** @param {Buffer} bytes */
function header(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'JPEG SOI');
  let pos = 2;
  /** @type {Buffer[]} */
  const app2 = [];
  /** @type {Buffer[]} */
  const quant = [];
  while (pos < bytes.length) {
    assert.equal(bytes[pos], 0xff, 'marker boundary at ' + pos);
    while (bytes[pos] === 0xff) pos++;
    const marker = bytes[pos++];
    if (marker === 0xda) break; // start of entropy-coded scan
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const size = bytes.readUInt16BE(pos);
    assert(size >= 2 && pos + size <= bytes.length);
    const payload = bytes.subarray(pos + 2, pos + size);
    if (marker === 0xe2) app2.push(payload);
    if (marker === 0xdb) quant.push(payload);
    pos += size;
  }
  return { app2: Buffer.concat(app2), quant: Buffer.concat(quant) };
}

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const profiles = new Map();
const icc = new Map();
const trailing = [];
for (let i = 0; i < 75; i++) {
  const filename = String(i).padStart(2, '0') + '.jpg';
  const bytes = fs.readFileSync(path.join(root, filename));
  const end = bytes.lastIndexOf(Buffer.from([0xff, 0xd9]));
  assert(end > 0, 'missing JPEG EOI: ' + filename);
  const tail = bytes.subarray(end + 2);
  const parsed = header(bytes);
  const quantHash = sha256(parsed.quant);
  const iccHash = sha256(parsed.app2);
  const group = profiles.get(quantHash) || [];
  group.push(i);
  profiles.set(quantHash, group);
  if (i >= 17) {
    const p = icc.get(iccHash) || [];
    p.push(i - 17);
    icc.set(iccHash, p);
  }
  if (tail.length) {
    trailing.push({ page: i, offset: end, length: tail.length });
    assert.equal(i, 5, 'non-LP1-05 JPEG trailing bytes');
    assert.equal(tail.length, 72700);
    assert(tail.equals(Buffer.from(bytes.subarray(0, tail.length)).reverse()),
      'LP1 p05 tail must be an exact reversed JPEG prefix');
    assert.equal(sha256(bytes), '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7');
  }
  if (i === 17) assert.equal(sha256(bytes),
    '197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e');
}
assert.deepEqual(trailing, [{page: 5, offset: 600364, length: 72700}]);
assert.equal(icc.size, 1, 'uniform LP2 APP2 ICC profile');
assert.equal(icc.values().next().value.length, 58);
const c = [...profiles.values()].map(x => x.filter(v => v >= 17).length).sort((a,b) => a-b);
assert.deepEqual(c.filter(Boolean), [23,35], 'two LP2 JPEG quantization families');
console.log('PASS: 75 valid JPEG headers and EOI markers inspected');
console.log('LP1 05.jpg: 72,700 post-EOI bytes exactly reverse first 72,700 bytes; no independent payload');
console.log('LP2 pages 0–57: 58/58 have no post-EOI payload, same APP2 ICC, quant families 23+35');
console.log('Source-indicated reversal is an interpretation only; no unknown LP2 plaintext recovered');
