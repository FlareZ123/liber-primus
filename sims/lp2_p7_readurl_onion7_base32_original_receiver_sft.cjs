'use strict';

/**
 * Source-exact, read-only test of the provisional P7 "READ URL" command.
 * Run from any directory: node sims/lp2_p7_readurl_onion7_base32_original_receiver_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const stage11 = read('resources/historical/cicada2014-stage11-message.asc');
const squaresText = read('resources/cicada2014-openpuff-magic-squares.txt');
const gp = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
  return a.map((row) => b[0].map((_, j) =>
    mod(row.reduce((sum, x, k) => sum + x * b[k][j], 0))));
}

/** @param {number[][]} a @param {number} exponent @returns {number[][]} */
function power(a, exponent) {
  let m = a.map((row, i) => row.map((_, j) => Number(i === j)));
  for (let i = 0; i < exponent; i++) m = multiply(m, a);
  return m;
}

/** @param {number[][]} a @param {number[]} vector @returns {number[]} */
const apply = (a, vector) => a.map((row) =>
  mod(row.reduce((s, x, i) => s + x * vector[i], 0)));
/** @param {number[]} values @returns {string} */
const spell = (values) => values.map((v) => corpus.translit[v]).join('');
/** @param {string} word @returns {number} */
const product = (word) => [...word].reduce((p, x) => mod(p * gp.get(x)), 1);

const matrices = squaresText.trim().split(/\r?\n\s*\r?\n/)
  .map((block) => block.trim().split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map((m) => m.length), [5, 7, 5]);
const a5 = power(matrices[0], 5);
const b5 = power(matrices[2], 5);

const originalP7 = corpus.pages.find((p) => p.page === 7).indices;
const p7Red = ink.pages.find((p) => p.page === 7).red_spans[0];
assert.equal(p7Red.start, 194);
assert.equal(p7Red.length, 14);
assert.equal(originalP7.length, 208);
let sourceRune = 0;
let redPrint = '';
for (const char of transcript.split('%')[7]) {
  if (gp.has(char)) {
    if (sourceRune >= p7Red.start && sourceRune < p7Red.start + p7Red.length) {
      redPrint += char;
    }
    sourceRune++;
  } else if ((char === '-' || char === '.') &&
             sourceRune > p7Red.start &&
             sourceRune <= p7Red.start + p7Red.length) {
    redPrint += char;
  }
}
const redWords = redPrint.split(/[-.]/).filter(Boolean);
const redProducts = redWords.map(product);
assert.equal(redWords.length, 5);
assert.deepEqual(redWords.map((w) => w.length), [2, 4, 3, 2, 3]);
assert.deepEqual(redProducts, [11, 26, 8, 15, 2]);
assert.deepEqual(apply(a5, redProducts), [13, 18, 4, 28, 23]);
assert.deepEqual(apply(b5, redProducts), [1, 4, 20, 14, 21]);
const out10 = apply(a5, redProducts).concat(apply(b5, redProducts));
const center6 = apply(a5, redProducts).slice(2)
  .concat(apply(b5, redProducts).slice(0, 3));
assert.equal(spell(center6), 'READURL');

// Independent full-manuscript receiver: preserve actual line/page-carried words.
const escapedRunes = corpus.runes.join('');
const wordRegex = new RegExp('[' + escapedRunes + ']+', 'gu');
const unwanted = new RegExp('[^' + escapedRunes + '.-]', 'gu');
const originalWords = [...transcript.split('%').slice(0, 55).join('')
  .replace(unwanted, '').matchAll(wordRegex)].map((m) => m[0]);
assert.equal(originalWords.length, 2896);
const values = originalWords.map(product);

// A fixed 3-GP-symbol word lexicon from pinned literary controls. "URL" is
// added because the authentic instruction itself selects this modern term.
const longest = [...corpus.translit].sort((a, b) => b.length - a.length);
/** @param {string} word @returns {number[] | null} */
function gpWord(word) {
  const text = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA')
    .replace(/Q/g, 'CW');
  let at = 0;
  const runes = [];
  while (at < text.length) {
    const piece = longest.find((s) => text.startsWith(s, at));
    if (!piece) return null;
    runes.push(corpus.translit.indexOf(piece));
    at += piece.length;
  }
  return runes;
}
const words3 = new Set();
for (const location of ['resources/control/shakespeare_first300k.txt',
                        'resources/control/gibran_prophet_58585.txt']) {
  for (const found of read(location).toUpperCase().matchAll(/[A-Z]+/g)) {
    const runeWord = gpWord(found[0]);
    if (runeWord && runeWord.length === 3) words3.add(spell(runeWord));
  }
}
words3.add('URL');
assert.equal(words3.size, 336);

