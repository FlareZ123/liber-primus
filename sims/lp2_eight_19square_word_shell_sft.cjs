'use strict';

/**
 * Source-constrained exploratory 8 x (19^2 + 1) printed-word shell transport.
 *
 * The original pp49-51 table has eight columns; the solved LP2 Parable has
 * 19 body words and prime-sum remainder 361 = 19^2. The original 2,896
 * complete words happen to fit eight blocks of one fixed heading word and
 * one 19 x 19 array. Neither source supplies an eight-block transport
 * instruction, so this is a narrowly bounded hypothesis, not a decoder.
 *
 * Run: node sims/lp2_eight_19square_word_shell_sft.cjs
 *
 * Windows Node.js 22, CommonJS, no packages or network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');
const {stats, nativeLengths, rankMatch} =
  require('./lp2_wordlength_order_grammar_sft.cjs');

const ROOT = path.resolve(__dirname, '..');
const SIZE = 19;
const BLOCKS = 8;
const BLOCK_LENGTH = 1 + SIZE * SIZE;
const N = BLOCKS * BLOCK_LENGTH;
const SEED = 0x33013619;
const DRAWS = 5000;

/** @returns {number[]} Clockwise ring positions outside in, row-major indices. */
function clockwiseShells() {
  const positions = [];
  for (let shell = 0; shell <= (SIZE - 1) / 2; shell++) {
    const low = shell;
    const high = SIZE - 1 - shell;
    if (low === high) {
      positions.push(low * SIZE + low);
      break;
    }
    for (let x = low; x <= high; x++) positions.push(low * SIZE + x);
    for (let y = low + 1; y <= high; y++) positions.push(y * SIZE + high);
    for (let x = high - 1; x >= low; x--) positions.push(high * SIZE + x);
    for (let y = high - 1; y > low; y--) positions.push(y * SIZE + low);
  }
  assert.equal(positions.length, SIZE * SIZE);
  assert.equal(new Set(positions).size, SIZE * SIZE);
  return positions;
}

/**
 * Reorder each independent 362-word block, preserving its first source word.
 * A row-major array is read as clockwise outer/inner shells, or the exact
 * reverse mapping if inverse=true. Backward shells use the reversed walk.
 *
 * @template T
 * @param {T[]} input
 * @param {number[]} order
 * @param {boolean} inverse
 * @returns {T[]}
 */
function transport(input, order, inverse) {
  assert.equal(input.length, N);
  const result = [];
  for (let block = 0; block < BLOCKS; block++) {
    const start = block * BLOCK_LENGTH;
    const items = input.slice(start + 1, start + BLOCK_LENGTH);
    const placed = new Array(SIZE * SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (inverse) placed[order[i]] = items[i];
      else placed[i] = items[order[i]];
    }
    result.push(input[start], ...placed);
  }
  return result;
}

/** @param {number} initial @returns {()=>number} */
function rng(initial) {
  let x = initial >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @template T @param {T[]} array @param {()=>number} next */
function shuffle(array, next) {
  for (let j = array.length - 1; j > 0; j--) {
    const k = next() % (j + 1);
    [array[k], array[j]] = [array[j], array[k]];
  }
}

/** @param {number[]} a @param {{name:string,order:number[]}[]} walks */
function familyScores(a, walks) {
  return walks.flatMap(walk => [false, true].map(inverse => ({
    walk: walk.name,
    inverse,
    chi: stats(transport(a, walk.order, inverse)).chi
  })));
}

function main() {
  const corpus = parseSharedCorpus();
  assert.equal(corpus.runeCount, 12956);
  assert.equal(corpus.crossPageWords, 32);
  assert.equal(corpus.words.length, N);
  const source = corpus.words.map(word => word.length);
  assert.equal(N, 2896);
  assert.equal(BLOCK_LENGTH, 362);
  const outside = clockwiseShells();
  const walks = [
    {name: 'outside-in', order: outside},
    {name: 'center-out', order: outside.slice().reverse()}
  ];

  // Exact original data and independently specified four-order family.
  const baseline = stats(source).chi;
  const observed = familyScores(source, walks);
  const best = Math.max(...observed.map(r => r.chi));
  assert.ok(Math.abs(baseline - 68.27318638192133) < 1e-9);
  assert.deepEqual(observed.map(r => r.inverse), [false, true, false, true]);
  const expected = [
    73.06867255541408, 58.578747910323926,
    72.98340937749454, 70.66599529121329
  ];
  for (let i = 0; i < expected.length; i++)
    assert.ok(Math.abs(observed[i].chi - expected[i]) < 1e-8);

  // Bijective unique-word check plus independently authored native-GP English
  // controls, all at the exact source word-length inventory.
  const unique = Array.from({length: N}, (_, i) => i);
  const target = source.slice().sort((a, b) => a - b);
  const shakespeare = fs.readFileSync(path.join(
    ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const native = rankMatch(nativeLengths(shakespeare).slice(0, N), target);
  assert.equal(native.length, N);
  const plants = [];
  for (const walk of walks) for (const inverse of [false, true]) {
    for (const input of [unique, native]) {
      const scrambled = transport(input, walk.order, inverse);
      const restored = transport(scrambled, walk.order, !inverse);
      assert.deepEqual(restored, input);
    }
    plants.push({walk: walk.name, inverse,
      unscrambledNativeChi: stats(native).chi,
      scrambledNativeChi: stats(transport(
        native, walk.order, inverse)).chi});
  }

  // Selection-aware original-inventory null: all four transport readings
  // are maximized separately on every exact-histogram shuffled control.
  const random = rng(SEED);
  const shuffled = source.slice();
  let exceed = 0;
  let mean = 0;
  for (let draw = 0; draw < DRAWS; draw++) {
    shuffle(shuffled, random);
    const max = Math.max(...familyScores(shuffled, walks).map(x => x.chi));
    mean += max;
    if (max >= best) exceed++;
  }
  const p = (exceed + 1) / (DRAWS + 1);
  assert.equal(exceed, 2511);
  assert.ok(Math.abs(mean / DRAWS - 73.72059162910409) < 1e-8);
  assert.ok(Math.abs(p - 0.5022995400919816) < 1e-12);

  console.log(JSON.stringify({
    source: {runes: corpus.runeCount, words: N,
      blocks: BLOCKS, blockSize: BLOCK_LENGTH, retainedFirstWords: BLOCKS,
      squareWordsPerBlock: SIZE * SIZE},
    baselineChi: baseline,
    observed,
    bestOriginalChi: best,
    positiveControl: {uniqueTokenRoundTrips: 4,
      nativeWordLengthRoundTrips: 4, plants},
    matchedNull: {draws: DRAWS, seed: SEED,
      exceed, maxMean: mean / DRAWS, familywiseUpperTail: p},
    decision: 'No original-word ordering distinguishes itself from the matched null; ' +
      'the sources provide no instruction selecting this partition.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = {clockwiseShells, transport, familyScores};
