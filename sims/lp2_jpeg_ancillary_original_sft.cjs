'use strict';
/** Original LP2 JPEG ancillary-channel test, Node.js 22, source images 17.jpg..74.jpg. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

/** @param {Buffer} data @returns {{ancillary: Array<{marker: number, payload: Buffer}>, sos: number, trailing: number}} */
function inspect(data) {
  assert.equal(data.readUInt16BE(0), 0xffd8, 'JPEG SOI');
  const ancillary = [];
  let p = 2;
  let sos = 0;
  let inScan = false;
  while (p < data.length) {
    assert.equal(data[p], 0xff, `marker prefix at byte ${p}`);
    const markerStart = p;
    while (data[p] === 0xff) p++;
    assert(p < data.length, 'complete JPEG marker');
    const marker = data[p++];
    if (marker === 0xd9) return { ancillary, sos, trailing: data.length - p };
    if (marker === 0xd8) throw Error('unexpected nested JPEG SOI');
    if (marker >= 0xd0 && marker <= 0xd7) {
      assert(inScan, 'restart marker outside scan');
      continue;
    }
    if (marker === 0x01) continue;
    assert(p + 2 <= data.length, 'segment length present');
    const len = data.readUInt16BE(p);
    assert(len >= 2 && p + len <= data.length, 'segment length valid');
    if ((marker >= 0xe0 && marker <= 0xef) || marker === 0xfe) {
      ancillary.push({ marker, payload: data.subarray(p + 2, p + len) });
    }
    if (marker === 0xda) {
      sos++;
      inScan = true;
      p += len;
      while (p < data.length) {
        if (data[p] !== 0xff) { p++; continue; }
        let t = p + 1;
        while (data[t] === 0xff) t++;
        assert(t < data.length, 'complete entropy marker');
        if (data[t] === 0x00) { p = t + 1; continue; }
        if (data[t] >= 0xd0 && data[t] <= 0xd7) { p = t + 1; continue; }
        break;
      }
    } else {
      assert(!inScan || [0xdc, 0xdd, 0xc4, 0xdb, 0xc2].includes(marker), `unusual scan marker ${marker.toString(16)} at ${markerStart}`);
      p += len;
    }
  }
  throw Error('JPEG EOI missing');
}

/** @param {Buffer} data @param {number} marker @param {Buffer} payload */
function withMarker(data, marker, payload) {
  const segment = Buffer.alloc(4 + payload.length);
  segment[0] = 0xff;
  segment[1] = marker;
  segment.writeUInt16BE(payload.length + 2, 2);
  payload.copy(segment, 4);
  return Buffer.concat([data.subarray(0, 2), segment, data.subarray(2)]);
}

function main() {
  const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
  const examples = [];
  const profileHashes = new Set();
  let count = 0;
  for (let number = 17; number <= 74; number++) {
    const data = fs.readFileSync(path.join(root, `${String(number).padStart(2, '0')}.jpg`));
    const result = inspect(data);
    assert.equal(result.sos, 1, `single scan ${number}`);
    assert.equal(result.trailing, 0, `no trailing bytes ${number}`);
    assert.deepEqual(result.ancillary.map(x => x.marker), [0xe0, 0xe2], `only JFIF and ICC ${number}`);
    const icc = result.ancillary[1].payload;
    assert.equal(icc.subarray(0, 12).toString('latin1'), 'ICC_PROFILE\0');
    assert.equal(icc[12], 1);
    assert.equal(icc[13], 1);
    const profile = icc.subarray(14);
    assert.equal(profile.readUInt32BE(0), profile.length, `ICC size ${number}`);
    assert.equal(profile.subarray(36, 40).toString('ascii'), 'acsp');
    assert(profile.includes(Buffer.from('Artifex Software sRGB ICC Profile\0')));
    profileHashes.add(createHash('sha256').update(profile).digest('hex'));
    count++;
    if (number === 17) {
      examples.push({ file: '17.jpg', size: data.length, icc_profile_bytes: profile.length, icc_sha256: [...profileHashes][0] });
      const injected = withMarker(data, 0xfe, Buffer.from('SOURCE-ANNOUNCED-SECRET', 'ascii'));
      assert.equal(inspect(injected).ancillary.filter(x => x.marker === 0xfe).length, 1, 'COM positive plant');
      assert.equal(inspect(Buffer.concat([data, Buffer.from('SECRET-TRAILER', 'ascii')])).trailing, 14, 'trailer positive plant');
    }
  }
  assert.equal(profileHashes.size, 1, 'identical ICC profile in all 58 files');
  console.log(JSON.stringify({ original_pages: count, jpeg_comments: 0, alternate_APP_markers: 0, trailing_bytes: 0, distinct_ICC_profiles: profileHashes.size, examples, positive_controls: ['COM', 'trailer'] }, null, 2));
}
main();
