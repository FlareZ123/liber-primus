'use strict';

/**
 * Original LP2 printed-word LENGTH-ORDER multiset rank gate.
 *
 * A word's rune count is a source-visible number. Within each punctuation
 * span, rank the observed ordering among all distinct permutations of the
 * same multiset of word lengths. This retains original punctuation, every
 * word count, and every word-length histogram within each span.
 *
 * Read-only, Node.js 22/CommonJS, Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const book = require('../resources/liber-primus/lp2-corpus.json');
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const glyphToIndex = new Map(book.runes.map((rune, i) => [rune, i]));
const sourceRunes = book.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);

/** @type {number[][]} */
const spans = [];
/** @type {number[]} */
let span = [];
let wordLength = 0;
let cursor = 0;
let words = 0;

function closeWord() {
  if (wordLength > 0) {
    span.push(wordLength);
    words++;
    wordLength = 0;
  }
}
function closeSpan() {
  closeWord();
  if (span.length > 0) {
    spans.push(span);
    span = [];
  }
}
for (const ch of transcription) {
  if (glyphToIndex.has(ch)) {
    if (cursor === sourceRunes.length) break;
    assert.equal(glyphToIndex.get(ch), sourceRunes[cursor++],
      'Original transcription and canonical corpus disagree');
    wordLength++;
  } else if (ch === '-') {
    closeWord();
  } else if ('.$&§'.includes(ch)) {
    closeSpan();
  }
  // Physical line and page breaks do not delimit words or punctuation spans.
}
closeSpan();
assert.equal(cursor, 12956);
assert.equal(words, 2896);
assert.equal(spans.length, 175);
assert.deepEqual(
  Array.from({length:14}, (_, i) => spans.flat().filter((x) => x === i + 1).length),
  [83,448,720,513,317,256,216,156,78,52,32,18,4,3]);

const max = Math.max(...spans.map((s) => s.length));
/** @type {bigint[]} */
const factorial = [1n];
for (let i = 1; i <= max; i++) factorial.push(factorial[i - 1] * BigInt(i));

/** @param {Map<number,number>} counts @returns {bigint} */
function countPermutations(counts) {
  let total = 0;
  let denominator = 1n;
  for (const quantity of counts.values()) {
    total += quantity;
    denominator *= factorial[quantity];
  }
  return factorial[total] / denominator;
}

/** @param {number[]} sequence @returns {Map<number,number>} */
function multiset(sequence) {
  const counts = new Map();
  for (const value of sequence)
    counts.set(value, (counts.get(value) || 0) + 1);
  return counts;
}

/**
 * Lexicographic rank among all distinct permutations of one numeric multiset.
 * @param {number[]} sequence
 * @returns {{rank:bigint,base:bigint}}
 */
function rankSequence(sequence) {
  const counts = multiset(sequence);
  const base = countPermutations(counts);
  const values = [...counts.keys()].sort((a, b) => a - b);
  let rank = 0n;
  for (const given of sequence) {
    for (const candidate of values) {
      if (candidate >= given) break;
      const available = counts.get(candidate);
      if (!available) continue;
      counts.set(candidate, available - 1);
      rank += countPermutations(counts);
      counts.set(candidate, available);
    }
    const current = counts.get(given);
    assert.ok(current > 0);
    counts.set(given, current - 1);
  }
  assert.ok(rank >= 0n && rank < base);
  return {rank, base};
}

/**
 * Invert the exact lexicographic multiset rank.
 * @param {number[]} originalMultiset
 * @param {bigint} rank
 * @returns {number[]}
 */
function unrankSequence(originalMultiset, rank) {
  const counts = multiset(originalMultiset);
  const base = countPermutations(counts);
  assert.ok(rank >= 0n && rank < base);
  const values = [...counts.keys()].sort((a, b) => a - b);
  const sequence = [];
  for (let i = 0; i < originalMultiset.length; i++) {
    let selected = false;
    for (const value of values) {
      const available = counts.get(value);
      if (!available) continue;
      counts.set(value, available - 1);
      const ways = countPermutations(counts);
      if (rank < ways) {
        sequence.push(value);
        selected = true;
        break;
      }
      rank -= ways;
      counts.set(value, available);
    }
    assert.ok(selected);
  }
  assert.equal(rank, 0n);
  return sequence;
}

// The first original punctuation span is the least significant digit.
let packed = 0n;
let capacity = 1n;
let nontrivial = 0;
for (const lengths of spans) {
  const {rank, base} = rankSequence(lengths);
  assert.deepEqual(unrankSequence(lengths, rank), lengths);
  // An independent positive uses the reversed ordering of the same source
  // length multiset, not the original rank. This checks generic inversion.
  const planted = lengths.slice().reverse();
  assert.deepEqual(unrankSequence(lengths, rankSequence(planted).rank), planted);
  packed += rank * capacity;
  capacity *= base;
  nontrivial += Number(base > 1n);
}
assert.ok(packed < capacity);
assert.equal(nontrivial, 172);
const capacityBitLength = capacity.toString(2).length;
const shift = Math.max(0, capacityBitLength - 54);
const log2Capacity = shift + Math.log2(Number(capacity >> BigInt(shift)));
assert.ok(Math.abs(log2Capacity - 6121.871208562708) < 1e-8);

// Literal raw-byte extraction of the unencrypted rank integer. This is one
// explicitly declared decoding convention, without password/phase searching.
const bytesLE = [];
for (let remaining = packed; remaining > 0n; remaining >>= 8n)
  bytesLE.push(Number(remaining & 255n));
const littleEndian = Buffer.from(bytesLE);
const bigEndian = Buffer.from(bytesLE.slice().reverse());
const printable = [...littleEndian].filter((x) => x >= 32 && x <= 126).length;
assert.equal(littleEndian.length, 766);
assert.equal(printable, 278);
assert.equal(littleEndian.subarray(0,32).toString('hex'),
  '0b114a66980d672ffe08e0bb15e6c3de291ee69d82a32aa737fa52dce00554e6');
assert.equal(bigEndian.subarray(0,32).toString('hex'),
  '033e5023901c4387eca9c2abd11a481e1940c8975191369b4c3fc9fe7029f043');

console.log(JSON.stringify({
  input: 'Original physical LP2 pp0-55, canonical page words and punctuation',
  runes: cursor, words, punctuationSpans: spans.length,
  nontrivialSpans: nontrivial, capacityBits: log2Capacity,
  model: 'Exact within-span length-multiset order, lexicographic rank; first span least significant',
  inversion: 'Every original span and reversed-order planted span recovered exactly',
  directByteRead: {
    byteLength: littleEndian.length, printableASCII: printable,
    littleEndianFirst32: littleEndian.subarray(0,32).toString('hex'),
    bigEndianFirst32: bigEndian.subarray(0,32).toString('hex'),
    sha256LE: crypto.createHash('sha256').update(littleEndian).digest('hex')
  },
  conclusion: 'Nontrivial lossless source-visible length-order channel, but direct unencrypted bytes do not recover a message or source-selected key.'
}, null, 2));
console.log('PASS: original LP2 word-length multiset rank and exact inverse.');
