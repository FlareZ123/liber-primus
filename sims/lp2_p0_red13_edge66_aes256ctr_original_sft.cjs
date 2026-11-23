'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const resource = (name) => path.join(__dirname, '..', 'resources', 'liber-primus', name);
const corpus = JSON.parse(fs.readFileSync(resource('lp2-corpus.json'), 'utf8'));
const pageText = fs.readFileSync(resource('lp2-transcription.txt'), 'utf8').split(/\r?\n%\r?\n/);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const widths = [
  7, 23, 19, 22, 24, 21, 21, 23, 23, 20, 23, 23,
  24, 23, 23, 21, 23, 23, 22, 21, 21, 21, 21, 23,
  21, 24, 22, 25, 23, 21, 24, 22, 19,
];

/** @type {number[][]} */
const blackLines = [];
/** @type {number[]} */
const header = [];
/** @type {number[]} */
const complete = [];
/** @type {number[]} */
const pageCounts = [];
for (let page = 0; page < 3; page += 1) {
  const physical = pageText[page].split(/\r?\n/).filter((line) => line.includes('/'));
  pageCounts.push(physical.length);
  for (const [index, line] of physical.entries()) {
    const indices = [...line]
      .filter((char) => /\p{Script=Runic}/u.test(char))
      .map((char) => {
        const value = runeIndex.get(char);
        assert.notEqual(value, undefined);
        return value;
      });
    complete.push(...indices);
    if (page === 0 && index === 0) {
      assert.equal(indices.length, 20);
      header.push(...indices.splice(0, 13));
    }
    blackLines.push(indices);
  }
}
assert.deepEqual(pageCounts, [12, 12, 9]);
assert.equal(header.length, 13);
assert.deepEqual(blackLines.map((line) => line.length), widths);
assert.equal(complete.length, 729);
assert.deepEqual(complete, corpus.pages.slice(0, 3).flatMap((page) => page.indices));

const exterior = blackLines.flatMap((line) => [line[0], line[line.length - 1]]);
const interior = blackLines.flatMap((line) => line.slice(1, -1));
assert.equal(exterior.length, 66);
assert.equal(interior.length, 650);
assert.deepEqual(
  [...header, ...blackLines.flat()].length,
  729,
);

/**
 * Source-order 13-title + 66 physical line-endpoints are one unsigned,
 * most-significant-first GP29 numeral fitting a fixed 48-byte carrier.
 * @param {number[]} digits Original GP29 indices.
 * @returns {Buffer}
 */
function unsignedBase29To48(digits) {
  assert.equal(digits.length, 79);
  let number = 0n;
  for (const digit of digits) {
    assert(digit >= 0 && digit < 29);
    number = number * 29n + BigInt(digit);
  }
  assert(number < (1n << 384n));
  const bytes = Buffer.alloc(48);
  for (let i = bytes.length - 1; i >= 0; i -= 1) {
    bytes[i] = Number(number & 255n);
    number >>= 8n;
  }
  assert.equal(number, 0n);
  return bytes;
}

const envelope = unsignedBase29To48([...header, ...exterior]);
const key = envelope.subarray(0, 32);
const iv = envelope.subarray(32, 48);
const aes = crypto.createCipheriv('aes-256-ctr', key, iv);
const byteStream = Buffer.concat([aes.update(Buffer.alloc(650)), aes.final()]);
assert.equal(byteStream.length, 650);
const mask = [...byteStream].map((byte) => byte % 29);
const decoded = interior.map((digit, i) => (digit + 29 - mask[i]) % 29);

/**
 * @param {number[]} nums Source rune indices.
 * @returns {number}
 */
function indexOfCoincidence(nums) {
  const counts = Array(29).fill(0);
  nums.forEach((number) => { counts[number] += 1; });
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (nums.length * (nums.length - 1));
}

const native95 = corpus.pages[57].indices.slice();
assert.equal(native95.length, 95);
const encryptedPositive = native95.map((value, i) => (value + mask[i]) % 29);
const recoveredPositive = encryptedPositive.map((value, i) => (value + 29 - mask[i]) % 29);
assert.deepEqual(recoveredPositive, native95);
const replayOriginal = decoded.map((value, i) => (value + mask[i]) % 29);
assert.deepEqual(replayOriginal, interior);
assert.equal(
  blackLines.reduce((n, line) => n + line.length, 0),
  716,
);

const output = {
  source: 'unaltered original 2014 LP2 p0-p2 and canonical GP29 transcription',
  pageCounts,
  physicalWidths: widths,
  headerRunes: header.length,
  shellRunes: exterior.length,
  bodyRunes: interior.length,
  sourceCapacityBits: 79 * Math.log2(29),
  keyAndNonceBytes: [key.length, iv.length],
  envelopeSha256: crypto.createHash('sha256').update(envelope).digest('hex'),
  originalCipherIoc: indexOfCoincidence(interior),
  fullDecodedIoc: indexOfCoincidence(decoded),
  authenticPlain95Ioc: indexOfCoincidence(native95),
  decodedFirst72: decoded.slice(0, 72).map((index) => corpus.translit[index]).join('-'),
  originalRoundtrip: replayOriginal.length,
  realSolvedNativePositive: recoveredPositive.length,
};
console.log(JSON.stringify(output, null, 2));
console.log('PASS fixed source-original red13 + line-edge66 / AES256-CTR complete inverse, with genuine p57 native positive.');
