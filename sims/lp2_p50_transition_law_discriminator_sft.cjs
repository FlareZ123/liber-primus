'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const ALPHAS = [0.1, 0.25, 0.5, 1, 2, 4, 8];
const TOKENS = grid.pages.flatMap(page => page.tokens);
const MASK = Uint8Array.from(TOKENS, token => Number(token[0] === '0'));
const PAGES = corpus.pages.filter(page => page.page <= 55);
const N = PAGES.reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(N, 12956);
assert.equal(MASK.reduce((a, b) => a + b, 0), 60);

/**
 * Build chapter-labelled within-page transitions using the exact LP2 page
 * lengths and the global phase-zero p50 clock.
 * @param {number[]} stream
 * @returns {{chapter:number,prev:number,next:number,z:number}[]}
 */
function transitions(stream) {
  assert.equal(stream.length, N);
  const out = [];
  let offset = 0;
  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);
    for (let i = 0; i + 1 < page.indices.length; i++) {
      out.push({
        chapter,
        prev: stream[offset + i],
        next: stream[offset + i + 1],
        z: MASK[(offset + i) & 255]
      });
    }
    offset += page.indices.length;
  }
  assert.equal(offset, N);
  assert.equal(out.length, 12901);
  return out;
}

/**
 * Count transitions by predecessor, class, and successor.
 * @param {{chapter:number,prev:number,next:number,z:number}[]} rows
 * @returns {number[][][]}
 */
function countMatrix(rows) {
  const counts = Array.from({ length: 29 }, () =>
    Array.from({ length: 2 }, () => new Array(29).fill(0)));
  for (const row of rows) counts[row.prev][row.z][row.next]++;
  return counts;
}

/**
 * Held-out log-likelihood under the diagonal-only model:
 * class-specific P(next=prev), shared off-diagonal successor law per prev.
 * @param {number[][][]} train
 * @param {{chapter:number,prev:number,next:number,z:number}[]} held
 * @param {number} alpha
 * @returns {number}
 */
function diagonalLogLikelihood(train, held, alpha) {
  let ll = 0;
  for (const row of held) {
    const r = row.prev;
    const z = row.z;
    const diag = train[r][z][r];
    const totalZ = train[r][z].reduce((a, b) => a + b, 0);
    const q = (diag + alpha) / (totalZ + 2 * alpha);

    if (row.next === r) {
      ll += Math.log(q);
      continue;
    }

    let offTotal = 0;
    let offCount = 0;
    for (let zz = 0; zz < 2; zz++) {
      for (let s = 0; s < 29; s++) {
        if (s === r) continue;
        offTotal += train[r][zz][s];
        if (s === row.next) offCount += train[r][zz][s];
      }
    }
    const g = (offCount + alpha) / (offTotal + 28 * alpha);
    ll += Math.log1p(-q) + Math.log(g);
  }
  return ll;
}

/**
 * Held-out log-likelihood under the full class-specific transition model.
 * @param {number[][][]} train
 * @param {{chapter:number,prev:number,next:number,z:number}[]} held
 * @param {number} alpha
 * @returns {number}
 */
function fullLogLikelihood(train, held, alpha) {
  let ll = 0;
  for (const row of held) {
    const cells = train[row.prev][row.z];
    const total = cells.reduce((a, b) => a + b, 0);
    const p = (cells[row.next] + alpha) / (total + 29 * alpha);
    ll += Math.log(p);
  }
  return ll;
}

/**
 * Nine-fold leave-one-chapter-out score for one model.
 * @param {{chapter:number,prev:number,next:number,z:number}[]} rows
 * @param {'diagonal'|'full'} model
 * @param {number} alpha
 * @returns {{total:number,folds:number[]}}
 */
function loco(rows, model, alpha) {
  const folds = [];
  for (let holdout = 0; holdout < 9; holdout++) {
    const trainRows = rows.filter(row => row.chapter !== holdout);
    const heldRows = rows.filter(row => row.chapter === holdout);
    const train = countMatrix(trainRows);
    const score = model === 'diagonal'
      ? diagonalLogLikelihood(train, heldRows, alpha)
      : fullLogLikelihood(train, heldRows, alpha);
    folds.push(score);
  }
  return { total: folds.reduce((a, b) => a + b, 0), folds };
}

/**
 * Select a smoothing value on source-native controls only.
 * @param {number[][]} controls
 * @param {'diagonal'|'full'} model
 * @returns {{alpha:number,scores:{alpha:number,total:number}[]}}
 */
function selectAlpha(controls, model) {
  const scores = ALPHAS.map(alpha => ({
    alpha,
    total: controls.reduce(
      (sum, stream) => sum + loco(transitions(stream), model, alpha).total, 0)
  }));
  scores.sort((a, b) => b.total - a.total || a.alpha - b.alpha);
  return { alpha: scores[0].alpha, scores };
}

// Regularization calibration uses only source-native Shakespeare, in disjoint
// N-rune windows. No original LP2 transition outcomes enter alpha selection.
const root = path.resolve(__dirname, '..');
const shakespeare = fs.readFileSync(
  path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const native = encodeSourceNativeGP(shakespeare);
const controlCount = Math.min(8, Math.floor(native.length / N));
assert.ok(controlCount >= 3);
const controls = Array.from({ length: controlCount }, (_, i) =>
  native.slice(i * N, (i + 1) * N));
const diagCalibration = selectAlpha(controls, 'diagonal');
const fullCalibration = selectAlpha(controls, 'full');

const original = PAGES.flatMap(page => page.indices);
const rows = transitions(original);
const diagonal = loco(rows, 'diagonal', diagCalibration.alpha);
const full = loco(rows, 'full', fullCalibration.alpha);
const gains = full.folds.map((value, i) => value - diagonal.folds[i]);

const selected = rows.filter(row => row.z === 1);
const outside = rows.filter(row => row.z === 0);
const repeats = group => group.filter(row => row.prev === row.next).length;
assert.equal(repeats(rows), 86);
assert.equal(repeats(selected), 33);
assert.equal(repeats(outside), 53);

console.log(JSON.stringify({
  model: 'phase0 p50 low60 transition-law discriminator',
  source: {
    transitions: rows.length,
    selectedTransitions: selected.length,
    outsideTransitions: outside.length,
    repeats: repeats(rows),
    selectedRepeats: repeats(selected),
    outsideRepeats: repeats(outside)
  },
  regularizationCalibration: {
    corpus: 'resources/control/shakespeare_first300k.txt',
    disjointWindows: controlCount,
    alphaGrid: ALPHAS,
    diagonal: diagCalibration,
    full: fullCalibration
  },
  originalNineChapterLOCO: {
    diagonalAlpha: diagCalibration.alpha,
    fullAlpha: fullCalibration.alpha,
    diagonalTotal: diagonal.total,
    fullTotal: full.total,
    fullMinusDiagonal: full.total - diagonal.total,
    positiveGainFolds: gains.filter(value => value > 0).length,
    gains,
    diagonalFolds: diagonal.folds,
    fullFolds: full.folds
  }
}, null, 2));
