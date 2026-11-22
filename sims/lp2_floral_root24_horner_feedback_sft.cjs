'use strict';
/**
 * Original-source SFT: floral heading checksum as a GP29 Horner-feedback IV.
 *
 * Run from the repository root with Node 22:
 *   node sims/lp2_floral_root24_horner_feedback_sft.cjs
 *
 * Hypothesis frozen independently of unknown plaintext:
 *   h <- (24*h + redRune) mod29 for each original red heading rune
 *   h = 0 after either heading, so both black bodies begin with the same IV.
 *   P_i = C_i + sign*h_i (mod29)
 *   h_(i+1) = 24*h_i + C_i       (ciphertext feedback), or
 *   h_(i+1) = 24*h_i + P_i       (plaintext feedback).
 *
 * Both are fully invertible with unambiguous page carry: do not reset at
 * physical pages p41..53/p55, punctuation or printed word separators.
 * Testing the two obvious arithmetic signs gives four finite alternatives.
 *
 * This is a source-motivated bounded candidate, not a claimed Cicada opcode.
 * No fitted key, phase, language score, or holdout optimization.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const M = 29;
const R = 24; // 3301 mod 29
const mod = x => ((x % M) + M) % M;

/** @param {number[]} a */
function ioc(a) {
  const counts = Array(M).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/**
 * @param {number[]} c
 * @param {'cipher'|'plain'} feedback
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decipher(c, feedback, sign, initialState = 0) {
  let h = initialState;
  return c.map(x => {
    const y = mod(x + sign * h);
    h = mod(R * h + (feedback === 'cipher' ? x : y));
    return y;
  });
}
/**
 * @param {number[]} p
 * @param {'cipher'|'plain'} feedback
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encipher(p, feedback, sign, initialState = 0) {
  let h = initialState;
  return p.map(y => {
    const x = mod(y - sign * h);
    h = mod(R * h + (feedback === 'cipher' ? x : y));
    return x;
  });
}

/** @param {number[]} runes */
function translit(runes) { return runes.map(i => source.translit[i]).join(' '); }

/** @param {number} first @param {number} last */
function chapter(first, last) {
  const pages = source.pages.filter(p => p.page >= first && p.page <= last);
  assert.equal(pages.length, last - first + 1);
  return pages.flatMap(p => p.indices);
}

assert.equal(source.runes.length, 29);
assert.equal(source.pages.find(p => p.page === 50).indices.length, 0);
const controls = chapter(57, 57);
assert.equal(controls.length, 95);
const records = [[40, 53, 8, 3000], [54, 55, 9, 299]];
for (const [first, last, redCount, bodyLength] of records) {
  const data = chapter(first, last);
  const header = data.slice(0, redCount);
  const body = data.slice(redCount);
  assert.equal(body.length, bodyLength);
  let h = 0;
  for (const v of header) h = mod(R * h + v);
  assert.equal(h, 0, 'red heading does not reduce to zero');
  const alteredHeader = header.slice();
  alteredHeader[0] = mod(alteredHeader[0] + 1);
  let alteredState = 0;
  for (const v of alteredHeader) alteredState = mod(R * alteredState + v);
  const expectedState = mod(R ** (redCount - 1));
  assert.equal(alteredState, expectedState);
  console.log('chapter', first, last, 'header', header.join(','),
    'H(24)', h, 'perturb-first-red-+1-state', alteredState,
    'body', body.length, 'cipher IoC', ioc(body).toFixed(12));
  for (const feedback of ['cipher', 'plain']) {
    for (const sign of [-1, 1]) {
      const plaintext = decipher(body, feedback, sign);
      assert.deepEqual(encipher(plaintext, feedback, sign), body);
      const plant = controls.slice();
      assert.deepEqual(decipher(encipher(plant, feedback, sign), feedback, sign), plant);
      const alteredCipher = encipher(plant, feedback, sign, alteredState);
      assert.deepEqual(decipher(alteredCipher, feedback, sign, alteredState), plant);
      assert.notEqual(decipher(alteredCipher, feedback, sign, 0)[0], plant[0]);
      console.log('  feedback', feedback, 'sign', sign,
        'IoC', ioc(plaintext).toFixed(12), 'roundtrip', body.length,
        'solved-native plant', plant.length, 'prefix80', translit(plaintext.slice(0, 80)));
    }
  }
}
