'use strict';

/**
 * Source-locked test of the 2014 LP1 word-prime-sum operation against LP2 p15.
 * Run from any working directory with Node.js 22: node sims/lp2_p15_primeword_naturalgroup_sft.cjs
 * Source inputs: original LP2 transcript and corpus under resources/liber-primus.
 * The 16 printed numbers are transcribed from original physical page 15 (32.jpg).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const transcript = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = transcript.split(/^\s*%\s*$/m);
const sourcePages = pages.slice(15, 23);
const runePattern = /[\u16a0-\u16ff]/gu;
const grid = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820,
];
const primes = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));

/** @param {string} value @returns {string[]} */
function runes(value) {
  return value.match(runePattern) || [];
}

/** @param {string} value @returns {number} */
function gpPrimeSum(value) {
  return runes(value).reduce((total, rune) => total + primes.get(rune), 0);
}

/** @param {string[]} groups @returns {{count:number, maxRunes:number, maxPrimeSum:number, matches:number[]}} */
function profile(groups) {
  const sums = groups.map(gpPrimeSum);
  return {
    count: groups.length,
    maxRunes: Math.max(...groups.map(group => runes(group).length)),
    maxPrimeSum: Math.max(...sums),
    matches: grid.filter(value => sums.includes(value)),
  };
}

// The source has a rune-free p50, but indices 15-22 map directly to split chunks.
assert.equal(pages.length, 57);
assert.equal(sourcePages.length, 8);
assert.deepEqual(sourcePages.map(page => runes(page).length), [159, 267, 273, 260, 271, 269, 273, 131]);
sourcePages.forEach((page, i) => {
  assert.deepEqual(runes(page), corpus.pages[i + 15].indices.map(index => corpus.runes[index]));
});

// Genuine already-solved 2014 LP1 WISDOM-square positive controls.
assert.equal(gpPrimeSum('ᛋᚻᚪᛞᚩᚹᛋ'), 341); // SHADOWS
assert.equal(gpPrimeSum('ᚫᚦᛖᚱᛠᛚ'), 366); // AETHEREAL
assert.equal(gpPrimeSum('ᛒᚢᚠᚠᛖᚱᛋ'), 199); // BUFFERS
assert.equal(gpPrimeSum('ᚢᚩᛁᛞ'), 130); // VOID

// Genuine printed words can be carried through soft line and physical page breaks.
const continuous = sourcePages.join('').replace(/\/\s*\n/g, '').replace(/\s/g, '');
const words = continuous.match(/[\u16a0-\u16ff]+/gu) || [];
const lines = sourcePages.flatMap(page => page.split(/\r?\n/).filter(line => runes(line).length));
const sentences = sourcePages.join('\n').split('.').filter(part => runes(part).length);

// Original transcription uses & and $ as the authored paragraph/section stops.
const paragraphs = [];
let paragraph = '';
for (const page of sourcePages) {
  for (const line of page.split(/\r?\n/)) {
    if (/^\s*[&$]\s*$/.test(line)) {
      if (runes(paragraph).length) paragraphs.push(paragraph);
      paragraph = '';
    } else {
      paragraph += line + '\n';
    }
  }
}
if (runes(paragraph).length) paragraphs.push(paragraph);

const word = profile(words);
const line = profile(lines);
const sentence = profile(sentences);
const paragraphGroups = profile(paragraphs);
const maxRunePrime = Math.max(...corpus.prime);
const impossibleWordTargets = grid.filter(value => value > word.maxRunes * maxRunePrime);
const impossibleLineTargets = grid.filter(value => value > line.maxRunes * maxRunePrime);

assert.equal(maxRunePrime, 109);
assert.deepEqual(word, {count: 437, maxRunes: 13, maxPrimeSum: 933, matches: []});
assert.deepEqual(line, {count: 86, maxRunes: 25, maxPrimeSum: 1496, matches: []});
assert.deepEqual(sentence, {count: 21, maxRunes: 375, maxPrimeSum: 19125, matches: []});
assert.equal(paragraphGroups.count, 2);
assert.deepEqual(paragraphs.map(gpPrimeSum), [638, 96969]);
assert.deepEqual(paragraphGroups.matches, []);
assert.equal(impossibleWordTargets.length, 14);
assert.equal(impossibleLineTargets.length, 12);

console.log(JSON.stringify({
  originalChapter: {physicalPages: '15-22', runes: 1903, numeralCells: grid.length},
  maxGpPrime: maxRunePrime,
  word, line, sentence, paragraph: paragraphGroups,
  paragraphSums: paragraphs.map(gpPrimeSum),
  impossibleWordTargets,
  impossibleLineTargets,
  decision: 'No unmodified word, printed line, sentence, or authored paragraph prime-sum maps to any printed p15 cell; one-to-one 16-group mapping is absent.',
}, null, 2));
