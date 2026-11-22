#!/usr/bin/env node
'use strict';

// Exploratory cross-round gate:
//   GP prime-sum(word) -> 2013 NUMBER operation
//   factor prime ordinals -> sum modulo 29 -> GP rune
//
// The 2013 service's NUMBER operation is source-documented; the final
// prime-index fold is a hypothesis, not a documented service feature.
// Node 18+; no external dependencies.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}
function mod(n, m) { return ((n % m) + m) % m; }
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function reverseDecimal(n) {
  return Number(String(n).split('').reverse().join(''));
}
function primeFactors(n) {
  const factors = [];
  for (let p = 2; p * p <= n; p++) {
    while (n % p === 0) { factors.push(p); n /= p; }
  }
  if (n > 1) factors.push(n);
  return factors;
}
function primeOrdinal(n) {
  let ordinal = 0;
  for (let p = 2; p < n; p++) if (isPrime(p)) ordinal++;
  return ordinal; // zero-based in the full prime sequence
}

// NUMBER semantics from the archived 2013 service:
// - prime n and prime reverse(n): '+'
// - prime n and composite reverse(n): factor reverse(n)
// - composite n: factor n
// The service returns divisor lists; primeFactors() extracts their prime basis.
function numberFold(n, corpus) {
  const reversed = reverseDecimal(n);
  if (isPrime(n) && isPrime(reversed)) {
    return { n, reversed, plus: true, factors: [], ordinals: [], indexSum: null, index: null };
  }
  const target = isPrime(n) ? reversed : n;
  const factors = primeFactors(target);
  const ordinals = factors.map(primeOrdinal);
  const indexSum = ordinals.reduce((sum, value) => sum + value, 0);
  return {
    n, reversed, plus: false, star: isPrime(n) && !isPrime(reversed),
    target, factors, ordinals, indexSum, index: mod(indexSum, 29)
  };
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit.map((token, index) => ({
  token: token.toLowerCase(), index
})).sort((a, b) => b.token.length - a.token.length);

function gpEncodeAscii(word) {
  const normalized = word.toLowerCase().replace(/v/g, 'u')
    .replace(/k/g, 'c').replace(/z/g, 's');
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find(item => normalized.startsWith(item.token, offset));
    if (!token) return null;
    out.push(token.index);
    offset += token.token.length;
  }
  return out;
}

const transcription = read('resources/lp2-transcription.txt');
const physicalBlocks = transcription.split('%');
const lp2Raw = physicalBlocks.slice(0, 55).join('');
const lp2Normalized = lp2Raw.replace(/[\/\r\n]/g, '')
  .replace(/[&$§]/g, ' ').replace(/[-.]/g, ' ');
const lp2Words = lp2Normalized.split(/\s+/)
  .map(word => Array.from(word).filter(rune => runeIndex.has(rune))
    .map(rune => runeIndex.get(rune)))
  .filter(word => word.length);
const lp2RuneCount = lp2Words.reduce((sum, word) => sum + word.length, 0);
if (lp2Words.length !== 2896 || lp2RuneCount !== 12956) {
  throw new Error('LP2 parse mismatch: expected 2896 words / 12956 runes; got ' +
    lp2Words.length + ' / ' + lp2RuneCount);
}
const lp2Sums = lp2Words.map(word =>
  word.reduce((sum, index) => sum + corpus.prime[index], 0));
const lp2Map = lp2Sums.map(sum => numberFold(sum, corpus));

const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const begin = signed.indexOf('Hello.');
const end = signed.indexOf('-----BEGIN PGP SIGNATURE-----');
if (begin < 0 || end <= begin) throw new Error('Signed 2016 body not found');
const signedWords = signed.slice(begin, end)
  .match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
if (signedWords.length !== 43) throw new Error('Expected 43 signed-message words; got ' + signedWords.length);
const signedRows = signedWords.map(word => {
  const indices = gpEncodeAscii(word);
  if (!indices) throw new Error('Unmappable signed word: ' + word);
  return {
    word, indices,
    primeSum: indices.reduce((sum, index) => sum + corpus.prime[index], 0)
  };
});
const signedMap = signedRows.map(row => numberFold(row.primeSum, corpus));

