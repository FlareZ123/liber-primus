'use strict';

/**
 * Exact original-book two-half H-word lexical readout and familywise shuffle gate.
 * Run as one read-only Node.js 22 CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const original = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const authentic = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const runes = new Map(corpus.runes.map((rune, index) => [rune, index]));
const words = [];
let held = [];
let totalRunes = 0;

function finishWord() {
  if (!held.length) return;
  const source = held.map((rune) => rune.value);
  const half = Math.floor(source.length / 2);
  const center = source.length % 2 ? source[half] : 0;
  words.push({
    page: held[0].page,
    offset: held[0].offset,
    len: source.length,
    left: (2 * source.slice(0, half).reduce((a, b) => a + b, 0) + center) % 29,
    right: (2 * source.slice(source.length - half).reduce((a, b) => a + b, 0) + center) % 29,
  });
  held = [];
}

const pages = original.split('%');
assert.equal(pages.length, 57);
for (let printed = 0; printed < pages.length; printed++) {
  const physical = printed >= 50 ? printed + 1 : printed;
  let offset = 0;
  const actual = [];
  for (const char of pages[printed]) {
    const value = runes.get(char);
    if (value !== undefined) {
      actual.push(value);
      held.push({ value, page: physical, offset: offset++ });
      totalRunes++;
    } else if (char === '-' || char === '.') {
      finishWord();
    }
  }
  assert.deepEqual(actual, corpus.pages[physical].indices, 'source glyphs at page ' + physical);
}
finishWord();
assert.equal(totalRunes, 13136);
assert.equal(words.length, 2941);

const unsolved = words.filter((word) => word.page <= 55);
assert.equal(unsolved.length, 2896);
assert.equal(unsolved.reduce((sum, word) => sum + word.len, 0), 12956);

const body = authentic.slice(
  authentic.indexOf('Hash: SHA1') + 'Hash: SHA1'.length,
  authentic.indexOf('-----BEGIN PGP SIGNATURE-----')
);
const signed = body.trim().split(/\s+/)
  .map((part) => part.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ''))
  .filter((part) => /^[A-Za-z]+$/.test(part))
  .map((part) => part.toUpperCase());
assert.equal(signed.length, 43);
const vocabulary = new Map();
for (let i = 0; i < 29; i++) if (!vocabulary.has(signed[i])) vocabulary.set(signed[i], vocabulary.size);
assert.equal(vocabulary.size, 21);

const eligible5 = new Set();
for (let start = 0; start + 5 <= signed.length; start++) {
  const ids = signed.slice(start, start + 5).map((token) => vocabulary.get(token));
  if (ids.every((id) => id !== undefined)) {
    eligible5.add(ids.reduce((value, id) => value * 29 + id, 0));
  }
}
assert.equal(eligible5.size, 25);
const labels = unsolved.map((word) => {
  const left = vocabulary.get(signed[word.left]);
  const right = vocabulary.get(signed[word.right]);
  assert.ok(left !== undefined && right !== undefined);
  return [left, right];
});
const base4 = 29 ** 4;

/** How many exact signed-source five-grams appear under one reading order? */
function fiveCount(values, mode) {
  let found = 0;
  let count = 0;
  let code = 0;
  for (const pair of values) {
    const letters = mode === 0 ? [pair[0]] :
      mode === 1 ? [pair[1]] :
      mode === 2 ? [pair[0], pair[1]] : [pair[1], pair[0]];
    for (const number of letters) {
      code = (code % base4) * 29 + number;
      count++;
      if (count >= 5 && eligible5.has(code)) found++;
    }
  }
  return found;
}

const originalCounts = [0, 1, 2, 3].map((mode) => fiveCount(labels, mode));
assert.deepEqual(originalCounts, [0, 0, 0, 1]);
const p11 = unsolved.findIndex((word) => word.page === 11 && word.offset === 51);
assert.ok(p11 >= 0);
assert.deepEqual(unsolved.slice(p11, p11 + 3).map((word) => [word.right, word.left]),
  [[1, 18], [25, 20], [11, 10]]);
