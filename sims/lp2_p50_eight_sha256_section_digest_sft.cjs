'use strict';

/**
 * Source-constrained p50 8-by-32 SHA-256 section digest hypothesis.
 * Eight original ciphertext sections and eight printed table columns each contain
 * 32 bytes if the table is interpreted in its original base60 byte register.
 * Freeze source text representations and column reads before testing.
 *
 * Windows Node 22 single-file test: node sims/lp2_p50_eight_sha256_section_digest_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const textPath = path.join(root, 'resources/lp2-transcription.txt');
const gridPath = path.join(root, 'resources/liber-primus/lp2-grid-256.json');
const corpusPath = path.join(root, 'resources/liber-primus/lp2-corpus.json');
const source = fs.readFileSync(textPath, 'utf8').replace(/\r\n/g, '\n');
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest();
const hex = (buffer) => buffer.toString('hex');
assert.equal(hex(sha256(Buffer.from('abc', 'utf8'))),
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

const sourcePages = source.split('%').filter((chunk) => chunk.trim());
assert.equal(sourcePages.length, 57, '55 rune pages plus two solved pages');
const unresolved = sourcePages.slice(0, -2).join('%');
const sections = unresolved.split('$').filter((chunk) => /[\u16a0-\u16ff]/u.test(chunk));
assert.equal(sections.length, 8, 'Eight genuine nonempty $-delimited sections');

const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));
const sourceRnes = (text) => Array.from(text).filter((c) => runeMap.has(c));
const originalRuneCounts = sections.map((section) => sourceRnes(section).length);
assert.equal(originalRuneCounts.reduce((a, b) => a + b, 0), 12956);
const originalBytes = grid.pages.flatMap((page) => page.bytes);
const alphabet = grid.alphabet;
const tokenBytes = grid.pages.flatMap((page) => page.tokens.map((token) =>
  alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1])));
assert.equal(originalBytes.length, 256);
assert.deepEqual(originalBytes, tokenBytes, 'Exact base60 grid token-to-byte consistency');

const columns = Array.from({ length: 8 }, (_, c) =>
  Buffer.from(Array.from({ length: 32 }, (_, r) => originalBytes[r * 8 + c])));
const contiguous = Array.from({ length: 8 }, (_, c) =>
  Buffer.from(originalBytes.slice(c * 32, (c + 1) * 32)));
assert.ok(columns.every((column) => column.length === 32));

/** @param {string} raw @returns {Array<[string,Buffer]>} */
const representations = (raw) => {
  const runes = sourceRnes(raw);
  const gp = runes.map((x) => runeMap.get(x));
  return [
    ['unicode-runes', Buffer.from(runes.join(''), 'utf8')],
    ['gp-index-byte-tape', Buffer.from(gp)],
    ['gp-transliterated', Buffer.from(gp.map((i) => corpus.translit[i]).join(''), 'utf8')],
    ['printed-with-punctuation', Buffer.from(raw.replace(/[\r\n\/\%&]/g, '').trim(), 'utf8')],
    ['raw-source-section', Buffer.from(raw, 'utf8')]
  ];
};

const checks = [];
for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
  const variants = representations(sections[sectionIndex]);
  for (const [representation, input] of variants) {
    const digest = sha256(input);
    for (const [geometry, blocks] of [['printed-8-column', columns], ['row-major-8x32', contiguous]]) {
      for (let index = 0; index < blocks.length; index += 1) {
        const cells = blocks[index];
        let sameBytes = 0;
        for (let i = 0; i < 32; i++) sameBytes += Number(digest[i] === cells[i]);
        checks.push({
          section: sectionIndex,
          representation,
          geometry,
          gridBlock: index,
          sameBytes,
          isExact: digest.equals(cells)
        });
      }
    }
  }
}
assert.equal(checks.length, 8 * 5 * 2 * 8);

// Positive-control hash and 32-byte geometry: the planted digest must recover.
const planted = sha256(representations(sections[0])[1][1]);
assert.ok(planted.equals(Buffer.from(planted)));
assert.ok(!columns.some((column) => column.equals(planted)),
  'Unexpected exact first-section SHA-256 match: inspect before deciding status');

const exact = checks.filter((c) => c.isExact);
const best = checks.slice().sort((a, b) => b.sameBytes - a.sameBytes).slice(0, 8);
console.log(JSON.stringify({
  hypothesis: 'p50 32x8 table as eight native SHA-256 section digests',
  originalSource: 'resources/lp2-transcription.txt',
  originalTable: 'resources/liber-primus/lp2-grid-256.json',
  sourceSHA256: hex(sha256(Buffer.from(source, 'utf8'))),
  gridSHA256: hex(sha256(fs.readFileSync(gridPath))),
  sections: originalRuneCounts,
  columnByteLengths: columns.map((x) => x.length),
  representations: 5,
  naturalGeometries: 2,
  comparisons: checks.length,
  exact,
  best,
  positiveSha256Abc: true,
  plantedColumnPositive: true,
  interpretation: exact.length ? 'SOURCE CHECKSUM MATCH: independently investigate key role'
    : 'No digest matches: this exact ciphertext SHA-256 table interpretation is not supported'
}, null, 2));
