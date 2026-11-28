'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const base = process.argv[2] || path.join(__dirname, '..', 'resources', 'liber-primus');

/** @param {Buffer} b */
function sha16(b) {
  return crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
}

/** @param {Buffer} data */
function parse(data) {
  assert.equal(data[0], 0xff);
  assert.equal(data[1], 0xd8);
  let i = 2;
  const segments = [];
  let eoiEnd = null;
  while (i < data.length - 1) {
    if (data[i] !== 0xff) { i++; continue; }
    let j = i + 1;
    while (j < data.length && data[j] === 0xff) j++;
    if (j >= data.length) break;
    const marker = data[j];
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) { i = j + 1; continue; }
    if (marker === 0xd9) {
      eoiEnd = j + 1;
      break;
    }
    if (marker === 0xd8 || marker === 0x01) { i = j + 1; continue; }
    assert.ok(j + 2 < data.length);
    const length = data.readUInt16BE(j + 1);
    const start = j + 3;
    const end = j + 1 + length;
    assert.ok(end <= data.length);
    segments.push({ marker, payload: data.subarray(start, end) });
    i = end;
  }
  assert.notEqual(eoiEnd, null);
  return { segments, eoiEnd };
}

/** @param {Buffer} data */
function profile(data) {
  const { segments, eoiEnd } = parse(data);
  const sof = segments.find((s) => s.marker === 0xc0);
  assert.ok(sof, 'baseline SOF0 required');
  const app = segments.filter((s) => s.marker >= 0xe0 && s.marker <= 0xef);
  const com = segments.filter((s) => s.marker === 0xfe);
  const iccSegment = app.find((s) => s.marker === 0xe2 &&
    s.payload.subarray(0, 12).toString('ascii') === 'ICC_PROFILE\0');
  const icc = iccSegment ? iccSegment.payload.subarray(14) : Buffer.alloc(0);
  const dqtSegments = segments.filter((s) => s.marker === 0xdb).map((s) => s.payload);
  const dqt = Buffer.concat(dqtSegments);
  const lumaDqt = dqtSegments[0];
  const dht = Buffer.concat(segments.filter((s) => s.marker === 0xc4).map((s) => s.payload));
  return {
    height: sof.payload.readUInt16BE(1),
    width: sof.payload.readUInt16BE(3),
    components: sof.payload[5],
    app: app.map((s) => ({ marker: s.marker, hex: s.payload.toString('hex') })),
    comCount: com.length,
    iccHash: icc.length ? crypto.createHash('sha256').update(icc).digest('hex') : null,
    iccAscii: icc.toString('latin1').match(/[ -~]{8,}/g) || [],
    lumaDqtHash: sha16(lumaDqt),
    dqtHash: sha16(dqt),
    dhtHash: sha16(dht),
    trailingBytes: data.length - eoiEnd,
  };
}

const pages = [];
for (let physical = 17; physical <= 74; physical++) {
  const filename = String(physical).padStart(2, '0') + '.jpg';
  const data = fs.readFileSync(path.join(base, filename));
  pages.push({ page: physical - 17, physical, filename, bytes: data.length, ...profile(data) });
}

assert.equal(pages.length, 58);
for (const p of pages) {
  assert.deepEqual([p.width, p.height], [2400, 3600]);
  assert.equal(p.comCount, 0);
  assert.equal(p.trailingBytes, 0);
  assert.deepEqual(p.app.map((x) => x.marker), [0xe0, 0xe2]);
  const jfif = Buffer.from(p.app[0].hex, 'hex');
  assert.equal(jfif.subarray(0, 5).toString('ascii'), 'JFIF\0');
  assert.equal(jfif[7], 1);
  assert.equal(jfif.readUInt16BE(8), 400);
  assert.equal(jfif.readUInt16BE(10), 400);
  const iccPayload = Buffer.from(p.app[1].hex, 'hex');
  assert.equal(iccPayload.subarray(0, 12).toString('ascii'), 'ICC_PROFILE\0');
}

const rgb = pages.filter((p) => p.components === 3);
const gray = pages.filter((p) => p.components === 1);
assert.equal(rgb.length, 35);
assert.equal(gray.length, 23);
assert.equal(new Set(pages.map((p) => p.iccHash)).size, 1);
assert.equal(pages[0].iccHash, '942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0');
assert.ok(pages[0].iccAscii.some((x) => x.includes('Artifex Software sRGB ICC Profile')));
assert.ok(pages[0].iccAscii.some((x) => x.includes('Copyright Artifex Software 2011')));
assert.equal(new Set(pages.map((p) => p.lumaDqtHash)).size, 1);
assert.equal(new Set(rgb.map((p) => p.dqtHash)).size, 1);
assert.equal(new Set(gray.map((p) => p.dqtHash)).size, 1);
assert.equal(rgb[0].dqtHash, '0f81986f36a37e13');
assert.equal(gray[0].dqtHash, '31ebb9300d2f056c');
assert.equal(new Set(pages.map((p) => p.dhtHash)).size, 58);

const preLp2Icc = [];
for (let physical = 0; physical <= 16; physical++) {
  const filename = String(physical).padStart(2, '0') + '.jpg';
  preLp2Icc.push(profile(fs.readFileSync(path.join(base, filename))).iccHash);
}
assert.deepEqual([...new Set(preLp2Icc)], [null]);

const rgbPages = rgb.map((p) => p.page);
const grayPages = gray.map((p) => p.page);
assert.deepEqual(grayPages,
  [16,17,18,19,20,21,24,25,28,29,30,31,41,42,43,44,45,46,47,48,50,51,52]);

console.log(JSON.stringify({
  scope: 'LP2 p0-p57 == physical 17.jpg-74.jpg',
  invariant: {
    dimensions: '2400x3600',
    encoding: 'baseline JFIF',
    comments: 0,
    appSegments: 'APP0/JFIF + one APP2 ICC profile',
    density: '400x400 dpi => exact 6x9 inch raster canvas',
    iccSha256: pages[0].iccHash,
    iccDescription: 'Artifex Software sRGB ICC Profile / Copyright Artifex Software 2011',
    preLp2Control: 'physical 00.jpg-16.jpg contain no embedded ICC profile',
    postEoiPayloads: 0,
    distinctHuffmanTables: new Set(pages.map((p) => p.dhtHash)).size,
  },
  profiles: {
    color: { count: rgb.length, dqtHash: rgb[0].dqtHash, pages: rgbPages },
    grayscale: { count: gray.length, dqtHash: gray[0].dqtHash, pages: grayPages },
  },
  decision: 'All 58 LP2 pages share one 400-dpi JFIF/Artifex-ICC export envelope and one luminance quantizer; there are no comments, EXIF fields, or post-EOI payloads. The only structural split is ordinary color-vs-grayscale encoding, while Huffman tables vary per image.',
}, null, 2));
