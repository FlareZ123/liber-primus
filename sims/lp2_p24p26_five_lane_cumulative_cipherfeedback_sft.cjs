'use strict';
/**
 * Original p24–p26 five-lane ciphertext-feedback common-seed inverse.
 * Node.js 22 CommonJS single-file test. All inputs are committed source data.
 *
 * Model (29-symbol GP): C[t] = P[t] + K[t] mod 29;
 * K[t] = S[t % 5] + sum(C[u] for u<t, u%5=t%5) mod 29.
 * The same unknown five-rune seed S initializes each physical page. An
 * observed ciphertext value advances only its own lane after emission.
 *
 * Native-source word positions are preserved. The page-initial carried
 * fragments are omitted from lexical scoring but retained in cipher state.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const translit = corpus.translit.map(x => x.toLowerCase());
const alphabet = new Map(translit.map((token, i) => [token, i]));
const digraphs = ['th', 'ng', 'eo', 'oe', 'ae', 'ia', 'ea'];
const mod = n => ((n % 29) + 29) % 29;

/** @param {string} spelling @returns {number[] | null} */
function gp(spelling) {
  const s = spelling.toLowerCase().replace(/qu/g, 'cw').replace(/v/g, 'u')
    .replace(/[kq]/g, 'c').replace(/z/g, 's')
    .replace(/ing/g, 'ng').replace(/io/g, 'ia');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = digraphs.find(x => s.startsWith(x, i)) || s[i];
    const idx = alphabet.get(token);
    if (idx === undefined) return null;
    out.push(idx);
    i += token.length;
  }
  return out;
}

const lexicon = new Map();
const byLength = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)/.exec(line);
  if (!match) continue;
  const word = gp(match[1]);
  if (!word || word.length > 16) continue;
  const key = word.join(',');
  if (!lexicon.has(key)) lexicon.set(key, match[1]);
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
}
for (const spelling of ['a', 'i', 'o']) {
  const word = gp(spelling);
  lexicon.set(word.join(','), spelling);
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
}

/** @param {number[]} c @param {number[]} seed @returns {number[]} */
function decrypt(c, seed) {
  const sum = Array(5).fill(0);
  const plain = [];
  for (let t = 0; t < c.length; t++) {
    const lane = t % 5;
    plain.push(mod(c[t] - seed[lane] - sum[lane]));
    sum[lane] = mod(sum[lane] + c[t]);
  }
  return plain;
}

/** @param {number[]} plain @param {number[]} seed @returns {number[]} */
function encrypt(plain, seed) {
  const key = seed.slice();
  const cipher = [];
  for (let t = 0; t < plain.length; t++) {
    const lane = t % 5;
    const c = mod(plain[t] + key[lane]);
    cipher.push(c);
    key[lane] = mod(key[lane] + c);
  }
  return cipher;
}

/** @param {number} page */
function originalPage(page) {
  let start = 0;
  const words = [...segments[page].replace(/\/\s*/g, '').matchAll(/[\u16a0-\u16ff]+/g)]
    .map(match => {
      const values = [...match[0]].map(rune => corpus.runes.indexOf(rune));
      assert(values.every(v => v >= 0));
      const word = {start, values};
      start += values.length;
      return word;
    });
  const cipher = words.flatMap(word => word.values);
  assert.deepEqual(cipher, corpus.pages[page].indices, 'canonical page ' + page);
  return {page, words, cipher};
}

/** @param {{words:{start:number,values:number[]}[],cipher:number[]}} page */
function candidates(page) {
  const anchor = page.words.find(word =>
    word.start >= 3 && word.start < 75 && word.values.length >= 7);
  assert(anchor && anchor.values.length >= 5);
  const zero = decrypt(page.cipher, [0, 0, 0, 0, 0]);
  const out = new Map();
  for (const guess of byLength.get(anchor.values.length)) {
    const seed = Array(5).fill(null);
    let valid = true;
    for (let u = 0; u < guess.length; u++) {
      const t = anchor.start + u;
      const lane = t % 5;
      const candidate = mod(zero[t] - guess[u]);
      if (seed[lane] !== null && seed[lane] !== candidate) {
        valid = false;
        break;
      }
      seed[lane] = candidate;
    }
    if (valid && seed.every(v => v !== null)) out.set(seed.join(','), seed);
  }
  return {anchor, seeds:[...out.values()]};
}

