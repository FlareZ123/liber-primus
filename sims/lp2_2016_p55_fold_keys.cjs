#!/usr/bin/env node
'use strict';

/**
 * Reproduce the source-selected p55 word fold and its historical key totals.
 *
 * Run from the repository root:
 *   node sims/lp2_2016_p55_fold_keys.cjs
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
  const source = word
    .toLowerCase()
    .replace(/v/g, 'u')
    .replace(/k/g, 'c')
    .replace(/z/g, 's')
    .replace(/[^a-z]/g, '');

  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = alphabet.find(({ token }) => source.startsWith(token, i));
    if (!hit) throw new Error(\`Cannot encode \${word}\`);
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function wordSum(word) {
  return encodeWord(word).reduce((sum, index) => sum + corpus.prime[index], 0);
}

/** @param {string} runes @returns {number} */
function runeSum(runes) {
  return [...runes].reduce(
    (sum, rune) => sum + corpus.prime[corpus.runes.indexOf(rune)],
    0,
  );
}

/** @param {string} runes @returns {string} */
function gp(runes) {
  return [...runes].map((rune) => corpus.translit[corpus.runes.indexOf(rune)]).join('');
}

/** @param {number} sum @returns {{page:number, wordIndex:number}} */
function address(sum) {
  return { page: sum % 58, wordIndex: Math.floor(sum / 58) };
}

/** @param {string} page @returns {string[]} */
function printedWords(page) {
  return page
    .replaceAll('/', '')
    .replaceAll('\n', '')
    .replaceAll('\r', '')
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(''))
    .filter(Boolean);
}

const sourcePages = transcription.split('%');

/** @param {number} page @returns {string} */
function rawPage(page) {
  if (page === 50) return '';
  return sourcePages[page > 50 ? page - 1 : page];
}

/** @param {number} page @returns {string[]} */
function pageWords(page) {
  return page === 50 ? [] : printedWords(rawPage(page));
}

const signedBody = signed.slice(
  signed.indexOf('Hello.'),
  signed.indexOf('-----BEGIN PGP SIGNATURE-----'),
);
const signedWords = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];

if (!signedWords.some((word) => word.toLowerCase() === 'seeks')) {
  throw new Error('Authenticated 2016 source text is missing seeks');
}

const seeksSum = wordSum('seeks');
const theSum = wordSum('the');
const seeksAddress = address(seeksSum);
const theAddress = address(theSum);
const seeksDestination = pageWords(seeksAddress.page)[seeksAddress.wordIndex];
const theDestination = pageWords(theAddress.page)[theAddress.wordIndex];

const mySum = runeSum(seeksDestination);
const foldSum = runeSum(theDestination);
const foldAddress = address(foldSum);

const p55 = pageWords(55);
const centerIndex = (p55.length - 1) / 2;
const mirrorOfFoldIndex = p55.length - 1 - foldAddress.wordIndex;

const foldSelectedWord = p55[foldAddress.wordIndex];
const mirrorWord = p55[mirrorOfFoldIndex];
const centerWord = p55[centerIndex];

const circumference = wordSum('circumference');
const firfumferenfe = wordSum('firfumferenfe');
const divinity = wordSum('divinity');

const p32 = pageWords(32);
const p32FirstClause = rawPage(32).split(/[.!?]/u)[0];
const p32FirstClauseRunes = (p32FirstClause.match(/[ᚠ-᛿]/gu) || []).length;

const oddPageStats = [];
for (let page = 0; page < 56; page += 1) {
  const words = pageWords(page);
  if (words.length < 5 || words.length % 2 !== 1) continue;

  const mid = (words.length - 1) / 2;
  const fixedMirrorIndex = words.length - 1 - 2;
  oddPageStats.push({
    page,
    wordCount: words.length,
    center: runeSum(words[mid]),
    fixedIndex2Mirror: runeSum(words[2]) + runeSum(words[fixedMirrorIndex]),
  });
}

const center365Pages = oddPageStats.filter(({ center }) => center === firfumferenfe);
const pair398Pages = oddPageStats.filter(
  ({ fixedIndex2Mirror }) => fixedIndex2Mirror === circumference,
);

const checks = {
  seeksMapsToMy:
    seeksSum === 253 &&
    seeksAddress.page === 21 &&
    seeksAddress.wordIndex === 4 &&
    gp(seeksDestination) === 'MY',
  theMapsToFold:
    theSum === 72 &&
    theAddress.page === 14 &&
    theAddress.wordIndex === 1 &&
    gp(theDestination) === 'FOLD',
  myFoldDifferenceThree: mySum === 174 && foldSum === 171 && mySum - foldSum === 3,
  foldSelectsP55Word2:
    foldAddress.page === 55 &&
    foldAddress.wordIndex === 2 &&
    gp(foldSelectedWord) === 'SB',
  p55HasNaturalWordFold: p55.length === 17 && centerIndex === 8 && mirrorOfFoldIndex === 14,
  foldedPairIsCircumference:
    runeSum(foldSelectedWord) === 114 &&
    runeSum(mirrorWord) === 284 &&
    runeSum(foldSelectedWord) + runeSum(mirrorWord) === circumference &&
    circumference === 398,
  centerIsHistoricalKoanKey:
    gp(centerWord) === 'MSDIAPF' &&
    runeSum(centerWord) === firfumferenfe &&
    firfumferenfe === 365,
  p32CountsRecoverBothHistoricalTotals:
    p32.length === 22 &&
    p32FirstClauseRunes === 33 &&
    circumference - p32.length === divinity &&
    divinity === 376 &&
    circumference - p32FirstClauseRunes === firfumferenfe,
  uniqueCenter365AmongOddPages:
    center365Pages.length === 1 && center365Pages[0].page === 55,
  uniquePair398AmongOddPages:
    pair398Pages.length === 1 && pair398Pages[0].page === 55,
};

console.log(JSON.stringify({
  checks,
  sourceMap: {
    seeks: { sum: seeksSum, address: seeksAddress, destination: gp(seeksDestination), destinationSum: mySum },
    the: { sum: theSum, address: theAddress, destination: gp(theDestination), destinationSum: foldSum },
    foldAddress,
  },
  p55Fold: {
    wordCount: p55.length,
    centerIndex,
    center: { gp: gp(centerWord), sum: runeSum(centerWord) },
    selectedIndex: foldAddress.wordIndex,
    selected: { gp: gp(foldSelectedWord), sum: runeSum(foldSelectedWord) },
    mirrorIndex: mirrorOfFoldIndex,
    mirror: { gp: gp(mirrorWord), sum: runeSum(mirrorWord) },
    pairSum: runeSum(foldSelectedWord) + runeSum(mirrorWord),
  },
  historicalTotals: {
    CIRCUMFERENCE: circumference,
    FIRFUMFERENFE: firfumferenfe,
    DIVINITY: divinity,
  },
  p32Counts: {
    wordCount: p32.length,
    firstClauseRuneCount: p32FirstClauseRunes,
    circumferenceMinusWordCount: circumference - p32.length,
    circumferenceMinusFirstClauseRunes: circumference - p32FirstClauseRunes,
  },
  corpusDiscriminator: {
    oddPagesTested: oddPageStats.length,
    center365Pages,
    pair398Pages,
  },
}, null, 2));

if (Object.values(checks).some((value) => !value)) process.exitCode = 1;
