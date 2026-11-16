'use strict';

/**
 * Source-fixed original-table bilateral-fold test.
 * Run on Node.js 22 from any working directory.
 * @returns {void}
 */
function main() {
  const assert = require('node:assert/strict');
  const fs = require('node:fs');
  const path = require('node:path');

  const source = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
  const grid = JSON.parse(fs.readFileSync(source, 'utf8'));
  const table = grid.pages.flatMap((page) => page.bytes);

  assert.deepEqual(grid.pages.map((page) => page.bytes.length), [80, 104, 72]);
  assert.equal(table.length, 256);
  assert.equal(new Set(table).size, 161);

  const alphabet = grid.alphabet;
  for (const page of grid.pages) {
    for (let i = 0; i < page.tokens.length; i++) {
      const value = 60 * alphabet.indexOf(page.tokens[i][0]) + alphabet.indexOf(page.tokens[i][1]);
      assert.equal(value, page.bytes[i], 'Printed base-60 pair must reproduce sourced byte');
    }
  }

  const digestHex =
    '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b' +
    '464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
  const publishedDigest = Buffer.from(digestHex, 'hex');
  assert.equal(publishedDigest.length, 64);

  /** @param {number[]} tape @param {number} row @param {number} col @returns {number} */
  const at = (tape, row, col) => tape[8 * row + col];

  /**
   * Fold the visually mirrored table left/right within each of its 32 rows.
   * @param {number[]} tape Original table in printed row-major order.
   * @returns {number[]}
   */
  const horizontalFold = (tape) =>
    Array.from({ length: 128 }, (_, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      return at(tape, row, col) ^ at(tape, row, 7 - col);
    });

  /**
   * Fold the 32x8 table around its horizontal and vertical center axes.
   * This exactly maps four source cells to each of 64 bytes.
   * @param {number[]} tape Original table in printed row-major order.
   * @returns {number[]}
   */
  const doubleFold = (tape) =>
    Array.from({ length: 64 }, (_, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      return at(tape, row, col) ^ at(tape, row, 7 - col) ^
        at(tape, 31 - row, col) ^ at(tape, 31 - row, 7 - col);
    });

  const horizontal = horizontalFold(table);
  const folded = doubleFold(table);
  const matches = folded.filter((value, i) => value === publishedDigest[i]).length;
  /** @param {number} n @returns {number} */
  const bitCount = (n) => n.toString(2).replace(/0/g, '').length;
  const mismatchBits = folded.reduce((sum, value, i) => sum + bitCount(value ^ publishedDigest[i]), 0);
  const printable = (tape) => tape.filter((value) => value >= 32 && value <= 126).length;

  assert.equal(horizontal.length, 128);
  assert.equal(folded.length, 64);
  assert.equal(matches, 1);
  assert.equal(mismatchBits, 278);
  assert.equal(printable(horizontal), 50);
  assert.equal(printable(folded), 20);

  // Independent four-source-cell positive: one synthetic value per orbit
  // is chosen to force the original published 64-byte target, then checked
  // by the unchanged readout.
  const plant = table.slice();
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    plant[row * 8 + col] =
      publishedDigest[i] ^ at(plant, row, 7 - col) ^
      at(plant, 31 - row, col) ^ at(plant, 31 - row, 7 - col);
  }
  assert.deepEqual(Buffer.from(doubleFold(plant)), publishedDigest);
  plant[0] ^= 1;
  assert.notDeepEqual(Buffer.from(doubleFold(plant)), publishedDigest);

  console.log(JSON.stringify({
    source: 'resources/liber-primus/lp2-grid-256.json',
    shape: [32, 8],
    horizontalBytes: horizontal.length,
    horizontalPrintableAscii: printable(horizontal),
    horizontalHex: Buffer.from(horizontal).toString('hex'),
    doubleFoldBytes: folded.length,
    doubleFoldPrintableAscii: printable(folded),
    doubleFoldHex: Buffer.from(folded).toString('hex'),
    p56DigestHex: digestHex,
    exactMatchingBytes: matches,
    bitMismatches: mismatchBits,
    plantedFoldMatch: '64/64',
    tamperedPlantRejected: true,
    interpretation: 'No original-p56 digest recovery or readable plaintext'
  }, null, 2));
}
main();
