'use strict';

/**
 * Original-input SFT for the p32 HOME / BUDS diagonal-half-grid pair.
 * No fitted plaintext, key, ciphertext edits, network access or file writes.
 *
 * Requires only Node.js (CommonJS) and files already checked into the repo.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const spelling = fs.readFileSync(
  path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8'
);

const alphabet = corpus.translit;
const page32 = corpus.pages.find((page) => page.page === 32).indices;
const target = corpus.pages
  .filter((page) => page.page >= 33 && page.page <= 39)
  .flatMap((page) => page.indices);
const known = corpus.pages.find((page) => page.page === 57).indices.slice(0, 84);
const single = new Set(alphabet.filter((name) => name.length === 1));
const thresholds = [1, 2, 5, 10];
const dictionary = new Map(thresholds.map((threshold) => [threshold, new Set()]));
const frequencies = new Map();

assert.equal(page32.length, 121);
assert.equal(target.length, 1680);
assert.equal(known.length, 84);

for (const line of spelling.split(/\r?\n/)) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  const word = match[1].toUpperCase();
  const frequency = Number(match[2]);
  if (word.length !== 4 || ![...word].every((letter) => single.has(letter))) continue;
  frequencies.set(word, frequency);
  for (const threshold of thresholds) {
    if (frequency >= threshold) dictionary.get(threshold).add(word);
  }
}

assert.equal(frequencies.get('HOME'), 295);
assert.equal(frequencies.get('BUDS'), 6);
assert.deepEqual(thresholds.map((t) => dictionary.get(t).size), [1532, 1229, 864, 659]);

/**
 * Return one horizontally read four-rune spelling.
 * @param {number[]} runes GP index sequence
 * @param {number} first first sequence index
 * @returns {string}
 */
function wordAt(runes, first) {
  return alphabet[runes[first]] +
    alphabet[runes[first + 1]] +
    alphabet[runes[first + 2]] +
    alphabet[runes[first + 3]];
}

/**
 * Enumerate horizontal four-rune words with a paired word shifted
 * five rows and five columns in an 11x11 grid.
 * @param {number[]} runes a 121-or-longer GP sequence
 * @param {number} start window start offset
 * @param {number} threshold minimum frequency in frozen TextBlob lexicon
 * @returns {{row:number,col:number,first:string,second:string}[]}
 */
function wordPairs(runes, start, threshold) {
  const found = [];
  const accepted = dictionary.get(threshold);
  for (let row = 0; row <= 5; row++) {
    for (let col = 0; col <= 2; col++) {
      const first = wordAt(runes, start + row * 11 + col);
      if (!accepted.has(first)) continue;
      const second = wordAt(runes, start + (row + 5) * 11 + col + 5);
      if (accepted.has(second)) found.push({row, col, first, second});
    }
  }
  return found;
}

const sourcePairs = wordPairs(page32, 0, 5);
assert.deepEqual(sourcePairs, [{
  row: 3, col: 0, first: 'HOME', second: 'BUDS'
}]);
assert.equal(wordAt(page32, 33), 'HOME');
assert.equal(wordAt(page32, 93), 'BUDS');
console.log('p32 source anchor pairs:', JSON.stringify(sourcePairs));
console.log('p32 11x11 shift: row +5, column +5, stream +60');

