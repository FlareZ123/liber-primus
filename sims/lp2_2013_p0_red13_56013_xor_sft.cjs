#!/usr/bin/env node
'use strict';

/**
 * Original 2013 DATA/560.13 XOR operation at a single physical LP2 p0
 * red-heading-derived offset. A one-off source-conditioned inverse, not a
 * claim that Cicada selected the red-heading number as a byte address.
 * Usage: node sims/lp2_2013_p0_red13_56013_xor_sft.cjs path-to-DATA_560.13
 * Read-only, no candidate offset/key search. Node 22 CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const dataPath = process.argv[2];
assert.ok(dataPath, 'Historical DATA/560.13 path is required');
const data = fs.readFileSync(dataPath);
assert.equal(data.length, 118818811);
const padSha = createHash('sha256').update(data).digest('hex');
assert.equal(padSha, 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f');

const p0 = corpus.pages[0].indices;
assert.equal(p0.length, 262);
const heading = p0.slice(0, 13);
const body = p0.slice(13);
assert.deepEqual(heading, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(body.length, 249);
const asBase29 = (digits) => digits.reduce((v, x) => v * 29n + BigInt(x), 0n);
const redNumeral = asBase29(heading);
assert.equal(redNumeral, 5412445423142629857n);
const byteOffset = Number(redNumeral % BigInt(data.length));
assert.equal(byteOffset, 69948647);

/**
 * Encode 0..28 GP indexes into one unsigned, MSB-first positional integer.
 * @param {number[]} digits
 * @returns {Buffer}
 */
function base29Bytes(digits) {
  let number = asBase29(digits);
  const width = Math.ceil(digits.length * Math.log2(29) / 8);
  const out = Buffer.alloc(width);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(number & 255n);
    number >>= 8n;
  }
  assert.equal(number, 0n);
  return out;
}

/** @param {Buffer} bytes @param {number} length @returns {number[]} */
function fromBase29Bytes(bytes, length) {
  let value = 0n;
  for (const b of bytes) value = (value << 8n) | BigInt(b);
  const out = Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n, 'byte data exceeded original base29 digit count');
  return out;
}

/** @param {number[]} digits @returns {Buffer} */
function packed5(digits) {
  const out = Buffer.alloc(Math.ceil(digits.length * 5 / 8));
  let bit = 0;
  for (const v of digits) {
    assert.ok(v >= 0 && v <= 28);
    for (let k = 4; k >= 0; k--) {
      if ((v >> k) & 1) out[bit >>> 3] |= 1 << (7 - (bit & 7));
      bit++;
    }
  }
  return out;
}

/** @param {Buffer} packed @param {number} count @returns {number[]} */
function unpack5(packed, count) {
  const out = [];
  let bit = 0;
  for (let i = 0; i < count; i++) {
    let value = 0;
    for (let j = 0; j < 5; j++) {
      value = (value << 1) | ((packed[bit >>> 3] >>> (7 - (bit & 7))) & 1);
      bit++;
    }
    assert.ok(value <= 28);
    out.push(value);
  }
  return out;
}

/**
 * XOR the source's consecutive bytes from one fixed byte offset.
 * @param {Buffer} input
 * @param {number} offset
 * @returns {Buffer}
 */
function xorPad(input, offset) {
  assert.ok(offset >= 0 && offset + input.length <= data.length);
  const out = Buffer.alloc(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] ^ data[offset + i];
  return out;
}

// Independent historic positive: exact real 2013 .onion recovery.
const historicalCipher = Buffer.from('28c07e1b102d4d5c4c1a376e064477e1416fcc94928765', 'hex');
const historicalPlain = Buffer.from('gbyh7znm6c7ezsmr.onion\n', 'ascii');
assert.deepEqual(xorPad(historicalCipher, 12821), historicalPlain);
assert.deepEqual(xorPad(historicalPlain, 12821), historicalCipher);
assert.deepEqual(fromBase29Bytes(base29Bytes(body), body.length), body);
assert.deepEqual(unpack5(packed5(body), body.length), body);

/** @param {Buffer} input */
function summarize(input) {
  let letters = 0, printable = 0, longest = 0, run = 0, highBit = 0;
  for (const x of input) {
    if (x >= 65 && x <= 90 || x >= 97 && x <= 122) letters++;
    if (x >= 32 && x <= 126) printable++;
    if (x & 128) highBit++;
    if (x === 32 || x >= 65 && x <= 90 || x >= 97 && x <= 122) {
      run++; longest = Math.max(run, longest);
    } else run = 0;
  }
  return {
    length: input.length, printable, letters, highBit,
    longestAsciiLetterOrSpaceRun: longest,
    first48Hex: input.subarray(0, 48).toString('hex'),
    first80AsciiVisual: [...input.subarray(0, 80)]
      .map((v) => v >= 32 && v <= 126 ? String.fromCharCode(v) : '.').join(''),
    sha256: createHash('sha256').update(input).digest('hex')
  };
}

const transports = [
  {name: 'GP29 index bytes', bytes: Buffer.from(body)},
  {name: 'whole body BASE29 MSB integer', bytes: base29Bytes(body)},
  {name: 'GP29 indexes MSB 5-bit packed', bytes: packed5(body)}
];
const output = transports.map(({name, bytes}) => {
  const result = xorPad(bytes, byteOffset);
  assert.deepEqual(xorPad(result, byteOffset), bytes);
  return {name, preXor: summarize(bytes), postXor: summarize(result)};
});

console.log(JSON.stringify({
  source: '2013 CicadaOS DATA/560.13 original bytes; authentic 2013 XOR positive passed',
  originalPhysicalPage: 0,
  headingRunes: 13,
  bodyRunes: body.length,
  headingBase29: redNumeral.toString(),
  fileBytes: data.length,
  fixedOffset: byteOffset,
  hypothesis: 'p0 red BASE29 numeral modulo original 2013 file length selects offset; original bytewise XOR',
  transports: output,
  caveat: 'Modulo-file-size selection is inferred, not an authenticated Cicada instruction',
}, null, 2));
