'use strict';

/**
 * Original-input, all-secret GF29 five-back state gate for LP2 physical pages 40–53.
 * Run: node sims/lp2_p39_gstate_fiveback_allsecret_sft.cjs
 *
 * State: s[5] = any of 29 values;
 *        s[i+1] = G(s[i]) + C[i] - C[i-5] (mod 29)
 * where G(x) = 27 + 5x + 15x^2 is the original p39 red triad.
 *
 * An otherwise unrestricted fixed secret permutation for EACH state maps
 * ciphertext C[i] to GP plaintext P[i]. The first five rune positions are
 * granted arbitrary plaintext and are included as five free positions in
 * every top-k bound. This grants far more keys than a chosen affine decoder.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = require(path.join(root, 'resources/liber-primus/lp2-corpus.json'));
const ink = require(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'));
const solved = require(path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'));
const latinSource = fs.readFileSync(
  path.join(root, 'resources/control/latin-vulgate-gp-wholewords.txt'),
  'utf8',
);

const MOD = 29;
const K = [1, 2, 3, 5, 9, 14];
const PAGE_FIRST = 40;
const PAGE_LAST = 53;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function G(x) {
  return mod(27 + 5 * x + 15 * x * x);
}

/**
 * @param {readonly number[]} seq
 * @returns {number[]}
 */
function topCounts(seq) {
  const f = Array(MOD).fill(0);
  for (const sym of seq) {
    assert.ok(Number.isInteger(sym) && sym >= 0 && sym < MOD);
    f[sym]++;
  }
  f.sort((a, b) => b - a);
  return K.map((count) => f.slice(0, count).reduce((sum, value) => sum + value, 0));
}

/**
 * Independent of every one of the 29 secret output permutations, the largest
 * possible sum of any top k plaintext symbol counts equals the sum of the
 * k largest ciphertext symbol counts in each state row.
 *
 * @param {readonly number[]} ciphertext
 * @param {number} seed
 * @returns {{ bound: number[], finalState: number, states: number[] }}
 */
function invariant(ciphertext, seed) {
  let state = seed;
  const rows = Array.from({ length: MOD }, () => Array(MOD).fill(0));
  const states = [];
  for (let i = 5; i < ciphertext.length; i++) {
    const symbol = ciphertext[i];
    rows[state][symbol]++;
    states.push(state);
    state = mod(G(state) + symbol - ciphertext[i - 5]);
  }
  for (const row of rows) {
    row.sort((a, b) => b - a);
  }
  const bound = K.map((count) => 5 + rows.reduce(
    (sum, row) => sum + row.slice(0, count).reduce((part, v) => part + v, 0), 0,
  ));
  return { bound, finalState: state, states };
}

/**
 * @param {readonly number[]} ciphertext
 * @returns {number}
 */
function synchronizationPrefix(ciphertext) {
  const states = Array.from({ length: MOD }, (_, i) => i);
  for (let i = 5; i < ciphertext.length; i++) {
    for (let k = 0; k < states.length; k++) {
      states[k] = mod(G(states[k]) + ciphertext[i] - ciphertext[i - 5]);
    }
    if (new Set(states).size === 1) {
      return i + 1;
    }
  }
  return -1;
}

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let b = 1; b < MOD; b++) {
    if (mod(a * b) === 1) return b;
  }
  throw new Error('Noninvertible GF29 element');
}

/**
 * Plant a full-length native-GP plaintext into exactly this machine,
 * with 29 hidden, state-indexed affine permutations as a subclass of
 * the arbitrary 29! allowed secret alphabet permutations.
 *
 * @param {readonly number[]} plain
 * @param {number} seed
 * @returns {{cipher:number[], recovered:number[]}}
 */
function plant(plain, seed) {
  const cipher = plain.slice(0, 5);
  const recovered = plain.slice(0, 5);
  let state = seed;
  for (let i = 5; i < plain.length; i++) {
    const a = 1 + (7 * state) % 28;
    const b = mod(13 * state + 5);
    const symbol = mod(inverse(a) * (plain[i] - b));
    cipher.push(symbol);
    recovered.push(mod(a * symbol + b));
    state = mod(G(state) + symbol - cipher[i - 5]);
  }
  return { cipher, recovered };
}

