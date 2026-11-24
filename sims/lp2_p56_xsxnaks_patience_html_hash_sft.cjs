'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'resources/external/cicada2013-xsxnaks-patience-community-copy.html'));
const text = raw.toString('utf8');
const gitBytes = Buffer.from(text.replace(/\r\n/g, '\n'), 'utf8');
const gitBlobSha1 = crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob ' + gitBytes.length + '\0', 'ascii'), gitBytes]))
  .digest('hex');
assert.equal(gitBytes.length, 129);
assert.equal(gitBlobSha1, '7f591aaf6754b6b0a4acf27f912241a40a5c47b5');
assert.match(text, /<title>3301<\/title>/);
assert.match(text, /Patience is a virtue\./);
assert.match(text, /which means, come back soon\./);

const master = fs.readFileSync(path.join(root, 'resources/transcriptions/liber_primus_master.txt'), 'utf8').split('%').slice(1);
const target = master[71].replace(/[^0-9a-f]/gi, '').toLowerCase();
assert.equal(target.length, 128);
assert.equal(target,
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4');

const digest = (algorithm) => crypto.createHash(algorithm).update(gitBytes).digest('hex');
const sha512 = digest('sha512');
const sha3_512 = digest('sha3-512');
const blake2b512 = digest('blake2b512');
for (const [name, value] of [['SHA-512', sha512], ['SHA3-512', sha3_512], ['BLAKE2b-512', blake2b512]]) {
  assert.notEqual(value, target, name + ' unexpectedly matches the p56 target');
}
assert.equal(crypto.createHash('sha512').update('abc', 'ascii').digest('hex'),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');

console.log(JSON.stringify({
  status: 'PASS',
  candidate: '2013 xsxnaks second-onion v1 patience.html community archive copy',
  upstream: 'neuroretransmit/cicada@6c6d3318414775f7febce3c982607039e70f176d',
  bytes: gitBytes.length,
  gitBlobSha1,
  p56Target: target,
  digests: { sha512, sha3_512, blake2b512 },
  matches: { sha512: sha512 === target, sha3_512: sha3_512 === target, blake2b512: blake2b512 === target },
  scope: 'exact 129-byte community archive body; original 2013 HTTP entity and headers were not recovered',
}, null, 2));
