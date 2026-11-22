'use strict';
/**
 * Source-fixed 16x16 Hill inverse of the printed 256-byte LP2 grid, with
 * optional reversible predecessor-exclusion layer. No fitted matrix entries.
 *
 * Inference score: IoC on original GP rune labels, fit on physical p0..27,
 * freeze configuration and score p28..55, never resetting book-continuous
 * matrix phase at the split.
 *
 * node sims/grid16_hill_source_inverse.cjs
 * Node.js 22, built-ins only, read-only source.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const readJSON = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const CORPUS = readJSON('resources/liber-primus/lp2-corpus.json');
const GRID = readJSON('resources/liber-primus/base60-grid.json');
const PAGES = CORPUS.pages.filter(p => p.status === 'unsolved' && p.indices.length)
  .map(p => ({page: p.page, indices: p.indices}));
const BASE60 = GRID.alphabet;
const BASE59 = BASE60.replace('f', '');
const BYTES60 = GRID.byte_rows.flat();
const BYTES59 = GRID.rows.flat().map(token =>
  BASE59.indexOf(token[0]) * 59 + BASE59.indexOf(token[1]));
assert.equal(BASE60.length, 60);
assert.equal(BASE59.length, 59);
assert(GRID.rows.flat().every(token => !token.includes('f')));
assert(BYTES59.every(value => value >= 0 && value <= 255));
assert.deepEqual(GRID.rows.flat().map(token =>
  BASE60.indexOf(token[0]) * 60 + BASE60.indexOf(token[1])), BYTES60);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(BYTES60.length, 256);
assert.equal(BYTES59.length, 256);
assert.equal(GRID.rows.length, 32);
assert(GRID.rows.every(row => row.length === 8));
const WIDTH = 16;
const mod = value => ((value % 29) + 29) % 29;

/** Invert a non-singular square matrix modulo 29; return determinant and inverse. */
function invert(matrix) {
  const a = matrix.map((row, i) => [
    ...row, ...Array.from({length: WIDTH}, (_, j) => Number(i === j))
  ]);
  let determinant = 1;
  for (let i = 0; i < WIDTH; i++) {
    let pivot = i;
    while (pivot < WIDTH && a[pivot][i] === 0) pivot++;
    if (pivot === WIDTH) return null;
    if (pivot !== i) {
      [a[i], a[pivot]] = [a[pivot], a[i]];
      determinant = mod(-determinant);
    }
    const scalar = a[i][i];
    determinant = mod(determinant * scalar);
    let inverse = 0;
    for (let j = 1; j < 29; j++) if (mod(j * scalar) === 1) inverse = j;
    assert.notEqual(inverse, 0);
    for (let j = 0; j < WIDTH * 2; j++) a[i][j] = mod(a[i][j] * inverse);
    for (let r = 0; r < WIDTH; r++) {
      if (r === i) continue;
      const factor = a[r][i];
      if (factor === 0) continue;
      for (let j = 0; j < WIDTH * 2; j++) {
        a[r][j] = mod(a[r][j] - factor * a[i][j]);
      }
    }
  }
  return {inverse: a.map(row => row.slice(WIDTH)), determinant};
}
const transpose = matrix => matrix[0].map((_, j) => matrix.map(row => row[j]));
function matrixFor(reading, radix = 60) {
  const bytes = radix === 60 ? BYTES60 : BYTES59;
  const order = reading === 'row'
    ? bytes
    : Array.from({length: 256},
      (_, i) => bytes[(i % 32) * 8 + Math.floor(i / 32)]);
  return Array.from({length: WIDTH},
    (_, r) => order.slice(WIDTH * r, WIDTH * (r + 1)).map(v => v % 29));
}
const MATRICES = [60, 59].flatMap(radix =>
  ['row', 'column'].flatMap(reading => {
    const base = matrixFor(reading, radix);
    return [false, true].map(transposed => {
      const matrix = transposed ? transpose(base) : base;
      const inverse = invert(matrix);
      assert(inverse, 'All eight original source matrices must be invertible');
      return {radix, reading, transposed, matrix, ...inverse};
    });
  })
);
assert.deepEqual(MATRICES.map(m => m.determinant),
  [25, 25, 15, 15, 27, 27, 25, 25]);

