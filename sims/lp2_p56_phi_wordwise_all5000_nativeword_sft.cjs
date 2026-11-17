'use strict';

/**
 * Original LP2 per-printed-word all-5,000-prime-start native-word exclusion.
 * Exact historically solved p56 prime-totient GP29 cipher, plaintext-F bypass;
 * independently unknown prime starting position in every complete word.
 * Read-only, dependency-free, Windows 11 Node.js 22 single-file test.
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

// Independent pre-specified Latin language register, drawn from original
// word-preserving Vulgate source. The encoded source uses 0-9A-S for 0..28.
const latinSymbols = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinLines = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).filter(line => /^[0-9A-S]+$/.test(line));
const latinDictionary = new Set(latinLines.filter(line => line.length >= 3)
  .map(line => [...line].map(ch =>
    String.fromCharCode(65 + latinSymbols.indexOf(ch))).join('')));
assert.equal(latinDictionary.size, 7265);

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
 * Exclude any page-start/end fragments. A fully printed word must be preceded
 * by a visible word delimiter on the same page and also end in one.
 * Page wrapping within an original word does not create a delimiter.
 * @param {string} text
 * @returns {{value:number[],complete:boolean}[]}
 */
function completeWords(text) {
  const result = [];
  let value = [];
  let boundedOnLeft = false;
  for (const ch of text) {
    if (runeMap.has(ch)) value.push(runeMap.get(ch));
    if ((ch === '-' || ch === '.') && value.length) {
      result.push({ value, complete: boundedOnLeft });
      value = [];
      boundedOnLeft = true;
    }
  }
  if (value.length) result.push({ value, complete: false });
  return result;
}
const originals = pages.map(completeWords);
for (let p = 0; p < 58; p += 1) {
  assert.deepEqual(originals[p].flatMap(w => w.value), corpus.pages[p].indices,
    'strict parser/source mismatch p' + p);
}
assert.equal(words.slice(0, 56).reduce((n, page) => n + page.flat().length, 0), 12956);
const chars = Array.from({ length: 29 }, (_, i) => String.fromCharCode(65 + i));

/**
 * A consuming GP29 shift that creates plaintext F is illegal under the
 * historically solved algorithm. Ciphertext F instead admits two branches:
 * literal nonconsuming plaintext F or shifted non-F with key consumption.
 * Return bit 1 for an English whole-word hit, bit 2 for Latin.
 * @param {number[]} cipher
 * @param {number} start
 * @returns {number}
 */
function matchAt(cipher, start) {
  let mask = 0;
  /** @param {number} i @param {number} consumed @param {string} code */
  function descend(i, consumed, code) {
    if (i === cipher.length) {
      if (dictionary.has(code)) mask |= 1;
      if (latinDictionary.has(code)) mask |= 2;
      return;
    }
    const C = cipher[i];
    if (C === 0) descend(i + 1, consumed, code + 'A');
    if (mask === 3) return;
    const P = (C - key[start + consumed] + 29) % 29;
    if (P !== 0) descend(i + 1, consumed + 1, code + chars[P]);
  }
  descend(0, 0, '');
  return mask;
}

/**
 * Exhaustive first-5000 starting primes for a single word. Any causal,
 * arbitrary or independent per-word selector inside this interval is a subset.
 * @param {number[]} cipher
 * @param {number} need bitmask of requested lexicons (1 English, 2 Latin).
 * @returns {{mask:number,englishStart:number|null,latinStart:number|null}}
 */
function scan(cipher, need = 3) {
  let mask = 0;
  let englishStart = null;
  let latinStart = null;
  for (let start = 0; start < 5000 && (mask & need) !== need; start += 1) {
    const found = matchAt(cipher, start);
    if ((found & 1) && englishStart === null) englishStart = start;
    if ((found & 2) && latinStart === null) latinStart = start;
    mask |= found;
  }
  return { mask, englishStart, latinStart };
}

/** Exact independent p56 solved-plaintext GP29 original-cipher positive. */
const solved = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(w => [...encodeWord(w)].map(c => c.charCodeAt(0) - 65));
assert.equal(solved.length, 85);
let consumed = 0;
const p56Cipher = solved.map(p => p === 0 ? 0 : (p + key[consumed++]) % 29);
assert.deepEqual(p56Cipher, corpus.pages[56].indices,
  'authentic solved p56 must reencrypt exactly');

