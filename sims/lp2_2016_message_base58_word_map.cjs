#!/usr/bin/env node
"use strict";

// Reproduce the provisional 2016-message -> LP2 base-58 word-address hypothesis.
// Run from the repository root:
//   node sims/lp2_2016_message_base58_word_map.cjs
//
// This is an experiment, not an established decryption. It uses the canonical
// corpus transliteration and the original 58 LP2 page slots (including p50).

const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (p) => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const master = read("resources/transcriptions/liber_primus_master.txt");

assert.equal(corpus.pages.length, 58, "LP2 corpus should retain original pages 0..57");

const masterScans = master.split("%").map((page) =>
  [...page.matchAll(/[ᚠ-᛿]+/gu)].map((m) => m[0])
);
assert.equal(masterScans.length, 75, "canonical master transcription scan count changed");

// A physical linebreak can split one printed word. The canonical master rune
// scanner counts each line fragment separately, shifting later word addresses.
// Rejoin explicitly marked line wraps and use printed word delimiters instead.
const printedSource = read("resources/lp2-transcription.txt").split("%");
assert.equal(printedSource.length, 57); // p50's table has no rune text.
/** @param {string} page */
function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const lp2Pages = Array.from({length: 58}, (_, p) =>
  p === 50 ? [] : printedWords(printedSource[p > 50 ? p - 1 : p]));
assert.equal(lp2Pages.length, 58);
assert.equal(lp2Pages.reduce((n, page) => n + page.length, 0), 2973);
const fragmentedPages = masterScans.slice(16, 74);
assert.equal(fragmentedPages.reduce((n, page) => n + page.length, 0), 3367);


