'use strict';

// Original-source, read-only GP28 predecessor-rank receiver selected by
// solved p56 PAGE (prime sum 224) -> table cell 224 (value 151) -> p57 FIND.
// Node.js 22 / Windows 11. No CLI arguments, randomness or file writes.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resource = (name) =>
  path.join(__dirname, '..', 'resources', 'liber-primus', name);

const corpus = JSON.parse(fs.readFileSync(resource('lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(resource('base60-grid.json'), 'utf8'));
const transcription = fs.readFileSync(resource('lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number[]} runeIndices */
const transliterate = (runeIndices) =>
  runeIndices.map((index) => corpus.translit[index]).join('');

/** @param {number[]} runeIndices */
const primeSum = (runeIndices) =>
  runeIndices.reduce((sum, index) => sum + corpus.prime[index], 0);

/** Split on authentic text word/punctuation markers, preserving line/page carries. */
function splitPrintedWords() {
  /** @type {number[][]} */
  const result = [];
  /** @type {number[]} */
  let word = [];

  for (const glyph of transcription) {
    const index = runeIndex.get(glyph);
    if (index !== undefined) {
      word.push(index);
    } else if ('-.$&§'.includes(glyph) && word.length > 0) {
      result.push(word);
      word = [];
    }
  }
  if (word.length > 0) result.push(word);
  return result;
}

/** First n ordinary rational primes (not GP rune-prime ordinals). */
function firstPrimes(n) {
  const values = [];
  for (let p = 2; values.length < n; p++) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) values.push(p);
  }
  return values;
}

/** Authentic p56 operation: shift down by phi(prime), plaintext-F skips the clock. */
function decodeP56() {
  const source = corpus.pages[56].indices;
  const primes = firstPrimes(source.length - 1);
  let clock = 0;
  const plain = source.map((cipher, i) => {
    if (i === 56) {
      assert.equal(cipher, 0, 'Original transparent-F at p56 offset 56');
      return 0;
    }
    return (cipher - (primes[clock++] - 1) % 29 + 29) % 29;
  });
  assert.equal(clock, 84);
  assert.ok(transliterate(plain).startsWith('ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGE'));
  return plain;
}

const allWords = splitPrintedWords();
assert.equal(allWords.length, 2941);
assert.equal(allWords.slice(0, 2896).flat().length, 12956);
const p56Words = allWords.slice(2896, 2921);
const p57Words = allWords.slice(2921);
assert.equal(p56Words.length, 25);
assert.equal(p57Words.length, 20);
assert.equal(p56Words.flat().length, 85);
assert.equal(p57Words.flat().length, 95);

const knownPlainP56 = decodeP56();
let cursor = 0;
const p56 = p56Words.map((word) => {
  const plain = knownPlainP56.slice(cursor, cursor + word.length);
  cursor += word.length;
  return { word: transliterate(plain), sum: primeSum(plain) };
});
const p57 = p57Words.map((word) => ({
  word: transliterate(word),
  sum: primeSum(word),
}));
assert.equal(cursor, 85);
assert.equal(p56.filter((x) => x.word === 'PAGE').length, 2);
assert.equal(p56.find((x) => x.word === 'PAGE').sum, 224);
assert.equal(p57.find((x) => x.word === 'FIND').sum, 151);
assert.equal(p57.find((x) => x.word === 'MUST').sum, 186);
assert.equal(p56.find((x) => x.word === 'HASHES').sum, 316);
assert.equal(p56.find((x) => x.word === 'OUT').sum, 69);
assert.equal(p57.find((x) => x.word === 'DIUINITY').sum, 376);
assert.equal(p57.find((x) => x.word === 'LICE').sum, 184);

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const bytes = tokens.map((token) =>
  60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1])
);
const missingFAlphabet = grid.alphabet.replace('f', '');
const base59 = tokens.map((token) =>
  59 * missingFAlphabet.indexOf(token[0]) +
  missingFAlphabet.indexOf(token[1])
);
assert.deepEqual(
  [tokens[223], bytes[223], tokens[59], bytes[59], tokens[119], bytes[119]],
  ['2V', 151, '19', 69, '34', 184]
);
assert.deepEqual(
  [tokens[150], base59[150], tokens[151], base59[151]],
  ['2X', 151, '39', 186]
);

// First-party lexical map: PAGE (224) -> table[223] = 151 -> FIND (151).
// The 224th cell is *already* on the 76-cell outer circumference.
const startingCell = primeSum(knownPlainP56.slice(
  p56Words.slice(0, 9).reduce((s, word) => s + word.length, 0),
  p56Words.slice(0, 10).reduce((s, word) => s + word.length, 0)
)) - 1;
assert.equal(startingCell, 223);

const rim = [];
for (let c = 0; c < 8; c++) rim.push(c);
for (let r = 1; r < 32; r++) rim.push(8 * r + 7);
for (let c = 6; c >= 0; c--) rim.push(8 * 31 + c);
for (let r = 30; r >= 1; r--) rim.push(8 * r);
assert.equal(rim.length, 76);
assert.equal(new Set(rim).size, 76);
assert.equal(rim.indexOf(startingCell), 34);

const sourceCipher = corpus.pages[55].indices;
const lastP54 = corpus.pages[54].indices.at(-1);
assert.equal(sourceCipher.length, 76);
assert.equal(typeof lastP54, 'number');

/** @param {number[]} plain @param {number[]} key @param {number} sign */
function encryptRank28(plain, key, sign) {
  let preceding = lastP54;
  return plain.map((symbol, i) => {
    const cipher = symbol === 28
      ? preceding
      : (preceding + 1 + (symbol - sign * key[i] + 28 * 28) % 28) % 29;
    preceding = cipher;
    return cipher;
  });
}

/** @param {number[]} cipher @param {number[]} key @param {number} sign */
function decryptRank28(cipher, key, sign) {
  let preceding = lastP54;
  return cipher.map((symbol, i) => {
    const result = symbol === preceding ? 28 :
      (((symbol - preceding - 1 + 29) % 29) + sign * key[i] + 28 * 28) % 28;
    preceding = symbol;
    return result;
  });
}

/** @param {number[]} values */
function coincidence(values) {
  const counts = Array(29).fill(0);
  for (const index of values) counts[index]++;
  return counts.reduce((sum, v) => sum + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}

const origin = rim.indexOf(startingCell);
const outputs = [];
for (const direction of [1, -1]) {
  const cells = Array.from({ length: 76 }, (_, offset) =>
    rim[(origin + direction * offset + 76) % 76]);
  const key = cells.map((cell) => bytes[cell] % 28);
  for (const sign of [1, -1]) {
    const output = decryptRank28(sourceCipher, key, sign);
    assert.deepEqual(encryptRank28(output, key, sign), sourceCipher);
    assert.equal(output.length, 76);
    outputs.push({ direction, sign, ioc: coincidence(output),
      eaOffsets: output.flatMap((value, i) => value === 28 ? [i] : []),
      roman: transliterate(output), positions: cells });
  }
}
assert.deepEqual(outputs.map((x) => x.eaOffsets), [[59],[59],[59],[59]]);
assert.deepEqual(outputs.map((x) => Number(x.ioc.toFixed(8))),
  [0.04175439, 0.03157895, 0.03157895, 0.03473684]);
assert.equal(outputs[0].roman.startsWith('GIIASNGFNNIFSDLUGCIA'), true);
assert.equal(outputs[3].roman.startsWith('EOOUFLIJUHOPMMMM'), true);

console.log('Authentic word link: p56 PAGE=224 -> base60 cell224 (2V)=151 -> p57 FIND=151');
console.log('Secondary base60 links: HASHES=316 -> OUT=69; DIUINITY=376 -> LICE=184');
console.log('Competing base59 link: FIND=151 -> base59 cell151 (2X)=151, E neighbor MUST=186');
console.log('76-rune p55 receiver: original outer cell223 (rim phase34), exact p54 predecessor');
for (const x of outputs) console.log(JSON.stringify({
  direction:x.direction, sign:x.sign, ioc:x.ioc, eaOffsets:x.eaOffsets,
  decoded:x.roman
}));
console.log('All four complete original GP28 receivers are nonprose. No unknown plaintext/key.');
