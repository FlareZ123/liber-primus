'use strict';

/**
 * SFT: local 256-rune period-four all-secret bijection obstruction.
 *
 * node sims/lp2_fourphase_local_bigram_sft.cjs
 *
 * Two equal plaintext bigrams at start positions with the same period-four
 * phase remain equal under ANY four secret, arbitrary, stationary, invertible
 * GP29 letter substitutions. Thus the count of equal-phase bigram pairs is a
 * key-independent invariant, regardless of what each permutation is.
 *
 * Scan every page-local window of exact length 256, with 128 and 192 as
 * explicitly reported sensitivity bounds, against independently held-out
 * GP29 English. All physical page boundaries remain intact.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spell} = require('./lp2_local_plaintext_islands_sft.cjs');
const ROOT = path.resolve(__dirname, '..');
const GP = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(path.join(ROOT,
  'resources/control/shakespeare_first300k.txt'), 'utf8');
const PAGES = GP.pages.filter(page => page.page <= 55 && page.indices.length);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((n, page) => n + page.indices.length, 0), 12956);
const heldout = spell(reference.slice(195000));
assert.equal(heldout.length, 76528);

const MOD = 29;
const PERIOD = 4;

/**
 * Collision count among all unordered pairs of identical GP bigrams whose
 * starting positions are equal modulo 4, within a single fixed window.
 * @param {ArrayLike<number>} values
 * @param {number} start
 * @param {number} length
 */
function pairCount(values, start, length) {
  const histogram = new Map();
  let count = 0;
  for (let i = start; i < start + length - 1; i++) {
    const id = (i % PERIOD) * MOD * MOD +
      values[i] * MOD + values[i + 1];
    const n = histogram.get(id) || 0;
    count += n;
    histogram.set(id, n + 1);
  }
  return count;
}

/**
 * Streaming exact collision counts for every length-L window, O(N).
 * Absolute page-local i modulo 4 is preserved as the key phase.
 * @param {number[]} values
 * @param {number} length
 * @returns {number[]}
 */
function windows(values, length) {
  if (values.length < length) return [];
  const id = i => (i % PERIOD) * MOD * MOD +
    values[i] * MOD + values[i + 1];
  const map = new Map();
  let count = 0;
  const add = k => {
    const n = map.get(k) || 0;
    count += n;
    map.set(k, n + 1);
  };
  const remove = k => {
    const n = map.get(k);
    count -= n - 1;
    if (n === 1) map.delete(k);
    else map.set(k, n - 1);
  };
  for (let i = 0; i < length - 1; i++) add(id(i));
  const result = [count];
  for (let i = length; i < values.length; i++) {
    remove(id(i - length));
    add(id(i - 1));
    result.push(count);
  }
  return result;
}

/**
 * Reversible planted four-permutation GP29 encoder: any secret bijections,
 * no assumptions of additive shifts or alphabetical ordering.
 * @param {number[]} source
 * @returns {{encoded:number[],decoded:number[]}}
 */
function plant(source) {
  const perm = Array.from({length: PERIOD}, (_, phase) => {
    const p = Array.from({length: MOD}, (_, i) => i);
    let state = (0x3301 ^ (phase * 0x9e3779b9)) >>> 0;
    for (let i = MOD - 1; i > 0; i--) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const j = (state >>> 0) % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p;
  });
  const inverse = perm.map(p => {
    const result = Array(MOD).fill(-1);
    for (let i = 0; i < MOD; i++) result[p[i]] = i;
    assert(result.every(x => x >= 0));
    return result;
  });
  const encoded = source.map((x, i) => perm[i % PERIOD][x]);
  const decoded = encoded.map((x, i) => inverse[i % PERIOD][x]);
  assert.deepEqual(decoded, source);
  assert.equal(pairCount(source, 0, source.length),
    pairCount(encoded, 0, encoded.length));
  return {encoded, decoded};
}

function run() {
  const findings = [];
  for (const length of [128, 192, 256]) {
    let max = -1;
    let winner = null;
    let originalCount = 0;
    for (const page of PAGES) {
      const v = windows(page.indices, length);
      for (let i = 0; i < v.length; i++) {
        originalCount++;
        if (v[i] > max) {
          max = v[i];
          winner = {page: page.page, start: i};
        }
      }
    }
    const native = windows(heldout, length);
    const minimum = Math.min(...native);
    const above = native.filter(value => value > max).length;
    findings.push({
      length, originalWindows: originalCount,
      maximumOriginalCollisionPairs: max, winningSourceWindow: winner,
      nativeEnglishWindows: native.length, minimumNativePairs: minimum,
      nativeControlFractionExceedingAllOriginalWindows: above / native.length
    });
    if (length === 128) {
      assert.equal(originalCount, 6124);
      assert.equal(max, 8);
      assert.equal(minimum, 1);
    }
    if (length === 192) {
      assert.equal(originalCount, 3018);
      assert.equal(max, 14);
      assert.equal(minimum, 7);
    }
    if (length === 256) {
      assert.equal(originalCount, 445);
      assert.equal(max, 16);
      assert.equal(native.length, 76273);
      assert.equal(minimum, 19);
      assert.equal(above, native.length);
    }
  }
  const known = heldout.slice(8000, 8256);
  const {decoded} = plant(known);
  assert.deepEqual(decoded, known);
  assert(pairCount(known, 0, 256) >= 19);
  const report = {
    input: '55 original unsolved physical LP2 GP29 pages (12956 runes)',
    model: 'any four independent stationary bijections of all 29 GP rune labels',
    sourceMotivation: 'period four is an independent original-image reading of the p15 printed 4x4 number square; not an authenticated cipher',
    invariant: 'unordered same-phase equal-bigram pair count at each local window',
    heldoutGpEnglishRunes: heldout.length,
    findings, nativePlant: {runes: known.length, decodedExactly: true,
      phaseBijections: 4, pairCount: pairCount(known, 0, 256)},
    inference: 'All 256-rune page-local period-four native-English islands are excluded relative to every one of 76273 heldout GP-English windows; no unknown plaintext or key recovered.'
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) run();
module.exports = {pairCount, windows, plant, run};
