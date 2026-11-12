'use strict';
/**
 * Reconstruct the exact archived 2014 Onion2 170-byte static HTML response.
 * Original source: Dukotah/cicada3301 corpus/D-archives/manifest_normalised.jsonl
 * Archive date label: 20140107125633; original HTTP Date: 2014-01-07 14:03:35 UTC.
 * The document's SHA-256 is a preserved independent archive checksum.
 * @returns {void}
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const timing = JSON.parse(fs.readFileSync(path.join(root, 'resources/cicada2014-onion2-timing.json'), 'utf8'));
const recovered = fs.readFileSync(path.join(root, 'resources/historical/cicada2014-onion2-20140107-170byte.html'));
const recovered201 = fs.readFileSync(path.join(root, 'resources/historical/cicada2014-onion2-20140107-201byte.html'));
/** @param {Buffer} bytes @returns {string} */
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const full = Buffer.from(timing.final_hex, 'hex');
assert.equal(full.length, 256);
assert.equal(hash(full), timing.final_bytes_sha256);
assert.equal(full[169], 0xab);
const reconstructed = Buffer.from('<!--Patience is a virtue-->\n' + timing.final_hex.slice(0, 340), 'ascii');
assert.equal(reconstructed.length, 368);
assert.deepEqual(recovered, reconstructed);
const expectedHash = 'b9722427c162f3b2cc15ea5f9785ead5a5ba0ffb702010bcce85591e83fcf1dc';
assert.equal(hash(reconstructed), expectedHash);
const witnesses = [
  {index: 170, cdx: 'TKD4KCZ3BBREBSCS6ZEXBYSRZTMDU6P2', sha1: '9a87c50b3b086240c852f64970e251ccd83a79fa'},
  {index: 201, cdx: 'A2N6WJ6DSMG6NRTTJKN3YVVOIKT4RDLH', sha1: '069beb27c3930de6c6734a9bbc56ae42a7c88d67'}
];
/** @param {Buffer} bytes @returns {string} */
const sha1 = bytes => crypto.createHash('sha1').update(bytes).digest('hex');
for (const witness of witnesses) {
  const matches = [];
  for (let size = 0; size <= full.length; size++) {
    const candidate = Buffer.from('<!--Patience is a virtue-->\n' + timing.final_hex.slice(0, 2 * size), 'ascii');
    if (sha1(candidate) === witness.sha1) matches.push(size);
  }
  assert.deepEqual(matches, [witness.index], witness.cdx);
  const original = Buffer.from('<!--Patience is a virtue-->\n' + timing.final_hex.slice(0, 2 * witness.index), 'ascii');
  assert.deepEqual(witness.index === 170 ? recovered : recovered201, original);
}
assert.equal(full[200], 0x2a);
assert.equal(full[201], 0x0b);
assert.equal(recovered201.length, 430);
assert.equal(hash(recovered201), '75c2c847998a3ccab1e17c9d9b6f5606b484f6250e2dd48df3ac3145b76ad400');
const etag = '"b46b-170-4ef6183538e40"';
const [inodeHex, sizeHex, microHex] = etag.replaceAll('"', '').split('-');
const statSize = Number.parseInt(sizeHex, 16);
const mtime = new Date(Number(BigInt('0x' + microHex) / 1000n));
assert.equal(Number.parseInt(inodeHex, 16), 46187);
assert.equal(statSize, 368);
assert.equal(mtime.toISOString(), '2014-01-07T13:40:01.000Z');
assert.equal(new Date('Tue, 07 Jan 2014 13:40:01 GMT').getTime(), mtime.getTime());
const irc14_40GMTplus1 = new Date('2014-01-07T14:40:00+01:00');
assert.equal((mtime.getTime() - irc14_40GMTplus1.getTime()), 1000);
const archiveDate = new Date('Tue, 07 Jan 2014 14:03:35 GMT');
assert.ok(archiveDate.getTime() > mtime.getTime());
const mutated = Buffer.from(reconstructed);
mutated[mutated.length - 1] ^= 1;
assert.notEqual(hash(mutated), expectedHash);
console.log(JSON.stringify({
  result: 'TWO exact historical 2014 HTTP bodies, independently archived SHA-1 digests and 2014 source clock; no LP2 decryption',
  archive_sha256: expectedHash,
  document_bytes: reconstructed.length,
  reconstructed_hex_bytes: [170, 201],
  second_html_bytes: 430,
  second_cdx_sha1: witnesses[1].cdx,
  byte170: full[169].toString(16),
  etag_inode: Number.parseInt(inodeHex, 16),
  etag_size: statSize,
  etag_mtime_utc: mtime.toISOString(),
  independent_irc_time: '2014-01-07 14:40 GMT+1, byte ab, length 170',
  clock_difference_seconds: 1,
  response_http_date_utc: archiveDate.toISOString()
}, null, 2));
