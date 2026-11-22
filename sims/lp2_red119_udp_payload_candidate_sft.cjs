'use strict';

/**
 * Offline-only, source-frozen LP2 SKY/UDP payload hypothesis.
 *
 * Candidate handoff:
 * - Two unique 13-dot-bracketed original red triads: p3 -> SCY, p39 -> UDP
 *   under independently solved LP1 Gematria Primus Atbash.
 * - The repeated original p33-p39 cuneiform numbers 1033 and 3301 are
 *   considered as possible UDP port values, in both role assignments.
 * - The original pp49-p51 32x8 conventional-base60 table supplies exactly
 *   256 UDP application-payload bytes in physical printed order.
 *
 * NO network access. No live probes. This test proves only that the
 * proposed UDP payload envelope can be constructed exactly and that the
 * earlier tested raw table is not itself a complete standard datagram.
 *
 * Node.js 22: node sims/lp2_red119_udp_payload_candidate_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @template T @param {string} name @returns {T} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}

const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const atbash = indexes => indexes.map(i => corpus.translit[28 - i]).join('');
const p3 = corpus.pages.find(p => p.page === 3);
const p39 = corpus.pages.find(p => p.page === 39);
assert.deepEqual(p3.indices.slice(119, 122), [13, 23, 2]);
assert.deepEqual(p39.indices.slice(119, 122), [27, 5, 15]);
assert.equal(atbash(p3.indices.slice(119, 122)), 'SCY');
assert.equal(atbash(p39.indices.slice(119, 122)), 'UDP');

assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));

/** @param {string} token @returns {number} */
function byteValue(token) {
  assert.equal(token.length, 2);
  const hi = grid.alphabet.indexOf(token[0]);
  const lo = grid.alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  const byte = 60 * hi + lo;
  assert(byte >= 0 && byte <= 255);
  return byte;
}
const payload = Buffer.from(grid.rows.flat().map(byteValue));
assert.equal(payload.length, 256);
const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
assert.equal(payloadHash,
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(payload.subarray(0, 8).toString('hex'), 'cbe7a7ba61ed7eb7');

/**
 * A UDP application-payload envelope for IPv4.
 * Zero checksum is permitted for IPv4 UDP, but requires a legitimate
 * source IP when computing a nonzero full pseudoheader checksum.
 *
 * @param {number} src
 * @param {number} dst
 * @param {Buffer} data
 * @returns {Buffer}
 */
function envelope(src, dst, data) {
  const header = Buffer.alloc(8);
  header.writeUInt16BE(src, 0);
  header.writeUInt16BE(dst, 2);
  header.writeUInt16BE(8 + data.length, 4);
  header.writeUInt16BE(0, 6);
  return Buffer.concat([header, data]);
}

/** @param {Buffer} packet @returns {{src:number,dst:number,length:number}} */
function parse(packet) {
  assert(packet.length >= 8);
  const length = packet.readUInt16BE(4);
  assert.equal(length, packet.length);
  return {
    src: packet.readUInt16BE(0),
    dst: packet.readUInt16BE(2),
    length
  };
}

// Earlier ring/header tests correctly reject direct, unframed table bytes.
// Their byte-4/5 length field declares 25069 rather than 256.
assert.equal(payload.readUInt16BE(4), 25069);
assert.notEqual(payload.readUInt16BE(4), payload.length);

// Source supplies the two numbers, but no authenticated source/destination
// roles. Preserve the two fixed role assignments, with no port search.
const variants = [[1033, 3301], [3301, 1033]].map(([src, dst]) => {
  const packet = envelope(src, dst, payload);
  assert.deepEqual(parse(packet), {src, dst, length: 264});
  assert.deepEqual(packet.subarray(8), payload);
  const corrupted = Buffer.from(packet);
  corrupted.writeUInt16BE(263, 4);
  assert.throws(() => parse(corrupted));
  return {
    srcPort: src,
    dstPort: dst,
    ipVersion: 4,
    udpLengthBytes: packet.length,
    headerHex: packet.subarray(0, 8).toString('hex'),
    payloadSha256: payloadHash,
    packetSha256: crypto.createHash('sha256').update(packet).digest('hex')
  };
});

const result = {
  triadAtbash: [atbash(p3.indices.slice(119, 122)),
                atbash(p39.indices.slice(119, 122))],
  original256AsStandaloneUdp: false,
  validOfflineIpv4UdpPayloadEnvelopes: variants,
  sourceLimit: '2013 historical SKY host is not an authenticated 2014 UDP endpoint; source IP, response and historical key remain unknown',
  networkTransmissions: 0
};
console.log(JSON.stringify(result, null, 2));
module.exports = {envelope, parse, byteValue};
