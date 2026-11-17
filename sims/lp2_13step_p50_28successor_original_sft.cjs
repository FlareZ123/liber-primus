'use strict';

/**
 * A source-motivated but unauthenticated, lossless 29-to-29 feedback
 * transport. Step=13 is motivated by the prominent original 13-dot marks.
 * The 256-byte p50 table is used only in its canonical row-major base60
 * interpretation; start at p51, immediately after the table.
 *
 * One symbol after the first emits delta=0 iff the plaintext's current
 * GP index differs from its preceding index by STEP modulo29. Every other
 * GP difference is rotated within the other 28 successor values by a
 * per-position source byte modulo28. This is a true per-symbol bijection,
 * allowing arbitrary repeated pairs, including p27's disjoint doublets.
 *
 * This is a finite test of ONE candidate receiver, not a historical claim.
 * SFT: node sims/lp2_13step_p50_28successor_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const spelling = read('resources/control/english_wordfreq_textblob.txt');
const STEP = 13;
const MOD = 29;
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(corpus.translit.length, MOD);
const runeMap = new Map(corpus.runes.map((symbol, i) => [symbol, i]));
const tokens = corpus.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {number} value @param {number} base @returns {number} */
function mod(value, base) {
  return (value % base + base) % base;
}

/**
 * @param {number[]} plain
 * @returns {number[]}
 */
function encrypt(plain) {
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    if (i === 0) {
      cipher.push(mod(plain[i] + bytes[0], MOD));
      continue;
    }
    const z = mod(plain[i] - plain[i - 1] - STEP, MOD);
    const delta = z === 0 ? 0 : 1 + mod(z - 1 + mod(bytes[i % 256], 28), 28);
    cipher.push(mod(cipher[i - 1] + delta, MOD));
  }
  return cipher;
}

/**
 * @param {number[]} cipher
 * @returns {number[]}
 */
function decrypt(cipher) {
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (i === 0) {
      plain.push(mod(cipher[i] - bytes[0], MOD));
      continue;
    }
    const delta = mod(cipher[i] - cipher[i - 1], MOD);
    const z = delta === 0
      ? 0 : 1 + mod(delta - 1 - mod(bytes[i % 256], 28), 28);
    plain.push(mod(plain[i - 1] + STEP + z, MOD));
  }
  return plain;
}

/** @param {string} s @returns {number[][]} */
function printedWords(s) {
  return (s.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => [...word].map(rune => {
      const index = runeMap.get(rune);
      assert.notEqual(index, undefined);
      return index;
    }));
}

/**
 * Encode independent historical English to native GP29 spelling, identical
 * to the preexisting solved-text Viterbi positive-control normalization.
 * @param {string} word
 * @returns {number[]|null}
 */
function gpWord(word) {
  const value = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let p = 0; p < value.length;) {
    const candidate = tokens.find(t => value.startsWith(t.token, p));
    if (!candidate) return null;
    out.push(candidate.i);
    p += candidate.token.length;
  }
  return out;
}

/** @returns {Set<string>} */
function dictionary() {
  const result = new Set();
  for (const row of spelling.matchAll(/^([a-z]+)\s+\d+$/gm)) {
    const word = gpWord(row[1]);
    if (word) result.add(word.join(','));
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(MOD).fill(0);
  values.forEach(value => counts[value]++);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

const sections = transcription.split(/^\s*%\s*$/gm);
assert.equal(sections.length, 57, 'Runeless p50 is omitted in original text');
const words = printedWords(sections.slice(50, 55).join(''));
const cipher = corpus.pages.filter(p => p.page >= 51 && p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(cipher.length, 842);
assert.equal(words.length, 184);
assert.deepEqual(words.flat(), cipher);

const dictionaryWords = dictionary();
assert.equal(dictionaryWords.size, 29058);
const plain = decrypt(cipher);
assert.deepEqual(encrypt(plain), cipher, 'Original input exact reencryption');
let start = 0;
let supported = 0;
for (const word of words) {
  const segment = plain.slice(start, start + word.length);
  start += word.length;
  supported += Number(dictionaryWords.has(segment.join(',')));
}
assert.equal(start, 842);
assert.equal(supported, 10, 'Locked source p51–55 does not yield native words');

// Truly clear original p57 is an independent native-language positive.
const clear = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clear.length, 95);
assert.deepEqual(decrypt(encrypt(clear)), clear);
const clearWords = printedWords(sections[56]);
assert.deepEqual(clearWords.flat(), clear);
assert.equal(clearWords.length, 20);
const clearKnown = clearWords.filter(w => dictionaryWords.has(w.join(','))).length;
assert.equal(clearKnown, 16);

// Historical p56 known solved plaintext, independently encoded.
const solved = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES ' +
  'TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const solvedPlain = solved.split(' ').flatMap(word => {
  const coded = gpWord(word);
  assert.ok(coded);
  return coded;
});
assert.equal(solvedPlain.length, 85);
assert.deepEqual(decrypt(encrypt(solvedPlain)), solvedPlain);

// Original image witness p27: both disjoint doubles are accepted exactly.
const p27 = corpus.pages.find(p => p.page === 27).indices.slice(79, 91);
assert.deepEqual(p27, [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]);
const doubles = p27.flatMap((x, i) =>
  i && x === p27[i - 1] ? [i] : []);
assert.deepEqual(doubles, [5, 11]);
assert.deepEqual(encrypt(decrypt(p27)), p27);

// The 13-step sentinel would require the original p27 word's plaintext
// difference to equal 13 exactly at indices5 and11, and nowhere else.
const p27Possible = [...dictionaryWords].filter(key => {
  const values = key.split(',').map(Number);
  if (values.length !== p27.length) return false;
  for (let i = 1; i < values.length; i++) {
    if ((mod(values[i] - values[i - 1], MOD) === STEP) !==
        (p27[i] === p27[i - 1])) return false;
  }
  return true;
}).length;
assert.equal(p27Possible, 0, 'Exact 13-step p27 English word-pattern gate');

const report = {
  model: 'Bijection: 13-shifted prior-plaintext delta, 28-way p50 byte rotor',
  originalP27DisjointDoublets: doubles,
  originalP27ExactRoundtrip: true,
  originalPosttableRunes: cipher.length,
  originalPosttablePrintedWords: words.length,
  originalDecodedDictionaryWords: supported,
  originalCipherIoC: ioc(cipher),
  originalDecodedIoC: ioc(plain),
  historicalP56PositiveRoundtrip: solvedPlain.length,
  originalClearP57PositiveRoundtrip: clear.length,
  originalClearP57DictionaryWords: clearKnown,
  originalClearP57PrintedWords: clearWords.length,
  p27DictionaryWordsCompatibleWithStep13: p27Possible,
  conclusion: 'Exact candidate fails as plain native GP English; no authenticated key, original plaintext, or cipher opcode.'
};
if (require.main === module) console.log(JSON.stringify(report, null, 2));
module.exports = { encrypt, decrypt };
