'use strict';

/**
 * LP2 terminal 32x8 / 76+180 literal five-point-Laplacian gate.
 * No secret parameters, output language model, or unknown p55 runes.
 * Run from the repository root: node sims/lp2_terminal_grid_laplacian_p57_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const mod = (x) => ((x % 29) + 29) % 29;
const W = 8;
const H = 32;
const cells = grid.pages.flatMap((p) => p.bytes);
assert.equal(cells.length, W * H);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(cells)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
assert.equal((W - 2) * (H - 2), 85 + 95);
assert.equal(W * H - (W - 2) * (H - 2), 76);

const p57 = corpus.pages[57].indices;
const known = new Map();
for (let i = 0; i < p57.length; i++) {
  const interiorIndex = 85 + i;
  const row = 1 + Math.floor(interiorIndex / (W - 2));
  const col = 1 + interiorIndex % (W - 2);
  known.set(row * W + col, p57[i]);
}

/** Four-neighbor discrete Laplacian over GF(29); row and column are native 32x8. */
function laplacianAt(data, index) {
  const row = Math.floor(index / W);
  const col = index % W;
  const up = row > 0 ? data[index - W] : 0;
  const down = row + 1 < H ? data[index + W] : 0;
  const left = col > 0 ? data[index - 1] : 0;
  const right = col + 1 < W ? data[index + 1] : 0;
  return mod(4 * data[index] - up - down - left - right);
}

// The 56 targets have five source-independent known runes (centre plus neighbors).
const sites = [...known.keys()].filter((index) =>
  [index, index - W, index + W, index - 1, index + 1].every((n) => known.has(n))
);
assert.equal(sites.length, 56);
const complete = Array(W * H).fill(0);
for (const [index, rune] of known) complete[index] = rune;
const mismatches = [];
for (const index of sites) {
  const predicted = laplacianAt(complete, index);
  const actual = cells[index] % 29;
  if (predicted !== actual) {
    mismatches.push({ index, row: Math.floor(index / W), col: index % W, predicted, actual });
  }
}
assert.equal(sites.length - mismatches.length, 2);
assert.deepEqual(mismatches[0], { index: 130, row: 16, col: 2, predicted: 1, actual: 28 });

// Exact positive: generate a full source-shaped native-GP plaintext, keep the
// original clear p57 at its true 95 interior positions, encrypt with this
// precise five-point rule, then check every 56 untouched internal p57 sites.
const plantedPlain = Array.from({ length: W * H }, (_, i) => mod(17 * i + i * i + 11));
for (const [index, rune] of known) plantedPlain[index] = rune;
const plantedCipher = plantedPlain.map((_, index) => laplacianAt(plantedPlain, index));
assert.equal(sites.filter((index) =>
  plantedCipher[index] === laplacianAt(complete, index)
).length, 56);

// A deterministic source-record lock for all 56 direct equations, rather
// than a language score on the best looking subset.
console.log(JSON.stringify({
  operation: 'C[r,c]=4P[r,c]-P[r-1,c]-P[r+1,c]-P[r,c-1]-P[r,c+1] (mod 29)',
  table: '32 rows x 8 columns; base60 bytes reduced mod29',
  originalSource: 'p57 95 printed clear GP runes in last 95 interior slots',
  originalEligibleEquations: sites.length,
  originalAgreements: sites.length - mismatches.length,
  originalDisagreements: mismatches.length,
  firstDisagreements: mismatches.slice(0, 6),
  plantedKnownEquationsRecovered: 56,
  conclusion: 'The direct terminal code is inconsistent before using any unknown p55 rune.'
}, null, 2));
