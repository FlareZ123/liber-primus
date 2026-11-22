'use strict';

/**
 * Source-selected p39 red polynomial as a reversible plaintext-feedback
 * rare-repeat marker, with an exact original-source native-English gate.
 *
 * Test: node sims/lp2_p39_quadratic_zero_feedback_source_gate_sft.cjs
 * Windows-compatible Node 22 CommonJS, read-only, dependency-free.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const inputs = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/external/cicada2012-blake-marriage-gutenberg45315.txt',
  'resources/external/kjv-passion-gospels-2014.txt'
];
const chapterInputs = [
  ...inputs,
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt',
  'resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt'
];
const sourceTokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const mod = (x, m) => (x % m + m) % m;

/** Source-visible p39 red coefficients, low degree first: 27,5,15.
 * @param {number} x Native previous plaintext rune index
 * @returns {number} Reserved next plaintext rune
 */
function G(x) {
  return mod(27 + 5 * x + 15 * x * x, 29);
}

/**
 * Existing repository's source-native LP1 GP orthography: ING as GP21, IO
 * as GP27, and QU/V/K/Q/Z historically folded. All printed word boundaries
 * are intentionally discarded.
 * @param {string} source
 * @returns {number[]}
 */
function nativeGP(source) {
  const text = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        out.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        out.push(27);
        i += 2;
      } else {
        const token = sourceTokens.find(t => word.startsWith(t.s, i));
        if (token) {
          out.push(token.i);
          i += token.s.length;
        } else {
          i++;
        }
      }
    }
  }
  return out;
}

/** @param {number[]} runes @param {number[]} pageStarts */
function markerEvents(runes, pageStarts) {
  const reset = new Set(pageStarts);
  let count = 0;
  for (let i = 1; i < runes.length; i++)
    if (!reset.has(i) && runes[i] === G(runes[i - 1])) count++;
  return count;
}

/**
 * Literal reversible rank28 encoder for any secret nonzero 28-way rotation.
 * Encodes only current rune using the previous plaintext state and previous
 * ciphertext rune. Its zero-event predicate holds for any key schedule.
 * @param {number[]} P
 * @param {number[]} cuts All physical page starts, including zero
 * @param {number} shift Example secret 28-rank rotation
 */
function encrypt(P, cuts, shift) {
  const resets = new Set(cuts);
  const C = [];
  for (let i = 0; i < P.length; i++) {
    if (resets.has(i)) {
      C.push(mod(P[i] + 7, 29));
      continue;
    }
    const r = G(P[i - 1]);
    const rank = P[i] < r ? P[i] : P[i] - 1;
    const delta = P[i] === r ? 0 : 1 + mod(rank + shift, 28);
    C.push(mod(C[i - 1] + delta, 29));
  }
  return C;
}

/**
 * Exact inverse knowing only the secret nonzero rotation and page starts.
 * @param {number[]} C
 * @param {number[]} cuts
 * @param {number} shift
 */
function decrypt(C, cuts, shift) {
  const resets = new Set(cuts);
  const P = [];
  for (let i = 0; i < C.length; i++) {
    if (resets.has(i)) {
      P.push(mod(C[i] - 7, 29));
      continue;
    }
    const delta = mod(C[i] - C[i - 1], 29);
    const r = G(P[i - 1]);
    if (delta === 0) {
      P.push(r);
    } else {
      const rank = mod(delta - 1 - shift, 28);
      P.push(rank >= r ? rank + 1 : rank);
    }
  }
  return P;
}

/**
 * All source-contiguous windows with the actual 55 physical-page cuts.
 * Uses O(n) prefix counts and exactly 54 excluded page-start transitions.
 * @param {number[]} P Native-GP literal source tape
 * @param {number[]} cuts Source physical page starts
 * @param {number} n Exact original rune count
 */
function sourceWindowCounts(P, cuts, n) {
  const mark = new Uint8Array(P.length);
  const pref = new Uint32Array(P.length + 1);
  for (let i = 1; i < P.length; i++) mark[i] = Number(P[i] === G(P[i - 1]));
  for (let i = 0; i < P.length; i++) pref[i + 1] = pref[i] + mark[i];
  let min = Infinity;
  let max = -Infinity;
  let bestOffset = -1;
  let total = 0;
  let windows = 0;
  for (let s = 0; s + n <= P.length; s++) {
    let count = pref[s + n] - pref[s + 1];
    for (let c = 1; c < cuts.length; c++) count -= mark[s + cuts[c]];
    if (count < min) {
      min = count;
      bestOffset = s;
    }
    if (count > max) max = count;
    total += count;
    windows++;
  }
  return {windows, min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
    mean: windows ? total / windows : null, bestOffset};
}

