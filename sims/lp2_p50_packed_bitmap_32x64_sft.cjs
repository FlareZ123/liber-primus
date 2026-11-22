"use strict";

/**
 * Original LP2 pp49–51 32×8 table interpreted as a 32×64 packed monochrome
 * picture: every visible numeral is one byte and every printed row expands
 * to 64 bits. Distinct from selecting a single bitplane to make 32 bytes.
 * Test the source's two legal radices and both byte-internal bit orders.
 *
 * The QR test concerns only an exact, one-pixel-per-module finder square.
 * This test does not exclude encrypted images, shifted pixels, or other maps.
 * Windows 11, Node.js 22, CommonJS:
 * node sims/lp2_p50_packed_bitmap_32x64_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const grid = require("../resources/liber-primus/base60-grid.json");
const canonical = require("../resources/liber-primus/lp2-grid-256.json");
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(canonical.bytes.length, 256);
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);

const sha = input =>
  crypto.createHash("sha256").update(Buffer.from(input)).digest("hex");

/**
 * @param {string} alphabet
 * @returns {number[]}
 */
function parse(alphabet) {
  const radix = alphabet.length;
  return tokens.map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, "Every source token digit must exist");
    const byte = hi * radix + lo;
    assert.ok(byte >= 0 && byte <= 255);
    return byte;
  });
}
const original = parse(grid.alphabet);
assert.deepEqual(original, canonical.bytes);
assert.equal(sha(original),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/**
 * @param {number[]} bytes
 * @param {boolean} lsb
 * @returns {number[][]} 32 rows, 64 binary pixels each.
 */
function unpack(bytes, lsb) {
  assert.equal(bytes.length, 256);
  return Array.from({length: 32}, (_, row) =>
    Array.from({length: 64}, (_, col) => {
      const byte = bytes[8 * row + Math.floor(col / 8)];
      const local = col % 8;
      return (byte >>> (lsb ? local : 7 - local)) & 1;
    }));
}

/**
 * @param {number[][]} pixels
 * @param {boolean} lsb
 * @returns {number[]}
 */
function pack(pixels, lsb) {
  assert.equal(pixels.length, 32);
  assert.ok(pixels.every(row => row.length === 64));
  return Array.from({length: 256}, (_, i) => {
    const row = Math.floor(i / 8);
    const start = (i % 8) * 8;
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      assert.ok(pixels[row][start + j] === 0 ||
        pixels[row][start + j] === 1);
      byte |= pixels[row][start + j] << (lsb ? j : 7 - j);
    }
    return byte;
  });
}

/**
 * Standard QR finder is a 7×7 black outer ring, white inner ring,
 * black central 3×3. It is invariant under a quarter-turn.
 * @param {number} r
 * @param {number} c
 * @returns {number}
 */
const finder = (r, c) =>
  Number(r === 0 || r === 6 || c === 0 || c === 6 ||
    (r >= 2 && r <= 4 && c >= 2 && c <= 4));

/**
 * @param {number[][]} pixels
 * @returns {{exact:number,minimumHamming:number,near:[number,number,boolean]}}
 */
function scan(pixels) {
  let exact = 0;
  let minimumHamming = 50;
  /** @type {[number,number,boolean]} */
  let near = [-1, -1, false];
  for (const inverted of [false, true])
    for (let row = 0; row <= 32 - 7; row++)
      for (let col = 0; col <= 64 - 7; col++) {
        let mismatches = 0;
        for (let y = 0; y < 7; y++)
          for (let x = 0; x < 7; x++)
            if ((pixels[row + y][col + x] ^ Number(inverted)) !==
              finder(y, x))
              mismatches++;
        if (mismatches < minimumHamming) {
          minimumHamming = mismatches;
          near = [row, col, inverted];
        }
        if (mismatches === 0) exact++;
      }
  return {exact, minimumHamming, near};
}

// Positive plant: an exact 7×7 QR finder embedded into the same shape.
const planted = Array.from({length: 32}, () => Array(64).fill(0));
for (let y = 0; y < 7; y++)
  for (let x = 0; x < 7; x++)
    planted[5 + y][11 + x] = finder(y, x);
for (const lsb of [false, true]) {
  const encoded = pack(planted, lsb);
  assert.deepEqual(unpack(encoded, lsb), planted);
  const tested = scan(unpack(encoded, lsb));
  assert.ok(tested.exact >= 1);
  assert.equal(tested.minimumHamming, 0);
}

// Negative on the untouched table, both natural radix parsers and two bit
// directions. A valid direct QR image would contain exact 7×7 finder modules.
const observations = [];
for (const alphabet of [grid.alphabet, grid.alphabet.replace("f", "")]) {
  const bytes = parse(alphabet);
  for (const lsb of [false, true]) {
    const pixels = unpack(bytes, lsb);
    assert.deepEqual(pack(pixels, lsb), bytes);
    const diagnosis = scan(pixels);
    assert.equal(diagnosis.exact, 0);
    const emptyRows = pixels.filter(row => row.every(bit => bit === 0)).length;
    const emptyColumns = Array.from({length: 64},
      (_, col) => pixels.every(row => row[col] === 0))
      .filter(Boolean).length;
    const inkPixels = pixels.flat().reduce((sum, bit) => sum + bit, 0);
    assert.equal(emptyRows, 0);
    assert.equal(emptyColumns, 0);
    observations.push({
      radix: alphabet.length,
      bitOrder: lsb ? "LSB-first" : "MSB-first",
      sourceByteSHA256: sha(bytes),
      inkPixels,
      emptyRows,
      emptyColumns,
      ...diagnosis
    });
  }
}
assert.deepEqual(
  observations.map(result => result.minimumHamming), [12, 12, 13, 13]);
console.log(JSON.stringify({
  source: "Unmodified printed 32-row x 8-byte LP2 p49–51 table",
  byteCount: 256,
  imageShape: [32, 64],
  QRScope: "Exact unscaled 7×7 finder with either black/white polarity",
  sourceNativePositivePlant: "PASS: exact planted finder recovered",
  variants: observations,
  verdict: "No direct QR finder or blank-line-separated bitmap text in four " +
    "source-natural packed-byte interpretations; no original plaintext"
}, null, 2));