/** @returns {() => number} deterministic, fully specified xorshift32 stream */
function rngFactory() {
  let state = 0x33015635;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const next = rngFactory();
const shuffle = page32.slice();
const nullExceed = Object.fromEntries(thresholds.map((t) => [t, 0]));
const nullSource = Object.fromEntries(
  thresholds.map((t) => [t, wordPairs(page32, 0, t).length])
);
const samples = 200000;

for (let trial = 0; trial < samples; trial++) {
  for (let i = shuffle.length - 1; i > 0; i--) {
    const other = next() % (i + 1);
    [shuffle[i], shuffle[other]] = [shuffle[other], shuffle[i]];
  }
  for (const threshold of thresholds) {
    if (nullSource[threshold] > 0 &&
      wordPairs(shuffle, 0, threshold).length >= nullSource[threshold]) {
      nullExceed[threshold]++;
    }
  }
}

assert.deepEqual(nullExceed, {1: 15, 2: 9, 5: 2, 10: 0});
console.log('200000 exact-marginal shuffles, xorshift32 seed 0x33015635:');
for (const threshold of thresholds) {
  console.log('  min count=' + threshold +
    ' candidates=' + dictionary.get(threshold).size +
    ' original hits=' + nullSource[threshold] +
    ' shuffled exceedances=' + nullExceed[threshold] +
    ' plus-one tail=' + (nullSource[threshold] > 0
      ? ((nullExceed[threshold] + 1) / (samples + 1)).toFixed(9)
      : 'n/a'));
}

// Independent source original windows, including their authentic anti-repeat
// properties and spelling distributions. Windows overlap; no p-value follows.
let totalWindows = 0;
const exactWindows = [];
for (const page of corpus.pages) {
  if (page.page > 55 || page.indices.length < 121) continue;
  for (let offset = 0; offset + 121 <= page.indices.length; offset++) {
    totalWindows++;
    const pairs = wordPairs(page.indices, offset, 5);
    if (pairs.length) exactWindows.push({page: page.page, offset, pairs});
  }
}
assert.equal(totalWindows, 6482);
assert.deepEqual(exactWindows, [{
  page: 32, offset: 0, pairs: sourcePairs
}]);
console.log('source-native 121-rune windows checked:', totalWindows);
console.log('windows with +5,+5 common-word pair:', JSON.stringify(exactWindows));


// A less selective, source-native second lookaround. Permit any horizontal
// four-letter lexicon pair whose start cells lie on any northeast/southeast
// diagonal, for every possible distance 1..7. This tests rather than assumes
// that the retrospectively selected +5,+5 offset is uniquely informative.
const singleRuneIndex = new Map(alphabet.flatMap((name, index) =>
  name.length === 1 ? [[name, index]] : []
));
/** @param {string} word @returns {number} unique four-index base29 code */
function encodeFour(word) {
  const letters = [...word].map((letter) => singleRuneIndex.get(letter));
  assert.ok(letters.every((value) => Number.isInteger(value)));
  return (((letters[0] * 29 + letters[1]) * 29 + letters[2]) * 29) + letters[3];
}
const fourCodes = new Set([...dictionary.get(5)].map(encodeFour));
assert.equal(fourCodes.size, 864);
const horizontalAnchors = [];
for (let row = 0; row < 11; row++) {
  for (let col = 0; col <= 7; col++) {
    horizontalAnchors.push({row, col, index: row * 11 + col});
  }
}

/**
 * Return all common four-letter words starting horizontally in a 121-GP
 * window; used in the original-source window census and fixed-marginal null.
 * @param {number[]} runes source GP indices
 * @param {number} start window offset
 * @returns {{row:number,col:number,index:number}[]}
 */
function horizontalHits(runes, start) {
  const hits = [];
  for (const anchor of horizontalAnchors) {
    const index = start + anchor.index;
    const encoded = (((runes[index] * 29 + runes[index + 1]) * 29 +
      runes[index + 2]) * 29) + runes[index + 3];
    if (fourCodes.has(encoded)) hits.push(anchor);
  }
  return hits;
}

/**
 * Return first-hits, exact +5,+5, any forward diagonal, either diagonal,
 * and any nonaxial pair, respectively.
 * @param {{row:number,col:number}[]} hits
 * @returns {boolean[]}
 */
function scanPairFlags(hits) {
  const flags = [hits.length >= 2, false, false, false, false];
  for (let i = 0; i < hits.length; i++) {
    for (let j = i + 1; j < hits.length; j++) {
      const dr = hits[j].row - hits[i].row;
      const dc = hits[j].col - hits[i].col;
      if (dr === 5 && dc === 5) flags[1] = true;
      if (dr > 0 && dr === dc) flags[2] = true;
      if (dr > 0 && Math.abs(dr) === Math.abs(dc) && dc !== 0) flags[3] = true;
      if (dr !== 0 && dc !== 0) flags[4] = true;
    }
  }
  return flags;
}

assert.deepEqual(horizontalHits(page32, 0).map((x) => [x.row, x.col]), [
  [3, 0], [8, 5]
]);

const broadCounts = [0, 0, 0, 0, 0];
const broadIterations = 100000;
const broadRandom = rngFactory();
const broadShuffle = page32.slice();
for (let iteration = 0; iteration < broadIterations; iteration++) {
  for (let i = broadShuffle.length - 1; i > 0; i--) {
    const other = broadRandom() % (i + 1);
    [broadShuffle[i], broadShuffle[other]] =
      [broadShuffle[other], broadShuffle[i]];
  }
  const flags = scanPairFlags(horizontalHits(broadShuffle, 0));
  flags.forEach((flag, i) => { if (flag) broadCounts[i]++; });
}
assert.deepEqual(broadCounts, [363, 0, 19, 41, 234]);
console.log('Broader p32 shuffles: 100000, any shift, same 864-word lexicon');
console.log('Counts (2+ words, exact+5, any +diag, either diag, any off-axis):',
  JSON.stringify(broadCounts));

let broadOriginalWindows = 0;
let broadTwoWords = 0;
const broadDiagonalWindows = [];
let broadExactFive = 0;
for (const page of corpus.pages) {
  if (page.page > 55 || page.indices.length < 121) continue;
  for (let offset = 0; offset + 121 <= page.indices.length; offset++) {
    broadOriginalWindows++;
    const pair = horizontalHits(page.indices, offset);
    const flags = scanPairFlags(pair);
    if (flags[0]) broadTwoWords++;
    if (flags[1]) broadExactFive++;
    if (flags[3]) broadDiagonalWindows.push({page: page.page, offset});
  }
}
assert.equal(broadOriginalWindows, 6482);
assert.equal(broadTwoWords, 89);
assert.equal(broadExactFive, 1);
assert.deepEqual(broadDiagonalWindows, [
  {page: 32, offset: 0},
  {page: 37, offset: 62},
  {page: 37, offset: 73},
  {page: 37, offset: 84},
  {page: 37, offset: 95}
]);
// All four p37 windows contain the same one diagonal NEAR -> TIER pair,
// displaced +7 rows and +7 columns. A unique +5,+5 hit does not imply a
// globally unique grid-displaced English wordpair mechanism.
const p37 = corpus.pages.find((page) => page.page === 37).indices;
assert.equal(wordAt(p37, 95), 'NEAR');
assert.equal(wordAt(p37, 179), 'TIER');
console.log('All-shift original-window controls:',
  JSON.stringify({
    windows: broadOriginalWindows, twoWords: broadTwoWords,
    anyDiagonal: broadDiagonalWindows.length,
    exactFive: broadExactFive, broadDiagonalWindows,
    alternativePage37Pair: ['NEAR', 'TIER']
  }));

/** @param {number} value @returns {number} canonical element of GF(29) */
const mod = (value) => ((value % 29) + 29) % 29;

/** @param {number} value @returns {number} multiplicative inverse in GF(29) */
function modularInverse(value) {
  for (let candidate = 1; candidate < 29; candidate++) {
    if (mod(candidate * value) === 1) return candidate;
  }
  throw new Error('non-invertible field element: ' + value);
}

/** @param {number[][]} matrix @returns {number[][]} */
function transpose(matrix) {
  return matrix[0].map((unused, col) => matrix.map((row) => row[col]));
}

/** @param {number[][]} matrix @returns {number[][]} */
function matrixInverse(matrix) {
  const rows = matrix.map((row, i) =>
    row.map(mod).concat([0, 1, 2, 3].map((j) => Number(i === j)))
  );
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    while (pivot < 4 && rows[pivot][col] === 0) pivot++;
    if (pivot === 4) throw new Error('matrix singular in GF(29)');
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const unit = modularInverse(rows[col][col]);
    for (let j = 0; j < 8; j++) rows[col][j] = mod(unit * rows[col][j]);
    for (let i = 0; i < 4; i++) {
      if (i === col) continue;
      const factor = rows[i][col];
      for (let j = 0; j < 8; j++) {
        rows[i][j] = mod(rows[i][j] - factor * rows[col][j]);
      }
    }
  }
  return rows.map((row) => row.slice(4));
}

