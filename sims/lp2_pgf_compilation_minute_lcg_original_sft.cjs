'use strict';

/**
 * SFT: historical PGF/TikZ TeX internal LCG compilation-minute key candidate
 * on all 12,956 unchanged unknown LP2 source runes.
 *
 * Windows Node 22: node sims/lp2_pgf_compilation_minute_lcg_original_sft.cjs
 * Read-only; no packages, CLI parameters, network, or hidden guessed plaintext.
 * Official generator: pgf-tikz/pgf
 * tex/generic/pgf/math/pgfmathfunctions.random.code.tex
 *
 * This is an explicitly hypothetical direct-additive source-key test.
 * It cannot prove that Cicada used TeX/PGF to generate any ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(pages.length, 55);
assert.deepEqual(pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);

const CHAPTER_STARTS = new Set([3, 8, 15, 23, 27, 33, 40, 54]);
const starts = {book: new Set(), chapter: new Set(), page: new Set()};
let offset = 0;
for (const page of pages) {
  if (offset) {
    starts.page.add(offset);
    if (CHAPTER_STARTS.has(page.page)) starts.chapter.add(offset);
  }
  offset += page.indices.length;
}
assert.equal(offset, 12956);

/**
 * Historical PGF generator:
 * x := 69621 * (x mod 30845) - 23902 * floor(x / 30845);
 * if negative add 2147483647.
 * Exact modular multiplication is equivalent, stays below 2^53 as a Number.
 *
 * @param {number} x Prior state.
 * @returns {number} Next state (1 through 2147483646).
 */
function next(x) {
  return (69621 * x) % 2147483647;
}

/**
 * @param {number} x PGF state.
 * @param {number} reducer 0 integer random(0,28), 1 rnd scaled to 0..28.
 * @returns {number} Rune key index.
 */
function digit(x, reducer) {
  if (reducer === 0) return x % 29;
  // PGF rnd exposes the six-decimal-digit remainder mod 100001.
  return Math.floor((x % 100001) * 29 / 100001);
}

/**
 * @param {number[]} sequence GP29 indices.
 * @returns {number} Index of coincidence.
 */
function ioc(sequence) {
  const hist = new Int32Array(29);
  for (const x of sequence) hist[x]++;
  return histIoC(hist, sequence.length);
}

/**
 * @param {Int32Array | Uint16Array} hist Counts per rune.
 * @param {number} n Number of tokens.
 * @returns {number} Index of coincidence.
 */
function histIoC(hist, n) {
  let pairs = 0;
  for (const count of hist) pairs += count * (count - 1);
  return pairs / (n * (n - 1));
}

/**
 * @param {number} year Compilation year.
 * @param {number} minute Minute of day in 0..1439.
 * @param {number} branch 0 mod29 subtract, 1 mod29 add,
 *                        2 rnd-scaled subtract, 3 rnd-scaled add.
 * @param {'book'|'chapter'|'page'} clock Source-printed reset scope.
 * @param {number[]} ciphertext GP29 ciphertext source.
 * @returns {number[]} Plaintext GP29 indices.
 */
function decode(year, minute, branch, clock, ciphertext) {
  const seed = year * minute || 1;
  const sign = branch % 2 ? 1 : -1;
  const resetAt = starts[clock];
  const out = [];
  let x = seed;
  for (let i = 0; i < ciphertext.length; i++) {
    if (resetAt.has(i)) x = seed;
    x = next(x);
    out.push((ciphertext[i] + sign * digit(x, Math.floor(branch / 2)) + 29) % 29);
  }
  return out;
}

/**
 * @param {number} year Compilation year.
 * @param {number} minute Minute of day.
 * @param {number} branch 0..3.
 * @param {'book'|'chapter'|'page'} clock Scope.
 * @param {number[]} plaintext GP29 source-native text.
 * @returns {number[]} Encrypted GP29 sequence, inverse of decode.
 */
function encode(year, minute, branch, clock, plaintext) {
  const seed = year * minute || 1;
  const sign = branch % 2 ? 1 : -1;
  const resetAt = starts[clock];
  const out = [];
  let x = seed;
  for (let i = 0; i < plaintext.length; i++) {
    if (resetAt.has(i)) x = seed;
    x = next(x);
    out.push((plaintext[i] - sign * digit(x, Math.floor(branch / 2)) + 29) % 29);
  }
  return out;
}

