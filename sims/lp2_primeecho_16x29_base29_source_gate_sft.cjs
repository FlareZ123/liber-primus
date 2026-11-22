'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PRIME_ECHO_PATH = path.join(ROOT, 'resources', 'historical', 'cicada2013-os-original-prime-echo.sh');
const CORPUS_PATH = path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json');
const BASE29_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRS';
const VISUAL_CHAPTER_LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];

/** @param {number} value @returns {string} */
function toBase29(value) {
  assert.ok(Number.isSafeInteger(value) && value >= 0);
  if (value === 0) return '0';

  let n = value;
  let out = '';
  while (n > 0) {
    const digit = n % 29;
    out = BASE29_DIGITS[digit] + out;
    n = Math.floor(n / 29);
  }
  return out;
}

/** @param {string} token @returns {number[]} */
function base29DigitValues(token) {
  return Array.from(token, (ch) => {
    const value = BASE29_DIGITS.indexOf(ch);
    assert.ok(value >= 0);
    return value;
  });
}

/** @param {number[]} pageCounts @param {number} target @returns {Array<{startPage:number,endPage:number}>} */
function contiguousPageMatches(pageCounts, target) {
  const matches = [];
  for (let start = 0; start < pageCounts.length; start++) {
    let sum = 0;
    for (let end = start; end < pageCounts.length; end++) {
      sum += pageCounts[end];
      if (sum === target) matches.push({ startPage: start, endPage: end });
      if (sum > target) break;
    }
  }
  return matches;
}

/** @param {string} words @param {string[]} alphabet @returns {number[]} */
function toGpRunes(words, alphabet) {
  const sorted = alphabet.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const runes = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = sorted.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'No GP spelling for ' + word.slice(i));
      runes.push(match.index);
      i += match.token.length;
    }
  }
  return runes;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) out.push(candidate);
  }
  return out;
}

const primeEcho = fs.readFileSync(PRIME_ECHO_PATH, 'utf8');
const events = primeEcho
  .split(/\r?\n/)
  .map((line) => line.match(/echo.*?(\d+).*?sleep\s+([0-9.]+)/))
  .filter(Boolean)
  .map((match) => ({
    prime: Number(match[1]),
    delaySeconds: Number(match[2])
  }));

assert.equal(events.length, 464);
assert.equal(events[0].prime, 2);
assert.equal(events[463].prime, 3301);

const held = events
  .map((event, index) => ({ ...event, rank: index + 1 }))
  .filter((event) => event.delaySeconds === 2);
assert.deepEqual(held, [
  { prime: 1033, delaySeconds: 2, rank: 174 },
  { prime: 3301, delaySeconds: 2, rank: 464 }
]);

assert.equal(174, 6 * 29);
assert.equal(464, 16 * 29);
assert.equal(toBase29(1033), '16I');
assert.equal(toBase29(3301), '3QO');

const converted = events.map((event) => ({
  ...event,
  base29: toBase29(event.prime)
}));
const rows = Array.from({ length: 16 }, (_, row) => converted.slice(row * 29, (row + 1) * 29));
assert.ok(rows.every((row) => row.length === 29));
assert.equal(rows[5][28].prime, 1033);
assert.equal(rows[15][28].prime, 3301);

const rowDigitCounts = rows.map((row) => row.reduce((sum, event) => sum + event.base29.length, 0));
assert.deepEqual(rowDigitCounts, [49, 58, 58, 58, 58, 86, 87, 87, 87, 87, 87, 87, 87, 87, 87, 87]);

const flatDigits = converted.flatMap((event) => base29DigitValues(event.base29));
assert.equal(flatDigits.length, 1237);

const matchedNullPauseBoundaryProbability = 1;
const matchedNullTotalDigitLengthProbability = 1;
assert.equal(matchedNullPauseBoundaryProbability, 1);
assert.equal(matchedNullTotalDigitLengthProbability, 1);

const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
const unsolvedPages = corpus.pages.filter((page) => page.page >= 0 && page.page <= 55);
const pageCounts = unsolvedPages.map((page) => page.runic_count);
assert.equal(pageCounts.reduce((a, b) => a + b, 0), 12956);
assert.equal(VISUAL_CHAPTER_LENGTHS.reduce((a, b) => a + b, 0), 12956);
assert.equal(pageCounts.includes(flatDigits.length), false);
assert.equal(VISUAL_CHAPTER_LENGTHS.includes(flatDigits.length), false);
assert.deepEqual(contiguousPageMatches(pageCounts, flatDigits.length), []);

const p56 = corpus.pages.find((page) => page.page === 56);
assert.ok(p56);
const p56Cipher = p56.indices;
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56Plain = toGpRunes(expectedWords, corpus.translit);
assert.equal(p56Cipher.length, 85);
assert.equal(p56Plain.length, 85);

const p56FPositions = p56Cipher
  .map((rune, index) => rune === 0 ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(p56FPositions, [35, 47, 51, 56, 74]);

const p56Primes = firstPrimes(120);
let primeIndex = 0;
const p56Decoded = p56Cipher.map((rune, position) => {
  if (position === 56) return 0;
  const shift = p56Primes[primeIndex++] - 1;
  return ((rune - shift) % 29 + 29) % 29;
});
assert.deepEqual(p56Decoded, p56Plain);

console.log(JSON.stringify({
  primeEchoEvents: events.length,
  holds: held,
  matrix: { rows: 16, columns: 29 },
  base29Examples: { '1033': toBase29(1033), '3301': toBase29(3301) },
  rowDigitCounts,
  flattenedDigitCount: flatDigits.length,
  sourceNativeExactLengthMatches: {
    physicalPage: false,
    visualChapter: false,
    contiguousWholePages: []
  },
  matchedNull: {
    pauseBoundaryProbability: matchedNullPauseBoundaryProbability,
    totalDigitLengthProbability: matchedNullTotalDigitLengthProbability
  },
  p56PositiveControl: {
    runes: p56Cipher.length,
    exactPlaintextRecovery: true
  },
  decision: 'The 16x29 BASE29 token table is exact historical structure, but it supplies no source-selected LP2 receiver.'
}, null, 2));