const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeWord(word) {
  const source = word.toLowerCase().replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = alphabet.find(({ token }) => source.startsWith(token, i));
    if (!hit) throw new Error(`No GP token at ${word}:${source.slice(i)}`);
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

function decodeRunes(word) {
  return [...word].map((rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1, `Unknown rune ${rune}`);
    return corpus.translit[index];
  }).join("");
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const messageWords = [
  "Its", "words", "are", "the", "map", "their", "meaning", "is",
  "the", "road", "and", "their", "numbers", "are", "the", "direction"
];

const rows = messageWords.map((word, sourceIndex) => {
  const gpIndices = encodeWord(word);
  const primeSum = gpIndices.reduce((sum, index) => sum + corpus.prime[index], 0);
  const page = primeSum % 58;
  const wordIndex = Math.floor(primeSum / 58);
  const selected = lp2Pages[page]?.[wordIndex] ?? null;
  return {
    sourceIndex,
    sourceWord: word,
    gp: gpIndices.map((index) => corpus.translit[index]).join(""),
    runeCount: gpIndices.length,
    primeSum,
    page,
    wordIndex,
    selected,
    selectedGp: selected ? decodeRunes(selected) : null
  };
});

assert.equal(rows.length, 16);
assert(rows.every((row) => row.selected !== null), "all 16 page/word addresses must be in bounds");
assert.deepEqual(rows.map((row) => row.primeSum), [
  143, 179, 175, 72, 211, 114, 319, 84,
  72, 204, 215, 114, 295, 175, 72, 337
]);
assert.deepEqual(rows.map(({ page, wordIndex }) => [page, wordIndex]), [
  [27, 2], [5, 3], [1, 3], [14, 1], [37, 3], [56, 1], [29, 5], [26, 1],
  [14, 1], [30, 3], [41, 3], [56, 1], [5, 5], [1, 3], [14, 1], [47, 5]
]);

// The repeated message word "the" maps to the unique complete FOLD token
// in the 56 unsolved LP2 pages.
const fold = encodeWord("FOLD").map((index) => corpus.runes[index]).join("");
const foldHits = [];
for (let page = 0; page < 56; page++) {
  lp2Pages[page].forEach((word, wordIndex) => {
    if (word === fold) foldHits.push({ page, wordIndex });
  });
}
assert.deepEqual(foldHits, [{ page: 14, wordIndex: 1 }]);
assert.equal(rows[3].selected, fold);
assert.equal(rows[8].selected, fold);
assert.equal(rows[14].selected, fold);

// The repeated message word "their" maps to p56 word 1. Verify that this
// ciphertext word is END under the established p56 totient-prime rule.
const p56Word = lp2Pages[56][1];
assert.equal(p56Word, "ᛟᛋᚱ");
const p56Start = lp2Pages[56].slice(0, 1).reduce((n, word) => n + [...word].length, 0);
assert.equal(p56Start, 2);
const primeStream = firstPrimes(p56Start + [...p56Word].length);
const p56PlainIndices = [...p56Word].map((rune, i) => {
  const cipherIndex = corpus.runes.indexOf(rune);
  const phi = primeStream[p56Start + i] - 1;
  return mod(cipherIndex - phi, 29);
});
assert.deepEqual(p56PlainIndices, encodeWord("END"));
assert.equal(rows[5].selected, p56Word);
assert.equal(rows[11].selected, p56Word);

// Frozen base-58 addressing applied to all authentic 2016 signed-message words.
const signedPayload = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedMessage = signedPayload.slice(
  signedPayload.indexOf("Hello."),
  signedPayload.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const signedAllWords = signedMessage.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedAllWords.length, 43); // excludes A,F inside the PGP hex fingerprint

/** @param {string} word @param {number} index */
function mapMessageWord(word, index) {
  const sum = encodeWord(word).reduce((n, glyph) => n + corpus.prime[glyph], 0);
  const page = sum % 58;
  const wordIndex = Math.floor(sum / 58);
  return {word, index, sum, page, wordIndex,
    runeWord: lp2Pages[page]?.[wordIndex] ?? null};
}
const fullMap = signedAllWords.map(mapMessageWord);
const exceptions = fullMap.filter(row => row.runeWord === null);
assert.deepEqual(exceptions.map(({word, sum, page, wordIndex}) =>
  [word, sum, page, wordIndex]), [["lies", 224, 50, 3]]);
assert.equal(lp2Pages[50].length, 0);
const page50Table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"))
  .pages.find(p => p.page === 50);
assert(page50Table && page50Table.tokens.length === 104);
assert.deepEqual([page50Table.tokens[3], page50Table.bytes[3]], ["3D", 193]);
const locate = word => fullMap.filter(row => row.word.toLowerCase() === word);
assert(locate("the").every(row => row.page === 14 && row.wordIndex === 1));
assert(locate("their").every(row => row.page === 56 && row.wordIndex === 1));
assert.deepEqual(locate("found").map(row => [row.page, row.wordIndex]), [[14, 2]]);
assert.deepEqual(locate("beware").map(row => [row.page, row.wordIndex]), [[32, 5]]);

// Literal index-preserving book walk, independently fixed by the same 58-page
// prime-sum pointer rule: FOLD -> the last unsolved page -> solved END.
function nextWord(page, index) {
  const word = lp2Pages[page]?.[index];
  assert(word);
  const sum = [...word].reduce((n, rune) =>
    n + corpus.prime[corpus.runes.indexOf(rune)], 0);
  return {sum, page: sum % 58, index: Math.floor(sum / 58)};
}
const firstHop = nextWord(14, 1);
const secondHop = nextWord(firstHop.page, firstHop.index);
assert.deepEqual(firstHop, {sum: 171, page: 55, index: 2});
assert.equal(decodeRunes(lp2Pages[55][2]), "SB");
assert.deepEqual(secondHop, {sum: 114, page: 56, index: 1});
assert.equal(decodeRunes(lp2Pages[56][1]), "OESR");


// Cross-check the 2016 clue phrase against the p32 11x11 GP-prime square.
const p32Page = corpus.pages.find((page) => page.page === 32);
assert(p32Page);
const p32 = p32Page.indices.map((index) => corpus.prime[index]);
assert.equal(p32.length, 121);
const p32TopRow = p32.slice(0, 11).reduce((a, b) => a + b, 0);
const p32LeftColumn = p32.filter((_, index) => index % 11 === 0).reduce((a, b) => a + b, 0);
const firstFourWordSum = rows.slice(0, 4).reduce((sum, row) => sum + row.primeSum, 0);
assert.deepEqual([p32TopRow, p32LeftColumn, firstFourWordSum], [563, 569, 569]);

console.log(JSON.stringify({
  status: "provisional source-constrained book-map hypothesis; not a decryption",
  modulus: 58,
  indexing: "page = primeSum mod 58; zero-based wordIndex = floor(primeSum / 58)",
  messageRuneCount: rows.reduce((sum, row) => sum + row.runeCount, 0),
  messagePrimeSum: rows.reduce((sum, row) => sum + row.primeSum, 0),
  firstFourWordSum,
  p32TopRow,
  p32LeftColumn,
  foldHits,
  p56Word1Cipher: p56Word,
  p56Word1Plain: "END",
  rows,
  fullMessage: {words: signedAllWords.length, runeWordAddresses: fullMap.length - exceptions.length,
    exception: {word: "lies", sum: 224, page: 50, index: 3,
      tableToken: page50Table.tokens[3], tableByte: page50Table.bytes[3]},
    unfittedAddresses: {found: [14, 2], beware: [32, 5]},
    pointerRoute: {fold: [14, 1], lastUnsolved: [55, 2], solvedEnd: [56, 1]},
    printedWordCount: 2973, lineFragmentCount: 3367}
}, null, 2));
