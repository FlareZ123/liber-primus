// SFT: source-pinned eight-column SHA-256 digest hypothesis for original LP2 p50.
// Run on Windows 11 with Node.js 22: node sims/lp2_p50_eightcolumn_sha256_original_sft.cjs
// Read-only; uses original page-index GP29 records and original p49-51 digit table.
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const corpus = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'));
const table = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'));
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];

/** @param {Buffer | number[] | string} data @returns {Buffer} */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest();
}

/** @param {number[]} indices @returns {Record<string, Buffer>} */
function inputs(indices) {
  return {
    gp_unicode: Buffer.from(indices.map(i => corpus.runes[i]).join(''), 'utf8'),
    translit: Buffer.from(indices.map(i => corpus.translit[i]).join(''), 'utf8'),
    index0: Buffer.from(indices),
    prime_ascii: Buffer.from(indices.map(i => corpus.prime[i]).join(','), 'utf8'),
    index1: Buffer.from(indices.map(i => i + 1))
  };
}

assert.equal(sha256('abc').toString('hex'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
assert.equal(table.bytes.length, 256);

const columns = Array.from({ length: 8 }, (_, j) => Buffer.from(Array.from({ length: 32 }, (_, i) => table.bytes[i * 8 + j])));
const horizontal = Array.from({ length: 8 }, (_, j) => Buffer.from(table.bytes.slice(j * 32, j * 32 + 32)));
assert.equal(columns[0].toString('hex'), 'cb5c796d7350fdfe7aa48ed3de7a492ac90a7de7e9f0eb80006e398e446a9071');
assert.equal(horizontal[0].toString('hex'), 'cbe7a7ba61ed7eb75cf99cdef704b7d479ca0f2166893b576dc6ad1996428d85');

const tested = [];
for (let chapter = 0; chapter < chapters.length; chapter += 1) {
  const [lo, hi] = chapters[chapter];
  const indices = corpus.pages.filter(p => p.page >= lo && p.page <= hi).flatMap(p => p.indices);
  for (const [codec, payload] of Object.entries(inputs(indices))) {
    const digest = sha256(payload);
    for (const [orientation, blocks] of [['column', columns], ['horizontal32', horizontal]]) {
      for (let index = 0; index < 8; index += 1) {
        let equalBytes = 0;
        for (let k = 0; k < 32; k += 1) {
          if (digest[k] === blocks[index][k]) equalBytes += 1;
        }
        tested.push({ chapter, pages: [lo, hi], codec, orientation, index, equalBytes, exact: equalBytes === 32 });
      }
    }
  }
}
assert.equal(tested.length, 720);
const imageTests = [];
const chapterImageNumbers = [17, 20, 25, 32, 40, 44, 50, 57, 71];
for (let chapter = 0; chapter < chapterImageNumbers.length; chapter += 1) {
  const filename = String(chapterImageNumbers[chapter]).padStart(2, '0') + '.jpg';
  const originalJpeg = fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', filename));
  const digest = sha256(originalJpeg);
  for (const [orientation, blocks] of [['column', columns], ['horizontal32', horizontal]]) {
    for (let index = 0; index < 8; index += 1) {
      let equalBytes = 0;
      for (let k = 0; k < 32; k += 1) {
        if (digest[k] === blocks[index][k]) equalBytes += 1;
      }
      imageTests.push({ chapter, filename, orientation, index, equalBytes, exact: equalBytes === 32 });
    }
  }
}
assert.equal(imageTests.length, 144);
const allTests = tested.concat(imageTests);
const exact = allTests.filter(x => x.exact);
const max = Math.max(...allTests.map(x => x.equalBytes));
console.log(JSON.stringify({
  protocol: 'p50-8x32-sha256-source-chapters',
  corpus: 'resources/liber-primus/lp2-corpus.json',
  table: 'resources/liber-primus/lp2-grid-256.json',
  chapterRuneCounts: chapters.map(([lo, hi]) =>
    corpus.pages.filter(p => p.page >= lo && p.page <= hi).reduce((total, p) => total + p.indices.length, 0)),
  representations: ['gp_unicode', 'translit', 'index0', 'prime_ascii', 'index1', 'original-opening-jpeg-bytes'],
  orientations: ['column', 'horizontal32'],
  chapterTextTests: tested.length,
  chapterJpegTests: imageTests.length,
  totalTested: allTests.length,
  exact: exact.length,
  maxEqualBytes: max,
  bestCases: allTests.filter(x => x.equalBytes === max)
}, null, 2));
assert.equal(exact.length, 0, 'Exact digest match discovered; inspect input bytes and preserve evidence');
