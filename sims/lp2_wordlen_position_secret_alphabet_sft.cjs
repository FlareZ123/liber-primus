'use strict';

// Key-free collision invariant for arbitrary, independent GP29 permutations
// keyed by (original ciphertext word length, position within word).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphs = new Map([...corpus.runes].map((rune, index) => [rune, index]));
const raw = read('resources/lp2-transcription.txt');
const stream = raw.split('%').slice(0, 55).join('').replace(/\/\s*\n/g, '');
const ciphertext = stream.split(/[-.\s&$]+/u)
  .map((part) => [...part].filter((rune) => glyphs.has(rune)).map((rune) => glyphs.get(rune)))
  .filter((word) => word.length > 0);
assert.equal(ciphertext.length, 2896);
assert.equal(ciphertext.reduce((total, word) => total + word.length, 0), 12956);

const two = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const one = { A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8,
  I: 10, J: 11, K: 5, L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5,
  R: 4, S: 15, T: 16, U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15 };
/** @param {string} sourceWord @returns {number[]} */
function gpEncode(sourceWord) {
  const answer = [];
  for (let i = 0; i < sourceWord.length; i += 1) {
    const combined = two[sourceWord.slice(i, i + 2)];
    if (combined !== undefined) {
      answer.push(combined);
      i += 1;
    } else {
      const symbol = one[sourceWord[i]];
      assert.notEqual(symbol, undefined);
      answer.push(symbol);
    }
  }
  return answer;
}
const shakespeare = read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g).map(gpEncode);
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .replace(/\[[^\]]*\]/g, ' ')
  .replace(/(?:^|\n)### [^\n]*\n/g, ' ')
  .toUpperCase().match(/[A-Z]+/g).map(gpEncode);

/**
 * For each word length 3..9, count occurrences of each letter at every
 * position. A book-fixed permutation for each (length, position) preserves
 * every ordered equal-letter-pair count in the corresponding table cell.
 * @param {number[][]} words
 * @returns {Map<number, Uint32Array[]>}
 */
function frequencyCells(words) {
  const cells = new Map();
  for (const word of words) {
    const length = word.length;
    if (length < 3 || length > 9) continue;
    if (!cells.has(length)) {
      cells.set(length, Array.from({ length }, () => new Uint32Array(29)));
    }
    const rows = cells.get(length);
    for (let position = 0; position < length; position += 1) {
      rows[position][word[position]] += 1;
    }
  }
  return cells;
}
/** @param {Uint32Array} counts @returns {{n:number, matchingPairs:number, totalPairs:number, collisionRate:number}} */
function evaluateCell(counts) {
  let n = 0;
  let matchingPairs = 0;
  for (const count of counts) {
    n += count;
    matchingPairs += count * (count - 1);
  }
  return { n, matchingPairs, totalPairs: n * (n - 1),
    collisionRate: matchingPairs / (n * (n - 1)) };
}
/**
 * Weight each length-position stratum by the number of ordered word pairs
 * eligible in that stratum. English controls are compared at exactly
 * the observed ciphertext word-count/length weights.
 * @param {Map<number, Uint32Array[]>} cells
 * @param {Map<number, Uint32Array[]>} [weightFrom]
 */
function score(cells, weightFrom = cells) {
  let observedEqual = 0;
  let availablePairs = 0;
  let weightedCoincidence = 0;
  let strata = 0;
  const detail = [];
  for (let length = 3; length <= 9; length += 1) {
    const rows = cells.get(length);
    const weights = weightFrom.get(length);
    assert.ok(rows && weights && rows.length === length);
    for (let position = 0; position < length; position += 1) {
      const got = evaluateCell(rows[position]);
      const weight = evaluateCell(weights[position]).totalPairs;
      assert.ok(got.n > 29 && weight > 0);
      observedEqual += got.matchingPairs;
      availablePairs += weight;
      weightedCoincidence += weight * got.collisionRate;
      strata += 1;
      detail.push({ length, position, n: got.n, collisionRate: got.collisionRate });
    }
  }
  return { strata, observedEqual, availablePairs, weightedRate: weightedCoincidence / availablePairs, detail };
}

const sourceCells = frequencyCells(ciphertext);
const original = score(sourceCells);
const shakespeareReference = score(frequencyCells(shakespeare), sourceCells);
const solvedLp1Reference = score(frequencyCells(lp1), sourceCells);
assert.equal(original.strata, 42);
assert.equal(original.observedEqual, 140454);
assert.equal(original.availablePairs, 4068778);
assert.ok(Math.abs(original.weightedRate - 0.03451994677517427) < 1e-12);
assert.ok(Math.abs(shakespeareReference.weightedRate - 0.10794517200910626) < 1e-12);
assert.ok(Math.abs(solvedLp1Reference.weightedRate - 0.11275983423341468) < 1e-12);

let state = 0x53013301;
/** @returns {number} */
function randomUint32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {number} n @returns {number} */
const randomIndex = (n) => randomUint32() % n;
/** @returns {number[]} */
function permutation() {
  const array = Array.from({ length: 29 }, (_, i) => i);
  for (let j = 28; j > 0; j -= 1) {
    const k = randomIndex(j + 1);
    [array[j], array[k]] = [array[k], array[j]];
  }
  return array;
}

// Genuine English plant with precisely the manuscript's word-length sequence.
// Every (length, position) has its own independent arbitrary 29-symbol secret
// permutation, chosen without looking at the original cipher. An exact inverse
// recovers every planted rune.
const byLength = new Map();
for (const word of shakespeare) {
  const list = byLength.get(word.length) || [];
  list.push(word);
  byLength.set(word.length, list);
}
const plantedPlain = ciphertext.filter((word) => word.length >= 3 && word.length <= 9)
  .map((word) => {
    const pool = byLength.get(word.length);
    assert.ok(pool && pool.length > 0);
    return pool[randomIndex(pool.length)];
  });
const secret = new Map();
const inverse = new Map();
for (let length = 3; length <= 9; length += 1) {
  for (let j = 0; j < length; j += 1) {
    const key = length + ':' + j;
    const perm = permutation();
    const inv = new Array(29);
    for (let k = 0; k < 29; k += 1) inv[perm[k]] = k;
    secret.set(key, perm);
    inverse.set(key, inv);
  }
}
const plantedCipher = plantedPlain.map((word) =>
  word.map((symbol, j) => secret.get(word.length + ':' + j)[symbol]));
const recovered = plantedCipher.map((word) =>
  word.map((symbol, j) => inverse.get(word.length + ':' + j)[symbol]));
assert.deepEqual(recovered, plantedPlain);
const plainCells = frequencyCells(plantedPlain);
const cryptCells = frequencyCells(plantedCipher);
for (let length = 3; length <= 9; length += 1) {
  for (let j = 0; j < length; j += 1) {
    const p = evaluateCell(plainCells.get(length)[j]);
    const c = evaluateCell(cryptCells.get(length)[j]);
    assert.equal(c.matchingPairs, p.matchingPairs);
    assert.equal(c.totalPairs, p.totalPairs);
  }
}
const plantPlainScore = score(plainCells);
const plantCipherScore = score(cryptCells);
assert.equal(plantPlainScore.observedEqual, plantCipherScore.observedEqual);
assert.ok(plantCipherScore.weightedRate > 0.08);

console.log(JSON.stringify({
  original: { words: ciphertext.length, runes: 12956,
    eligibleLengthPositionStrata: original.strata,
    orderedSymbolCollisions: original.observedEqual,
    orderedSymbolPairs: original.availablePairs,
    collisionRate: original.weightedRate },
  originalFirstCells: original.detail.filter((cell) => cell.length === 3 || cell.length === 4),
  nativeGpSources: {
    Shakespeare: { sourceWords: shakespeare.length, expectedMatchedRate: shakespeareReference.weightedRate },
    solvedLp1: { sourceWords: lp1.length, expectedMatchedRate: solvedLp1Reference.weightedRate },
  },
  plantedGenuineEnglish: { words: plantedPlain.length,
    runeRecoveryExact: true, independentSecretAlphabets: secret.size,
    plainAndCipherOrderedCollisions: plantPlainScore.observedEqual,
    collisionRate: plantCipherScore.weightedRate },
  conclusion: 'Fixed arbitrary GP29 permutation per (word length, position) cannot explain the original low within-stratum collision rate as native GP-English under printed word boundaries.'
}, null, 2));
