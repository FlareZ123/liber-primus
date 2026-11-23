'use strict';

/**
 * SFT, Windows Node 22: one source-motivated F59 quadratic-character
 * reading of the original 512 printed p50 digit glyphs against solved
 * p56's 512-bit digest. This is a *conditional* negative, not a cipher.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const digest = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const alphabet = grid.alphabet.replace('f', '');
const tokens = grid.rows.flat();
assert.equal(alphabet.length, 59);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
assert.equal(tokens.length, 256);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(digest.length, 128);
assert.match(digest, /^[0-9a-f]{128}$/);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.byte_rows.flat())).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const residues = new Set(Array.from({ length: 29 }, (_, i) => ((i + 1) ** 2) % 59));
assert.equal(residues.size, 29);
assert(residues.has(1));
assert(!residues.has(2));

/** @param {string} symbol @returns {number} */
function bit(symbol) {
  const digit = alphabet.indexOf(symbol);
  assert(digit >= 0, `Source digit absent from proposed F59 alphabet: ${symbol}`);
  return Number(residues.has(digit));
}

/** @param {string[]} cells @returns {number[]} */
function decode(cells) {
  const bits = [];
  for (const token of cells) {
    assert.equal(token.length, 2);
    const number = alphabet.indexOf(token[0]) * 59 + alphabet.indexOf(token[1]);
    assert(number >= 0 && number <= 255);
    bits.push(bit(token[0]), bit(token[1]));
  }
  return bits;
}

const target = [...digest].flatMap(hex => {
  const n = Number.parseInt(hex, 16);
  return [3, 2, 1, 0].map(position => (n >> position) & 1);
});
const actual = decode(tokens);
assert.equal(target.length, 512);
assert.equal(actual.length, 512);
const matched = actual.filter((v, i) => v === target[i]).length;
const firstMismatches = target.flatMap((v, i) => actual[i] === v ? [] : [i]).slice(0, 20);
assert.equal(matched, 254);
assert.equal(firstMismatches[0], 0);
assert.equal(actual.reduce((s, bitValue) => s + bitValue, 0), 259);

// A full original-shaped positive ensures the decoder can recover a
// complete authentic 512-bit target from legal 256 source-format cells.
// In F59, 1 is a quadratic residue and 2 a nonresidue.
const planted = Array.from({ length: 256 }, (_, i) =>
  (target[i * 2] ? '1' : '2') + (target[i * 2 + 1] ? '1' : '2'));
assert.deepEqual(decode(planted), target);
assert.equal(planted.length, tokens.length);

console.log(JSON.stringify({
  original_cells: 256,
  original_source_bits: 512,
  field: 'GF(59), group of nonzero squares has 29 elements',
  source_glyph_order: 'printed row-major, high glyph then low glyph',
  extraction: 'one if digit is a nonzero quadratic residue mod 59; otherwise zero',
  target: 'p56 solved 128-character SHA-512 digest',
  target_bits: target.length,
  observed_one_bits: actual.reduce((s, v) => s + v, 0),
  matching_bits: matched,
  mismatching_bits: 512 - matched,
  first_20_mismatching_offsets: firstMismatches,
  exact_match: false,
  source_shaped_positive_plant_bits: 512,
  status: 'Bounded negative; no source-authenticated hash-to-table operation or unknown LP2 plaintext'
}, null, 2));
