'use strict';

/**
 * Read-only, original-source test of the three-dot/three-rail interpretation
 * of the 81-rune black body of LP2 physical p33 (archive 50.jpg).
 *
 * Run: node sims/lp2_p33_three_dot_rail3_original_sft.cjs
 *
 * Hypothesis fixed before decoding: the three large black dots underneath the
 * first titled paragraph are a three-rail transposition instruction. The red
 * ten-rune heading is excluded; the entire 81-rune body is decoded. There is
 * no parameter scan, key fit or ciphertext-dependent operation choice.
 */

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');

/** @param {number} position @returns {number} */
function rail(position) {
  const phase = position % 4;
  return phase === 3 ? 1 : phase;
}

/** @template T @param {T[]} plaintext @returns {T[]} */
function encode(plaintext) {
  return [0, 1, 2].flatMap((r) =>
    plaintext.filter((_, i) => rail(i) === r)
  );
}

/** @template T @param {T[]} ciphertext @returns {T[]} */
function decode(ciphertext) {
  /** @type {T[]} */
  const plaintext = new Array(ciphertext.length);
  let cursor = 0;
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < ciphertext.length; i++) {
      if (rail(i) === r) plaintext[i] = ciphertext[cursor++];
    }
  }
  assert.equal(cursor, ciphertext.length);
  return plaintext;
}

/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const counts = new Array(29).fill(0);
  for (const i of indices) counts[i]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

/** @param {number[]} indices @returns {string} */
function gp(indices) {
  return indices.map((i) => corpus.translit[i]).join(' ');
}

const historic = [...'WEAREDISCOVEREDFLEEATONCE'];
assert.equal(encode(historic).join(''), 'WECRLTEERDSOEEFEAOCAIVDEN');
assert.deepEqual(decode(encode(historic)), historic);
console.log('PASS: published 3-rail historical plaintext/ciphertext example');

const page = corpus.pages.find((item) => item.page === 33);
const annot = ink.pages.find((item) => item.page === 33);
assert.ok(page && annot);
assert.equal(page.runic_count, 214);
assert.deepEqual(annot.red_spans.map((span) => [span.start, span.length]), [[0, 10], [91, 8]]);
assert.deepEqual(annot.large_punctuation, [[10, 13, 'red'], [91, 13, 'red'], [99, 13, 'red']]);
const original = page.indices.slice(0, 91);
const blackBody = original.slice(10);
assert.equal(blackBody.length, 81);
console.log('PASS: original p33 offsets [0,10) red heading and [10,91) black body');

const known = corpus.pages.find((item) => item.page === 57).indices;
assert.equal(known.length, 95);
assert.deepEqual(decode(encode(known)), known);
console.log('PASS: solved p57 clear GP29 positive plant, 95/95 runes');

const candidate = decode(blackBody);
assert.deepEqual(encode(candidate), blackBody);
assert.deepEqual(original.slice(0, 10).concat(encode(candidate)), original);
console.log('PASS: original p33 complete-unit forward reconstruction, 91/91 runes');
console.log('p33 black-body raw IoC:', ioc(blackBody).toFixed(8));
console.log('p33 decoded-body IoC:', ioc(candidate).toFixed(8));
console.log('p57 original clear IoC:', ioc(known).toFixed(8));
console.log('p33 candidate native GP29:', gp(candidate));
console.log('DECISION: three-rail interpretation has no coherent 81-rune prose');
console.log('CAVEAT: the black dots might be a divider, not an authored cipher cue.');
