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
  matches,
  results
}, null, 2));
