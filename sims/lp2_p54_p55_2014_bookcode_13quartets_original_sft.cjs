'use strict';

/**
 * Source-only original p54/p55 four-coordinate book-cipher feasibility test.
 * Read-only CommonJS SFT; use Node.js 22 in the repository root.
 * The corpus and the historical Emerson witness are existing repository inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const witness = fs.readFileSync(
  'resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt',
  'utf8'
).replace(/\r\n/g, '\n');

const lengths = [11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const source = corpus.pages[54].indices.slice(-10).concat(corpus.pages[55].indices);
assert.equal(source.length, 86);
assert.equal(lengths.reduce((sum, n) => sum + n, 0), 86);
assert.deepEqual(source.slice(0, 10).map((n) => corpus.translit[n]), [
  'G', 'O', 'T', 'TH', 'X', 'E', 'EA', 'R', 'G', 'Y'
]);
assert.equal(corpus.translit[source[10]], 'NG');

let offset = 0;
const core = [];
const exteriors = [];
for (const length of lengths) {
  const word = source.slice(offset, offset + length);
  assert.equal(word.length, length);
  exteriors.push(word[0], word[word.length - 1]);
  core.push(...word.slice(1, -1));
  offset += length;
}
assert.equal(offset, 86);
assert.equal(core.length, 52);
assert.equal(exteriors.length, 34);

const groups = Array.from({ length: 13 }, (_, i) =>
  core.slice(4 * i, 4 * i + 4).map((value) => value + 1)
);
assert.equal(groups.flat().length, 52);

const paragraphs = witness.trim().split(/\n\s*\n/).map((p) => p.replace(/\n/g, ' '));
/** @param {string} paragraph @returns {string[]} */
function sentences(paragraph) {
  return (paragraph.match(/[^.!?]+(?:[.!?]+|$)/g) || [])
    .map((s) => s.trim()).filter(Boolean);
}
/** @param {string} sentence @returns {string[]} */
function words(sentence) {
  return sentence.match(/\p{L}+(?:['’]\p{L}+)*/gu) || [];
}
/** @param {number[]} coordinate @returns {{failure: string, letter: string | null, word: string | null, sentenceCount: number}} */
function read(coordinate) {
  const [paragraphIndex, sentenceIndex, wordIndex, letterIndex] = coordinate;
  const paragraph = paragraphs[paragraphIndex - 1];
  if (paragraph === undefined) {
    return { failure: 'paragraph', letter: null, word: null, sentenceCount: 0 };
  }
  const available = sentences(paragraph);
  const sentence = available[sentenceIndex - 1];
  if (sentence === undefined) {
    return { failure: 'sentence', letter: null, word: null, sentenceCount: available.length };
  }
  const word = words(sentence)[wordIndex - 1];
  if (word === undefined) {
    return { failure: 'word', letter: null, word: null, sentenceCount: available.length };
  }
  const letter = [...word][letterIndex - 1];
  return { failure: letter === undefined ? 'letter' : 'pass',
    letter: letter || null, word, sentenceCount: available.length };
}

const known2014 = [
  [[1,2,3,1], 'a'], [[3,3,13,5], 'u'], [[20,3,20,5], 'g'],
  [[8,3,8,6], 'n'], [[21,13,4,1], 'j'], [[25,1,7,4], 't'],
  [[15,9,3,4], 'v'], [[1,1,16,3], 'd'], [[4,3,3,1], 'b'],
  [[8,3,26,4], 'l'], [[13,2,5,4], 'p'], [[1,4,16,4], 'v']
];
for (const [coordinate, letter] of known2014) {
  assert.equal(read(coordinate).letter, letter,
    'historical solved-book-coordinate control ' + coordinate.join(':'));
}

const predictions = groups.map((coordinate) => ({
  coordinate: coordinate.join(':'),
  ...read(coordinate)
}));
const failures = predictions.reduce((counts, p) => {
  counts[p.failure] = (counts[p.failure] || 0) + 1;
  return counts;
}, {});
assert.deepEqual(failures, { sentence: 10, letter: 3 });

console.log('P54+55 original 86-rune complete-word register PASS');
console.log('Original true complete words: 17; interior: 52; exteriors: 34');
console.log('Known 2014 Self-Reliance solved coordinates reproduced: ' + known2014.length);
console.log('Direct GP-index+1, source-printed interior 13 quadruples:');
for (let i = 0; i < predictions.length; i++) {
  const p = predictions[i];
  console.log(String(i + 1).padStart(2) + ' ' + p.coordinate +
    ' result=' + p.failure + ' availableSentences=' + p.sentenceCount +
    ' selectedWord=' + (p.word || '-'));
}
console.log('Direct executable coordinates: 0/13; failures: ' + JSON.stringify(failures));
console.log('PASS: original-to-historical numeric book-code transfer rejected on witness edition');
