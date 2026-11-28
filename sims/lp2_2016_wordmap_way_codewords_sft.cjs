'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const mod = (value) => ((value % MOD) + MOD) % MOD;

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'),
  'utf8',
));
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'),
  'utf8',
));
const transcription = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'),
  'utf8',
).replace(/\r/g, '');
const signed2016 = fs.readFileSync(
  path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'),
  'utf8',
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const signedWords = signed2016
  .split('Hash: SHA1\n\n')[1]
  .split('\n-----BEGIN PGP SIGNATURE-----')[0]
  .match(/[A-Za-z]+/g)
  .slice(0, 43)
  .map((word) => word.toUpperCase());

assert.equal(signedWords[2], 'PATH');
assert.equal(signedWords[13], 'WAY');
assert.equal(signedWords[23], 'ROAD');
assert.equal(signedWords[15], 'WORDS');
assert.equal(signedWords[27], 'ARE');
assert.equal(signedWords[28], 'THE');
assert.equal(signedWords[8], 'DEVOTED');
assert.equal(signedWords[1], 'THE');

/** @param {number[]} values */
function H(values) {
  const out = [];
  const half = Math.floor(values.length / 2);
  for (let i = 0; i < half; i += 1) {
    out.push(mod(values[i] - values[values.length - 1 - i]));
  }
  if (values.length % 2) out.push(values[half]);
  for (let i = half - 1; i >= 0; i -= 1) {
    out.push(mod(values[i] + values[values.length - 1 - i]));
  }
  return out;
}

/** @param {number} page */
function pageWords(page) {
  const segment = parts[page >= 51 ? page - 1 : page] ?? '';
  const source = corpus.pages.find((entry) => entry.page === page).indices;
  const words = [];
  let offset = 0;
  let start = 0;
  let current = [];
  const flush = () => {
    if (current.length === 0) return;
    words.push({ page, start, end: offset, values: current.slice() });
    current = [];
  };
  for (const char of segment) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      assert.equal(source[offset], value);
      if (current.length === 0) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === '/' || /\s/u.test(char)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length);
  return words;
}

/** @param {number[]} pageRange */
function seamWords(pageRange) {
  const words = [];
  let current = [];
  let first = null;
  const flush = () => {
    if (current.length === 0) return;
    words.push({ values: current.slice(), first });
    current = [];
    first = null;
  };
  for (const page of pageRange) {
    const segment = parts[page >= 51 ? page - 1 : page] ?? '';
    const source = corpus.pages.find((entry) => entry.page === page).indices;
    let offset = 0;
    for (const char of segment) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        assert.equal(source[offset], value);
        if (current.length === 0) first = { page, local: offset };
        current.push(value);
        offset += 1;
      } else if (char === '/' || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
    assert.equal(offset, source.length);
  }
  flush();
  return words;
}

const completeWords = [
  ...seamWords(Array.from({ length: 50 }, (_, index) => index)),
  ...seamWords([51, 52, 53, 54, 55]),
];
assert.equal(completeWords.length, 2896);
assert.equal(completeWords.filter((word) => word.values.length === 3).length, 720);

const routeMultiset = [2, 13, 23].sort((a, b) => a - b).join(',');
const routeTriadHits = completeWords.filter((word) =>
  word.values.length === 3
  && [...word.values].sort((a, b) => a - b).join(',') === routeMultiset
);
assert.deepEqual(
  routeTriadHits.map((word) => [word.first.page, word.first.local, word.values]),
  [[3, 119, [13, 23, 2]]],
);

// The only wholly red three-rune spans are the paired p3/p39 objects at offset119.
const redTriads = [];
const bracketedRedTriads = [];
for (const page of ink.pages) {
  const marks = new Set((page.large_punctuation ?? [])
    .map(([offset, count, color]) => `${offset}:${count}:${color}`));
  for (const span of page.red_spans ?? []) {
    if (span.length !== 3) continue;
    const values = corpus.pages.find((entry) => entry.page === page.page).indices
      .slice(span.start, span.start + span.length);
    redTriads.push({ page: page.page, start: span.start, values });
    if (
      marks.has(`${span.start}:13:red`)
      && marks.has(`${span.start + span.length}:13:red`)
    ) {
      bracketedRedTriads.push({ page: page.page, start: span.start, values });
    }
  }
}
assert.deepEqual(redTriads, [
  { page: 3, start: 119, values: [13, 23, 2] },
  { page: 39, start: 119, values: [27, 5, 15] },
]);
assert.deepEqual(bracketedRedTriads, redTriads);

