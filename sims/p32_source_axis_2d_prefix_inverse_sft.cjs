'use strict';

/**
 * Source-locked 11x11 p32 top/left edge-IV + 10x10 2D finite-difference
 * inverse. Original p32 first-row and first-column GP-prime sums equal the
 * signed 2016 tree JPEG dimensions 563/569. This tests just the natural
 * invertible 2D prefix-sum transports, not a claimed historic cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page = corpus.pages.find((p) => p.page === 32).indices;
const mod = (x) => (x % 29 + 29) % 29;
assert.equal(page.length, 121);
const original = Array.from({length: 11}, (_, r) => page.slice(r * 11, r * 11 + 11));
const prime = corpus.prime;
assert.equal(original[0].reduce((a, b) => a + prime[b], 0), 563);
assert.equal(original.reduce((a, row) => a + prime[row[0]], 0), 569);

const gp = new Map(corpus.translit.map((letter, i) => [letter, i]));
gp.set('ING', 21);
/** @param {string} source @returns {number[]} */
function englishGP(source) {
  const result = [];
  const normalized = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let matched = false;
      for (const n of [3, 2, 1]) {
        if (gp.has(word.slice(i, i + n))) {
          result.push(gp.get(word.slice(i, i + n)));
          i += n;
          matched = true;
          break;
        }
      }
      assert.ok(matched, 'source requires supported GP transliteration');
    }
  }
  return result;
}
const reference = englishGP(fs.readFileSync(
  path.join(root, 'resources/control/emerson_essays_2944.txt'), 'utf8'));
assert.ok(reference.length > 275000);
const counts = new Uint32Array(29 ** 3);
for (let i = 2; i < 50000; i++) counts[
  reference[i-2] * 841 + reference[i-1] * 29 + reference[i]]++;
const alpha = 0.2, denominator = 49998 + counts.length * alpha;
/** @param {number[][]} matrix @returns {number} */
function logScore(matrix) {
  let s = 0, n = 0;
  for (const row of matrix) {
    for (let c = 2; c < row.length; c++, n++) {
      s += Math.log((counts[row[c-2] * 841 + row[c-1] * 29 + row[c]] + alpha) /
        denominator);
    }
  }
  return s / n;
}
/**
 * @param {number[][]} cipher Source 11x11 with fixed first row/column.
 * @param {'horizontal'|'vertical'|'mixed'} kind Derivative direction.
 * @param {1|-1} sign Positive or negative differential.
 * @returns {number[][]} 10x10 payload
 */
function decode(cipher, kind, sign) {
  return Array.from({length: 10}, (_, rr) => Array.from({length: 10}, (_, cc) => {
    const r = rr + 1, c = cc + 1;
    const x = cipher[r][c], top = cipher[r-1][c];
    const left = cipher[r][c-1], corner = cipher[r-1][c-1];
    const delta = kind === 'horizontal' ? x - left :
      kind === 'vertical' ? x - top : x - top - left + corner;
    return mod(sign * delta);
  }));
}
/**
 * @param {number[][]} template Source border and full shape.
 * @param {number[][]} plain 10x10 payload.
 * @param {'horizontal'|'vertical'|'mixed'} kind.
 * @param {1|-1} sign.
 * @returns {number[][]} Reconstructed full 11x11 cipher.
 */
function encode(template, plain, kind, sign) {
  const c = template.map((row) => [...row]);
  for (let r = 1; r < 11; r++) for (let j = 1; j < 11; j++) {
    const value = plain[r-1][j-1] * sign;
    c[r][j] = mod(kind === 'horizontal' ? value + c[r][j-1] :
      kind === 'vertical' ? value + c[r-1][j] :
        value + c[r-1][j] + c[r][j-1] - c[r-1][j-1]);
  }
  return c;
}
const native = Array.from({length: 10}, (_, r) =>
  Array.from({length: 10}, (_, c) => reference[62000 + r * 10 + c]));
const variants = [];
for (const kind of ['horizontal', 'vertical', 'mixed']) {
  for (const sign of [-1, 1]) {
    const plaintext = decode(original, kind, sign);
    assert.deepEqual(encode(original, plaintext, kind, sign), original);
    const artificial = encode(original, native, kind, sign);
    assert.deepEqual(decode(artificial, kind, sign), native);
    variants.push({kind, sign, score: logScore(plaintext),
      preview: plaintext.slice(0, 3).map((row) =>
        row.map((x) => corpus.translit[x]).join('')).join('/')});
  }
}
const nullScores = [];
for (let i = 0; i < 1000; i++) {
  const start = 70000 + i * 187;
  const english = Array.from({length: 10}, (_, r) =>
    Array.from({length: 10}, (_, c) => reference[start + r * 10 + c]));
  nullScores.push(logScore(english));
}
nullScores.sort((a, b) => a - b);
variants.sort((a, b) => b.score - a.score);
assert.ok(variants[0].score < nullScores[0], 'unexpected original language fit');
console.log(JSON.stringify({
  status: 'p32 original 2D prefix-sum inverse, bounded negative, no plaintext',
  p32Dimensions: [563, 569], edgeRunes: 21, interiorRunes: 100,
  rawScore: logScore(original.slice(1).map((row) => row.slice(1))),
  variantCount: variants.length, best: variants[0],
  allVariants: variants,
  nativeScore: logScore(native),
  englishControlMin: nullScores[0], englishControlMedian: nullScores[500],
  englishControlsBeaten: nullScores.filter((x) => variants[0].score >= x).length,
  originalReencipheredRunes: 6 * 121,
  plantedControlsRecoveredRunes: 6 * 100
}, null, 2));