const exact = [];
const dictionaryPairs = [];
for (let i = 0; i + 5 <= values.length; i++) {
  const input = values.slice(i, i + 5);
  const left = apply(a5, input).slice(2);
  const right = apply(b5, input).slice(0, 3);
  const text = spell(left.concat(right));
  if (text === 'READURL') exact.push(i);
  if (words3.has(spell(left)) && words3.has(spell(right))) {
    dictionaryPairs.push({word_index: i, text});
  }
}
assert.deepEqual(exact, [408]);
assert.deepEqual(dictionaryPairs, [{word_index: 408, text: 'READURL'}]);

// The original Stage11 Cicada-signed URL is a natural *next source* after
// the conditional instruction. Tor v2 uses 16 Base32 chars = exactly 10 bytes.
const urlMatch = stage11.match(/\b([a-z2-7]{16})\.onion\b/);
assert.ok(urlMatch);
const host = urlMatch[1];
assert.equal(host, 'ky2khlqdf7qdznac');
const base32 = 'abcdefghijklmnopqrstuvwxyz234567';
const digits = [...host].map((c) => base32.indexOf(c));
assert.ok(digits.every((d) => d >= 0));
let carry = 0;
let bits = 0;
const bytes = [];
for (const digit of digits) {
  carry = (carry << 5) | digit;
  bits += 5;
  if (bits >= 8) {
    bits -= 8;
    bytes.push((carry >> bits) & 255);
    carry &= (1 << bits) - 1;
  }
}
assert.equal(bytes.length, 10);
assert.equal(Buffer.from(bytes).toString('hex'), '5634a3ae032fe03cb402');
assert.equal(grid.bytes.length, 256);
const keys = [
  {name: 'url-base32-10-byte-mod29', values: bytes.map((x) => x % 29)},
  {name: 'url-base32-16-digit-mod29', values: digits.map((x) => x % 29)},
  {name: 'red-square-full10', values: out10},
  {name: 'url10-minus-red-square10', values: bytes.map((x, i) => mod(x - out10[i]))},
  {name: 'grid-at-url-byte-indices', values: bytes.map((x) => grid.bytes[x] % 29)},
  {name: 'red-square-central-readurl6', values: center6},
];

/** @param {number[]} ciphertext @param {number[]} key @param {number} sign @returns {number[]} */
const decrypt = (ciphertext, key, sign) =>
  ciphertext.map((x, i) => mod(x + sign * key[i % key.length]));
/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((s, count) => s + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

// A genuine native-GP p57 positive plant for every tested decoder.
const genuine = corpus.pages.find((p) => p.page === 57).indices;
assert.ok(genuine.length >= 95);
const planted = genuine.concat(genuine);
for (const key of keys) {
  for (const sign of [-1, 1]) {
    const ciphertext = planted.map((v, i) =>
      mod(v - sign * key.values[i % key.values.length]));
    assert.deepEqual(decrypt(ciphertext, key.values, sign), planted);
  }
}

const observed = [];
for (const page of [0, 8, 55]) {
  const original = corpus.pages.find((p) => p.page === page).indices;
  for (const key of keys) {
    for (const sign of [-1, 1]) {
      const output = decrypt(original, key.values, sign);
      const body = page === 8 ? output.slice(12) : output;
      observed.push({
        page,
        key: key.name,
        sign,
        ioc: Number(indexOfCoincidence(body).toFixed(8)),
        preview: spell(body.slice(0, 50)),
      });
    }
  }
}
const ranked = [...observed].sort((a, b) => b.ioc - a.ioc);
assert.equal(observed.length, 36);
assert.ok(ranked[0].ioc < 0.041);

console.log(JSON.stringify({
  status: 'NO UNKNOWN-PAGE PLAINTEXT; limited direct-key negative',
  original_words: originalWords.length,
  candidate_windows: originalWords.length - 4,
  exact_readurl_word_index: exact,
  three_gp_dictionary_size: words3.size,
  dictionary_two_word_hits: dictionaryPairs,
  stage11_host: host,
  host_decoded_ten_bytes_hex: Buffer.from(bytes).toString('hex'),
  direct_key_cases: observed.length,
  original_page_max_ioc: ranked[0],
  strongest_six: ranked.slice(0, 6),
  gp_positive_plants: keys.length * 2,
}, null, 2));
