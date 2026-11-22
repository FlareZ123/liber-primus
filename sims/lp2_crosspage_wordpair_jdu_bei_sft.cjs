'use strict';

/**
 * LP2 cross-page repeated complete-word-pair gate.
 * Original-source input, explicit native GP rune and printed separator parsing.
 * Run on Windows 11 / Node22: node sims/lp2_crosspage_wordpair_jdu_bei_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const encryptedPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = encryptedPages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

const boundaries = [];
let offset = 0;
for (const p of encryptedPages) {
  boundaries.push({page: p.page, start: offset, end: offset + p.indices.length});
  offset += p.indices.length;
}
/** @param {number} i */
function pageOf(i) {
  return boundaries.find(p => p.start <= i && i < p.end).page;
}

const words = [];
let consumed = 0, line = 0, start = 0, firstLine = 0, runes = [];
for (const char of text) {
  if (runeIndex.has(char)) {
    if (runes.length === 0) {
      start = consumed;
      firstLine = line;
    }
    runes.push(runeIndex.get(char));
    consumed += 1;
  } else if ((char === '-' || char === '.') && runes.length > 0) {
    words.push({indices: runes, offset: start, page: pageOf(start), line: firstLine});
    runes = [];
  }
  if (char === '\n') line += 1;
  if (consumed === original.length) break;
}
if (runes.length > 0) {
  words.push({indices: runes, offset: start, page: pageOf(start), line: firstLine});
}
assert.equal(words.length, 2896);
assert.deepEqual(words.flatMap(w => w.indices), original);
assert.equal(words[1462].offset, 6555);
assert.equal(words[2894].offset, 12950);
assert.equal(words[1462].page, 27);
assert.equal(words[2894].page, 55);
assert.deepEqual(words[1462].indices, [23,11,1]);
assert.deepEqual(words[1463].indices, [17,18,10]);
assert.deepEqual(words[2894].indices, [23,11,1]);
assert.deepEqual(words[2895].indices, [17,18,10]);
assert.equal((words[2894].offset - words[1462].offset) % 5, 0);

const types = [...new Set(words.map(w => w.indices.join(',')))];
const typeNumber = new Map(types.map((value, index) => [value, index]));
const typeLength = types.map(value => value.split(',').length);
const wordIds = words.map(w => typeNumber.get(w.indices.join(',')));
const typeCount = types.length;
assert.equal(typeCount, 2731);

/** @param {number[]} ids */
function findCrossPagePairs(ids) {
  const seen = new Map();
  const pairs = [];
  let maxLength = 0;
  for (let i = 0; i < ids.length - 1; i += 1) {
    const key = ids[i] * typeCount + ids[i + 1];
    const prior = seen.get(key);
    if (prior === undefined) {
      seen.set(key, i);
    } else if (words[i].page !== words[prior].page) {
      const length = typeLength[ids[i]] + typeLength[ids[i + 1]];
      maxLength = Math.max(maxLength, length);
      pairs.push({first: prior, second: i, length});
    }
  }
  return {maxLength, pairs};
}
const observed = findCrossPagePairs(wordIds);
assert.equal(observed.maxLength, 6);
assert.deepEqual(observed.pairs, [{first:1462, second:2894, length:6}]);

/** @param {'page'|'line'} field */
function groups(field) {
  const bins = new Map();
  words.forEach((word, i) => {
    const key = word[field];
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(i);
  });
  return [...bins.values()].filter(g => g.length >= 2);
}

/** @param {number} initialSeed */
function seededRandom(initialSeed) {
  let seed = initialSeed >>> 0;
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

/**
 * This is a familywise word-pair test: all 2895 consecutive pairs are
 * inspected in each source-shape-preserving randomization.
 * @param {number[][]} units
 * @param {number} trials
 * @param {number} initialSeed
 */
function nullTest(units, trials, initialSeed) {
  const random = seededRandom(initialSeed);
  let hits = 0;
  const histogram = new Map();
  for (let trial = 0; trial < trials; trial += 1) {
    const current = wordIds.slice();
    for (const group of units) {
      for (let j = group.length - 1; j > 0; j -= 1) {
        const k = Math.floor(random() * (j + 1));
        const a = group[j], b = group[k], hold = current[a];
        current[a] = current[b];
        current[b] = hold;
      }
    }
    const maxLength = findCrossPagePairs(current).maxLength;
    histogram.set(maxLength, (histogram.get(maxLength) || 0) + 1);
    if (maxLength >= observed.maxLength) hits += 1;
  }
  return {
    trials, initialSeed, hits,
    empiricalAddOneTail: (hits + 1) / (trials + 1),
    maxLengthHistogram: Object.fromEntries([...histogram].sort((a,b) => a[0] - b[0]))
  };
}

// A planted two-page duplicate proves the exact-word-pair detector is active.
const plant = wordIds.slice();
plant[100] = wordIds[1462];
plant[101] = wordIds[1463];
plant[2000] = wordIds[1462];
plant[2001] = wordIds[1463];
assert.ok(findCrossPagePairs(plant).maxLength >= 6);

const trials = 10000;
const pageNull = nullTest(groups('page'), trials, 0x33012014);
const lineNull = nullTest(groups('line'), trials, 0x33015527);
console.log(JSON.stringify({
  source: 'Unmodified original 12956 LP2 p0–55 runes + original printed word separators',
  completePrintedWords: words.length,
  distinctCipherWords: typeCount,
  sourceObserved: {
    crossPageRepeatedPairs: observed.pairs,
    ciphertext: 'DJU BEI',
    first: {page:27, globalRuneOffset:6555, localRuneOffset:28, wordNumber:1462},
    second: {page:55, globalRuneOffset:12950, localRuneOffset:70, wordNumber:2894},
    globalRuneSeparation:6395,
    separationMod5:0,
    maximumRepeatedCompleteWordPairRunes:observed.maxLength
  },
  pageWithinWordInventoryShuffle:pageNull,
  originalPrintedLineWithinWordInventoryShuffle:lineNull,
  plantedTwoPageSixRunePair:'PASS',
  decision:'Unique original repeated complete 3+3 word pair, but not exceptional under the original printed-line-conditioned family; no plaintext or reusable key.'
},null,2));
