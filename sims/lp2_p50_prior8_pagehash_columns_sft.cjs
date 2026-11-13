'use strict';

/**
 * Original-input SFT: are the eight 32-byte columns in the LP2 pp49-51
 * numerical table SHA-256 digests of the eight immediately preceding
 * rune pages p41-p48?
 *
 * Source-selected relationship is conditional: eight preceding pages,
 * eight columns, 32 bytes per column. The p40 rubric also has eight runes.
 * This tests exact, conventional page representations without fitted
 * salts, keys, offsets, partial-hash matching or pixel preprocessing.
 * Execute with Node.js 22 from any working directory.
 */

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const resources = path.join(root, 'resources', 'liber-primus');
const corpus = JSON.parse(readFileSync(path.join(resources, 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(readFileSync(path.join(resources, 'lp2-grid-256.json'), 'utf8'));
const digest = (value) => createHash('sha256').update(value).digest('hex');

assert.equal(digest(Buffer.from('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

const bytes = table.pages.flatMap((entry) => entry.bytes);
assert.equal(bytes.length, 256);
assert.equal(digest(Buffer.from(bytes)), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const orientations = [
  ...Array.from({ length: 8 }, (_, column) => ({
    kind: 'column32',
    index: column,
    data: Buffer.from(Array.from({ length: 32 }, (_, row) => bytes[row * 8 + column])),
  })),
  ...Array.from({ length: 8 }, (_, block) => ({
    kind: 'contiguous32',
    index: block,
    data: Buffer.from(bytes.slice(block * 32, (block + 1) * 32)),
  })),
];

const pages = [];
for (let physical = 41; physical <= 48; physical++) {
  const page = corpus.pages.find((entry) => entry.page === physical);
  assert.ok(page, `missing source page ${physical}`);
  const image = readFileSync(path.join(resources, `${String(physical + 17).padStart(2, '0')}.jpg`));
  const gpIndices = Buffer.from(page.indices);
  const literalRunes = Buffer.from(page.indices.map((i) => corpus.runes[i]).join(''), 'utf8');

  pages.push({
    physical,
    symbolCount: page.indices.length,
    hashes: {
      jpegBytes: digest(image),
      gpIndexBytes: digest(gpIndices),
      runeUtf8: digest(literalRunes),
    },
  });
}

assert.equal(pages[0].hashes.jpegBytes, '134052dd794a7d11185cc6d942de3f9839bd2b767e0845b0f059f711b269bee2');

const findings = [];
for (const page of pages) {
  for (const [mode, hash] of Object.entries(page.hashes)) {
    const target = Buffer.from(hash, 'hex');
    for (const orientation of orientations) {
      let equalBytes = 0;
      for (let i = 0; i < 32; i++) if (target[i] === orientation.data[i]) equalBytes++;
      findings.push({
        page: page.physical,
        mode,
        kind: orientation.kind,
        index: orientation.index,
        equalBytes,
        exact: equalBytes === 32,
      });
    }
  }
}

assert.equal(findings.length, 384);
const hits = findings.filter((f) => f.exact);
const best = Math.max(...findings.map((f) => f.equalBytes));
assert.equal(hits.length, 0);
assert.ok(best <= 2, `unexpectedly strong prefix/byte coincidence: ${best}`);

console.log(JSON.stringify({
  test: 'lp2-p50-prior-eight-pages-sha256',
  sources: 'LP2 p41-p48 original JPEGs and GP rune index / literal rune data',
  hypotheses: 384,
  exactMatches: hits.length,
  maxByteAgreement: best,
  perPageHashes: pages,
}, null, 2));
