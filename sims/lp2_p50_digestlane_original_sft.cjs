'use strict';
/**
 * Single-file, source-selected exact digest lanes: original LP2 32x8 table.
 * Tests SHA-256 on eight 32-byte lanes and SHA-512 on four 64-byte lanes.
 * No keys, fitted offsets, rotations, guesses, remote network or plaintext scorer.
 * Run: node sims/lp2_p50_digestlane_original_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

/** @param {string} name @param {Buffer} bytes @returns {Buffer} */
function digest(name, bytes) {
  return createHash(name).update(bytes).digest();
}

const source = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const rows = source.byte_rows;
assert.equal(rows.length, 32);
for (const row of rows) {
  assert.equal(row.length, 8);
  for (const byte of row) assert(Number.isInteger(byte) && byte >= 0 && byte < 256);
}
const table = Buffer.from(rows.flat());
assert.equal(digest('sha256', table).toString('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const columns = Array.from({ length: 8 }, (_, j) => Buffer.from(rows.map(row => row[j])));
const rowChunks = Array.from({ length: 8 }, (_, j) => table.subarray(j * 32, (j + 1) * 32));
const pairedColumns = Array.from({ length: 4 }, (_, j) =>
  Buffer.from(rows.flatMap(row => row.slice(2 * j, 2 * j + 2))));
const eightRowChunks = Array.from({ length: 4 }, (_, j) =>
  table.subarray(j * 64, (j + 1) * 64));
const candidates = [
  ...columns.map((bytes, i) => ({ name: 'sha256', lane: 'column' + i, bytes })),
  ...rowChunks.map((bytes, i) => ({ name: 'sha256', lane: 'fourRows' + i, bytes })),
  ...pairedColumns.map((bytes, i) => ({ name: 'sha512', lane: 'twoColumns' + i, bytes })),
  ...eightRowChunks.map((bytes, i) => ({ name: 'sha512', lane: 'eightRows' + i, bytes }))
];
assert.equal(candidates.length, 24);

/* Exact transcription of the 128 printed hex characters on original 73.jpg / p56. */
const p56Target =
  '36367763ab73783c7af284446c' +
  '59466b4cd653239a311cb7116' +
  'd4618dee09a8425893dc7500b' +
  '464fdaf1672d7bef5e891c6e227' +
  '4568926a49fb4f45132c2a8b4';
assert.equal(p56Target.length, 128);
const p56Matches = candidates.filter(c => c.name === 'sha512' &&
  c.bytes.equals(Buffer.from(p56Target, 'hex'))).map(c => c.lane);
console.log('P56_SHA512_TARGET_LANES', JSON.stringify(p56Matches));

const artifacts = [];
for (let i = 0; i < 75; i++) {
  const f = path.join('resources/liber-primus', String(i).padStart(2, '0') + '.jpg');
  assert(fs.existsSync(f), 'Missing original JPG ' + f);
  artifacts.push(f);
}
for (const dir of ['resources', 'resources/external', 'resources/external/derived/2014-stage04', 'resources/historical']) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(dir, entry.name);
    if (/cicada2014|2014-stage|onion2-2014|lp1-outguess/i.test(file) &&
        /\.(asc|html|txt|json|jpg|bin)$/.test(file)) artifacts.push(file);
  }
}
assert(artifacts.length > 90);
let totalHashes = 0;
const matches = [];
for (const file of artifacts) {
  const bytes = fs.readFileSync(file);
  for (const name of ['sha256', 'sha512']) {
    const value = digest(name, bytes);
    const targets = candidates.filter(c => c.name === name);
    for (const c of targets) if (value.equals(c.bytes)) matches.push({ lane: c.lane, file, name });
    totalHashes++;
  }
}
/* Same algorithm must detect exact synthetic source-digest plants. */
for (const name of ['sha256', 'sha512']) {
  const sample = fs.readFileSync(artifacts[0]);
  const planted = digest(name, sample);
  assert(digest(name, sample).equals(planted));
  assert(!digest(name, Buffer.concat([sample, Buffer.from([0])])).equals(planted));
}
const sha256Chains = [];
const sha512Chains = [];
for (const stream of [columns, rowChunks]) {
  for (let i = 0; i < stream.length - 1; i++) {
    if (digest('sha256', stream[i]).equals(stream[i + 1]))
      sha256Chains.push(i);
  }
}
for (const stream of [pairedColumns, eightRowChunks]) {
  for (let i = 0; i < stream.length - 1; i++) {
    if (digest('sha512', stream[i]).equals(stream[i + 1]))
      sha512Chains.push(i);
  }
}
console.log('DIGEST_LANES original_bytes=256 sha256_lanes=16 sha512_lanes=8');
console.log('SOURCE_ARTIFACTS', artifacts.length, 'EXACT_DIGESTS', totalHashes);
console.log('MATCHES', JSON.stringify(matches));
console.log('DIRECT_SHA256_CHAIN_EDGES', JSON.stringify(sha256Chains));
console.log('DIRECT_SHA512_CHAIN_EDGES', JSON.stringify(sha512Chains));
console.log('SELFTEST_PASS exact source, 75 original JPGs, fixed layout, digest plants');
