'use strict';
/**
 * SFT: original p54–55 chapter as 256 table cells + 52 inner-ring cells.
 * No network requests, guessed key phases, or file writes. Node.js 22+.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resource = name => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const corpus = resource('lp2-corpus.json');
const grid = resource('base60-grid.json').byte_rows;
const page = n => corpus.pages.find(p => p.page === n).indices;
const p54 = page(54);
const p55 = page(55);
const solvedP57 = page(57);
assert.equal(grid.length, 32);
for (const row of grid) assert.equal(row.length, 8);
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(solvedP57.length, 95);

// Printed source line on p55 contains 24 runes, including p54's word carry.
const source = [...p54, ...p55];
const firstBlock = [...p54, ...p55.slice(0, 24)];
assert.equal(source.length, 308);
assert.equal(firstBlock.length, 256);
assert.equal(p55.slice(24).length, 52);

// Natural clockwise inward ring: corners (3,3), (3,4), (28,4), (28,3).
const inner = [];
for (let col = 3; col <= 4; col++) inner.push(grid[3][col]);
for (let row = 4; row <= 28; row++) inner.push(grid[row][4]);
inner.push(grid[28][3]);
for (let row = 27; row >= 4; row--) inner.push(grid[row][3]);
assert.equal(inner.length, 52);
const key = [...grid.flat(), ...inner].map(value => value % 29);
assert.equal(key.length, 308);
const decode = (ciphertext, pad) => ciphertext.map((x, i) => (x - pad[i] + 29) % 29);
const encode = (plaintext, pad) => plaintext.map((x, i) => (x + pad[i]) % 29);
const plaintext = decode(source, key);
assert.deepEqual(encode(plaintext, key), source);

// Independently native GP positive control, then wrong-pad negative.
const control = Array.from({length: 308}, (_, i) => solvedP57[i % solvedP57.length]);
const synthetic = encode(control, key);
assert.deepEqual(decode(synthetic, key), control);
assert.deepEqual(encode(decode(synthetic, key), key), synthetic);
const displacedPad = [...key.slice(1), key[0]];
assert.notDeepEqual(decode(synthetic, displacedPad), control);

// Separately original solved p57 suffix from 'SHED' to 'EMERGE', 52 runes.
// Exact copying as a crib under this fixed additive ring requires 52/52.
const true52 = solvedP57.slice(43);
assert.equal(true52.length, 52);
const last52 = plaintext.slice(256);
const matching = last52.filter((x, i) => x === true52[i]).length;
assert.equal(matching, 1);
function ioc(symbols) {
  const frequency = Array(29).fill(0);
  for (const symbol of symbols) frequency[symbol]++;
  return frequency.reduce((sum, n) => sum + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}
const translit = symbols => symbols.map(value => corpus.translit[value]).join('');
const result = {
  source: 'original physical p54, p55 and solved p57; original 32x8 pp49-51 base60 grid',
  sourceLengths: {p54: 232, p55FirstPrintedLine: 24, p55Remaining: 52, block: 256, chapter: 308, innerRing: 52},
  model: 'first 256 row-major grid bytes and next 52 clockwise deepest-ring bytes, reduced mod29; subtract to decode',
  originalCipherIoC: ioc(source),
  decodedChapterIoC: ioc(plaintext),
  p55DecodedIoC: ioc(plaintext.slice(232)),
  p55Last52DecodedIoC: ioc(last52),
  solvedP57Last52IoC: ioc(true52),
  decryptedChapterFirst80: translit(plaintext.slice(0, 80)),
  decryptedP55First24: translit(plaintext.slice(232, 256)),
  decryptedP55Last52: translit(last52),
  heldoutLiteralP57Last52Matches: matching,
  heldoutLength: 52,
  positivePlantRecovered: true,
  wrongPadRejected: true,
  output: 'NO PLAINTEXT: direct source-keyed decode fails native prose and known suffix',
};
console.log(JSON.stringify(result, null, 2));
