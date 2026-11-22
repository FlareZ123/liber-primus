'use strict';

/**
 * Read-only original-JPEG suffix census over all 75 Liber Primus scans.
 * Run from repository root: node sims/lp1_jpeg05_reversed_tail_sft.cjs
 * Node.js 22, no external dependencies.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const sourceDir = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const eoi = Buffer.from([0xff, 0xd9]);
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const summary = [];
for (let number = 0; number < 75; number++) {
  const filename = String(number).padStart(2, '0') + '.jpg';
  const bytes = fs.readFileSync(path.join(sourceDir, filename));
  assert.equal(bytes.readUInt16BE(0), 0xffd8, filename + ': SOI');
  const end = bytes.lastIndexOf(eoi);
  assert.ok(end >= 2, filename + ': EOI missing');
  const suffix = bytes.subarray(end + eoi.length);
  const reversedPrefixMatches = suffix.equals(Buffer.from(bytes.subarray(0, suffix.length)).reverse());
  if (number === 5) {
    assert.equal(bytes.length, 673066);
    assert.equal(end, 600364);
    assert.equal(suffix.length, 72700);
    assert.ok(reversedPrefixMatches, '05.jpg appended suffix is not the reversed exact prefix');
    assert.equal(sha256(bytes), '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7');
    assert.equal(sha256(suffix), '3e95593e226980e3bf743ce9d12f38cf41b96dc7797587f9ff7470788719803f');
  } else {
    assert.equal(suffix.length, 0, filename + ': unexpected trailer');
  }
  summary.push({file: filename, size: bytes.length, eoiOffset: end,
    trailerLength: suffix.length, reversedPrefixMatches});
}
assert.equal(summary.filter(s => s.trailerLength).length, 1);
console.log(JSON.stringify({
  sourceImages: 75,
  pagesWithTrailers: summary.filter(s => s.trailerLength),
  othersHaveNoTrailer: true,
  informationContent: 'exact duplicate of already present prefix in reverse order',
}, null, 2));
