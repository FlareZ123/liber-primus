'use strict';

/**
 * Direct source-specified Ephemerella ignita GP29 key inverse, LP2 p24–p26.
 * CommonJS Node.js22. All original strings and citations are pinned in repo.
 *
 * Six non-tuned clock/direction interpretations of a species name used as a
 * 17-GP-rune historical Vigenere key: repeating, plaintext autokey, and
 * ciphertext autokey. Three natural source page-reset choices, two signs,
 * and a diagnostic literal-ciphertext-F skip yield 36 fixed tests.
 *
 * F skip is NOT claimed equivalent to the solved p56 plaintext-F exception.
 * No guessed key phase, word split, name variant or password mutation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const alphabet = new Map(corpus.translit.map((x, i) => [x.toLowerCase(), i]));
const digraphs = ['th', 'ng', 'eo', 'oe', 'ae', 'ia', 'ea'];
const mod = n => ((n % 29) + 29) % 29;
/** @param {string} word */
function gp(word) {
  const normalized = word.toLowerCase().replace(/qu/g, 'cw')
    .replace(/v/g, 'u').replace(/[kq]/g, 'c').replace(/z/g, 's')
    .replace(/ing/g, 'ng').replace(/io/g, 'ia');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const token = digraphs.find(x => normalized.startsWith(x, i)) ||
      normalized[i];
    const value = alphabet.get(token);
    if (value === undefined) return null;
    result.push(value);
    i += token.length;
  }
  return result;
}
const key = gp('ephemerellaignita');
assert.equal(key.length, 17);
assert.deepEqual(key, [18,13,8,18,19,18,4,18,20,20,24,10,6,9,10,16,24]);

const pages = [23, 24, 25, 26].map(page => {
  let start = 0;
  const words = [...segments[page].replace(/\/\s*/g, '')
    .matchAll(/[\u16a0-\u16ff]+/g)].map(match => {
      const value = [...match[0]].map(r => corpus.runes.indexOf(r));
      const word = {start, length:value.length};
      start += value.length;
      return word;
    });
  const original = corpus.pages[page].indices;
  assert.equal(start, original.length);
  assert.deepEqual(original.map(v => corpus.runes[v]).join(''),
    segments[page].replace(/[^ᚠ-ᛟ]/g, ''));
  return {page, words, original};
});
assert.deepEqual(pages.map(x => x.original.length), [213,270,273,265]);
assert.equal(pages.slice(1).reduce((sum,p) => sum + p.words.length - 1,0), 178);

// Fixed source-native spelling register, long words are decisive.
const dictionary = new Set();
const choices = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)/.exec(line);
  if (!match) continue;
  const word = gp(match[1]);
  if (!word) continue;
  dictionary.add(word.join(','));
  if (!choices.has(word.length)) choices.set(word.length, []);
  choices.get(word.length).push(word);
}
for (const spelling of ['a', 'i', 'o']) {
  const word = gp(spelling);
  dictionary.add(word.join(','));
  if (!choices.has(word.length)) choices.set(word.length, []);
  choices.get(word.length).push(word);
}
assert.equal(dictionary.size, 29060);

/**
 * @param {number[][]} ciphertext 4 source page rune streams p23–p26
 * @param {{flavor:string,clock:string,sign:number,skip:boolean}} opts
 */
function decrypt(ciphertext, opts) {
  let history = [];
  const output = [];
  for (let j = 0; j < pages.length; j++) {
    const page = pages[j].page;
    if (opts.clock === 'page' || (opts.clock === 'p24' && page === 24)) {
      history = [];
    }
    const plain = [];
    for (const c of ciphertext[j]) {
      if (opts.skip && c === 0) {
        plain.push(0);
        continue;
      }
      const index = history.length;
      const k = opts.flavor === 'periodic'
        ? key[index % key.length]
        : index < key.length
          ? key[index]
          : opts.flavor === 'plain'
            ? history[index - key.length].plain
            : history[index - key.length].cipher;
      const p = mod(c + opts.sign * k);
      plain.push(p);
      history.push({cipher:c, plain:p});
    }
    output.push(plain);
  }
  return output;
}

/**
 * @param {number[][]} plaintext Four source page streams
 * @param {{flavor:string,clock:string,sign:number,skip:boolean}} opts
 */
