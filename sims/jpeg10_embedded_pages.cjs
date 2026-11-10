/**
 * Verify the four complete JPEG files concatenated in original LP1 10.jpg.
 * Run from any working directory: node sims/jpeg10_embedded_pages.cjs
 * Reads original images only; performs no writes.
 */
'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const sourceDir = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const source = fs.readFileSync(path.join(sourceDir, '10.jpg'));
const positions = [0, 754662, 1467395, 2170823, 4240957];
const names = ['10.jpg (first JPEG only)', '11.jpg', '12.jpg', '13.jpg'];
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

assert.equal(source.length, positions[positions.length - 1], 'Original 10.jpg byte length');
for (let i = 0; i < names.length; i++) {
  const first = positions[i];
  const last = positions[i + 1];
  const slice = source.subarray(first, last);
  assert.equal(slice.subarray(0, 2).toString('hex'), 'ffd8', `JPEG ${i + 1} begins with SOI`);
  assert.equal(slice.subarray(slice.length - 2).toString('hex'), 'ffd9', `JPEG ${i + 1} ends with EOI`);
  if (i > 0) {
    const standalone = fs.readFileSync(path.join(sourceDir, `${i + 10}.jpg`));
    assert.ok(slice.equals(standalone), `${names[i]} equals standalone page byte-for-byte`);
  }
  console.log(`${names[i]}: [${first}, ${last}), ${slice.length} bytes, SHA256 ${sha256(slice)}`);
}
console.log(`Full 10.jpg: ${source.length} bytes, SHA256 ${sha256(source)}`);
console.log('PASS: three embedded complete JPEG streams exactly reproduce 11.jpg, 12.jpg, 13.jpg.');
