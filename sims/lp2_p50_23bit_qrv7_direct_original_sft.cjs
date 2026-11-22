'use strict';
/**
 * Original LP2 p49-p51 256-byte table -> literal QR Version-7 raster gate.
 *
 * A 32x8 byte table contains 2048 bits. The solved p57 23-dot terminal mark
 * motivates, but does not authenticate, dropping 23 bits and interpreting the
 * remaining 2025 as a 45x45 QR-v7 raster. Tests every ordinary bit orientation,
 * either end trim, all 8 square symmetries and both polarities.
 *
 * The fixed QR finder and row/column timing patterns alone are necessary;
 * their failure excludes a direct bitmap without inspecting payload grammar.
 *
 * Run from repository root: node sims/lp2_p50_23bit_qrv7_direct_original_sft.cjs
 * Node.js 22, CommonJS, no additional dependencies, read-only.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const N = 45;
const TOTAL_BITS = 256 * 8;
const RASTER_BITS = N * N;
const EXTRA = TOTAL_BITS - RASTER_BITS;

 /** @returns {Map<number, number>} */
function mandatoryModules() {
  const map = new Map();
  /** @param {number} x @param {number} y @param {number} bit */
  function put(x, y, bit) {
    const addr = y * N + x;
    assert.ok(!map.has(addr) || map.get(addr) === bit);
    map.set(addr, bit);
  }
  for (const [ox, oy] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const dark = x === 0 || y === 0 || x === 6 || y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        put(ox + x, oy + y, Number(dark));
      }
    }
  }
  for (let k = 8; k <= N - 9; k++) {
    put(k, 6, Number(k % 2 === 0));
    put(6, k, Number(k % 2 === 0));
  }
  assert.equal(map.size, 205);
  return map;
}

/**
 * @param {number[]} bytes
 * @param {boolean} lsbFirst
 * @returns {number[]}
 */
function unpack(bytes, lsbFirst) {
  assert.equal(bytes.length, 256);
  assert.ok(bytes.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
  return bytes.flatMap(n => Array.from({length: 8}, (_, i) =>
    (n >> (lsbFirst ? i : 7 - i)) & 1));
}

/**
 * @param {number[]} bytes
 * @param {Map<number, number>} mandatory
 * @returns {Array<{lsbFirst:boolean,trimFirst:boolean,symmetry:number,inverted:boolean,match:number}>}
 */
function scan(bytes, mandatory) {
  const options = [];
  for (const lsbFirst of [false, true]) {
    const bitstream = unpack(bytes, lsbFirst);
    for (const trimFirst of [false, true]) {
      const raster = bitstream.slice(trimFirst ? EXTRA : 0,
        trimFirst ? TOTAL_BITS : RASTER_BITS);
      assert.equal(raster.length, RASTER_BITS);
      for (let symmetry = 0; symmetry < 8; symmetry++) {
        for (const inverted of [false, true]) {
          let match = 0;
          for (const [index, expected] of mandatory) {
            let x = index % N;
            let y = Math.floor(index / N);
            if (symmetry & 1) x = N - 1 - x;
            if (symmetry & 2) y = N - 1 - y;
            if (symmetry & 4) [x, y] = [y, x];
            if ((raster[y * N + x] ^ Number(inverted)) === expected) match++;
          }
          options.push({lsbFirst, trimFirst, symmetry, inverted, match});
        }
      }
    }
  }
  assert.equal(options.length, 64);
  options.sort((a, b) => b.match - a.match);
  return options;
}

/**
 * @param {number[]} bytes
 * @returns {Array<{bit:number,reversed:boolean,printable:number,hex:string}>}
 */
function directBitplanes(bytes) {
  const out = [];
  for (let bit = 0; bit < 8; bit++) for (const reversed of [false, true]) {
    const chars = [];
    for (let row = 0; row < 32; row++) {
      let v = 0;
      for (let col = 0; col < 8; col++) {
        const idx = 8 * row + (reversed ? 7 - col : col);
        v = (v << 1) | ((bytes[idx] >> bit) & 1);
      }
      chars.push(v);
    }
    out.push({bit, reversed, printable: chars.filter(x => x >= 32 && x <= 126).length,
      hex: Buffer.from(chars).toString('hex')});
  }
  return out.sort((a, b) => b.printable - a.printable);
}

/** @returns {void} */
function main() {
  const src = path.join(__dirname, '..', 'resources', 'liber-primus',
    'lp2-grid-256.json');
  const original = JSON.parse(fs.readFileSync(src, 'utf8'));
  const bytes = original.bytes;
  assert.equal(original.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
  assert.equal(EXTRA, 23);
  const mandatory = mandatoryModules();
  const originalScore = scan(bytes, mandatory);
  assert.equal(originalScore[0].match, 116);
  assert.ok(originalScore.every(o => o.match < mandatory.size));
  const bitplanes = directBitplanes(bytes);
  assert.equal(bitplanes[0].printable, 18);

  // Nontrivial positive: embed a legal finder/timing raster in 2025 bits,
  // append exactly 23 arbitrary bits and pack as 256 bytes.
  const bits = Array(RASTER_BITS).fill(0);
  for (const [index, value] of mandatory) bits[index] = value;
  bits.push(...Array(EXTRA).fill(1));
  const plant = [];
  for (let i = 0; i < TOTAL_BITS; i += 8) {
    let byte = 0;
    for (const bit of bits.slice(i, i + 8)) byte = (byte << 1) | bit;
    plant.push(byte);
  }
  const plantedScore = scan(plant, mandatory);
  assert.equal(plantedScore[0].match, mandatory.size);
  console.log(JSON.stringify({
    source: 'resources/liber-primus/lp2-grid-256.json',
    sourceBytes: bytes.length,
    bitCount: TOTAL_BITS,
    qrVersion: 7,
    qrSideModules: N,
    discardedBits: EXTRA,
    necessaryFixedModules: mandatory.size,
    naturalRepresentations: originalScore.length,
    originalBest: originalScore[0],
    originalBestMatches: originalScore[0].match,
    directBitplaneBest: bitplanes[0],
    positiveControlMatches: plantedScore[0].match,
    verdict: 'No direct source-order 45x45 QR-v7 bitmap. No original plaintext recovered.'
  }, null, 2));
}
if (require.main === module) main();
module.exports = {mandatoryModules, unpack, scan, directBitplanes, main};
