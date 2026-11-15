"use strict";

/**
 * SFT: source-native signed 2016 numbers as coordinates in p32's proposed
 * GP-prime-weighted 11x11 grid.  This is a conditional source correspondence,
 * not a decipherment of unknown LP2 ciphertext.
 *
 * Run: node sims/lp2_signed2016_p32_fixedpoints_sft.cjs
 * Input files are read only. Requires Node.js 18+.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const signed = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const jpeg = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25.jpg"));

/**
 * Read the actual baseline JPEG SOF dimensions without image recompression.
 * @param {Buffer} bytes
 * @returns {{width:number,height:number}}
 */
function getJpegSize(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  let offset = 2;
  while (offset + 8 < bytes.length) {
    assert.equal(bytes[offset++], 0xff, "expected JPEG marker");
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    const length = bytes.readUInt16BE(offset);
    assert.ok(length >= 2 && offset + length <= bytes.length, "malformed JPEG segment");
    if (marker === 0xc0) {
      assert.equal(bytes[offset + 2], 8, "expected 8-bit baseline JPEG");
      return {height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5)};
    }
    offset += length;
  }
  throw new Error("No baseline JPEG SOF0 dimensions");
}

/**
 * Left-closed, right-open source-origin strip lookup.
 * @param {number[]} edges
 * @param {number} position
 * @returns {number}
 */
function stripIndex(edges, position) {
  const found = edges.findIndex((left, i) => i < edges.length - 1 && left <= position && position < edges[i + 1]);
  assert.ok(found >= 0, "pixel coordinate outside the source axes");
  return found;
}

/**
 * Map one unsigned integer through source-image dimensions into a GP-index tile.
 * @param {bigint} value
 * @param {number[]} page
 * @param {number[]} xEdges
 * @param {number[]} yEdges
 * @param {{width:number,height:number}} dimensions
 * @returns {{x:number,y:number,row:number,col:number,offset:number,gpIndex:number,expectedIndex:number,match:boolean}}
 */
function testNumber(value, page, xEdges, yEdges, dimensions) {
  const x = Number(value % BigInt(dimensions.width));
  const y = Number(value % BigInt(dimensions.height));
  const col = stripIndex(xEdges, x);
  const row = stripIndex(yEdges, y);
  const offset = row * 11 + col;
  const gpIndex = page[offset];
  const expectedIndex = Number(value % 29n);
  return {x,y,row,col,offset,gpIndex,expectedIndex,match: gpIndex === expectedIndex};
}

assert.equal(corpus.pages.length, 58);
assert.equal(corpus.translit.length, 29);
assert.equal(corpus.prime.length, 29);
const p32 = corpus.pages[32].indices;
assert.equal(p32.length, 121);
assert.equal(corpus.pages[32].runic_count, 121);
const dimensions = getJpegSize(jpeg);
assert.deepEqual(dimensions, {width: 563, height: 569});
const xEdges = [0], yEdges = [0];
for (let i = 0; i < 11; i++) {
  xEdges.push(xEdges.at(-1) + corpus.prime[p32[i]]);
  yEdges.push(yEdges.at(-1) + corpus.prime[p32[i * 11]]);
}
assert.equal(xEdges.at(-1), dimensions.width);
assert.equal(yEdges.at(-1), dimensions.height);
assert.deepEqual(xEdges, [0,73,78,179,198,299,302,345,452,465,484,563]);
assert.deepEqual(yEdges, [0,73,96,101,124,203,262,315,394,453,562,569]);

const sourceBody = signed.split("-----BEGIN PGP SIGNATURE-----")[0];
assert.match(sourceBody, /^3301\s*$/m);
const keyId = sourceBody.match(/Verify OpenPGP ([0-9A-F]{8})\./);
assert.ok(keyId, "signed source does not contain an eight-hex-character verification suffix");
assert.equal(keyId[1], "7A35090F");
const short = BigInt("0x" + keyId[1]);
const issuer = 0x181f01e57a35090fn; // known full issuer ID, separate from printed suffix
const cicada = 3301n;
const checks = {
  signed_short_keyid: testNumber(short, p32, xEdges, yEdges, dimensions),
  signed_identifier_3301: testNumber(cicada, p32, xEdges, yEdges, dimensions),
  full_openpgp_issuer_control: testNumber(issuer, p32, xEdges, yEdges, dimensions),
  source_signature_clock_control: testNumber(0x5685c1c3n, p32, xEdges, yEdges, dimensions),
  timestamp_107_control: testNumber(107n, p32, xEdges, yEdges, dimensions)
};
assert.deepEqual(checks.signed_short_keyid, {
  x:400, y:171, row:4, col:7, offset:51, gpIndex:23, expectedIndex:23, match:true
});
assert.deepEqual(checks.signed_identifier_3301, {
  x:486, y:456, row:9, col:10, offset:109, gpIndex:24, expectedIndex:24, match:true
});
assert.equal(corpus.translit[23], "D");
assert.equal(corpus.translit[24], "A");
assert.equal(checks.full_openpgp_issuer_control.match, false);
assert.equal(checks.source_signature_clock_control.match, false);
assert.equal(checks.timestamp_107_control.match, false);

