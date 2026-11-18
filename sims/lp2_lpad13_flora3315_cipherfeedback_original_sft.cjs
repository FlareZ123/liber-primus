'use strict';

/**
 * Exact original-source LPAD(13,F) / floral 3315 feedback-cipher test.
 * Node.js 22 / Windows 11: run from the repository with this file.
 * The eight models are frozen before examining the outputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLP2Words } = require('./lp2_word_pages.cjs');

/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));

const initials = ink.pages.filter(p => p.page >= 3 && p.page <= 7)
  .flatMap(p => (p.red_spans || []).map(s => [...s.runes][0]))
  .map(r => gp.translit[runeIndex.get(r)]).join('');
assert.equal(initials, 'LPAD');

const sourceWords = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt')).words
  .filter(w => w.startPage >= 3 && w.endPage <= 7)
  .map(w => [...w.runes].map(r => runeIndex.get(r)));
assert.equal(sourceWords.length, 255);
assert.equal(sourceWords.reduce((s, w) => s + w.length, 0), 1145);
assert.equal(Math.max(...sourceWords.map(w => w.length)), 12);

/** @type {number[]} */
const key = sourceWords.flatMap(w => Array(13 - w.length).fill(0).concat(w));
assert.equal(key.length, 3315);
const floral = gp.pages.filter(p => p.page >= 40 && p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(floral.length, 3316);
assert.equal(floral[0], 0);
const ciphertext = floral.slice(1);
const known = gp.pages.find(p => p.page === 57).indices;
assert.equal(known.length, 95);
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/**
 * Original cipher feedback inverse, C_t = P_t + alpha*C_(t-1) + beta*K_t.
 * For a row reset, the 13-column LPAD left edge has C_(t-1)=F/0.
 * @param {number[]} data
 * @param {number} alpha
 * @param {number} beta
 * @param {boolean} rowReset
 * @returns {number[]}
 */
function decrypt(data, alpha, beta, rowReset) {
  return data.map((x, t) => mod(
    x - alpha * ((rowReset && t % 13 === 0) ? 0 : (t ? data[t - 1] : 0))
      - beta * key[t]));
}
/**
 * Exact online forward encoder under the same declared source register.
 * @param {number[]} data
 * @param {number} alpha
 * @param {number} beta
 * @param {boolean} rowReset
 * @returns {number[]}
 */
function encrypt(data, alpha, beta, rowReset) {
  let previous = 0;
  return data.map((x, t) => {
    if (rowReset && t % 13 === 0) previous = 0;
    const c = mod(x + alpha * previous + beta * key[t]);
    previous = c;
    return c;
  });
}
const plant = Array.from({length: 3315}, (_, t) => known[t % 95]);
const expected = [
  [ -1, -1, false, 0.03454752496607018 ],
  [ -1, -1, true,  0.0346192532070625 ],
  [ -1,  1, false, 0.03453641983231248 ],
  [ -1,  1, true,  0.034602322429366346 ],
  [  1, -1, false, 0.034956048247254894 ],
  [  1, -1, true,  0.03480749432682409 ],
  [  1,  1, false, 0.03498335595321644 ],
  [  1,  1, true,  0.03485100460498948 ]
];
const variants = [];
for (const [alpha, beta, rowReset, score] of expected) {
  const plaintext = decrypt(ciphertext, alpha, beta, rowReset);
  assert.deepEqual(encrypt(plaintext, alpha, beta, rowReset), ciphertext);
  assert.deepEqual(decrypt(encrypt(plant, alpha, beta, rowReset),
    alpha, beta, rowReset), plant);
  assert.ok(Math.abs(ioc(plaintext) - score) < 1e-12);
  variants.push({alpha, beta, rowReset, ioc: ioc(plaintext),
    opening: plaintext.slice(0, 28).map(i => gp.translit[i]).join(' ')});
}
assert.ok(Math.abs(ioc(ciphertext) - 0.034459958255620156) < 1e-12);
assert.ok(variants.every(x => x.ioc < 0.035));
console.log(JSON.stringify({source: 'original p3-7 LPAD; p40-55 floral after initial red F',
 keyRows: 255, width: 13, originalKeyRunes: 1145, insertedPadCells: 2170,
 targetOriginalRunes: ciphertext.length, rawIoc: ioc(ciphertext),
 models: variants, exactOriginalReencryptions: 8,
 exactSolvedP57PlantedRecoveries: 8,
 authenticUnknownPlaintextRecovered: false}, null, 2));
