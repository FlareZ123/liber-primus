'use strict';

/**
 * SFT: Test the published LP2 32x8 numeral table as 32 packed geographic
 * latitude/longitude pairs, a possible transfer of Cicada's 2012 GPS clue.
 *
 * Run on Windows 11 using: node sims/lp2_grid_gps_standard_pairs_sft.cjs
 * Reads immutable repository fixtures only; no network or file writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'),
  'utf8'
));

assert.equal(source.rows.length, 32);
assert.equal(source.byte_rows.length, 32);
assert.deepEqual(source.page_row_counts, [10, 13, 9]);
const alphabet = source.alphabet;
assert.equal(alphabet.length, 60);

const rows = source.rows.map((tokens, row) => {
  assert.equal(tokens.length, 8, `row ${row} token count`);
  return Uint8Array.from(tokens.map((token, col) => {
    assert.equal(token.length, 2, `row ${row} col ${col} token`);
    const value = alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]);
    assert.ok(value >= 0 && value <= 255, `row ${row} col ${col} is one byte`);
    assert.equal(value, source.byte_rows[row][col]);
    return value;
  }));
});

const digest = crypto.createHash('sha256')
  .update(Buffer.concat(rows.map(row => Buffer.from(row))))
  .digest('hex');
assert.equal(digest, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * @param {Uint8Array} bytes Exactly eight bytes for a row.
 * @param {'float32'|'int32-1e6'|'int32-1e7'} model
 * @param {boolean} littleEndian
 * @returns {[number, number]}
 */
function decodePair(bytes, model, littleEndian) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (model === 'float32') {
    return [view.getFloat32(0, littleEndian), view.getFloat32(4, littleEndian)];
  }
  const scale = model === 'int32-1e6' ? 1000000 : 10000000;
  return [view.getInt32(0, littleEndian) / scale, view.getInt32(4, littleEndian) / scale];
}

/** @param {[number,number]} pair */
function isGeographic(pair) {
  return pair.every(Number.isFinite) &&
    Math.abs(pair[0]) <= 90 && Math.abs(pair[1]) <= 180;
}

const expected = {
  'float32:LE': 10,
  'float32:BE': 6,
  'int32-1e6:LE': 0,
  'int32-1e6:BE': 0,
  'int32-1e7:LE': 10,
  'int32-1e7:BE': 10
};

for (const model of /** @type {const} */ (['float32', 'int32-1e6', 'int32-1e7'])) {
  for (const littleEndian of [true, false]) {
    const id = `${model}:${littleEndian ? 'LE' : 'BE'}`;
    const decoded = rows.map(row => decodePair(row, model, littleEndian));
    const validRows = decoded.flatMap((pair, index) => isGeographic(pair) ? [index] : []);
    assert.equal(validRows.length, expected[id], `${id} original source count`);
    console.log(`${id} coordinate pairs in geographic bounds: ${validRows.length}/32`);
    console.log(`  candidate zero-based row indices: ${validRows.join(', ') || '(none)'}`);
    console.log(`  first row: ${decoded[0].map(x => x.toPrecision(9)).join(', ')}`);
    assert.ok(validRows.length < 32, 'a complete 32-row coordinate list would remain plausible');
  }
}

// Positive: a source-era-style latitude/longitude pair encoded in either
// standard float32 endian must fall within bounds and decode at byte precision.
for (const littleEndian of [true, false]) {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setFloat32(0, 37.577070, littleEndian);
  view.setFloat32(4, 126.813122, littleEndian);
  const recovered = decodePair(buf, 'float32', littleEndian);
  assert.ok(isGeographic(recovered));
  assert.ok(Math.abs(recovered[0] - 37.577070) < 0.00001);
  assert.ok(Math.abs(recovered[1] - 126.813122) < 0.00001);
}
console.log('PASS: 256 exact source bytes, six full-list exclusions, both float32 positive controls.');
