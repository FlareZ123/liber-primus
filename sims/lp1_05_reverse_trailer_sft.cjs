'use strict';

/**
 * Reproduce the source-exact JPEG trailer census on the 75 original 00.jpg–74.jpg scans.
 * Run on Node.js 22 with one optional argument: the directory containing the scans.
 * This program performs no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const dir = process.argv[2] || path.resolve(__dirname, '..', 'resources', 'liber-primus');
const eoi = Buffer.from([0xff, 0xd9]);
const expectedHash = '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7';
const expectedTailLength = 72700;
let trailerPages = 0;
let totalBytes = 0;

for (let i = 0; i < 75; i++) {
  const name = String(i).padStart(2, '0') + '.jpg';
  const b = fs.readFileSync(path.join(dir, name));
  const terminator = b.lastIndexOf(eoi);
  assert(terminator >= 0, `${name} has no JPEG EOI marker`);
  const tail = b.subarray(terminator + eoi.length);
  totalBytes += b.length;
  if (tail.length === 0) continue;
  trailerPages++;
  assert.equal(name, '05.jpg', `Unexpected JPEG trailer in ${name}`);
  assert.equal(b.length, 673066);
  assert.equal(terminator, 600364);
  assert.equal(tail.length, expectedTailLength);
  const hash = crypto.createHash('sha256').update(b).digest('hex');
  assert.equal(hash, expectedHash);
  for (let j = 0; j < expectedTailLength; j++) {
    assert.equal(tail[j], b[expectedTailLength - j - 1], `Reverse prefix mismatch at ${j}`);
  }
  console.log(`${name}: JPEG EOI at byte ${terminator}; reversed-prefix trailer exactly ${tail.length} bytes; SHA256=${hash}`);
}
assert.equal(trailerPages, 1);
console.log(`PASS: ${75} original JPEGs (${totalBytes} bytes) checked; ${trailerPages} reversed-prefix trailer; no additional suffix payload.`);
