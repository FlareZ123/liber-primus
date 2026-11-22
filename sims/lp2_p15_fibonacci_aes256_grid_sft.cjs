'use strict';
/**
 * SFT: original p15 16-number / AES-256 / p49-51 256-byte table gate.
 * Run from the repository root with Node.js 22.
 * No network access or files written. Source numerical hypotheses are fixed.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const bytes = Buffer.from(grid.byte_rows.flat());
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/* The sixteen original p15 4x4 numbers, printed row-major. */
const square = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820
];
const spiralOrder = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
assert.deepEqual(spiralOrder.map(i => square[i]),
  [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);

/** @param {number[]} vals @param {'BE'|'LE'} endian @returns {Buffer} */
function serialize(vals, endian) {
  const buf = Buffer.alloc(32);
  vals.forEach((v, i) => {
    assert(v >= 0 && v <= 65535);
    if (endian === 'BE') buf.writeUInt16BE(v, i * 2);
    else buf.writeUInt16LE(v, i * 2);
  });
  return buf;
}

/** @param {Buffer} b @param {'row'|'reverse'|'column'} order @returns {Buffer} */
function layout(b, order) {
  if (order === 'row') return Buffer.from(b);
  if (order === 'reverse') return Buffer.from(b).reverse();
  const out = Buffer.alloc(256);
  for (let i = 0; i < 256; i++) out[i] = b[(i % 32) * 8 + Math.floor(i / 32)];
  return out;
}

/** @param {Buffer} b @param {Buffer} key @param {string} mode @param {boolean} decrypt */
function aes(b, key, mode, decrypt) {
  const iv = mode === 'ecb' ? null : Buffer.alloc(16);
  const op = (decrypt ? crypto.createDecipheriv : crypto.createCipheriv)(
    'aes-256-' + mode, key, iv);
  op.setAutoPadding(false);
  return Buffer.concat([op.update(b), op.final()]);
}

/** @param {Buffer} b */
function score(b) {
  let printable = 0;
  let gp = 0;
  for (const v of b) {
    if ((v >= 32 && v <= 126) || v === 9 || v === 10 || v === 13) printable++;
    if (v <= 28) gp++;
  }
  return {printable, gp};
}
let n = 0;
let bestPrintable = {count: -1};
let bestGp = {count: -1};
for (const source of ['raw', 'difference']) {
  for (const order of ['printed', 'spiral']) {
    const vals = (order === 'printed' ? square : spiralOrder.map(i => square[i]))
      .map(x => source === 'raw' ? x : Math.abs(3301 - x));
    for (const endian of ['BE', 'LE']) {
      const key = serialize(vals, endian);
      for (const target of ['row', 'reverse', 'column']) {
        const input = layout(bytes, target);
        for (const mode of ['ecb', 'cbc', 'ctr']) {
          const decoded = aes(input, key, mode, true);
          assert.equal(decoded.length, 256);
          const s = score(decoded);
          const name = [source, order, endian, target, mode].join('/');
          if (s.printable > bestPrintable.count)
            bestPrintable = {count: s.printable, name, prefix: decoded.subarray(0, 24).toString('hex')};
          if (s.gp > bestGp.count)
            bestGp = {count: s.gp, name};
          assert(s.printable < 256 && s.gp < 256);
          /* Full ciphertext re-encoding is required but not evidence of a true key. */
          assert(aes(decoded, key, mode, false).equals(input));
          n++;
        }
      }
    }
  }
}
assert.equal(n, 72);
assert.equal(bestPrintable.count, 118);
assert.equal(bestGp.count, 44);

/* Planted English-byte positive, using a source-derived key. */
const plantKey = serialize(square, 'BE');
const plant = Buffer.alloc(256, 0x20);
Buffer.from('THE INSTar EMERGENCE; SHED OUR OWN CIRCUMFERENCES.').copy(plant);
for (const mode of ['ecb', 'cbc', 'ctr']) {
  const encoded = aes(plant, plantKey, mode, false);
  assert(aes(encoded, plantKey, mode, true).equals(plant));
}
console.log(JSON.stringify({
  originalTableBytes: bytes.length, originalSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  hypotheses: n, bestPrintable, bestGp, completePrintable: 0, completeGP29: 0,
  positiveControl: '256/256, all three modes'
}, null, 2));
