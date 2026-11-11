#!/usr/bin/env node
'use strict';

/**
 * Reproduce the signed-2016 58-page address square and 243 complement fold.
 * Run from repository root: node sims/lp2_2016_fold_square.cjs
 */

const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const signed = fs.readFileSync('resources/historical/cicada2016-4gq25-outguess.asc', 'utf8');

const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} word @returns {number[]} */
function encodeWord(word) {
  const source = word.toLowerCase().replace(/v/g, 'u').replace(/k/g, 'c').replace(/z/g, 's').replace(/[^a-z]/g, '');
  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = alphabet.find(({ token }) => source.startsWith(token, i));
    if (!hit) throw new Error(`Cannot encode ${word}`);
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function wordSum(word) {
  return encodeWord(word).reduce((sum, index) => sum + corpus.prime[index], 0);
}

/** @param {number} sum @returns {{page:number,wordIndex:number}} */
function address(sum) {
  return { page: sum % 58, wordIndex: Math.floor(sum / 58) };
}

/** @param {string} page @returns {string[]} */
function printedWords(page) {
  return page.replaceAll('/', '').replaceAll('\n', '').replaceAll('\r', '')
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(''))
    .filter(Boolean);
}

const sourcePages = transcription.split('%');
const pages = Array.from({ length: 58 }, (_, page) =>
  page === 50 ? [] : printedWords(sourcePages[page > 50 ? page - 1 : page]));

/** @param {string} runes @returns {string} */
function gp(runes) {
  return [...runes].map((rune) => corpus.translit[corpus.runes.indexOf(rune)]).join('');
}

/** @param {string} runes @returns {number} */
function runeSum(runes) {
  return [...runes].reduce((sum, rune) => sum + corpus.prime[corpus.runes.indexOf(rune)], 0);
}

/** @param {number} page @param {number} wordIndex */
function node(page, wordIndex) {
  const runes = pages[page][wordIndex];
  return { page, wordIndex, gp: gp(runes), sum: runeSum(runes) };
}

const body = signed.slice(signed.indexOf('Hello.'), signed.indexOf('-----BEGIN PGP SIGNATURE-----'));
const sourceWords = [...new Set((body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || []).map((w) => w.toLowerCase()))];
const sums = Object.fromEntries(sourceWords.map((word) => [word, wordSum(word)]));

const bySum = new Map();
for (const word of sourceWords) {
  if (!bySum.has(sums[word])) bySum.set(sums[word], []);
  bySum.get(sums[word]).push(word);
}
const collisions = [...bySum].filter(([, words]) => words.length > 1).map(([sum, words]) => ({ sum, words }));

const diff58 = [];
const sum243 = [];
for (let i = 0; i < sourceWords.length; i += 1) {
  for (let j = i + 1; j < sourceWords.length; j += 1) {
    const a = sourceWords[i];
    const b = sourceWords[j];
    if (Math.abs(sums[a] - sums[b]) === 58) diff58.push({ a, b, aSum: sums[a], bSum: sums[b] });
    if (sums[a] + sums[b] === 243) sum243.push({ a, b, aSum: sums[a], bSum: sums[b] });
  }
}

const keySums = {
  HELLO: wordSum('hello'),
  LIBER: wordSum('liber'),
  THE: wordSum('the'),
  FOUND: wordSum('found'),
  YOU: wordSum('you'),
  FOLD: wordSum('fold'),
};

const addresses = Object.fromEntries(Object.entries(keySums).map(([word, sum]) => [word, address(sum)]));
const selected = {
  THE: node(addresses.THE.page, addresses.THE.wordIndex),
  FOUND: node(addresses.FOUND.page, addresses.FOUND.wordIndex),
  YOU: node(addresses.YOU.page, addresses.YOU.wordIndex),
  FOLD: node(addresses.FOLD.page, addresses.FOLD.wordIndex),
};
const solvedTail = node(address(selected.FOLD.sum).page, address(selected.FOLD.sum).wordIndex);

const checks = {
  uniqueSourceCollision243: collisions.length === 1 && collisions[0].sum === 243 && collisions[0].words.includes('hello') && collisions[0].words.includes('liber'),
  uniqueSourceDifference58: diff58.length === 1 && new Set([diff58[0].a, diff58[0].b]).has('the') && new Set([diff58[0].a, diff58[0].b]).has('found'),
  uniqueSourcePairSum243: sum243.length === 1 && new Set([sum243[0].a, sum243[0].b]).has('you') && new Set([sum243[0].a, sum243[0].b]).has('found'),
  theSelectsFold: addresses.THE.page === 14 && addresses.THE.wordIndex === 1 && selected.THE.gp === 'FOLD',
  rectangle: addresses.FOUND.page === 14 && addresses.FOUND.wordIndex === 2 && addresses.YOU.page === 55 && addresses.YOU.wordIndex === 1 && addresses.FOLD.page === 55 && addresses.FOLD.wordIndex === 2,
  complementFold: keySums.HELLO === 243 && keySums.LIBER === 243 && 243 - keySums.THE === keySums.FOLD && 243 - keySums.YOU === keySums.FOUND,
  equalDiagonals: keySums.THE + keySums.FOLD === 243 && keySums.YOU + keySums.FOUND === 243,
  pointerHitsSolvedTail: selected.FOLD.sum === 114 && solvedTail.page === 56 && solvedTail.wordIndex === 1 && solvedTail.gp === 'OESR',
};

console.log(JSON.stringify({
  checks,
  keySums,
  collisions,
  diff58,
  sum243,
  addressSquare: {
    labels: [['THE', 'FOUND'], ['YOU', 'FOLD']],
    addresses,
    selected,
  },
  solvedTail,
}, null, 2));

if (Object.values(checks).some((value) => !value)) process.exitCode = 1;
