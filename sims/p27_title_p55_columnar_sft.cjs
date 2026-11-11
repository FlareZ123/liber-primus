'use strict';

/**
 * Source-constrained p27-title -> p55 columnar-transposition gate.
 *
 * The p55 fold mismatch selects thirteen-dot fragment 18, which is the
 * 19-rune red p27 title. Physical p55 has exactly 76 runes = 4 * 19,
 * so a keyed 19-column rectangle is exact: no padding, fitted width,
 * or free phase is required.
 *
 * Run with Node.js 22:
 *   node sims/p27_title_p55_columnar_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const solved = fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt', 'utf8');

const p27 = corpus.pages.find((page) => page.page === 27).indices;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const key = p27.slice(0, 19);
const labels = corpus.translit;
const labelIndex = new Map(labels.map((label, index) => [label, index]));
const rankedLabels = labels.slice().sort((a, b) => b.length - a.length);

assert.equal(key.length, 19);
assert.equal(p55.length, 76);
assert.equal(p55.length / key.length, 4);
assert.deepEqual(key, [19,13,26,20,15,3,24,25,8,20,18,12,10,19,20,20,15,5,13]);

/** @param {number[]} values */
function transliterate(values) {
  return values.map((value) => labels[value]).join('');
}

/** @returns {number[]} */
function solvedReference() {
  const text = solved
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join(' ')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');

  const out = [];
  for (let offset = 0; offset < text.length;) {
    const match = rankedLabels.find((label) => text.startsWith(label, offset));
    if (match) {
      out.push(labelIndex.get(match));
      offset += match.length;
    } else {
      offset += 1;
    }
  }
  assert.equal(out.length, 3473);
  return out;
}

/**
 * @param {number[]} reference
 * @returns {(values:number[]) => number}
 */
function trigramScorer(reference) {
  const counts = new Map();
  for (let i = 0; i + 2 < reference.length; i += 1) {
    const token = `${reference[i]},${reference[i + 1]},${reference[i + 2]}`;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const alpha = 0.1;
  const denominator = reference.length - 2 + 29 ** 3 * alpha;

  return (values) => {
    let sum = 0;
    for (let i = 0; i + 2 < values.length; i += 1) {
      const token = `${values[i]},${values[i + 1]},${values[i + 2]}`;
      sum += Math.log(((counts.get(token) ?? 0) + alpha) / denominator);
    }
    return sum / (values.length - 2);
  };
}

/**
 * Conventional keyed columnar decryption. Since 76 is exactly divisible by
 * 19, every ciphertext column has four symbols.
 *
 * @param {number[]} ciphertext
 * @param {number[]} columnKey
 * @param {{descending:boolean, reverseCipher:boolean, reverseRows:boolean, reverseWithin:boolean}} options
 * @returns {number[]}
 */
function decryptColumnar(ciphertext, columnKey, options) {
  const input = options.reverseCipher ? ciphertext.slice().reverse() : ciphertext.slice();
  const order = columnKey
    .map((value, index) => ({value, index}))
    .sort((a, b) => options.descending
      ? (b.value - a.value || b.index - a.index)
      : (a.value - b.value || a.index - b.index));

  const rows = ciphertext.length / columnKey.length;
  const columns = Array(columnKey.length);
  let cursor = 0;

  for (const {index} of order) {
    const column = input.slice(cursor, cursor + rows);
    cursor += rows;
    if (options.reverseWithin) column.reverse();
    columns[index] = column;
  }

  const rowOrder = Array.from({length: rows}, (_, index) => index);
  if (options.reverseRows) rowOrder.reverse();

  const output = [];
  for (const row of rowOrder) {
    for (let column = 0; column < columns.length; column += 1) {
      output.push(columns[column][row]);
    }
  }
  return output;
}

/**
 * Conventional keyed columnar encryption for the positive control.
 *
 * @param {number[]} plaintext
 * @param {number[]} columnKey
 * @returns {number[]}
 */
function encryptColumnar(plaintext, columnKey) {
  const rows = plaintext.length / columnKey.length;
  const matrix = Array.from(
    {length: rows},
    (_, row) => plaintext.slice(row * columnKey.length, (row + 1) * columnKey.length)
  );
  const order = columnKey
    .map((value, index) => ({value, index}))
    .sort((a, b) => a.value - b.value || a.index - b.index);

  const output = [];
  for (const {index} of order) {
    for (let row = 0; row < rows; row += 1) output.push(matrix[row][index]);
  }
  return output;
}

const reference = solvedReference();
const score = trigramScorer(reference);
const variants = [];

for (const descending of [false, true]) {
  for (const reverseCipher of [false, true]) {
    for (const reverseRows of [false, true]) {
      for (const reverseWithin of [false, true]) {
        const options = {descending, reverseCipher, reverseRows, reverseWithin};
        const plaintext = decryptColumnar(p55, key, options);
        variants.push({
          ...options,
          score: score(plaintext),
          transliteration: transliterate(plaintext)
        });
      }
    }
  }
}

variants.sort((a, b) => b.score - a.score);

const nativeScores = [];
for (let offset = 0; offset + 76 <= reference.length; offset += 19) {
  nativeScores.push(score(reference.slice(offset, offset + 76)));
}
nativeScores.sort((a, b) => a - b);

const plant = reference.slice(100, 176);
const plantCipher = encryptColumnar(plant, key);
const plantRecovered = decryptColumnar(plantCipher, key, {
  descending: false,
  reverseCipher: false,
  reverseRows: false,
  reverseWithin: false
});
assert.deepEqual(plantRecovered, plant);

const answer = {
  classification: 'bounded source-constrained negative; no plaintext recovered',
  source: {
    p27TitleIndices: key,
    p27TitleTransliteration: transliterate(key),
    p55Runes: p55.length,
    exactRectangle: [4, 19]
  },
  original: {
    rawScore: score(p55),
    testedVariants: variants.length,
    best: variants[0],
    topDistinctScores: [...new Set(variants.map((item) => item.score))].slice(0, 4)
  },
  native76Control: {
    windows: nativeScores.length,
    minimum: nativeScores[0],
    median: nativeScores[Math.floor(nativeScores.length / 2)],
    maximum: nativeScores[nativeScores.length - 1]
  },
  positiveControl: {
    exactRecovery: true,
    plaintextScore: score(plant),
    recoveredScore: score(plantRecovered)
  },
  decision: 'Retire direct 19-column p27-title keyed transposition on p55 under the frozen fold/reversal family.'
};

assert.equal(variants.length, 16);
assert.ok(variants[0].score < nativeScores[0]);
assert.ok(score(p55) < nativeScores[0]);

process.stdout.write(JSON.stringify(answer, null, 2) + '\n');