/** Bijective predecessor-exclusion outer encoder. */
function encodeOuter(pages, mode, reset) {
  const result = [];
  let previous = -1;
  for (const page of pages) {
    if (reset === 'page') previous = -1;
    const indices = [];
    for (const digit of page.indices) {
      const cipher = previous < 0 || mode === 'direct' ? digit :
        mode === 'cyclic' ? (digit === 28 ? previous : mod(previous + digit + 1)) :
        digit === 28 ? previous : digit + Number(digit >= previous);
      indices.push(cipher);
      previous = cipher;
    }
    result.push({page: page.page, indices});
  }
  return result;
}
/** Bijective predecessor-exclusion outer decoder. */
function decodeOuter(pages, mode, reset) {
  const result = [];
  let previous = -1;
  for (const page of pages) {
    if (reset === 'page') previous = -1;
    const indices = [];
    for (const cipher of page.indices) {
      const digit = previous < 0 || mode === 'direct' ? cipher :
        cipher === previous ? 28 :
          mode === 'cyclic' ? mod(cipher - previous - 1) :
            cipher - Number(cipher > previous);
      indices.push(digit);
      previous = cipher;
    }
    result.push({page: page.page, indices});
  }
  return result;
}
function mul(matrix, block) {
  return matrix.map(row => {
    let sum = 0;
    for (let k = 0; k < WIDTH; k++) sum += row[k] * block[k];
    return mod(sum);
  });
}
/**
 * Source-exact Hill block clock. phase positions at start are transported
 * literally and unscored. For book mode, blocks continue across page wraps.
 * No blocks are shifted/reset at the fit/heldout split.
 */
