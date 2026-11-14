'use strict';

/**
 * Exhaustive, all-secret periods 1..4 under historically authentic
 * Cicada plaintext-F transparent GP29 additive encryption.
 * Original rune corpus + source-visible chapter resets, no guessed crib.
 * Node22: node sims/lp2_allsecret_period4_ftransparent_exact_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const o = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const sourceChapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
].map(([first, last]) => o.pages.slice(first, last + 1)
  .flatMap((page) => page.indices));
assert.deepEqual(sourceChapters.map((c) => c.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
const originalBook = sourceChapters.flat();
assert.equal(originalBook.length, 12956);

/**
 * Exhaustive branching over consumed-key counts.
 * Plaintext F is always literal and keeps the clock. Ciphertext F may
 * represent plaintext F OR keyed non-F; a keyed branch yielding F is
 * impossible under the authentic forward encoder.
 * @param {number[]} cipher
 * @param {number[]} key GP29 values, repeated from consumed-clock zero.
 * @returns {{passed:boolean,firstFailure:number|null}}
 */
function feasible(cipher, key) {
  let states = [0];
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    let next = [];
    if (c === 0) {
      next = states.slice(); // Literal plaintext F bypasses.
      for (const consumed of states) {
        if (key[consumed % key.length] !== 0) next.push(consumed + 1);
      }
      next = [...new Set(next)];
    } else {
      for (const consumed of states) {
        if (c !== key[consumed % key.length]) next.push(consumed + 1);
      }
    }
    if (next.length === 0) return { passed: false, firstFailure: i };
    states = next;
  }
  return { passed: true, firstFailure: null };
}

/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encrypt(plain, key) {
  let used = 0;
  return plain.map((p) => p === 0 ? 0 : (p + key[(used++) % key.length]) % 29);
}

const native = o.pages[57].indices;
assert.equal(native.length, 95);
assert.ok(native.includes(0));
const nativeLong = Array.from({ length: 6 }, () => native).flat();
for (const key of [[3], [2, 17], [7, 0, 11], [5, 0, 9, 22]]) {
  const planted = encrypt(nativeLong, key);
  assert.equal(planted.length, 570);
  assert.equal(feasible(planted, key).passed, true);
}

// Enumerate *all* 29^L possible keys. No cyclic phase field is missing:
// a rotation of a length-L key already occurs among the 29^L arrays.
const report = [];
for (let period = 1; period <= 4; period++) {
  const total = 29 ** period;
  const key = Array(period).fill(0);
  let openingSurvivors = 0, continuousBookSurvivors = 0;
  let chapterResetSurvivors = 0;
  /** @type {number[][]} */
  const openingNonzero = [];
  /** @type {number[][]} */
  const resetKeys = [];
  for (let seed = 0; seed < total; seed++) {
    let rest = seed;
    for (let j = 0; j < period; j++) {
      key[j] = rest % 29;
      rest = Math.floor(rest / 29);
    }
    if (!feasible(sourceChapters[0], key).passed) continue;
    openingSurvivors++;
    if (key.some((x) => x !== 0) && openingNonzero.length < 6) {
      openingNonzero.push(key.slice());
    }
    if (feasible(originalBook, key).passed) continuousBookSurvivors++;
    if (sourceChapters.every((chapter) => feasible(chapter, key).passed)) {
      chapterResetSurvivors++;
      resetKeys.push(key.slice());
    }
  }
  assert.equal(continuousBookSurvivors, 1);
  assert.equal(chapterResetSurvivors, 1);
  assert.deepEqual(resetKeys, [Array(period).fill(0)]);
  report.push({
    period, allKeysChecked: total,
    opening729Survivors: openingSurvivors,
    continuous12956Survivors: continuousBookSurvivors,
    allNineIndependentlyResetChaptersSurvivors: chapterResetSurvivors,
    allChapterKeys: resetKeys,
    exampleNonzeroOpeningSurvivors: openingNonzero
  });
}
assert.deepEqual(report.map((row) => row.opening729Survivors), [1, 1, 3, 184]);
assert.equal(report.reduce((sum, row) => sum + row.allKeysChecked, 0), 732540);

console.log(JSON.stringify({
  source: 'Original LP2 pp0–55, unchanged GP29 indices; visual chapter cuts fixed',
  cipher: 'Period-L additive GP29 with genuine plaintext-F bypass and no ciphertext-F preclassification',
  completeSecretKeyEnumeration: report,
  controls: 'Four independently planted 570-rune genuine-p57 GP prose streams pass exact cipher feasibility',
  conclusion: 'Every nonidentity period <=4 key is impossible under continuous OR independently reset visual-chapter clocks; no unknown plaintext recovered.',
  caveat: 'This is an exhaustive deterministic bound only for repeated GP29 additive plaintext-F cipher, not arbitrary encryption'
}, null, 2));