/** @param {number[][]} matrix @returns {number} */
function determinant(matrix) {
  if (matrix.length === 1) return mod(matrix[0][0]);
  let result = 0;
  for (let col = 0; col < matrix.length; col++) {
    const minor = matrix.slice(1).map((row) =>
      row.filter((unused, j) => j !== col));
    result += (col % 2 ? -1 : 1) * matrix[0][col] * determinant(minor);
  }
  return mod(result);
}

/** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
function multiply(matrix, vector) {
  return matrix.map((row) => mod(
    row.reduce((acc, value, i) => acc + value * vector[i], 0)
  ));
}

/**
 * Whole-body invertible GF29 Hill transform with a fixed four-wide clock.
 * @param {number[]} input
 * @param {number[][]} matrix
 * @param {boolean} strands If true, apply to four equal-length strands
 * @returns {number[]}
 */
function transform(input, matrix, strands) {
  assert.equal(input.length % 4, 0);
  const length = input.length / 4;
  const output = input.slice();
  for (let i = 0; i < length; i++) {
    const positions = strands
      ? [i, i + length, i + length * 2, i + length * 3]
      : [i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 3];
    const result = multiply(matrix, positions.map((index) => input[index]));
    positions.forEach((index, k) => { output[index] = result[k]; });
  }
  return output;
}