assert.deepEqual(signed.slice(17, 22), ['THE', 'MAP', 'THEIR', 'MEANING', 'IS']);

function groups(includeWordLength) {
  const byKey = new Map();
  for (let i = 0; i < unsolved.length; i++) {
    const word = unsolved[i];
    const key = includeWordLength ? word.page + ':' + word.len : String(word.page);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(i);
  }
  return Array.from(byKey.values());
}
const pageGroups = groups(false);
const pageLengthGroups = groups(true);
assert.equal(pageGroups.length, 55);
assert.equal(pageLengthGroups.length, 525);

/** Fixed seeded xorshift32, identical across every independently reproduced trial. */
function generator(seed) {
  let state = seed >>> 0;
  return function randomFraction() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * The (left,right) values stay paired; preserve all page starting indices,
 * and optionally the full original printed-word length at each position.
 * Charge all four modes and all original positions on every null book.
 */
function shuffleTest(groupList, seed, trials) {
  const rand = generator(seed);
  const shuffledIndices = Array.from({ length: unsolved.length }, (_, i) => i);
  let hitsAny = 0;
  let hitsRightLeft = 0;
  let hitsLeftRight = 0;
  let hitsSingle = 0;
  let allRightLeft = 0;
  let maximumRightLeft = 0;

  for (let trial = 0; trial < trials; trial++) {
    for (const group of groupList) {
      for (let j = group.length - 1; j > 0; j--) {
        const k = Math.floor(rand() * (j + 1));
        const from = group[j];
        const to = group[k];
        [shuffledIndices[from], shuffledIndices[to]] = [shuffledIndices[to], shuffledIndices[from]];
      }
    }
    const trialPairs = shuffledIndices.map((index) => labels[index]);
    const counts = [0, 1, 2, 3].map((mode) => fiveCount(trialPairs, mode));
    if (counts.some((n) => n > 0)) hitsAny++;
    if (counts[3] > 0) hitsRightLeft++;
    if (counts[2] > 0) hitsLeftRight++;
    if (counts[0] + counts[1] > 0) hitsSingle++;
    allRightLeft += counts[3];
    maximumRightLeft = Math.max(maximumRightLeft, counts[3]);
  }
  return {
    trials, hitsAny, hitsRightLeft, hitsLeftRight, hitsSingle,
    meanRightLeft: allRightLeft / trials, maximumRightLeft,
    familywisePlusOneTail: (hitsAny + 1) / (trials + 1),
    singleModePlusOneTail: (hitsRightLeft + 1) / (trials + 1),
  };
}
const page = shuffleTest(pageGroups, 0x9e3779b9, 3000);
const pageAndLength = shuffleTest(pageLengthGroups, 0x243f6a88, 3000);
assert.deepEqual([page.hitsAny, page.hitsRightLeft, page.hitsLeftRight, page.hitsSingle],
  [611, 236, 161, 249]);
assert.deepEqual(
  [pageAndLength.hitsAny, pageAndLength.hitsRightLeft, pageAndLength.hitsLeftRight, pageAndLength.hitsSingle],
  [667, 232, 235, 252]);
console.log(JSON.stringify({
  originalUnknownWords: 2896,
  sourceSignedWords: 43,
  independentEligibleSource5Grams: eligible5.size,
  originalFiveWordHitsByMode: {
    leftOnly: originalCounts[0],
    rightOnly: originalCounts[1],
    leftThenRight: originalCounts[2],
    rightThenLeft: originalCounts[3],
  },
  selectedRightThenLeftOriginal: {
    sourcePage: 11, offset: 51,
    plaintextLabelsOnly: 'THE MAP THEIR MEANING IS',
    totalWordsConsumed: 3,
    nextWordFails: true,
  },
  shuffleEntireWordPairsWithinPage: page,
  shuffleWordPairsWithinOriginalPageAndLength: pageAndLength,
  conclusion: 'Five-word original-source echo is expected often when four modes and all positions are searched.',
}, null, 2));
