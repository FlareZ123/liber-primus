'use strict';

/**
 * Source-selected 79-column LP2 row/column pad test.
 *
 * GP ciphertext coordinates: for every nonrepeated rune after its physical
 * page's first rune, r = (current - previous modulo 29) - 1, in [0,27].
 * Page starts and literal doublets are explicit erasures.
 *
 * Hypothesis: r[row,col] = P[row,col] + A[row] + B[col] (mod 28).
 * Taking two rows at the same column cancels B[col]. The histogram of their
 * modular differences is rotated by A[row2]-A[row1]; its Pearson chi-square
 * against a flat 28-symbol distribution is EXACTLY invariant to both pads.
 *
 * N=12956=164*79. The 79 is source-selected by the red p15 prime ordinal22.
 * This program tests a necessary condition for an English-GP source register,
 * not a decryption and not a universal cipher exclusion.
 *
 * Run: node sims/prime79_row_column_cipher_invariant.cjs (Node 22+).
 * No network, no file writes, no third-party packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const WIDTH = 79;
const HEIGHT = 164;
const MOD = 28;
const TRIALS = 250;
const PLANTS = 10;

assert.equal(source.length, 55);
assert.equal(source.reduce((n, p) => n + p.indices.length, 0), WIDTH * HEIGHT);

/** @param {number[][]} pages */
function rankStream(pages) {
  return pages.flatMap((page) => page.map((c, i) =>
    i === 0 || c === page[i - 1] ? -1 : (c - page[i - 1] + 29) % 29 - 1
  ));
}

/** @param {number[]} ranks */
function makeRows(ranks) {
  assert.equal(ranks.length, WIDTH * HEIGHT);
  return Array.from({length: HEIGHT}, (_, row) =>
    ranks.slice(row * WIDTH, (row + 1) * WIDTH));
}

/**
 * Sum Pearson flat-difference chi-square for every unordered row pair.
 * Any unknown row-specific modular shift only rotates the 28 bins.
 * The unknown common column-specific pad cancels from all differences.
 * @param {number[][]} rows
 */
function statistic(rows) {
  let value = 0, compared = 0;
  let rowPairs = 0;
  for (let row = 0; row < HEIGHT; row++) {
    for (let other = row + 1; other < HEIGHT; other++) {
      const hist = new Uint8Array(MOD);
      let n = 0;
      for (let col = 0; col < WIDTH; col++) {
        const a = rows[row][col], b = rows[other][col];
        if (a < 0 || b < 0) continue;
        hist[(b - a + MOD) % MOD]++;
        n++;
      }
      assert(n > 0);
      let squared = 0;
      for (const count of hist) squared += count * count;
      value += MOD * squared / n - n;
      compared += n;
      rowPairs++;
    }
  }
  assert.equal(rowPairs, HEIGHT * (HEIGHT - 1) / 2);
  return {value, compared, rowPairs};
}

/** @param {number} seed @returns {() => number} */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Keep the exact source row's rune/erasure sequence and independently
 * circularly rotate each row. This destroys column correspondence while
 * keeping per-row marginal distribution and sequential structure.
 * @param {number[][]} rows @param {() => number} random
 */
function rotatedRows(rows, random) {
  return rows.map((row) => {
    const shift = random() % WIDTH;
    return row.slice(shift).concat(row.slice(0, shift));
  });
}

/** @param {number[][]} rows @param {number} trials */
function nullTest(rows, trials = TRIALS) {
  const original = statistic(rows);
  const random = prng(0x215379ab);
  let sum = 0, squared = 0, atLeast = 0;
  const values = [];
  for (let i = 0; i < trials; i++) {
    const result = statistic(rotatedRows(rows, random)).value;
    atLeast += Number(result >= original.value);
    sum += result;
    squared += result * result;
    values.push(result);
  }
  values.sort((a, b) => a - b);
  return {
    observed: original, trials, seed: '0x215379ab',
    nullMean: sum / trials,
    nullSD: Math.sqrt(squared / trials - (sum / trials) ** 2),
    null95thPercentile: values[Math.floor(trials * 0.95)],
    exceedances: atLeast,
    upperTailP: (atLeast + 1) / (trials + 1),
  };
}

