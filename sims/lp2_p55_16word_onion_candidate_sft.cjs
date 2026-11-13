'use strict';

/**
 * SFT: a frozen, unverified p55 word-sum -> historical Tor-v2 locator candidate.
 *
 * Source paths are relative to the repository root. The output is a candidate
 * 16-character Base32 string, not decrypted plaintext or a verified onion.
 * Reproducible controls are source counts, page continuity, and a locked
 * within-page sixteen-word-window comparison. No network access is used.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcript = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const fragments = transcript.split(/%\s*\r?\n/);
const base32 = 'abcdefghijklmnopqrstuvwxyz234567';

assert.equal(corpus.pages.length, 58);
assert.equal(fragments.length, 57); // Physical p50 is a runeless table.
assert.equal(corpus.runes.length, 29);
assert.equal(corpus.prime.length, 29);

/**
 * Split only at printed punctuation; physical line wraps are not word cuts.
 * The 2014 transcription has one % page terminator for each runic page.
 *
 * @param {string} text - One original physical page's source transcription.
 * @returns {number[][]} Page-local printed rune fragments.
 */
function printedWords(text) {
  const units = [];
  let current = [];
  for (const symbol of Array.from(text.replace(/\s/g, '').replaceAll('/', ''))) {
    const rune = corpus.runes.indexOf(symbol);
    if (rune >= 0) {
      current.push(rune);
    } else if (current.length !== 0) {
      units.push(current);
      current = [];
    }
  }
  if (current.length !== 0) units.push(current);
  return units;
}

/**
 * @param {number} p - LP2 physical page index.
 * @returns {number[][]} Page-local fragments (p50 has no runes).
 */
function pageWords(p) {
  if (p === 50) return [];
  const transcriptIndex = p < 50 ? p : p - 1;
  const words = printedWords(fragments[transcriptIndex]);
  assert.deepEqual(words.flat(), corpus.pages[p].indices, `transcription mismatch on physical p\${p}`);
  return words;
}

/** @param {number[]} word - GP-index word. @returns {number} */
function sumPrimes(word) {
  return word.reduce((sum, index) => sum + corpus.prime[index], 0);
}

const physical55 = pageWords(55);
assert.equal(physical55.length, 17);
assert.equal(physical55[0].length, 1);
assert.equal(physical55[0][0], 21); // NG: incoming p54 word-ending carry.
assert.deepEqual(physical55.map(w => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

const complete = physical55.slice(1);
const sums = complete.map(sumPrimes);
const expected = [222, 114, 118, 306, 283, 30, 596, 365,
  138, 108, 341, 291, 88, 284, 129, 159];
assert.deepEqual(sums, expected);

const digits = sums.map(s => s % 32);
const candidate = digits.map(d => base32[d]).join('');
assert.equal(candidate, '6sws36unkmvdy4b7');
assert.equal(candidate.length, 16);

// The same fixed five-slot floral marks on physical pp40-55 were separately
// read as 01101 (left) and 11111 (right) in the original-source ornament audit.
// This test uses those frozen values; it does not rederive pixel bit ordering.
assert.equal(digits[7], 13);
assert.equal(digits[15], 31);

// Independent 2014 source cross-check: the Stage11 metadata strips/reverses
// the original Stage10 magic sums, and its outer digits match p55 positions 8/16.
const squareText = fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt', 'utf8');
const squareValues = squareText.match(/\d+/g).map(Number);
assert.equal(squareValues.length, 99);
let squareOffset = 0;
const magicSums = [];
for (const order of [5, 7, 5]) {
  const cells = squareValues.slice(squareOffset, squareOffset + order * order);
  assert.equal(cells.length, order * order);
  squareOffset += order * order;
  const rowSums = Array.from({length: order}, (_, row) =>
    cells.slice(row * order, (row + 1) * order).reduce((a, b) => a + b, 0));
  assert.ok(rowSums.every(sum => sum === rowSums[0]));
  magicSums.push(rowSums[0]);
}
assert.equal(squareOffset, 99);
assert.deepEqual(magicSums, [3301, 1033, 1033]);

const stage11Html = fs.readFileSync('resources/cicada2014-onion7-index.html', 'utf8');
const stage11Title = stage11Html.match(/<title>(.*?)<\/title>/i)?.[1];
const stage11Id = stage11Html.match(/\bid="([^"]+)"/i)?.[1];
assert.deepEqual([stage11Title, stage11Id], ['133', '331']);
const zeroStrippedSums = magicSums.slice(0, 2).map(value => String(value).replace('0', ''));
assert.deepEqual(zeroStrippedSums, ['331', '133']);
assert.deepEqual([stage11Title, stage11Id], [zeroStrippedSums[1], zeroStrippedSums[0]]);
const outerDigits = value => Number(value[0] + value[value.length - 1]);
const stage11Check = [outerDigits(stage11Title), outerDigits(stage11Id)];
assert.deepEqual(stage11Check, [13, 31]);
assert.deepEqual([digits[7], digits[15]], stage11Check);

// Existing signed-2016 16-word alternative under the same fixed recipe:
// its check positions are 20/17, not the original Stage11 13/31 pair.
const alternative2016 = 'ptpits7uimxshpir';
const alternative2016Check = [
  base32.indexOf(alternative2016[7]),
  base32.indexOf(alternative2016[15]),
];
assert.deepEqual(alternative2016Check, [20, 17]);
assert.notDeepEqual(alternative2016Check, stage11Check);

let windowCount = 0;
const matchingWindows = [];
const decoratedEndings = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = pageWords(page);
  for (let start = 0; start + 16 <= words.length; start += 1) {
    windowCount += 1;
    if (sumPrimes(words[start + 7]) % 32 === 13 &&
        sumPrimes(words[start + 15]) % 32 === 31) {
      matchingWindows.push([page, start]);
    }
  }
  if (page >= 40 && words.length >= 16) {
    const last = words.slice(-16);
    decoratedEndings.push({
      page,
      values: [sumPrimes(last[7]) % 32, sumPrimes(last[15]) % 32],
    });
  }
}
assert.equal(windowCount, 2103);
assert.deepEqual(matchingWindows, [[55, 1]]);
assert.equal(decoratedEndings.length, 15);
assert.deepEqual(decoratedEndings.filter(row =>
  row.values[0] === 13 && row.values[1] === 31).map(row => row.page), [55]);

// Independent function sanity control. This tests arithmetic only, not onion validity.
assert.equal(base32[sumPrimes([0]) % 32], 'c'); // F has GP prime 2.
assert.equal(base32[sumPrimes([0, 1]) % 32], 'f'); // F+U = 2+3 = 5.

console.log(JSON.stringify({
  classification: 'UNVERIFIED FORMAT CANDIDATE; NO DECRYPTED LP2 TEXT',
  physicalPage: 55,
  incomingCarry: 'NG from physical p54',
  completeWordCount: complete.length,
  primeSums: sums,
  base32Digits: digits,
  possibleTorV2: candidate + '.onion',
  matchingWithinPage16Windows: matchingWindows,
  totalWithinPage16Windows: windowCount,
  decoratedPageLast16Controls: decoratedEndings,
  stage10Stage11NumericChecksum: {
    stage10MagicSums: magicSums,
    stage11Title: stage11Title,
    stage11DivId: stage11Id,
    zeroStrippedSumsInReverseOrder: zeroStrippedSums,
    stage11OuterDigits: stage11Check,
    candidateWord8And16: [digits[7], digits[15]],
    signed2016Alternative: {host: alternative2016, word8And16: alternative2016Check},
  },
}, null, 2));
