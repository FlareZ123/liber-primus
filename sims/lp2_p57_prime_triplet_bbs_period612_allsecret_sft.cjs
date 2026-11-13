/**
 * All-secret 612-step periodic-state source gate for the 2013
 * p57 PARABLE three-prime BBS construction.
 *
 * Source inputs: 1031*1229*1259 in the original 2013 761.MP3 metadata;
 * 1031*1259 is a Blum modulus and 1229 its remaining seed.
 *
 * This excludes only stationary state-dependent bijections under finite
 * source-native English controls. It does not infer a historical BBS key.
 *
 * Run: node sims/lp2_p57_prime_triplet_bbs_period612_allsecret_sft.cjs
 * Dependencies: Node.js built-ins plus project's proven GP29 source encoder.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const unknown = gp.pages.filter(page => page.page <= 55 && page.indices.length);
const fullBook = unknown.flatMap(page => page.indices);
assert.equal(unknown.length, 55);
assert.equal(fullBook.length, 12956);

const P = 1031, Q = 1259, SEED = 1229, N = P * Q;
assert.equal(P * Q * SEED, 1595277641);
assert.equal(P % 4, 3);
assert.equal(Q % 4, 3);

/**
 * Exact return time to the initial state under the actual source seed,
 * with assertion that there is no earlier repeated state.
 * @param {number} seed
 */
function exactPeriod(seed) {
  let state = seed;
  const seen = new Set();
  while (!seen.has(state)) {
    seen.add(state);
    state = state * state % N;
  }
  assert.equal(state, seed, 'source state is a pure periodic orbit');
  return seen.size;
}
const PERIOD = exactPeriod(SEED);
assert.equal(PERIOD, 612);
assert.equal(exactPeriod(SEED * SEED % N), 612);

// Original visual chapter boundaries determined from the red headings.
const chapterCuts = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const chapters = chapterCuts.map(([first, last]) =>
  unknown.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices));
assert.equal(chapters.flat().length, 12956);

/**
 * Positions separated by the exact state period must be treated by
 * the same hidden bijection; symbol equalities are therefore invariant.
 * @param {number[][]} parts
 */
function equalAtPeriod(parts) {
  let hits = 0, comparisons = 0;
  for (const part of parts) {
    for (let i = 0; i + PERIOD < part.length; i++) {
      hits += Number(part[i] === part[i + PERIOD]);
      comparisons++;
    }
  }
  return { hits, comparisons, rate: hits / comparisons };
}
const original = {
  book: equalAtPeriod([fullBook]),
  chapter: equalAtPeriod(chapters),
};
assert.deepEqual(
  [original.book.hits, original.book.comparisons], [455, 12344]);
assert.deepEqual(
  [original.chapter.hits, original.chapter.comparisons], [272, 7752]);

/**
 * A concrete arbitrary secret affine bijection fixed separately for each
 * BBS state; no cipher parameters are estimated from real ciphertext.
 * State-specific slope is never zero in prime field GF29.
 * @param {number[]} plain
 */
function stateBijectiveEncrypt(plain) {
  let state = SEED;
  return plain.map(value => {
    const slope = 1 + state % 28;
    const shift = state * 3 % 29;
    const cipher = (value * slope + shift) % 29;
    state = state * state % N;
    return cipher;
  });
}
const solvedP57 = gp.pages.find(p => p.page === 57).indices;
const reference57 = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split('### 57\n')[1];
assert.deepEqual(encodeSourceNativeGP(reference57), solvedP57);
const plant = Array.from({ length: fullBook.length },
  (_, i) => solvedP57[i % solvedP57.length]);
assert.deepEqual(equalAtPeriod([plant]),
  equalAtPeriod([stateBijectiveEncrypt(plant)]),
  'original solved p57 GP plant retains invariant under secret 612-state maps');

/** @param {number[]} seq */
function splitByChapters(seq) {
  const out = [];
  let pos = 0;
  for (const chapter of chapters) {
    out.push(seq.slice(pos, pos + chapter.length));
    pos += chapter.length;
  }
  assert.equal(pos, seq.length);
  return out;
}
const plantedChapters = splitByChapters(plant);
assert.deepEqual(
  equalAtPeriod(plantedChapters),
  equalAtPeriod(plantedChapters.map(stateBijectiveEncrypt)),
  'source-visible chapter-reset state permutations preserve all equalities');

const sourceFiles = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
];
const STRIDE = 127;
const controls = sourceFiles.map(([name, filename]) => {
  const source = encodeSourceNativeGP(read(filename));
  let windows = 0;
  let bookMin = Infinity, chapterMin = Infinity;
  let bookAtOrBelowOriginal = 0, chapterAtOrBelowOriginal = 0;
  for (let first = 0; first + fullBook.length <= source.length; first += STRIDE) {
    const window = source.slice(first, first + fullBook.length);
    const b = equalAtPeriod([window]);
    const c = equalAtPeriod(splitByChapters(window));
    bookMin = Math.min(bookMin, b.rate);
    chapterMin = Math.min(chapterMin, c.rate);
    bookAtOrBelowOriginal += Number(b.rate <= original.book.rate);
    chapterAtOrBelowOriginal += Number(c.rate <= original.chapter.rate);
    windows++;
  }
  return { name, sourceGPCount: source.length, windows, stride: STRIDE,
    bookMin, chapterMin, bookAtOrBelowOriginal, chapterAtOrBelowOriginal };
});
assert.equal(controls.reduce((sum, x) => sum + x.windows, 0), 4428);
assert.ok(controls.every(r =>
  r.bookAtOrBelowOriginal === 0 && r.chapterAtOrBelowOriginal === 0));
process.stdout.write(JSON.stringify({
  source: '761.MP3/p57 three-prime BBS: period-612 all-secret finite-English gate',
  initialSeed: SEED, modulus: N, exactPeriod: PERIOD,
  original, sourceNativeControls: controls,
  certifiedPositive: 'Exact 12,956-rune original-solved-p57 plants on both clocks',
  conclusion: 'Original cipher incompatible with a period-612 state-only per-symbol bijection on native GP English under fixed source windows; no plaintext or historical key recovered',
}, null, 2) + '\n');