function strictMapped(item) {
  return !item.plus && item.ordinals.every(value => value < 29) && item.indexSum < 29;
}
function sequence(items) {
  return items.map(item => item.plus ? '+' : corpus.translit[item.index]).join('');
}
function mapSegments(items) {
  const segments = [];
  let current = [];
  for (const item of items) {
    if (item.plus) {
      if (current.length >= 2) segments.push(current);
      current = [];
    } else current.push(item.index);
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}
function scoreIoc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return indices.length > 1
    ? counts.reduce((sum, count) => sum + count * (count - 1), 0) /
      (indices.length * (indices.length - 1))
    : 0;
}
function splitLengths(indices, lengths) {
  let offset = 0;
  return lengths.map(length => {
    const part = indices.slice(offset, offset + length);
    offset += length;
    return part;
  });
}

// Reuse the repository's established GP word-internal Shakespeare model:
// longest-match GP encoding, v/k/z normalization, first 75% training,
// last 25% holdout, Laplace-one bigram/trigram counts.
const shakespeareWords = (read('resources/control/shakespeare_first300k.txt')
  .match(/[A-Za-z]+/g) || []).map(gpEncodeAscii)
  .filter(word => word && word.length >= 2);
const split = Math.floor(shakespeareWords.length * 0.75);
const training = shakespeareWords.slice(0, split);
const holdout = shakespeareWords.slice(split);
const pairs = Array.from({ length: 29 }, () => Array(29).fill(1));
const triples = Array.from({ length: 29 }, () =>
  Array.from({ length: 29 }, () => Array(29).fill(1)));
const pairTotals = Array(29).fill(29);
const tripleTotals = Array.from({ length: 29 }, () => Array(29).fill(29));
for (const word of training) {
  for (let i = 1; i < word.length; i++) {
    pairs[word[i - 1]][word[i]]++;
    pairTotals[word[i - 1]]++;
  }
  for (let i = 2; i < word.length; i++) {
    triples[word[i - 2]][word[i - 1]][word[i]]++;
    tripleTotals[word[i - 2]][word[i - 1]]++;
  }
}
function score(words) {
  let log = 0, transitions = 0;
  for (const word of words) {
    for (let i = 1; i < word.length; i++) {
      log += Math.log(pairs[word[i - 1]][word[i]] / pairTotals[word[i - 1]]);
      transitions++;
    }
    for (let i = 2; i < word.length; i++) {
      log += Math.log(triples[word[i - 2]][word[i - 1]][word[i]] /
        tripleTotals[word[i - 2]][word[i - 1]]);
      transitions++;
    }
  }
  return { meanLog: transitions ? log / transitions : null, transitions };
}

const lp2Mapped = lp2Map.filter(item => !item.plus).map(item => item.index);
const lp2Segments = mapSegments(lp2Map);
const signedMapped = signedMap.filter(item => !item.plus).map(item => item.index);
const signedSegments = mapSegments(signedMap);
const lp2Stats = {
  words: lp2Words.length,
  runes: lp2RuneCount,
  plusMarkers: lp2Map.filter(item => item.plus).length,
  countStarCasesNotEmittedBy_NUMBER: lp2Map.filter(item => item.star).length,
  mappedRunes: lp2Mapped.length,
  strictFirst29PrimeFold: lp2Map.filter(strictMapped).length,
  ioc: scoreIoc(lp2Mapped),
  baselineCiphertextWordScore: score(lp2Words),
  transformedPlusSeparatedScore: score(lp2Segments),
  transformedWithPlusRemovedScore: score([lp2Mapped]),
  preview: sequence(lp2Map.slice(0, 100))
};

const signedStats = {
  words: signedWords.length,
  primeSums: signedRows.map(row => row.primeSum),
  plusMarkers: signedMap.filter(item => item.plus).length,
  countStarCasesNotEmittedBy_NUMBER: signedMap.filter(item => item.star).length,
  mappedRunes: signedMapped.length,
  strictFirst29PrimeFold: signedMap.filter(strictMapped).length,
  transformed: sequence(signedMap),
  originalMessageScore: score(signedRows.map(row => row.indices)),
  transformedPlusSeparatedScore: score(signedSegments),
  transformedWithPlusRemovedScore: score([signedMapped])
};

