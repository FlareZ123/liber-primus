/**
 * LP2 page-private predecessor-permutation equality invariant.
 * Original-only SFT, Node.js 22 CommonJS, read-only, deterministic xorshift seed.
 *
 * For each page, the putative cipher is C_i = pi[ C_(i-1) ][P_i],
 * where every pi row may be any private 29-symbol bijection.
 * Within one visible predecessor row, the pair-collision numerator is
 * exactly preserved under any bijection (regardless of the secret table).
 *
 * Donor plants sample exact GP29 source words matching every page-local
 * printed word-fragment length, then apply fresh page-private 29! permutations.
 * A negative finding is conditional on this authentic native prose model.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const native = readJSON('resources/external/relikd-solved-gp29-native-v1.json');
const transcription = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((c, i) => [c, i]));
const original = corpus.pages.filter((p) => p.page <= 55 && p.indices && p.indices.length);
assert.equal(original.length, 55);

const segments = transcription.split('%').filter((s) => /[\u16a0-\u16ff]/u.test(s));
const layouts = segments.slice(0, 55).map((s) => {
  const words = s.replace(/[\/\r\n]/g, '').split(/[-.,&$]+/)
    .map((token) => [...token].filter((c) => runeIndex.has(c)).map((c) => runeIndex.get(c)))
    .filter((a) => a.length > 0);
  return words.map((a) => a.length);
});
assert.equal(layouts.length, original.length);
for (let i = 0; i < original.length; i++) {
  assert.equal(layouts[i].reduce((a, b) => a + b, 0), original[i].indices.length,
    'Physical page and print-word layout must agree at position ' + i);
}
assert.equal(original.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(layouts.flat().length, 2928);

const donors = Array.from({length: 30}, () => []);
for (const section of native.sections) {
  const items = section.source_text.match(/[\u16a0-\u16ff]+/gu) || [];
  for (const token of items) {
    const a = [...token].map((ch) => {
      assert.ok(runeIndex.has(ch), 'Donor contains unknown rune');
      return runeIndex.get(ch);
    });
    donors[a.length].push(a);
  }
}
for (const length of layouts.flat()) {
  assert.ok(donors[length] && donors[length].length > 0, 'Missing authentic donor for length ' + length);
}

/** @type {number} */
let seed = 0xc4a5be33;
/** @returns {number} integer in [0, 2^32) */
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {number} n */
function pick(n) { return rand32() % n; }
/** @returns {number[]} */
function randomPermutation() {
  const values = Array.from({length: 29}, (_, i) => i);
  for (let k = 28; k > 0; k--) {
    const j = pick(k + 1);
    [values[k], values[j]] = [values[j], values[k]];
  }
  return values;
}

/**
 * Count unordered equal follower pairs within each PAGE × PREVIOUS CIPHERTEXT state.
 * Does not depend on knowing, guessing, or fitting any substitution table.
 * @param {number[][]} pages
 * @param {number[][] | null} decoded Optional plaintext conditioned on the same C state tape
 * @returns {{agree:number,pairs:number,q:number}}
 */
function qStatistic(pages, decoded = null) {
  let agree = 0;
  let pairs = 0;
  for (let p = 0; p < pages.length; p++) {
    const c = pages[p];
    const v = decoded ? decoded[p] : c;
    const table = Array.from({length: 29}, () => new Uint16Array(29));
    const n = new Uint16Array(29);
    for (let i = 1; i < c.length; i++) {
      table[c[i - 1]][v[i]]++;
      n[c[i - 1]]++;
    }
    for (let s = 0; s < 29; s++) {
      pairs += n[s] * (n[s] - 1) / 2;
      for (let t = 0; t < 29; t++) {
        const count = table[s][t];
        agree += count * (count - 1) / 2;
      }
    }
  }
  return {agree, pairs, q: agree / pairs};
}
const originalQ = qStatistic(original.map((p) => p.indices));
assert.equal(originalQ.agree, 1919);
assert.equal(originalQ.pairs, 54009);

/**
 * Encrypt one donor book with 55 independent 29-row secret substitution tables.
 * Ciphertext first state is an unconstrained secret rune; the first ciphertext
 * symbol uses that private initial state. Both row tables and first state change
 * for each physical page. Exact decrypt and invariant checks are mandatory.
 */
function plantBook() {
  const cipher = [];
  const plaintext = [];
  for (const lengths of layouts) {
    const p = [];
    for (const n of lengths) p.push(...donors[n][pick(donors[n].length)]);
    const perms = Array.from({length: 29}, randomPermutation);
    const inverse = perms.map((row) => {
      const inv = new Uint8Array(29);
      for (let k = 0; k < 29; k++) inv[row[k]] = k;
      return inv;
    });
    let prev = pick(29);
    const c = [];
    const recovered = [];
    for (const plain of p) {
      const curr = perms[prev][plain];
      c.push(curr);
      recovered.push(inverse[prev][curr]);
      prev = curr;
    }
    assert.deepEqual(recovered, p);
    cipher.push(c);
    plaintext.push(p);
  }
  const qc = qStatistic(cipher);
  const qp = qStatistic(cipher, plaintext);
  assert.equal(qc.agree, qp.agree, 'Private substitution must preserve predecessor-row collisions');
  assert.equal(qc.pairs, qp.pairs);
  return qc.q;
}

const N = 500;
const qValues = [];
for (let trial = 0; trial < N; trial++) qValues.push(plantBook());
qValues.sort((a, b) => a - b);
const below = qValues.filter((q) => q <= originalQ.q).length;
assert.equal(below, 0, 'The original must be below all authentic native random-key plants');
const report = {
  original: originalQ, randomKeyPlants: N, belowOriginal: below,
  plantMin: qValues[0], plantMedian: qValues[Math.floor(N / 2)],
  plantMax: qValues[N - 1],
  sourcePages: original.length, sourceRunes: 12956,
  printedPageFragments: 2928, donorWords: native.sections.reduce(
    (sum, sec) => sum + (sec.source_text.match(/[\u16a0-\u16ff]+/gu) || []).length, 0),
  initialSeed: '0xc4a5be33'
};
console.log('ORIGINAL GP29 PAGE-PRIVATE PREDECESSOR EQUALITY TEST');
console.log(JSON.stringify(report, null, 2));
console.log('PASS: original below all controls; exact source layout and all true-key replay invariant assertions passed.');
