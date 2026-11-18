'use strict';

/**
 * Original GP29 C-repeat event: exact all-hidden-key exclusion of the
 * constant predecessor plaintext displacement family.
 *
 * Source-shaped positive encrypt/decrypt control and exhaustive source-native
 * complete-window counts on original physical page cuts. Windows Node22 CJS.
 * Input is original corpus plus five existing GP-English references.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} f */
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = originalPages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const pageCuts = [];
let running = 0;
for (const p of originalPages) {
  if (running > 0) pageCuts.push(running);
  running += p.indices.length;
}
assert.equal(pageCuts.length, 54);
const cuts = new Set(pageCuts);
let originalRepeats = 0;
for (let i = 1; i < original.length; i++) {
  if (!cuts.has(i) && original[i] === original[i - 1]) originalRepeats++;
}
assert.equal(originalRepeats, 86);

/** @param {number} n */
const mod29 = n => (n % 29 + 29) % 29;
const sourceTokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/**
 * Established local native GP orthography from the existing p39 source gate.
 * @param {string} source
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
        const t = sourceTokens.find(x => word.startsWith(x.s, i));
        if (t) {
          out.push(t.i);
          i += t.s.length;
        } else {
          i++;
        }
      }
    }
  }
  return out;
}

/**
 * Necessary and sufficient exact collision event for a GP29 successor-offset
 * cipher whose zero output is reserved for P_i = P_(i-1)+d mod29.
 * The 28 remaining transitions may be permuted with ANY secret key, including
 * a new independent arbitrary 28-way permutation at every rune.
 * @param {number[]} a
 * @param {number} d
 * @param {Set<number>} pageStarts
 */
function eventCount(a, d, pageStarts) {
  let n = 0;
  for (let i = 1; i < a.length; i++) {
    if (!pageStarts.has(i) && a[i] === mod29(a[i - 1] + d)) n++;
  }
  return n;
}

/** @param {number[]} a */
/**
 * Simple concrete bijective representative of entire all-secret zero-reserved
 * family. The structural event count is independent of this explicit key.
 * @param {number[]} P
 * @param {number} d
 * @param {Set<number>} pageStarts
 */
function encrypt(P, d, pageStarts, resetShift = 13) {
  const C = new Array(P.length);
  for (let i = 0; i < P.length; i++) {
    if (pageStarts.has(i) || i === 0) {
      C[i] = mod29(P[i] + resetShift);
      continue;
    }
    const reserved = mod29(P[i - 1] + d);
    const rank = P[i] < reserved ? P[i] : P[i] - 1;
    const differential = P[i] === reserved ? 0 : rank + 1;
    C[i] = mod29(C[i - 1] + differential);
  }
  return C;
}
/**
 * @param {number[]} C
 * @param {number} d
 * @param {Set<number>} pageStarts
 */
function decrypt(C, d, pageStarts, resetShift = 13) {
  const P = new Array(C.length);
  for (let i = 0; i < C.length; i++) {
    if (pageStarts.has(i) || i === 0) {
      P[i] = mod29(C[i] - resetShift);
      continue;
    }
    const reserved = mod29(P[i - 1] + d);
    const differential = mod29(C[i] - C[i - 1]);
    if (differential === 0) {
      P[i] = reserved;
    } else {
      const rank = differential - 1;
      P[i] = rank >= reserved ? rank + 1 : rank;
    }
  }
  return P;
}

/**
 * Exact fastest whole-register native-window count at original physical cuts.
 * The source is deliberately allowed arbitrary start offsets, which is much
 * more permissive than matching its printed word/page boundaries.
 * @param {number[]} P
 * @param {number} d
 */
function minimumSourceCount(P, d) {
  const mark = new Uint8Array(P.length);
  const pref = new Int32Array(P.length + 1);
  for (let i = 1; i < P.length; i++) {
    mark[i] = Number(P[i] === mod29(P[i - 1] + d));
  }
  for (let i = 0; i < P.length; i++) {
    pref[i + 1] = pref[i] + mark[i];
  }
  let min = Infinity;
  let at = -1;
  const n = original.length;
  for (let start = 0; start + n <= P.length; start++) {
    let count = pref[start + n] - pref[start + 1];
    for (const cut of pageCuts) count -= mark[start + cut];
    if (count < min) {
      min = count;
      at = start;
    }
  }
  return { min, at };
}

const nativeP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(nativeP57.length, 95);
const plant = Array.from({ length: original.length },
  (_, i) => nativeP57[i % nativeP57.length]);
for (let d = 0; d < 29; d++) {
  const ciphertext = encrypt(plant, d, cuts);
  assert.deepEqual(decrypt(ciphertext, d, cuts), plant);
  assert.equal(eventCount(plant, d, cuts), eventCount(ciphertext, 0, cuts));
}


/**
 * All 29 complete original unknown-page inverses with the identity page
 * initializer and literal source GP29 ordering on nonzero transitions.
 * The source does not select this decoder, so these are complete, finite
 * original-cipher tests rather than verified creator keys.
 * @param {number[]} P
 */
function coincidence(P) {
  const freq = new Array(29).fill(0);
  for (const i of P) freq[i]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (P.length * (P.length - 1));
}
const originalInverses = [];
for (let d = 0; d < 29; d++) {
  const guess = decrypt(original, d, cuts, 0);
  assert.deepEqual(encrypt(guess, d, cuts, 0), original);
  originalInverses.push({
    d,
    nativeRuneCount: guess.length,
    coincidence: coincidence(guess),
    first25SourceRuneIndices: guess.slice(0, 25),
  });
}
const originalIocMin = Math.min(...originalInverses.map(x => x.coincidence));
const originalIocMax = Math.max(...originalInverses.map(x => x.coincidence));
assert(originalIocMin > 0.03448 && originalIocMax < 0.03455);

const references = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/external/cicada2012-blake-marriage-gutenberg45315.txt',
  'resources/external/kjv-passion-gospels-2014.txt',
];
const results = references.map(source => {
  const P = nativeGP(read(source));
  assert(P.length >= original.length);
  return {
    source,
    nativeRuneCount: P.length,
    perDelta: Array.from({ length: 29 }, (_, d) => minimumSourceCount(P, d)),
  };
});
const smallest = Math.min(...results.flatMap(x => x.perDelta.map(y => y.min)));
assert.equal(smallest, 140);
assert(results.every(r => r.perDelta.every(({ min }) => min > originalRepeats)));
const choice = results.flatMap(r => r.perDelta.map((row, d) =>
  ({ source: r.source, d, ...row })))
  .sort((a, b) => a.min - b.min).slice(0, 10);
console.log(JSON.stringify({
  definition: 'C_i=C_(i-1) iff P_i = P_(i-1)+d (mod29), any hidden nonzero 28-permutation',
  originalRuneCount: original.length,
  originalPrintedPageCuts: pageCuts.length,
  originalCipherRepeatCount: originalRepeats,
  testedOffsets: 29,
  references: results,
  smallestAuthenticatedSourceWindowCount: smallest,
  sourceWindowsBestTen: choice,
  plantedNativeReconstruction: '29/29 exact full-length forward inverse controls',
  originalSourceInverses: originalInverses,
  originalIocRange: [originalIocMin, originalIocMax],
  conclusion: 'Conditional all-hidden-key exclusion of fixed-d successor repeat grammar on five pinned source-native English libraries; no actual plaintext or all-language impossibility',
}, null, 2));
