'use strict';
/**
 * Original LP2 source-first, key-independent collision gate for a global
 * ciphertext-feedback S-box and the table-motivated eight-lane extension.
 *
 * Model: C[t] = S[phase(t)][C[t-1]][P[t]], each S row a bijection of GP29.
 * No key is fitted to LP2. Collision concentration within each exact
 * (phase, previous-cipher) state is invariant to the unknown permutation.
 *
 * An explicit positive maps the rare native EA rune to the previous cipher
 * rune, reproducing 85 adjacent equalities versus 86 observed while still
 * carrying real English plaintext and remaining exactly invertible.
 *
 * Run: node sims/lp2_global_feedback_1and8_sbox_original_sft.cjs
 * Node.js 22; builtins only; read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
const N = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(N, 12956);
const alphabet = new Map(corpus.translit.map((s, i) => [s, i]));

/** @param {string} source @returns {number[]} */
function toGP(source) {
  const result = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (alphabet.has(pair)) {
        result.push(alphabet.get(pair));
        i += 2;
      } else if (alphabet.has(word[i])) {
        result.push(alphabet.get(word[i]));
        i++;
      } else {
        i++;
      }
    }
  }
  return result;
}
const english = toGP(read('resources/control/shakespeare_first300k.txt'));
assert.equal(english.length, 218800);
const plaintext = english.slice(10000, 10000 + N);
assert.equal(plaintext.length, N);
const EA = corpus.translit.indexOf('EA');
assert.equal(EA, 28);
assert.equal(plaintext.filter(x => x === EA).length, 85);

/** Deterministic PRNG; no seed/key fitting on the target. */
let seed = 0x33012629;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const chapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 53]);

/**
 * @param {'global'|'page'|'chapter'} clock
 * @param {number} stateCount
 * @returns {number[][]}
 */
function phases(clock, stateCount) {
  let globalRune = 0, chapterRune = 0;
  return pages.map(page => {
    if (chapterStarts.has(page.page)) chapterRune = 0;
    const phase = [];
    for (let local = 0; local < page.indices.length; local++) {
      const position = clock === 'global' ? globalRune
        : clock === 'page' ? local : chapterRune;
      phase.push(position % stateCount);
      globalRune++;
      chapterRune++;
    }
    return phase;
  });
}

/**
 * Each row is a 29-value permutation. The fixed source hypothesis puts
 * plaintext EA at the previous-ciphertext output, so every literal EA in
 * the native English plant creates exactly one repeated ciphertext rune.
 *
 * @param {number} n
 * @returns {number[][][]}
 */
function permutations(n) {
  return Array.from({length: n}, () =>
    Array.from({length: 29}, (_, previous) => {
      const outputs = Array.from({length: 29}, (_, i) => i)
        .filter(i => i !== previous);
      for (let i = outputs.length - 1; i > 0; i--) {
        const j = random() % (i + 1);
        [outputs[i], outputs[j]] = [outputs[j], outputs[i]];
      }
      outputs.push(previous);
      assert.equal(new Set(outputs).size, 29);
      assert.equal(outputs[EA], previous);
      return outputs;
    }));
}

/**
 * @param {number[][]} phase
 * @param {number[][][]} sbox
 * @returns {number[][]}
 */
function encrypt(phase, sbox) {
  let offset = 0;
  const output = [];
  for (let p = 0; p < pages.length; p++) {
    let previous = 0;
    const c = [];
    for (let i = 0; i < pages[p].indices.length; i++) {
      const next = sbox[phase[p][i]][previous][plaintext[offset++]];
      c.push(next);
      previous = next;
    }
    output.push(c);
  }
  assert.equal(offset, N);
  return output;
}

/**
 * @param {number[][]} data
 * @param {number[][]} phase
 * @param {number[][][]} sbox
 * @returns {void}
 */
function assertInverse(data, phase, sbox) {
  let offset = 0;
  for (let p = 0; p < pages.length; p++) {
    let previous = 0;
    for (let i = 0; i < data[p].length; i++) {
      const value = data[p][i];
      const recovered = sbox[phase[p][i]][previous].indexOf(value);
      assert.equal(recovered, plaintext[offset++]);
      previous = value;
    }
  }
  assert.equal(offset, N);
}

