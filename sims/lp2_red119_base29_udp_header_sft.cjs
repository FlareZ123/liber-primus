'use strict';

/**
 * Source-locked UDP-header gate on the two 119-rune paragraphs enclosed by
 * the original LP2 p3/p39 red-13 marks at rune offset 119.
 * Node.js 22 CommonJS; run from anywhere inside this repository.
 *
 * The signed 2013 BASE29 example supplies the 0..28 digits and
 * 3301 = 3*29^2 + 26*29 + 24. The p3/p39 red Atbash readouts
 * SCY/SKY and UDP motivate looking for a network packet, without
 * authorizing any arbitrary byte permutation or packet re-framing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));

const PREFIX_RUNES = 119;
const UDP_HEADER_BYTES = 8;
const OUTPUT_BYTES = 73;
const tests = [
  { page: 3, variant: 'original', first32: '0303a98d2c66cbccb9b60e3ccd98a31665f18d1c0c8e68f8f8621215f793ecf4', length: 11366 },
  { page: 3, variant: 'atbash', first32: '0145a27e7e85358ff1a6028f75e315648d2813e744626953a09c08de1b83847a', length: 32389 },
  { page: 39, variant: 'original', first32: '0240ce33c8df038466b845ff5da9e9ab8fcc2269142290b28e1fe8a457d3fa1c', length: 51423 },
  { page: 39, variant: 'atbash', first32: '02087dd7e20cfdd844a3cacce5d1cecf634d7e9a3cce419a0ade324fbb437753', length: 57868 },
];

/**
 * Return the unsigned base-29 digit stream as a minimal big-endian byte array.
 * @param {number[]} digits - GP29 ordinals, most-significant rune first.
 * @returns {Buffer}
 */
function decodeBase29(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = 29n * value + BigInt(digit);
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

/**
 * Inverse for a fixed count of source GP29 symbols.
 * @param {Buffer} bytes - Unsigned big-endian byte integer.
 * @param {number} count - Fixed rune count.
 * @returns {number[]}
 */
function encodeBase29(bytes, count) {
  let value = BigInt('0x' + bytes.toString('hex'));
  const digits = new Array(count).fill(0);
  for (let i = count - 1; i >= 0; i--) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n, 'packet exceeds available base29 digits');
  return digits;
}

/**
 * Parse a packet beginning directly with a standard UDP header.
 * @param {Buffer} bytes - Exact complete packet candidate.
 * @returns {{sourcePort:number,destinationPort:number,length:number,checksum:number,complete:boolean}}
 */
function udpHeader(bytes) {
  assert(bytes.length >= UDP_HEADER_BYTES);
  const length = bytes.readUInt16BE(4);
  return {
    sourcePort: bytes.readUInt16BE(0),
    destinationPort: bytes.readUInt16BE(2),
    length,
    checksum: bytes.readUInt16BE(6),
    complete: length === bytes.length,
  };
}

assert.equal(3 * 29 * 29 + 26 * 29 + 24, 3301);

// Positive control: independently construct one *complete* 73-byte UDP packet
// with a source-port value that keeps it representable in 119 base29 digits.
const positive = Buffer.alloc(OUTPUT_BYTES);
positive.writeUInt16BE(257, 0);
positive.writeUInt16BE(281, 2);
positive.writeUInt16BE(OUTPUT_BYTES, 4);
positive[72] = 0x42;
const positiveDigits = encodeBase29(positive, PREFIX_RUNES);
const positiveRoundtrip = decodeBase29(positiveDigits);
assert.deepEqual(positiveRoundtrip, positive);
assert.equal(udpHeader(positiveRoundtrip).complete, true);

for (const test of tests) {
  const page = corpus.pages.find((entry) => entry.page === test.page);
  const annotation = ink.pages.find((entry) => entry.page === test.page);
  assert(page && annotation);
  const span = annotation.red_spans.find((entry) => entry.start === PREFIX_RUNES && entry.length === 3);
  assert(span, 'original red triad must start at precisely 119');
  const bracket = annotation.large_punctuation.filter((entry) =>
    entry[1] === 13 && entry[2] === 'red' && (entry[0] === 119 || entry[0] === 122));
  assert.equal(bracket.length, 2, 'source-defined triad must have two red13 bounds');

  const first = page.indices.slice(0, PREFIX_RUNES);
  assert.equal(first.length, PREFIX_RUNES);
  const digits = test.variant === 'atbash' ? first.map((value) => 28 - value) : first;
  const bytes = decodeBase29(digits);
  assert.equal(bytes.length, OUTPUT_BYTES);
  assert.equal(bytes.subarray(0, 32).toString('hex'), test.first32);
  assert.deepEqual(encodeBase29(bytes, PREFIX_RUNES), digits);
  const header = udpHeader(bytes);
  assert.equal(header.length, test.length);
  assert.equal(header.complete, false);

  // Alternative literal signed BASE29 alphabet: one ASCII digit per rune.
  // This carries 119 bytes and has an unambiguous, invalid UDP length.
  const ascii = Buffer.from(digits.map((digit) => digit < 10 ? 48 + digit : 55 + digit));
  assert.equal(ascii.length, PREFIX_RUNES);
  const asciiHeader = udpHeader(ascii);
  assert.equal(asciiHeader.complete, false);
  console.log(JSON.stringify({
    sourcePage: test.page,
    transform: test.variant,
    packedBytes: bytes.length,
    networkHeader: header,
    alphabetAsciiBytes: ascii.length,
    asciiUdpLength: asciiHeader.length,
  }));
}
console.log('PASS: both source-enclosed 119-rune prefixes, two literal orientations, source-native positive UDP packet.');
