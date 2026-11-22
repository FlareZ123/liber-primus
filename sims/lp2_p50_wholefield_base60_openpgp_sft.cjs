/** Source-printed p49–51, all 256 cells as one big-endian base60 numeral. */
'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const grid = JSON.parse(readFileSync(join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));

/** @param {string[]} tokens @returns {Buffer} */
function decode(tokens) {
  assert.equal(tokens.length, 256);
  let value = 0n;
  for (const token of tokens) {
    assert.equal(token.length, 2);
    for (const character of token) {
      const digit = alphabet.indexOf(character);
      assert.ok(digit >= 0);
      value = value * 60n + BigInt(digit);
    }
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

/** @param {Buffer} bytes @returns {string[]} */
function encode(bytes) {
  let value = BigInt('0x' + bytes.toString('hex'));
  const digits = new Array(512).fill('0');
  for (let i = digits.length - 1; i >= 0; i--) {
    digits[i] = alphabet[Number(value % 60n)];
    value /= 60n;
  }
  assert.equal(value, 0n);
  const tokens = [];
  for (let i = 0; i < 512; i += 2) tokens.push(digits[i] + digits[i + 1]);
  return tokens;
}

/** @param {Buffer} bytes @returns {string} */
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

/**
 * The original stops at RFC4880's mandatory first-header check. A small
 * explicit tag-11 parser also exercises packet and literal-body lengths
 * on the planted positive. This is not a full OpenPGP parser.
 * @param {Buffer} bytes
 * @returns {{valid:boolean,reason?:string,tag?:number,payload?:string}}
 */
function firstPacket(bytes) {
  if (!bytes.length) return { valid: false, reason: 'Empty stream' };
  if (!(bytes[0] & 0x80))
    return { valid: false, reason: 'RFC4880 section 4.2: first packet tag high bit zero, octet 0x' + bytes[0].toString(16).padStart(2, '0') };
  if (!(bytes[0] & 0x40))
    return { valid: false, reason: 'Old packet format not implemented in positive-only parser' };
  if (bytes.length < 2) return { valid: false, reason: 'Truncated new header' };
  const tag = bytes[0] & 0x3f;
  const bodyLength = bytes[1];
  if (bodyLength >= 192) return { valid: false, reason: 'Long/partial length unsupported in positive-only parser' };
  if (bytes.length !== bodyLength + 2) return { valid: false, reason: 'Packet length mismatch' };
  if (tag !== 11) return { valid: false, reason: 'Positive-only parser expects literal tag 11' };
  const body = bytes.subarray(2);
  if (body.length < 6 || body[0] !== 0x62 || body[1] !== 0 || !body.subarray(2, 6).equals(Buffer.alloc(4)))
    return { valid: false, reason: 'Invalid planted literal body' };
  return { valid: true, tag, payload: body.subarray(6).toString('ascii') };
}

assert.equal(grid.alphabet, alphabet);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
const sourceTokens = grid.rows.flat();
assert.equal(sourceTokens.length, 256);
const sourceBytes = grid.byte_rows.flat();
for (const [i, token] of sourceTokens.entries())
  assert.equal(60 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]), sourceBytes[i], 'cell ' + i);
const original = decode(sourceTokens);
const invalid = firstPacket(original);
assert.equal(original.length, 378);
assert.equal(original[0], 0x12);
assert.equal(invalid.valid, false);
assert.ok(invalid.reason.includes('high bit zero'));
assert.deepEqual(encode(original), sourceTokens);

// Independent direct cellwise-byte (not wholefield) packet check: the first
// two bytes resemble a real OpenPGP new tag-11 partial-length header. Test
// its required literal format and complete packet boundaries, not just GnuPG
// process exit status (GnuPG tolerantly lists mode ? for this malformed body).
const cellwise = Buffer.from(grid.byte_rows.flat());
assert.equal(cellwise.length, 256);
assert.equal(cellwise[0], 0xcb); // New-format tag 11: literal data
assert.equal(cellwise[1], 0xe7); // Partial body 2**7 = 128 octets
assert.equal(cellwise[2], 0xa7); // Invalid literal data format, not b/t/u
assert.ok(![0x62, 0x74, 0x75].includes(cellwise[2]));
const secondLengthIndex = 2 + (1 << (cellwise[1] & 31));
assert.equal(secondLengthIndex, 130);
assert.equal(cellwise[secondLengthIndex], 0x56); // Final 86-octet segment
const followingHeaderIndex = secondLengthIndex + 1 + cellwise[secondLengthIndex];
assert.equal(followingHeaderIndex, 217);
assert.equal(cellwise[followingHeaderIndex], 0xdb); // New-format tag 27
assert.equal(cellwise[followingHeaderIndex + 1], 0x94); // Body requires 148 bytes
assert.equal(cellwise.length - followingHeaderIndex - 2, 37); // 111 missing

// Complete positive RFC4880 new-format literal packet containing "OK".
// Values in this planted radix-60 field need not be 0..255 like the source.
const planted = Buffer.from('cb086200000000004f4b', 'hex');
const plantedTokens = encode(planted);
assert.deepEqual(decode(plantedTokens), planted);
assert.deepEqual(firstPacket(planted), { valid: true, tag: 11, payload: 'OK' });

console.log(JSON.stringify({
  original: {
    cells: 256, digits: 512, bytes: original.length,
    sha256: sha256(original),
    prefixHex: original.subarray(0, 16).toString('hex'),
    suffixHex: original.subarray(-16).toString('hex'),
    packet: invalid
  },
  directCellwise: {
    byteLength: cellwise.length,
    sha256: sha256(cellwise),
    packet0Tag: 11,
    packet0PartialOctets: 128,
    literalFormatHex: cellwise[2].toString(16),
    terminalBodyOctets: 86,
    nextHeaderOffset: followingHeaderIndex,
    nextTag: cellwise[followingHeaderIndex] & 63,
    nextDeclaredBodyOctets: cellwise[followingHeaderIndex + 1],
    nextAvailableBodyOctets: cellwise.length - followingHeaderIndex - 2,
    outcome: "INVALID literal format and truncated next packet"
  },
  plantedPositive: {
    cells: plantedTokens.length,
    packetHex: planted.toString('hex'),
    sha256: sha256(planted),
    packet: firstPacket(planted)
  }
}, null, 2));