function main() {
  const tape = pages.flatMap(p => p.indices);
  const cuts = [];
  let n = 0;
  let repeats = 0;
  for (const p of pages) {
    cuts.push(n);
    n += p.indices.length;
    for (let i = 1; i < p.indices.length; i++)
      repeats += Number(p.indices[i] === p.indices[i - 1]);
  }
  assert.equal(pages.length, 55);
  assert.equal(n, 12956);
  assert.equal(repeats, 86);
  assert.equal(G(24), 0);
  assert.equal(G(0), 27);

  const plantP = nativeGP(read(inputs[0])).slice(5000, 5000 + n);
  assert.equal(plantP.length, n);
  const plantC = encrypt(plantP, cuts, 13);
  const plantRecovered = decrypt(plantC, cuts, 13);
  assert.deepEqual(plantRecovered, plantP);
  assert.equal(markerEvents(plantP, cuts),
    pages.reduce((count, p, idx) => {
      const start = cuts[idx];
      for (let i = 1; i < p.indices.length; i++)
        count += Number(plantC[start + i] === plantC[start + i - 1]);
      return count;
    }, 0));
  const inverseOriginal = decrypt(tape, cuts, 13);
  assert.deepEqual(encrypt(inverseOriginal, cuts, 13), tape);

  const controls = inputs.map(name => {
    const seq = nativeGP(read(name));
    const x = sourceWindowCounts(seq, cuts, n);
    return {name, nativeRunes: seq.length, ...x};
  });
  assert.deepEqual(controls.map(x => x.windows),
    [204151, 49537, 308372, 20321, 40720]);
  assert.deepEqual(controls.map(x => x.min), [440, 369, 372, 372, 467]);
  assert(controls.every(x => x.min > repeats));

  // Stronger independent-chapter null: each of the nine source-visible
  // chapters may select a different text AND an unrestricted offset.
  const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
    [27, 32], [33, 39], [40, 53], [54, 55]].map(([start, end]) => {
    const ps = pages.filter(p => p.page >= start && p.page <= end);
    let totalRunes = 0;
    let exactOriginal = 0;
    const starts = [];
    for (const page of ps) {
      starts.push(totalRunes);
      totalRunes += page.indices.length;
      for (let j = 1; j < page.indices.length; j++)
        exactOriginal += Number(page.indices[j] === page.indices[j - 1]);
    }
    return {id: 'p' + start + '-' + end, n: totalRunes,
      cuts: starts, original: exactOriginal,
      min: Infinity, source: null, offset: null};
  });
  for (const input of chapterInputs) {
    const source = nativeGP(read(input));
    for (const chapter of chapters) {
      const found = sourceWindowCounts(source, chapter.cuts, chapter.n);
      if (found.min !== null && found.min < chapter.min) {
        chapter.min = found.min;
        chapter.source = input;
        chapter.offset = found.bestOffset;
      }
    }
  }
  assert.deepEqual(chapters.map(x => x.original),
    [4, 6, 9, 10, 11, 13, 12, 18, 3]);
  assert.deepEqual(chapters.map(x => x.min),
    [9, 17, 34, 38, 15, 22, 32, 65, 0]);
  assert.equal(chapters.reduce((a, x) => a + x.min, 0), 232);

  console.log(JSON.stringify({
    status: 'bounded original negative, no authentic plaintext or key',
    originalRunes: n,
    originalPageRepeats: repeats,
    sourceQuadratic: 'G(x) = 27 + 5x + 15x² mod 29',
    sourceGPWordsIgnored: true,
    allSecretNonzero28WayOutputsPermitted: true,
    positiveOriginalFormatNativePlantExact: true,
    exactOriginalCipherForwardRoundtrip: true,
    originalLengthControlWindows: controls.reduce((n, x) => n + x.windows, 0),
    independentNineChapterBestPossibleSourceHits: 232,
    independentNineChapterOriginalEvents: 86,
    chapters,
    controls
  }, null, 2));
}
if (require.main === module) main();
module.exports = {G, nativeGP, markerEvents, encrypt, decrypt, sourceWindowCounts};
