'use strict';

/**
 * P32 2016-centre AES selector -> p50 literal-byte inverse, independent source SFT.
 * Windows 11: node sims/p32_2016_midpoint_aes_ring_key_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const c = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const p = c.pages.find(page => page.page === 32).indices;
const source = Buffer.from(grid.byte_rows.flat());
const at = (y, x) => p[y * 11 + x];
assert.equal(p.length, 121);
assert.deepEqual(grid.byte_rows.map(row => row.length), Array(32).fill(8));
assert.equal(source.length, 256);
assert.deepEqual([...source.subarray(0, 8)], [203, 231, 167, 186, 97, 237, 126, 183]);
const primeAt = (y, x) => c.prime[at(y, x)];
const xWidths = Array.from({length: 11}, (_, x) => primeAt(0, x));
const yHeights = Array.from({length: 11}, (_, y) => primeAt(y, 0));
const sums = values => values.reduce((a, b) => a + b, 0);
assert.equal(sums(xWidths), 563);
assert.equal(sums(yHeights), 569);
const indexOfTile = (widths, point) => {
  let edge = 0;
  for (let i = 0; i < widths.length; i++) {
    if (edge <= point && point < edge + widths[i]) return i;
    edge += widths[i];
  }
  throw new Error('Pixel outside image');
};
const ix = indexOfTile(xWidths, 281);
const iy = indexOfTile(yHeights, 284);
assert.deepEqual([iy, ix], [6, 4]);
assert.deepEqual(
  [c.translit[at(0, ix)], c.translit[at(iy, 0)], c.translit[at(iy, ix)]],
  ['AE', 'S', 'X'],
);
assert.equal(c.translit[at(3, 4)], 'X');
assert.equal(c.translit[at(5, 5)], 'W');

const ring = r => {
  const high = 10 - r;
  const clockwise = [];
  for (let x = r; x <= high; x++) clockwise.push([r, x]);
  for (let y = r + 1; y <= high; y++) clockwise.push([y, high]);
  for (let x = high - 1; x >= r; x--) clockwise.push([high, x]);
  for (let y = high - 1; y > r; y--) clockwise.push([y, r]);
  const counterclockwise = [clockwise[0], ...clockwise.slice(1).reverse()];
  const rowMajor = clockwise.slice().sort((a,b) => (a[0]-b[0]) || (a[1]-b[1]));
  return {clockwise,counterclockwise,rowMajor};
};
const rings = [1,2,3].map(r => ({
  r,
  ...Object.fromEntries(Object.entries(ring(r)).map(([orientation,coords]) =>
    [orientation, coords.map(([y,x]) => at(y,x))])),
}));
assert.deepEqual(rings.map(x => x.clockwise.length), [32, 24, 16]);
assert.equal(sums(rings[2].clockwise.map(i => c.prime[i])), 1136);
assert.deepEqual(rings[2].clockwise.map(i => c.prime[i]),
  [67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]);

function decrypt(bytes, key, mode) {
  const name = 'aes-' + (key.length * 8) + '-' + mode;
  const iv = mode === 'ecb' ? null : Buffer.alloc(16);
  const d = crypto.createDecipheriv(name, key, iv);
  d.setAutoPadding(false);
  return Buffer.concat([d.update(bytes), d.final()]);
}
function encrypt(bytes, key, mode) {
  const name = 'aes-' + (key.length * 8) + '-' + mode;
  const iv = mode === 'ecb' ? null : Buffer.alloc(16);
  const e = crypto.createCipheriv(name, key, iv);
  e.setAutoPadding(false);
  return Buffer.concat([e.update(bytes), e.final()]);
}
const testSource = Buffer.from(c.pages.find(page => page.page === 57)
  .indices.map(i => c.translit[i]).join(' '));
const plant = Buffer.alloc(256);
for (let i = 0; i < plant.length; i++) plant[i] = testSource[i % testSource.length];
const key128 = Buffer.from(rings[2].clockwise.map(i => c.prime[i]));
for (const mode of ['ecb','cbc']) {
  const enc = encrypt(plant, key128, mode);
  assert.deepEqual(decrypt(enc, key128, mode), plant);
}
const printable = bytes => [...bytes].filter(v => v >= 32 && v <= 126).length;
const preview = bytes => [...bytes.subarray(0, 96)].map(v =>
  (v >= 32 && v <= 126) ? String.fromCharCode(v) : '.').join('');
const out = [];
for (const ringData of rings) {
  for (const orientation of ['clockwise','counterclockwise','rowMajor']) {
    const indices = ringData[orientation];
    for (const encoding of ['prime','ordinal']) {
      const key = Buffer.from(indices.map(i => encoding === 'prime' ? c.prime[i] : i));
      for (const mode of ['ecb','cbc']) {
        const candidate = decrypt(source, key, mode);
        out.push({
          ring: ringData.r,
          keyBits: key.length * 8,
          orientation,
          encoding,
          mode,
          printable: printable(candidate),
          asciiPreview: preview(candidate),
          firstBlockHex: candidate.subarray(0, 16).toString('hex'),
        });
      }
    }
  }
}
assert.equal(out.length, 36);
out.sort((a,b) => b.printable - a.printable);
console.log(JSON.stringify({
  model:'2016 563x569 prime-axis midpoint AE/S/X -> AES; p32 rings 16/24/32 byte keys -> p50 256 raw ciphertext bytes',
  source:{
    image:'2016 4gq25.jpg (563x569); signed OutGuess packet is 1136 bytes',
    weightedImageMidpoint:[281,284],cell:[iy,ix],
    xAxisRune:c.translit[at(0,ix)],
    yAxisRune:c.translit[at(iy,0)],
    centerCellRune:c.translit[at(iy,ix)],
    centerCellPrime:primeAt(iy,ix),
    parentSquareCentralRune:c.translit[at(5,5)],
    aesKeyRings:rings.map(x=>({r:x.r,bytes:x.clockwise.length,
      primeSum:sums(x.clockwise.map(i=>c.prime[i]))})),
    tableBytes:source.length,
  },
  positive:{plantBytes:plant.length,recovered:plant.length},
  original:{
    totalModels:out.length,
    minimumPrintable:Math.min(...out.map(x=>x.printable)),
    maximumPrintable:out[0].printable,
    topEight:out.slice(0,8),
    plaintextFound:out.some(x => x.printable >= 220),
  },
  status:'An exact source-defined candidate gate; successful AES roundtrips alone do not authenticate original plaintext',
},null,2));
