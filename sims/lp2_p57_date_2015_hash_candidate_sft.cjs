'use strict';
// Source-fixed p56 hash test for the 2015 PGP statement selected by the
// provisional p57 -> p50 date pointer. Run from repo root:
// node sims/lp2_p57_date_2015_hash_candidate_sft.cjs
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const sourcePath = process.argv[2] || 'resources/historical/cicada2015-planned-parenthood-denial.asc';
const source = fs.readFileSync(sourcePath);
const message = source.toString('ascii');
const gitBlobSha1 = crypto.createHash('sha1')
  .update(Buffer.from(`blob ${source.length}\\0`, 'ascii')).update(source).digest('hex');
assert.equal(source.length, 1202);
assert.equal(gitBlobSha1, 'f8fa3ee84e89c7e7bfa5b0b0f6f6c461e8e89812');

const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const algorithms = ['sha512', 'sha3-512', 'blake2b512'];
for (const a of algorithms) assert(crypto.getHashes().includes(a), `missing ${a}`);
const begin = '-----BEGIN PGP SIGNATURE-----';
const end = '-----END PGP SIGNATURE-----';
const armor = message.split(begin)[1].split(end)[0];
const b64 = armor.split(/\\r?\\n/u).map(x => x.trim())
  .filter(x => x && !x.startsWith('Version:') && !x.startsWith('=')).join('');
const packet = Buffer.from(b64, 'base64');
assert.equal(packet.length, 543);
const bodyPacket = packet.subarray(3);
assert.deepEqual([...bodyPacket.subarray(0, 4)], [4, 1, 1, 2]); // v4, text, RSA, SHA-1
let p = 4;
const hlen = bodyPacket.readUInt16BE(p); p += 2;
const hashed = bodyPacket.subarray(p, p + hlen); p += hlen;
const ulen = bodyPacket.readUInt16BE(p); p += 2;
const unhashed = bodyPacket.subarray(p, p + ulen); p += ulen;
p += 2; // left 16 bits of the message digest
const mpiBits = bodyPacket.readUInt16BE(p); p += 2;
const mpi = bodyPacket.subarray(p, p + Math.ceil(mpiBits / 8));
assert.equal(p + mpi.length, bodyPacket.length);
assert.equal(mpiBits, 4095);
assert.equal(mpi.length, 512);
assert.equal(hashed[0], 5);
assert.equal(hashed[1], 2);
const timestamp = hashed.readUInt32BE(2);
assert.equal(timestamp, 1438060359);
assert.equal(new Date(timestamp * 1000).toISOString(), '2015-07-28T05:12:39.000Z');
assert.equal(unhashed[0], 9);
assert.equal(unhashed[1], 16);
assert.equal(unhashed.subarray(2, 10).toString('hex'), '181f01e57a35090f');

const afterHashHeader = message.split('Hash: SHA1')[1];
const cleartext = afterHashHeader.split(begin)[0].replace(/^\\n+/u, '');
const cleartextTrimmed = cleartext.replace(/\\n+$/u, '');
const canonical = cleartextTrimmed.split('\\n')
  .map(line => line.replace(/[ \\t]+$/u, '')).join('\\r\\n');
const signedPrefix = message.split(begin)[0];
const mpiWithBits = Buffer.concat([Buffer.from([mpiBits >> 8, mpiBits & 255]), mpi]);
const candidates = [
  ['full-armored-message-exact', source],
  ['cleartext-body-exact-LF', Buffer.from(cleartext, 'ascii')],
  ['cleartext-body-trimmed-LF', Buffer.from(cleartextTrimmed, 'ascii')],
  ['cleartext-body-OpenPGP-canonical-CRLF', Buffer.from(canonical, 'ascii')],
  ['clear-signed-payload-before-signature', Buffer.from(signedPrefix, 'ascii')],
  ['binary-OpenPGP-signature-packet', packet],
  ['signature-ASCII-armor-payload', Buffer.from(armor, 'ascii')],
  ['raw-RSA-signature-MPI', mpi],
  ['RSA-signature-MPI-lowercase-hex-ASCII', Buffer.from(mpi.toString('hex'), 'ascii')],
  ['RSA-signature-MPI-base64-ASCII', Buffer.from(mpi.toString('base64'), 'ascii')],
  ['RSA-signature-MPI-with-bit-length-prefix', mpiWithBits]
];
const results = [];
for (const [name, bytes] of candidates) for (const algorithm of algorithms) {
  const digest = crypto.createHash(algorithm).update(bytes).digest('hex');
  results.push({ name, algorithm, bytes: bytes.length, digest, match: digest === target });
}
assert.equal(results.length, 33);
assert.equal(results.filter(x => x.match).length, 0);
console.log(JSON.stringify({
  classification: 'bounded source-selected candidate negative; not a proof against other preimages or hash algorithms',
  sourceBytes: source.length,
  sourceGitBlobSha1: gitBlobSha1,
  signature: {
    verifiedSeparatelyWithGpg: true,
    keyId: '181f01e57a35090f',
    keyFingerprint: '6D854CD7933322A601C3286D181F01E57A35090F',
    timestamp: new Date(timestamp * 1000).toISOString(),
    packetBytes: packet.length,
    signatureAlgorithm: 'RSA/SHA-1',
    mpiBits,
    mpiBytes: mpi.length
  },
  target,
  algorithms,
  candidateRepresentations: candidates.map(([name, bytes]) => ({ name, bytes: bytes.length })),
  comparisons: results.length,
  matches: results.filter(x => x.match).length,
  results
}, null, 2));
