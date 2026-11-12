'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../resources/liber-primus');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');

/** @param {Buffer} jpeg */
function inspect(jpeg) {
  assert.equal(jpeg.readUInt16BE(0), 0xffd8, 'missing JPEG SOI');
  assert.equal(jpeg.readUInt16BE(jpeg.length - 2), 0xffd9, 'bytes after JPEG EOI');
  let at = 2;
  /** @type {{name: string, data: Buffer}[]} */
  const segments = [];
  while (at < jpeg.length - 2) {
    assert.equal(jpeg[at], 0xff, 'invalid marker at ' + at);
    while (jpeg[at] === 0xff) at++;
    const marker = jpeg[at++];
    const n = jpeg.readUInt16BE(at);
    assert.ok(n >= 2 && at + n <= jpeg.length);
    const name = marker.toString(16).padStart(2, '0').toUpperCase();
    segments.push({name, data: jpeg.subarray(at + 2, at + n)});
    at += n;
    if (marker === 0xda) break;
  }
  const types = segments.map(s => s.name);
  assert.deepEqual([...new Set(types.filter(x => x.startsWith('E')))].sort(), ['E0', 'E2']);
  for (const type of ['E0', 'E2', 'C0', 'DA']) {
    assert.equal(types.filter(x => x === type).length, 1);
  }
  const sof = segments.find(s => s.name === 'C0').data;
  assert.deepEqual([sof.readUInt16BE(3), sof.readUInt16BE(1)], [2400, 3600]);
  const components = sof[5];
  assert.ok(components === 1 || components === 3);
  const icc = segments.find(s => s.name === 'E2').data;
  assert.equal(icc.subarray(0, 12).toString('latin1'), 'ICC_PROFILE\0');
  assert.ok(icc.includes(Buffer.from('Artifex Software sRGB ICC Profile')));
  return {
    components,
    metadata: Object.fromEntries(segments.filter(s => /^E[0-9A-F]$/.test(s.name)).map(s => [s.name, digest(s.data)])),
    quantization: segments.filter(s => s.name === 'DB').map(s => digest(s.data)),
    huffman: segments.filter(s => s.name === 'C4').map(s => digest(s.data))
  };
}

const pages = Array.from({length: 58}, (_, page) => ({
  page,
  ...inspect(fs.readFileSync(path.join(root, String(page + 17).padStart(2, '0') + '.jpg')))
}));
const unique = fn => [...new Set(pages.map(fn))];
assert.equal(unique(x => x.metadata.E0).length, 1);
assert.equal(unique(x => x.metadata.E2).length, 1);
assert.equal(unique(x => JSON.stringify(x.quantization)).length, 2);
assert.equal(unique(x => JSON.stringify(x.huffman)).length, 58);
const gray = pages.filter(x => x.components === 1).map(x => x.page);
assert.equal(gray.length, 23);
console.log(JSON.stringify({
  sourcePages: pages.length,
  dimensions: '2400x3600',
  jfifSha256: pages[0].metadata.E0,
  iccSha256: pages[0].metadata.E2,
  iccLabel: 'Artifex Software sRGB ICC Profile',
  appMarkerKinds: unique(x => Object.keys(x.metadata).join(',')),
  quantizationProfiles: unique(x => JSON.stringify(x.quantization)).length,
  huffmanProfiles: unique(x => JSON.stringify(x.huffman)).length,
  grayscalePages: gray,
  rgbPages: pages.filter(x => x.components === 3).map(x => x.page),
  appendedAfterEoi: false
}, null, 2));
