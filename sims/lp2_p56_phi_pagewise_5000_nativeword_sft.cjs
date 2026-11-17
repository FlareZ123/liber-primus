'use strict';

/**
 * Page-local prime-totient GP29 attack on every original LP2 unknown rune page.
 * Exhaustively tests prime starts 0..4999 and every plaintext-F skip path,
 * choosing the path with most matched native-GP word runes. This is distinct
 * from earlier chapter-continuous phi(prime) reachability tests.
 *
 * On Windows 11 / Node.js: run this JavaScript file directly from the repo.
 * Source-only inputs, no packages, no generated data, no mutable files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = read('resources/lp2-transcription.txt')
  .split('%').map(s => s.trim()).filter(Boolean);
assert.equal(pages.length, 57, 'Derivative transcript omits numeric-only p50');
pages.splice(50, 0, '');
assert.equal(pages.length, 58);

const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Use Cicada-native spelling and longest GP digraphs. Every rune index
 * becomes a unique single JS character (A through ]) for trie-free matching.
 * @param {string} word
 * @returns {string}
 */
function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/K/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  let result = '';
  for (let i = 0; i < s.length;) {
    const t = tokens.find(x => s.startsWith(x.s, i));
    if (!t) return '';
    result += String.fromCharCode(65 + t.i);
    i += t.s.length;
  }
  return result;
}

/** @param {string} text @returns {number[][]} */
function printedWords(text) {
  const out = [];
  let current = [];
  for (const ch of text) {
    if (runeMap.has(ch)) current.push(runeMap.get(ch));
    if ((ch === '-' || ch === '.') && current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}
const words = pages.map(printedWords);
for (let p = 0; p < 58; p += 1) {
  const original = words[p].flat();
  assert.deepEqual(original, corpus.pages[p].indices,
    'All GP29 values must match the published reference transcription: p' + p);
}

const controls = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const dictionary = new Set();
for (const file of controls) {
  for (const word of read(file).toUpperCase().match(/[A-Z]+/g) || []) {
    const code = encodeWord(word);
    if (code.length >= 3) dictionary.add(code);
  }
}
assert.equal(dictionary.size, 12140);

const composite = new Uint8Array(120000);
const key = [];
const primes = [];
for (let p = 2; p < composite.length && key.length < 8000; p += 1) {
  if (composite[p]) continue;
  primes.push(p);
  key.push((p - 1) % 29);
  if (p * p < composite.length) {
    for (let q = p * p; q < composite.length; q += p) composite[q] = 1;
  }
}
assert.equal(key.length, 8000);

/**
 * For a fixed prime start, Viterbi-search ALL legal literal-F decisions.
 * State is the number of F skips; prior word content cannot affect future
 * decryption once that count and total native-word coverage are known.
 * A consumed shift that would decode to plaintext F is forbidden.
 *
 * @param {number} physical LP2 page index
 * @param {number} start Prime-index zero-based first consumed key
 * @returns {{covered:number,hits:number}|null}
 */
function bestDecode(physical, start) {
  /** @type {Map<number, {covered:number,hits:number}>} */
  let dp = new Map([[0, { covered: 0, hits: 0 }]]);
  let offset = 0;
  for (const word of words[physical]) {
    /** @type {Map<number, {covered:number,hits:number}>} */
    const next = new Map();
    for (const [skips, previous] of dp) {
      /** @param {number} i @param {number} totalSkips @param {string} code */
      function visit(i, totalSkips, code) {
        if (i === word.length) {
          const hit = dictionary.has(code) ? word.length : 0;
          const covered = previous.covered + hit;
          const hits = previous.hits + (hit ? 1 : 0);
          const old = next.get(totalSkips);
          if (!old || covered > old.covered ||
              (covered === old.covered && hits > old.hits)) {
            next.set(totalSkips, { covered, hits });
          }
          return;
        }
        const cipher = word[i];
        if (cipher === 0) visit(i + 1, totalSkips + 1, code + 'A');
        const plain = (cipher - key[start + offset + i - totalSkips] + 29) % 29;
        if (plain !== 0) visit(i + 1, totalSkips,
          code + String.fromCharCode(65 + plain));
      }
      visit(0, skips, '');
    }
    dp = next;
    offset += word.length;
    if (!dp.size) return null;
  }
  return [...dp.values()]
    .sort((a, b) => b.covered - a.covered || b.hits - a.hits)[0];
}

/** Genuine p56 control: encrypt the authenticated known plaintext, F transparent. */
const solved = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(w => [...encodeWord(w)].map(c => c.charCodeAt(0) - 65));
assert.equal(solved.length, 85);
let used = 0;
const reencrypted = solved.map(p =>
  p === 0 ? 0 : (p + key[used++]) % 29);
assert.deepEqual(reencrypted, corpus.pages[56].indices);
assert.deepEqual(bestDecode(56, 0), { covered: 55, hits: 14 });

const results = [];
for (let physical = 0; physical <= 55; physical += 1) {
  if (!corpus.pages[physical].indices.length) continue;
  let viable = 0;
  let maxCovered = -1;
  let topStarts = [];
  let maxHits = 0;
  for (let start = 0; start < 5000; start += 1) {
    const decoded = bestDecode(physical, start);
    if (!decoded) continue;
    viable += 1;
    if (decoded.covered > maxCovered) {
      maxCovered = decoded.covered;
      maxHits = decoded.hits;
      topStarts = [start];
    } else if (decoded.covered === maxCovered) {
      if (decoded.hits > maxHits) {
        maxHits = decoded.hits;
        topStarts = [start];
      } else if (decoded.hits === maxHits && topStarts.length < 3) {
        topStarts.push(start);
      }
    }
  }
  results.push({
    physical,
    runes: corpus.pages[physical].indices.length,
    printedWords: words[physical].length,
    viablePrimeStarts: viable,
    mostNativeWordRunes: maxCovered,
    matchedWords: maxHits,
    bestPrimeStarts: topStarts
  });
}

assert.equal(results.length, 55);
assert.equal(results.reduce((s, x) => s + x.runes, 0), 12956);
assert.equal(results.reduce((s, x) => s + x.viablePrimeStarts, 0), 9733);
assert.equal(Math.max(...results.map(x => x.mostNativeWordRunes)), 10);
assert.deepEqual(results.filter(x => x.mostNativeWordRunes === 10)
  .map(x => x.physical), [40, 47]);
assert.deepEqual(results.find(x => x.physical === 35),
  { physical: 35, runes: 271, printedWords: 61, viablePrimeStarts: 2,
    mostNativeWordRunes: 3, matchedWords: 1, bestPrimeStarts: [2634] });

console.log(JSON.stringify({
  mode: 'p56 genuine phi(prime), exact plaintext-F bypass, page-local clock',
  primeStartsPerPage: 5000,
  dictionaryNativeGpWordsLengthAtLeastThree: dictionary.size,
  exactOriginalPageTranscription: '58/58',
  authenticatedP56Positive: '55 of 85 GP runes covered by 14 dictionary words',
  unknownRunePages: 55,
  unknownRunes: 12956,
  viablePrimeStarts: 9733,
  maximumUnknownPageNativeWordRunes: 10,
  pages: results,
  decision: 'No authentic unknown-page plaintext found under page-local prime-totient transfer.'
}, null, 2));
