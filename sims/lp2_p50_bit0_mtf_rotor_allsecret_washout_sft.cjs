'use strict';

/**
 * Original LP2 p50 printed-bit0-governed, dynamically ordered 29-rune
 * move-to-front alphabet with entirely secret initial key.
 *
 * Exact finite all-key result: a ciphertext-driven MTF alphabet forgets
 * every initial permutation once all 29 symbols have appeared. The original
 * full source cover occurs after the 163rd ciphertext rune, so the latter
 * 12,793 decoded runes are independent of all 29! initial alphabets.
 *
 * This is a HYPOTHETICAL reversible source-readable extension of the
 * 2026-11-22 p50 bit0 lag1/lag5 conditional association. Neither Cicada
 * nor the printed table selects MTF or the forbidden-rune-F exception.
 *
 * Node.js 22, Windows 11, CommonJS built-ins, read-only:
 *   node sims/lp2_p50_bit0_mtf_rotor_allsecret_washout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const original = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(original.length, 12956);
assert.equal(table.bytes.length, 256);
const words = Array(original.length).fill(0);
const raw = read('resources/lp2-transcription.txt');
let word = [];
let offset = 0;
let wordCount = 0;
for (const part of raw.split('%').slice(0, 55)) {
  for (const glyph of part) {
    if (/[\u16a0-\u16ff]/u.test(glyph)) {
      word.push(offset++);
    } else if (glyph === '/' || /\s/u.test(glyph)) {
      continue;
    } else if (word.length) {
      word.forEach((index, j) => { words[index] = j; });
      word = [];
      wordCount++;
    }
  }
}
if (word.length) {
  word.forEach((index, j) => {words[index] = j;});
  wordCount++;
}
assert.equal(offset, original.length);
assert.equal(wordCount, 2896);

/**
 * Reproduce original previously nominated bit0 event rule:
 * even printed byte chooses within-word lag5 if available; otherwise lag1.
 * Exact global cell clock: predecessor rune's 0-based index modulo256.
 * @param {number} i @param {number[]} prior
 * @param {number[]} bytes @returns {number}
 */
function forbidden(i, prior, bytes) {
  const phase = (i + 255) & 255;
  const lag = (bytes[phase] & 1) === 0 && words[i] >= 5 ? 5 : 1;
  return i >= lag ? prior[i - lag] : 0;
}
/** @param {number[]} alphabet @param {number} rune */
function moveFront(alphabet, rune) {
  const index = alphabet.indexOf(rune);
  assert(index >= 0);
  alphabet.splice(index, 1);
  alphabet.unshift(rune);
}
/**
 * Unknown original 29!-alphabet is allowed. Ordinary GP symbols 1..28
 * select their index in the MTF-ordered alphabet with the forbidden rune
 * removed. GP F (0) emits the forbidden rune as a transparent exception.
 * Invertible because the MTF state is updated from observed ciphertext.
 * @param {number[]} plaintext @param {number[]} initial
 * @param {number[]} bytes @returns {number[]}
 */
function encrypt(plaintext, initial, bytes) {
  const alphabet = initial.slice(), ciphertext = [];
  for (let i = 0; i < plaintext.length; i++) {
    const f = forbidden(i, ciphertext, bytes);
    const rune = plaintext[i] === 0 ? f :
      alphabet.filter(x => x !== f)[plaintext[i] - 1];
    assert(Number.isInteger(rune));
    ciphertext.push(rune);
    moveFront(alphabet, rune);
  }
  return ciphertext;
}
/**
 * @param {number[]} ciphertext @param {number[]} initial
 * @param {number[]} bytes
 * @returns {{plaintext:number[], cover:number|null}}
 */
function decrypt(ciphertext, initial, bytes) {
  const alphabet = initial.slice(), plaintext = [];
  const seen = new Set();
  let cover = null;
  for (let i = 0; i < ciphertext.length; i++) {
    const rune = ciphertext[i], f = forbidden(i, ciphertext, bytes);
    plaintext.push(rune === f ? 0 :
      alphabet.filter(x => x !== f).indexOf(rune) + 1);
    moveFront(alphabet, rune);
    seen.add(rune);
    if (cover === null && seen.size === 29) cover = i + 1;
  }
  return {plaintext, cover};
}
/** @param {number[]} seq @returns {{n:number, F:number, IoC:number}} */
function stat(seq) {
  const counts = Array(29).fill(0);
  for (const rune of seq) counts[rune]++;
  return {n: seq.length, F: counts[0],
    IoC: counts.reduce((sum, v) => sum + v * (v - 1), 0) /
      (seq.length * (seq.length - 1))};
}

