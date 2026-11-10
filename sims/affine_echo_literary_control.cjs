'use strict';

/**
 * Reference-register challenge for two LP2 word-internal echoes.
 *
 * Samples whole GP-English reference words, matching every real LP2 word's
 * exact rune length. This is a fixed-transform linguistic comparison;
 * manuscript hypotheses were selected before this test, and it is not a
 * discovery-wide p value.
 *
 * @module affine_echo_literary_control
 */
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {parseWords, random32} = require('./affine_echo_global_search.cjs');

const ROOT = path.resolve(__dirname, '..');
const SOURCES = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const ALPHABET = [
  'F', 'U', 'TH', 'O', 'R', 'C', 'G', 'W', 'H', 'N', 'I', 'J',
  'EO', 'P', 'X', 'S', 'T', 'B', 'E', 'M', 'L', 'NG', 'OE',
  'D', 'A', 'AE', 'Y', 'IA', 'EA'
];
const TRANSLIT = new Map(ALPHABET.map((glyph, index) => [glyph, index]));
const REPLICATES = 5000;
const SEED = 0x19895511;

/**
 * Approximate normal English spelling using the 29 GP graphemes. Standard
 * Q/V/K/Z aliases and greedy GP digraphs match the shared reference models.
 * @param {string} word Plain English orthographic word.
 * @returns {number[]}
 */
function encode(word) {
  const source = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < source.length;) {
    const digraph = source.slice(i, i + 2);
    if (TRANSLIT.has(digraph)) {
      output.push(TRANSLIT.get(digraph));
      i += 2;
    } else {
      const value = TRANSLIT.get(source[i]);
      if (value === undefined) throw new Error('Unknown English grapheme');
      output.push(value);
      i++;
    }
  }
  return output;
}

/** @param {number[]} word GP rune indices. */
function echoes(word) {
  let lag6 = 0, lag5S = 0;
  for (let i = 5; i < word.length; i++) {
    lag5S += +(word[i] === 15 && word[i - 5] === 15);
    if (i >= 6) {
      lag6 += +(word[i] === (24 - 2 * word[i - 6] + 58) % 29);
    }
  }
  return {lag6, lag5S};
}

/**
 * Bootstrap source words with replacement, retaining exact word lengths.
 * @param {number[][]} target Real LP2 word sequences.
 * @param {number[][]} source Reference GP words.
 * @param {number} seed Nonzero PRNG seed.
 */
function compare(target, source, seed) {
  const byLength = new Map();
  for (const word of source) {
    if (word.length < 6) continue;
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(echoes(word));
  }
  const count6 = target.reduce((n, word) => n + echoes(word).lag6, 0);
  const count5 = target.reduce((n, word) => n + echoes(word).lag5S, 0);
  const lengths6 = target.filter((word) => word.length >= 7)
    .map((word) => word.length);
  const lengths5 = target.filter((word) => word.length >= 6)
    .map((word) => word.length);
  for (const length of lengths5) {
    if (!byLength.has(length)) throw new Error('Reference missing word length ' + length);
  }

  const rng = random32(seed);
  const sums = [0, 0], squares = [0, 0], exceed = [0, 0];
  for (let trial = 0; trial < REPLICATES; trial++) {
    const totals = [0, 0];
    for (const length of lengths6) {
      const pool = byLength.get(length);
      totals[0] += pool[rng() % pool.length].lag6;
    }
    for (const length of lengths5) {
      const pool = byLength.get(length);
      totals[1] += pool[rng() % pool.length].lag5S;
    }
    for (let k = 0; k < 2; k++) {
      sums[k] += totals[k];
      squares[k] += totals[k] ** 2;
      exceed[k] += +(totals[k] >= (k === 0 ? count6 : count5));
    }
  }
  return {
    referenceLongWords: source.filter((word) => word.length >= 6).length,
    real: {lag6Affine: count6, lag5SameS: count5},
    lag6: {matchedWords: lengths6.length,
      mean: sums[0] / REPLICATES,
      sd: Math.sqrt(squares[0] / REPLICATES - (sums[0] / REPLICATES) ** 2),
      referenceTailP: (exceed[0] + 1) / (REPLICATES + 1)},
    lag5S: {matchedWords: lengths5.length,
      mean: sums[1] / REPLICATES,
      sd: Math.sqrt(squares[1] / REPLICATES - (sums[1] / REPLICATES) ** 2),
      referenceTailP: (exceed[1] + 1) / (REPLICATES + 1)}
  };
}

/** @returns {{inputSha256:string, sources:object[]}} */
function run() {
  const lp2Text = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
  const target = parseWords(lp2Text);
  const sources = SOURCES.map((source, i) => {
    const text = fs.readFileSync(path.join(ROOT, source), 'utf8');
    const words = (text.match(/[A-Za-z]+/g) || []).map(encode);
    return {source, inputSha256: createHash('sha256').update(text).digest('hex'),
      ...compare(target, words, SEED + i)};
  });
  if (sources.some((row) => row.real.lag6Affine !== 80 ||
      row.real.lag5SameS !== 11)) throw new Error('Historical observations changed');
  return {
    inputSha256: createHash('sha256').update(lp2Text).digest('hex'),
    note: 'Post-selected hypotheses; references use approximate GP transliteration',
    seed: '0x' + SEED.toString(16), replicates: REPLICATES, sources
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));

module.exports = {encode, echoes, compare, run};