// The p55 43 interior runes align one-for-one with the 43 signed words.
// Treat NUMBER's '+' as no key (zero shift), then test both GP29 signs.
const p55Raw = physicalBlocks[54].replace(/\/\s*/g, '');
const p55Words = p55Raw.match(/[\u16A0-\u16FF]+/gu) || [];
const p55InnerLengths = p55Words.map(word => Math.max(0, Array.from(word).length - 2));
const p55Inner = p55Words.flatMap(word => Array.from(word).slice(1, -1))
  .map(rune => runeIndex.get(rune));
if (p55Words.length !== 17 || p55Inner.length !== 43) {
  throw new Error('p55 interior extraction mismatch: expected 17 words / 43 runes');
}
const key = signedMap.map(item => item.plus ? 0 : item.index);
const p55Minus = p55Inner.map((value, i) => mod(value - key[i], 29));
const p55Plus = p55Inner.map((value, i) => mod(value + key[i], 29));
const p55CipherWords = splitLengths(p55Inner, p55InnerLengths);
const p55MinusWords = splitLengths(p55Minus, p55InnerLengths);
const p55PlusWords = splitLengths(p55Plus, p55InnerLengths);
const p55Observed = {
  words: p55Words.length,
  innerRunes: p55Inner.length,
  innerLengths: p55InnerLengths,
  plusWordPositions: signedMap.map((item, i) => item.plus ? i : null)
    .filter(index => index !== null),
  ciphertextScore: score(p55CipherWords),
  subtractKeyScore: score(p55MinusWords),
  addKeyScore: score(p55PlusWords),
  subtractKeyText: p55MinusWords.map(word => word.map(i => corpus.translit[i]).join('')).join(' '),
  addKeyText: p55PlusWords.map(word => word.map(i => corpus.translit[i]).join('')).join(' ')
};

// Fixed-seed null: shuffle the 40 non-'+' key values while preserving the
// three '+' positions, then score both signs against the same p55 word shape.
let randomState = 0x20161111;
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}
function shuffle(values) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const keyPositions = signedMap.map((item, i) => item.plus ? null : i)
  .filter(index => index !== null);
const keyValues = keyPositions.map(index => key[index]);
let greaterOrEqualMinus = 0, greaterOrEqualPlus = 0;
const permutations = 10000;
for (let iteration = 0; iteration < permutations; iteration++) {
  const shuffled = shuffle(keyValues);
  const candidate = Array(43).fill(0);
  keyPositions.forEach((position, i) => { candidate[position] = shuffled[i]; });
  const minus = p55Inner.map((value, i) => mod(value - candidate[i], 29));
  const plus = p55Inner.map((value, i) => mod(value + candidate[i], 29));
  if (score(splitLengths(minus, p55InnerLengths)).meanLog >=
      score(p55MinusWords).meanLog) greaterOrEqualMinus++;
  if (score(splitLengths(plus, p55InnerLengths)).meanLog >=
      score(p55PlusWords).meanLog) greaterOrEqualPlus++;
}

const arithmeticExamples = [193, 283, 222, 331, 449].map(n => {
  const item = numberFold(n, corpus);
  return {
    input: n, reversed: item.reversed,
    plus: item.plus,
    factors: item.factors,
    primeOrdinals: item.ordinals,
    indexSum: item.indexSum,
    gp29Index: item.index,
    rune: item.plus ? '+' : corpus.translit[item.index]
  };
});

process.stdout.write(JSON.stringify({
  hypothesis: 'GP prime-sum(word) -> 2013 NUMBER -> sum(zero-based prime-factor ordinals) mod 29',
  explicitCaveat: 'NUMBER is source-documented; the prime-index fold and modulo-29 reduction are hypotheses.',
  arithmeticExamples,
  lp2: lp2Stats,
  signed2016: signedStats,
  p55KeyTest: {
    ...p55Observed,
    randomization: {
      permutations,
      seed: '0x20161111',
      pSubtract: (greaterOrEqualMinus + 1) / (permutations + 1),
      pAdd: (greaterOrEqualPlus + 1) / (permutations + 1),
      greaterOrEqualMinus,
      greaterOrEqualPlus
    }
  },
  languageModel: {
    source: 'resources/control/shakespeare_first300k.txt',
    words: shakespeareWords.length,
    trainingWords: training.length,
    holdoutWords: holdout.length,
    holdoutScore: score(holdout)
  }
}, null, 2) + '\n');