/** @typedef {{ratio:number,repeats:number,opportunities:number,pairs:number}} Collision */
/**
 * The equality of unknown substituted plaintext values is EXACTLY preserved
 * whenever the phase and preceding ciphertext match.
 *
 * @param {number[][]} data
 * @param {number[][]} phase
 * @param {number} stateCount
 * @returns {Collision}
 */
function collision(data, phase, stateCount) {
  const counts = Array.from({length: stateCount * 29},
    () => new Uint16Array(29));
  let repeats = 0, opportunities = 0;
  for (let p = 0; p < data.length; p++) {
    for (let i = 1; i < data[p].length; i++) {
      const previous = data[p][i - 1];
      const current = data[p][i];
      counts[phase[p][i] * 29 + previous][current]++;
      repeats += Number(current === previous);
      opportunities++;
    }
  }
  let numerator = 0, denominator = 0;
  for (const row of counts) {
    let n = 0;
    for (const count of row) {
      n += count;
      numerator += count * (count - 1);
    }
    denominator += n * (n - 1);
  }
  assert.equal(opportunities, N - pages.length);
  return {ratio: numerator / denominator, repeats, opportunities,
    pairs: denominator / 2};
}

/**
 * Exact diagonal-suppressed 29-symbol Markov null, fitted only in its
 * single empirically visible rate 86/12901.
 * @returns {number[][]}
 */
function markovNull() {
  return pages.map(page => {
    let previous = random() % 29;
    const out = [];
    for (let i = 0; i < page.indices.length; i++) {
      const next = random() / 0x100000000 < 86 / 12901
        ? previous : (() => {
          const rank = random() % 28;
          return rank >= previous ? rank + 1 : rank;
        })();
      out.push(next);
      previous = next;
    }
    return out;
  });
}

/** @param {number[]} values @returns {{min:number,median:number,max:number}} */
function range(values) {
  const a = values.slice().sort((x, y) => x - y);
  return {min: a[0], median: a[Math.floor(a.length / 2)], max: a.at(-1)};
}
const results = [];
const trials = 64;
for (const [clock, stateCount] of [
  ['global', 1], ['global', 8], ['page', 8], ['chapter', 8]
]) {
  const phase = phases(clock, stateCount);
  const real = collision(pages.map(p => p.indices), phase, stateCount);
  const planted = [], nulls = [];
  for (let trial = 0; trial < trials; trial++) {
    const sbox = permutations(stateCount);
    const constructed = encrypt(phase, sbox);
    if (trial === 0) assertInverse(constructed, phase, sbox);
    planted.push(collision(constructed, phase, stateCount));
    nulls.push(collision(markovNull(), phase, stateCount));
  }
  assert.equal(real.repeats, 86);
  assert.ok(planted.every(x => x.repeats === 85),
    'rare-EA plants must have the original-like doublet rate');
  assert.ok(planted.every(x => x.ratio > real.ratio + 0.019),
    'no source-native feedback-permutation positive may resemble the original');
  results.push({
    clock, stateCount,
    original: real,
    sourceShakespeareControls: {
      trials, nativeGPPlaintext: N, sourceEA: 85,
      exactInversePass: true,
      repeatedCipherPairs: range(planted.map(x => x.repeats)),
      invariantCollision: range(planted.map(x => x.ratio)),
    },
    diagonalSuppressedMarkovNull: {
      trials,
      invariantCollision: range(nulls.map(x => x.ratio))
    }
  });
}
assert.ok(Math.abs(results[0].original.ratio -
  0.035367874268005105) < 1e-12);
assert.ok(Math.abs(results[1].original.ratio -
  0.03522464555304866) < 1e-12);
console.log(JSON.stringify({
  verdict: 'No original plaintext recovered; static first-order global and eight-phase GP29 feedback S-boxes fail a key-invariant original-input gate.',
  model: 'C[t]=S[phase][C[t-1]][P[t]], each row a permutation of 29 runes',
  sourceAlphabet: 'actual GP29 transliteration, Shakespeare native-GP plant',
  originalPages: pages.length,
  originalRunes: N,
  sourceEnglishRunes: english.length,
  originalRepeatWithinPage: 86,
  sourceNativeEA: 85,
  positiveInversion: 'exact for all 12956 symbols in every four model families',
  stateClocks: results
}, null, 2));
