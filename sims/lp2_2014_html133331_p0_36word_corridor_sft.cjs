'use strict';

/**
 * Original-source HTML 133/331 -> 256-byte grid -> p0 eight-word corridor.
 * Read-only self-contained reproducibility test, Node.js 22 / Windows 11.
 * No source mutation, guessed key, or plaintext claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const nodePath = require('node:path');

const root = nodePath.resolve(__dirname, '..');
const loadJson = (p) => JSON.parse(fs.readFileSync(nodePath.join(root, p), 'utf8'));
const loadText = (p) => fs.readFileSync(nodePath.join(root, p), 'utf8');

const html = loadText('resources/historical/stage11-2014-index.html');
const corpus = loadJson('resources/liber-primus/lp2-corpus.json');
const table = loadJson('resources/liber-primus/base60-grid.json');
const ink = loadJson('resources/liber-primus/lp2-ink-annotations.json');
const transcript = loadText('resources/liber-primus/lp2-transcription.txt');
const sourceTitle = Number(html.match(/<title>(\d+)<\/title>/)[1]);
const sourceId = Number(html.match(/<div id="(\d+)">/)[1]);

assert.equal(sourceTitle, 133);
assert.equal(sourceId, 331);

const bytes = table.byte_rows.flat();
const tokens = table.rows.flat();
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(tokens[192], '00');
assert.equal(tokens[229], '00');
assert.equal(tokens.filter((t) => t === '00').length, 2);
assert.equal(ink.counts.large, 36);

const glyphIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const firstPage = transcript.split('%')[0];
const words = [];
const reconstructed = [];
let pending = [];

/** Finish one printed word, retaining original rune offsets. */
function finishWord() {
  if (pending.length === 0) return;
  const start = reconstructed.length - pending.length;
  words.push({
    index: words.length,
    start,
    end: reconstructed.length,
    indices: pending,
    gp0: pending.reduce((sum, n) => sum + n, 0),
  });
  pending = [];
}

for (const glyph of Array.from(firstPage)) {
  const index = glyphIndex.get(glyph);
  if (index !== undefined) {
    pending.push(index);
    reconstructed.push(index);
  } else if ('-.,'.includes(glyph)) {
    finishWord();
  }
}
finishWord();
assert.deepEqual(reconstructed, corpus.pages[0].indices);
assert.equal(words.length, 59);

const addressA = sourceTitle % bytes.length;
const addressB = sourceId % bytes.length;
const start = bytes[addressA];
const end = bytes[addressB];
const wordA = words.find((w) => w.start === start);
const wordB = words.find((w) => w.start === end);
assert.equal(addressA, 133);
assert.equal(addressB, 75);
assert.equal(start, 141);
assert.equal(end, 177);
assert.equal(wordA.index, 32);
assert.equal(wordB.index, 40);
assert.equal(end - start, 36);
assert.equal(wordB.index - wordA.index, 8);

const selected = words.slice(wordA.index, wordB.index);
assert.deepEqual(selected.map((w) => w.indices.length), [4, 6, 3, 4, 8, 7, 3, 1]);
assert.equal(selected.reduce((n, w) => n + w.indices.length, 0), 36);
assert.equal(words[35].gp0, 83);
assert.equal(words[37].gp0, 101);
assert.equal(bytes[words[35].gp0], 193);
assert.equal(bytes[words[37].gp0], 229);

const bracket = bytes.slice(193, 229);
assert.equal(bracket.length, 36);
const originalCipher = corpus.pages[0].indices.slice(start, end);

/**
 * Reversible literal GP29 addition with each original byte as a key digit.
 * The function proves only that this particular source-data consumer is legible
 * or illegible. Its existence is not a claim of a creator-selected operation.
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {number[]}
 */
function subtractKey(cipher, key) {
  return cipher.map((x, i) => (x - key[i] % 29 + 29) % 29);
}

const candidate = subtractKey(originalCipher, bracket);
assert.deepEqual(
  candidate.map((x, i) => (x + bracket[i] % 29) % 29),
  originalCipher,
);
const nativePositive = corpus.pages[57].indices.slice(0, 36);
const planted = nativePositive.map((x, i) => (x + bracket[i] % 29) % 29);
assert.deepEqual(subtractKey(planted, bracket), nativePositive);

const renderWords = (indices) => {
  let cursor = 0;
  return selected.map((w) => {
    const result = indices.slice(cursor, cursor + w.indices.length)
      .map((r) => corpus.translit[r]).join('');
    cursor += w.indices.length;
    return result;
  }).join(' ');
};

const byWordStart = new Map(words.map((w) => [w.start, w.index]));
let eligiblePairs = 0;
let eightWordPairs = 0;
let exactCorridorPairs = 0;
const exactPairs = new Set();
for (let i = 0; i < bytes.length; i++) {
  for (let j = 0; j < bytes.length; j++) {
    if (i === j) continue;
    const w1 = byWordStart.get(bytes[i]);
    const w2 = byWordStart.get(bytes[j]);
    if (w1 === undefined || w2 === undefined) continue;
    eligiblePairs++;
    if (w2 - w1 !== 8) continue;
    eightWordPairs++;
    if (bytes[j] - bytes[i] === 36) {
      exactCorridorPairs++;
      exactPairs.add(bytes[i] + ',' + bytes[j]);
    }
  }
}
assert.equal(eligiblePairs, 4556);
assert.equal(eightWordPairs, 75);
assert.equal(exactCorridorPairs, 15);
assert.deepEqual([...exactPairs].sort(), [
  '13,49', '141,177', '192,228', '20,56', '201,237',
].sort());


