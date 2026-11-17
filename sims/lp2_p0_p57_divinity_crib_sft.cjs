'use strict';

/**
 * Source-locked p0 ↔ p57 DIVINITY WITHIN 8+5 crib test.
 * Windows Node.js 22: run this single file from its repository location.
 * This script is read-only and uses the unchanged historical GP29 corpus.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

/** @typedef {{page:number, runic_count:number, indices:number[], status:string}} Page */
/** @typedef {{translit:string[], pages:Page[]}} Corpus */

/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const letters = corpus.translit;
const firstChapter = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
const finalClear = corpus.pages[57].indices;
const opening = firstChapter.slice(0, 13);
/** GP indices for the source-p57 words DIUINITY WITHIN, 8+5 runes. */
const proposed = [23, 10, 1, 10, 9, 10, 16, 26, 7, 10, 2, 10, 9];
const modulo = (x) => (x % 29 + 29) % 29;
/** @param {number[]} data */
function coincidence(data) {
  const count = Array(29).fill(0);
  for (const x of data) count[x]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) / (data.length * (data.length - 1));
}
/** @param {number[]} data */
function labels(data) { return data.map((x) => letters[x]).join(' '); }
/**
 * Authentic 2014 literal-plaintext-F bypass: 0 plaintext emits 0 ciphertext
 * and does not advance the key. Non-F plaintext always advances the key.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} initialClock
 */
function legalClocks(cipher, key, initialClock) {
  let clocks = new Set([initialClock]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const clock of clocks) {
      if (modulo(cipher[i] - key[clock % key.length]) !== 0) next.add(clock + 1);
      if (cipher[i] === 0) next.add(clock);
    }
    clocks = next;
    if (clocks.size === 0) return {death: i, clocks: []};
  }
  return {death: -1, clocks: [...clocks]};
}
/**
 * Positive control encoding with the authentic literal-F bypass.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} initialClock
 */
function forward(plaintext, key, initialClock) {
  const result = [];
  let clock = initialClock;
  for (const p of plaintext) {
    if (p === 0) result.push(0);
    else { result.push(modulo(p + key[clock % key.length])); clock++; }
  }
  return result;
}

assert.equal(corpus.pages.length, 58);
assert.deepEqual(corpus.pages.slice(0, 3).map((p) => p.runic_count), [262, 266, 201]);
assert.equal(firstChapter.length, 729);
assert.equal(finalClear.length, 95);
assert.deepEqual(opening, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(finalClear.findIndex((_, i) => proposed.every((v, k) => finalClear[i + k] === v)), 73);
assert.equal(labels(proposed), 'D I U I N I T Y W I TH I N');

const key = opening.map((c, i) => modulo(c - proposed[i]));
assert.deepEqual(key, [21, 27, 17, 22, 26, 9, 11, 3, 8, 16, 16, 11, 25]);
assert.deepEqual(opening, proposed.map((p, i) => modulo(p + key[i])));
const body = firstChapter.slice(13);
assert.equal(body.length, 716);

/** Unfitted repeated period-13 key applied to the entire authentic chapter. */
const repeated = firstChapter.map((c, i) => modulo(c - key[i % key.length]));
const ordinary = repeated.slice(13);
assert(Math.abs(coincidence(ordinary) - 0.03524631792788217) < 1e-12);

/** Plaintext-autokey seeded only by the hypothesized p0 heading. */
const autokey = proposed.slice();
for (let i = 13; i < firstChapter.length; i++) {
  autokey.push(modulo(firstChapter[i] - autokey[i - 13]));
}
assert(Math.abs(coincidence(autokey.slice(13)) - 0.03414071961557995) < 1e-12);

/** Ciphertext-feedback key uses the unchanged 13 earlier source runes. */
const cipherFeedback = firstChapter.map((c, i) =>
  i < 13 ? proposed[i] : modulo(c - firstChapter[i - 13])
);
assert(Math.abs(coincidence(cipherFeedback.slice(13)) - 0.03494940813376567) < 1e-12);

/** All F-bypass clocks after an unencrypted 13-rune crib prefix. */
const strict = legalClocks(body, key, 13);
assert.equal(strict.death, 32); // chapter offset 13 + 32 = original index 45
assert.equal(firstChapter[45], 9); // N
assert.equal(key[44 % 13], 9);    // N, forcing illegal plaintext F

/** Nontrivial native positive; a planted original-source plaintext survives. */
const positive = forward(finalClear, key, 13);
assert.equal(positive.length, 95);
assert.equal(legalClocks(positive, key, 13).death, -1);

const result = {
  status: 'bounded-negative; no unknown source plaintext',
  p0_heading_wordlengths: [8, 5],
  p57_clear_crib: 'DIVINITY WITHIN (source GP spelling DIUINITY WITHIN)',
  p57_crib_offset: 73,
  key_indices: key,
  key_translit: labels(key),
  first_body_raw: labels(body.slice(0, 22)),
  repeated_body_ioc: coincidence(ordinary),
  repeated_body_start: labels(ordinary.slice(0, 22)),
  plaintext_autokey_body_ioc: coincidence(autokey.slice(13)),
  ciphertext_feedback_body_ioc: coincidence(cipherFeedback.slice(13)),
  strict_F_skip_first_illegal_original_offset: 13 + strict.death,
  strict_F_skip_obstruction: 'C=N and scheduled K=N forces forbidden non-bypassed P=F',
  positive_95_runes: 'pass'
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
