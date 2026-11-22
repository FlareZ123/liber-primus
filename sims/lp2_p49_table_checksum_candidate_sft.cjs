#!/usr/bin/env node
'use strict';

// Exploratory, source-derived checksum candidate for the p49–51 table section.
// Run from the repository root with: node sims/lp2_p49_table_checksum_candidate_sft.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
const grid = read('resources/liber-primus/lp2-grid-256.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');

const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
const base60 = tokens.map((t) => {
  assert.equal(t.length, 2);
  return 60 * alphabet60.indexOf(t[0]) + alphabet60.indexOf(t[1]);
});
const base59 = tokens.map((t) => {
  assert.notEqual(alphabet59.indexOf(t[0]), -1);
  assert.notEqual(alphabet59.indexOf(t[1]), -1);
  return 59 * alphabet59.indexOf(t[0]) + alphabet59.indexOf(t[1]);
});
assert.deepEqual(base60, grid.bytes);

const sum = (a) => a.reduce((s, x) => s + x, 0);
const mod = (n, m) => ((n % m) + m) % m;
const rings = [[], [], [], []];
for (let r = 0; r < 32; r += 1) {
  for (let c = 0; c < 8; c += 1) {
    const depth = Math.min(r, 31 - r, c, 7 - c);
    rings[depth].push(base60[r * 8 + c]);
  }
}
assert.deepEqual(rings.map((x) => x.length), [76, 68, 60, 52]);

const p49 = corpus.pages.find((p) => p.page === 49).indices;
const p51 = corpus.pages.find((p) => p.page === 51).indices;
assert.equal(p49.length, 66);
assert.equal(p51.length, 92);

// Manual visual observation from original LP2 image 66.jpg:
// the red marker immediately before the table has ten isolated red squares.
// The table has four concentric rectangular rings by 32x8 geometry.
const markerDots = 10;
const ringCount = rings.length;
const tableSum = sum(base60);

const out = {
  classification: 'exploratory checksum candidate; not a decryption',
  sourceInputs: [
    'resources/liber-primus/lp2-grid-256.json',
    'resources/liber-primus/lp2-corpus.json',
    'original LP2 image 66.jpg (visual count of red marker dots)',
  ],
  base60: {
    sum: tableSum,
    mod29: mod(tableSum, 29),
    mod3301: mod(tableSum, 3301),
    plusFour: tableSum + ringCount,
    tenTimes3301: markerDots * 3301,
    checksumEqual: tableSum + ringCount === markerDots * 3301,
  },
  competingBase59: {
    sum: sum(base59),
    mod3301: mod(sum(base59), 3301),
    sameChecksum: sum(base59) + ringCount === markerDots * 3301,
  },
  rings: rings.map((values, i) => ({
    index: i,
    cells: values.length,
    sum: sum(values),
    sumMod29: mod(sum(values), 29),
  })),
  p49Prologue: {
    runes: p49.length,
    indexSum: sum(p49),
    indexSumMod29: mod(sum(p49), 29),
    visuallyObservedMarkerDots: markerDots,
  },
  p51Postlude: {
    runes: p51.length,
    indexSum: sum(p51),
    indexSumMod29: mod(sum(p51), 29),
    note: 'No distinct 13-dot visual marker was independently identified in original image 68.jpg.',
  },
  limitations: [
    'No source instruction has been found that explicitly tells a solver to sum these blocks.',
    'The 4 has multiple possible referents (four rings, degree-four HxG factor, or other page structure).',
    'The table sum depends on the current canonical base60 transcription; not every cell has been independently re-adjudicated from the original image in this experiment.',
    'A checksum match does not recover plaintext or identify the intended cipher.',
  ],
};

assert.equal(out.base60.sum, 33006);
assert.equal(out.base60.mod29, 4);
assert.equal(out.base60.mod3301, 3297);
assert.equal(out.base60.checksumEqual, true);
assert.equal(out.competingBase59.sum, 32499);
assert.equal(out.p49Prologue.indexSumMod29, 10);
assert.equal(out.p51Postlude.indexSumMod29, 13);
console.log(JSON.stringify(out, null, 2));
