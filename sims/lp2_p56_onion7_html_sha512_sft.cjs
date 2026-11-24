'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p));
const paths = [
  'resources/historical/cicada2014-onion7-original-index.html',
  'resources/historical/cicada2014-onion7-index.html',
  'resources/historical/stage11-2014-index.html',
  'resources/external/cicada2014-stage11-onion7-original-index.html',
  'resources/external/cicada2014-stage11-index-archived.html',
];
const workingCopies = paths.map((p) => ({ path: p, bytes: read(p) }));
const normalizeLF = (b) => Buffer.from(b.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
const gitBytes = normalizeLF(workingCopies[0].bytes);
const crlfBytes = Buffer.from(gitBytes.toString('utf8').replace(/\n/g, '\r\n'), 'utf8');

assert.equal(gitBytes.length, 1640);
assert.equal(crlfBytes.length, 1705);
assert.ok(workingCopies[0].bytes.equals(gitBytes) || workingCopies[0].bytes.equals(crlfBytes));

const sha1 = (b) => crypto.createHash('sha1').update(b).digest('hex');
const sha512 = (b) => crypto.createHash('sha512').update(b).digest('hex');
const gitBlobSha1 = sha1(Buffer.concat([Buffer.from('blob ' + gitBytes.length + '\0', 'ascii'), gitBytes]));
assert.equal(gitBlobSha1, '303db130705f0ef9be2a738f4336d5cfcebde80c');

for (const p of workingCopies) {
  const normalized = normalizeLF(p.bytes);
  assert.ok(normalized.equals(gitBytes), p.path + ' is not byte-identical after checkout line-ending normalization');
  assert.equal(normalized.length, 1640);
  assert.equal(sha1(Buffer.concat([Buffer.from('blob ' + normalized.length + '\0', 'ascii'), normalized])), gitBlobSha1);
}

const html = gitBytes.toString('utf8');
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

const sha512LF = sha512(gitBytes);
const sha512CRLF = sha512(crlfBytes);
assert.notEqual(sha512LF, p56Target);
assert.notEqual(sha512CRLF, p56Target);

console.log(JSON.stringify({
  status: 'PASS',
  sourceSelection: '2014 Stage11/Onion7 original index; p57 449-modulus residues 133 and 331 equal its title and div id',
  uniqueSourceBlob: {
    paths,
    gitBlobByteLength: gitBytes.length,
    windowsCheckoutByteLength: workingCopies[0].bytes.length,
    crlfByteLength: crlfBytes.length,
    gitBlobSha1,
    identicalCopies: workingCopies.length,
    title: 133,
    divId: 331,
    imageCount: imageIds.length,
    imageIds: [imageIds[0], imageIds.at(-1)],
  },
  p56TargetSha512: p56Target,
  exactGitBlobSha512: sha512LF,
  CRLFSerializationSha512: sha512CRLF,
  matches: { exactGitBlob: sha512LF === p56Target, CRLFSerialization: sha512CRLF === p56Target },
  scope: 'exact archived 1640-byte HTML body under SHA-512, plus a line-ending serialization check; no claim about lost HTTP wrappers or unspecified digest algorithms',
}, null, 2));
