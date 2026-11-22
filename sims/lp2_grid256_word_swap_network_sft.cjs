'use strict';

/**
 * Original LP2 256-cell table as two fixed word swap-network permutations.
 *
 * Scope: 11 complete 256-word blocks of the original printed unknown text.
 * The final 80 words remain in place. This is a hypothetical whole-word
 * transposition, not an authenticated Cicada decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert.equal(new Set(table).size, 161);
for (const byte of table) assert.ok(Number.isInteger(byte) && byte >= 0 && byte < 256);

// Treat printed byte values as direct swap destinations, without any secret.
const perm = Array.from({ length: 256 }, (_, i) => i);
for (let i = 0; i < 256; i++) {
  const j = table[i];
  [perm[i], perm[j]] = [perm[j], perm[i]];
}
assert.equal(new Set(perm).size, 256);

// Canonical source-byte-driven Durstenfeld/Fisher-Yates shuffle: descending i,
// reduce each printed byte to a legal uniformly indexed swap destination 0..i.
// The byte-to-position remainder is explicit; no unknown seed or key.
const fisher = Array.from({ length: 256 }, (_, i) => i);
for (let i = 255; i >= 1; i--) {
  const j = table[i] % (i + 1);
  [fisher[i], fisher[j]] = [fisher[j], fisher[i]];
}
assert.equal(new Set(fisher).size, 256);
const fisherInverse = Array(256);
for (let i = 0; i < 256; i++) fisherInverse[fisher[i]] = i;

const inverse = Array(256);
for (let i = 0; i < 256; i++) inverse[perm[i]] = i;

/**
 * @param {number[]} words Complete original word-length sequence.
 * @param {number[]} order One table-derived permutation of 0..255.
 * @returns {number[]} Reordered complete 256-word blocks, 80-word tail intact.
 */
function reorder(words, order) {
  assert.equal(words.length, 2896);
  const output = words.slice();
  for (let block = 0; block < 11; block++) {
    const start = block * 256;
    for (let i = 0; i < 256; i++) {
      output[start + i] = words[start + order[i]];
    }
  }
  return output;
}

/**
 * @param {string} text Printed unknown-LP2 source transcription.
 * @returns {number[]} Rune lengths of original words, joining physical wraps.
 */
function originalWords(text) {
  const sequence = text.split('%').slice(0, 55).join('%');
  const words = [];
  let length = 0;
  for (const char of sequence) {
    if (/[\u16A0-\u16FF]/u.test(char)) length++;
    else if (char === '%' || char === '/' || /\s/u.test(char)) {
      // Original physical page/line wraps do not terminate a word.
    } else if (length) {
      words.push(length);
      length = 0;
    }
  }
  if (length) words.push(length);
  return words;
}

const original = originalWords(read('resources/lp2-transcription.txt'));
assert.equal(original.length, 2896);
assert.equal(original.reduce((a, b) => a + b, 0), 12956);

// All nine authenticated visual-chapter cuts, in complete-word units.
const chapterCuts = new Set([158, 413, 796, 1233, 1457, 1783, 2161, 2830]);

/**
 * @param {number[]} words Original or transformed word lengths.
 * @returns {number} Empirical adjacent-length MI (nats), excluding chapter joins.
 */
function adjacencyMI(words) {
  const counts = Array.from({ length: 10 }, () => Array(10).fill(0));
  const left = Array(10).fill(0);
  const right = Array(10).fill(0);
  let total = 0;
  for (let i = 1; i < words.length; i++) {
    if (chapterCuts.has(i)) continue;
    const a = Math.min(9, words[i - 1]);
    const b = Math.min(9, words[i]);
    counts[a][b]++;
    left[a]++;
    right[b]++;
    total++;
  }
  let mi = 0;
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      const n = counts[a][b];
      if (n) mi += n / total * Math.log(n * total / (left[a] * right[b]));
    }
  }
  return mi;
}

/**
 * @param {string} word Ordinary English word, not a cipher candidate.
 * @returns {number} Rune count using the repository's authentic GP spelling.
 */
