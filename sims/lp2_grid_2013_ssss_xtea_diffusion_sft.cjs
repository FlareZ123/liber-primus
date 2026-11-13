'use strict';

/**
 * Original LP2 pp49-51 table through the 2013 ssss 0.5
 * zero-key XTEA secret diffusion, without tuned keys or phases.
 *
 * Run from repository root: node sims/lp2_grid_2013_ssss_xtea_diffusion_sft.cjs
 * Output is source-exact and checked by the authentic 2013 onion regression.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/base60-grid.json'), 'utf8'
));
const table = grid.byte_rows.flat();
const sha256 = values => crypto.createHash('sha256').update(Buffer.from(values)).digest('hex');
assert.equal(table.length, 256);
assert.equal(grid.byte_rows.length, 32);
assert.equal(sha256(table), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * One 32-round unkeyed TEA diffusion, exactly as in historical ssss 0.5.
 * @param {number} a 32-bit unsigned left word
 * @param {number} b 32-bit unsigned right word
 * @param {boolean} inverse
 * @returns {[number, number]}
 */
function xtea(a, b, inverse) {
  let sum = inverse ? 0xc6ef3720 : 0;
  for (let j = 0; j < 32; j++) {
    if (inverse) {
      b = (b - (((((a << 4) ^ (a >>> 5)) + a) ^ sum) >>> 0)) >>> 0;
      sum = (sum - 0x9e3779b9) >>> 0;
      a = (a - (((((b << 4) ^ (b >>> 5)) + b) ^ sum) >>> 0)) >>> 0;
    } else {
      a = (a + (((((b << 4) ^ (b >>> 5)) + b) ^ sum) >>> 0)) >>> 0;
      sum = (sum + 0x9e3779b9) >>> 0;
      b = (b + (((((a << 4) ^ (a >>> 5)) + a) ^ sum) >>> 0)) >>> 0;
    }
  }
  return [a, b];
}

/**
 * Historical ssss 0.5 whole-secret byte diffusion.
 * Handles even byte lengths, including source 22/32/256-byte cases.
 * @param {number[]} input
 * @param {boolean} inverse true: encoded secret to plaintext
 * @returns {number[]}
 */
function transform(input, inverse) {
  assert.ok(input.length >= 8 && input.length % 2 === 0);
  const n = input.length;
  let number = BigInt('0x' + Buffer.from(input).toString('hex'));
  const buffer = new Uint8Array(n);
  for (let i = 0; i < n; i += 2) {
    const word = Number(number & 65535n);
    buffer[i] = word >>> 8;
    buffer[i + 1] = word & 255;
    number >>= 16n;
  }
  assert.equal(number, 0n);
  for (let t = 0; t < 40 * n; t += 2) {
    const k = inverse ? 40 * n - 2 - t : t;
    let a = 0, b = 0;
    for (let j = 0; j < 4; j++) {
      a = ((a << 8) | buffer[(k + j) % n]) >>> 0;
      b = ((b << 8) | buffer[(k + 4 + j) % n]) >>> 0;
    }
    [a, b] = xtea(a, b, inverse);
    for (let j = 0; j < 4; j++) {
      buffer[(k + j) % n] = (a >>> (24 - 8 * j)) & 255;
      buffer[(k + j + 4) % n] = (b >>> (24 - 8 * j)) & 255;
    }
  }
  let outNum = 0n;
  for (let i = n - 2; i >= 0; i -= 2) {
    outNum = (outNum << 16n) | BigInt(buffer[i] * 256 + buffer[i + 1]);
  }
  const output = Array(n);
  for (let i = n - 1; i >= 0; i--) {
    output[i] = Number(outNum & 255n);
    outNum >>= 8n;
  }
  assert.equal(outNum, 0n);
  return output;
}

/** @param {number[]} bytes */
function profile(bytes) {
  const printable = bytes.filter(b => b >= 32 && b < 127).length;
  const zeros = bytes.filter(b => b === 0).length;
  let longestPrintable = 0, current = 0;
  for (const b of bytes) {
    current = b >= 32 && b < 127 ? current + 1 : 0;
    longestPrintable = Math.max(longestPrintable, current);
  }
  return {
    sha256: sha256(bytes),
    printable, zeros, longestPrintable,
    ascii: bytes.map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : '.').join(''),
    first32Hex: Buffer.from(bytes.slice(0, 32)).toString('hex')
  };
}

const historicCipher = Array.from(Buffer.from(
  '65b9c4065cc47a4a48e01d17de166a94252dfbb44e69', 'hex'
));
const historicPlain = transform(historicCipher, true);
assert.equal(Buffer.from(historicPlain).toString('utf8'), 'p7amjopgric7dfdi.onion');
assert.deepEqual(transform(historicPlain, false), historicCipher);

const whole = transform(table, true);
assert.deepEqual(transform(whole, false), table);
const columns = Array.from({length: 8}, (_, col) =>
  grid.byte_rows.map(row => row[col])
);
const columnResults = columns.map((input, i) => {
  const output = transform(input, true);
  assert.deepEqual(transform(output, false), input);
  return {column: i + 1, ...profile(output)};
});
console.log(JSON.stringify({
  source: 'pp49-51 full 32x8 printed table / conventional base60 bytes',
  sourceSha256: sha256(table),
  genuine2013OnionControl: Buffer.from(historicPlain).toString('utf8'),
  tableWhole2048bit: profile(whole),
  eightPrinted256bitColumns: columnResults,
  roundtrip: 'all 9 original inputs plus genuine 2013 control exact'
}, null, 2));