/** Return a long independent late Shakespeare sample encoded as GP indices 0..27. */
function englishSample() {
  const words = corpus.translit.map((symbol, index) => ({symbol, index}))
    .sort((a, b) => b.symbol.length - a.symbol.length);
  const raw = read('resources/control/shakespeare_first300k.txt')
    .slice(240000).toUpperCase().replace(/[KVQZ]/g,
      (c) => ({K:'C', V:'U', Q:'C', Z:'S'})[c]);
  const out = [];
  for (let at = 0; at < raw.length;) {
    const token = words.find((w) => raw.startsWith(w.symbol, at));
    if (!token) { at++; continue; }
    if (token.index < MOD) out.push(token.index);
    at += token.symbol.length;
  }
  assert(out.length > WIDTH * HEIGHT + 10000);
  return out;
}

/**
 * Round-trip exactly through a 29-symbol ciphertext chain. Preserve source
 * physical page lengths, source page-initial erasures and the 86 doublets.
 * @param {number[]} ranks
 */
function forwardAndInverse(ranks) {
  const result = [];
  let index = 0, repeated = 0;
  for (const page of source) {
    assert.equal(ranks[index], -1);
    const emitted = [page.indices[0]];
    index++;
    for (let i = 1; i < page.indices.length; i++, index++) {
      const prev = emitted[i - 1], rank = ranks[index];
      const c = rank === -1 ? prev : (prev + 1 + rank) % 29;
      repeated += Number(c === prev);
      emitted.push(c);
    }
    result.push(emitted);
  }
  assert.equal(index, ranks.length);
  assert.deepEqual(rankStream(result), ranks);
  return {exactInversePositions: index - source.length, repeated};
}

/**
 * Powered positive controls with actual withheld English-GP register, an
 * independently random 164-rune row pad and a common 79-rune column pad.
 * @param {number[]} originalRanks
 */
function plantedControls(originalRanks) {
  const english = englishSample(), random = prng(0x9df24a11);
  const scoreValues = [], offsets = [];
  let exact = 0;
  for (let trial = 0; trial < PLANTS; trial++) {
    const rowKey = Array.from({length: HEIGHT}, () => random() % MOD);
    const colKey = Array.from({length: WIDTH}, () => random() % MOD);
    const start = random() % (english.length - originalRanks.length);
    const ranks = originalRanks.map((v, i) => v < 0 ? -1 :
      (english[start + i] + rowKey[Math.floor(i / WIDTH)] + colKey[i % WIDTH]) % MOD);
    const recovered = forwardAndInverse(ranks);
    assert.equal(recovered.repeated, 86);
    assert.equal(recovered.exactInversePositions, 12901);
    scoreValues.push(statistic(makeRows(ranks)).value);
    offsets.push(start);
    exact += recovered.exactInversePositions;
  }
  return {
    sampleRuneCount: english.length, models: PLANTS,
    independentSourceOffsets: offsets,
    allInversePositionsExact: exact,
    sampleScores: scoreValues,
    minimumScore: Math.min(...scoreValues),
    maximumScore: Math.max(...scoreValues),
  };
}

function main() {
  const originalRanks = rankStream(source.map((p) => p.indices));
  assert.equal(originalRanks.length, 12956);
  assert.equal(originalRanks.filter((x) => x < 0).length, 141);
  assert.equal(originalRanks.filter((x) => x >= 0).length, 12815);
  const observed = nullTest(makeRows(originalRanks));
  const planted = plantedControls(originalRanks);
  assert(Math.abs(observed.observed.value - 360107.17828139046) < 1e-6);
  assert.equal(observed.observed.compared, 1033062);
  assert.equal(observed.exceedances, 207);
  assert(planted.minimumScore > observed.observed.value + 30000);
  const result = {
    hypothesis: 'Modulo-28 predecessor-excluded rank = English GP rune + arbitrary row shift + arbitrary common column shift',
    source: '79 is the source-marked 22nd prime on LP2 page15; 12956 = 164 × 79',
    input: {pages: 55, runes: 12956, rankErasures: 141, pageStarts: 55, doublets: 86, rows: HEIGHT, columns: WIDTH},
    invariant: 'all 13366 row-pair modular-difference chi-squares, invariant to unknown additive row and column pads',
    matchedNull: '250 independently circularly rotated 79-rune rows, preserving row values, local order and erasures',
    original: observed,
    positive: planted,
    interpretation: 'No source-selected 79-column separable additive pad signal in original LP2 under the tested English GP register; original plaintext and keys remain unknown.',
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) main();
module.exports = {rankStream, makeRows, statistic, rotatedRows, nullTest, forwardAndInverse, plantedControls, main};
