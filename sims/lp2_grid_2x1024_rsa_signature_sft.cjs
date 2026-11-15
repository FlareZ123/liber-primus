'use strict';

/**
 * Original LP2 256-byte table as a pair of 1024-bit RSA operands.
 * Windows Node.js 22; read-only single-file test, no third-party packages.
 * Run with optional resources/liber-primus/base60-grid.json path.
 * The original search is source-constrained. The independent genuine RSA
 * positive verifies the PKCS#1 v1.5 signature-block recognizer.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @param {Uint8Array} bytes @returns {bigint} */
function integer(bytes) {
  return BigInt('0x' + Buffer.from(bytes).toString('hex'));
}

/** @param {bigint} value @param {bigint} power @param {bigint} modulus @returns {bigint} */
function modPow(value, power, modulus) {
  let result = 1n;
  let base = value % modulus;
  for (let exponent = power; exponent > 0n; exponent >>= 1n) {
    if ((exponent & 1n) === 1n) result = result * base % modulus;
    base = base * base % modulus;
  }
  return result;
}

/** @param {bigint} value @param {number} count @returns {Buffer} */
function bytesBE(value, count) {
  return Buffer.from(value.toString(16).padStart(count * 2, '0'), 'hex');
}

/**
 * Standard minimum-eight-byte PKCS#1 v1.5 encoded block.
 * @param {Uint8Array} em
 * @returns {{type:number, data:Buffer}|null}
 */
function pkcs1(em) {
  if (em[0] !== 0 || (em[1] !== 1 && em[1] !== 2)) return null;
  const type = em[1];
  let i = 2;
  while (i < em.length && em[i] !== 0) {
    if (type === 1 && em[i] !== 255) return null;
    i++;
  }
  if (i - 2 < 8 || i === em.length) return null;
  return { type, data: Buffer.from(em.slice(i + 1)) };
}

/** @param {Uint8Array} input @returns {number} */
function longestGraphic(input) {
  let longest = 0;
  let current = 0;
  for (const value of input) {
    current = value >= 32 && value <= 126 ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}

// Genuine independent RSA-1024/SHA-256 signature, built and checked at runtime.
const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 1024, publicExponent: 65537 });
const message = Buffer.from('Authentic positive: the RSA test must recover its exact digest block.');
const signature = crypto.sign('sha256', message, keys.privateKey);
const modulus = integer(Buffer.from(keys.publicKey.export({ format: 'jwk' }).n, 'base64url'));
const decoded = bytesBE(modPow(integer(signature), 65537n, modulus), 128);
const planted = pkcs1(decoded);
assert.ok(planted && planted.type === 1, 'genuine RSA must yield valid type-1 padding');
const digest = crypto.createHash('sha256').update(message).digest();
const digestInfoSHA256 = Buffer.from('3031300d060960864801650304020105000420', 'hex');
assert.deepEqual(planted.data, Buffer.concat([digestInfoSHA256, digest]));
assert.equal(crypto.verify('sha256', message, keys.publicKey, signature), true);
assert.equal(pkcs1(Buffer.from('000100ff00', 'hex')), null);

const sourcePath = process.argv[2] || path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
assert.equal(source.byte_rows.length, 32);
for (const row of source.byte_rows) assert.equal(row.length, 8);
const rows = source.byte_rows;
const full = Buffer.from(rows.flat());
const hash = crypto.createHash('sha256').update(full).digest('hex');
assert.equal(hash, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @type {Record<string,[number[],number[]]>} */
const layouts = {
  'first-vs-last 16 full rows': [Array.from(full.subarray(0, 128)), Array.from(full.subarray(128, 256))],
  'left-vs-right four columns': [rows.flatMap(row => row.slice(0, 4)), rows.flatMap(row => row.slice(4))],
  'even-vs-odd full rows': [rows.filter((_, i) => i % 2 === 0).flat(), rows.filter((_, i) => i % 2 === 1).flat()],
  'even-vs-odd columns': [rows.flatMap(row => row.filter((_, i) => i % 2 === 0)), rows.flatMap(row => row.filter((_, i) => i % 2 === 1))]
};

let tests = 0;
let padded = 0;
let maxGraphic = 0;
let sourceValidRSAOperands = 0;
const sample = [];
for (const [layout, halves] of Object.entries(layouts)) {
  for (let role = 0; role < 2; role++) {
    for (const reverse of [false, true]) {
      const nBytes = reverse ? [...halves[role]].reverse() : halves[role];
      const sBytes = reverse ? [...halves[1 - role]].reverse() : halves[1 - role];
      const n = integer(nBytes);
      const s = integer(sBytes);
      for (const exponent of [3n, 65537n]) {
        const recovered = bytesBE(modPow(s, exponent, n), 128);
        if (pkcs1(recovered)) padded++;
        if ((n & 1n) === 1n && s < n) sourceValidRSAOperands++;
        maxGraphic = Math.max(maxGraphic, longestGraphic(recovered));
        if (layout === 'first-vs-last 16 full rows' && role === 0 && !reverse) {
          sample.push({ exponent: Number(exponent), prefix: recovered.toString('hex').slice(0, 20) });
        }
        tests++;
      }
    }
  }
}
assert.equal(tests, 32);
assert.equal(sourceValidRSAOperands, 10);
assert.equal(padded, 0);
assert.equal(maxGraphic, 6);
assert.deepEqual(sample, [
  { exponent: 3, prefix: '10ec95f43073b2de5ad7' },
  { exponent: 65537, prefix: 'ab4ed35bc794106c763b' }
]);
console.log(JSON.stringify({
  sourceSHA256: hash,
  originalLayouts: Object.keys(layouts),
  originalTrials: tests,
  sourceValidRSAOperands,
  validPkcs1Blocks: padded,
  longestConsecutivePrintableGraphicRun: maxGraphic,
  firstHalfFirstRole: sample,
  genuineRSA1024SHA256SignaturePositive: 'PASS'
}, null, 2));
