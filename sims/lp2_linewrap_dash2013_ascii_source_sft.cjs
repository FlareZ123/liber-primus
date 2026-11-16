'use strict';
/**
 * Source-literal 2013 whitespace-ASCII transfer to the original LP2 physical
 * line-ending hyphen choice.  One exact bit per line, with no fitted offsets,
 * byte shifts, OCR, new cipher text, or resampled codebook.
 *
 * Node.js 22, Windows-compatible, read-only standalone test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename */
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const lp2 = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');

/**
 * The original printed minus/hyphen terminates a word, slash is a line wrap.
 * A line ending in "-/" therefore encodes 1, a line ending in "/" alone
 * encodes 0. All other punctuation and in-line dashes remain in the source.
 * @param {string} source
 * @returns {number[]}
 */
function lineBits(source) {
  return source.split(/\r?\n/).filter(s => s.endsWith('/'))
    .map(s => Number(s.endsWith('-/')));
}
/**
 * The authentic 2013 Cicada tab=1, space=0 whitespace channel uses
 * MSB-first 8-bit ASCII. Do not shift to other phases or fit an alphabet.
 * @param {number[]} source
 * @returns {Buffer}
 */
function asciiBytes(source) {
  const out = [];
  for (let i = 0; i + 8 <= source.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | source[i + j];
    out.push(v);
  }
  return Buffer.from(out);
}
assert.equal(asciiBytes([0, 1, 0, 0, 1, 0, 1, 1]).toString('ascii'), 'K');
const testString = [...Buffer.from('KEY', 'ascii')].flatMap(v =>
  Array.from({ length: 8 }, (_, j) => (v >> (7 - j)) & 1));
assert.equal(asciiBytes(testString).toString('ascii'), 'KEY');

const lp2Pages = lp2.split('%');
assert.equal(lp2Pages.length, 57, 'Source transcript omits rune-free p50');
const unknown = lineBits(lp2Pages.slice(0, 55).join('%'));
const solved = lineBits(lp2Pages.slice(55).join('%'));
const control = lineBits(lp1);
assert.equal(unknown.length, 594);
assert.equal(unknown.reduce((a, b) => a + b, 0), 107);
assert.equal(solved.length, 10);
assert.equal(solved.reduce((a, b) => a + b, 0), 0);
assert.equal(control.length, 152);
assert.equal(control.reduce((a, b) => a + b, 0), 34);

/** @param {number[]} bits */
function inspect(bits) {
  const bytes = asciiBytes(bits);
  return {
    bitCount: bits.length,
    oneBits: bits.reduce((a, b) => a + b, 0),
    wholeBytes: bytes.length,
    leftoverBits: bits.length % 8,
    printableBytes: [...bytes].filter(b => b >= 32 && b <= 126).length,
    first32Hex: bytes.subarray(0, 32).toString('hex'),
    asciiPreview: [...bytes].map(b => b >= 32 && b <= 126 ?
      String.fromCharCode(b) : '.').join('').slice(0, 120)
  };
}
const normal = inspect(unknown);
const complement = inspect(unknown.map(x => 1 - x));
console.log(JSON.stringify({
  channel: 'LP2 printed line end: hyphen before slash=1, otherwise0',
  source: '2013 authenticated-scheme tab/space MSB-first ASCII transfer',
  originalUnknown: normal,
  alternatePolarityOnly: complement,
  originalSolvedControl: inspect(solved),
  originalLP1Control: inspect(control)
}, null, 2));
