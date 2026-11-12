'use strict';
/**
 * Direct base29-to-UDP header gate on the two source-marked LP2 red119 prefixes.
 *
 * Hypothesis only: GP29 rune indices are base29 digits; each first119-rune
 * prefix is a single big-endian integer, serialized to the minimum 73 bytes.
 * The p3/p39 red Atbash SKY/UDP cue selects the packet-family hypothesis,
 * but no original source selects this numeral-to-datagram interpretation.
 *
 * Original inputs: resources/liber-primus/lp2-corpus.json, physical pp3/39.
 * Node.js 22; no network calls and no runtime search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const DIGITS = 119;
const BYTES = 73;
const MODULUS = 29n ** BigInt(DIGITS);

/**
 * @param {number[]} digits Original GP29 indices in printed order.
 * @returns {Buffer}
 */
function toBytes(digits) {
  assert.equal(digits.length, DIGITS);
  let n = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    n = n * 29n + BigInt(digit);
  }
  assert(n < MODULUS);
  const hex = n.toString(16).padStart(BYTES * 2, '0');
  assert.equal(hex.length, BYTES * 2);
  return Buffer.from(hex, 'hex');
}

/**
 * @param {Buffer} bytes Exactly 73 source-shaped bytes.
 * @returns {number[]}
 */
function toDigits(bytes) {
  assert.equal(bytes.length, BYTES);
  let n = BigInt('0x' + bytes.toString('hex'));
  assert(n < MODULUS);
  const digits = Array(DIGITS).fill(0);
  for (let i = DIGITS - 1; i >= 0; i--) {
    digits[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return digits;
}

/**
 * UDP IPv4 header length is an unsigned big-endian 16-bit value at offset4.
 * @param {Buffer} packet
 * @returns {{sourcePort:number, destinationPort:number, length:number, checksum:number, isComplete:boolean}}
 */
function header(packet) {
  assert(packet.length >= 8);
  const length = packet.readUInt16BE(4);
  return {
    sourcePort: packet.readUInt16BE(0),
    destinationPort: packet.readUInt16BE(2),
    length,
    checksum: packet.readUInt16BE(6),
    isComplete: length === packet.length,
  };
}

const expected = {
  3: { sourcePort: 771, destinationPort: 43405, length: 11366, checksum: 52172, isComplete: false },
  39: { sourcePort: 576, destinationPort: 52787, length: 51423, checksum: 900, isComplete: false },
};
const result = {};
for (const page of [3, 39]) {
  const sourcePage = corpus.pages.find(p => p.page === page);
  assert(sourcePage);
  const original = sourcePage.indices.slice(0, DIGITS);
  const encoded = toBytes(original);
  assert.deepEqual(toDigits(encoded), original);
  const actual = header(encoded);
  assert.deepEqual(actual, expected[page]);
  result[page] = { byteLength: encoded.length, head16: encoded.subarray(0, 16).toString('hex'), ...actual };
}
assert.equal(result[3].head16, '0303a98d2c66cbccb9b60e3ccd98a316');
assert.equal(result[39].head16, '0240ce33c8df038466b845ff5da9e9ab');

// Synthetic 119-digit positive: a standard-length 73-byte UDP envelope.
const planted = Buffer.alloc(BYTES, 0x2a);
planted.writeUInt16BE(1033, 0);
planted.writeUInt16BE(3301, 2);
planted.writeUInt16BE(BYTES, 4);
planted.writeUInt16BE(0, 6);
assert.deepEqual(toBytes(toDigits(planted)), planted);
assert.equal(header(planted).isComplete, true);
const corrupted = Buffer.from(planted);
corrupted.writeUInt16BE(BYTES + 1, 4);
assert.equal(header(corrupted).isComplete, false);

console.log(JSON.stringify({status:'DIRECT-UDP-HEADER-NEGATIVE', pages:result, positivePlant:true}, null, 2));
