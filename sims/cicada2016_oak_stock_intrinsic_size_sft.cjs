'use strict';

/**
 * Single-file 2016 Cicada tree stock-image provenance gate.
 * The source is selected by the exact pre-2016 community wiki link; no image
 * transformations, coordinates, cryptographic keys, or ciphertext are fitted.
 * Run in a networked Node.js 22 environment with repository root as cwd.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const STOCK_URL = 'https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg';
const SIGNED_CARRIER = 'resources/historical/cicada2016-4gq25.jpg';

/** @param {Buffer} bytes @returns {{width:number,height:number,marker:string}} */
function parseJpegSize(bytes) {
  assert(bytes.length > 32, 'JPEG too short');
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'Missing JPEG start marker');
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    assert.equal(bytes[offset], 0xff, 'Invalid JPEG marker boundary');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    if (marker === 0x01) continue;
    const len = bytes.readUInt16BE(offset);
    assert(len >= 2 && offset + len <= bytes.length, 'Truncated JPEG segment');
    const sof = [0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf];
    if (sof.includes(marker)) {
      assert(len >= 8, 'Invalid SOF marker');
      return {
        width: bytes.readUInt16BE(offset + 5),
        height: bytes.readUInt16BE(offset + 3),
        marker: 'FF' + marker.toString(16).toUpperCase(),
      };
    }
    offset += len;
  }
  throw new Error('JPEG contains no SOF dimension marker');
}

/** @param {Buffer} bytes @param {string} label */
function describe(bytes, label) {
  return {
    label,
    byteLength: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    ...parseJpegSize(bytes),
  };
}

async function main() {
  const signed = describe(fs.readFileSync(SIGNED_CARRIER), 'authenticated 2016 JPEG');
  assert.equal(signed.width, 563, 'Signed carrier width has changed');
  assert.equal(signed.height, 569, 'Signed carrier height has changed');
  assert.equal(signed.sha256, 'a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe', 'Signed carrier bytes changed');

  const response = await fetch(STOCK_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; historical-research/1.0)', Accept: 'image/jpeg,image/*;q=0.9,*/*;q=0.1' },
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.ok, true, 'Source HTTP response: ' + response.status);
  const source = Buffer.from(await response.arrayBuffer());
  assert(source.length < 5000000, 'Unexpected source size over 5 MB');
  const native = describe(source, 'original community-linked oak clipart');
  console.log(JSON.stringify({
    sourceURL: STOCK_URL,
    status: response.status,
    finalURL: response.url,
    stock: native,
    signed,
    sameDimensionPair: native.width === signed.width && native.height === signed.height,
    sourceScope: 'Intrinsic JPEG dimensions and binary identity only; no author-intent inference',
  }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