const p3 = redTriads[0];
const p39 = redTriads[1];
assert.deepEqual(p3.values.map((value) => signedWords[value]), [
  'WAY', 'ROAD', 'PATH',
]);
assert.deepEqual(p3.values.slice(1).concat(p3.values[0]), [23, 2, 13]);
assert.deepEqual(
  p3.values.slice(1).concat(p3.values[0]).map((value) => signedWords[value]),
  ['ROAD', 'PATH', 'WAY'],
);
assert.deepEqual(H(p3.values), [11, 23, 15]);

// Scan the entire punctuation/word adjacency family. Exactly two large marks
// have a count equal to the first rune of a canonical word beginning at that
// same offset, and both are red13.
const markAdjacentEchoWords = [];
for (const page of ink.pages) {
  const wordsByStart = new Map(pageWords(page.page)
    .map((word) => [word.start, word]));
  for (const [offset, count, color] of page.large_punctuation ?? []) {
    const word = wordsByStart.get(offset);
    if (word && word.values[0] === count) {
      markAdjacentEchoWords.push({
        page: page.page,
        offset,
        count,
        color,
        values: word.values,
      });
    }
  }
}
assert.deepEqual(markAdjacentEchoWords, [
  { page: 3, offset: 119, count: 13, color: 'red', values: [13, 23, 2] },
  { page: 39, offset: 122, count: 13, color: 'red', values: [13, 23, 15, 27] },
]);

const p39Echo = markAdjacentEchoWords[1];
const p39Oriented = p39Echo.values.slice(1).concat(p39Echo.values[0]);
assert.deepEqual(p39Oriented, [23, 15, 27, 13]);
assert.deepEqual(p39Oriented.map((value) => signedWords[value]), [
  'ROAD', 'WORDS', 'ARE', 'WAY',
]);
assert.deepEqual(H(p39Echo.values), [15, 8, 9, 11]);

// The p39 red triad itself is the paired state object at the same offset119.
assert.deepEqual(H(p39.values), [12, 5, 13]);
assert.deepEqual(H(p39.values).map((value) => signedWords[value]), [
  'THE', 'EPIPHANY', 'WAY',
]);

// Third independently addressed WAY-header object from the p24-p26 packet.
// The p26 packet and uniqueness census are fully tested in the companion SFT.
const p26Word = pageWords(26).find((word) => word.start === 16);
assert.ok(p26Word);
assert.deepEqual(p26Word.values, [13, 28, 8, 27, 1]);
const p26Oriented = p26Word.values.slice(1).concat(p26Word.values[0]);
assert.deepEqual(p26Oriented, [28, 8, 27, 1, 13]);
assert.deepEqual(p26Oriented.map((value) => signedWords[value]), [
  'THE', 'DEVOTED', 'ARE', 'THE', 'WAY',
]);
assert.deepEqual(H(p26Oriented), [15, 7, 27, 9, 12]);

console.log(JSON.stringify({
  signed2016RouteWords: {
    PATH: 2,
    WAY: 13,
    ROAD: 23,
    WORDS: 15,
    DEVOTED: 8,
  },
  sourceAwareCompleteWords: completeWords.length,
  threeRuneWords: completeWords.filter((word) => word.values.length === 3).length,
  routeTriadHits: routeTriadHits.map((word) => ({
    page: word.first.page,
    start: word.first.local,
    values: word.values,
  })),
  redTriads,
  markAdjacentEchoWords,
  decoded: {
    p3: p3.values.slice(1).concat(p3.values[0])
      .map((value) => signedWords[value]),
    p39: p39Oriented.map((value) => signedWords[value]),
    p26: p26Oriented.map((value) => signedWords[value]),
  },
  stateChecks: {
    p3H3: H(p3.values),
    p39RedH3: H(p39.values),
    p39EchoH4: H(p39Echo.values),
    p26OrientedH5: H(p26Oriented),
  },
}, null, 2));
