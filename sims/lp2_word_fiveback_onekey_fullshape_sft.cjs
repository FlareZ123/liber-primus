'use strict';

/**
 * Original LP2 word-reset five-back additive feedback with one completely
 * independent and arbitrary 29! alphabet per printed word.
 *
 * The cipher is C[j]=pi(P[j]) for j<5 and
 * C[j]=(C[j-5]+pi(P[j])) mod29 for j>=5.
 *
 * The full observable word D[j]=C[j] (j<5), else C[j]-C[j-5] mod29,
 * is precisely pi(P[j]); consequently its complete equality pattern must
 * occur in a same-length native GP word for some unknown secret alphabet.
 * This gives a key-independent necessary AND sufficient word compatibility
 * test. It is stronger than only comparing equality pairs at j>=5.
 *
 * Node.js 22, CommonJS, original unchanged source, no third-party packages.
 * Single-file research test: node sims/lp2_word_fiveback_onekey_fullshape_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tr = read('resources/liber-primus/lp2-transcription.txt');
const map = new Map(gp.runes.map((g, i) => [g, i]));
const reg = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const words = (tr.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '').match(reg) || [])
  .map(s => Array.from(s, c => map.get(c)));
const original = gp.pages.filter(p => p.page < 56 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.equal(gp.pages.filter(p => p.page < 56 && p.indices.length).length, 55);
assert.deepEqual(words.flat(), original);

/** @param {number[]} c @returns {number[]} */
function invertFeedback(c) {
  return c.map((v, j) => j < 5 ? v : (v - c[j - 5] + 29) % 29);
}
/** @param {number[]} a @returns {string} */
function pattern(a) {
  const seen = new Map();
  return a.map(v => {
    if (!seen.has(v)) seen.set(v, seen.size);
    return String.fromCharCode(65 + seen.get(v));
  }).join('');
}
const dictionary = Array.from({length: 15}, () => new Set());
const nativeByLength = Array.from({length: 15}, () => []);
/** @param {number[]} a */
function addNative(a) {
  if (a.length < 1 || a.length > 14) return;
  const tag = pattern(a);
  if (!dictionary[a.length].has(tag)) {
    dictionary[a.length].add(tag);
    nativeByLength[a.length].push(a);
  }
}
const spelling = read('resources/control/english_wordfreq_textblob.txt');
for (const word of spelling.match(/^[a-zA-Z]+/gm) || [])
  addNative(encodeSourceNativeGP(word));
for (const file of [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
]) {
  for (const word of read(file).match(/[A-Za-z]+/g) || [])
    addNative(encodeSourceNativeGP(word));
}
const englishOnly = dictionary.map((d, n) =>
  words.filter(w => w.length === n && !d.has(pattern(invertFeedback(w)))).length);
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
for (const line of read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/)) {
  if (/^[0-9A-S]+$/.test(line))
    addNative(Array.from(line, c => alphabet.indexOf(c)));
}
const counts = Array.from({length: 15}, (_, n) => {
  const subset = words.filter(w => w.length === n);
  const matches = subset.filter(w =>
    dictionary[n].has(pattern(invertFeedback(w)))).length;
  return {length: n, slots: subset.length, compatible: matches,
    incompatible: subset.length - matches,
    availableNativeShapes: dictionary[n].size};
});
assert.deepEqual(counts.map(x => x.slots),
  [0,83,448,720,513,317,256,216,156,78,52,32,18,4,3]);
assert.deepEqual(englishOnly,
  [0,0,0,0,0,0,1,1,4,6,17,13,12,4,3]);
assert.deepEqual(counts.map(x => x.incompatible),
  [0,0,0,0,0,0,0,1,4,5,17,12,11,4,3]);

// Each of the seven source-printed words of length 13 or 14 is impossible
// in either reference register for every possible 29! secret word alphabet.
const witnesses = [];
for (let i = 0; i < words.length; i++) {
  const c = words[i];
  if (c.length < 12 ||
      dictionary[c.length].has(pattern(invertFeedback(c)))) continue;
  witnesses.push({wordIndex: i, length: c.length,
    residualShape: pattern(invertFeedback(c))});
}
assert.equal(witnesses.filter(x => x.length >= 13).length, 7);
assert.equal(witnesses.filter(x => x.length === 12).length, 11);

// Source-native exact secret-key plants use the original 2,896 word lengths
// and independent random 29! keys for every word, including words spanning
// original printed physical-page/line boundaries.
/** @param {number} seed @returns {() => number} */
function random(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) +
    1013904223) >>> 0) / 4294967296);
}
const rng = random(0x22f15e26);
let recovered = 0, lexical = 0;
for (const sourceWord of words) {
  const pool = nativeByLength[sourceWord.length];
  assert(pool.length > 0);
  const p = pool[Math.floor(rng() * pool.length)];
  const pi = Array.from({length: 29}, (_, i) => i);
  for (let j = 28; j > 0; j--) {
    const k = Math.floor(rng() * (j + 1));
    [pi[j], pi[k]] = [pi[k], pi[j]];
  }
  const cipher = [];
  for (let j = 0; j < p.length; j++)
    cipher.push(j < 5 ? pi[p[j]] : (cipher[j - 5] + pi[p[j]]) % 29);
  const residual = invertFeedback(cipher);
  const inverse = Array(29);
  for (let i = 0; i < 29; i++) inverse[pi[i]] = i;
  const decrypted = residual.map(x => inverse[x]);
  assert.deepEqual(decrypted, p);
  assert(dictionary[p.length].has(pattern(residual)));
  recovered += p.length;
  lexical++;
}
assert.equal(recovered, 12956);
assert.equal(lexical, 2896);

// An actual, independently solved native-register page (PARABLE, p57)
// is also encrypted and inverted wordwise with a fresh secret alphabet.
const clearP57 = (tr.split('%').at(-1) || '').match(reg) || [];
assert.equal(clearP57.reduce((n, w) => n + w.length, 0), 95);
let clearRecovered = 0;
for (const word of clearP57) {
  const p = Array.from(word, c => map.get(c));
  const pi = Array.from({length: 29}, (_, i) => (i + 7) % 29);
  const cipher = [];
  for (let j = 0; j < p.length; j++)
    cipher.push(j < 5 ? pi[p[j]] : (pi[p[j]] + cipher[j - 5]) % 29);
  const output = invertFeedback(cipher).map(v => (v + 22) % 29);
  assert.deepEqual(output, p);
  clearRecovered += p.length;
}
assert.equal(clearRecovered, 95);

console.log(JSON.stringify({
  status: 'word-fresh five-back single-bijection excluded for same-length native words; no original plaintext recovered',
  originalRunes: original.length,
  originalWords: words.length,
  originalShapeTable: counts.filter(x => x.slots && x.length >= 6),
  englishOnlyLongObstructions: englishOnly.slice(8).reduce((a,b)=>a+b,0),
  englishAndLatinLongObstructions:
    counts.slice(8).reduce((n,x)=>n+x.incompatible,0),
  length13To14OriginalSlots: 7,
  length13To14NativeMatches: 0,
  strongestOriginalWitnesses: witnesses,
  plantedSecretAlphabets: lexical,
  plantedOriginalShapeRunesRecovered: recovered,
  independentlySolvedP57RunesRecovered: clearRecovered
}, null, 2));
