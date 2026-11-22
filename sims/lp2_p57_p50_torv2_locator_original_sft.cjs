'use strict';

/**
 * Original-source single-file test: LP2 pp49–51 Tor-v2-shaped external locator.
 * Run with Node.js 22; reads committed source files and performs no writes.
 * The tested SHA-1 of arbitrary source bytes is a candidate locator operation,
 * NOT the actual Tor-v2 onion-service identity construction, which hashes DER.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {number[][]} ByteGrid */
const root = path.resolve(__dirname, '..');
/** @type {ByteGrid} */
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
)).byte_rows;
assert.equal(grid.length, 32);
for (const row of grid) {
  assert.equal(row.length, 8);
  assert(row.every((value) => Number.isInteger(value) && value >= 0 && value <= 255));
}
const full = Buffer.from(grid.flat());
const sourceSha256 = crypto.createHash('sha256').update(full).digest('hex');
assert.equal(sourceSha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const rim = [];
for (let col = 0; col < 8; col++) rim.push(grid[0][col]);
for (let row = 1; row < 32; row++) rim.push(grid[row][7]);
for (let col = 6; col >= 0; col--) rim.push(grid[31][col]);
for (let row = 30; row >= 1; row--) rim.push(grid[row][0]);
const inner = grid.slice(1, 31).flatMap((row) => row.slice(1, 7));
assert.equal(rim.length, 76);
assert.equal(inner.length, 180);
assert.deepEqual(rim.slice(12, 19), [76, 80, 51, 108, 82, 65, 35]);
assert.equal(Buffer.from(rim.slice(12, 19)).toString('ascii'), 'LP3lRA#');

const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';

/**
 * RFC 4648 Base32 on exactly ten input bytes, yielding a Tor-v2-shaped name.
 * @param {Uint8Array} bytes Ten bytes
 * @returns {string} Sixteen alphabetic/base32 characters without padding
 */
function base32Name(bytes) {
  assert.equal(bytes.length, 10);
  let output = '';
  for (let i = 0; i < 16; i++) {
    let value = 0;
    for (let bit = 0; bit < 5; bit++) {
      const offset = i * 5 + bit;
      value = (value << 1) | ((bytes[Math.floor(offset / 8)] >>> (7 - offset % 8)) & 1);
    }
    output += alphabet[value];
  }
  return output;
}
assert.equal(base32Name(crypto.createHash('sha1').update('abc').digest().subarray(0, 10)),
  'vgmt4nsha2awvor6');
assert.equal(base32Name(Uint8Array.from({length: 10}, (_, i) => i)),
  'aaaqeayeaudaocaj');

/**
 * Hypothetical address syntax from first 80 bits of SHA-1 of a byte packet.
 * @param {number[] | Buffer} packet Original packet bytes
 * @returns {string} Candidate label
 */
function hashName(packet) {
  return base32Name(crypto.createHash('sha1').update(Buffer.from(packet)).digest().subarray(0, 10));
}
const addresses = {
  sha1Full256: hashName(full),
  sha1Rim76: hashName(rim),
  sha1Inner180: hashName(inner),
  rim13Low5: rim.slice(12, 28).map((value) => alphabet[value % 32]).join('')
};
assert.deepEqual(addresses, {
  sha1Full256: 'bcjuvasvlwkakqiy',
  sha1Rim76: 'z4auimwpz54soxx5',
  sha1Inner180: '7qblu5rrapgmaf6v',
  rim13Low5: 'mqtmsbdotybly5yy'
});

const historicalText = fs.readFileSync(
  path.join(root, 'resources', 'external', '2014-09-stage11-period-onion-hosts.txt'), 'utf8'
);
const archived = new Set(historicalText.split(/\r?\n/)
  .map((line) => line.trim().toLowerCase().replace(/\.onion$/, ''))
  .filter((label) => /^[a-z2-7]{16}$/.test(label)));
assert.equal(archived.size, 3173);
const firstPartyDelivery = 'ky2khlqdf7qdznac';
const checks = Object.entries(addresses).map(([reading, label]) => ({
  reading,
  label,
  matchesFirstPartyDelivery: label === firstPartyDelivery,
  matchesArchivedHost: archived.has(label)
}));
assert(checks.every((entry) => !entry.matchesFirstPartyDelivery && !entry.matchesArchivedHost));

console.log(JSON.stringify({
  originalSha256: sourceSha256,
  rim13IndexZeroBased: 12,
  rim13Bytes: rim.slice(12, 28),
  firstPartyDelivery,
  archiveValidUniqueHosts: archived.size,
  archiveContainsFirstPartyDelivery: archived.has(firstPartyDelivery),
  checks,
  outcome: 'no first-party or archived 2014 service matched under these fixed address readers'
}, null, 2));
