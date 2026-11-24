'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p));
const raw = read('resources/external/cicada2013-xsxnaks-everything-you-need-community-copy.html');
const text = raw.toString('utf8');
const gitBytes = Buffer.from(text.replace(/\r\n/g, '\n'), 'utf8');
const gitBlobSha1 = crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob ' + gitBytes.length + '\0', 'ascii'), gitBytes]))
  .digest('hex');
assert.equal(gitBytes.length, 1089);
assert.equal(gitBlobSha1, 'a156f08ce4291d09e4d3420af1d77c74e190695c');
assert.match(text, /<title>3301<\/title>/);
assert.match(text, /You already have everything you need to continue\./);
assert.match(text, /knock on the sky and listen to the sound\./);

const pre = text.match(/<pre>([\s\S]*?)<\/pre>/);
assert.ok(pre, 'expected the preserved clear-signed message inside <pre>');
const asc = read('resources/historical/cicada2013-second-onion-everything-you-need.asc');
const normalize = (s) => Buffer.from(s.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
assert.ok(normalize(Buffer.from(pre[1], 'utf8')).equals(normalize(asc)),
  'HTML <pre> must equal the separately preserved clear-signed message');

const master = read('resources/transcriptions/liber_primus_master.txt').toString('utf8').split('%').slice(1);
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
  candidate: '2013 xsxnaks second-onion everything-you-need.html community archive copy',
  upstream: 'neuroretransmit/cicada@6c6d3318414775f7febce3c982607039e70f176d',
  bytes: gitBytes.length,
  gitBlobSha1,
  embeddedSignedMessageMatchesHistoricalAsc: true,
  p56Target: target,
  digests: { sha512, sha3_512, blake2b512 },
  matches: { sha512: sha512 === target, sha3_512: sha3_512 === target, blake2b512: blake2b512 === target },
  scope: 'exact 1089-byte community archive HTML body; embedded PGP message is separately signed; original 2013 HTTP entity and headers were not recovered',
}, null, 2));