let state = 0x33012014;
/** @returns {number} */
function rng() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {number[]} a @returns {number[]} */
function shuffle(a) {
  const result = a.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const natural = Array.from({length: 29}, (_, i) => i);
const secret = shuffle(natural);
const shuffledTable = shuffle(table.bytes);

// Source-native English plant uses the canonical pinned GP29 orthography
// routine shared with Agent18's solved-page positive controls.
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const native = encodeSourceNativeGP(
  read('resources/control/shakespeare_first300k.txt')
).slice(0, original.length);
assert.equal(native.length, 12956);
const plant = encrypt(native, secret, table.bytes);
const genuine = decrypt(plant, secret, table.bytes);
assert.deepEqual(genuine.plaintext, native);
assert.equal(genuine.cover, 525);
const wrongTable = decrypt(plant, secret, shuffledTable);
const wrongMatches = wrongTable.plaintext.filter((r, i) => r === native[i])
  .length;
assert.equal(wrongMatches, 12768);
assert(wrongMatches < native.length);
assert.deepEqual(encrypt(genuine.plaintext, secret, table.bytes), plant);

// Original unknown LP2: compare TWO incompatible secret initial alphabets.
const decodedA = decrypt(original, natural, table.bytes);
const decodedB = decrypt(original, secret, table.bytes);
assert.equal(decodedA.cover, 163);
assert.equal(decodedB.cover, 163);
assert.deepEqual(decodedA.plaintext.slice(163), decodedB.plaintext.slice(163));
const disagreements = decodedA.plaintext.filter(
  (r, i) => r !== decodedB.plaintext[i]).length;
assert.equal(disagreements, 27);
assert.deepEqual(encrypt(decodedA.plaintext, natural, table.bytes), original);
assert.deepEqual(encrypt(decodedB.plaintext, secret, table.bytes), original);
const realWrong = decrypt(original, natural, shuffledTable);

// MTF state theorem:
// S_after_i = distinct ciphertext symbols in descending last-seen order,
// followed by unobserved ciphertext symbols in initial-key relative order.
// Once all 29 source symbols have been observed, the unobserved tail is empty,
// hence all 29! possible secret initial alphabets produce IDENTICAL plaintext
// for every later i. Two-key equality is a diagnostic; the proof covers all.
const book = stat(decodedA.plaintext.slice(163));
assert(book.IoC < 0.040);
const chapterRanges = [
  ['p0–2', 0, 729], ['p3–7', 729, 1874], ['p8–14', 1874, 3603],
  ['p15–22', 3603, 5506], ['p23–26', 5506, 6527],
  ['p27–32', 6527, 7960], ['p33–39', 7960, 9640],
  ['p40–53', 9640, 12648], ['p54–55', 12648, 12956]
];
const chapterStats = chapterRanges.map(([name, begin, end]) => ({
  name, ...stat(decodedA.plaintext.slice(begin, end))
}));
assert(chapterStats.slice(1).every(s => s.IoC < 0.040));
console.log(JSON.stringify({
  verdict: 'All 29! initial secret alphabets collapse to one nonprose ' +
    'decoded suffix by original rune 163 under the source-parity, ' +
    'ciphertext-driven MTF rank-28 exception architecture',
  source: {runes:original.length, words:wordCount,
    tableCells: table.bytes.length, tablePhase:0,
    bit:0, forbiddenEven:5, forbiddenOdd:1},
  secretIndependentSuffixStart: 163,
  secretIndependentSuffixLength: original.length - 163,
  initialKeyDisagreementsBeforeCover: disagreements,
  original: {source:stat(original),
    decodedWithNaturalInitial:stat(decodedA.plaintext),
    noInitialKeyInfluence:book, chapters:chapterStats,
    wrongByteTable:stat(realWrong.plaintext)},
  nativeEnglishPlant: {source:stat(native),
    nativeRecovered: genuine.plaintext.length,
    exactRecovered: true, initialSecretEntries:29,
    ciphertextAllSymbolCover:genuine.cover,
    shuffledTableMatches:wrongMatches,
    shuffledTableMismatches:native.length - wrongMatches},
  claimScope: 'Exact all-secret initial permutation rejection of one ' +
    'evolving, global MTF state model. Does not select MTF as authored, ' +
    'exclude other evolving transforms, or recover unknown plaintext.'
}, null, 2));
