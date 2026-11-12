'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'));
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;

const ring = [67, 47, 19, 89, 53, 89, 107, 61, 37, 109, 107, 79, 41, 107, 17, 107];
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];

assert.equal(ring.reduce((a, b) => a + b, 0), 1136);
assert.equal(lengths.reduce((a, b) => a + b, 0), 75);
assert.equal(signed.length, 1136);
assert.equal(createHash('sha256').update(signed).digest('hex'),
  'fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010');
assert.equal(p55.length, 76);
assert.equal(p55[0], 21);
assert.equal(p57.length, 95);
const original = p55.slice(1);

/**
 * From each consecutive signed-message segment, take the specified word length
 * centered in that segment. The two choices differ for even-length words.
 * @param {0|1} convention Half-cell choice for even-length words.
 * @returns {Buffer} Exactly 75 historical bytes in printed word order.
 */
function centralKey(convention) {
  const extracts = [];
  let cursor = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const width = ring[i];
    const length = lengths[i];
    const offset = Math.floor((width - length + convention) / 2);
    extracts.push(signed.subarray(cursor + offset, cursor + offset + length));
    cursor += width;
  }
  assert.equal(cursor, signed.length);
  return Buffer.concat(extracts);
}

/**
 * Apply the historically demonstrated GP29 shift family.
 * @param {number[]} runes Canonical GP29 indices.
 * @param {Buffer} key Signed-message ASCII bytes.
 * @param {1|-1} sign Inverse shift direction.
 * @returns {number[]} Output GP29 indices.
 */
function shift(runes, key, sign) {
  assert.equal(runes.length, key.length);
  return runes.map((x, i) => ((x + sign * (key[i] % 29)) % 29 + 29) % 29);
}

/** @param {number[]} a GP indices. @returns {number} GP29 coincidence index. */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x] += 1;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

const outputs = [];
for (const convention of [0, 1]) {
  const key = centralKey(convention);
  assert.equal(key.length, 75);
  const planted = p57.slice(0, 75);
  for (const sign of [-1, 1]) {
    const cipher = shift(planted, key, -sign);
    assert.deepEqual(shift(cipher, key, sign), planted, 'authentic-GP native plant');
    const plaintext = shift(original, key, sign);
    assert.deepEqual(shift(plaintext, key, -sign), original, 'original ciphertext re-enciphers');
    outputs.push({
      convention: convention === 0 ? 'left-middle' : 'right-middle',
      inverseSign: sign,
      keyAscii: key.toString('utf8'),
      ioc: ioc(plaintext),
      gpText: plaintext.map((x) => corpus.translit[x]).join(''),
    });
  }
}
assert.ok(outputs.every((x) => x.ioc < 0.04 && !x.gpText.includes('DIVINITY')));
console.log(JSON.stringify({
  test: 'p32-ring1136-signed2016-wordcenter75-p55',
  originalGpIoc: ioc(original),
  outputs,
  conclusion: 'None of the four fixed original-cipher inverses yields identifiable plaintext.',
}, null, 2));
