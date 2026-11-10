'use strict';
/**
 * All-secret two-GP-rune block substitution invariant on original LP2.
 *
 * A source-motivated GF(29^2) plaintext register has 29^2 = 841 possible
 * two-rune symbols (p3 red irreducible quadratic). The p05 source Möbius
 * corner map has order 28; p39/Ac24 field element has order seven.
 * Test stationary per-pair maps (period 1), a free secret map for EACH
 * source-cycle phase seven or twenty-eight, both book-continuous and
 * physical-page-reset pair clocks, and two possible pair starting offsets.
 *
 * The map at each phase can be ANY of 841! secret bijections; identical
 * ciphertext pair-symbol counts are necessarily identical plaintext
 * pair-symbol counts within that phase. This is an all-key original-input
 * necessary condition, not another finite affine/pad search.
 *
 * Standalone: node sims/lp2_gf841_pair_phase_allsecret_sft.cjs
 * Scope: native GP text encoded as fixed two-rune pairs. Byte/compressed
 * intermediates, variable-width framing and within-pair changing states
 * are not covered.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const actual = pages.flatMap(p => p.indices);
const N = actual.length;
assert.equal(N, 12956);
assert.equal(grid.bytes.length, 256);

/** Native solved-language control GP normalization used in repo.
 * @param {string} text
 * @returns {number[]}
 */
function gpEncode(text) {
  const map = new Map(corpus.translit.map((s, i) => [s, i]));
  const output = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (map.has(pair)) {
        output.push(map.get(pair));
        i += 2;
      } else {
        if (map.has(word[i])) output.push(map.get(word[i]));
        i++;
      }
    }
  }
  return output;
}
const english = gpEncode(fs.readFileSync(path.join(
  root, 'resources/control/shakespeare_first300k.txt'), 'utf8'));
assert(english.length >= 12 * N);
const controls = Array.from({ length: 12 }, (_, i) =>
  english.slice(i * N, (i + 1) * N));

/**
 * Fixed nonoverlapping pair coordinates, either book or page clock.
 * Every coordinate includes its source-aligned phase before mod period.
 * @param {number} offset 0 or 1
 * @param {boolean} pageReset
 * @returns {Array<[number,number,number]>}
 */
function pairCoordinates(offset, pageReset) {
  /** @type {Array<[number,number,number]>} */
  const output = [];
  if (!pageReset) {
    for (let i = offset, pair = 0; i + 1 < N; i += 2, pair++) {
      output.push([i, i + 1, pair]);
    }
    return output;
  }
  let bookStart = 0;
  for (const page of pages) {
    for (let i = offset, pair = 0;
      i + 1 < page.indices.length; i += 2, pair++) {
      output.push([bookStart + i, bookStart + i + 1, pair]);
    }
    bookStart += page.indices.length;
  }
  assert.equal(bookStart, N);
  return output;
}

/** @param {number[]} symbols
 * @param {Array<[number,number,number]>} pairs
 * @param {number} period */
function coincidence(symbols, pairs, period) {
  const hist = Array.from({ length: period }, () => new Uint32Array(841));
  const size = new Uint32Array(period);
  for (const [a, b, index] of pairs) {
    const phase = index % period;
    hist[phase][29 * symbols[a] + symbols[b]]++;
    size[phase]++;
  }
  let equalPairs = 0, totalPairs = 0;
  for (let phase = 0; phase < period; phase++) {
    const n = size[phase];
    totalPairs += n * (n - 1);
    for (const count of hist[phase]) equalPairs += count * (count - 1);
  }
  return { rate: equalPairs / totalPairs, equalPairs, totalPairs,
    pairCount: pairs.length };
}

/**
 * Source-derived but arbitrary secret permutation for exact positive plant.
 * A test must accept EVERY secret bijection, not only this one.
 * @param {number} phase
 * @returns {number[]}
 */
function secretPermutation(phase) {
  const out = Array.from({ length: 841 }, (_, i) => i);
  let state = (Math.imul(phase + 1, 0x9e3779b9) +
    grid.bytes[(phase * 7) % 256]) >>> 0;
  for (let i = 840; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  assert.equal(new Set(out).size, 841);
  return out;
}

/** @param {number[]} native
 * @param {Array<[number,number,number]>} pairPositions
 * @param {number} period */
function plantTest(native, pairPositions, period) {
  const maps = Array.from({ length: period }, (_, i) => secretPermutation(i));
  const inverse = maps.map(map => {
    const inv = new Uint16Array(841);
    for (let i = 0; i < 841; i++) inv[map[i]] = i;
    return inv;
  });
  const ciphertext = native.slice();
  for (const [a, b, index] of pairPositions) {
    const plainPair = native[a] * 29 + native[b];
    const cipherPair = maps[index % period][plainPair];
    ciphertext[a] = Math.floor(cipherPair / 29);
    ciphertext[b] = cipherPair % 29;
  }
  const decoded = ciphertext.slice();
  for (const [a, b, index] of pairPositions) {
    const cipherPair = ciphertext[a] * 29 + ciphertext[b];
    const plainPair = inverse[index % period][cipherPair];
    decoded[a] = Math.floor(plainPair / 29);
    decoded[b] = plainPair % 29;
  }
  assert.deepEqual(decoded, native);
  const expected = coincidence(native, pairPositions, period).rate;
  const observed = coincidence(ciphertext, pairPositions, period).rate;
  assert(Math.abs(expected - observed) < 1e-14);
  return { exactRecovery: true, sameCoincidenceRate: true };
}

const rows = [];
for (const pageReset of [false, true]) {
  for (const offset of [0, 1]) {
    const positions = pairCoordinates(offset, pageReset);
    for (const period of [1, 7, 28]) {
      const input = coincidence(actual, positions, period);
      const reference = controls.map(native =>
        coincidence(native, positions, period).rate);
      const minimum = Math.min(...reference);
      const maximum = Math.max(...reference);
      assert(input.rate < minimum);
      const plant = plantTest(controls[0], positions, period);
      rows.push({ clock: pageReset ? 'physical-page-reset' : 'book-continuous',
        pairOffset: offset, period,
        authentic: input,
        nativeMin: minimum, nativeMax: maximum, plant });
    }
  }
}
assert.equal(rows.length, 12);
assert(Math.abs(rows[0].authentic.rate -
  0.001225415716847936) < 1e-14);
assert(Math.abs(rows.find(x => x.clock === 'physical-page-reset'
  && x.period === 28 && x.pairOffset === 0).authentic.rate -
  0.0011828485618945938) < 1e-14);
console.log(JSON.stringify({
  originalRuneCount: N,
  independentlyHeldoutNativeWindows: controls.length,
  hypotheses: rows.length, rows,
  originalPlaintextRecovered: false,
  claim: 'all-secret necessary-condition exclusion for fixed-pair GP841 bijections'
}, null, 2));
