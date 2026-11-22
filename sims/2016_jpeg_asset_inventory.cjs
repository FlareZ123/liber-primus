'use strict';
// Inventory the archived 2016 Cicada image and assert its exact source identity.
// Node.js built-ins only:
//   node sims/2016_jpeg_asset_inventory.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const FILE = path.join(__dirname, '..', 'resources', 'historical', 'cicada2016-4gq25.jpg');
const EXPECTED_GIT_BLOB_SHA = '22027296dcd7df53c5127e6aadbabeaf3223f72d';

function parseJpeg(bytes) {
  assert.equal(bytes[0], 0xff);
  assert.equal(bytes[1], 0xd8);
  let pos = 2;
  let width = null;
  let height = null;
  let components = null;
  let jfif = null;
  let sawScan = false;
  let eoiOffset = -1;
  const markers = [];

  while (pos < bytes.length && !sawScan) {
    assert.equal(bytes[pos], 0xff, 'Expected JPEG marker prefix');
    while (bytes[pos] === 0xff) pos++;
    const marker = bytes[pos++];
    if (marker === 0xd9) {
      eoiOffset = pos - 2;
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      markers.push(marker);
      continue;
    }
    const length = bytes.readUInt16BE(pos);
    const data = pos + 2;
    markers.push(marker);
    if (marker === 0xe0) {
      assert.equal(bytes.toString('ascii', data, data + 5), 'JFIF\0');
      jfif = {
        major: bytes[data + 5],
        minor: bytes[data + 6],
        units: bytes[data + 7],
        xDensity: bytes.readUInt16BE(data + 8),
        yDensity: bytes.readUInt16BE(data + 10)
      };
    }
    if (marker === 0xc0) {
      height = bytes.readUInt16BE(data + 1);
      width = bytes.readUInt16BE(data + 3);
      components = bytes[data + 5];
    }
    pos += length;
    if (marker === 0xda) sawScan = true;
  }

  assert.ok(sawScan, 'Expected a baseline JPEG scan');
  while (pos < bytes.length) {
    if (bytes[pos] !== 0xff) {
      pos++;
      continue;
    }
    let markerPos = pos + 1;
    while (bytes[markerPos] === 0xff) markerPos++;
    const marker = bytes[markerPos];
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos = markerPos + 1;
      continue;
    }
    if (marker === 0xd9) {
      eoiOffset = pos;
      break;
    }
    throw new Error('Unexpected non-restart marker after the single baseline scan: 0x' + marker.toString(16));
  }

  return {
    width, height, components, jfif,
    markers: markers.map(x => '0x' + x.toString(16).padStart(2, '0')),
    eoiOffset,
    trailingBytes: eoiOffset < 0 ? null : bytes.length - (eoiOffset + 2),
    hasExifOrXmp: markers.includes(0xe1),
    hasIcc: markers.includes(0xe2),
    hasIptc: markers.includes(0xed),
    hasComment: markers.includes(0xfe)
  };
}

function gitBlobSha(bytes) {
  const header = Buffer.from('blob ' + bytes.length + '\0', 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, bytes])).digest('hex');
}

const bytes = fs.readFileSync(FILE);
const sha = gitBlobSha(bytes);
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
const inventory = parseJpeg(bytes);

assert.equal(bytes.length, 26342);
assert.equal(sha, EXPECTED_GIT_BLOB_SHA);
assert.equal(inventory.width, 563);
assert.equal(inventory.height, 569);
assert.equal(inventory.components, 3);
assert.deepEqual(inventory.jfif, {
  major: 1, minor: 1, units: 0, xDensity: 1, yDensity: 1
});
assert.deepEqual(inventory.markers, [
  '0xe0', '0xdb', '0xdb', '0xc0', '0xc4', '0xc4', '0xc4', '0xc4', '0xda'
]);
assert.equal(inventory.hasExifOrXmp, false);
assert.equal(inventory.hasIcc, false);
assert.equal(inventory.hasIptc, false);
assert.equal(inventory.hasComment, false);
assert.equal(inventory.trailingBytes, 0);

console.log(JSON.stringify({
  file: 'resources/historical/cicada2016-4gq25.jpg',
  bytes: bytes.length,
  gitBlobSha: sha,
  sha256,
  ...inventory
}, null, 2));
