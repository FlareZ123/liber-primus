'use strict';

/** Original-source regression for the reversed prefix appended to LP1 JPEG 05. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const imageDir = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const endMarker = Buffer.from([0xff, 0xd9]);
const expectedSha256 = '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7';
let checked = 0;

/** @param {Buffer} bytes @returns {string} */
function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

for (let page = 0; page <= 74; page += 1) {
  const filename = `${String(page).padStart(2, '0')}.jpg`;
  const bytes = fs.readFileSync(path.join(imageDir, filename));
  const end = bytes.lastIndexOf(endMarker);
  assert.notEqual(end, -1, `${filename}: absent JPEG end marker`);
  const trailer = bytes.subarray(end + endMarker.length);

  if (page === 5) {
    assert.equal(bytes.length, 673066, `${filename}: changed original JPEG length`);
    assert.equal(sha256(bytes), expectedSha256, `${filename}: changed original JPEG bytes`);
    assert.equal(end, 600364, `${filename}: changed JPEG end-marker position`);
    assert.equal(trailer.length, 72700, `${filename}: changed trailer length`);
    assert.deepEqual(Buffer.from(trailer).reverse(), bytes.subarray(0, trailer.length));
    console.log(`${filename}: ${trailer.length} trailing bytes equal the reversed 0..${trailer.length - 1} JPEG prefix`);
  } else {
    assert.equal(trailer.length, 0, `${filename}: unexpected nonempty trailer`);
  }
  checked += 1;
}

assert.equal(checked, 75);
console.log(`PASS: ${checked}/75 original JPEGs checked; only 05.jpg has a trailer, and its content is completely redundant`);
