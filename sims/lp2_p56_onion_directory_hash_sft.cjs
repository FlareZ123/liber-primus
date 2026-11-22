#!/usr/bin/env node
'use strict';

// Source-pinned, finite direct-preimage test for the p56 512-bit digest.
// The candidate corpus is Kenorb's 15 Sep 2014 onion-address database,
// not a Cicada-authored artifact. The historical hash_finder.sh hashes each
// exact line (including ".onion") with printf, i.e. without a newline.
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const SOURCE = {
  url: 'https://github.com/kenorb/cicada-2014/blob/2e0cb5ace2f4172cda402489201bbbe27dd19999/stage11/scripts/onions-list.txt',
  raw_url: 'https://raw.githubusercontent.com/kenorb/cicada-2014/2e0cb5ace2f4172cda402489201bbbe27dd19999/stage11/scripts/onions-list.txt',
  commit: '2e0cb5ace2f4172cda402489201bbbe27dd19999',
  commit_date: '2014-09-15T18:23:41Z',
  blob_sha1: '8722ee2edd749f01b4fffbd91053fac5a8ca0ff3',
  byte_length: 73692,
  line_count: 3204,
};
const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: node lp2_p56_onion_directory_hash_sft.cjs <onions-list.txt>');

const bytes = fs.readFileSync(inputPath);
assert.equal(bytes.length, SOURCE.byte_length, 'candidate source byte length changed');
const blobHeader = Buffer.from('blob ' + bytes.length + '\0', 'utf8');
const actualBlob = crypto.createHash('sha1').update(Buffer.concat([blobHeader, bytes])).digest('hex');
assert.equal(actualBlob, SOURCE.blob_sha1, 'candidate source Git blob SHA-1 changed');

const hosts = bytes.toString('utf8').split(/\r?\n/).filter(Boolean);
assert.equal(hosts.length, SOURCE.line_count, 'candidate source line count changed');
assert.equal(new Set(hosts).size, hosts.length, 'candidate source contains duplicate entries');
assert.equal(
  crypto.createHash('sha512').update('abc', 'ascii').digest('hex'),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
  'SHA-512 implementation positive control failed'
);

const variants = [
  ['exact-host-including-onion-suffix', host => host],
  ['bare-16-character-label', host => host.replace(/\.onion$/i, '')],
  ['http-url-with-root-slash', host => 'http://' + host + '/'],
  ['https-url-with-root-slash', host => 'https://' + host + '/'],
];
const requestedAlgorithms = ['sha512', 'sha3-512', 'blake2b512', 'whirlpool'];
const availableAlgorithms = new Set(crypto.getHashes().map(x => x.toLowerCase()));
const matches = [];
const results = [];
const algorithmErrors = [];

for (const algorithm of requestedAlgorithms) {
  if (!availableAlgorithms.has(algorithm)) continue;
  for (const [variant, serialize] of variants) {
    let tested = 0;
    try {
      for (const host of hosts) {
        const candidate = serialize(host);
        const digest = crypto.createHash(algorithm).update(candidate, 'utf8').digest('hex');
        tested++;
        if (digest === TARGET) matches.push({algorithm, variant, host, candidate});
      }
      results.push({algorithm, variant, tested, matches: matches.filter(m => m.algorithm === algorithm && m.variant === variant).length});
    } catch (error) {
      algorithmErrors.push({algorithm, variant, error: String(error)});
    }
  }
}

const validV2 = hosts.filter(host => /^[a-z2-7]{16}\.onion$/.test(host)).length;
const knownLP2Hosts = ['ky2khlqdf7qdznac.onion', 'ycwtiskrspensdkz.onion'];
const output = {
  source: {...SOURCE, actual_blob_sha1: actualBlob, actual_byte_length: bytes.length, actual_line_count: hosts.length, unique_count: new Set(hosts).size},
  candidate_corpus: {
    valid_lowercase_v2_hosts: validV2,
    noncanonical_or_legacy_entries: hosts.length - validV2,
    known_LP2_hosts_present: knownLP2Hosts.filter(host => hosts.includes(host)),
  },
  target_sha512_hex: TARGET,
  hash_algorithms_requested: requestedAlgorithms,
  hash_algorithms_tested: [...new Set(results.map(x => x.algorithm))],
  serialization_variants: variants.map(x => x[0]),
  results,
  algorithmErrors,
  total_hashes: results.reduce((sum, row) => sum + row.tested, 0),
  matches,
  decision: matches.length ? 'MATCH_FOUND' : 'NO_DIRECT_MATCH_IN_THIS_CORPUS_AND_SERIALIZATION_SET',
};
console.log(JSON.stringify(output, null, 2));
if (matches.length) process.exitCode = 2;
