'use strict';

/**
 * Original LP2 p50 first-digit/parity repeated-rune source discriminator.
 * Windows 11 / Node.js 22, CommonJS, read-only, deterministic.
 *
 * The 32 split masks were surveyed after the original ciphertext was visible.
 * A high score is a conditional statistical relationship, not a decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const table = grid.pages.flatMap((page) => page.bytes);
const CHAPTER_STARTS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const EPS = 1e-9;

assert.equal(table.length, 256);
assert.equal(CHAPTER_STARTS.length, 10);

/** @type {Array<{ slot: number, chapter: number, equal: number, step: number }>} */
const observations = [];
let globalRune = 0;
for (const page of corpus.pages.filter((entry) => entry.page < 56)) {
  const indices = page.indices || [];
  if (!indices.length) continue;
  const chapter = CHAPTER_STARTS.findIndex(
    (start, i) => i < 9 && page.page >= start && page.page < CHAPTER_STARTS[i + 1]
  );
  assert(chapter >= 0);
  for (let i = 1; i < indices.length; i++) {
    const step = (indices[i] - indices[i - 1] + 29) % 29;
    observations.push({
      slot: (globalRune + i - 1) % 256,
      chapter,
      equal: +(step === 0),
      step
    });
  }
  globalRune += indices.length;
}
assert.equal(globalRune, 12956);
assert.equal(observations.length, 12901);
assert.equal(observations.reduce((sum, item) => sum + item.equal, 0), 86);

/**
 * Count source events by physical chapter, leading radix60 digit 0..4,
 * printed second-digit parity, and repeated-rune indicator.
 *
 * @param {number[]} sourceTable
 * @param {number} phase
 * @returns {number[][][][]}
 */
function sourceCounts(sourceTable, phase = 0) {
  const out = Array.from({ length: 9 }, () =>
    Array.from({ length: 5 }, () =>
      Array.from({ length: 2 }, () => [0, 0])));
  for (const item of observations) {
    const value = sourceTable[(item.slot + phase) % 256];
    assert(Number.isInteger(value) && value >= 0 && value <= 255);
    out[item.chapter][Math.floor(value / 60)][value % 2][item.equal]++;
  }
  return out;
}

/**
 * Mask bit d = 1: separate printed first-digit class d by second digit
 * even/odd. Other first-digit classes pool parity.
 *
 * @param {number[][][][]} source
 * @param {number} mask
 * @returns {{gain: number, chapters: number[], totals: Array<[string, number, number]>}}
 */
function leaveChapterOut(source, mask) {
  /** @type {Array<{ digit: number, parity: number }>} */
  const groups = [];
  for (let digit = 0; digit < 5; digit++) {
    if ((mask >>> digit) & 1) groups.push({ digit, parity: 0 }, { digit, parity: 1 });
    else groups.push({ digit, parity: -1 });
  }
  const n = groups.length;
  const local = Array.from({ length: 9 }, () => Array.from({ length: n }, () => [0, 0]));
  const perChapter = Array.from({ length: 9 }, () => [0, 0]);
  const total = [0, 0];
  const perState = Array.from({ length: n }, () => [0, 0]);
  for (let chapter = 0; chapter < 9; chapter++) {
    for (let state = 0; state < n; state++) {
      const { digit, parity } = groups[state];
      for (let event = 0; event < 2; event++) {
        const value = parity < 0
          ? source[chapter][digit][0][event] + source[chapter][digit][1][event]
          : source[chapter][digit][parity][event];
        local[chapter][state][event] = value;
        perChapter[chapter][event] += value;
        perState[state][event] += value;
        total[event] += value;
      }
    }
  }

  const chapters = [];
  let gain = 0;
  for (let chapter = 0; chapter < 9; chapter++) {
    const noEvent = total[0] - perChapter[chapter][0];
    const event = total[1] - perChapter[chapter][1];
    const baseline = (event + 0.5) / (event + noEvent + 1);
    let contribution = 0;
    for (let state = 0; state < n; state++) {
      const counts = local[chapter][state];
      const n0 = perState[state][0] - counts[0];
      const n1 = perState[state][1] - counts[1];
      const probability = (n1 + 0.5) / (n0 + n1 + 1);
      contribution += counts[1] * Math.log(probability / baseline);
      contribution += counts[0] * Math.log((1 - probability) / (1 - baseline));
    }
    chapters.push(contribution);
    gain += contribution;
  }
  const totals = groups.map((group, state) => [
    String(group.digit) + (group.parity < 0 ? '*' : (group.parity ? 'odd' : 'even')),
    perState[state][0] + perState[state][1],
    perState[state][1]
  ]);
  return { gain, chapters, totals };
}