/** Factor a positive integer over the canonical GP29 prime alphabet only. */
function gpPrimeFactors(integer) {
  let remaining = integer;
  const factors = [];
  for (const prime of corpus.prime) {
    while (remaining % prime === 0) {
      factors.push(prime);
      remaining /= prime;
    }
  }
  return remaining === 1 ? factors : null;
}

const sourcePalindrome = Number(String(sourceTitle) + String(sourceId));
assert.equal(sourcePalindrome, 133331);
assert.equal(
  String(sourcePalindrome),
  String(sourcePalindrome).split('').reverse().join(''),
);
const factors = gpPrimeFactors(sourcePalindrome);
assert.deepEqual(factors, [11, 17, 23, 31]);
assert.equal(gpPrimeFactors(Number(String(sourceId) + String(sourceTitle))), null);
const factorSum = factors.reduce((sum, n) => sum + n, 0);
assert.equal(factorSum, 82);
assert.equal(bytes[factorSum], 201);
assert.equal(sourceTitle + sourceId, 464);
assert.equal(sourceTitle + sourceId, 58 * 8);
assert.equal(sourceTitle + sourceId, 29 * 16);
const factorRunes = factors.map((prime) => corpus.translit[corpus.prime.indexOf(prime)]);
assert.deepEqual(factorRunes, ['R', 'G', 'H', 'I']);

const inbound = bytes.map(() => []);
bytes.forEach((value, index) => inbound[value].push(index));
/**
 * Count reverse descendants for a non-cycle source node.
 * The source nodes 82,128,201 are outside the table's 11-cycle.
 */
function subtreeSize(root) {
  const visited = new Set([root]);
  const queue = [root];
  for (let i = 0; i < queue.length; i++) {
    for (const predecessor of inbound[queue[i]]) {
      if (!visited.has(predecessor)) {
        visited.add(predecessor);
        queue.push(predecessor);
      }
    }
  }
  return visited.size;
}
assert.deepEqual(inbound[201], [82, 128]);
assert.equal(subtreeSize(82), 50);
assert.equal(subtreeSize(128), 5);
assert.equal(subtreeSize(201), 56);

let smoothPalindromes = 0;
let fourDistinctGpPrimes = 0;
const root201FourDistinct = [];
for (let a = 1; a <= 9; a++) {
  for (let b = 0; b <= 9; b++) {
    for (let c = 0; c <= 9; c++) {
      // Exact complete six-decimal-digit palindrome family: abccba.
      const palindrome = a * 100001 + b * 10010 + c * 1100;
      const factorization = gpPrimeFactors(palindrome);
      if (factorization === null) continue;
      smoothPalindromes++;
      if (
        factorization.length !== 4 ||
        new Set(factorization).size !== 4
      ) continue;
      fourDistinctGpPrimes++;
      const sum = factorization.reduce((n, value) => n + value, 0);
      if (bytes[sum] === 201) root201FourDistinct.push(palindrome);
    }
  }
}
assert.equal(smoothPalindromes, 175);
assert.equal(fourDistinctGpPrimes, 9);
assert.deepEqual(root201FourDistinct, [133331]);

console.log('HTML 133331 palindrome GP prime factors:', factors.join(' x '));
console.log('GP rune names of those factors:', factorRunes.join(''));
console.log('GP-prime factor sum and table pointer:', factorSum, bytes[factorSum]);
console.log('Reverse table-pointer subtree: 201 <- 82 [50] and 128 [5], total 56');
console.log('Six-digit palindrome controls:', 900,
  'GP-smooth:', smoothPalindromes, 'four distinct:', fourDistinctGpPrimes,
  'four distinct -> 201:', root201FourDistinct);

console.log('HTML title/id:', sourceTitle, sourceId);
console.log('Table addresses:', addressA, addressB);
console.log('Table byte destinations:', start, end);
console.log('Original p0 words:', wordA.index, 'through', wordB.index - 1);
console.log('Original lengths:', selected.map((w) => w.indices.length).join(','));
console.log('Full p0 rune interval:', start, end - 1, 'length', end - start);
console.log('Original p50 00 bracket:', 192, 229, 'interior length', bracket.length);
console.log('Total original large dot marks:', ink.counts.large);
console.log('Selected words GP0 -> p50:', words[35].gp0, '->', bytes[83],
  '/', words[37].gp0, '->', bytes[101]);
console.log('Full ordered distinct table-cell controls: 65280');
console.log('Both word starts:', eligiblePairs);
console.log('Eight-word separations:', eightWordPairs);
console.log('Eight-word and 36-rune separations:', exactCorridorPairs);
console.log('Direct literal byte-minus-GP29 readout:', renderWords(candidate));
console.log('Known GP positive and original inverse round trip: PASS');
console.log('Status: candidate navigation, no readable original plaintext');