/** @returns {number[]} Full 12,956-GP-token independently sourced native text. */
function nativeControl() {
  const raw = fs.readFileSync(
    path.join(ROOT, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8')
    .toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const tokens = corpus.translit.map((text, index) => ({text, index}))
    .sort((a, b) => b.text.length - a.text.length || a.index - b.index);
  const output = [];
  for (let i = 0; i < raw.length && output.length < original.length;) {
    const found = tokens.find(t => raw.startsWith(t.text, i));
    assert.ok(found, 'Native text contains an unsupported letter');
    output.push(found.index);
    i += found.text.length;
  }
  assert.equal(output.length, original.length);
  return output;
}

const EXPECT_FULL = [
  [0.03458535369958637, 0.03457316388014703, 0.03459314660468249, 0.034563464453926475],
  [0.03457287790197836, 0.034571722073546675, 0.034568909954888136, 0.034582613075469996],
  [0.03457340219528758, 0.034582100697917804, 0.034597781834166265, 0.03457614281940395],
];
const EXPECT_FIRST = [
  [0.03636247154765673, 0.0363323233693604, 0.03612128612128612, 0.0362117306561751],
  [0.03636247154765673, 0.0363323233693604, 0.03612128612128612, 0.0362117306561751],
  [0.03625318440133255, 0.036230573267610304, 0.03595170261836929, 0.036125054643573164],
];
const clocks = ['book', 'chapter', 'page'];
const observed = [];
for (let c = 0; c < clocks.length; c++) {
  const clock = clocks[c];
  const winners = Array.from({length: 4}, () => ({
    full: {ioc: -1},
    first: {ioc: -1},
    fullAbove045: 0,
  }));

  for (const year of [2012, 2013, 2014]) {
    for (let minute = 0; minute < 1440; minute++) {
      const seed = year * minute || 1;
      const full = Array.from({length: 4}, () => new Uint16Array(29));
      const first = Array.from({length: 4}, () => new Uint16Array(29));
      let x = seed;
      for (let i = 0; i < original.length; i++) {
        if (starts[clock].has(i)) x = seed;
        x = next(x);
        const k0 = digit(x, 0);
        const k1 = digit(x, 1);
        const v = original[i];
        const values = [
          (v - k0 + 29) % 29,
          (v + k0) % 29,
          (v - k1 + 29) % 29,
          (v + k1) % 29,
        ];
        for (let branch = 0; branch < 4; branch++) {
          full[branch][values[branch]]++;
          if (i < 729) first[branch][values[branch]]++;
        }
      }
      for (let branch = 0; branch < 4; branch++) {
        const score = histIoC(full[branch], original.length);
        const head = histIoC(first[branch], 729);
        const candidate = {year, minute, ioc: score, firstIoC: head};
        if (score > winners[branch].full.ioc)
          winners[branch].full = candidate;
        if (head > winners[branch].first.ioc)
          winners[branch].first = {...candidate, ioc: head};
        if (score >= 0.045) winners[branch].fullAbove045++;
      }
    }
  }
  for (let b = 0; b < 4; b++) {
    assert.ok(Math.abs(winners[b].full.ioc - EXPECT_FULL[c][b]) < 1e-12);
    assert.ok(Math.abs(winners[b].first.ioc - EXPECT_FIRST[c][b]) < 1e-12);
    assert.equal(winners[b].fullAbove045, 0);
  }
  observed.push({clock, winners});
}

// A full-length real-language Gibran plant is fully re-encrypted and recovered
// under all 12 clock/reducer/sign combinations. One exhaustive 4,320-seed
// independent plant must select the genuine compilation-minute seed at rank 1.
const native = nativeControl();
const nativeIoC = ioc(native);
assert.ok(nativeIoC > 0.055);
const positives = [];
for (const clock of clocks) {
  for (let branch = 0; branch < 4; branch++) {
    const encrypted = encode(2014, 317, branch, clock, native);
    const recovered = decode(2014, 317, branch, clock, encrypted);
    assert.deepEqual(recovered, native);
    assert.ok(ioc(encrypted) < 0.040);
    positives.push({clock, branch, plantedCipherIoC: ioc(encrypted),
      decodedIoC: ioc(recovered), exactRunes: recovered.length});
  }
}
const planted = encode(2014, 317, 0, 'book', native);
const plantCandidates = [];
for (const year of [2012, 2013, 2014]) {
  for (let minute = 0; minute < 1440; minute++) {
    let x = year * minute || 1;
    const hist = new Uint16Array(29);
    for (let i = 0; i < planted.length; i++) {
      x = next(x);
      hist[(planted[i] - (x % 29) + 29) % 29]++;
    }
    plantCandidates.push({year, minute, ioc: histIoC(hist, planted.length)});
  }
}
plantCandidates.sort((a, b) => b.ioc - a.ioc);
assert.equal(plantCandidates.length, 4320);
assert.deepEqual(
  [plantCandidates[0].year, plantCandidates[0].minute], [2014, 317]);
assert.ok(Math.abs(plantCandidates[0].ioc - nativeIoC) < 1e-12);
assert.ok(plantCandidates[1].ioc < 0.040);

const bestHead = [...observed.flatMap(o => o.winners.map(w => ({
  clock: o.clock, ...w.first
})))].sort((a,b) => b.ioc - a.ioc)[0];
const candidate = decode(bestHead.year, bestHead.minute, 0, bestHead.clock, original);
assert.deepEqual(encode(bestHead.year, bestHead.minute, 0, bestHead.clock, candidate), original);

console.log(JSON.stringify({
  status: 'PASS: all real-source candidates remain near random; native plant recovered',
  originalRunes: original.length,
  sourceMinutes: 1440,
  seedYears: [2012, 2013, 2014],
  resetClocks: clocks,
  reducerSignModes: ['integer-mod29-minus', 'integer-mod29-plus',
    'PGF-rnd-scaled-minus', 'PGF-rnd-scaled-plus'],
  triedOriginalCandidates: 3 * 1440 * 3 * 4,
  originalIoC: ioc(original),
  strongestWholeBookIoC: Math.max(...observed.flatMap(o =>
    o.winners.map(w => w.full.ioc))),
  strongestFirst729IoC: bestHead.ioc,
  gibranNativeIoC: nativeIoC,
  positiveExactRuneRecoveries: positives.length,
  plantRank1: plantCandidates[0],
  nextBestPlant: plantCandidates[1],
  observed
}, null, 2));
