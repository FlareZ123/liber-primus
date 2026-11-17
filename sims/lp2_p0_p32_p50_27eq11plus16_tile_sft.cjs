'use strict';
/**
 * Original LP2 cross-artifact 27 = 11 + 16 block-tile consumer.
 *
 * First 729 GP runes (p0-p2) form 27x27. Original physical p32 has
 * 121=11x11 runes, and p49-p51 supply 256=16x16 base60 bytes after
 * reflowing the printed 32x8 table. Treat the latter reshape as a
 * hypothesis, not a source instruction. The p0 title had independently
 * suggested both p32 and the table via source GP sums, but that original
 * navigation inference remains provisional.
 *
 * SFT: node sims/lp2_p0_p32_p50_27eq11plus16_tile_sft.cjs (Windows Node22)
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const source = readJson('resources/liber-primus/lp2-corpus.json');
const table = readJson('resources/liber-primus/lp2-grid-256.json');
const solved = readJson('resources/external/relikd-solved-gp29-native-v1.json');
const book = source.pages.slice(0, 3).flatMap((p) => p.indices);
const map11 = source.pages[32].indices;
const map16 = table.bytes.map((v) => v % 29);
assert.equal(book.length, 729);
assert.equal(map11.length, 121);
assert.equal(map16.length, 256);
assert.equal(27, 11 + 16);
assert.equal(729, 121 + 256 + 2 * 176);
assert.equal(table.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');

const tile11 = Array.from({length: 121}, (_, i) =>
  book[Math.floor(i / 11) * 27 + i % 11]);
const tile16 = Array.from({length: 256}, (_, i) =>
  book[(Math.floor(i / 16) + 11) * 27 + 11 + i % 16]);
const topRight = Array.from({length: 176}, (_, i) =>
  book[Math.floor(i / 16) * 27 + 11 + i % 16]);
const lowerLeftTranspose = Array.from({length: 176}, (_, i) =>
  book[(11 + i % 16) * 27 + Math.floor(i / 16)]);

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const count = Array(29).fill(0);
  for (const value of seq) count[value]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0)
    / (seq.length * (seq.length - 1));
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function equal(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((sum, x, i) => sum + Number(x === b[i]), 0);
}
/** @param {number[]} a @param {number[]} b @param {1|-1} sign */
function apply(a, b, sign) {
  assert.equal(a.length, b.length);
  return a.map((x, i) => (x + 29 + sign * b[i]) % 29);
}
/** @param {number[]} input @param {number} n @param {number} mode */
function orient(input, n, mode) {
  return Array.from({length: n * n}, (_, i) => {
    let row = Math.floor(i / n), col = i % n;
    if (mode & 1) col = n - 1 - col;
    if (mode & 2) row = n - 1 - row;
    if (mode & 4) [row, col] = [col, row];
    return input[row * n + col];
  });
}
const sourceCorrespondences = {
  originalTLtoP32: equal(tile11, map11),
  originalBRtoTable: equal(tile16, map16),
  oppositeOffDiagonalTranspose: equal(topRight, lowerLeftTranspose),
  p32EightDihedral: Array.from({length: 8}, (_, m) =>
    equal(tile11, orient(map11, 11, m))),
  tableEightDihedral: Array.from({length: 8}, (_, m) =>
    equal(tile16, orient(map16, 16, m)))
};
assert.deepEqual(sourceCorrespondences, {
  originalTLtoP32: 3,
  originalBRtoTable: 12,
  oppositeOffDiagonalTranspose: 7,
  p32EightDihedral: [3, 1, 4, 8, 4, 5, 2, 1],
  tableEightDihedral: [12, 7, 6, 13, 10, 12, 6, 11]
});
const primeTotient11 = map11.map((rune) => (source.prime[rune] - 1) % 29);
const originalInverses = {
  TLminusP32: ioc(apply(tile11, map11, -1)),
  TLminusP32Totient: ioc(apply(tile11, primeTotient11, -1)),
  BRminusTable: ioc(apply(tile16, map16, -1)),
  BRplusTable: ioc(apply(tile16, map16, 1)),
  TRminusBLtranspose: ioc(apply(topRight, lowerLeftTranspose, -1))
};
assert.ok(Math.abs(originalInverses.TLminusP32 - 0.03278236914600551) < 1e-14);
assert.ok(Math.abs(originalInverses.TLminusP32Totient - 0.03236914600550964) < 1e-14);
assert.ok(Math.abs(originalInverses.BRminusTable - 0.034865196078431374) < 1e-14);
assert.ok(Math.abs(originalInverses.BRplusTable - 0.03658088235294118) < 1e-14);
assert.ok(Math.abs(originalInverses.TRminusBLtranspose - 0.03474025974025974) < 1e-14);
assert.deepEqual(apply(apply(tile11, map11, -1), map11, 1), tile11);
assert.deepEqual(apply(apply(tile16, map16, -1), map16, 1), tile16);

// Exact 377-rune positive plant using authentic known GP29 plaintext.
const lut = new Map(source.runes.map((r, i) => [r, i]));
const native = solved.sections.flatMap((s) =>
  Array.from(s.source_text).filter((r) => lut.has(r)).map((r) => lut.get(r)));
assert.equal(native.length, 2979);
const plant11 = native.slice(0, 121);
const plant16 = native.slice(121, 377);
const encrypt11 = apply(plant11, map11, 1);
const encrypt16 = apply(plant16, map16, 1);
assert.deepEqual(apply(encrypt11, map11, -1), plant11);
assert.deepEqual(apply(encrypt16, map16, -1), plant16);
assert.ok(ioc(plant11) > ioc(apply(tile11, map11, -1)));
assert.ok(ioc(plant16) > ioc(apply(tile16, map16, -1)));

console.log(JSON.stringify({
  source: 'LP2 original p0-p2 729-runic square; p32 121-runic map; p49-p51 256-byte 32x8 source',
  hypothesis: '27=11+16, diagonal TL11x11 and BR16x16, offdiagonal 176-cell transposed rectangles',
  sourceCorrespondences, originalInverses,
  nativeGPPositiveRecovered: 377,
  verdict: 'Visible dimension relation supplies a possible route, but exact copies, transpose symmetry, and direct additive consumers fail to recover plaintext.',
  limitation: 'Square reflow of 32x8 table is not authored; independent keys, nonlinear operations and unknown plaintext registers not excluded.'
}, null, 2));