/**
 * @param {number[][][][]} source
 * @returns {{ mask: number, gain: number }}
 */
function bestMask(source) {
  let best = { mask: -1, gain: -Infinity };
  for (let mask = 0; mask < 32; mask++) {
    const gain = leaveChapterOut(source, mask).gain;
    if (gain > best.gain) best = { mask, gain };
  }
  return best;
}

/**
 * Source table shuffled in-place using Fisher-Yates and fixed-seed xorshift32.
 * This preserves all 256 original byte values while changing their positions.
 * @param {number[]} array
 * @param {() => number} random
 */
function shuffle(array, random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/** @returns {() => number} */
function random3301() {
  let seed = 3301;
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

/**
 * Chi-squared test of nonzero ciphertext steps against source mask19 states.
 * No forced language model or original-repeat signal is used in this test.
 * @returns {{ chiSquare: number, degreesFreedom: number, n: number }}
 */
function nonzeroSteps() {
  const cells = Array.from({ length: 8 }, () => Array(28).fill(0));
  const state = (byte) => {
    const high = Math.floor(byte / 60);
    if (high === 0 && byte % 2) return 5;
    if (high === 1 && byte % 2) return 6;
    if (high === 4 && byte % 2) return 7;
    return high;
  };
  for (const item of observations) {
    if (item.step !== 0) cells[state(table[item.slot])][item.step - 1]++;
  }
  const rows = cells.map((x) => x.reduce((a, b) => a + b, 0));
  const cols = Array.from({ length: 28 }, (_, i) =>
    cells.reduce((a, row) => a + row[i], 0));
  const n = rows.reduce((a, b) => a + b, 0);
  let chiSquare = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 28; j++) {
      const expected = rows[i] * cols[j] / n;
      chiSquare += (cells[i][j] - expected) ** 2 / expected;
    }
  }
  return { chiSquare, degreesFreedom: 7 * 27, n };
}

const original = sourceCounts(table);
const mask19 = leaveChapterOut(original, 19);
const mask31 = leaveChapterOut(original, 31);
const winner = bestMask(original);

assert.equal(winner.mask, 19);
assert(Math.abs(mask19.gain - 16.625737935593765) < EPS);
assert(Math.abs(mask31.gain - 14.979895809843413) < EPS);
assert.deepEqual(mask19.totals, [
  ['0even', 1809, 29], ['0odd', 1216, 4],
  ['1even', 1617, 12], ['1odd', 1309, 0],
  ['2*', 3270, 17], ['3*', 2825, 19],
  ['4even', 350, 0], ['4odd', 500, 5]
]);

const phases = Array.from({ length: 256 }, (_, phase) =>
  ({ phase, ...bestMask(sourceCounts(table, phase)) }))
  .sort((a, b) => b.gain - a.gain);
assert.equal(phases[0].phase, 0);
assert.equal(phases[0].mask, 19);
assert(Math.abs(phases[1].gain - 10.489747512372102) < EPS);

const REPLICATIONS = 2000;
const random = random3301();
let shuffledAtLeast = 0;
let maxShuffled = -Infinity;
for (let trial = 0; trial < REPLICATIONS; trial++) {
  const randomized = table.slice();
  shuffle(randomized, random);
  const result = bestMask(sourceCounts(randomized));
  if (result.gain >= winner.gain) shuffledAtLeast++;
  maxShuffled = Math.max(maxShuffled, result.gain);
}
assert.equal(shuffledAtLeast, 0);
assert(Math.abs(maxShuffled - 9.57539644568211) < EPS);

const nonzero = nonzeroSteps();
assert.equal(nonzero.n, 12815);
assert.equal(nonzero.degreesFreedom, 189);

console.log('PASS original LP2 GP29: 12,956 runes, 12,901 within-page transitions, 86 doublets');
console.log('Original p50 source phase0, all 32 split masks:', winner);
console.log('Quadratic residue split {0,1,4}, original 8 source states:', mask19.totals);
console.log('Nine original printed-chapter heldout gains:', mask19.chapters);
console.log('Unshifted source phase0 rank 1 / 256, across all masks; next phase:', phases[1]);
console.log('2000 fixed-seed whole-table reshuffles, familywise max:', {
  randomizedAtLeastOriginal: shuffledAtLeast,
  addOneUpperTail: (shuffledAtLeast + 1) / (REPLICATIONS + 1),
  largestRandomizedGain: maxShuffled
});
console.log('Nonzero transition 8 x 28 source-state chi-squared:', nonzero);
console.log('No original LP2 plaintext or authenticated decoding key recovered.');
