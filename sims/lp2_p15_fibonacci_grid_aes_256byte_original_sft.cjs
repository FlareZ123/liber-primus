'use strict';

/**
 * Original-source p15 Fibonacci number-square -> AES key candidate for p49-p51.
 * Read-only, Node 22 CommonJS standalone file. This tests a bounded hypothesis,
 * not an authenticated Cicada operation or a generic key search.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const table = JSON.parse(fs.readFileSync(path.join(projectRoot, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const bytes = Buffer.from(table.bytes);
const hash = (b) => crypto.createHash('sha256').update(b).digest('hex');
assert.equal(bytes.length, 256);
assert.equal(hash(bytes), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Native p15 printed square, as read from original 32.jpg (four rows).
const printed = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820,
];

// Proven p15 central-out clockwise Fibonacci/prime spiral starting at red3299.
const spiral = [
  3299, 3298, 3296, 3294,
  3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472,
  1820, 708, 1206, 4516,
];
assert.equal(new Set(printed).size, 16);
assert.deepEqual([...printed].sort((a, b) => a - b), [...spiral].sort((a, b) => a - b));

/** @param {Buffer} key @param {Buffer} input @param {boolean} encrypt */
function aes(key, input, encrypt) {
  const cipher = encrypt
    ? crypto.createCipheriv('aes-' + (8 * key.length) + '-ecb', key, null)
    : crypto.createDecipheriv('aes-' + (8 * key.length) + '-ecb', key, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input), cipher.final()]);
}

/** @param {number[]} nums */
function packedBcd(nums) {
  return Buffer.from(nums.map((n) => String(n).padStart(4, '0')).join(''), 'hex');
}

/** @param {Buffer} buf */
function readableCount(buf) {
  let printable = 0;
  let run = 0;
  let longest = 0;
  for (const x of buf) {
    if ((x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13) {
      printable++;
      longest = Math.max(longest, ++run);
    } else {
      run = 0;
    }
  }
  return { printable, longest };
}

const expected = [
  ['spiral', 'aes-256-bcd', '9533939ec4efd387238051f2412b62df2dec4d52a27b17d0bf1dde6662cfb40f', 103],
  ['spiral', 'aes-128-mod256', 'a7134f88306701dab94e10ab68f4fa250a42001d3f1c0cc0e4d69dc8bdcff970', 90],
  ['printed', 'aes-256-bcd', 'b1f53f1488c657d831782e9e44ed7e7220a949d18c1e59c7f72f1fe010222e08', 96],
  ['printed', 'aes-128-mod256', '34d1a2d05dabba57d0f170958b9c3ea76958d28fbcd64e97c70d5066fa631526', 104],
];

for (const [order, algorithm, expectedHash, expectedPrintable] of expected) {
  const nums = order === 'spiral' ? spiral : printed;
  const key = algorithm === 'aes-256-bcd'
    ? packedBcd(nums)
    : Buffer.from(nums.map((n) => n % 256));
  assert.equal(key.length, algorithm === 'aes-256-bcd' ? 32 : 16);

  // Check exact algorithm implementation on a known source-size plaintext.
  const control = Buffer.from('ORIGINAL CICADA POSITIVE CONTROL. '.repeat(8).slice(0, 256), 'ascii');
  assert.equal(control.length, 256);
  assert.deepEqual(aes(key, aes(key, control, true), false), control);

  const decoded = aes(key, bytes, false);
  assert.deepEqual(aes(key, decoded, true), bytes);
  assert.equal(hash(decoded), expectedHash);
  const { printable, longest } = readableCount(decoded);
  assert.equal(printable, expectedPrintable);
  console.log(JSON.stringify({
    order, algorithm, keyHex: key.toString('hex'), decodedSha256: hash(decoded),
    printableOf256: printable, longestPrintableRun: longest,
    first32Hex: decoded.subarray(0, 32).toString('hex'),
    status: 'No visually recognizable full 256-byte ASCII/plaintext payload',
  }));
}
console.log('PASS: 4 original-source AES candidate inverses, all round-trip and positive controls');
