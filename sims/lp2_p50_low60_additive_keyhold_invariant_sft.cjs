'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const PAGES = corpus.pages.filter((page) => page.page <= 55);
const N = PAGES.reduce((sum, page) => sum + page.indices.length, 0);
const MASK = Uint8Array.from(
  grid.pages.flatMap((page) => page.tokens),
  (token) => Number(token[0] === '0')
);

assert.equal(N, 12956);
assert.equal(MASK.length, 256);
assert.equal(MASK.reduce((a, b) => a + b, 0), 60);

/**
 * Extract within-page transition differences at frozen low60 positions.
 * @param {number[]} stream
 * @returns {number[]}
 */
function lowDifferences(stream) {
  assert.equal(stream.length, N);
  const out = [];
  let offset = 0;
  for (const page of PAGES) {
    for (let local = 0; local + 1 < page.indices.length; local += 1) {
      const global = offset + local;
      if (!MASK[global & 255]) continue;
      out.push((stream[global + 1] - stream[global] + 29) % 29);
    }
    offset += page.indices.length;
  }
  assert.equal(out.length, 3025);
  return out;
}

/** @param {number[]} diffs @returns {number[]} */
function histogram(diffs) {
  const counts = new Array(29).fill(0);
  for (const value of diffs) counts[value] += 1;
  return counts;
}

function main() {
  const original = PAGES.flatMap((page) => page.indices);
  const originalHist = histogram(lowDifferences(original));
  assert.equal(originalHist[0], 33);

  const root = path.resolve(__dirname, '..');
  const source = fs.readFileSync(
    path.join(root, 'resources/control/shakespeare_first300k.txt'),
    'utf8'
  );
  const native = encodeSourceNativeGP(source);
  const controls = [];
  const controlCount = Math.min(8, Math.floor(native.length / N));
  assert.equal(controlCount, 8);

  for (let i = 0; i < controlCount; i += 1) {
    const stream = native.slice(i * N, (i + 1) * N);
    const hist = histogram(lowDifferences(stream));
    controls.push({
      index: i,
      zeroDifferences: hist[0],
      histogram: hist,
    });
  }

  const zeroCounts = controls.map((item) => item.zeroDifferences);
  const belowOrEqualOriginal = zeroCounts.filter((value) => value <= originalHist[0]).length;

  console.log(JSON.stringify({
    status: 'PASS',
    hypothesis:
      'If the additive running key is held across every low60 transition, then C[i+1]-C[i] equals the native plaintext transition difference at all 3025 low60 opportunities.',
    original: {
      low60Transitions: originalHist.reduce((a, b) => a + b, 0),
      zeroDifferences: originalHist[0],
      histogram: originalHist,
    },
    sourceNativeControls: {
      corpus: 'resources/control/shakespeare_first300k.txt',
      windows: controls,
      zeroDifferenceRange: [Math.min(...zeroCounts), Math.max(...zeroCounts)],
      zeroDifferenceMean: zeroCounts.reduce((a, b) => a + b, 0) / zeroCounts.length,
      controlsAtOrBelowOriginal: belowOrEqualOriginal,
    },
    decision:
      belowOrEqualOriginal === 0
        ? 'Reject deterministic low60 additive-key hold in this source-native plaintext register: every independent native control has more zero differences at the exact held positions.'
        : 'Zero-difference count alone does not reject deterministic low60 additive-key hold.',
  }, null, 2));
}

main();
