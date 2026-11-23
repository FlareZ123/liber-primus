'use strict';

/**
 * Source-frozen LP2 p15 16-lane classical autokey gate.
 *
 * The red 3299 at p15 fixes the outward Fibonacci-prime spiral order.
 * The authentic LP1 Vigenere precedent and the p15 infinity mark motivate
 * two distinct standard autokey continuations as HYPOTHESES, not author
 * instructions: previous plaintext or previous ciphertext at lag 16.
 *
 * No sign/phase/IV/order search, no secret F bypass, no word resets.
 * Run from the repository root: node sims/lp2_p15_spiral_sixteen_autokey_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

const spiral = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const coordinates = [
  [1, 1], [1, 2], [2, 2], [2, 1],
  [2, 0], [1, 0], [0, 0], [0, 1],
  [0, 2], [0, 3], [1, 3], [2, 3],
  [3, 3], [3, 2], [3, 1], [3, 0]
];
for (let i = 0; i < spiral.length; i += 1) {
  const [row, col] = coordinates[i];
  assert.equal(printed[row][col], spiral[i], 'printed spiral geometry');
}
const key = spiral.map((n) => n % 29);
assert.deepEqual(key, [22, 21, 19, 17, 11, 1, 10, 3, 20, 22, 25, 7, 22, 12, 17, 21]);

/**
 * @param {readonly number[]} ciphertext GP29 indices
 * @param {'plaintext'|'ciphertext'} feedback Previous GP29 rune to use in the same of 16 lanes
 * @returns {number[]}
 */
function decrypt(ciphertext, feedback) {
  const plaintext = [];
  for (let t = 0; t < ciphertext.length; t += 1) {
    const k = t < 16 ? key[t] : feedback === 'plaintext' ? plaintext[t - 16] : ciphertext[t - 16];
    plaintext.push((ciphertext[t] - k + 29) % 29);
  }
  return plaintext;
}

/**
 * @param {readonly number[]} plaintext GP29 indices
 * @param {'plaintext'|'ciphertext'} feedback
 * @returns {number[]}
 */
function encrypt(plaintext, feedback) {
  const ciphertext = [];
  for (let t = 0; t < plaintext.length; t += 1) {
    const k = t < 16 ? key[t] : feedback === 'plaintext' ? plaintext[t - 16] : ciphertext[t - 16];
    ciphertext.push((plaintext[t] + k) % 29);
  }
  return ciphertext;
}

/** @param {readonly number[]} runes */
function ioc(runes) {
  const counts = new Array(29).fill(0);
  for (const rune of runes) counts[rune] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (runes.length * (runes.length - 1));
}

const pages = corpus.pages.filter((p) => p.page >= 16 && p.page <= 55 && p.runic_count);
const offsets = new Map();
const ciphertext = [];
for (const p of pages) {
  const start = ciphertext.length;
  ciphertext.push(...p.indices);
  offsets.set(p.page, [start, ciphertext.length]);
}
assert.equal(ciphertext.length, 9194);
assert.equal(ciphertext.slice(offsets.get(16)[0], offsets.get(21)[1]).length, 1613);
assert.equal(ciphertext.slice(offsets.get(40)[0], offsets.get(53)[1]).length, 3008);
assert.equal(ciphertext.slice(offsets.get(55)[0], offsets.get(55)[1]).length, 76);

const solvedP57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solvedP57.length, 95);

const report = {seed: key, baseTrain: ioc(ciphertext.slice(offsets.get(16)[0], offsets.get(21)[1])), models: {}};
for (const feedback of ['plaintext', 'ciphertext']) {
  const plant = encrypt(solvedP57, feedback);
  assert.deepEqual(decrypt(plant, feedback), solvedP57, 'authentic solved-native planted positive');

  const output = decrypt(ciphertext, feedback);
  assert.deepEqual(encrypt(output, feedback), ciphertext, 'original 9194-rune forward replay');
  const train = output.slice(offsets.get(16)[0], offsets.get(21)[1]);
  const holdout = output.slice(offsets.get(40)[0], offsets.get(53)[1]);
  const originalP55 = output.slice(offsets.get(55)[0], offsets.get(55)[1]);
  const result = {trainLength:train.length,trainIoc:ioc(train),holdoutLength:holdout.length,
    holdoutIoc:ioc(holdout),p55Ioc:ioc(originalP55),preview:output.slice(0,32).map((v)=>corpus.translit[v]).join('-')};
  report.models[feedback] = result;
  assert.ok(Math.abs(result.trainIoc - (feedback === 'plaintext' ? 0.034551773047463305 : 0.034454086600957785)) < 1e-12);
  assert.ok(Math.abs(result.holdoutIoc - (feedback === 'plaintext' ? 0.03468104564526742 : 0.03459724295792088)) < 1e-12);
}
console.log(JSON.stringify(report,null,2));
console.log('PASS: original 9194/9194 forward replay, two solved-p57 native plants, frozen original train and holdout');
