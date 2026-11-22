'use strict';

/**
 * Exact all-secret A/I/O F16 recurrence tests with source-visible reset clocks.
 *
 * Reuses the canonical source parser, p50 factor16 and exact 3^16 MITM
 * receiver from the book-global original-input SFT. Tests one identical
 * unknown 16-symbol seed reset at every rune-bearing physical page, and
 * separately at each of the nine printed chapters.
 *
 * Not an independent seed per page/chapter; not a nonlinear/F-skip receiver.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const base = require('./lp2_p50_f16_allseed_singleton_original_sft.cjs');
const { recover } = require('./lp2_p50_f16_allseed_aio_mitm_original_sft.cjs');

const root = path.resolve(__dirname, '..');
const N = 12956;
const D = 16;
const mod = (x) => (x % 29 + 29) % 29;
const trueSeed = [10, 3, 20, 22, 1, 22, 21, 25, 11, 17, 19, 7, 21, 17, 12, 22];
const nativeSingletons = [24, 10, 3]; // GP29 A/I/O

function seedFunctionalsForLength(f, length) {
  const rows = [];
  for (let t = 0; t < length; t++) {
    const row = Array(D).fill(0);
    if (t < D) row[t] = 1;
    else for (let lag = 1; lag <= D; lag++) {
      const a = mod(-f[lag]);
      for (let k = 0; k < D; k++) {
        row[k] = mod(row[k] + a * rows[t - lag][k]);
      }
    }
    rows.push(row);
  }
  return rows;
}

function resetFunctionals(f, resetLengths) {
  assert.equal(resetLengths.reduce((a, b) => a + b, 0), N);
  const local = seedFunctionalsForLength(f, Math.max(...resetLengths));
  return resetLengths.flatMap((length) => local.slice(0, length));
}

function firstIndependentRows(rows) {
  const pivots = [];
  const indices = [];
  for (let index = 0; index < rows.length; index++) {
    let v = rows[index].slice();
    for (const pivot of pivots) {
      const factor = v[pivot.col];
      if (factor) for (let j = 0; j < D; j++) {
        v[j] = mod(v[j] - factor * pivot.row[j]);
      }
    }
    const col = v.findIndex((x) => x !== 0);
    if (col < 0) continue;
    let inverse;
    for (let x = 1; x < 29; x++) {
      if (mod(x * v[col]) === 1) { inverse = x; break; }
    }
    v = v.map((x) => mod(x * inverse));
    pivots.push({ col, row: v });
    indices.push(index);
    if (indices.length === D) break;
  }
  return { rank: indices.length, indices };
}

function invert16(matrix) {
  const a = matrix.map((row, i) => [
    ...row, ...Array.from({ length: D }, (_, j) => (i === j ? 1 : 0))
  ]);
  assert.equal(a.length, D);
  for (let pivot = 0; pivot < D; pivot++) {
    let q = pivot;
    while (q < D && a[q][pivot] === 0) q++;
    assert.ok(q < D, 'Source anchor matrix is singular');
    [a[pivot], a[q]] = [a[q], a[pivot]];
    let inverse;
    for (let x = 1; x < 29; x++) {
      if (mod(x * a[pivot][pivot]) === 1) { inverse = x; break; }
    }
    for (let j = 0; j < 2 * D; j++) a[pivot][j] = mod(a[pivot][j] * inverse);
    for (let i = 0; i < D; i++) if (i !== pivot) {
      const factor = a[i][pivot];
      for (let j = 0; j < 2 * D; j++) {
        a[i][j] = mod(a[i][j] - factor * a[pivot][j]);
      }
    }
  }
  return a.map((row) => row.slice(D));
}

function dot(row, seed) {
  let value = 0;
  for (let i = 0; i < D; i++) value += row[i] * seed[i];
  return value % 29;
}

function runClock(name, resetLengths, singles, p57, f) {
  const rows = resetFunctionals(f, resetLengths);
  assert.equal(rows.length, N);
  const singletonRows = singles.map((s) => rows[s.offset]);
  const basis = firstIndependentRows(singletonRows);
  assert.equal(basis.rank, D, name + ' must have 16 independent source anchors');
  const anchorRows = basis.indices.map((i) => singletonRows[i]);
  const inverse = invert16(anchorRows);
  const heldIndices = singles.map((_, i) => i)
    .filter((i) => !basis.indices.includes(i));
  const weights = heldIndices.map((i) => Array.from({ length: D }, (_, j) =>
    mod(singletonRows[i].reduce((sum, x, k) => sum + x * inverse[k][j], 0))));
  const orderedIndices = basis.indices.concat(heldIndices);
  const orderedSingles = orderedIndices.map((i) => singles[i]);

  // Exact 3^16 A/I/O meet-in-the-middle over all secret anchor states.
  const original = recover(orderedSingles.map((s) => s.c), weights, inverse);

  // Native source-shaped positive: p57 repeated, A/I/O planted at the
  // exact 83 source singleton offsets, then encrypted with the p15 seed.
  const plaintext = Array.from({ length: N }, (_, i) => p57[i % p57.length]);
  singles.forEach((s, i) => {
    plaintext[s.offset] = nativeSingletons[i % nativeSingletons.length];
  });
  const ciphertext = plaintext.map((p, i) => mod(p + dot(rows[i], trueSeed)));
  const positive = recover(orderedSingles.map((s) => ciphertext[s.offset]), weights, inverse);
  assert.equal(positive.fullSolutions, 1, name + ' positive must recover a unique seed');
  assert.deepEqual(positive.solutions[0], trueSeed);
  assert.equal(positive.longestMatchedPrefix, 83);

  const recovered = ciphertext.map((c, i) => mod(c - dot(rows[i], positive.solutions[0])));
  assert.deepEqual(recovered, plaintext);
  const reencrypted = recovered.map((p, i) => mod(p + dot(rows[i], positive.solutions[0])));
  assert.deepEqual(reencrypted, ciphertext);

  return {
    clock: name,
    resetCount: resetLengths.length,
    resetLengths,
    anchorSingletonIndices: basis.indices,
    anchorOffsets: basis.indices.map((i) => singles[i].offset),
    firstFourHeldoutOffsets: heldIndices.slice(0, 4).map((i) => singles[i].offset),
    original: {
      fullSolutions: original.fullSolutions,
      firstFourPass: original.firstFourPass,
      longestMatchedPrefix: original.longestMatchedPrefix,
      recoveredUnknownPlaintext: original.fullSolutions > 0
    },
    positive: {
      fullSolutions: positive.fullSolutions,
      firstFourPass: positive.firstFourPass,
      recoveredSeed: positive.solutions[0],
      exactRoundTripSymbols: recovered.length
    }
  };
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const transcription = fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
  const grid = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

  const f = base.factor16();
  const rem = bytes.map(mod);
  for (let i = 0; i < 240; i++) {
    const q = rem[i];
    for (let j = 0; j < f.length; j++) rem[i + j] = mod(rem[i + j] - q * f[j]);
  }
  assert.ok(rem.every((x) => x === 0), 'p50 factor16 source relation');

  const singles = base.singlesFromOriginal(transcription, corpus.runes);
  const p57 = corpus.pages.find((p) => p.page === 57).indices;
  const pageLengths = corpus.pages
    .filter((p) => p.page <= 55 && p.indices.length > 0)
    .map((p) => p.indices.length);
  const chapterGroups = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
    [27, 32], [33, 39], [40, 53], [54, 55]];
  const chapterLengths = chapterGroups.map(([a, b]) =>
    corpus.pages.filter((p) => p.page >= a && p.page <= b)
      .reduce((sum, p) => sum + p.indices.length, 0));
  assert.equal(pageLengths.length, 55);
  assert.equal(chapterLengths.length, 9);
  assert.equal(pageLengths.reduce((a, b) => a + b, 0), N);
  assert.equal(chapterLengths.reduce((a, b) => a + b, 0), N);

  const page = runClock('same-secret-seed-reset-at-each-rune-bearing-page',
    pageLengths, singles, p57, f);
  const chapter = runClock('same-secret-seed-reset-at-each-printed-chapter',
    chapterLengths, singles, p57, f);

  console.log(JSON.stringify({
    status: 'PASS: exact source-original A/I/O reset-clock MITM gates and unique native-GP positives',
    original: { runes: N, words: 2896, singletonWords: 83, keyFamily: 'p50 F16 over GF29' },
    pageReset: page,
    chapterReset: chapter
  }, null, 2));
}

if (require.main === module) main();
