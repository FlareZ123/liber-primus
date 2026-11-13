'use strict';
/**
 * One source-motivated direct consumer of the 32-carry / 32-row selector:
 * the selected byte in each row XORs the other seven cells in that row.
 *
 * This is an unauthenticated LP2 hypothesis, not an established cipher.
 * Run: node sims/lp2_carry32_rowlocal_xor_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const parsed = parseLP2Words(transcript);
const carries = parsed.words.filter(w => w.startPage !== w.endPage);
assert.equal(carries.length, 32);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));

const prime = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
const selectors = carries.map(word =>
  [...word.runes].reduce((sum, rune) => sum + prime.get(rune), 0) % 8);
const selectorString = selectors.join('');
const key = selectors.map((column, row) => grid.byte_rows[row][column]);
const keyHex = key.map(x => x.toString(16).padStart(2, '0')).join('');
assert.equal(selectorString, '41733365273004427417340057065101');
assert.equal(keyHex, '61f9571927499cc41952c1d3de0e3656abf5d2f85294eb807315393300ea909e');

const output = [];
for (let row = 0; row < 32; row++) {
  const rowKey = key[row];
  for (let column = 0; column < 8; column++) {
    if (column === selectors[row]) continue;
    output.push(grid.byte_rows[row][column] ^ rowKey);
  }
}
assert.equal(output.length, 224);
const sha256 = createHash('sha256').update(Buffer.from(output)).digest('hex');
assert.equal(sha256, '2e4b3b0379c0f5bba4cb6397000b3cd6ea455a4859ed1f1e8b5b41c23254f8cc');

function printableMetrics(bytes) {
  const printable = bytes.filter(x => x >= 32 && x <= 126).length;
  let longest = 0, current = 0;
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      current++;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  return {printable, longest};
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const print = printableMetrics(output);
assert.equal(print.printable, 85);
assert.equal(print.longest, 4);
const mod29IoC = ioc(output.map(x => x % 29));
const scaledIoC = ioc(output.map(x => Math.floor(29 * x / 256)));
assert.ok(Math.abs(mod29IoC - 0.033151825752722616) < 1e-14);
assert.ok(Math.abs(scaledIoC - 0.03287155669442665) < 1e-14);

const ascii = Buffer.from(output).toString('latin1');
const signatures = {
  png: output.slice(0, 8).equals ? false :
    output.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10',
  zip: output[0] === 0x50 && output[1] === 0x4b,
  gzip: output[0] === 0x1f && output[1] === 0x8b,
  pdf: ascii.startsWith('%PDF-'),
  pgp: ascii.startsWith('-----BEGIN PGP'),
  elf: output[0] === 0x7f && ascii.slice(1, 4) === 'ELF'
};
assert.ok(Object.values(signatures).every(value => !value));

// Source-shaped planted positive: selected byte is the row key; each other
// cell is ciphertext = known plaintext XOR that row key.
const planted = [];
const expectedPlain = [];
for (let row = 0; row < 32; row++) {
  const selector = selectors[row];
  const keyByte = (row * 73 + 19) & 0xff;
  const plain = Array.from({length: 7}, (_, i) =>
    (32 + ((row * 11 + i * 7) % 95)));
  const encoded = Array(8);
  encoded[selector] = keyByte;
  let k = 0;
  for (let column = 0; column < 8; column++) {
    if (column === selector) continue;
    encoded[column] = plain[k] ^ keyByte;
    k++;
  }
  planted.push(encoded);
  expectedPlain.push(plain);
}
const recovered = planted.map((row, r) =>
  row.filter((_, c) => c !== selectors[r]).map(byte => byte ^ row[selectors[r]]));
assert.deepEqual(recovered, expectedPlain);

console.log(JSON.stringify({
  crossPageWords: carries.length,
  selectorColumns: selectorString,
  keyHex,
  outputLength: output.length,
  outputSha256: sha256,
  printableBytes: print.printable,
  longestPrintableRun: print.longest,
  byteMod29IoC: mod29IoC,
  floor29ByteScaleIoC: scaledIoC,
  signatures,
  plantedRoundTrip: '224/224',
  result: 'no direct plaintext or recognized common file signature; no later stage selected'
}, null, 2));
