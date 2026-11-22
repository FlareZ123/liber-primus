'use strict';
/**
 * Source-selected LP2 p55 75-runic body and p57 75-rune
 * one-edge-shed words, GP29 glyph indices packed as five-bit
 * binary XOR. An alternative byte-domain consumer to additive GP29.
 * Run with Windows Node.js 22 from the repository root:
 *   node sims/lp2_p55_p57_shed75_binaryxor_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ciphertext = corpus.pages[55].indices.slice(1);
const authentic = corpus.pages[57].indices;
assert.equal(ciphertext.length, 75);
assert.equal(authentic.length, 95);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const text = read('resources/liber-primus/lp2-transcription.txt').split(/\n%\n/).at(-1);
const words = text.replace(/\r?\n|\//g, '').split(/[-.]/)
  .filter(part => part.length && [...part].every(rune => runeIndex.has(rune)))
  .map(part => [...part].map(rune => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  }));
assert.equal(words.length, 20);
assert.deepEqual(words.flat(), authentic);
/** @param {number[]} digits @param {'msb'|'lsb'} order */
function serialize(digits, order) {
  const bits = digits.map(value => {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 32);
    const group = value.toString(2).padStart(5, '0');
    return order === 'msb' ? group : [...group].reverse().join('');
  }).join('');
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8)
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  return {
    bytes: Buffer.from(bytes),
    residual: bits.slice(bytes.length * 8)
  };
}
/** @param {number[]} left @param {number[]} right */
const xor = (left, right) => {
  assert.equal(left.length, right.length);
  return left.map((value, index) => value ^ right[index]);
};
const results = [];
for (const side of ['first', 'last']) {
  const pad = words.flatMap(word => side === 'first' ? word.slice(1) : word.slice(0, -1));
  assert.equal(pad.length, 75);
  for (const order of ['msb', 'lsb']) {
    const decoded = xor(ciphertext, pad);
    assert.deepEqual(xor(decoded, pad), ciphertext, 'lossless 75-rune source reconstruction');
    const planted = authentic.slice(0, 75);
    const plantCipher = xor(planted, pad);
    assert.deepEqual(xor(plantCipher, pad), planted,
      'genuine solved-GP positive plant survives 75 runes');
    const packet = serialize(decoded, order);
    assert.equal(packet.bytes.length, 46);
    assert.equal(packet.residual.length, 7);
    const printable = [...packet.bytes].filter(x => x >= 32 && x <= 126).length;
    const row = {
      side, bitEndianness: order, outputBytes: 46, residualBits: packet.residual,
      asciiPrintable: printable,
      prefixHex: packet.bytes.toString('hex').slice(0, 24),
      preview: [...packet.bytes].map(x => x >= 32 && x <= 126
        ? String.fromCharCode(x) : '.').join('')
    };
    assert.ok(printable <= 21, 'original should not resemble direct ASCII prose');
    results.push(row);
  }
}
assert.deepEqual(results.map(x => x.asciiPrintable), [16, 18, 15, 20]);
console.log(JSON.stringify({
  source: 'original p55 body75; four source-bounded p57 one-edge GP29-XOR bit readings',
  results, authenticPlant: '75/75 each orientation',
  decision: 'none emits direct printable ASCII or a self-identifying binary payload'
}, null, 2));