/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const frequency = Array(29).fill(0);
  for (const index of indices) frequency[index]++;
  return frequency.reduce((total, n) => total + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}

// Four parallel six-cell HOME -> BUDS diagonals. Shed both endpoints of
// each track, leaving the sixteen original interior rune values.
const ordinalMatrix = Array.from({length: 4}, (unused, col) =>
  Array.from({length: 4}, (other, offset) =>
    page32[(4 + offset) * 11 + col + offset + 1]
  )
);
const primeMatrix = ordinalMatrix.map((row) =>
  row.map((index) => mod(corpus.prime[index]))
);
assert.equal(determinant(ordinalMatrix), 22);
assert.equal(determinant(primeMatrix), 7);
console.log('interior ordinal matrix:', JSON.stringify(ordinalMatrix));
console.log('GF29 determinants:', determinant(ordinalMatrix), determinant(primeMatrix));

const results = [];
for (const [keyName, matrix] of [
  ['ordinal', ordinalMatrix],
  ['prime', primeMatrix]
]) {
  for (const orientation of ['matrix', 'transpose']) {
    const sourceMatrix = orientation === 'matrix' ? matrix : transpose(matrix);
    const inverse = matrixInverse(sourceMatrix);
    for (const operation of ['multiply', 'inverse']) {
      const decoder = operation === 'multiply' ? sourceMatrix : inverse;
      const encoder = operation === 'multiply' ? inverse : sourceMatrix;
      for (const strands of [false, true]) {
        const result = transform(target, decoder, strands);
        assert.deepEqual(transform(result, encoder, strands), target);
        const encryptedPlant = transform(known, encoder, false);
        assert.deepEqual(transform(encryptedPlant, decoder, false), known);
        results.push({
          keyName, orientation, operation, strands,
          ioc: Number(ioc(result).toFixed(10)),
          first: result.slice(0, 30).map((index) => alphabet[index]).join('')
        });
      }
    }
  }
}
assert.equal(results.length, 16);
const ranked = results.sort((a, b) => b.ioc - a.ioc);
assert.ok(Math.abs(ranked[0].ioc - 0.0347095777) < 1e-9);
assert.ok(Math.abs(ranked[15].ioc - 0.0342125415) < 1e-9);
console.log('next chapter original pp33-39 count:', target.length);
console.log('original IoC:', ioc(target).toFixed(10),
  'solved p57 reference IoC:', ioc(known).toFixed(10));
