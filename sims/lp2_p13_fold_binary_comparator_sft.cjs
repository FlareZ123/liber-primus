'use strict';

/**
 * Original-LP2 p13 physically motivated, fixed 136-pair binary-fold screen.
 * All input is read from the immutable local repository source corpus.
 * Node 22, CommonJS, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Reverse the second half of a 272-GP29-symbol input and compare opposite
 * positions in first-to-last source order. GP29 indices and GP primes
 * have the same strict order. Equal symbols produce zero.
 *
 * @param {number[]} indices
 * @returns {{bytes: Buffer, ties: number[], bits: number[]}}
 */
function foldToAscii(indices) {
  assert.equal(indices.length, 272, '136+136 original rune shape');
  const left = indices.slice(0, 136);
  const right = indices.slice(136).reverse();
  const bytes = Buffer.alloc(17);
  /** @type {number[]} */
  const ties = [];
  /** @type {number[]} */
  const bits = [];

  for (let i = 0; i < 136; i += 1) {
    const bit = Number(left[i] > right[i]);
    bits.push(bit);
    if (left[i] === right[i]) ties.push(i);
    bytes[i >>> 3] |= bit << (7 - (i & 7));
  }
  return { bytes, ties, bits };
}

/**
 * Synthetic fully reversible carrier positive on a single fixed ASCII text.
 * The two symbols 0 and 1 are valid members of the original GP29 alphabet.
 * @param {Buffer} plain
 * @returns {number[]}
 */
function encodePositive(plain) {
  assert.equal(plain.length, 17);
  const left = Array(136).fill(0);
  const rightFolded = Array(136).fill(0);
  for (let i = 0; i < 136; i += 1) {
    const bit = (plain[i >>> 3] >>> (7 - (i & 7))) & 1;
    left[i] = bit;
    rightFolded[i] = 1 - bit;
  }
  return left.concat(rightFolded.reverse());
}

/** @type {{pages:Array<{page:number,indices:number[]}>}} */
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const source = corpus.pages.find((p) => p.page === 13);
assert(source, 'Original LP2 physical page13 must exist');
const original = foldToAscii(source.indices);

assert.deepEqual(original.ties, [12, 34, 45, 99]);
assert.equal(original.bytes.toString('hex'), '12d213b110b092d660adaada0f6336e886');
const printable = Array.from(original.bytes).filter((n) => n >= 32 && n <= 126).length;
assert.equal(printable, 3);

const planted = Buffer.from('HELLO FROM CICADA', 'ascii');
const synthetic = foldToAscii(encodePositive(planted));
assert.equal(synthetic.bytes.toString('ascii'), 'HELLO FROM CICADA');
assert.deepEqual(synthetic.ties, []);

console.log('p13 physical source: 272 GP29 runes -> 136 fold comparisons -> 17 bytes');
console.log('original tie positions (zero-based):', original.ties.join(','));
console.log('original output hex:', original.bytes.toString('hex'));
console.log('original printable ASCII:', printable + '/17');
console.log('original rendering:', Array.from(original.bytes, (v) =>
  v >= 32 && v <= 126 ? String.fromCharCode(v) : '.'
).join(''));
console.log('synthetic planted positive:', synthetic.bytes.toString('ascii'));
console.log('PASS: frozen source-only fold comparison; no plaintext recovered.');