const runeLookup = new Map(corpus.runes.map((r, i) => [r, i]));
const p39 = ink.pages.find((page) => page.page === 39);
const triad = p39.red_spans.find((span) => span.length === 3);
assert.deepEqual([...triad.runes].map((r) => runeLookup.get(r)), [27, 5, 15]);
assert.equal(G(24), 0);
assert.equal(G(25), 15);

const originalPages = corpus.pages.filter((p) => p.page <= 55);
assert.equal(originalPages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const ciphertext = corpus.pages
  .filter((p) => p.page >= PAGE_FIRST && p.page <= PAGE_LAST)
  .flatMap((p) => p.indices);
assert.equal(ciphertext.length, 3008);

const bounds = Array.from({ length: MOD }, (_, seed) => invariant(ciphertext, seed));
const maxima = K.map((_, j) => Math.max(...bounds.map((result) => result.bound[j])));
const minima = K.map((_, j) => Math.min(...bounds.map((result) => result.bound[j])));
assert.deepEqual(maxima, [233, 424, 602, 925, 1487, 2060]);
assert.deepEqual(minima, [229, 418, 594, 916, 1479, 2053]);
assert.equal(synchronizationPrefix(ciphertext), 133);
assert.equal(new Set(bounds.map((result) => result.finalState)).size, 1);

// One independent native-GP English positive from historically solved Cicada.
const english = solved.sections.flatMap((section) => [...section.source_text]
  .filter((rune) => runeLookup.has(rune))
  .map((rune) => runeLookup.get(rune)));
assert.equal(english.length, 2979);
const englishTop = topCounts(english);
assert.deepEqual(englishTop, [380, 636, 853, 1248, 1958, 2488]);
assert.ok(K.every((_, j) => maxima[j] < englishTop[j]));

// The second language control uses a separately pinned, actual GP29 Latin
// whole-word corpus. Its digit alphabet is GP ordinals 0..28.
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinWords = latinSource.split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^[0-9A-S]+$/.test(line));
const latin = latinWords.flatMap((word) => [...word].map((character) => alphabet.indexOf(character)));
assert.equal(latin.length, 204802);
const latinWindows = [];
for (let offset = 0; offset + 3008 <= latin.length; offset += 3008) {
  latinWindows.push(topCounts(latin.slice(offset, offset + 3008)));
}
assert.equal(latinWindows.length, 68);
const nativeMinimum = K.map((_, j) => Math.min(...latinWindows.map((v) => v[j])));
assert.deepEqual(nativeMinimum, [328, 635, 933, 1438, 2201, 2743]);
assert.ok(K.every((_, j) => maxima[j] < nativeMinimum[j]));

// Source-shaped positive plant: every secret alphabet is correctly inverted,
// and the SAME necessary bound includes its true plaintext symbol counts.
const nativePlain = latin.slice(0, ciphertext.length);
const positive = plant(nativePlain, 24);
assert.deepEqual(positive.recovered, nativePlain);
const plantedLimit = invariant(positive.cipher, 24).bound;
const plantedTop = topCounts(nativePlain);
assert.ok(K.every((_, j) => plantedLimit[j] >= plantedTop[j]));

// A genuine model has a repeated-state row-permutation inverse. The
// invariant is derived before any key search; source-original failure cannot
// be repaired by changing any of the 29 secret row permutations.
console.log('PASS: original source p39 red G(x)=[27,5,15], root=24');
console.log('Original p40-53: 3008 ciphertext runes, 29/29 arbitrary IVs');
console.log('All-seed maximum top-k capacities:', JSON.stringify(maxima));
console.log('All-seed minimum top-k capacities:', JSON.stringify(minima));
console.log('All 29 states synchronize at original chapter prefix length 133');
console.log('Authenticated solved-GP English counts (2979):', JSON.stringify(englishTop));
console.log('Latin 68 x 3008-rune control minima:', JSON.stringify(nativeMinimum));
console.log('Positive native-Latin plant 3008/3008 inverted; bound dominates true top-k');
console.log('Decision: continuous GF29 G-state five-back one-row-per-state cipher');
console.log('cannot generate these native-GP language profiles; original key not found.');
