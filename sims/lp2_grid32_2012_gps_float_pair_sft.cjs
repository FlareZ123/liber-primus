"use strict";

/**
 * LP2 physical pp49-51 32x8-byte grid as 32 IEEE754 GPS coordinate pairs.
 *
 * This examines a distinct historical solve-path: Cicada's authenticated 2012
 * stage already used pairs of latitude/longitude coordinates to lead players
 * to physical posters. The 2014 original 32x8 table could serialize exactly
 * one pair of 32-bit floats per printed row, with no offsets or guessed keys.
 *
 * Reads canonical 2014 original table and checks all four byte-order choices
 * for the two 32-bit float fields. Positive controls faithfully encode three
 * known 2012 GPS pairs with both endian conventions. No arbitrary table
 * shuffling, scaling, KDF, language scorer, or hidden coordinates are inferred.
 *
 * Single runnable test, Node.js 22+, Windows 11, no network or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const canonical = JSON.parse(fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const source = canonical.bytes;
assert.equal(source.length, 256);
assert.equal(canonical.byte_count, 256);
assert.equal(canonical.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");

/**
 * @param {ArrayLike<number>} bytes
 * @param {boolean} latLittleEndian
 * @param {boolean} lonLittleEndian
 * @returns {{lat:number,lon:number}}
 */
function decode(bytes, latLittleEndian, lonLittleEndian) {
  assert.equal(bytes.length, 8);
  const buffer = Uint8Array.from(bytes);
  const view = new DataView(buffer.buffer);
  return {
    lat: view.getFloat32(0, latLittleEndian),
    lon: view.getFloat32(4, lonLittleEndian)
  };
}

/** @param {{lat:number,lon:number}} xy @returns {boolean} */
function geographicallyValid(xy) {
  return Number.isFinite(xy.lat) && Number.isFinite(xy.lon) &&
    Math.abs(xy.lat) <= 90 && Math.abs(xy.lon) <= 180;
}

/** @param {{lat:number,lon:number}} xy @returns {boolean} */
function nontrivialCoordinate(xy) {
  return geographicallyValid(xy) &&
    Math.abs(xy.lat) >= 1 && Math.abs(xy.lon) >= 1;
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {boolean} littleEndian
 * @returns {Uint8Array}
 */
function encode(lat, lon, littleEndian) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat32(0, lat, littleEndian);
  view.setFloat32(4, lon, littleEndian);
  return new Uint8Array(buffer);
}

const historicallyObserved2012GPS = [
  [52.216802, 21.018334],       // Warsaw, Poland
  [48.85057059876962, 2.406892329454422], // Paris, France
  [-33.90281, 151.18421]        // Sydney, Australia
];
for (const little of [false, true]) {
  for (const [lat, lon] of historicallyObserved2012GPS) {
    const output = decode(encode(lat, lon, little), little, little);
    assert(geographicallyValid(output));
    assert(nontrivialCoordinate(output));
    assert(Math.abs(output.lat - lat) < 0.00001);
    assert(Math.abs(output.lon - lon) < 0.00001);
  }
}

const results = [];
for (const latLittleEndian of [false, true]) {
  for (const lonLittleEndian of [false, true]) {
    const coordinates = [];
    for (let row = 0; row < 32; row++) {
      const value = decode(source.slice(8 * row, 8 * row + 8),
        latLittleEndian, lonLittleEndian);
      coordinates.push({...value, row});
    }
    const valid = coordinates.filter(geographicallyValid);
    const nontrivial = coordinates.filter(nontrivialCoordinate);
    results.push({
      latLittleEndian, lonLittleEndian,
      geographicalRows: valid.length,
      obviouslyInvalidRows: 32 - valid.length,
      nontrivialGeographicRows: nontrivial,
      longestConsecutiveGeographicRun: coordinates.reduce((acc, v) => {
        if (geographicallyValid(v)) {
          acc.current++;
          acc.max = Math.max(acc.current, acc.max);
        } else acc.current = 0;
        return acc;
      }, {current:0,max:0}).max
    });
  }
}
for (const row of results) assert(row.geographicalRows < 32);
const strictLE = results.find(x => x.latLittleEndian && x.lonLittleEndian);
assert.equal(strictLE.geographicalRows, 10);
assert.deepEqual(strictLE.nontrivialGeographicRows.map(x => x.row), [10]);
const strictBE = results.find(x => !x.latLittleEndian && !x.lonLittleEndian);
assert.equal(strictBE.geographicalRows, 6);
assert.equal(strictBE.nontrivialGeographicRows.length, 0);
console.log(JSON.stringify({
  source: "Original physical LP2 pp49-51 32x8 printed byte table",
  hypothesis: "Every printed row is one IEEE754 float32 latitude/longitude pair in original byte order",
  historicalPositive: historicallyObserved2012GPS.length,
  results,
  recoveredOriginalLocations: 0,
  decodedUnknownLP2Plaintext: false,
  status: "Falsified as a complete natural-serialization 32-location list; isolated geographic-looking floats are non-authenticating"
}, null, 2));
