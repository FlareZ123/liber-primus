'use strict';

/**
 * Exact, read-only source test for the LP2 p49–51 256-cell GP29 residue reader.
 * Run with Node.js on Windows 11 or other supported platforms.
 *
 * Historical SOURCE distinction:
 * 2013 signed BASE29 means positional numeral conversion. The cellwise
 * modulo-29 operation exercised below is a possible reader, NOT an
 * independently authenticated Cicada instruction.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'resources', 'liber-primus');

/** @param {string} name @returns {any} */
function json(name) {
  return JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
}

/** @param {bigint} value @returns {string} */
function base29(value) {
  const digits = '0123456789ABCDEFGHIJKLMNOPQRS';
  let n = value;
  let result = '';
  do {
    result = digits[Number(n % 29n)] + result;
    n /= 29n;
  } while (n);
  return result;
}

const grid = json('lp2-grid-256.json');
const corpus = json('lp2-corpus.json');
const alphabet = grid.alphabet;
assert.equal(alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(base29(3301n), '3QO', 'authentic 2013 BASE29 3301 positive control');

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.deepEqual(grid.pages.map((page) => page.tokens.length), [80, 104, 72]);
assert.equal(tokens.length, 256);

/** @type {number[]} */
const bytes = tokens.map((token) => {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  const value = 60 * hi + lo;
  assert.ok(value >= 0 && value <= 255);
  return value;
});
assert.deepEqual(bytes, grid.bytes);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

const values = bytes.map((v) => v % 29);
const histogram = Array(29).fill(0);
values.forEach((v) => { histogram[v] += 1; });

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.translit.length, 29);
assert.equal(histogram.reduce((a, b) => a + b, 0), 256);
assert.equal(histogram[28], 20);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p57);
assert.equal(p57.indices.length, 95);
assert.equal(p57.indices.filter((v) => v === 28).length, 0);

console.log('PASS: signed 2013 worked BASE29 example 3301 -> 3QO');
console.log('PASS: 32x8 original tokens; 80 + 104 + 72 byte split; SHA256 confirmed');
console.log('READOUT: each original two-digit cell -> integer modulo 29 -> GP rune');
console.log('NOTE: author selection of this cellwise operation is NOT established');
for (let row = 0; row < 32; row += 1) {
  const chunk = values.slice(row * 8, (row + 1) * 8);
  console.log(
    String(row).padStart(2, '0'),
    chunk.map((v) => corpus.runes[v]).join(''),
    chunk.map((v) => corpus.translit[v]).join(',')
  );
}
console.log('FULL GP29 HISTOGRAM:', histogram.join(','));
console.log('EA at GP index28: panel 20/256; literal solved LP2 p57 0/95');
console.log('PASS: all 256 cellwise residues and source checks; no plaintext claim');
