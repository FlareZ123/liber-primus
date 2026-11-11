'use strict';

/**
 * Test the source-aligned 256-byte terminal grid/rune construction against
 * the literal AN END 64-byte digest.
 *
 * Run from repository root with Node.js 22:
 *   node sims/terminal_grid_xor_anend_digest_sft.cjs
 *
 * The table is interpreted as a 32x8 row-major byte matrix. Its 76-cell
 * perimeter is read clockwise; its 30x6 interior is read row-major.
 * These two streams align with physical p55 (76 runes) followed by p56+p57
 * (180 runes). The rune byte encodings and byte operations are frozen below.
 *
 * This is a bounded source test, not a decryption or a claim that the printed
 * AN END digest is SHA-512.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const witness = JSON.parse(read('resources/cicada2014-anend-binary-witness.json'));

assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(grid.byte_count, 256);
const flat = grid.pages.flatMap(page => page.bytes);
assert.equal(flat.length, 256);
const matrix = Array.from({length: 32}, (_, row) => flat.slice(row * 8, row * 8 + 8));
assert(matrix.every(row => row.length === 8));

// Source-selected outer circumference: clockwise from the upper-left cell.
const ring = [...matrix[0]];
for (let row = 1; row < 31; row++) ring.push(matrix[row][7]);
ring.push(...matrix[31].slice().reverse());
for (let row = 30; row >= 1; row--) ring.push(matrix[row][0]);

// Source-selected interior: the 30x6 cells, in printed row-major order.
const interior = [];
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) interior.push(matrix[row][col]);
}
assert.equal(ring.length, 76);
assert.equal(interior.length, 180);

// Prove that the ring and interior partition all 256 original table cells.
const seen = new Set();
for (let col = 0; col < 8; col++) seen.add(col);
for (let row = 1; row < 31; row++) seen.add(row * 8 + 7);
for (let col = 7; col >= 0; col--) seen.add(31 * 8 + col);
for (let row = 30; row >= 1; row--) seen.add(row * 8);
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) seen.add(row * 8 + col);
}
assert.equal(seen.size, 256);

// The 76/180 split matches the exact terminal rune counts p55 / (p56+p57).
const terminalPages = [55, 56, 57].map(page =>
  corpus.pages.find(item => item.page === page));
assert(terminalPages.every(Boolean));
assert.deepEqual(terminalPages.map(page => page.indices.length), [76, 85, 95]);
const terminal = terminalPages.flatMap(page => page.indices);
assert.equal(terminal.length, 256);

// Physical p55 aligns to the ring; p56+p57 align to the interior.
const sourceBytes = ring.concat(interior);
assert.equal(sourceBytes.length, 256);

const targetHex = witness.target_hex.toLowerCase();
assert.match(targetHex, /^[0-9a-f]{128}$/);
const target = Buffer.from(targetHex, 'hex');
assert.equal(target.length, 64);

const runeBytes = {
  gp_index: terminal,
  gp_prime: terminal.map(index => corpus.prime[index]),
  phi_prime: terminal.map(index => corpus.prime[index] - 1)
};
const operations = {
  xor: (tableByte, runeByte) => tableByte ^ runeByte,
  add_mod256: (tableByte, runeByte) => (tableByte + runeByte) & 255,
  subtract_mod256: (tableByte, runeByte) => (tableByte - runeByte + 256) & 255
};
const hashers = {
  sha512: bytes => crypto.createHash('sha512').update(bytes).digest(),
  sha3_512: bytes => crypto.createHash('sha3-512').update(bytes).digest(),
  blake2b_512: bytes => crypto.createHash('blake2b512').update(bytes).digest(),
  shake256_64: bytes => crypto.createHash('shake256', {outputLength: 64}).update(bytes).digest()
};

const results = [];
for (const [encoding, values] of Object.entries(runeBytes)) {
  for (const [operation, apply] of Object.entries(operations)) {
    const candidate = Buffer.from(sourceBytes.map((value, index) =>
      apply(value, values[index])));
    assert.equal(candidate.length, 256);
    for (const [algorithm, hash] of Object.entries(hashers)) {
      const digest = hash(candidate);
      assert.equal(digest.length, 64);
      results.push({
        encoding,
        operation,
        algorithm,
        matchesTarget: digest.equals(target),
        digestHex: digest.toString('hex')
      });
    }
  }
}
assert.equal(results.length, 36);
const matches = results.filter(result => result.matchesTarget);
assert.equal(matches.length, 0, 'a source-fixed candidate unexpectedly matches AN END');
// Independent historical input: the original 2014 Onion7 stage11
// sexagesimal.bin, reconstructed from its decimal.txt with decimaltobyte.pm.
// It differs from the later LP2 printed-token table at ten byte positions.
const sexagesimal = JSON.parse(read('resources/cicada2014-sexagesimal-source.json'));
const historicalBytes = sexagesimal.decimal_values;
assert.equal(historicalBytes.length, 256);
assert.equal(sexagesimal.decimal_text.length, 920);
assert.equal(sexagesimal.converter_source.length, 45);
const gitBlobSha1 = bytes => crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\\0`), bytes]))
  .digest('hex');
const historicalBuffer = Buffer.from(historicalBytes);
assert.equal(gitBlobSha1(historicalBuffer), sexagesimal.source_blob_sha1.binary);
assert.equal(gitBlobSha1(Buffer.from(sexagesimal.decimal_text, 'utf8')), sexagesimal.source_blob_sha1.decimal_text);
assert.equal(gitBlobSha1(Buffer.from(sexagesimal.converter_source, 'utf8')), sexagesimal.source_blob_sha1.converter);

const historicalMatrix = Array.from({length: 32}, (_, row) => historicalBytes.slice(row * 8, row * 8 + 8));
const historicalRing = [...historicalMatrix[0]];
for (let row = 1; row < 31; row++) historicalRing.push(historicalMatrix[row][7]);
historicalRing.push(...historicalMatrix[31].slice().reverse());
for (let row = 30; row >= 1; row--) historicalRing.push(historicalMatrix[row][0]);
const historicalInterior = [];
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) historicalInterior.push(historicalMatrix[row][col]);
}
assert.equal(historicalRing.length, 76);
assert.equal(historicalInterior.length, 180);
const historicalSourceBytes = historicalRing.concat(historicalInterior);
assert.equal(historicalSourceBytes.length, 256);

const tableDifferences = historicalBytes
  .map((value, index) => ({index, archive_value: value, lp2_value: flat[index], delta: flat[index] - value}))
  .filter(item => item.archive_value !== item.lp2_value);
assert.deepEqual(tableDifferences, sexagesimal.verification.differences_vs_lp2_canonical_grid);
assert.equal(tableDifferences.length, 10);

const historicalResults = [];
for (const [encoding, values] of Object.entries(runeBytes)) {
  for (const [operation, apply] of Object.entries(operations)) {
    const candidate = Buffer.from(historicalSourceBytes.map((value, index) =>
      apply(value, values[index])));
    assert.equal(candidate.length, 256);
    for (const [algorithm, hash] of Object.entries(hashers)) {
      const digest = hash(candidate);
      historicalResults.push({
        table: '2014_sexagesimal',
        encoding,
        operation,
        algorithm,
        matchesTarget: digest.equals(target),
        digestHex: digest.toString('hex')
      });
    }
  }
}
assert.equal(historicalResults.length, 36);
const historicalMatches = historicalResults.filter(result => result.matchesTarget);
assert.equal(historicalMatches.length, 0);

const rawHistoricalFiles = [
  {name: 'sexagesimal.bin', bytes: historicalBuffer},
  {name: 'decimal.txt', bytes: Buffer.from(sexagesimal.decimal_text, 'utf8')},
  {name: 'decimaltobyte.pm', bytes: Buffer.from(sexagesimal.converter_source, 'utf8')}
];
const rawHistoricalHashes = [];
for (const file of rawHistoricalFiles) {
  for (const [algorithm, hash] of Object.entries(hashers)) {
    const digest = hash(file.bytes);
    rawHistoricalHashes.push({
      file: file.name,
      algorithm,
      matchesTarget: digest.equals(target),
      digestHex: digest.toString('hex')
    });
  }
}
assert.equal(rawHistoricalHashes.length, 12);
assert.equal(rawHistoricalHashes.filter(result => result.matchesTarget).length, 0);

console.log(JSON.stringify({
  input: {
    table: '32x8 canonical base60-derived bytes',
    tableOrder: 'clockwise 76-cell perimeter, then row-major 30x6 interior',
    terminalPages: [55, 56, 57],
    terminalRuneCounts: [76, 85, 95],
    runeOrder: 'published GP indices in physical page order',
    alignment: 'p55 perimeter; p56+p57 interior',
    targetHex
  },
  tested: {
    runeByteEncodings: Object.keys(runeBytes),
    byteOperations: Object.keys(operations),
    digestAlgorithms: Object.keys(hashers),
    candidateCount: results.length
  },
  historicalInput: {
    repository: sexagesimal.source_repository,
    firstCommit: sexagesimal.first_observed_commit,
    firstCommitRecordedAt: sexagesimal.first_observed_commit_recorded_at,
    originalPaths: sexagesimal.original_paths,
    gitBlobSha1: sexagesimal.source_blob_sha1,
    tableDifferenceCount: tableDifferences.length,
    tableDifferences,
    directRawFileHashCount: rawHistoricalHashes.length,
    directRawFileMatches: rawHistoricalHashes.filter(result => result.matchesTarget)
  },
  matches,
  historicalMatches,
  rawHistoricalHashes,
  results,
  historicalResults
}, null, 2));
