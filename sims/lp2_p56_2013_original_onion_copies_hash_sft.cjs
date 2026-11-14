'use strict';

/**
 * Test the actual p56 digest against preserved original-source 2013 HTTP/PGP
 * source copies. This tests a historically bounded target-preexistence idea:
 * the text of p57 already appeared in 761.mp3 metadata in January 2013, so
 * one might seek the p56 destination among known earlier Cicada onion pages.
 *
 * The retained sources are participant copies, not verified original HTTP
 * entity bodies. A negative narrows only these exact bytes/algorithms.
 * Windows 11 / Node.js 22 CommonJS SFT. Never guess missing HTTP wrappers.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, getHashes} = require('node:crypto');

const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
assert.match(TARGET, /^[0-9a-f]{128}$/);
const base = path.resolve(__dirname, '../resources/historical');
const files = [
  'cicada2013-first-onion-hello.asc',
  'cicada2013-forest-clue.asc',
  'cicada2013-os-original-cicada.sh',
  'cicada2013-os-original-message.txt',
  'cicada2013-os-original-prime-echo.sh',
  'cicada2013-second-onion-everything-you-need.asc',
  'cicada2013-second-onion-icmp-echo.asc',
  'cicada2013-second-onion-icmp-echo.hex.txt',
  'pklmx-2013/standby.html',
  'pklmx-2013/standby.txt.asc',
  'pklmx-2013/annapolis.html',
  'pklmx-2013/annapolis-md.txt.asc',
  'pklmx-2013/okinawa.html',
  'pklmx-2013/okinawa-japan.txt.asc',
];
assert.equal(files.length, 14);
const digests = ['sha512', 'sha3-512', 'blake2b512'];
for (const d of digests) assert.ok(getHashes().includes(d));
assert.equal(
  createHash('sha512').update('abc').digest('hex'),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
);
const report = [];
for (const file of files) {
  const raw = fs.readFileSync(path.join(base, file));
  const hashSet = Object.fromEntries(
    digests.map((d) => [d, createHash(d).update(raw).digest('hex')])
  );
  const matches = Object.entries(hashSet).filter(([, digest]) => digest === TARGET)
    .map(([digest]) => digest);
  report.push({
    path: 'resources/historical/' + file, bytes: raw.length,
    sha256: createHash('sha256').update(raw).digest('hex'),
    matches
  });
}
assert.ok(report.every((entry) => entry.bytes > 0));
assert.equal(report.filter((entry) => entry.matches.length > 0).length, 0);

console.log(JSON.stringify({
  target: TARGET, candidateFiles: files.length,
  algorithms: digests, exactByteComparisons: files.length * digests.length,
  matches: [],
  positiveSha512Abc: true,
  original2013DirectPageFound: false,
  sourceLimit: 'No preserved 2013 HTTP-original entity bytes. Tests preserved participant raw files only.',
  files: report
}, null, 2));