function encrypt(plaintext, opts) {
  assert.equal(opts.skip, false, 'planted full-clock tests only');
  let history = [];
  const output = [];
  for (let j = 0; j < pages.length; j++) {
    const page = pages[j].page;
    if (opts.clock === 'page' || (opts.clock === 'p24' && page === 24)) {
      history = [];
    }
    const cipher = [];
    for (const p of plaintext[j]) {
      const index = history.length;
      const k = opts.flavor === 'periodic'
        ? key[index % key.length]
        : index < key.length
          ? key[index]
          : opts.flavor === 'plain'
            ? history[index - key.length].plain
            : history[index - key.length].cipher;
      const c = mod(p - opts.sign * k);
      cipher.push(c);
      history.push({cipher:c, plain:p});
    }
    output.push(cipher);
  }
  return output;
}
/** @param {number[][]} decrypted */
function score(decrypted) {
  let hits = 0, longWords = 0, maxRun = 0;
  const byPage = [];
  for (let j = 1; j < pages.length; j++) {
    let hitsPage = 0, longsPage = 0, run = 0, maxRunPage = 0;
    const words = pages[j].words;
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const value = decrypted[j].slice(word.start, word.start+word.length);
      if (dictionary.has(value.join(','))) {
        hitsPage++; run++;
        if (word.length >= 4) longsPage++;
        maxRunPage = Math.max(maxRunPage, run);
      } else run = 0;
    }
    hits += hitsPage; longWords += longsPage;
    maxRun = Math.max(maxRun, maxRunPage);
    byPage.push({page:pages[j].page,hits:hitsPage,longWords:longsPage,
      maximumAdjacentWords:maxRunPage});
  }
  return {hits,longWords,maxRun,byPage};
}
const configurations = [];
for (const flavor of ['periodic','plain','cipher'])
  for (const clock of ['page','p24','p23'])
    for (const sign of [-1,1])
      for (const skip of [false,true])
        configurations.push({flavor,clock,sign,skip});
assert.equal(configurations.length,36);
const originals = pages.map(x => x.original);
const results = configurations.map(opts => ({
  ...opts, ...score(decrypt(originals,opts))
})).sort((a,b) => b.hits-a.hits || b.longWords-a.longWords);
assert.equal(results[0].hits, 19);
assert.equal(results[0].longWords, 0);
assert.deepEqual([results[0].flavor,results[0].clock,results[0].sign,
  results[0].skip], ['plain','p24',-1,true]);
assert.equal(Math.max(...results.map(x => x.longWords)), 1);
assert.equal(Math.max(...results.map(x => x.maxRun)), 2);
assert.equal(results[0].byPage.reduce((sum,x) => sum+x.hits,0),19);

// A planted corpus using genuine native-GP words with every original page's
// exact original rune and printed-word lengths is exactly recovered by all
// three distinct cryptographic rules, without guessed shifts or exceptions.
let state = 0x3301a9bc;
const random = () => {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
};
const plantPlain = pages.map(page => page.words.flatMap(word => {
  const words = choices.get(word.length);
  assert(words && words.length);
  return words[random() % words.length];
}));
for (const [flavor,clock,sign] of [
  ['periodic','page',-1], ['plain','p24',-1], ['cipher','p23',1]
]) {
  const opts = {flavor,clock,sign,skip:false};
  const generated = encrypt(plantPlain,opts);
  assert.deepEqual(decrypt(generated,opts),plantPlain);
  assert.deepEqual(encrypt(decrypt(generated,opts),opts),generated);
  assert.deepEqual(generated.map(x => x.length),[213,270,273,265]);
  assert.equal(score(decrypt(generated,opts)).hits,178);
}
console.log('SOURCE key EPHEMERELLA IGNITA length', key.length,
  'source page runes 213+270+273+265');
console.log('ORIGINAL 36 period/autokey page-clock/signed variants best',
  JSON.stringify(results.slice(0,5)));
console.log('ORIGINAL 36 variants max complete word length >=4',
  Math.max(...results.map(x=>x.longWords)),
  'maximum adjacent GP-native dictionary words',
  Math.max(...results.map(x=>x.maxRun)));
console.log('POSITIVE three complete authentic source-shaped planted texts',
  'exact full 1021-rune GP29 replay per flavor, each 178/178 native words');
console.log('PASS: no original p24–p26 prose from direct species-name',
  'periodic or classical plaintext/ciphertext autokey Vigenere under',
  'these 36 fixed, unswitched original source clocks/signs.');
