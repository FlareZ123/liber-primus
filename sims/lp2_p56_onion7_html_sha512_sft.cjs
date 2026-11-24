'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const root = require('node:path').resolve(__dirname, '..');
const read = (p) => fs.readFileSync(require('node:path').join(root, p));
const paths = [
  'resources/historical/cicada2014-onion7-original-index.html',
  'resources/historical/cicada2014-onion7-index.html',
  'resources/historical/stage11-2014-index.html',
  'resources/external/cicada2014-stage11-onion7-original-index.html',
  'resources/external/cicada2014-stage11-index-archived.html',
];
const pages = paths.map((p) => ({ path: p, bytes: read(p) }));
const primary = pages[0].bytes;
assert.equal(primary.length, 1640);

const sha1 = (b) => crypto.createHash('sha1').update(b).digest('hex');
const sha512 = (b) => crypto.createHash('sha512').update(b).digest('hex');
const gitBlobSha1 = sha1(Buffer.concat([Buffer.from('blob ' + primary.length + '\0', 'ascii'), primary]));
assert.equal(gitBlobSha1, '303db130705f0ef9be2a738f4336d5cfcebde80c');
for (const p of pages) {
  assert.ok(p.bytes.equals(primary), p.path + ' is not byte-identical to the selected source blob');
  assert.equal(p.bytes.length, 1640);
  assert.equal(sha1(Buffer.concat([Buffer.from('blob ' + p.bytes.length + '\0', 'ascii'), p.bytes])), gitBlobSha1);
}

const html = primary.toString('utf8');
assert.match(html, /<title>133<\/title>/);
assert.match(html, /<div id="331">/);
const imageIds = [...html.matchAll(/<img src="(\d+)\.jpg"/g)].map((m) => Number(m[1]));
assert.deepEqual(imageIds, Array.from({ length: 58 }, (_, i) => i));

const master = read('resources/transcriptions/liber_primus_master.txt').toString('utf8').split('%').slice(1);
const p56Target = master[71].replace(/[^0-9a-f]/gi, '').toLowerCase();
assert.equal(p56Target.length, 128);
assert.equal(p56Target,
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4');

// SHA-512 known-answer control.
assert.equal(sha512(Buffer.from('abc', 'ascii')),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');

const digest = sha512(primary);
assert.notEqual(digest, p56Target);
console.log(JSON.stringify({
  status: 'PASS',
  sourceSelection: '2014 Stage11/Onion7 original index; p57 449-modulus residues 133 and 331 equal its title and div id',
  uniqueSourceBlob: {
    paths,
    byteLength: primary.length,
    gitBlobSha1,
    identicalCopies: pages.length,
    title: 133,
    divId: 331,
    imageCount: imageIds.length,
    imageIds: [imageIds[0], imageIds.at(-1)],
  },
  p56TargetSha512: p56Target,
  exactArchivedHtmlSha512: digest,
  matches: digest === p56Target,
  scope: 'exact archived 1640-byte HTML body under SHA-512 only; no claim about lost HTTP wrappers or unspecified digest algorithms',
}, null, 2));