function nativeGPWordLength(word) {
  let value = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
  let count = 0;
  for (let i = 0; i < value.length;) {
    const token = value.startsWith('ING', i) ? 'ING'
      : value.startsWith('IO', i) ? 'IO'
      : tokens.find((t) => value.startsWith(t, i));
    assert.ok(token, 'Unexpected GP token at ' + value.slice(i));
    i += token.length;
    count++;
  }
  return count;
}

const forward = reorder(original, perm);
const reverse = reorder(original, inverse);
const fisherRead = reorder(original, fisher);
const fisherUndoRead = reorder(original, fisherInverse);
assert.deepEqual(reorder(fisherRead, fisherInverse), original);
assert.deepEqual(reorder(fisherUndoRead, fisher), original);
assert.deepEqual(reorder(forward, inverse), original);
assert.deepEqual(reorder(reverse, perm), original);

const originalMI = adjacencyMI(original);
const forwardMI = adjacencyMI(forward);
const reverseMI = adjacencyMI(reverse);
assert.ok(Math.abs(originalMI - 0.012156100972939) < 1e-12);
assert.ok(Math.abs(forwardMI - 0.011853468279357) < 1e-12);
assert.ok(Math.abs(reverseMI - 0.008299716550225) < 1e-12);
const fisherMI = adjacencyMI(fisherRead);
const fisherUndoMI = adjacencyMI(fisherUndoRead);
assert.ok(Math.abs(fisherMI - 0.012168164675891) < 1e-12);
assert.ok(Math.abs(fisherUndoMI - 0.011553985341045) < 1e-12);

// A source-independent natural-prose positive control of identical word count.
// The fixed table swap destroys its order association; inverse restores it.
const controlWords = read('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/g).slice(1300, 4196).map(nativeGPWordLength);
assert.equal(controlWords.length, original.length);
const controlCipher = reorder(controlWords, perm);
const controlRecovered = reorder(controlCipher, inverse);
assert.deepEqual(controlRecovered, controlWords);
const controlOriginalMI = adjacencyMI(controlWords);
const controlCipherMI = adjacencyMI(controlCipher);
const controlRecoveredMI = adjacencyMI(controlRecovered);
const controlFisher = reorder(controlWords, fisher);
const controlFisherInverse = reorder(controlWords, fisherInverse);
assert.deepEqual(reorder(controlFisher, fisherInverse), controlWords);
assert.deepEqual(reorder(controlFisherInverse, fisher), controlWords);
const controlFisherMI = adjacencyMI(controlFisher);
const controlFisherInverseMI = adjacencyMI(controlFisherInverse);
assert.ok(Math.abs(controlFisherMI - 0.012092958424428) < 1e-12);
assert.ok(Math.abs(controlFisherInverseMI - 0.019150927879123) < 1e-12);
assert.ok(Math.abs(controlOriginalMI - 0.051149291018946) < 1e-12);
assert.ok(Math.abs(controlCipherMI - 0.010483805085703) < 1e-12);
assert.equal(controlOriginalMI, controlRecoveredMI);

console.log(JSON.stringify({
  input: { words: 2896, runes: 12956, tableBytes: 256, distinctTableBytes: 161 },
  model: 'direct-pointer and descending Fisher-Yates byte-driven 256-word block permutations',
  output: {
    printedMI: originalMI,
    tableSwapReadMI: forwardMI,
    tableInverseReadMI: reverseMI,
    fisherYatesForwardMI: fisherMI,
    fisherYatesInverseMI: fisherUndoMI
  },
  control: {
    naturalMI: controlOriginalMI,
    tableScrambledMI: controlCipherMI,
    exactSourceRecovery: true,
    recoveredMI: controlRecoveredMI,
    fisherYatesForwardMI: controlFisherMI,
    fisherYatesInverseMI: controlFisherInverseMI
  },
  interpretation: 'Both direct-pointer swap and canonical Fisher-Yates source-table word inverses fail to recover native-language length syntax'
}, null, 2));
