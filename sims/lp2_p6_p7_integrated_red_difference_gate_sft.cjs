'use strict';

/**
 * Source-fixed LP2 p6/p7 checksum-conserving key candidate.
 * Reproduce with Node.js 22: node sims/lp2_p6_p7_integrated_red_difference_gate_sft.cjs
 *
 * Uses unmodified original rune indices, the two mirrored red-word pairs,
 * and the repository's solved-LP1 transliteration reference.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const resource = (name) => fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8');
const corpus = JSON.parse(resource('lp2-corpus.json'));
const sourcePages = resource('lp2-transcription.txt').split(/\n%\s*\n/);
const reference = fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const p6 = corpus.pages.find((p) => p.page === 6).indices;
const p7 = corpus.pages.find((p) => p.page === 7).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const M = 29;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % M) + M) % M;
}

/**
 * The last element of an integrated difference is zero whenever
 * the paired printed-word GP0 sums match modulo 29.
 * @param {number[]} input
 * @param {number[]} output
 * @returns {number[]}
 */
function integral(input, output) {
  assert.equal(input.length, output.length);
  let sum = 0;
  return input.map((value, i) => {
    sum = mod(sum + value - output[i]);
    return sum;
  });
}

const four = integral(p6.slice(76, 80), p7.slice(196, 200));
const two = integral(p6.slice(80, 82), p7.slice(194, 196));
assert.deepEqual(four, [13, 24, 8, 0]);
assert.deepEqual(two, [20, 0]);
const potential = [...four.slice(0, -1), ...two.slice(0, -1)];
assert.deepEqual(potential, [13, 24, 8, 20]);

const body = p6.slice(82).concat(p7.slice(0, 194));
assert.equal(p6.length, 196);
assert.equal(body.length, 308);

/** @param {number[]} symbols @param {number} sign @param {boolean} reverse @returns {number[]} */
function change(symbols, sign, reverse) {
  return symbols.map((symbol, i) => {
    const index = reverse ? potential.length - 1 - (i % potential.length) : i % potential.length;
    return mod(symbol + sign * potential[index]);
  });
}

/** @param {string} text @returns {number[][]} */
function parseRunicWords(text) {
  const words = [];
  let word = [];
  for (const ch of text) {
    const index = corpus.runes.indexOf(ch);
    if (index >= 0) {
      word.push(index);
    } else if ('-.$&'.includes(ch)) {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

const joinedWords = parseRunicWords(sourcePages[6] + sourcePages[7]);
const selected = [];
let position = 0;
for (const word of joinedWords) {
  const start = position;
  position += word.length;
  if (start >= 82 && position <= 196 + 194 && word.length >= 4) {
    selected.push({ start: start - 82, end: position - 82, original: word });
  }
}
assert.equal(selected.length, 40);

/** @param {string} text @returns {number[]} */
function encodeLatin(text) {
  const alphabet = corpus.translit;
  const source = text.toUpperCase().replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < source.length;) {
    let chosen = -1;
    for (let j = 0; j < alphabet.length; j++) {
      if (source.startsWith(alphabet[j], i) && (chosen < 0 || alphabet[j].length > alphabet[chosen].length)) {
        chosen = j;
      }
    }
    if (chosen >= 0) {
      result.push(chosen);
      i += alphabet[chosen].length;
    } else {
      i++;
    }
  }
  return result;
}

const native = encodeLatin(reference);
const vocabulary = new Set((reference.match(/[A-Za-z]{4,}/g) || []).map((word) => encodeLatin(word).join(',')));
const counts = new Uint32Array(M ** 3);
const totals = new Uint32Array(M ** 2);
for (let i = 2; i < native.length; i++) {
  const context = native[i - 2] * M + native[i - 1];
  counts[context * M + native[i]]++;
  totals[context]++;
}

/** @param {number[]} data @returns {number} */
function trigramScore(data) {
  let total = 0;
  for (let i = 2; i < data.length; i++) {
    const context = data[i - 2] * M + data[i - 1];
    total += Math.log((counts[context * M + data[i]] + 0.2) / (totals[context] + 5.8));
  }
  return total / (data.length - 2);
}

/** @param {number[]} data @returns {number} */
function longWordHits(data) {
  return selected.filter(({ start, end }) => vocabulary.has(data.slice(start, end).join(','))).length;
}

/** @param {number[]} data @returns {string} */
function display(data) {
  return data.map((value) => corpus.translit[value]).join('');
}

const nativeP57Words = parseRunicWords(sourcePages[56]).filter((word) => word.length >= 4);
const nativeP57Hits = nativeP57Words.filter((word) => vocabulary.has(word.join(','))).length;
assert.equal(nativeP57Words.length, 12);
assert.equal(nativeP57Hits, 11);
assert.equal(p57.length, 95);
assert.ok(trigramScore(p57) > -2.2);

console.log(JSON.stringify({
  pair4: four,
  pair2: two,
  integratedKey: potential,
  original: { runes: body.length, longWords: selected.length, trigram: trigramScore(body) },
  solvedP57Control: { runes: p57.length, longWords: nativeP57Words.length, hits: nativeP57Hits, trigram: trigramScore(p57) }
}));

for (const sign of [-1, 1]) {
  for (const reverse of [false, true]) {
    const plaintext = change(body, sign, reverse);
    const rerendered = change(plaintext, -sign, reverse);
    assert.deepEqual(rerendered, body);
    const syntheticNative = native.slice(0, body.length);
    assert.deepEqual(change(change(syntheticNative, -sign, reverse), sign, reverse), syntheticNative);
    const hits = longWordHits(plaintext);
    assert.equal(hits, 0);
    const info = { sign, reverse, trigram: trigramScore(plaintext), longWordHits: hits, prefix: display(plaintext.slice(0, 80)) };
    console.log(JSON.stringify(info));
  }
}
console.log('PASS: integrated-potential source-fixed p6/p7 branch rejected on original 308-rune body');
