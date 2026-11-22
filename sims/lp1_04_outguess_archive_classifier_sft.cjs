'use strict';

/**
 * Classify the historically archived unkeyed OutGuess output from the original
 * 2014 Liber Primus scan 04.jpg. Only inspect bytes; never execute them.
 * Run: node sims/lp1_04_outguess_archive_classifier_sft.cjs
 *
 * Frozen archive: rtkd/iddqd commit f2267b0c2f1e1d2662806b90b9c3a2953b3a7023.
 * Positive: signed plain-text output 03.txt. Negative: false header output 06.txt.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { inflateSync, gunzipSync } = require('node:zlib');

const base = 'https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/lp_outguessed/';
const entries = [
  { name: '03.txt', sha: '2a355d1bf14d37041384f09d8700e2ee274a13e6', size: 31809 },
  { name: '04.txt', sha: 'd738b052bf0548e2f431e231af7ef1514becb4ad', size: 7524 },
  { name: '06.txt', sha: '29d8fe5c4b6f2b245e367077dc6c752204707c7e', size: 58152 },
];
const printedP56Hash = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';

function digest(algorithm, buffer) {
  return createHash(algorithm).update(buffer).digest('hex');
}

function gitBlobSha(buffer) {
  return digest('sha1', Buffer.concat([Buffer.from('blob ' + buffer.length + '\0'), buffer]));
}

function bitEntropy(buffer) {
  const freq = new Uint32Array(256);
  for (const byte of buffer) freq[byte]++;
  let sum = 0;
  for (const f of freq) if (f > 0) {
    const p = f / buffer.length;
    sum -= p * Math.log2(p);
  }
  return sum;
}

function utf8Printability(buffer) {
  let ascii = 0;
  let rune = 0;
  for (const c of buffer) {
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c <= 126)) ascii++;
    if (c <= 28) rune++;
  }
  return { printableAsciiFraction: ascii / buffer.length, gpIndexByteFraction: rune / buffer.length };
}

function visibleRuns(buffer) {
  const text = buffer.toString('latin1');
  return (text.match(/[ -~]{16,}/g) || []).slice(0, 10).map(s => s.slice(0, 120));
}

function payloadReport(buffer) {
  const pgp = spawnSync('gpg', ['--batch', '--list-packets'], {
    input: buffer, encoding: 'utf8', timeout: 10000, maxBuffer: 65536,
  });
  const magic = [];
  if (buffer.subarray(0, 2).equals(Buffer.from([0x1f, 0x8b]))) magic.push('gzip');
  if (buffer.subarray(0, 3).equals(Buffer.from('BZh'))) magic.push('bzip2');
  if (buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) magic.push('zip');
  if (buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) magic.push('pdf');
  if (buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) magic.push('png');
  if (buffer[0] === 0x78 && (((buffer[0] << 8) + buffer[1]) % 31 === 0)) magic.push('zlib-possible');
  let inflated = null;
  if (magic.includes('gzip') || magic.includes('zlib-possible')) {
    const out = magic.includes('gzip')
      ? gunzipSync(buffer, { maxOutputLength: 1000000 })
      : inflateSync(buffer, { maxOutputLength: 1000000 });
    inflated = { length: out.length, prefix: out.subarray(0, 48).toString('hex'), ascii: visibleRuns(out) };
  }
  return {
    length: buffer.length,
    sha256: digest('sha256', buffer),
    sha512MatchesP56Hash: digest('sha512', buffer) === printedP56Hash,
    blake2b512MatchesP56Hash: digest('blake2b512', buffer) === printedP56Hash,
    byteEntropyBits: bitEntropy(buffer),
    ...utf8Printability(buffer),
    prefixHex64: buffer.subarray(0, 64).toString('hex'),
    suffixHex16: buffer.subarray(-16).toString('hex'),
    magic, inflated, visibleRuns: visibleRuns(buffer),
    gpgPacketsExit: pgp.status,
    gpgPacketsOutput: ((pgp.stdout || '') + (pgp.stderr || '')).slice(0, 380),
  };
}

(async function main() {
  assert.equal(printedP56Hash.length, 128);
  const files = [];
  for (const spec of entries) {
    const response = await fetch(base + spec.name, { headers: { 'User-Agent': 'LiberPrimus-Original-Control' } });
    assert.equal(response.status, 200, 'Original source must be reachable: ' + spec.name);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, spec.size, spec.name + ' byte length');
    assert.equal(gitBlobSha(bytes), spec.sha, spec.name + ' exact historical Git blob');
    files.push(bytes);
  }
  assert.ok(files[0].includes(Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----')),
    '03 historical source must be a recognizable signed control');
  const result = {
    input: 'rtkd/iddqd original static OutGuess archive, commit f2267b0c2f1e1d2662806b90b9c3a2953b3a7023',
    signed03: payloadReport(files[0]),
    unclassified04: payloadReport(files[1]),
    false06: payloadReport(files[2]),
    p04EqualsP03Prefix: files[1].subarray(0, 16).equals(files[0].subarray(0, 16)),
    p04EqualsP06Prefix: files[1].subarray(0, 16).equals(files[2].subarray(0, 16)),
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
})().catch(err => { process.stderr.write(err.stack + '\n'); process.exitCode = 1; });
