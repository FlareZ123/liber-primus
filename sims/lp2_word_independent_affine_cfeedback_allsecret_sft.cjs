'use strict';

/**
 * Exact original-word inverse gate for the most permissive simple GP29
 * one-step affine ciphertext-feedback cipher:
 *
 * C[w,j] = (a_w*C[w,j-1] + b_w*P[w,j] + z_w) mod29, C[w,-1]=0.
 *
 * Each printed word receives its OWN unknown a_w in GF29, b_w in GF29*
 * and z_w in GF29. No key reuse, page phase or guessed rune key.
 * The original's 343 printed words with 8..14 GP symbols are compared
 * against the fixed, native-spelled 29,157-word English dictionary.
 *
 * Every nonzero b forces z from the first glyph; the first nonzero
 * preceding-ciphertext value then forces a. Exhausts every 23,548-key
 * space without a key search or a guessed plaintext.
 *
 * SFT: node sims/lp2_word_independent_affine_cfeedback_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const alphabet = new Map(gp.runes.map((value, index) => [value, index]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const text = transcription.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const printed = (text.match(runePattern) || [])
  .map(word => Array.from(word, ch => alphabet.get(ch)));
assert.equal(printed.length, 2896);
assert.equal(printed.reduce((s, w) => s + w.length, 0), 12956);

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
const inverse = Array(29).fill(0);
for (let n = 1; n < 29; n++)
  for (let m = 1; m < 29; m++)
    if (n * m % 29 === 1) { inverse[n] = m; break; }
assert(inverse.slice(1).every(x => x > 0));

const tokens = gp.translit.map((str, idx) => ({str, idx}))
  .sort((a, b) => b.str.length - a.str.length);
/** @param {string} original @returns {number[]} */
function native(original) {
  const s = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const runes = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { runes.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { runes.push(27); i += 2; }
    else {
      const tok = tokens.find(x => s.startsWith(x.str, i));
      assert(tok, 'unmapped source-native spelling: ' + original);
      runes.push(tok.idx);
      i += tok.str.length;
    }
  }
  return runes;
}

const words = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => line.split(' ')[0]);
assert.equal(words.length, 29157);
const byLength = new Map();
for (const word of words) {
  const p = native(word);
  if (!byLength.has(p.length)) byLength.set(p.length, []);
  byLength.get(p.length).push({word, p});
}

/**
 * Find one of ALL independently secret affine ciphertext-feedback keys.
 * The first ciphertext glyph fixes z for a chosen b; the first nonzero
 * preceding ciphertext glyph fixes a. If none exists, a=0 is sufficient.
 * Both equations are then checked against the entire source ciphertext.
 * @param {number[]} c Original or planted ciphertext
 * @param {number[]} p Proposed plaintext of identical length
 * @returns {{a:number,b:number,z:number}|null}
 */
function infer(c, p) {
  assert.equal(c.length, p.length);
  const n = c.length;
  let first = 1;
  while (first < n && c[first - 1] === 0) first++;
  for (let b = 1; b < 29; b++) {
    const z = mod(c[0] - b * p[0]);
    const a = first < n
      ? mod((c[first] - b * p[first] - z) * inverse[c[first - 1]])
      : 0;
    let fits = true;
    for (let j = 0; j < n; j++)
      if (mod(a * (j ? c[j - 1] : 0) + b * p[j] + z) !== c[j]) {
        fits = false;
        break;
      }
    if (fits) return {a, b, z};
  }
  return null;
}

/** @param {number[]} p @param {{a:number,b:number,z:number}} key */
function encrypt(p, key) {
  const out = [];
  for (const v of p) {
    out.push(mod(key.a * (out.length ? out[out.length - 1] : 0)
      + key.b * v + key.z));
  }
  return out;
}

/** @param {number[]} c @param {{a:number,b:number,z:number}} key */
function decrypt(c, key) {
  return c.map((v, j) => mod((v - key.a * (j ? c[j - 1] : 0)
    - key.z) * inverse[key.b]));
}

const census = [];
let originalHits = 0;
let plantedRecovered = 0;
let targetIndex = 0;
for (let length = 8; length <= 14; length++) {
  const ciphertexts = printed.filter(w => w.length === length);
  const lexicon = byLength.get(length);
  let hits = 0;
  for (const cipher of ciphertexts)
    for (const candidate of lexicon)
      if (infer(cipher, candidate.p) !== null) hits++;
  // The positive plants test a completely unrelated key EACH word.
  for (let i = 0; i < ciphertexts.length; i++) {
    const p = lexicon[(i * 37 + length * 19) % lexicon.length].p;
    const key = {
      a: (targetIndex * 7 + 3) % 29,
      b: 1 + (targetIndex * 11) % 28,
      z: (targetIndex * 13 + 4) % 29
    };
    const c = encrypt(p, key);
    assert.deepEqual(decrypt(c, key), p);
    const inferred = infer(c, p);
    assert(inferred, 'planted native-English feedback preimage absent');
    assert.deepEqual(decrypt(c, inferred), p);
    plantedRecovered++;
    targetIndex++;
  }
  originalHits += hits;
  census.push({length, originalWords: ciphertexts.length,
    dictionaryWords: lexicon.length, compatiblePairs: hits});
}
assert.deepEqual(census.map(x => x.originalWords),
  [156, 78, 52, 32, 18, 4, 3]);
assert.deepEqual(census.map(x => x.dictionaryWords),
  [4331, 3409, 2392, 1453, 772, 382, 155]);
assert.equal(targetIndex, 343);
assert.equal(plantedRecovered, 343);
assert.equal(originalHits, 0);

console.log(JSON.stringify({
  model: 'C[j]=a[word]*C[j-1]+b[word]*P[j]+z[word] mod29; C[-1]=0',
  keyOptionsPerWord: 29 * 28 * 29,
  originalRunes: 12956, originalPrintedWords: 2896,
  nativeDictionaryWords: 29157, census,
  originalEnglishCandidatePairs: originalHits,
  allIndependentWordKeyPositive: {recovered: plantedRecovered, total: 343},
  originalUnknownPlaintextRecovered: 0,
  scope: 'one source-native dictionary word per unchanged printed word; full-key affine one-back ciphertext feedback, no F bypass'
}, null, 2));
