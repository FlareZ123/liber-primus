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
  result: 'EXACT restored 2014 HTTP body and 2014-source clock agreement; no LP2 decryption',
  archive_sha256: expectedHash,
  document_bytes: reconstructed.length,
  reconstructed_hex_bytes: 170,
  byte170: full[169].toString(16),
  etag_inode: Number.parseInt(inodeHex, 16),
  etag_size: statSize,
  etag_mtime_utc: mtime.toISOString(),
  independent_irc_time: '2014-01-07 14:40 GMT+1, byte ab, length 170',
  clock_difference_seconds: 1,
  response_http_date_utc: archiveDate.toISOString()
}, null, 2));
