'use strict';

/**
 * Source-native dictionary attack on the simplest reversible GP29 plaintext
 * digraph affine cipher, including word-rekeyed additive constants:
 *
 *   C[w, j] = a*P[w, j] + b*P[w, j-1] + k[w] (mod 29), j >= 1.
 *
 * Cipher word starts C[w, 0] are entirely unconstrained. The pair (a,b)
 * is shared across the entire book; k is either shared or may vary by word.
 * A genuine cipher in this family produces the same (a,b), or (a,b,k),
 * from many independently recovered source-native plaintext words.
 *
 * Uses all 2,896 original printed LP2 words and a frozen three-source GP29
 * English reference lexicon. Windows Node.js 22/CommonJS, read-only.
 * Every result is a bounded test, never proof of a general cipher impossibility.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} filename */
const read = (filename) => fs.readFileSync(path.join(root, filename), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const spellings = corpus.translit.map((token, i) => ({token, index:i}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {number} value @returns {number} */
const mod = (value) => ((value % 29) + 29) % 29;
const inverses = Array.from({length:29}, (_, d) => {
  if (!d) return 0;
  const result = Array.from({length:28}, (_, n) => n + 1).find((x) => (x * d) % 29 === 1);
  assert.notEqual(result, undefined);
  return result;
});

/** @param {string} latin @returns {number[]} */
function gpWord(latin) {
  const s = latin.toUpperCase().replaceAll('QU', 'CW')
    .replaceAll('V', 'U').replaceAll('K', 'C').replaceAll('Z', 'S')
    .replaceAll('ING', 'NG').replaceAll('IO', 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const found = spellings.find((x) => s.startsWith(x.token, i));
    assert.ok(found, 'unmappable source word: ' + latin);
    out.push(found.index);
    i += found.token.length;
  }
  return out;
}

/** @returns {number[][]} */
function originalWords() {
  const out = [];
  let word = [];
  for (const ch of read('resources/liber-primus/lp2-transcription.txt')) {
    const value = runeToIndex.get(ch);
    if (value !== undefined) word.push(value);
    else if ("-.'".includes(ch) && word.length) {
      out.push(word);
      word = [];
    }
  }
  const original = out.slice(0, 2896);
  assert.equal(original.length, 2896);
  assert.deepEqual(original.flat(),
    corpus.pages.slice(0, 56).flatMap((page) => page.indices));
  return original;
}

/**
 * Two original plaintext difference equations yield a key without
 * guessing the first plaintext rune, provided their determinant is nonzero.
 *
 * @param {number[]} p
 * @returns {{p:number[],i:number,j:number,di:number,dj:number,
 *   dprevI:number,dprevJ:number,dInverse:number}|null}
 */
function dictionaryEntry(p) {
  const delta = p.slice(1).map((v, i) => mod(v - p[i]));
  for (let i = 2; i < p.length; i++) {
    for (let j = i + 1; j < p.length; j++) {
      const di = delta[i-1], dj = delta[j-1];
      const dprevI = delta[i-2], dprevJ = delta[j-2];
      const determinant = mod(di*dprevJ - dj*dprevI);
      if (determinant) {
        return {p,i,j,di,dj,dprevI,dprevJ,dInverse:inverses[determinant]};
      }
    }
  }
  return null;
}

/** @returns {{byLength:Map<number,Array<object>>,rankDeficient:number,all:number}} */
function sourceDictionary() {
  const sources = [
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt'
  ];
  const unique = new Map();
  for (const filename of sources) {
    for (const latin of read(filename).match(/[A-Za-z]+/g) || []) {
      const p = gpWord(latin);
      if (p.length < 5 || p.length > 14) continue;
      const word = p.join(',');
      if (!unique.has(word)) unique.set(word, {latin:latin.toUpperCase(),p});
    }
  }
  const byLength = new Map();
  let rankDeficient = 0;
  for (const {latin,p} of unique.values()) {
    const entry = dictionaryEntry(p);
    if (!entry) {
      rankDeficient++;
      continue;
    }
    if (!byLength.has(p.length)) byLength.set(p.length, []);
    byLength.get(p.length).push({...entry,latin});
  }
  return {byLength,rankDeficient,all:unique.size};
}

/** @typedef {{a:number,b:number,k:number}} AffineKey */

/**
 * @param {number[]} c
 * @param {ReturnType<dictionaryEntry> & {latin:string}} donor
 * @returns {AffineKey|null}
 */
function recover(c, donor) {
  const ci = mod(c[donor.i] - c[donor.i-1]);
  const cj = mod(c[donor.j] - c[donor.j-1]);
  const a = mod((ci*donor.dprevJ-cj*donor.dprevI)*donor.dInverse);
  if (a === 0) return null;
  const b = mod((donor.di*cj-donor.dj*ci)*donor.dInverse);
  for (let t = 2; t < c.length; t++) {
    if (mod(c[t]-c[t-1]) !==
      mod(a*(donor.p[t]-donor.p[t-1]) + b*(donor.p[t-1]-donor.p[t-2]))) return null;
  }
  const k = mod(c[1]-a*donor.p[1]-b*donor.p[0]);
  return {a,b,k};
}

/**
 * @param {number[][]} encrypted
 * @param {Map<number,Array<object>>} dictionary
 */
function screen(encrypted, dictionary) {
  const fullCounts = new Uint16Array(29*29*29);
  const pairCounts = new Uint16Array(29*29);
  const examples = new Map();
  let testedPairs = 0, exactWordMatches = 0, wordsWithCandidate = 0;
  for (let i = 0; i < encrypted.length; i++) {
    const c = encrypted[i];
    if (c.length < 5) continue;
    const full = new Set(), pairs = new Set();
    for (const donor of dictionary.get(c.length) || []) {
      testedPairs++;
      const key = recover(c, donor);
      if (key === null) continue;
      exactWordMatches++;
      const pairId = key.a*29 + key.b;
      const fullId = pairId*29 + key.k;
      pairs.add(pairId);
      full.add(fullId);
      if (!examples.has(fullId)) examples.set(fullId, []);
      const records = examples.get(fullId);
      if (records.length < 8) records.push({originalWord:i + 1,latin:donor.latin});
    }
    if (full.size) wordsWithCandidate++;
    for (const key of full) fullCounts[key]++;
    for (const key of pairs) pairCounts[key]++;
  }
  const bestFull = [...fullCounts].map((count, id) => ({
    count, a:Math.floor(id/841), b:Math.floor(id/29)%29,
    k:id%29, examples:examples.get(id) || []
  })).sort((a,b)=>b.count-a.count).slice(0, 8);
  const bestPairs = [...pairCounts].map((count, id) => ({
    count,a:Math.floor(id/29),b:id%29
  })).sort((a,b)=>b.count-a.count).slice(0, 8);
  return {testedPairs,exactWordMatches,wordsWithCandidate,bestFull,bestPairs,
    bestFullCount:bestFull[0].count,bestPairCount:bestPairs[0].count};
}

/** @param {number[][]} template @param {Map<number,Array<object>>} dictionary */
function knownEnglishPlant(template, dictionary) {
  let state = 0x33012026;
  let plantedWords = 0;
  const key = {a:3,b:14,k:9};
  const out = template.map((oldWord) => {
    if (oldWord.length < 5) return oldWord.slice();
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const choices = dictionary.get(oldWord.length);
    assert.ok(choices?.length, 'no source-native donor of required length');
    const p = choices[(state>>>0) % choices.length].p;
    const c = [oldWord[0]];
    for (let i = 1; i < p.length; i++) {
      c.push(mod(key.a*p[i] + key.b*p[i-1] + key.k));
    }
    plantedWords++;
    return c;
  });
  return {out,plantedWords,key};
}

const original = originalWords();
const dictionary = sourceDictionary();
const actual = screen(original, dictionary.byLength);
const plant = knownEnglishPlant(original, dictionary.byLength);
const control = screen(plant.out, dictionary.byLength);
assert.equal(plant.plantedWords, 1132);
assert.equal(control.bestFull[0].a, plant.key.a);
assert.equal(control.bestFull[0].b, plant.key.b);
assert.equal(control.bestFull[0].k, plant.key.k);
assert.equal(control.bestFullCount, 1132);
assert.equal(control.bestPairCount, 1132);
assert.ok(actual.bestFullCount < 20, 'unexpected actual shared affine key');
assert.ok(actual.bestPairCount < 200, 'unexpected actual word-rekeyed affine pair');
process.stdout.write(JSON.stringify({
  title:'original 29-symbol affine plaintext-digraph word dictionary gate',
  originalWords:original.length,
  eligibleOriginalWords:1132,
  dictionaryUniqueWords:dictionary.all,
  dictionaryRankDeficient:dictionary.rankDeficient,
  eligibleDictionaryWords:[...dictionary.byLength.values()].reduce((s,a)=>s+a.length,0),
  model:'C[word,j] = a*P[word,j] + b*P[word,j-1] + k[word] modulo 29 for j>=1; C[word,0] unrestricted',
  original:actual,
  planted:{key:plant.key,plantedWords:plant.plantedWords,
    bestFullCount:control.bestFullCount,bestPairCount:control.bestPairCount}
},null,2) + '\n');
