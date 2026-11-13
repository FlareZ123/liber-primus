'use strict';

/**
 * Source-exact JPEG metadata and trailer gate for the 58 original LP2 scans.
 * Reads only JPEG headers and post-EOI framing; DCT/image-data steganography
 * remains untested. Requires Node.js 22 and the repository JPEG resources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const sourceDirectory = path.join(__dirname, '..', 'resources', 'liber-primus');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

/** @param {Buffer} bytes @returns {{marker:number,length:number,sha256:string}[]} */
function readHeaders(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'starts with JPEG SOI');
  assert.equal(bytes.readUInt16BE(bytes.length - 2), 0xffd9, 'EOI at file end');
  const segments = [];
  let cursor = 2;
  while (cursor + 3 < bytes.length) {
    assert.equal(bytes[cursor], 0xff, 'header marker boundary');
    const marker = bytes[cursor + 1];
    if (marker === 0xda) return segments;
    const length = bytes.readUInt16BE(cursor + 2);
    assert(length >= 2 && cursor + 2 + length <= bytes.length, 'header length');
    segments.push({marker, length, sha256: digest(bytes.subarray(cursor + 4, cursor + 2 + length))});
    cursor += 2 + length;
  }
  throw new Error('JPEG SOS not found');
}

const jfif = new Set();
const icc = new Set();
const luma = new Set();
const chroma = new Set();
const markerProfiles = new Set();
let rgb = 0;
let grayscale = 0;
for (let page = 0; page < 58; page++) {
  const filename = path.join(sourceDirectory, String(page + 17).padStart(2, '0') + '.jpg');
  const bytes = fs.readFileSync(filename);
  const segments = readHeaders(bytes);
  const app = segments.filter(s => s.marker >= 0xe0 && s.marker <= 0xef);
  assert.deepEqual(app.map(s => s.marker), [0xe0, 0xe2], `page ${page} APP markers`);
  assert(!segments.some(s => s.marker === 0xfe), 'no JPEG COM marker');
  assert.equal(app[0].length, 16, 'JFIF payload length');
  assert.equal(app[1].length, 2592, 'ICC payload length');
  jfif.add(app[0].sha256);
  icc.add(app[1].sha256);
  const sof = segments.find(s => s.marker === 0xc0);
  assert(sof, 'baseline SOF0');
  const isRgb = sof.length === 17;
  assert(sof.length === 11 || isRgb, 'grayscale or RGB scan');
  const quantization = segments.filter(s => s.marker === 0xdb);
  assert.equal(quantization.length, isRgb ? 2 : 1, 'quantization table count');
  luma.add(quantization[0].sha256);
  if (isRgb) chroma.add(quantization[1].sha256);
  isRgb ? rgb++ : grayscale++;
  markerProfiles.add(segments.map(s => `${s.marker.toString(16)}:${s.length}`).join(','));
}
assert.equal(jfif.size, 1);
assert.equal(icc.size, 1);
assert.equal(luma.size, 1);
assert.equal(chroma.size, 1);
assert.equal(rgb, 35);
assert.equal(grayscale, 23);
assert.equal(markerProfiles.size, 46);

const firstPage = fs.readFileSync(path.join(sourceDirectory, '17.jpg'));
const injectedApp1 = Buffer.concat([
  firstPage.subarray(0, 2), Buffer.from([0xff, 0xe1, 0, 8, 69, 120, 105, 102, 0, 0]),
  firstPage.subarray(2),
]);
assert(readHeaders(injectedApp1).some(s => s.marker === 0xe1), 'APP1 mutation control');
assert.throws(() => readHeaders(Buffer.concat([firstPage, Buffer.from([0])])), /EOI at file end/, 'trailer mutation control');

console.log(JSON.stringify({
  sourceScans: 58,
  jpegSourceNames: '17.jpg through 74.jpg',
  grayscale,
  rgb,
  allowedAPPmarkers: ['APP0 JFIF', 'APP2 ICC_PROFILE'],
  pagesWithAPP1orComments: 0,
  pagesWithPostEOITrailers: 0,
  sharedJfifSha256: [...jfif][0],
  sharedIccSha256: [...icc][0],
  sharedLumaDqtSha256: [...luma][0],
  sharedChromaDqtSha256: [...chroma][0],
  distinctHeaderProfiles: markerProfiles.size,
  mutationControls: 'passed',
  scope: 'JPEG pre-SOS headers and post-EOI trailer only',
}, null, 2));
