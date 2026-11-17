'use strict';

/**
 * Exact all-secret F16 recurrence test with source-visible reset clocks.
 *
 * Reuses the source parser and p50 factor16 from
 * lp2_p50_f16_allseed_singleton_original_sft.cjs.
 * Tests one identical unknown 16-symbol seed reset at every rune-bearing
 * physical page, and separately at each of the nine printed chapters.
 *
 * This is not an independent seed per page/chapter, nor a nonlinear/F-skip
 * receiver. Every original A/I singleton constraint is exact and held out.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const base = require('./lp2_p50_f16_allseed_singleton_original_sft.cjs');

const root = path.resolve(__dirname, '..');
const N = 12956;
const D = 16;
const mod = (x) => (x % 29 + 29) % 29;
const trueSeed = [10, 3, 20, 22, 1, 22, 21, 25, 11, 17, 19, 7, 21, 17, 12, 22];

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
  for (let pivot = 0; pivot < D; pivot++) {
    let q = pivot;
    while (q < D && a[q][pivot] === 0) q++;
    assert.ok(q < D, 'Anchor matrix is singular');
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

function enumerate(options, anchorIndices, weights) {
  const anchorOptions = anchorIndices.map((i) => options[i]);
  const heldIndices = options.map((_, i) => i)
    .filter((i) => !anchorIndices.includes(i));
  const heldOptions = heldIndices.map((i) => options[i]);
  let valid = 0;
  let maxMatched = 0;
  let maxMask = -1;
  for (let mask = 0; mask < (1 << D); mask++) {
    const anchor = Array.from({ length: D }, (_, i) =>
      anchorOptions[i][(mask >>> i) & 1]);
    let matches = D;
    for (let j = 0; j < weights.length; j++) {
      const predicted = dot(weights[j], anchor);
      if (predicted === heldOptions[j][0] || predicted === heldOptions[j][1]) {
        matches++;
      }
    }
    if (matches > maxMatched) {
      maxMatched = matches;
      maxMask = mask;
    }
    if (matches === options.length) valid++;
  }
  return { valid, maxMatched, maxMask, anchorCount: D, heldOutCount: heldOptions.length };
}

function runClock(name, resetLengths, singles, p57, f) {
  const rows = resetFunctionals(f, resetLengths);
  assert.equal(rows.length, N);
  const singletonRows = singles.map((s) => rows[s.offset]);
  const basis = firstIndependentRows(singletonRows);
  assert.equal(basis.rank, D, name + ' anchor rank');
  const anchorRows = basis.indices.map((i) => singletonRows[i]);
  const inverse = invert16(anchorRows);
  const heldRows = singletonRows.filter((_, i) => !basis.indices.includes(i));
  const weights = heldRows.map((row) => Array.from({ length: D }, (_, j) =>
    mod(row.reduce((sum, x, i) => sum + x * inverse[i][j], 0))));
  const options = singles.map((s) => [mod(s.c - 24), mod(s.c - 10)]);
  const observed = enumerate(options, basis.indices, weights);
  assert.equal(observed.valid, 0, name + ' original must have no A/I seed');

  // Native source-shaped positive: solved p57 GP text, with A/I planted at
  // the exact 83 original singleton offsets, encrypted with the p15 seed.
  const plaintext = Array.from({ length: N }, (_, i) => p57[i % p57.length]);
  singles.forEach((s, i) => { plaintext[s.offset] = (i & 1) ? 10 : 24; });
  const ciphertext = plaintext.map((p, i) => mod(p + dot(rows[i], trueSeed)));
  const plantedOptions = singles.map((s) => [
    mod(ciphertext[s.offset] - 24), mod(ciphertext[s.offset] - 10)
  ]);
  const planted = enumerate(plantedOptions, basis.indices, weights);
  assert.equal(planted.valid, 1, name + ' positive must recover unique seed');
  assert.equal(planted.maxMatched, 83);

  const anchorKey = basis.indices.map((i) => dot(singletonRows[i], trueSeed));
  const recoveredSeed = inverse.map((row) => dot(row, anchorKey));
  assert.deepEqual(recoveredSeed, trueSeed);
  const recovered = ciphertext.map((c, i) => mod(c - dot(rows[i], recoveredSeed)));
  assert.deepEqual(recovered, plaintext);
  const forward = recovered.map((p, i) => mod(p + dot(rows[i], recoveredSeed)));
  assert.deepEqual(forward, ciphertext);

  return {
    clock: name,
    resetCount: resetLengths.length,
    resetLengths,
    anchorSingletonIndices: basis.indices,
    anchorOffsets: basis.indices.map((i) => singles[i].offset),
    observed,
    positive: planted,
    recoveredSeed,
    exactPositiveRecovery: recovered.length,
    exactPositiveForwardReconstruction: forward.length
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

  const page = runClock('same-secret-seed-reset-at-each-rune-bearing-page',
    pageLengths, singles, p57, f);
  const chapter = runClock('same-secret-seed-reset-at-each-printed-chapter',
    chapterLengths, singles, p57, f);
  assert.deepEqual([page.observed.valid, page.observed.maxMatched, page.observed.maxMask],
    [0, 30, 17750]);
  assert.deepEqual([chapter.observed.valid, chapter.observed.maxMatched, chapter.observed.maxMask],
    [0, 31, 12944]);

  console.log(JSON.stringify({
    status: 'PASS: exact original-input reset-clock exclusions and unique native-GP positives',
    original: { runes: N, words: 2896, singletonWords: 83, f16: f },
    pageReset: page,
    chapterReset: chapter
  }, null, 2));
}

if (require.main === module) main();
