'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const data = Buffer.from(grid.bytes);
assert.equal(data.length, 256);
assert.equal(crypto.createHash('sha256').update(data).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {bigint} n @param {bigint} p @returns {number} */
function valuation(n, p) {
  let count = 0;
  while (n !== 0n && n % p === 0n) {
    count++;
    n /= p;
  }
  return count;
}

/** @param {bigint} number @returns {number[]} */
function toGp29(number) {
  assert(number > 0n);
  const digits = [];
  for (let n = number; n > 0n; n /= 29n) {
    digits.push(Number(n % 29n));
  }
  return digits.reverse();
}

/** Longest exact overlap, including original page joins; returns positions for verification.
 * @param {number[]} pattern @param {number[]} text
 * @returns {{length:number, patternOffset:number, textOffset:number}}
 */
function longestOverlap(pattern, text) {
  let previous = new Uint16Array(text.length + 1);
  let best = { length: 0, patternOffset: -1, textOffset: -1 };
  for (let i = 0; i < pattern.length; i++) {
    const current = new Uint16Array(text.length + 1);
    for (let j = 0; j < text.length; j++) {
      if (pattern[i] === text[j]) {
        const length = previous[j] + 1;
        current[j + 1] = length;
        if (length > best.length) {
          best = { length, patternOffset: i + 1 - length, textOffset: j + 1 - length };
        }
      }
    }
    previous = current;
  }
  return best;
}

const N = data.reduce((n, byte) => (n << 8n) + BigInt(byte), 0n);
const factors = [[2n, 4], [3n, 3], [7n, 1], [13n, 1], [29n, 1], [179n, 2]];
let F = 1n;
for (const [prime, exponent] of factors) {
  assert.equal(valuation(N, prime), exponent);
  F *= prime ** BigInt(exponent);
}
assert.equal(F, 36528277968n);
assert.equal(N % F, 0n);
const quotient = N / F;
assert.equal(quotient.toString(2).length, 2013);

// This is conditional on a factorization found from the complete table.
// It does not establish an independent checksum, because the final bytes
// were visible when the divisibility factors were selected.
const prefix = data.subarray(0, 252).reduce((n, byte) => (n << 8n) + BigInt(byte), 0n);
const fourByteMaximum = 1n << 32n;
assert(F > fourByteMaximum);
const recovered = (-prefix * fourByteMaximum % F + F) % F;
assert(recovered < fourByteMaximum);
assert.equal(recovered, BigInt(data.readUInt32BE(252)));
assert.equal(recovered, 0xb424bd50n);

const stream = corpus.pages
  .filter(page => page.page <= 55 && page.indices && page.indices.length)
  .flatMap(page => page.indices);
assert.equal(stream.length, 12956);
const digits = toGp29(quotient);
assert.equal(digits.length, 415);
const variants = [
  ['forward', digits],
  ['reverse', [...digits].reverse()],
  ['negated', digits.map(value => (29 - value) % 29)],
  ['reverse-negated', digits.map(value => (29 - value) % 29).reverse()],
];
const overlapResults = variants.map(([name, sequence]) => ({ name, ...longestOverlap(sequence, stream) }));
for (const result of overlapResults) assert.equal(result.length, 4);

console.log(JSON.stringify({
  status: 'PASS',
  sourceHash: crypto.createHash('sha256').update(data).digest('hex'),
  factor: F.toString(),
  quotientBits: quotient.toString(2).length,
  recoveredLastFour: recovered.toString(16).padStart(8, '0'),
  gp29DigitCount: digits.length,
  originalRuneCount: stream.length,
  overlaps: overlapResults,
  classification: 'retrospective factor identity and negative direct-GP29 reuse; no plaintext or key',
}, null, 2));
