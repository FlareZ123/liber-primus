'use strict';

/**
 * Exact original-LP2 test for a fixed-width, within-block no-repeat cipher.
 * Run from any working directory with Node.js:
 *   node sims/lp2_repeat_phase5_original_gate.cjs
 *
 * Source: canonical LP2 pages 0..55, with the numeric-only p50 retained.
 * For a hard no-repeat k-symbol block encoder, adjacent equal ciphertext
 * symbols must fall at the same second-symbol residue modulo k for each
 * page, even if an adversary chooses a different block offset per page.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

/** @typedef {{page:number, indices:number[]}} RunePage */

/**
 * @param {RunePage[]} pages
 * @param {number} width
 * @returns {{width:number, total:number, affected:number, conflicting:number, minimumExceptions:number, globalHistogram:number[], pageHistogram:number[]}}
 */
function analyze(pages, width) {
  let globalOffset = 0;
  let total = 0;
  let affected = 0;
  let conflicting = 0;
  let minimumExceptions = 0;
  const globalHistogram = Array(width).fill(0);
  const pageHistogram = Array(width).fill(0);

  for (const page of pages) {
    const local = Array(width).fill(0);
    for (let i = 1; i < page.indices.length; i++) {
      if (page.indices[i] !== page.indices[i - 1]) continue;
      local[i % width]++;
      pageHistogram[i % width]++;
      globalHistogram[(globalOffset + i) % width]++;
      total++;
    }
    const pageTotal = local.reduce((a, b) => a + b, 0);
    if (pageTotal) {
      affected++;
      const exceptions = pageTotal - Math.max(...local);
      minimumExceptions += exceptions;
      if (exceptions) conflicting++;
    }
    globalOffset += page.indices.length;
  }
  return {
    width, total, affected, conflicting, minimumExceptions,
    globalHistogram, pageHistogram,
  };
}

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const original = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
assert.equal(original.length, 56);
assert.equal(original.reduce((n, p) => n + p.indices.length, 0), 12956);

const result = analyze(original, 5);
assert.deepEqual(result, {
  width: 5, total: 86, affected: 42, conflicting: 19,
  minimumExceptions: 34,
  globalHistogram: [18, 21, 16, 11, 20],
  pageHistogram: [18, 20, 22, 15, 11],
});

/* Synthetic positive control: a different unknown phase on every page. */
const synthetic = [0, 1, 2, 3].map((phase, page) => {
  const indices = Array.from({length: 101}, (_, i) => i % 29);
  for (let i = 1; i < indices.length; i++) {
    if (i % 5 === phase) indices[i] = indices[i - 1];
  }
  return {page, indices};
});
const control = analyze(synthetic, 5);
assert.equal(control.conflicting, 0);
assert.equal(control.minimumExceptions, 0);
assert.equal(control.affected, 4);

console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  original: result,
  syntheticControl: control,
  interpretation: 'Fixed 5-rune hard no-repeat blocks fail on original LP2 even with an arbitrary independent phase per printed page. Variable-state, soft filtering, and other framing are not excluded.',
}, null, 2));
