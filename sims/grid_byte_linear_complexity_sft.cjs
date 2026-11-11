'use strict';

/**
 * Original LP2 256-byte table bitplanes: Berlekamp–Massey complexity.
 * A time-invariant GF(2)-linear state generator of hidden dimension k
 * with directly sampled output bits has per-bitplane complexity <= k.
 * SFT: node sims/grid_byte_linear_complexity_sft.cjs (Node 22).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const rows = fixture.byte_rows;
assert.equal(rows.length, 32);
assert.ok(rows.every(r => r.length === 8 && r.every(b =>
  Number.isInteger(b) && b >= 0 && b <= 255)));
const raw = rows.flat();
assert.equal(crypto.createHash('sha256').update(Buffer.from(raw)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number[]} bits GF(2) bits @returns {number} exact LFSR order */
function complexity(bits) {
  const n = bits.length;
  const C = new Uint8Array(n + 1), B = new Uint8Array(n + 1);
  C[0] = B[0] = 1;
  let degree = 0, previous = -1;
  for (let t = 0; t < n; t++) {
    let discrepancy = bits[t];
    for (let j = 1; j <= degree; j++) discrepancy ^= C[j] & bits[t - j];
    if (discrepancy) {
      const before = C.slice();
      const offset = t - previous;
      for (let j = offset; j <= n; j++) C[j] ^= B[j - offset];
      if (2 * degree <= t) {
        degree = t + 1 - degree;
        B.set(before);
        previous = t;
      }
    }
  }
  return degree;
}

/** @param {number[][]} blocks */
function asViews(blocks) {
  const r = blocks.flat();
  const modes = {
    rows: r,
    rowSnake: blocks.flatMap((row, i) => i % 2 ? row.slice().reverse() : row),
    cols: Array.from({length: 256}, (_, k) =>
      blocks[k % 32][Math.floor(k / 32)]),
    colSnake: Array.from({length: 256}, (_, k) =>
      blocks[Math.floor(k / 32) % 2 ? 31 - k % 32 : k % 32][Math.floor(k / 32)])
  };
  const parts = [[0, 10], [10, 13], [23, 9]];
  modes.pageCols = parts.flatMap(([begin, size]) =>
    Array.from({length: 8 * size}, (_, k) =>
      blocks[begin + k % size][Math.floor(k / size)]));
  modes.pageColSnake = parts.flatMap(([begin, size]) =>
    Array.from({length: 8 * size}, (_, k) =>
      blocks[begin + (Math.floor(k / size) % 2 ? size - 1 - k % size : k % size)]
        [Math.floor(k / size)]));
  for (const [name, values] of Object.entries({...modes}))
    modes[name + 'Reverse'] = values.slice().reverse();
  assert.equal(Object.keys(modes).length, 12);
  assert.ok(Object.values(modes).every(v => v.length === 256));
  return modes;
}

/** @param {number} s @returns {number} */
function shift32(s) {
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  return s >>> 0;
}
function main() {
  assert.equal(complexity(Array(256).fill(0)), 0);
  assert.equal(complexity(Array.from({length: 256}, (_, j) => j & 1)), 2);
  let s = 0x3301;
  const plant = Array.from({length: 256}, () => {
    const value = s;
    s = shift32(s);
    return value;
  });
  for (let bit = 0; bit < 8; bit++)
    assert.equal(complexity(plant.map(v => (v >>> bit) & 1)), 32);
  console.log('PLANT: all eight 256-bit xorshift32 bitplanes have complexity 32.');

  const output = {};
  for (const [name, bytes] of Object.entries(asViews(rows))) {
    output[name] = Array.from({length: 8}, (_, bit) =>
      complexity(bytes.map(v => (v >>> bit) & 1)));
  }
  const values = Object.values(output).flat();
  const minimum = Math.min(...values), maximum = Math.max(...values);
  assert.equal(minimum, 126);
  assert.equal(maximum, 131);
  for (const order of ['msb', 'lsb']) {
    const bits = raw.flatMap(v => Array.from({length: 8}, (_, j) =>
      (v >>> (order === 'msb' ? 7 - j : j)) & 1));
    assert.equal(complexity(bits), 1024);
  }
  console.log(JSON.stringify({source:'original printed 256-byte table',
    source_bitplane_count: values.length, minimum, maximum,
    complexities_by_reading: output,
    raw_2048bit_serial_linear_complexity: {msb:1024,lsb:1024}}, null, 2));
  console.log('SFT PASS: no direct-bit linear-state output with <=125 hidden bits under the twelve frozen table views.');
}
if (require.main === module) main();
module.exports = {complexity, asViews};