function hill(pages, matrix, reset, phase) {
  const lengths = pages.map(p => p.indices.length);
  const segments = reset === 'page'
    ? pages.map(p => p.indices)
    : [pages.flatMap(p => p.indices)];
  const output = [];
  const evaluated = [];
  const pageOf = [];
  let global = 0;
  for (const segment of segments) {
    const out = segment.slice();
    const mask = new Array(segment.length).fill(false);
    for (let start = phase; start + WIDTH <= segment.length; start += WIDTH) {
      const decoded = mul(matrix, segment.slice(start, start + WIDTH));
      for (let j = 0; j < WIDTH; j++) {
        out[start + j] = decoded[j];
        mask[start + j] = true;
      }
    }
    output.push(...out);
    evaluated.push(...mask);
    global += segment.length;
  }
  assert.equal(global, 12956);
  const rebuilt = [];
  let at = 0;
  for (let i = 0; i < lengths.length; i++) {
    rebuilt.push({page: pages[i].page, indices: output.slice(at, at + lengths[i])});
    for (let j = 0; j < lengths[i]; j++) pageOf.push(pages[i].page);
    at += lengths[i];
  }
  return {pages: rebuilt, stream: output, evaluated, pageOf};
}
/** Training/holdout IoC; reject any block that crosses p27/p28 split. */
function scores(hillOutput, reset, phase) {
  const {stream, evaluated, pageOf} = hillOutput;
  const train = [], heldout = [];
  const cut = pageOf.findIndex(p => p >= 28);
  assert(cut > 0);
  if (reset === 'book') {
    for (let pos = 0; pos < stream.length; pos++) {
      if (!evaluated[pos]) continue;
      const blockStart = phase + Math.floor((pos - phase) / WIDTH) * WIDTH;
      if (blockStart < cut && blockStart + WIDTH > cut) continue;
      (pos < cut ? train : heldout).push(stream[pos]);
    }
  } else {
    for (let i = 0; i < stream.length; i++) {
      if (evaluated[i]) (pageOf[i] < 28 ? train : heldout).push(stream[i]);
    }
  }
  return {trainIoC: ioc(train), heldoutIoC: ioc(heldout),
    trainRunes: train.length, heldoutRunes: heldout.length};
}
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  const pairs = values.length * (values.length - 1);
  assert(pairs > 0);
  return counts.reduce((n, count) => n + count * (count - 1), 0) / pairs;
}
function allModels(ciphertext) {
  const rows = [];
  for (const key of MATRICES)
    for (const outer of ['direct', 'cyclic', 'sorted'])
      for (const reset of ['book', 'page']) {
        const rank = decodeOuter(ciphertext, outer, reset);
        for (let phase = 0; phase < WIDTH; phase++) {
          const transformed = hill(rank, key.inverse, reset, phase);
          rows.push({
            radix: key.radix, reading: key.reading, transposed: key.transposed,
            outer, reset, phase,
            ...scores(transformed, reset, phase)
          });
        }
      }
  assert.equal(rows.length, 768);
  rows.sort((a, b) => b.trainIoC - a.trainIoC);
  return rows;
}
/** Build 12,956 GP-English control runes from a disjoint Shakespeare suffix. */
function sourcePlain() {
  const text = fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const translit = CORPUS.translit.map((word, index) => ({word, index}))
    .sort((a, b) => b.word.length - a.word.length);
  const input = text.slice(-65000).toUpperCase().match(/[A-Z]+/g) || [];
  const tokens = [];
  for (let word of input) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    for (let i = 0; i < word.length;) {
      const match = translit.find(t => word.startsWith(t.word, i));
      if (match) {tokens.push(match.index); i += match.word.length;}
      else {i++;} // untranslated source spelling is ignored
    }
  }
  assert(tokens.length >= 12956);
  let at = 0;
  return PAGES.map(page => {
    const indices = tokens.slice(at, at + page.indices.length);
    assert.equal(indices.length, page.indices.length);
    at += indices.length;
    return {page: page.page, indices};
  });
}
function run() {
  const original = allModels(PAGES);
  const key = MATRICES.find(k => k.radix === 60 && k.reading === 'column' && !k.transposed);
  const config = {outer: 'sorted', reset: 'page', phase: 5};
  const plain = sourcePlain();
  const inner = hill(plain, key.matrix, config.reset, config.phase).pages;
  const encrypted = encodeOuter(inner, config.outer, config.reset);
  const decodedOuter = decodeOuter(encrypted, config.outer, config.reset);
  const recovered = hill(decodedOuter, key.inverse, config.reset, config.phase);
  const restored = recovered.pages;
  assert.deepEqual(restored, plain, 'True source key must recover every planted GP rune');
  assert.deepEqual(encodeOuter(hill(restored, key.matrix,
    config.reset, config.phase).pages, config.outer, config.reset), encrypted,
    'Recovered source-native plaintext must exactly re-encrypt');
  const positives = allModels(encrypted);
  const targetRank = positives.findIndex(row => row.radix === key.radix && row.reading === key.reading
    && row.transposed === key.transposed && row.outer === config.outer
    && row.reset === config.reset && row.phase === config.phase) + 1;
  assert.equal(targetRank, 1, 'True source key must rank first');
  const originalBest = original[0];
  const perRadix = [60, 59].map(radix => {
    const modes = original.filter(row => row.radix === radix);
    assert.equal(modes.length, 384);
    const chosen = modes[0];
    const matrix = MATRICES.find(key => key.radix === chosen.radix
      && key.reading === chosen.reading
      && key.transposed === chosen.transposed);
    assert(matrix);
    const recovered = hill(decodeOuter(PAGES, chosen.outer, chosen.reset),
      matrix.inverse, chosen.reset, chosen.phase).pages;
    const reencrypted = encodeOuter(hill(recovered, matrix.matrix,
      chosen.reset, chosen.phase).pages, chosen.outer, chosen.reset);
    assert.deepEqual(reencrypted, PAGES,
      'Every original rune must exactly forward-reencrypt under the selected inverse');
    return {radix, bestTraining: chosen, originalReencryptedRunes: 12956,
      postselectedMaximumHeldout: Math.max(...modes.map(row => row.heldoutIoC))};
  });
  assert(originalBest.heldoutIoC < 0.04);
  return {
    classification: 'Exact source-grid 16x16 Hill inverse, bounded negative on original LP2',
    source: '32x8 original physical LP2 numeric table, both radix60 and radix59 interpretations, 12956 source runes',
    originalCipherRunes: 12956, sourceMatrixDeterminants: MATRICES.map(m => ({
      radix: m.radix, reading: m.reading, transposed: m.transposed, determinantMod29: m.determinant
    })),
    modelCount: original.length,
    trainBest: originalBest,
    perRadix,
    originalOtherTrainBest: original.slice(1, 5),
    originalLargestHeldoutPostselected: Math.max(...original.map(x => x.heldoutIoC)),
    sourceNativeControl: {trueKey: {...config, radix: key.radix, reading: key.reading, transposed: key.transposed},
      targetRank, recoveredRunes: 12956, reencryptedRunes: 12956,
      trueTrainingIoC: positives[0].trainIoC,
      trueHeldoutIoC: positives[0].heldoutIoC},
    caution: 'Neither grid-to-matrix reading nor Hill geometry is known authentic. Reversible outer ranks encode every output including duplicates; unmodeled ciphertext rewrites can invalidate this inverse. No unknown LP2 plaintext or key recovered.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, invert, matrixFor, encodeOuter, decodeOuter, hill, scores, sourcePlain};