const allLong = [];
const counts = new Map();
let strictThreePlus = 0;
for (let page = 0; page < 56; page += 1) {
  for (let index = 0; index < originals[page].length; index += 1) {
    const word = originals[page][index];
    if (!word.complete || word.value.length < 3) continue;
    strictThreePlus += 1;
    const size = word.value.length;
    const result = scan(word.value);
    if (!counts.has(size)) counts.set(size, { n: size, total: 0, english: 0, latin: 0 });
    const row = counts.get(size);
    row.total += 1;
    if (result.mask & 1) row.english += 1;
    if (result.mask & 2) row.latin += 1;
    if (size >= 6) allLong.push({ page, index, size, result, cipher: word.value });
  }
}
assert.equal(strictThreePlus, 2315);
const observed = [...counts.values()].sort((a, b) => a.n - b.n);
const expected = [
  [3, 711, 711, 711], [4, 503, 498, 432], [5, 311, 100, 60],
  [6, 247, 8, 0], [7, 213, 0, 0], [8, 153, 0, 0],
  [9, 76, 0, 0], [10, 49, 0, 0], [11, 28, 0, 0],
  [12, 18, 0, 0], [13, 3, 0, 0], [14, 3, 0, 0]
];
assert.deepEqual(observed.map(x => [x.n, x.total, x.english, x.latin]), expected);
assert.equal(allLong.length, 790);
assert.equal(allLong.filter(w => w.result.mask & 1).length, 8);
assert.equal(allLong.filter(w => w.result.mask & 2).length, 0);
assert.equal(allLong.filter(w => w.size >= 7 && (w.result.mask & 3)).length, 0);

/** Source-red ink is an exceptional register; isolate the black-only conclusion. */
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const redByPage = new Map(ink.pages.map(x => [x.page, x.red_spans || []]));
let blackLong = 0;
let blackLongSeven = 0;
let redLong = 0;
for (let page = 0; page < 56; page += 1) {
  let offset = 0;
  for (const word of originals[page]) {
    const start = offset;
    offset += word.value.length;
    if (!word.complete || word.value.length < 6) continue;
    const colored = (redByPage.get(page) || []).some(span =>
      span.start < start + word.value.length && start < span.start + span.length);
    if (colored) redLong += 1;
    else {
      blackLong += 1;
      if (word.value.length >= 7) blackLongSeven += 1;
    }
  }
}
assert.deepEqual([blackLong, blackLongSeven, redLong], [782, 537, 8]);

/** A full-length source-native positive at EACH of 790 exact original sizes. */
const firstEnglishByLength = new Map();
for (const code of dictionary) {
  if (!firstEnglishByLength.has(code.length)) firstEnglishByLength.set(code.length, code);
}
let plants = 0;
let plantedConsumingCipherF = 0;
let plantedLiteralPlainF = 0;
for (let index = 0; index < allLong.length; index += 1) {
  const item = allLong[index];
  const source = firstEnglishByLength.get(item.size);
  assert(source, 'missing independent GP word of size ' + item.size);
  const plain = [...source].map(x => x.charCodeAt(0) - 65);
  const start = (137 * index + 43) % 5000;
  let step = 0;
  const cipher = plain.map(p => p === 0 ? 0 : (p + key[start + step++]) % 29);
  for (let j = 0; j < plain.length; j += 1) {
    if (plain[j] === 0) plantedLiteralPlainF += 1;
    else if (cipher[j] === 0) plantedConsumingCipherF += 1;
  }
  assert(matchAt(cipher, start) & 1, 'positive must invert at true prime start');
  assert(scan(cipher, 1).mask & 1, 'any-start scan must find planted native GP word');
  plants += 1;
}
assert.equal(plants, 790);
assert(plantedConsumingCipherF > 0, 'positive must exercise consuming cipher-F branch');
assert(plantedLiteralPlainF > 0, 'positive must exercise literal nonconsuming F');

console.log(JSON.stringify({
  mode: 'independently arbitrary 0..4999 prime index for every original printed whole word',
  originalRunePages: 55,
  originalRunes: 12956,
  exactSourcePages: 58,
  strictPrintedWordsLengthAtLeastThree: strictThreePlus,
  originalPrintedWordsLengthAtLeastSix: allLong.length,
  originalCompleteWordsLengthAtLeastSeven: allLong.filter(w => w.size >= 7).length,
  blackOnlyWordsLengthAtLeastSix: blackLong,
  blackOnlyWordsLengthAtLeastSeven: blackLongSeven,
  redOverlappingLongWords: redLong,
  nativeEnglishDictionarySize: dictionary.size,
  nativeLatinDictionarySize: latinDictionary.size,
  documentedP56CipherReencrypted: '85/85 original runes',
  independentlyKeyedNativeEnglishPlants: plants,
  consumingCipherFCasesInPlants: plantedConsumingCipherF,
  literalPlainFCasesInPlants: plantedLiteralPlainF,
  originalEnglishHitsLengthAtLeastSix: 8,
  originalLatinHitsLengthAtLeastSix: 0,
  originalAnyHitsLengthAtLeastSeven: 0,
  byLength: observed,
  sixRuneEnglishHits: allLong.filter(w => w.result.mask & 1)
    .map(w => ({ page: w.page, word: w.index, phase: w.result.englishStart })),
  decision: 'No complete GP-native English/Latin long-word plaintext is possible in this fixed 5000-start per-word p56 transfer.'
}, null, 2));