console.log('Hill4 original inverse candidates (ranked by IoC):');
for (const result of ranked) console.log(JSON.stringify(result));

// Second direct historical-consumer baseline: the sixteen source interior
// symbols, read row-major or column-major, as a cyclic GP29 additive pad.
// Both a book-continuous phase and physical-page resets are source-checkable.
// This is a separate, fully specified candidate, not a tuned extra layer.
const chapterPages = corpus.pages.filter((page) => page.page >= 33 && page.page <= 39);
const additiveResults = [];
for (const [keyName, matrix] of [
  ['ordinal', ordinalMatrix],
  ['prime', primeMatrix]
]) {
  for (const orientation of ['row-major', 'column-major']) {
    const words = orientation === 'row-major' ? matrix : transpose(matrix);
    const key = words.flat();
    for (const sign of [-1, 1]) {
      for (const phase of ['continuous', 'page-reset']) {
        const output = [];
        let streamPosition = 0;
        for (const page of chapterPages) {
          for (let i = 0; i < page.indices.length; i++) {
            const k = key[(phase === 'continuous' ? streamPosition : i) % 16];
            const original = page.indices[i];
            const decoded = mod(original + sign * k);
            assert.equal(mod(decoded - sign * k), original);
            output.push(decoded);
            streamPosition++;
          }
        }
        additiveResults.push({keyName, orientation, sign, phase,
          ioc: Number(ioc(output).toFixed(10)),
          first: output.slice(0, 22).map((index) => alphabet[index]).join('')
        });
      }
    }
  }
}
assert.equal(additiveResults.length, 16);
additiveResults.sort((a, b) => b.ioc - a.ioc);
assert.ok(Math.abs(additiveResults[0].ioc - 0.0347301398) < 1e-9);
assert.ok(Math.abs(additiveResults[15].ioc - 0.0342309765) < 1e-9);
console.log('16 direct periodic source-matrix GP29 additive inverses:');
for (const result of additiveResults) console.log(JSON.stringify(result));


// Cross-artifact direct binary consumer: the original p50 32x8 number table
// is provisionally interpreted as 256 base60 bytes. The four-track p32
// interior is exactly 16 native ordinals or 16 raw GP prime values, suitable
// as one AES-128 key without hashing or arbitrary padding.
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
const tableBytes = Buffer.from(grid.byte_rows.flat());
assert.equal(tableBytes.length, 256);
const aesCandidates = [];
for (const [keyName, byteMatrix] of [
  ['ordinal', ordinalMatrix],
  ['raw-prime', ordinalMatrix.map((row) => row.map(
    (index) => corpus.prime[index]
  ))]
]) {
  for (const orientation of ['rows', 'columns']) {
    const cells = orientation === 'rows'
      ? byteMatrix.flat() : transpose(byteMatrix).flat();
    const key = Buffer.from(cells);
    assert.equal(key.length, 16);
    for (const mode of ['ecb', 'cbc-zero-iv']) {
      const algorithm = mode === 'ecb' ? 'aes-128-ecb' : 'aes-128-cbc';
      const iv = mode === 'ecb' ? null : Buffer.alloc(16);
      const decoder = crypto.createDecipheriv(algorithm, key, iv);
      decoder.setAutoPadding(false);
      const decoded = Buffer.concat([decoder.update(tableBytes), decoder.final()]);
      const readable = [...decoded].filter((b) => b >= 32 && b <= 126).length;
      aesCandidates.push({
        keyName, orientation, mode, printableBytes: readable,
        firstBlockHex: decoded.subarray(0, 16).toString('hex')
      });
    }
  }
}
assert.deepEqual(aesCandidates.map((item) => item.printableBytes),
  [96, 104, 86, 87, 79, 92, 99, 95]);
console.log('eight fixed AES-128 p32-interior-key / p50-grid decodes:');
for (const candidate of aesCandidates) console.log(JSON.stringify(candidate));

console.log('PASS: exact originals, shuffle controls and reversible GP29 plants');