/** @param {any[]} pages @param {number[]} seed */
function evaluate(pages, seed) {
  return pages.map(page => {
    const plaintext = decrypt(page.cipher, seed);
    const train = [], hold = [];
    let trainWords = 0, holdWords = 0;
    for (let i = 1; i < page.words.length; i++) {
      // The first printed fragment starts inside a word carried from the
      // previous page; it is not an independent complete English word.
      const word = page.words[i];
      const end = word.start + word.values.length;
      const region = end <= 150 ? train : word.start >= 150 ? hold : null;
      if (!region) continue;
      const sample = plaintext.slice(word.start, end);
      const hit = lexicon.get(sample.join(','));
      if (region === train) {
        trainWords++;
        if (hit) train.push([word.start, hit]);
      } else {
        holdWords++;
        if (hit) hold.push([word.start, hit]);
      }
    }
    return {page:page.page, trainWords, train, holdWords, hold};
  });
}

const pages = [24, 25, 26].map(originalPage);
assert.deepEqual(pages.map(p => p.cipher.length), [270, 273, 265]);
assert.deepEqual(pages.map(p => p.words[0].values.length), [3, 2, 1]);
const {anchor, seeds} = candidates(pages[0]);
assert.equal(anchor.start, 26);
assert.equal(anchor.values.length, 7);
assert.equal(seeds.length, 14, 'every seed generated by first original anchor');
const ranked = seeds.map(seed => {
  const evaluations = evaluate(pages, seed);
  const hits = evaluations.reduce((n, p) => n + p.train.length, 0);
  return {seed, hits, evaluations};
}).sort((a, b) => b.hits - a.hits);
const best = ranked[0];
assert.equal(best.hits, 8);
assert.deepEqual(best.evaluations.map(p => p.trainWords), [35, 29, 32]);
assert.deepEqual(best.evaluations.map(p => p.holdWords), [27, 28, 25]);
assert.deepEqual(best.evaluations.map(p => p.train.length), [3, 2, 3]);
assert.deepEqual(best.evaluations.map(p => p.hold.length), [3, 3, 0]);
for (const page of pages) {
  const plain = decrypt(page.cipher, best.seed);
  assert.deepEqual(encrypt(plain, best.seed), page.cipher);
}

// Positive plant: independently generate valid GP words on the unchanged
// original lengths, preserving all original leading carried rune positions.
const genuineSeed = [3, 5, 1, 4, 2];
const planted = pages.map(page => {
  const p = page.words.flatMap((word, i) => {
    const choices = byLength.get(word.values.length);
    assert(choices && choices.length);
    return choices[(i * 17 + page.page * 11) % choices.length];
  });
  const cipher = encrypt(p, genuineSeed);
  assert.deepEqual(decrypt(cipher, genuineSeed), p);
  return {...page, cipher};
});
const recovered = candidates(planted[0]).seeds;
assert(recovered.some(seed => seed.join(',') === genuineSeed.join(',')));
const checked = evaluate(planted, genuineSeed);
assert.deepEqual(checked.map(p => p.train.length), [35, 29, 32]);
assert.deepEqual(checked.map(p => p.hold.length), [27, 28, 25]);

console.log('SOURCE original page-runes:', pages.map(p => p.cipher.length).join(','),
  'partial prefix lengths:', pages.map(p => p.words[0].values.length).join(','));
console.log('ORIGINAL independent first anchor:', anchor.start, anchor.values.length,
  'admissible common five-rune seeds:', seeds.length);
console.log('ORIGINAL best original first150 complete-word hits:', best.hits, '/96',
  'by page:', best.evaluations.map(p => p.train.length).join(','));
console.log('ORIGINAL frozen-seed untouched later complete-word hits:',
  best.evaluations.map(p => p.hold.length).join(','), '/',
  best.evaluations.map(p => p.holdWords).join(','));
console.log('ORIGINAL best seed:', best.seed, 'word matches:',
  JSON.stringify(best.evaluations));
console.log('POSITIVE native-GP source-shape plant: 96/96 train and 80/80 hold,',
  'actual common seed recovered from original-anchor dictionary; exact full forward replay');
console.log('PASS: this one shared-five-lane cumulative-ciphertext-feedback law',
  'does not recover original native-English prose. No unknown original plaintext.');