// Lock the original 21 heading/axis cells, then uniformly permute only 100
// remaining cells. Their source rune multiset contains four 23s and four 24s.
// For two distinct preselected target cells the exact probability that both
// contain the demanded rune is 4/100 * 4/99; not a discovery-wide p value.
const axis = new Set();
for (let i = 0; i < 11; i++) {
  axis.add(i);
  axis.add(i * 11);
}
const interior = p32.filter((_, i) => !axis.has(i));
assert.equal(axis.size, 21);
assert.equal(interior.length, 100);
assert.ok(!axis.has(51) && !axis.has(109));
const count23 = interior.filter(v => v === 23).length;
const count24 = interior.filter(v => v === 24).length;
assert.equal(count23, 4);
assert.equal(count24, 4);
const conditionalExactProbability = count23 * count24 / (100 * 99);
assert.equal(conditionalExactProbability, 16 / 9900);

// Negative sensitivity check: two intentionally changed interior cells in a
// shadow grid do not pass the source tests. Source corpus is never modified.
const shadow = p32.slice();
shadow[51] = (shadow[51] + 1) % 29;
shadow[109] = (shadow[109] + 1) % 29;
assert.equal(testNumber(short, shadow, xEdges, yEdges, dimensions).match, false);
assert.equal(testNumber(cicada, shadow, xEdges, yEdges, dimensions).match, false);

// Check whether the two source-number pixels are unusual *visible ink*
// in the original signed JPEG. A fixed full-canvas brightness percentile
// serves as an independent image-based control for the conjectured map.
const decoder = require("./vendor/jpeg-js-decoder.cjs");
const raster = decoder(jpeg, {useTArray: true, formatAsRGBA: false, maxResolutionInMP: 2});
assert.deepEqual([raster.width, raster.height], [563,569]);
assert.equal(raster.data.length, 3 * 563 * 569);
/** @param {number} x @param {number} y @returns {number} */
function brightness(x,y) {
  const k = 3 * (y * raster.width + x);
  return (raster.data[k] + raster.data[k+1] + raster.data[k+2]) / 3;
}
const brightnessCounts = new Int32Array(256);
let brightnessTotal = 0;
for (let y = 0; y < raster.height; y++) {
  for (let x = 0; x < raster.width; x++) {
    const v = Math.round(brightness(x,y));
    brightnessCounts[v]++;
    brightnessTotal += v;
  }
}
const pointBrightness = {};
for (const name of ["signed_short_keyid", "signed_identifier_3301"]) {
  const point = checks[name];
  const value = Math.round(brightness(point.x,point.y));
  const idx = 3 * (point.y * raster.width + point.x);
  pointBrightness[name] = {
    rgb: Array.from(raster.data.slice(idx,idx+3)),
    roundedBrightness: value,
    percentileAmongOriginalImagePixels:
      brightnessCounts.slice(0,value+1).reduce((a,b)=>a+b,0)/(563*569)
  };
}
const sourceImageMeanBrightness = brightnessTotal/(563*569);

console.log(JSON.stringify({
  mode: "original-source coincidence; no authentic LP2 decryption",
  dimensions,
  axisRuneCounts: 21,
  interiorRuneCounts: 100,
  signedShortKeyId: keyId[1],
  checks,
  pointBrightness,
  sourceImageMeanBrightness,
  conditionalInteriorShuffleChance: conditionalExactProbability,
  caveat: "The p32 square, prime-weight strip model and fixed-point comparison are analyst-selected; conditional probability is post-selection-unadjusted."
}, null, 2));
